/**
 * Shared Vercel Blob upload helper.
 *
 * In development (no BLOB_READ_WRITE_TOKEN), falls back to writing to
 * public/uploads so local dev keeps working without a Vercel account.
 *
 * In production (BLOB_READ_WRITE_TOKEN set), uploads to Vercel Blob and
 * returns the CDN URL.
 */

import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface UploadResult {
  url: string;       // Public-accessible URL stored in the DB
  pathname: string;  // The path/key used (for logging)
}

/**
 * Upload a file buffer and return a persistent URL.
 *
 * @param folder  Logical folder prefix, e.g. "uploads/{userId}" or "logos"
 * @param filename  Final filename including extension
 * @param buffer  File contents
 * @param contentType  MIME type
 */
export async function uploadFile(
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  const pathname = `${folder}/${filename}`;

  // ── Production: Vercel Blob ──────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType,
    });
    return { url: blob.url, pathname };
  }

  // ── Development fallback: local public/uploads ───────────────────────────
  const localDir = path.join(process.cwd(), "public", folder);
  await mkdir(localDir, { recursive: true });
  await writeFile(path.join(localDir, filename), buffer);
  return { url: `/${folder}/${filename}`, pathname };
}
