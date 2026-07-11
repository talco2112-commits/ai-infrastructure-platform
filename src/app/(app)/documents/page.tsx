"use client";

import { useState, useEffect, useRef } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Bell, Search, Upload, Filter, Grid, List,
  FolderOpen, Folder, FileText, Download, Eye,
  Lightbulb, ChevronRight, AlertTriangle, Trash2, Pencil, Check, X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0", copperMid: "#B5855A",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  track: "#E7E0D8",
};

const TRANSLATIONS = {
  en: {
    title: "Document Management",
    filesCount: "391 files",
    searchPlaceholder: "Search documents...",
    projectFolders: "Project Folders",
    filter: "Filter",
    upload: "Upload",
    docsCount: "156 documents",
    aiInsightLabel: "AI Insight",
    aiInsightText: "3 drawings superseded in the last 7 days have active submittals referencing them. Review SUB-009, SUB-011, SUB-014 before next design coordination meeting.",
    colName: "Document Name",
    colRev: "Rev.",
    colDiscipline: "Discipline",
    colDate: "Date",
    colSize: "Size",
    colStatus: "Status",
    colBy: "Uploaded by",
  },
  he: {
    title: "ניהול מסמכים",
    filesCount: "391 קבצים",
    searchPlaceholder: "חיפוש מסמכים...",
    projectFolders: "תיקיות פרויקט",
    filter: "סינון",
    upload: "העלאה",
    docsCount: "156 מסמכים",
    aiInsightLabel: "תובנת AI",
    aiInsightText: "3 תכניות שבוטלו ב-7 הימים האחרונים מוזכרות בהגשות פעילות. בדוק SUB-009, SUB-011, SUB-014 לפני ישיבת תיאום התכנון הבאה.",
    colName: "שם המסמך",
    colRev: "גרסה",
    colDiscipline: "תחום",
    colDate: "תאריך",
    colSize: "גודל",
    colStatus: "סטטוס",
    colBy: "הועלה על-ידי",
  },
};

interface DocFolder { en: string; he: string }

const DEFAULT_FOLDERS: DocFolder[] = [
  { en: "Drawings & Plans",          he: "תכניות ושרטוטים" },
  { en: "Contracts",                 he: "חוזים" },
  { en: "Technical Specifications",  he: "מפרטים טכניים" },
  { en: "Bills of Quantities",       he: "כתבי כמויות" },
  { en: "Submittals",                he: "הגשות" },
  { en: "RFI Correspondence",        he: "התכתבות בקשות מידע" },
  { en: "Meeting Minutes",           he: "פרוטוקולי ישיבות" },
  { en: "3rd Party Reports",         he: "דוחות צד ג׳" },
  { en: "Authority Approvals",       he: "אישורים רגולטוריים" },
  { en: "Environmental & Safety",    he: "בטיחות וסביבה" },
  { en: "Geotechnical Reports",      he: "דוחות גאוטכניים" },
  { en: "As-Built Drawings",         he: "תכניות כנבנה" },
];

const FOLDERS_STORAGE_KEY = "infrai_doc_folders";

const DEMO_FOLDER_COUNTS = [156, 12, 34, 8, 38, 47, 29, 21, 15, 19, 11, 0];

type Status = "APPROVED" | "IN REVIEW" | "SUPERSEDED" | "DRAFT";

const DEMO_FILES: {
  name: string; rev: string; discipline: string;
  date: string; size: string; status: Status; by: string;
}[] = [
  { name: "HW20-STR-DWG-068-001 – Bridge 68 General Arrangement",     rev: "Rev.C", discipline: "Structural", date: "14 Jun 2026", size: "8.4 MB",  status: "APPROVED",   by: "Eng. Shapira"  },
  { name: "HW20-STR-DWG-068-002 – Bridge 68 Pier Details",            rev: "Rev.B", discipline: "Structural", date: "12 Jun 2026", size: "5.1 MB",  status: "IN REVIEW",  by: "Eng. Shapira"  },
  { name: "HW20-CIV-DWG-020-011 – Horizontal Alignment Sec. A",       rev: "Rev.D", discipline: "Civil",      date: "10 Jun 2026", size: "3.8 MB",  status: "APPROVED",   by: "Eng. Mizrahi"  },
  { name: "HW20-CIV-DWG-020-012 – Vertical Alignment Sec. A",         rev: "Rev.C", discipline: "Civil",      date: "10 Jun 2026", size: "3.2 MB",  status: "APPROVED",   by: "Eng. Mizrahi"  },
  { name: "HW20-CIV-DWG-020-021 – Horizontal Alignment Sec. B",       rev: "Rev.B", discipline: "Civil",      date: "08 Jun 2026", size: "3.6 MB",  status: "SUPERSEDED", by: "Eng. Levi"     },
  { name: "HW20-DRN-DWG-030-005 – Drainage Layout Zone A",            rev: "Rev.A", discipline: "Civil",      date: "05 Jun 2026", size: "2.9 MB",  status: "SUPERSEDED", by: "Eng. Ben-David" },
  { name: "HW20-STR-DWG-RW-001 – Retaining Wall Type A Details",      rev: "Rev.B", discipline: "Structural", date: "02 Jun 2026", size: "6.2 MB",  status: "APPROVED",   by: "Eng. Shapira"  },
  { name: "HW20-MEP-DWG-050-001 – Electrical Conduit Routing Plan",   rev: "Rev.A", discipline: "MEP",        date: "28 May 2026", size: "4.1 MB",  status: "IN REVIEW",  by: "Eng. Cohen"    },
  { name: "HW20-TRF-DWG-060-001 – Traffic Signal Layout Phase 1",     rev: "Rev.A", discipline: "Traffic",    date: "25 May 2026", size: "2.4 MB",  status: "IN REVIEW",  by: "Eng. Cohen"    },
  { name: "HW20-CIV-DWG-020-022 – Vertical Alignment Sec. B",         rev: "Rev.A", discipline: "Civil",      date: "20 May 2026", size: "3.0 MB",  status: "SUPERSEDED", by: "Eng. Levi"     },
  { name: "HW20-STR-DWG-068-003 – Bridge 68 Abutment Details",        rev: "Rev.B", discipline: "Structural", date: "15 May 2026", size: "7.8 MB",  status: "APPROVED",   by: "Eng. Shapira"  },
  { name: "HW20-GEO-DWG-010-003 – Geotechnical Boring Layout",        rev: "Rev.A", discipline: "Geotech",    date: "01 May 2026", size: "1.9 MB",  status: "APPROVED",   by: "Eng. Abramov"  },
];

