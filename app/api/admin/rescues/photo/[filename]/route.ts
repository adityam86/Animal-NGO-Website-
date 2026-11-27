import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { get } from "@vercel/blob";
import { AuthError, requireAdminSession } from "@/lib/auth-server";
import { getPrivateObjectFromS3 } from "@/lib/storage";

export const dynamic = "force-dynamic";

const SAFE_FILENAME_RE = /^[a-zA-Z0-9_-]+\.(webp|jpg|jpeg|png)$/i;

function buildPrivateImageHeaders(cleanFilename: string, contentType: string, contentLength?: number) {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": `inline; filename="${cleanFilename}"`,
  };
  if (typeof contentLength === "number") {
    headers["Content-Length"] = String(contentLength);
  }
  return headers;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // 1. Authenticate admin user
    await requireAdminSession(["SUPER_ADMIN", "ADMIN", "COORDINATOR"]);

    const { filename } = await params;
    const cleanFilename = path.basename(filename || "").trim();

    // 2. Strict directory traversal & extension guard
    if (!cleanFilename || !SAFE_FILENAME_RE.test(cleanFilename) || cleanFilename.includes("..")) {
      return NextResponse.json({ error: "Invalid photo filename" }, { status: 400 });
    }

    const ext = cleanFilename.split(".").pop()?.toLowerCase();
    const defaultContentType =
      ext === "webp"
        ? "image/webp"
        : ext === "png"
        ? "image/png"
        : "image/jpeg";

    // 3. Check local private storage directory first (if dev or local node)
    const privateDir = path.join(process.cwd(), "storage", "private", "rescues");
    const filePath = path.join(privateDir, cleanFilename);

    let fileBuffer: Buffer | null = null;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      // Not on local filesystem; check cloud private storage
    }

    if (fileBuffer) {
      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: buildPrivateImageHeaders(cleanFilename, defaultContentType, fileBuffer.byteLength),
      });
    }

    // 4. Retrieve from private Vercel Blob if configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (blobToken) {
      try {
        const blobKey = `ayudar/private/rescues/${cleanFilename}`;
        const blobResult = await get(blobKey, { access: "private", token: blobToken });
        if (blobResult && blobResult.statusCode === 200 && blobResult.stream) {
          const contentType = blobResult.blob?.contentType || defaultContentType;
          return new Response(blobResult.stream, {
            status: 200,
            headers: buildPrivateImageHeaders(cleanFilename, contentType),
          });
        }
      } catch (blobError) {
        console.error("Vercel Blob private retrieval error:", blobError);
      }
    }

    // 5. Retrieve from private Neon Object Storage / S3 bucket if configured
    try {
      const s3Obj = await getPrivateObjectFromS3(cleanFilename);
      if (s3Obj) {
        const contentType = s3Obj.contentType || defaultContentType;
        if (s3Obj.stream) {
          return new Response(s3Obj.stream, {
            status: 200,
            headers: buildPrivateImageHeaders(cleanFilename, contentType),
          });
        }
        if (s3Obj.bytes) {
          return new Response(new Uint8Array(s3Obj.bytes), {
            status: 200,
            headers: buildPrivateImageHeaders(cleanFilename, contentType, s3Obj.bytes.byteLength),
          });
        }
      }
    } catch (s3Error) {
      console.error("S3 private retrieval error:", s3Error);
    }

    return NextResponse.json({ error: "Incident photo not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin rescue photo error:", error);
    return NextResponse.json({ error: "Failed to load incident photo" }, { status: 500 });
  }
}
