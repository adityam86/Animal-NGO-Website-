"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

type VoiceNoteRecorderProps = {
  value: string;
  onChange: (url: string) => void;
  title?: string;
  hint?: string;
};

const MAX_SECONDS = 15;

export default function VoiceNoteRecorder({
  value,
  onChange,
  title = "Optional 15s Witness Voice Note (Encrypted Private Dispatch)",
  hint = "Record up to 15 seconds describing landmarks in Bengali, Hindi, or English.",
}: VoiceNoteRecorderProps) {
  const [supported] = useState(() =>
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupMedia = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupMedia();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const uploadBlob = async (blob: Blob, mimeType: string) => {
    setUploading(true);
    setError("");
    try {
      const tokenRes = await fetch("/api/rescue/upload-token", { method: "POST" });
      const tokenData = (await tokenRes.json()) as { token?: string; error?: string };
      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(tokenData.error || "Could not obtain upload authorization.");
      }

      const ext = mimeType.includes("ogg")
        ? "ogg"
        : mimeType.includes("mp4") || mimeType.includes("m4a")
        ? "m4a"
        : "webm";

      const form = new FormData();
      form.append("uploadToken", tokenData.token);
      form.append("audio", new File([blob], `witness-note.${ext}`, { type: mimeType }));

      const uploadRes = await fetch("/api/rescue/audio", {
        method: "POST",
        body: form,
      });
      const uploadJson = (await uploadRes.json()) as { url?: string; error?: string };
      if (!uploadRes.ok || !uploadJson.url) {
        throw new Error(uploadJson.error || "Voice note upload failed.");
      }

      onChange(uploadJson.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save voice note.");
      onChange("");
    } finally {
      setUploading(false);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording(false);
    cleanupMedia();
  };

  const startRecording = async () => {
    setError("");
    onChange("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredMime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";

      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = () => {
        const rawMime = recorder.mimeType || "audio/webm";
        const cleanMime = rawMime.split(";")[0].trim() || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: cleanMime });
        cleanupMedia();
        if (blob.size < 256) {
          setError("Recording was too short. Please try again.");
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        void uploadBlob(blob, cleanMime);
      };

      recorder.start();
      setRecording(true);
      setSecondsLeft(MAX_SECONDS);

      let remaining = MAX_SECONDS;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          stopRecording();
        }
      }, 1000);
    } catch {
      setError("Microphone permission denied or unavailable. You can still submit via text or WhatsApp.");
      cleanupMedia();
      setRecording(false);
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    onChange("");
    setError("");
  };

  return (
    <div
      style={{
        background: "var(--cream-50)",
        border: "1px solid var(--cream-200)",
        borderRadius: "var(--radius-md)",
        padding: "1rem 1.15rem",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--stone-800)", marginBottom: "0.25rem" }}>
        {title}
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--stone-600)", margin: "0 0 0.85rem", lineHeight: 1.55 }}>
        {hint}
      </p>

      {!supported ? (
        <div style={{ fontSize: "0.8rem", color: "var(--stone-500)" }}>
          Voice recording is not supported in this browser; please use text notes or WhatsApp.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={uploading}
                className="btn btn-outline btn-sm"
                style={{ gap: "0.4rem" }}
              >
                <Mic size={15} />
                {uploading ? "Encrypting & Uploading..." : value ? "Re-record 15s Note" : "Record Voice Note (15s max)"}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="btn btn-emergency btn-sm"
                style={{ gap: "0.4rem" }}
              >
                <Square size={14} /> Stop Recording ({secondsLeft}s left)
              </button>
            )}

            {value && !uploading && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--green-700)" }}>
                <CheckCircle2 size={15} /> Voice note attached securely
              </span>
            )}

            {(previewUrl || value) && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-sm"
                style={{ background: "transparent", color: "var(--stone-500)", padding: "0.3rem 0.5rem" }}
                aria-label="Remove voice note"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {previewUrl && (
            <audio controls src={previewUrl} style={{ width: "100%", maxWidth: 360, height: 36 }} />
          )}

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--crimson)" }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
