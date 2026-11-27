import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { AuthError, requireAdminSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const SAFE_FILENAME_RE = /^[a-zA-Z0-9_-]+\.(webp|jpg|jpeg|png)$/i;

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

    // 3. Resolve path in private storage directory
    const privateDir = path.join(process.cwd(), "storage", "private", "rescues");
    const filePath = path.join(privateDir, cleanFilename);

    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json({ error: "Incident photo not found" }, { status: 404 });
    }

    const ext = cleanFilename.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "webp"
        ? "image/webp"
        : ext === "png"
        ? "image/png"
        : "image/jpeg";

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.byteLength),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${cleanFilename}"`,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin rescue photo error:", error);
    return NextResponse.json({ error: "Failed to load incident photo" }, { status: 500 });
  }
}
