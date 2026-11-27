import path from "path";
import fs from "fs/promises";
import { put } from "@vercel/blob";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import type { ValidatedImage } from "./security";

export interface StoredUploadResult {
  url: string;
  storage:
    | "vercel-blob"
    | "local-fs"
    | "private-fs"
    | "s3-private"
    | "s3-public"
    | "inline-data-url";
  isPrivate?: boolean;
}

export interface StorageOptions {
  isPrivate?: boolean;
}

export interface S3StorageConfig {
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  privateBucket?: string;
  publicBucket?: string;
}

export function getS3StorageConfig(): S3StorageConfig | null {
  const endpoint =
    process.env.PRIVATE_STORAGE_ENDPOINT?.trim() ||
    process.env.AWS_ENDPOINT_URL_S3?.trim() ||
    undefined;
  const region =
    process.env.PRIVATE_STORAGE_REGION?.trim() ||
    process.env.AWS_REGION?.trim() ||
    "us-east-2";
  const accessKeyId =
    process.env.PRIVATE_STORAGE_ACCESS_KEY?.trim() ||
    process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey =
    process.env.PRIVATE_STORAGE_SECRET_KEY?.trim() ||
    process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  const isNeonStorage = Boolean(endpoint && /\.aws\.neon\.tech(?:$|\/)/i.test(endpoint));
  const privateBucket =
    process.env.PRIVATE_STORAGE_BUCKET?.trim() ||
    process.env.AWS_S3_BUCKET?.trim() ||
    (isNeonStorage ? "rescues" : undefined);
  const publicBucket =
    process.env.PUBLIC_STORAGE_BUCKET?.trim() ||
    (isNeonStorage ? "assets" : undefined);

  return {
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    privateBucket,
    publicBucket,
  };
}

function createS3Client(cfg: S3StorageConfig): S3Client {
  return new S3Client({
    ...(cfg.endpoint ? { endpoint: cfg.endpoint } : {}),
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    forcePathStyle: true,
  });
}

function buildPublicS3Url(cfg: S3StorageConfig, bucket: string, key: string): string {
  const customBase = process.env.PUBLIC_STORAGE_PUBLIC_BASE_URL?.trim();
  if (customBase) {
    return `${customBase.replace(/\/+$/, "")}/${key}`;
  }
  if (cfg.endpoint) {
    return `${cfg.endpoint.replace(/\/+$/, "")}/${bucket}/${key}`;
  }
  return `https://${bucket}.s3.${cfg.region}.amazonaws.com/${key}`;
}

export interface RetrievedPrivateObject {
  stream?: ReadableStream<Uint8Array>;
  bytes?: Uint8Array;
  contentType?: string;
}

/**
 * Retrieves a private rescue incident photo from configured S3 / Neon Object Storage.
 * Returns null if the object does not exist (NoSuchKey / 404).
 */
export async function getPrivateObjectFromS3(
  cleanFilename: string
): Promise<RetrievedPrivateObject | null> {
  const cfg = getS3StorageConfig();
  if (!cfg?.privateBucket) return null;

  const s3 = createS3Client(cfg);
  try {
    const res = await s3.send(
      new GetObjectCommand({
        Bucket: cfg.privateBucket,
        Key: `rescues/${cleanFilename}`,
      })
    );
    if (!res.Body) return null;

    if (typeof res.Body.transformToWebStream === "function") {
      return {
        stream: res.Body.transformToWebStream() as ReadableStream<Uint8Array>,
        contentType: res.ContentType,
      };
    }
    const bytes = await res.Body.transformToByteArray();
    return {
      bytes,
      contentType: res.ContentType,
    };
  } catch (err: unknown) {
    const s3Err = err as { name?: string; Code?: string; $metadata?: { httpStatusCode?: number } };
    if (
      s3Err?.name === "NoSuchKey" ||
      s3Err?.Code === "NoSuchKey" ||
      s3Err?.$metadata?.httpStatusCode === 404
    ) {
      return null;
    }
    throw err;
  }
}

/**
 * Stores a sanitized, validated image buffer.
 * Automatically enforces private storage policies for sensitive rescue incident photos,
 * ensuring they cannot be accessed through public static web directories.
 */
