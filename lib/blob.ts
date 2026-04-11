/**
 * Shared file upload helper.
 *
 * Production  (BLOB_READ_WRITE_TOKEN set): uploads to Vercel Blob CDN (private).
 * Development (no token):                 writes to public/uploads locally.
 * Serverless  (no token, read-only FS):   writes to /tmp as a last resort.
 *
 * Private blobs must be served via /api/documents/[id]/download (proxied with token).
 */

import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface UploadResult {
  url: string;      // URL stored in the DB
  pathname: string; // Key / path used
}

export async function uploadFile(
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  const pathname = `${folder}/${filename}`;

  // ── Vercel Blob (production) ─────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(pathname, buffer, {
        access: "private",
        contentType,
      });
      return { url: blob.url, pathname };
    } catch (err) {
      console.error("[blob] Vercel Blob upload failed:", err);
      throw new Error("File upload failed. Please try again.");
    }
  }

  // ── Local dev fallback: public/uploads ───────────────────────────────────
  // On Vercel without a token, fall back to /tmp (ephemeral but won't 500)
  const isVercel = !!process.env.VERCEL;

  if (isVercel) {
    // /tmp is the only writable directory in Vercel serverless functions.
    // Files here are ephemeral — this path should only be hit if
    // BLOB_READ_WRITE_TOKEN is missing from the Vercel environment.
    console.warn(
      "[blob] BLOB_READ_WRITE_TOKEN is not set. " +
      "Add it in Vercel → Storage → Blob → connect to this project. " +
      "Writing to /tmp as a temporary fallback — files will not persist."
    );
    const tmpDir = path.join("/tmp", folder);
    await mkdir(tmpDir, { recursive: true });
    await writeFile(path.join(tmpDir, filename), buffer);
    // Return a relative URL — the file won't be served, but the DB won't crash
    return { url: `/${folder}/${filename}`, pathname };
  }

  // Local dev: write to public/uploads
  const localDir = path.join(process.cwd(), "public", folder);
  await mkdir(localDir, { recursive: true });
  await writeFile(path.join(localDir, filename), buffer);
  return { url: `/${folder}/${filename}`, pathname };
}

/**
 * Fetch a blob's content server-side.
 * For Vercel Blob (private store): authenticates with BLOB_READ_WRITE_TOKEN.
 * For local dev URLs (starting with /): reads from the filesystem.
 * Returns { body: ReadableStream | Buffer, contentType: string }.
 */
export async function fetchBlobContent(
  blobUrl: string
): Promise<{ body: Buffer; contentType: string } | null> {
  // Local dev: read from filesystem
  if (!blobUrl.startsWith("https://")) {
    try {
      const { readFile } = await import("fs/promises");
      const localPath = path.join(process.cwd(), "public", blobUrl);
      const body = await readFile(localPath);
      return { body, contentType: "application/octet-stream" };
    } catch {
      return null;
    }
  }

  // Vercel Blob (private): fetch with token
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  const res = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const arrayBuffer = await res.arrayBuffer();
  return { body: Buffer.from(arrayBuffer), contentType };
}
