"use client";

import { useRef, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useDisciplines } from "@/contexts/DisciplineContext";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
};

export function DisciplineManagerModal({ isHe, onClose }: { isHe: boolean; onClose: () => void }) {
  const { disciplines, addDiscipline, removeDiscipline, styleFor } = useDisciplines();
  const [code, setCode] = useState("");
  const [en, setEn] = useState("");
  const [he, setHe] = useState("");
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c || !en.trim()) {
      setError(isHe ? "יש למלא קוד ושם" : "Code and name are required");
      return;
    }
    if (!/^[A-Z]{2,4}$/.test(c)) {
      setError(isHe ? "הקוד חייב להיות 2–4 אותיות באנגלית" : "Code must be 2–4 English letters");
      return;
    }
    if (disciplines.some(d => d.code === c)) {
      setError(isHe ? "קוד זה כבר קיים" : "This code already exists");
      return;
    }
    addDiscipline({ code: c, en: en.trim(), he: he.trim() || en.trim() });
    setCode(""); setEn(""); setHe(""); setError("");
  }

  return (
    <div ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(28,25,23,0.5)" }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden" style={{ background: P.card }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div>
            <h2 className="text-[16px] font-bold" style={{ color: P.text1 }}>{isHe ? "ניהול תחומים" : "Manage Disciplines"}</h2>
            <p className="text-[12px] mt-0.5" style={{ color: P.text3 }}>
              {isHe ? "משותף בין תכנון ובקשות מידע" : "Shared between Design and RFIs"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5">
            <X className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
        </div>

        <div className="p-6 space-y-2 max-h-[45vh] overflow-y-auto">
          {disciplines.map(d => {
            const s = styleFor(d.code);
            return (
              <div key={d.code} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg shrink-0" style={{ background: s.bg, color: s.color }}>
                  {d.code}
                </span>
                <span className="flex-1 text-[13px] font-medium truncate" style={{ color: P.text1 }}>
                  {isHe ? d.he : d.en}
                </span>
                <button onClick={() => removeDiscipline(d.code)} title={isHe ? "הסר" : "Remove"}
                  className="p-1.5 rounded-lg transition-colors hover:bg-red-50 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" style={{ color: P.danger }} />
                </button>
              </div>
            );
          })}
          {disciplines.length === 0 && (
            <p className="text-[13px] text-center py-6" style={{ color: P.text3 }}>
              {isHe ? "אין תחומים מוגדרים" : "No disciplines defined"}
            </p>
          )}
        </div>

        <form onSubmit={handleAdd} className="px-6 pb-6 pt-2 space-y-3" style={{ borderTop: `1px solid ${P.border}` }}>
          <p className="text-[12px] font-bold pt-3" style={{ color: P.text2 }}>{isHe ? "הוסף תחום חדש" : "Add a new discipline"}</p>
          <div className="flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value)} placeholder={isHe ? "קוד (למשל SU)" : "Code (e.g. SU)"}
              maxLength={4} className="w-28 px-3 py-2 rounded-xl text-[13px] outline-none font-mono uppercase"
              style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text1 }} />
            <input value={en} onChange={e => setEn(e.target.value)} placeholder={isHe ? "שם באנגלית" : "Name (English)"}
              className="flex-1 px-3 py-2 rounded-xl text-[13px] outline-none"
              style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text1 }} />
          </div>
          <input value={he} onChange={e => setHe(e.target.value)} placeholder={isHe ? "שם בעברית (רשות)" : "Name (Hebrew, optional)"}
            dir="rtl" className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
            style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text1 }} />
          {error && <p className="text-[12px] font-semibold" style={{ color: P.danger }}>{error}</p>}
          <button type="submit"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[13px] font-bold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3.5 h-3.5" /> {isHe ? "הוסף תחום" : "Add Discipline"}
          </button>
        </form>
      </div>
    </div>
  );
}
