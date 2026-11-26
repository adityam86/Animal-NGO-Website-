export default function AdminLoading() {
  return (
    <div style={{ padding: "2rem 0", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ height: 32, width: 280, borderRadius: "var(--radius-md)", background: "var(--cream-200)", opacity: 0.7 }} />
      <div className="admin-stats-grid">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              height: 96,
              borderRadius: "var(--radius-lg)",
              background: "var(--cream-100)",
              border: "1px solid var(--cream-200)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          height: 240,
          borderRadius: "var(--radius-lg)",
          background: "var(--cream-100)",
          border: "1px solid var(--cream-200)",
        }}
      />
    </div>
  );
}
