"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Check, Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";

type ImageUploaderProps = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
};

export default function ImageUploader({
  value = "",
  onChange,
  label = "Photo",
  placeholder = "Upload an image...",
  helperText,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(value);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [manualUrl, setManualUrl] = useState(value);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10 MB limit.");
      return;
    }

    setError(null);
    setUploading(true);

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setPreview(data.url);
        setManualUrl(data.url);
        onChange(data.url);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview("");
    setManualUrl("");
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUrlSubmit = () => {
    if (manualUrl) {
      setPreview(manualUrl);
      onChange(manualUrl);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            type="button"
            onClick={() => setMode("file")}
            style={{
              background: mode === "file" ? "var(--saffron-100)" : "transparent",
              color: mode === "file" ? "var(--saffron-700)" : "var(--stone-400)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.2rem 0.5rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Upload size={12} /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            style={{
              background: mode === "url" ? "var(--saffron-100)" : "transparent",
              color: mode === "url" ? "var(--saffron-700)" : "var(--stone-400)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.2rem 0.5rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <LinkIcon size={12} /> URL
          </button>
        </div>
      </div>

      {preview ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 200,
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "2px solid var(--cream-300)",
            background: "var(--cream-100)",
          }}
        >
          <Image
            src={preview}
            alt="Upload preview"
            fill
            style={{ objectFit: "cover" }}
            unoptimized={preview.startsWith("blob:") || preview.startsWith("data:")}
          />

          {uploading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 600,
                fontSize: "0.85rem",
                gap: "8px",
              }}
            >
              <Loader2 size={20} className="animate-spin" /> Uploading...
            </div>
          )}

          {!uploading && (
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                gap: "6px",
              }}
            >
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  background: "rgba(0,0,0,0.65)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              background: "rgba(0,0,0,0.65)",
              color: "white",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.7rem",
              fontWeight: 500,
              maxWidth: "80%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {preview}
          </div>
        </div>
      ) : mode === "file" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "var(--saffron-500)" : "var(--cream-300)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "2rem 1.5rem",
            background: dragOver ? "var(--saffron-50)" : "var(--cream-50)",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--saffron-100)",
              color: "var(--saffron-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Upload size={20} />
          </div>
          <div style={{ fontWeight: 600, color: "var(--stone-700)", fontSize: "0.9rem" }}>
            Click or drag an image here
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--stone-400)" }}>
            JPG, PNG, WebP, GIF up to 10 MB
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="form-input"
            placeholder="https://example.com/animal.jpg"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="btn btn-outline"
            style={{ whiteSpace: "nowrap" }}
          >
            Set URL
          </button>
        </div>
      )}

      {helperText && (
        <div style={{ fontSize: "0.8rem", color: "var(--stone-500)", lineHeight: 1.4 }}>
          {helperText}
        </div>
      )}

      {error && (
        <div style={{ fontSize: "0.8rem", color: "var(--red-600)", fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
