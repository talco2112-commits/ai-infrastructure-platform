"use client";

import {
  FolderOpen, CalendarDays, Banknote, HelpCircle, Scale,
  Shield, ClipboardCheck, Receipt, FileBarChart, Pencil,
  Satellite, HardHat, Upload, CheckCircle2, Circle,
  ArrowRight, Lightbulb, Loader2, Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Project } from "@/contexts/ProjectContext";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  blue: "#1D4ED8", blueBg: "#EFF6FF",
};

interface ModuleSpec {
  en: string; he: string;
  icon: React.ElementType;
  color: string; bg: string;
  descEn: string; descHe: string;
  uploadHints: string[];
  processingStepsEn: string[];
  processingStepsHe: string[];
  uploadedLabelsEn: string[]; // which file types unlock this module
  uploadedLabelsHe: string[];
}

const MODULES: Record<string, ModuleSpec> = {
  "/documents": {
    en: "Documents", he: "מסמכים",
    icon: FolderOpen, color: "#5B21B6", bg: "#EDE9FF",
    descEn: "Manage drawings, specs, contracts and all project documents in one place.",
    descHe: "ניהול תוכניות, מפרטים, חוזים וכל מסמכי הפרויקט במקום אחד.",
    uploadHints: ["Drawings (PDF / DWG)", "Contract (PDF)", "Specifications"],
    processingStepsEn: ["Files received", "Scanning document structure", "Classifying by type & revision", "Building document register", "Linking to project activities"],
    processingStepsHe: ["קבצים התקבלו", "סריקת מבנה מסמכים", "סיווג לפי סוג ותיקון", "בניית רשימת מסמכים", "קישור לפעילויות הפרויקט"],
    uploadedLabelsEn: ["Your uploaded files"], uploadedLabelsHe: ["הקבצים שהועלו"],
  },
  "/schedule": {
    en: "Schedule", he: "לוח זמנים",
    icon: CalendarDays, color: "#B45309", bg: "#FFFBEB",
    descEn: "Track schedule progress, critical path and delays — AI-powered from your Gantt file.",
    descHe: "מעקב התקדמות לוח זמנים, נתיב קריטי ועיכובים — מבוסס AI על קובץ הגנט שלך.",
    uploadHints: ["MS Project (.mpp)", "Primavera P6 (.xer)", "Excel schedule"],
    processingStepsEn: ["Schedule file received", "Parsing activities & durations", "Building critical path (CPM)", "Identifying delays & float", "Generating AI insights"],
    processingStepsHe: ["קובץ לוח הזמנים התקבל", "פירוק פעילויות ומשכים", "בניית נתיב קריטי (CPM)", "זיהוי עיכובים ומרווחים", "יצירת תובנות AI"],
    uploadedLabelsEn: ["Schedule file"], uploadedLabelsHe: ["קובץ לוח זמנים"],
  },
  "/finance": {
    en: "Finance", he: "פיננסים",
    icon: Banknote, color: "#8B5A2B", bg: "#F5EBE0",
    descEn: "Track budget, costs, BOQ analysis and financial forecasts against the contract.",
    descHe: "מעקב תקציב, עלויות, ניתוח כתב כמויות ותחזיות פיננסיות מול החוזה.",
    uploadHints: ["BOQ (Excel)", "Contract (PDF)", "Cost plan"],
    processingStepsEn: ["Contract / BOQ received", "Extracting line items & quantities", "Mapping to cost codes", "Building budget baseline", "Generating financial forecast"],
    processingStepsHe: ["חוזה / כמויות התקבלו", "חילוץ סעיפים וכמויות", "מיפוי לקודי עלות", "בניית קו בסיס תקציב", "יצירת תחזית פיננסית"],
    uploadedLabelsEn: ["Contract / BOQ"], uploadedLabelsHe: ["חוזה / כתב כמויות"],
  },
  "/rfis": {
    en: "RFIs", he: "בקשות מידע",
    icon: HelpCircle, color: "#1D4ED8", bg: "#EFF6FF",
    descEn: "Manage Requests for Information, track responses and decisions across the design team.",
    descHe: "ניהול בקשות מידע, מעקב תגובות והחלטות בין צוות התכנון.",
    uploadHints: ["Drawings (PDF / DWG)", "Specifications"],
    processingStepsEn: ["Drawings received", "Detecting design clashes", "Identifying ambiguities", "Drafting auto-RFIs", "Linking to drawing revisions"],
    processingStepsHe: ["תוכניות התקבלו", "זיהוי התנגשויות תכנון", "זיהוי אי-בהירויות", "עיצוב בקשות מידע אוטומטיות", "קישור לתיקוני תוכניות"],
    uploadedLabelsEn: ["Drawing files"], uploadedLabelsHe: ["קבצי תוכניות"],
  },
  "/claims": {
    en: "Claims", he: "תביעות",
    icon: Scale, color: "#B91C1C", bg: "#FEF2F2",
    descEn: "Manage contractor claims, variation orders and dispute records with timeline evidence.",
    descHe: "ניהול תביעות קבלן, פקודות שינוי ורישומי מחלוקות עם ראיות ציר זמן.",
    uploadHints: ["Contract (PDF)", "BOQ (Excel)", "Schedule"],
    processingStepsEn: ["Contract / schedule received", "Extracting obligation clauses", "Mapping variation triggers", "Building EOT framework", "Linking to programme baseline"],
    processingStepsHe: ["חוזה / לוח זמנים התקבל", "חילוץ סעיפי התחייבות", "מיפוי טריגרים לשינוי", "בניית מסגרת EOT", "קישור לבסיס הגנט"],
    uploadedLabelsEn: ["Contract / Schedule"], uploadedLabelsHe: ["חוזה / לוח זמנים"],
  },
  "/safety": {
    en: "Safety", he: "בטיחות",
    icon: Shield, color: "#15803D", bg: "#F0FDF4",
    descEn: "Log safety observations, near misses, incidents and compliance records.",
    descHe: "תיעוד תצפיות בטיחות, כמעט-אירועים, תאונות ורישומי תאימות.",
    uploadHints: ["Safety plan (PDF)", "Site drawings"],
    processingStepsEn: ["Documents received", "Extracting safety requirements", "Mapping high-risk zones", "Setting up observation templates", "Configuring alert thresholds"],
    processingStepsHe: ["מסמכים התקבלו", "חילוץ דרישות בטיחות", "מיפוי אזורי סיכון", "הגדרת תבניות תצפית", "קביעת סף התראות"],
    uploadedLabelsEn: ["Project files"], uploadedLabelsHe: ["קבצי הפרויקט"],
  },
  "/quality": {
    en: "Quality", he: "איכות",
    icon: ClipboardCheck, color: "#0891B2", bg: "#E0F2FE",
    descEn: "Track NCRs, inspection records and quality control milestones.",
    descHe: "מעקב אי-התאמות, רישומי בדיקות ואבני דרך לבקרת איכות.",
    uploadHints: ["Drawings (PDF)", "Specifications", "Quality plan"],
    processingStepsEn: ["Drawings received", "Extracting spec tolerances", "Building inspection checklists", "Mapping hold points", "Setting up NCR categories"],
    processingStepsHe: ["תוכניות התקבלו", "חילוץ סבילויות מפרט", "בניית רשימות תיוג", "מיפוי נקודות עצירה", "הגדרת קטגוריות NCR"],
    uploadedLabelsEn: ["Drawing files"], uploadedLabelsHe: ["קבצי תוכניות"],
  },
  "/billing": {
    en: "Billing", he: "חשבונות",
    icon: Receipt, color: "#7E22CE", bg: "#F3E8FF",
    descEn: "Create payment certificates, manage invoices and track approvals.",
    descHe: "יצירת תעודות תשלום, ניהול חשבוניות ומעקב אישורים.",
    uploadHints: ["BOQ (Excel)", "Contract (PDF)"],
    processingStepsEn: ["Contract / BOQ received", "Extracting payment schedule", "Setting up billing periods", "Mapping retention rules", "Configuring approval workflow"],
    processingStepsHe: ["חוזה / כמויות התקבלו", "חילוץ לוח תשלומים", "הגדרת תקופות חיוב", "מיפוי כללי ניכיון", "הגדרת תהליך אישור"],
    uploadedLabelsEn: ["Contract / BOQ"], uploadedLabelsHe: ["חוזה / כתב כמויות"],
  },
  "/reports": {
    en: "Reports", he: "דוחות",
    icon: FileBarChart, color: "#1D4ED8", bg: "#EFF6FF",
    descEn: "Generate weekly, monthly and custom AI-powered project reports.",
    descHe: "יצירת דוחות שבועיים, חודשיים ומותאמים עם תובנות AI.",
    uploadHints: ["Schedule", "BOQ", "Contract"],
    processingStepsEn: ["Project files received", "Aggregating data sources", "Building reporting baseline", "Training report templates", "Generating first AI brief"],
    processingStepsHe: ["קבצי פרויקט התקבלו", "איחוד מקורות נתונים", "בניית בסיס דיווח", "הכשרת תבניות דוח", "יצירת תדריך AI ראשון"],
    uploadedLabelsEn: ["Project files"], uploadedLabelsHe: ["קבצי הפרויקט"],
  },
  "/design": {
    en: "Design", he: "תכנון",
    icon: Pencil, color: "#4338CA", bg: "#EDE9FF",
    descEn: "Coordinate design reviews, drawing revisions and clash detection.",
    descHe: "תיאום סקירות תכנון, תיקוני תוכניות וגילוי התנגשויות.",
    uploadHints: ["Drawings (PDF / DWG)", "BIM model (IFC)", "Specifications"],
    processingStepsEn: ["Drawing files received", "Indexing by discipline & revision", "Running clash detection", "Building drawing register", "Linking to RFI log"],
    processingStepsHe: ["קבצי תוכניות התקבלו", "אינדוקס לפי תחום ותיקון", "הרצת גילוי התנגשויות", "בניית רשימת תוכניות", "קישור ליומן בקשות מידע"],
    uploadedLabelsEn: ["Drawing files"], uploadedLabelsHe: ["קבצי תוכניות"],
  },
  "/site-progress": {
    en: "Site Progress", he: "התקדמות אתר",
    icon: Satellite, color: "#15803D", bg: "#F0FDF4",
    descEn: "Monitor live site progress with drone scans and BIM comparison.",
    descHe: "ניטור התקדמות אתר בזמן אמת עם סריקות רחפן והשוואת BIM.",
    uploadHints: ["BIM model (IFC)", "Site drawings"],
    processingStepsEn: ["Drawings / BIM received", "Creating 3D spatial reference", "Setting up zone grid", "Configuring progress tracking", "Preparing scan baseline"],
    processingStepsHe: ["תוכניות / BIM התקבלו", "יצירת מודל מרחבי", "הגדרת רשת אזורים", "הגדרת מעקב התקדמות", "הכנת בסיס סריקה"],
    uploadedLabelsEn: ["Drawing / BIM files"], uploadedLabelsHe: ["תוכניות / BIM"],
  },
  "/construction": {
    en: "Construction", he: "בנייה וביצוע",
    icon: HardHat, color: "#B45309", bg: "#FFFBEB",
    descEn: "Daily diaries, equipment logs, subcontractor tracking and procurement management.",
    descHe: "יומני עבודה, ציוד, מעקב קבלני משנה וניהול רכש.",
    uploadHints: ["Schedule", "Drawings", "Subcontractor list"],
    processingStepsEn: ["Schedule received", "Extracting activities & crews", "Setting up daily diary template", "Mapping subcontractor packages", "Configuring resource calendar"],
    processingStepsHe: ["לוח זמנים התקבל", "חילוץ פעילויות וצוותים", "הגדרת תבנית יומן יומי", "מיפוי חבילות קבלני משנה", "הגדרת לוח משאבים"],
    uploadedLabelsEn: ["Schedule file"], uploadedLabelsHe: ["קובץ לוח זמנים"],
  },
};

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

