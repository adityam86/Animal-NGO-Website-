import sharp, { type Sharp, type Metadata } from "sharp";

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  width: number;
  height: number;
  format: string;
}

export interface ImageProcessingOptions {
  maxDimension?: number;
  maxBytes?: number;
  outputFormat?: "webp" | "jpeg" | "png";
  quality?: number;
}

const DANGEROUS_SUBSTRINGS = [
  "<svg",
  "<?xml",
  "<html",
  "<!doctype",
  "<script",
  "javascript:",
  "vbscript:",
  "onload=",
  "onerror=",
];

const ALLOWED_INPUT_FORMATS = new Set(["jpeg", "png", "webp", "gif"]);

/**
 * Validates, re-encodes, and sanitizes untrusted image input using Sharp.
 * Strips all EXIF, GPS, camera, and author metadata.
 * Strictly rejects SVGs, polyglot files, truncated streams, and oversized dimensions.
 */
export async function processAndSanitizeImage(
  inputBuffer: Buffer,
  originalFilename: string,
  declaredMime?: string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const maxBytes = options.maxBytes ?? 8 * 1024 * 1024;
  const maxDimension = options.maxDimension ?? 4096;
  const outputFormat = options.outputFormat ?? "webp";
  const quality = options.quality ?? 85;

  if (!inputBuffer || inputBuffer.byteLength < 16) {
    throw new ImageProcessingError("Corrupt or empty image buffer");
  }

  if (inputBuffer.byteLength > maxBytes) {
    throw new ImageProcessingError(`Image file size exceeds maximum allowed ${maxBytes / 1024 / 1024} MB`);
  }

  // 1. Polyglot and script inspection: check buffer for dangerous script or XML/SVG signatures
  const headerSlice = inputBuffer.subarray(0, 1024).toString("utf8").toLowerCase();
  for (const needle of DANGEROUS_SUBSTRINGS) {
    if (headerSlice.includes(needle)) {
      throw new ImageProcessingError("Malicious or unsupported file content detected (polyglot / script / SVG rejected)");
    }
  }

  // Check for executable binary signatures
  if (
    (inputBuffer[0] === 0x4d && inputBuffer[1] === 0x5a) || // MZ Windows EXE
    (inputBuffer[0] === 0x7f && inputBuffer[1] === 0x45 && inputBuffer[2] === 0x4c && inputBuffer[3] === 0x46) // ELF Linux
  ) {
    throw new ImageProcessingError("Executable binary disguised as image rejected");
  }

  // 2. Decode using Sharp with failOn error to catch truncated / malformed streams
  let pipeline: Sharp;
  let metadata: Metadata;
  try {
    pipeline = sharp(inputBuffer, {
      failOn: "error",
      animated: false,
    });
    metadata = await pipeline.metadata();
  } catch (err) {
    throw new ImageProcessingError(
      `Malformed or truncated image stream: ${err instanceof Error ? err.message : "decode failed"}`
    );
  }

  if (!metadata.format || !ALLOWED_INPUT_FORMATS.has(metadata.format)) {
    throw new ImageProcessingError(
      `Unsupported image format: ${metadata.format || "unknown"}. Only JPEG, PNG, WEBP, and GIF are allowed.`
    );
  }

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width <= 0 || height <= 0) {
    throw new ImageProcessingError("Invalid image dimensions (zero or negative)");
  }

  if (width > maxDimension || height > maxDimension) {
    throw new ImageProcessingError(
      `Image dimensions (${width}x${height}) exceed maximum allowed limit of ${maxDimension}x${maxDimension}`
    );
  }

  // 3. Re-encode cleanly to strip all EXIF, GPS, and auxiliary metadata
  // Auto-rotate according to original orientation before discarding EXIF tags
  pipeline.rotate();

  let sanitizedBuffer: Buffer;
  let finalMime: "image/webp" | "image/jpeg" | "image/png";
  let finalExt: "webp" | "jpg" | "png";

  if (outputFormat === "jpeg") {
    sanitizedBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    finalMime = "image/jpeg";
    finalExt = "jpg";
  } else if (outputFormat === "png") {
    sanitizedBuffer = await pipeline.png({ compressionLevel: 8 }).toBuffer();
    finalMime = "image/png";
    finalExt = "png";
  } else {
    // Default: WebP for optimal compression and strict raster isolation
    sanitizedBuffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
    finalMime = "image/webp";
    finalExt = "webp";
  }

  return {
    buffer: sanitizedBuffer,
    mimeType: finalMime,
    extension: finalExt,
    width,
    height,
    format: outputFormat,
  };
}
