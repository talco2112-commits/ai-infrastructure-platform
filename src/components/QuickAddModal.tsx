"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
};

export interface QuickAddField {
  key: string;
  label: string; labelHe: string;
  type: "text" | "textarea" | "select" | "date" | "number";
  options?: { value: string; label: string; labelHe: string }[];
  placeholder?: string; placeholderHe?: string;
  required?: boolean;
}

interface Props {
  isHe: boolean;
  title: string; titleHe: string;
  fields: QuickAddField[];
  allowFile?: boolean;
  onClose: () => void;
  onSave: (values: Record<string, string>, file: File | null) => void;
}

export function QuickAddModal({ isHe, title, titleHe, fields, allowFile = true, onClose, onSave }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  function set(key: string, v: string) {
    setValues(prev => ({ ...prev, [key]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(values, file);
  }

  return (
    <div ref={overlayRef} onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,25,23,0.5)" }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden" style={{ background: P.card }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${P.border}` }}>
          <h2 className="text-[16px] font-bold" style={{ color: P.text1 }}>{isHe ? titleHe : title}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5">
            <X className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                {isHe ? f.labelHe : f.label}{f.required && " *"}
              </label>
              {f.type === "textarea" ? (
                <textarea required={f.required} rows={3}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                  style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text1 }}
                  placeholder={isHe ? f.placeholderHe : f.placeholder}
                  value={values[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} />
              ) : f.type === "select" ? (
                <select required={f.required}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                  style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text1 }}
                  value={values[f.key] ?? ""} onChange={e => set(f.key, e.target.value)}>
                  <option value="">{isHe ? "בחר…" : "Select…"}</option>
                  {f.options?.map(o => (
                    <option key={o.value} value={o.value}>{isHe ? o.labelHe : o.label}</option>
                  ))}
                </select>
              ) : (
                <input type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                  required={f.required}
                  className="w-full px-3 py-2 rounded-xl text-[13px] outline-none"
                  style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text1 }}
                  placeholder={isHe ? f.placeholderHe : f.placeholder}
                  value={values[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} />
              )}
            </div>
          ))}

          {allowFile && (
            <div>
              <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                {isHe ? "קובץ מצורף (רשות)" : "Attachment (optional)"}
              </label>
              <div onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer"
                style={{ background: P.bg, border: `1px dashed ${P.border}` }}>
                <Upload className="w-4 h-4 shrink-0" style={{ color: P.copper }} />
                <span className="text-[12.5px] truncate" style={{ color: file ? P.text1 : P.text3 }}>
                  {file ? file.name : (isHe ? "לחץ להעלאת קובץ" : "Click to upload a file")}
                </span>
              </div>
              <input ref={fileInputRef} type="file" className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white"
              style={{ background: P.copper }}>
              {isHe ? "הוסף" : "Add"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13px] font-bold"
              style={{ background: P.bg, color: P.text2 }}>
              {isHe ? "ביטול" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