const statusStyle: Record<Status, { bg: string; color: string }> = {
  "APPROVED":   { bg: P.goodBg,  color: P.good   },
  "IN REVIEW":  { bg: P.warnBg,  color: P.warn   },
  "SUPERSEDED": { bg: "#F5F5F4", color: "#78716C" },
  "DRAFT":      { bg: "#EFF6FF", color: "#1D4ED8" },
};

const disciplineColor: Record<string, string> = {
  Structural: "#7C3AED", Civil: "#0369A1", MEP: "#0891B2",
  Traffic: "#047857", Geotech: "#92400E",
};

export default function DocumentsPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const { lang, isHe } = useLanguage();
  const T = TRANSLATIONS[lang];

  const [files, setFiles] = useState(isDemo ? DEMO_FILES : []);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [activeFolderIdx, setActiveFolderIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setFiles(isDemo ? DEMO_FILES : []); }, [isDemo]);

  const [folders, setFolders] = useState<DocFolder[]>(DEFAULT_FOLDERS);
  const [foldersHydrated, setFoldersHydrated] = useState(false);
  const [editingFolderIdx, setEditingFolderIdx] = useState<number | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_FOLDERS.length) setFolders(parsed);
      } catch { /* ignore corrupt storage */ }
    }
    setFoldersHydrated(true);
  }, []);
  useEffect(() => { if (foldersHydrated) localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders)); }, [folders, foldersHydrated]);

  function startRenameFolder(idx: number) {
    setEditingFolderIdx(idx);
    setEditingFolderName(isHe ? folders[idx].he : folders[idx].en);
  }
  function saveRenameFolder() {
    if (editingFolderIdx === null) return;
    const name = editingFolderName.trim();
    if (name) {
      setFolders(prev => prev.map((f, i) => i === editingFolderIdx ? { ...f, [isHe ? "he" : "en"]: name } : f));
    }
    setEditingFolderIdx(null);
  }

  function confirmDelete() {
    if (deleteIdx === null) return;
    setFiles(prev => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  }

  const folderCounts = isDemo ? DEMO_FOLDER_COUNTS : [files.length, ...DEMO_FOLDER_COUNTS.slice(1).map(() => 0)];
  const filesCount   = isHe ? `${files.length} קבצים`      : `${files.length} files`;
  const docsCount    = isHe ? `${folderCounts[activeFolderIdx]} מסמכים`  : `${folderCounts[activeFolderIdx]} documents`;
  // Only "Drawings & Plans" (folder 0) has file rows associated with it today.
  const visibleFiles = activeFolderIdx === 0 ? files : [];

  function fmtSize(bytes: number) {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
  }

  function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const newRows = Array.from(fileList).map(f => ({
      name: f.name, rev: "Rev.A", discipline: "Civil",
      date: today, size: fmtSize(f.size), status: "DRAFT" as Status, by: "You",
    }));
    setFiles(prev => [...newRows, ...prev]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <span className="text-[13px] px-2 py-0.5 rounded-full font-semibold" style={{ background: P.copperLight, color: P.copper }}>
            {filesCount}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px]"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Search className="w-3.5 h-3.5" style={{ color: P.text3 }} />
            <span style={{ color: P.text3 }}>{T.searchPlaceholder}</span>
          </div>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Folder Tree */}
        <aside className="w-60 shrink-0 overflow-y-auto p-4 flex flex-col gap-1"
          style={{ background: P.card, borderRight: isHe ? "none" : `1px solid ${P.border}`, borderLeft: isHe ? `1px solid ${P.border}` : "none" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2" style={{ color: P.text3 }}>
            {T.projectFolders}
          </p>
          {folders.map((f, idx) => {
            const active = idx === activeFolderIdx;
            const name = isHe ? f.he : f.en;
            const isEditing = editingFolderIdx === idx;
            if (isEditing) {
              return (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                  style={{ background: P.copperLight, border: `1px solid ${P.copperMid}` }}>
                  <Folder className="w-4 h-4 shrink-0" style={{ color: P.copper }} />
                  <input
                    autoFocus
                    value={editingFolderName}
                    onChange={e => setEditingFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveRenameFolder(); if (e.key === "Escape") setEditingFolderIdx(null); }}
                    dir={isHe ? "rtl" : "ltr"}
                    className="flex-1 min-w-0 text-[12.5px] font-medium rounded-lg px-1.5 py-0.5 outline-none"
                    style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text1 }}
                  />
                  <button onClick={saveRenameFolder} className="p-0.5 rounded shrink-0" style={{ color: P.good }}>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingFolderIdx(null)} className="p-0.5 rounded shrink-0" style={{ color: P.text3 }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }
            return (
              <div key={idx} onClick={() => setActiveFolderIdx(idx)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer group"
                style={{
                  background: active ? P.copperLight : "transparent",
                  border: active ? `1px solid ${P.copperMid}` : "1px solid transparent",
                }}>
                {active
                  ? <FolderOpen className="w-4 h-4 shrink-0" style={{ color: P.copper }} />
                  : <Folder className="w-4 h-4 shrink-0" style={{ color: P.text3 }} />
                }
                <span className="flex-1 text-[12.5px] font-medium leading-tight truncate" style={{ color: active ? P.copper : P.text2 }}>
                  {name}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); startRenameFolder(idx); }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  title={isHe ? "שנה שם תיקייה" : "Rename folder"}
                  style={{ color: active ? P.copper : P.text3 }}>
                  <Pencil className="w-3 h-3" />
                </button>
                <span className="text-[11px] font-bold shrink-0" style={{ color: active ? P.copper : P.text3 }}>{folderCounts[idx]}</span>
              </div>
            );
          })}
        </aside>

        {/* File List */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{ color: P.text2 }}>{isHe ? folders[activeFolderIdx].he : folders[activeFolderIdx].en}</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: P.text3 }} />
              <span className="text-[13px]" style={{ color: P.text3 }}>{docsCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors"
                style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
                <Filter className="w-3 h-3" /> {T.filter}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
                <Grid className="w-3 h-3" />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                style={{ background: P.copper, color: "#fff" }}>
                <List className="w-3 h-3" />
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
                style={{ background: P.copper }}>
                <Upload className="w-3 h-3" /> {T.upload}
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden"
                onChange={e => handleUpload(e.target.files)} />
            </div>
          </div>

          {/* AI Insight */}
          {isDemo && (
            <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
              style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.warn }} />
              </div>
              <div>
                <p className="text-[12px] font-bold mb-0.5" style={{ color: P.warn }}>{T.aiInsightLabel}</p>
                <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.aiInsightText}</p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colName, T.colRev, T.colDiscipline, T.colDate, T.colSize, T.colStatus, T.colBy, ""].map(h => (
                    <th key={h} className="px-4 py-3 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleFiles.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                    {isHe ? "אין מסמכים בתיקייה זו" : "No documents in this folder"}
                  </td></tr>
                )}
                {visibleFiles.map((f, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${P.border}` }}
                    className="transition-colors hover:bg-[#F5F2EF]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: P.copper }} />
                        <span className="font-medium" style={{ color: P.text1 }}>{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]" style={{ color: P.text3 }}>{f.rev}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
                        style={{ background: disciplineColor[f.discipline] ?? "#78716C" }}>
                        {f.discipline}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: P.text2 }}>{f.date}</td>
                    <td className="px-4 py-3 font-mono text-[11px]" style={{ color: P.text3 }}>{f.size}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: statusStyle[f.status].bg, color: statusStyle[f.status].color }}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: P.text2 }}>{f.by}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1 rounded-lg transition-colors hover:bg-gray-100">
                          <Eye className="w-3.5 h-3.5" style={{ color: P.text3 }} />
                        </button>
                        <button className="p-1 rounded-lg transition-colors hover:bg-gray-100">
                          <Download className="w-3.5 h-3.5" style={{ color: P.text3 }} />
                        </button>
                        <button onClick={() => setDeleteIdx(i)} className="p-1 rounded-lg transition-colors hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: P.danger }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      {deleteIdx !== null && (
        <ConfirmDialog
          isHe={isHe}
          message={`Delete "${files[deleteIdx]?.name}"? This cannot be undone.`}
          messageHe={`למחוק את "${files[deleteIdx]?.name}"? לא ניתן לשחזר פעולה זו.`}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