export async function storeValidatedImage(
  buffer: Buffer,
  validated: ValidatedImage,
  originalFilename: string,
  prefix = "media",
  options: StorageOptions = {}
): Promise<StoredUploadResult> {
  const isPrivate = options.isPrivate ?? prefix === "rescue";

  const safeBase =
    originalFilename
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40) || "image";
  const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${validated.extension}`;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const s3Config = getS3StorageConfig();

  // 1. Private storage policy (for rescue incident photos)
  if (isPrivate) {
    if (blobToken) {
      const blobKey = `ayudar/private/rescues/${uniqueName}`;
      await put(blobKey, buffer, {
        access: "private",
        contentType: validated.mimeType,
        token: blobToken,
      });
      return {
        url: `/api/admin/rescues/photo/${uniqueName}`,
        storage: "vercel-blob",
        isPrivate: true,
      };
    }

    if (s3Config?.privateBucket) {
      const s3 = createS3Client(s3Config);
      await s3.send(
        new PutObjectCommand({
          Bucket: s3Config.privateBucket,
          Key: `rescues/${uniqueName}`,
          Body: buffer,
          ContentType: validated.mimeType,
          CacheControl: "private, no-store",
        })
      );
      return {
        url: `/api/admin/rescues/photo/${uniqueName}`,
        storage: "s3-private",
        isPrivate: true,
      };
    }

    // When running in local development or test runtime, store in private storage outside public/
    if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
      try {
        const privateDir = path.join(process.cwd(), "storage", "private", "rescues");
        await fs.mkdir(privateDir, { recursive: true });
        const filePath = path.join(privateDir, uniqueName);
        await fs.writeFile(filePath, buffer);
        return {
          url: `/api/admin/rescues/photo/${uniqueName}`,
          storage: "private-fs",
          isPrivate: true,
        };
      } catch {
        // Fall through cleanly if disk is read-only
      }
    }

    // In production runtime, fail safely if persistent private storage is unavailable.
    // Do not fall back to public storage, inline data URLs, or ephemeral local files.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Persistent private object storage (BLOB_READ_WRITE_TOKEN or Neon/S3 private storage) is not configured. Sensitive incident photo upload cannot proceed in production."
      );
    }

    // Bounded inline data URL fallback strictly for local test / preview environments
    if (buffer.byteLength > 2 * 1024 * 1024) {
      throw new Error(
        "Persistent object storage (BLOB_READ_WRITE_TOKEN or Neon/S3 storage) is not configured and image exceeds 2 MB fallback limit."
      );
    }
    const dataUrl = `data:${validated.mimeType};base64,${buffer.toString("base64")}`;
    return { url: dataUrl, storage: "inline-data-url", isPrivate: true };
  }

  // 2. Public storage policy (for admin blog stories, animal galleries)
  if (blobToken) {
    const result = await put(`ayudar/${uniqueName}`, buffer, {
      access: "public",
      contentType: validated.mimeType,
      addRandomSuffix: true,
      token: blobToken,
    });

    if (!result?.url) {
      throw new Error("Vercel Blob storage did not return a public URL");
    }
    return { url: result.url, storage: "vercel-blob", isPrivate: false };
  }

  if (s3Config?.publicBucket) {
    const s3 = createS3Client(s3Config);
    const objectKey = `public/${uniqueName}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: s3Config.publicBucket,
        Key: objectKey,
        Body: buffer,
        ContentType: validated.mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return {
      url: buildPublicS3Url(s3Config, s3Config.publicBucket, objectKey),
      storage: "s3-public",
      isPrivate: false,
    };
  }

  if (!process.env.VERCEL) {
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, uniqueName);
      await fs.writeFile(filePath, buffer);
      return { url: `/uploads/${uniqueName}`, storage: "local-fs", isPrivate: false };
    } catch {
      // Fall through cleanly if disk is read-only
    }
  }

  if (buffer.byteLength > 2 * 1024 * 1024) {
    throw new Error(
      "Persistent object storage (BLOB_READ_WRITE_TOKEN or Neon/S3 storage) is not configured and image exceeds 2 MB fallback limit."
    );
  }
  const dataUrl = `data:${validated.mimeType};base64,${buffer.toString("base64")}`;
  return { url: dataUrl, storage: "inline-data-url", isPrivate: false };
}
