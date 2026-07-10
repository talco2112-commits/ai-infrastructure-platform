"use client";

import { useState } from "react";
import { X, Send, User } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";

const P = {
  card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
};

interface Props {
  isHe: boolean;
  itemLabel: string;
  itemLabelHe: string;
  currentWorkerId?: string;
  onClose: () => void;
  onSend: (workerId: string) => void;
}

export function SendToWorkerModal({ isHe, itemLabel, itemLabelHe, currentWorkerId, onClose, onSend }: Props) {
  const { workers } = useTeam();
  const [selected, setSelected] = useState(currentWorkerId ?? "");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(28,25,23,0.45)" }} dir={isHe ? "rtl" : "ltr"}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div>
            <p className="text-[14px] font-bold" style={{ color: P.text1 }}>{isHe ? "שליחה לעובד" : "Send to worker"}</p>
            <p className="text-[12px] mt-0.5" style={{ color: P.text3 }}>{isHe ? itemLabelHe : itemLabel}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: P.text3 }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 max-h-[320px] overflow-y-auto">
          {workers.map(w => {
            const active = selected === w.id;
            return (
              <button
                key={w.id}
                onClick={() => setSelected(w.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-colors"
                style={{ background: active ? P.copperLight : "transparent", border: `1px solid ${active ? P.copper : "transparent"}` }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: active ? P.copper : "#E7E0D8" }}>
                  <User className="w-4 h-4" style={{ color: active ? "#fff" : P.text3 }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: P.text1 }}>{isHe ? w.nameHe : w.name}</p>
                  <p className="text-[11.5px] truncate" style={{ color: P.text3 }}>{isHe ? w.roleHe : w.role}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: `1px solid ${P.border}` }}>
          <button onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold"
            style={{ color: P.text3, background: "transparent", border: `1px solid ${P.border}` }}>
            {isHe ? "ביטול" : "Cancel"}
          </button>
          <button
            disabled={!selected}
            onClick={() => selected && onSend(selected)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12.5px] font-bold text-white disabled:opacity-50"
            style={{ background: P.copper }}>
            <Send className="w-3.5 h-3.5" />
            {isHe ? "שלח" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
