/**
 * PDF text extraction with OCR fallback.
 *
 * Strategy:
 *  1. pdfjs-dist getTextContent() — extracts text from digital/text-layer PDFs
 *  2. If a page yields no text, render it to a canvas and OCR with tesseract.js
 *
 * This handles mixed PDFs (some digital pages, some scanned) page by page.
 *
 * Max pages processed: MAX_PAGES
 * Max chars returned:  MAX_CHARS
 */

const MAX_PAGES = 10;
const MAX_CHARS = 15000;

export type ExtractResult = {
  text: string;
  method: "text-layer" | "ocr" | "mixed" | "none";
  pages?: number;
};

export async function extractPdfText(buffer: Buffer): Promise<ExtractResult> {
  try {
    const result = await extractWithPdfjs(buffer);
    console.log(`[pdf-extract] method=${result.method} pages=${result.pages} chars=${result.text.length}`);
    return result;
  } catch (err) {
    console.error("[pdf-extract] Fatal error:", err);
    return { text: "", method: "none" };
  }
}

async function extractWithPdfjs(buffer: Buffer): Promise<ExtractResult> {
  // Dynamic import — avoids bundling issues and only loads when needed
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Point the worker at the bundled worker file.
  // Use process.cwd() (always the project root in Next.js) rather than
  // import.meta.url, which resolves relative to the compiled output path.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodePath = require("path");
  const workerAbs = nodePath.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerAbs.replace(/\\/g, "/")}`;

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    // Suppress pdfjs console warnings
    verbosity: 0,
  });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const pagesToProcess = Math.min(totalPages, MAX_PAGES);

  const pageResults: Array<{ text: string; method: "text-layer" | "ocr" }> = [];
  let textLayerCount = 0;
  let ocrCount = 0;

  // Lazy-load Tesseract worker only if we find image pages
  let tesseractWorker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | null = null;

  for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // ── Try text layer first ──────────────────────────────────────────────────
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText.length > 20) {
      pageResults.push({ text: `--- Page ${pageNum} ---\n${pageText}`, method: "text-layer" });
      textLayerCount++;
      continue;
    }

    // ── No text — OCR the rendered page ──────────────────────────────────────
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createCanvas } = require("canvas") as typeof import("canvas");

      if (!tesseractWorker) {
        const { createWorker } = await import("tesseract.js");
        tesseractWorker = await createWorker("eng", 1, { logger: () => {} });
      }

      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = createCanvas(viewport.width, viewport.height);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context = canvas.getContext("2d") as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: context, viewport, canvas: canvas as any }).promise;

      const imageBuffer = canvas.toBuffer("image/png");
      const { data } = await tesseractWorker.recognize(imageBuffer);
      const ocrText = data.text.trim();

      if (ocrText.length > 0) {
        pageResults.push({ text: `--- Page ${pageNum} (OCR) ---\n${ocrText}`, method: "ocr" });
        ocrCount++;
      }
    } catch (ocrErr) {
      console.warn(`OCR failed for page ${pageNum}:`, ocrErr);
    }
  }

  if (tesseractWorker) {
    await tesseractWorker.terminate();
  }

  if (pageResults.length === 0) {
    return { text: "", method: "none", pages: totalPages };
  }

  const combined = pageResults.map((r) => r.text).join("\n\n");
  const truncated = combined.length > MAX_CHARS
    ? combined.slice(0, MAX_CHARS) + "\n\n[... document truncated ...]"
    : combined;

  if (totalPages > MAX_PAGES) {
    const note = `\n\n[Note: Only the first ${MAX_PAGES} of ${totalPages} pages were processed]`;
    return {
      text: truncated + note,
      method: ocrCount === 0 ? "text-layer" : textLayerCount === 0 ? "ocr" : "mixed",
      pages: totalPages,
    };
  }

  return {
    text: truncated,
    method: ocrCount === 0 ? "text-layer" : textLayerCount === 0 ? "ocr" : "mixed",
    pages: totalPages,
  };
}
