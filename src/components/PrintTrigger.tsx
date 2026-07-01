"use client";
import { useEffect } from "react";

export function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 700);
    return () => clearTimeout(t);
  }, []);
  return null;
}

export function PrintButton({ label, title }: { label: string; title?: string }) {
  return (
    <div className="no-print" style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#1C1917", padding: "12px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "16px",
    }}>
      <span style={{ color: "#A8A29E", fontSize: "13px" }}>{title}</span>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#8B5A2B", color: "#fff", border: "none",
            padding: "8px 20px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          ⬇ {label}
        </button>
        <button
          onClick={() => window.close()}
          style={{
            background: "transparent", color: "#6B7280", border: "1px solid #374151",
            padding: "8px 14px", borderRadius: "8px",
            fontSize: "13px", cursor: "pointer",
          }}
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