interface Props {
  isHe: boolean;
  project: Project;
  pathname: string;
  filesUploaded: boolean;
}

/* ── Processing state — files uploaded, analysis in progress ── */
function ProcessingView({ isHe, project, mod, Icon }: {
  isHe: boolean; project: Project; mod: ModuleSpec; Icon: React.ElementType;
}) {
  const router = useRouter();
  const displayName = isHe ? (project.nameHe || project.name) : project.name;

  const steps = isHe ? mod.processingStepsHe : mod.processingStepsEn;
  // Simulate: first 2 done, step 3 in progress, rest pending
  const DONE = 2; const ACTIVE = 3;

  const fileStatus = [
    { label: isHe ? "לוח זמנים" : "Schedule",  done: project.scheduleFiles  > 0, count: project.scheduleFiles  },
    { label: isHe ? "חוזה"       : "Contract",  done: project.contractFiles  > 0, count: project.contractFiles  },
    { label: isHe ? "כתב כמויות" : "BOQ",       done: project.boqFiles       > 0, count: project.boqFiles       },
    { label: isHe ? "תכניות"     : "Drawings",  done: project.drawingFiles   > 0, count: project.drawingFiles   },
  ];

  return (
    <div className="min-h-full flex flex-col" style={{ background: P.bg }}>

      {/* Header */}
      <div className="px-8 py-5 flex items-center gap-4"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: mod.bg }}>
          <Icon className="w-5 h-5" style={{ color: mod.color }}/>
        </div>
        <div className="flex-1">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>
            {isHe ? mod.he : mod.en}
          </h1>
          <p className="text-[12px] font-medium" style={{ color: P.text3 }}>
            {displayName}
            {project.client ? ` · ${project.client}` : ""}
            {project.startDate ? ` · ${fmtDate(project.startDate)} – ${fmtDate(project.endDate)}` : ""}
          </p>
        </div>
        {/* Live processing badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: P.warn }}/>
          <span className="text-[12px] font-bold" style={{ color: P.warn }}>
            {isHe ? "מעבד…" : "Processing…"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl space-y-4">

          {/* Uploaded files summary */}
          <div className="rounded-2xl p-5"
            style={{ background: P.goodBg, border: `1px solid #BBF7D0` }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5" style={{ color: P.good }}/>
              <p className="text-[14px] font-bold" style={{ color: P.good }}>
                {isHe ? "הקבצים הועלו בהצלחה" : "Files uploaded successfully"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {fileStatus.map(f => (
                <div key={f.label} className="flex items-center gap-2">
                  {f.done
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: P.good }}/>
                    : <Circle       className="w-4 h-4 shrink-0" style={{ color: P.text3 }}/>
                  }
                  <span className="text-[13px] font-medium" style={{ color: f.done ? P.good : P.text3 }}>
                    {f.label}{f.done && f.count > 1 ? ` (${f.count})` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Processing pipeline */}
          <div className="rounded-2xl p-6" style={{ background: P.card, border: `1px solid ${P.border}` }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: P.warnBg }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: P.warn }}/>
              </div>
              <p className="text-[14px] font-bold" style={{ color: P.text1 }}>
                {isHe ? "AI מנתח את הקבצים שלך" : "AI is analyzing your files"}
              </p>
            </div>

            <div className="space-y-3">
              {steps.map((step, i) => {
                const done   = i < DONE;
                const active = i === DONE; // step index 2 = 3rd step
                const pending = i > DONE;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {done   && <CheckCircle2 className="w-5 h-5" style={{ color: P.good }}/>}
                      {active && <Loader2 className="w-5 h-5 animate-spin" style={{ color: P.warn }}/>}
                      {pending && (
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: P.border }}>
                          <span className="text-[9px] font-bold" style={{ color: P.text3 }}>{i + 1}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[13px] font-medium"
                      style={{ color: done ? P.good : active ? P.warn : P.text3 }}>
                      {step}
                    </span>
                    {active && (
                      <span className="ms-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: P.warnBg, color: P.warn }}>
                        {isHe ? "בתהליך" : "In progress"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 flex items-center gap-2" style={{ borderTop: `1px solid ${P.border}` }}>
              <Clock className="w-4 h-4 shrink-0" style={{ color: P.text3 }}/>
              <p className="text-[12px]" style={{ color: P.text3 }}>
                {isHe
                  ? "העיבוד לוקח בדרך כלל 2–5 דקות. הדף יתעדכן אוטומטית."
                  : "Processing typically takes 2–5 minutes. This page will update automatically."}
              </p>
            </div>
          </div>

          {/* What will be available */}
          <div className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4" style={{ color: P.copper }}/>
              <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: P.copper }}>
                {isHe ? "מה יהיה זמין לאחר העיבוד" : "What becomes available after processing"}
              </p>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: P.text2 }}>
              {isHe ? mod.descHe : mod.descEn}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold text-white"
              style={{ background: P.copper }}>
              {isHe ? "חזור ללוח בקרה" : "Back to Dashboard"}
            </button>
            <button
              onClick={() => router.push("/documents")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold"
              style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
              <Upload className="w-4 h-4"/>
              {isHe ? "הוסף קבצים" : "Add more files"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Empty state — no relevant files uploaded yet ── */
function EmptyView({ isHe, project, mod, Icon }: {
  isHe: boolean; project: Project; mod: ModuleSpec; Icon: React.ElementType;
}) {
  const router = useRouter();
  const displayName = isHe ? (project.nameHe || project.name) : project.name;

  const fileStatus = [
    { label: isHe ? "לוח זמנים" : "Schedule",  done: project.scheduleFiles  > 0 },
    { label: isHe ? "חוזה"       : "Contract",  done: project.contractFiles  > 0 },
    { label: isHe ? "כתב כמויות" : "BOQ",       done: project.boqFiles       > 0 },
    { label: isHe ? "תכניות"     : "Drawings",  done: project.drawingFiles   > 0 },
  ];

  return (
    <div className="min-h-full flex flex-col" style={{ background: P.bg }}>

      {/* Header */}
      <div className="px-8 py-5 flex items-center gap-4"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: mod.bg }}>
          <Icon className="w-5 h-5" style={{ color: mod.color }}/>
        </div>
        <div>
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>
            {isHe ? mod.he : mod.en}
          </h1>
          <p className="text-[12px] font-medium" style={{ color: P.text3 }}>
            {displayName}
            {project.client ? ` · ${project.client}` : ""}
            {project.startDate ? ` · ${fmtDate(project.startDate)} – ${fmtDate(project.endDate)}` : ""}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">

          <div className="rounded-3xl p-10 text-center"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 4px 24px rgba(28,25,23,0.07)" }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: mod.bg }}>
              <Icon className="w-10 h-10" style={{ color: mod.color }}/>
            </div>
            <h2 className="text-[22px] font-bold mb-2" style={{ color: P.text1 }}>
              {isHe ? "אין נתונים עדיין" : "No data yet"}
            </h2>
            <p className="text-[14px] leading-relaxed mb-8" style={{ color: P.text2 }}>
              {isHe ? mod.descHe : mod.descEn}
            </p>

            <div className="rounded-2xl p-5 mb-6 text-start"
              style={{ background: P.bg, border: `1px solid ${P.border}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4" style={{ color: P.copper }}/>
                <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: P.copper }}>
                  {isHe ? "כדי להפעיל מודול זה, העלה:" : "To unlock this module, upload:"}
                </p>
              </div>
              <ul className="space-y-1.5">
                {mod.uploadHints.map(h => (
                  <li key={h} className="flex items-center gap-2 text-[13px] font-medium" style={{ color: P.text2 }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: mod.color }}/>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/documents")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold text-white"
                style={{ background: P.copper }}>
                <Upload className="w-4 h-4"/>
                {isHe ? "העלה מסמכים" : "Upload Documents"}
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold"
                style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
                {isHe ? "לוח בקרה" : "Dashboard"}
                <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          </div>

          {/* File status */}
          <div className="mt-4 rounded-2xl px-5 py-4"
            style={{ background: P.card, border: `1px solid ${P.border}` }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: P.text3 }}>
              {isHe ? "קבצים שהועלו לפרויקט" : "Project files uploaded"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {fileStatus.map(f => (
                <div key={f.label} className="flex items-center gap-2">
                  {f.done
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: P.good }}/>
                    : <Circle       className="w-4 h-4 shrink-0" style={{ color: P.text3 }}/>
                  }
                  <span className="text-[12px] font-medium" style={{ color: f.done ? P.good : P.text3 }}>
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Root export ── */
export function EmptyModulePage({ isHe, project, pathname, filesUploaded }: Props) {
  const key = Object.keys(MODULES).find(k => pathname === k || pathname.startsWith(k + "/"));
  const mod = key ? MODULES[key] : MODULES["/documents"];
  const Icon = mod.icon;

  if (filesUploaded) {
    return <ProcessingView isHe={isHe} project={project} mod={mod} Icon={Icon}/>;
  }
  return <EmptyView isHe={isHe} project={project} mod={mod} Icon={Icon}/>;
}
