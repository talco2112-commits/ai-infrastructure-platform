"use client";

import { useRef } from "react";
import { AlertTriangle } from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  text1: "#1C1917", text2: "#57534E",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
};

interface Props {
  isHe: boolean;
  title?: string; titleHe?: string;
  message: string; messageHe: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ isHe, title, titleHe, message, messageHe, onCancel, onConfirm }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onCancel(); }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(28,25,23,0.5)" }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden p-6" style={{ background: P.card }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: P.dangerBg }}>
            <AlertTriangle className="w-4.5 h-4.5" style={{ color: P.danger }} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: P.text1 }}>
              {isHe ? (titleHe ?? "מחיקה") : (title ?? "Delete")}
            </h2>
            <p className="text-[13px] mt-1 leading-relaxed" style={{ color: P.text2 }}>
              {isHe ? messageHe : message}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white"
            style={{ background: P.danger }}>
            {isHe ? "מחק" : "Delete"}
          </button>
          <button onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold"
            style={{ background: P.bg, color: P.text2 }}>
            {isHe ? "ביטול" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
