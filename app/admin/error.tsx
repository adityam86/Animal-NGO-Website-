"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--cream-200)",
        borderRadius: "var(--radius-xl)",
        padding: "2.5rem",
        textAlign: "center",
        maxWidth: 540,
        margin: "2rem auto",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>Unable to load operations view</h2>
      <p style={{ color: "var(--stone-500)", marginBottom: "1.5rem", fontSize: "0.92rem" }}>
        {error.message || "A database or permission error occurred while loading this page."}
      </p>
      <button type="button" onClick={reset} className="btn btn-primary btn-sm">
        Retry
      </button>
    </div>
  );
}
