import { cookies } from "next/headers";
import {
  Bell, Search, Upload, Filter, Grid, List,
  FolderOpen, Folder, FileText, Download, Eye,
  Lightbulb, ChevronRight, AlertTriangle,
} from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#D4714A", copperLight: "#F5EDE8", copperMid: "#E8A080",
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
    folders: [
      "Drawings & Plans",
      "Contracts",
      "Technical Specifications",
      "Bills of Quantities",
      "Submittals",
      "RFI Correspondence",
      "Meeting Minutes",
      "3rd Party Reports",
      "Authority Approvals",
      "Environmental & Safety",
      "Geotechnical Reports",
      "As-Built Drawings",
    ],
    activeFolderLabel: "Drawings & Plans",
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
    folders: [
      "תכניות ושרטוטים",
      "חוזים",
      "מפרטים טכניים",
      "כתבי כמויות",
      "הגשות",
      "התכתבות בקשות מידע",
      "פרוטוקולי ישיבות",
      "דוחות צד ג׳",
      "אישורים רגולטוריים",
      "בטיחות וסביבה",
      "דוחות גאוטכניים",
      "תכניות כנבנה",
    ],
    activeFolderLabel: "תכניות ושרטוטים",
  },
};

const folderCounts = [156, 12, 34, 8, 38, 47, 29, 21, 15, 19, 11, 0];

type Status = "APPROVED" | "IN REVIEW" | "SUPERSEDED" | "DRAFT";

const files: {
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

export default async function DocumentsPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <span className="text-[13px] px-2 py-0.5 rounded-full font-semibold" style={{ background: P.copperLight, color: P.copper }}>
            {T.filesCount}
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
          {T.folders.map((name, idx) => {
            const active = idx === 0;
            return (
              <div key={name}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer"
                style={{
                  background: active ? P.copperLight : "transparent",
                  border: active ? `1px solid ${P.copperMid}` : "1px solid transparent",
                }}>
                {active
                  ? <FolderOpen className="w-4 h-4 shrink-0" style={{ color: P.copper }} />
                  : <Folder className="w-4 h-4 shrink-0" style={{ color: P.text3 }} />
                }
                <span className="flex-1 text-[12.5px] font-medium leading-tight" style={{ color: active ? P.copper : P.text2 }}>
                  {name}
                </span>
                <span className="text-[11px] font-bold" style={{ color: active ? P.copper : P.text3 }}>{folderCounts[idx]}</span>
              </div>
            );
          })}
        </aside>

        {/* File List */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{ color: P.text2 }}>{T.activeFolderLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: P.text3 }} />
              <span className="text-[13px]" style={{ color: P.text3 }}>{T.docsCount}</span>
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
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
                style={{ background: P.copper }}>
                <Upload className="w-3 h-3" /> {T.upload}
              </button>
            </div>
          </div>

          {/* AI Insight */}
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

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <table className="w-full text-[12.5px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colName, T.colRev, T.colDiscipline, T.colDate, T.colSize, T.colStatus, T.colBy, ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files.map((f, i) => (
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}
