/**
 * PDF text extraction with OCR fallback.
 *
 * Strategy:
 *  1. pdf-parse  — fast, zero dependencies, works on text-layer PDFs
 *  2. pdfjs-dist + canvas + tesseract.js — renders each page to PNG then OCRs it;
 *     used only when pdf-parse returns no usable text (scanned / image-based PDFs)
 *
 * Max pages OCR'd: MAX_OCR_PAGES (prevents very slow processing on large docs)
 * Max chars returned: MAX_CHARS (keeps AI token cost reasonable)
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

const MAX_OCR_PAGES = 10;
const MAX_CHARS = 15000;

export type ExtractResult = {
  text: string;
  method: "text-layer" | "ocr" | "none";
  pages?: number;
};

/**
 * Extract text from a PDF buffer.
 * Returns the text and which method succeeded.
 */
export async function extractPdfText(buffer: Buffer): Promise<ExtractResult> {
  // ── Step 1: try text-layer extraction ──────────────────────────────────────
  try {
    const parsed = await pdfParse(buffer);
    const raw: string = (parsed.text ?? "").trim();
    if (raw.length > 50) {
      // Enough real text — not a scanned doc
      return {
        text: raw.length > MAX_CHARS ? raw.slice(0, MAX_CHARS) + "\n\n[... truncated ...]" : raw,
        method: "text-layer",
        pages: parsed.numpages,
      };
    }
  } catch {
    // pdf-parse failed — fall through to OCR
  }

  // ── Step 2: OCR via pdfjs-dist + canvas + tesseract.js ────────────────────
  try {
    const text = await ocrPdf(buffer);
    if (text.trim().length > 0) {
      return {
        text: text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + "\n\n[... truncated ...]" : text,
        method: "ocr",
      };
    }
  } catch (err) {
    console.warn("OCR failed:", err);
  }

  return { text: "", method: "none" };
}

async function ocrPdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createCanvas } = require("canvas") as typeof import("canvas");

  // pdfjs-dist v5 — legacy build is ESM (.mjs), use dynamic import
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Disable the worker in Node.js — run in-process
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  const numPages = Math.min(pdf.numPages, MAX_OCR_PAGES);
  const pageTexts: string[] = [];

  // Tesseract.js createWorker — lazy import
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    // Silence tesseract's verbose logging in production
    logger: () => {},
  });

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // Render at 2× scale for better OCR accuracy
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    // pdfjs expects a browser-like canvas context — cast is required
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = canvas.getContext("2d") as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: context, viewport, canvas: canvas as any }).promise;

    const imageBuffer = canvas.toBuffer("image/png");
    const { data } = await worker.recognize(imageBuffer);
    if (data.text.trim()) {
      pageTexts.push(`--- Page ${pageNum} ---\n${data.text.trim()}`);
    }
  }

  await worker.terminate();

  if (pdf.numPages > MAX_OCR_PAGES) {
    pageTexts.push(`\n[Note: Only the first ${MAX_OCR_PAGES} of ${pdf.numPages} pages were processed]`);
  }

  return pageTexts.join("\n\n");
}
