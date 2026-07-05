"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X, CheckCircle2, Loader2, Upload, File,
  FileText, FileSpreadsheet, Image, Calendar, Banknote,
  MapPin, Building2, Users, Plus, Trash2, Cpu,
  FolderOpen, AlertTriangle, ArrowLeft, ArrowRight,
  ClipboardList, Milestone,
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectContext";
import type { ScheduleActivity } from "@/contexts/ProjectContext";
import { parseScheduleFile } from "@/components/RealSchedule";
// parseScheduleFile uploads to /api/parse-schedule — handles .mpp, .xlsx, .csv, .xer

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperD: "#6B3E18", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  blue: "#1D4ED8", blueBg: "#EFF6FF",
  dark: "#1A1512",
};

/* ─── types ─── */
interface UploadedFile { id: string; name: string; size: number; }
type Lang = "en" | "he";

/* ─── helpers ─── */
function fmtSize(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }

/* ─── step definitions ─── */
const STEPS_EN = ["Project Info", "Schedule", "Contract & BOQ", "Drawings", "Milestones", "Processing"];
const STEPS_HE = ["פרטי פרויקט", "לוח זמנים", "חוזה ו-BOQ", "תכניות", "אבני דרך", "עיבוד"];

const STEP_ICONS = [Building2, Calendar, FileText, Image, Milestone, Cpu];

/* ─── skip notice banner ─── */
function SkipNotice({ isHe, module }: { isHe: boolean; module: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: P.blueBg, border: `1px solid #BFDBFE` }}>
      <FolderOpen className="w-4 h-4 shrink-0" style={{ color: P.blue }}/>
      <p className="text-[12px]" style={{ color: P.blue }}>
        {isHe
          ? <><strong>{module}</strong> הוא שלב אופציונלי — ניתן לדלג ולהעלות קבצים לאחר יצירת הפרויקט.</>
          : <><strong>{module}</strong> is optional — you can skip now and upload files after the project is created.</>
        }
      </p>
    </div>
  );
}

/* ─── file upload zone ─── */
function DropZone({
  label, labelHe, hint, hintHe, accept, files, onChange, isHe, icon: Icon, onRawFiles,
}: {
  label: string; labelHe: string;
  hint: string;  hintHe: string;
  accept: string;
  files: UploadedFile[];
  onChange: (f: UploadedFile[]) => void;
  isHe: boolean;
  icon: React.FC<{className?:string; style?: React.CSSProperties}>;
  onRawFiles?: (raw: File[]) => void;
}) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  function addFiles(raw: FileList) {
    const arr = Array.from(raw);
    onRawFiles?.(arr);
    const next: UploadedFile[] = arr.map(f => ({ id: uid(), name: f.name, size: f.size }));
    onChange([...files, ...next]);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        className="rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all p-8"
        style={{ border: `2px dashed ${drag ? P.copper : P.border}`, background: drag ? P.copperLight : P.bg, minHeight: 140 }}>
        <input ref={ref} type="file" multiple accept={accept} className="hidden"
          onChange={e => { if (e.target.files) { addFiles(e.target.files); e.target.value = ""; } }}/>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: P.copperLight }}>
          <Icon className="w-5 h-5" style={{ color: P.copper }}/>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-bold" style={{ color: P.text1 }}>{isHe ? labelHe : label}</p>
          <p className="text-[11.5px] mt-1" style={{ color: P.text3 }}>{isHe ? hintHe : hint}</p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold"
          style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text2 }}
          onClick={e => { e.stopPropagation(); ref.current?.click(); }}>
          <Upload className="w-3.5 h-3.5"/>
          {isHe ? "בחר קבצים" : "Browse files"}
        </button>
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: P.bg, border: `1px solid ${P.border}` }}>
              <File className="w-4 h-4 shrink-0" style={{ color: P.copper }}/>
              <span className="flex-1 text-[12px] font-medium truncate" style={{ color: P.text1 }}>{f.name}</span>
              <span className="text-[11px]" style={{ color: P.text3 }}>{fmtSize(f.size)}</span>
              <button onClick={() => onChange(files.filter(x => x.id !== f.id))}>
                <Trash2 className="w-3.5 h-3.5" style={{ color: P.text3 }}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── main modal ─── */
export function NewProjectModal({ isHe, onClose }: { isHe: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addProject } = useProjects();
  const [step, setStep] = useState(0);

  /* Step 0 – project info */
  const [name, setName]             = useState("");
  const [nameHe, setNameHe]         = useState("");
  const [type, setType]             = useState("Road");
  const [client, setClient]         = useState("");
  const [location, setLocation]     = useState("");
  const [contractVal, setContractVal] = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [pm, setPm]                 = useState("");

  /* Step 1 – schedule */
  const [schedFiles, setSchedFiles]       = useState<UploadedFile[]>([]);
  const [schedRawFiles, setSchedRawFiles] = useState<File[]>([]);
  const [parsedActivities, setParsedActivities] = useState<ScheduleActivity[]>([]);
  const [schedParseError, setSchedParseError]   = useState<string | null>(null);

  /* Step 2 – contract + BOQ */
  const [contractFiles, setContractFiles] = useState<UploadedFile[]>([]);
  const [boqFiles, setBoqFiles]           = useState<UploadedFile[]>([]);

  /* Step 3 – drawings */
  const [drawingFiles, setDrawingFiles] = useState<UploadedFile[]>([]);

  /* Step 4 – milestones */
  const [msFiles, setMsFiles]             = useState<UploadedFile[]>([]);
  const [milestones, setMilestones]       = useState([
    { id: uid(), name: "Notice to Proceed",      nameHe: "הודעת תחילת עבודה", date: "" },
    { id: uid(), name: "Mobilisation Complete",  nameHe: "גיוס הושלם",        date: "" },
    { id: uid(), name: "Practical Completion",   nameHe: "השלמה מעשית",       date: "" },
    { id: uid(), name: "Defects Liability End",  nameHe: "תום תקופת אחריות",  date: "" },
  ]);

  /* Step 5 – processing */
  const [procPhase, setProcPhase] = useState(0); // 0=idle 1-N=steps 99=done

  const PROC_STEPS_EN = [
    "Parsing schedule file…",
    "Extracting BOQ line items…",
    "Reading contract clauses…",
    "Indexing drawings…",
    "Building milestone timeline…",
    "Populating Dashboard…",
    "Syncing Finance module…",
    "Configuring RFI & Claims…",
    "Finalising project setup…",
  ];
  const PROC_STEPS_HE = [
    "מנתח קובץ לוח זמנים…",
    "מחלץ סעיפי BOQ…",
    "קורא סעיפי חוזה…",
    "מאנדקס תכניות…",
    "בונה ציר אבני דרך…",
    "מאכלס לוח בקרה…",
    "מסנכרן מודול פיננסי…",
    "מגדיר RFI ותביעות…",
    "מסיים הגדרת פרויקט…",
  ];

  async function startProcessing() {
    setProcPhase(1);
    setSchedParseError(null);

    // Phase 1: actually parse the schedule file
    if (schedRawFiles.length > 0) {
      try {
        const result = await parseScheduleFile(schedRawFiles[0]);
        setParsedActivities(result.activities);
      } catch (err) {
        setSchedParseError(err instanceof Error ? err.message : "Could not parse schedule file");
      }
    }

    // Phases 2–N: continue animation for remaining modules
    PROC_STEPS_EN.slice(1).forEach((_, i) => {
      setTimeout(() => setProcPhase(i + 3), (i + 1) * 700);
    });
    setTimeout(() => setProcPhase(99), (PROC_STEPS_EN.length - 1) * 700 + 400);
  }

  /* ── helpers ── */
  const totalFiles =
    schedFiles.length + contractFiles.length + boqFiles.length +
    drawingFiles.length + msFiles.length;

  const step0Valid = name.trim().length > 0 && client.trim().length > 0 && startDate && endDate;

  function addMilestone() {
    setMilestones(prev => [...prev, { id: uid(), name: "", nameHe: "", date: "" }]);
  }
  function removeMilestone(id: string) {
    setMilestones(prev => prev.filter(m => m.id !== id));
  }
  function updateMilestone(id: string, field: "name"|"nameHe"|"date", val: string) {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
  }

  const steps = isHe ? STEPS_HE : STEPS_EN;
  const ArrowNext = isHe ? ArrowLeft : ArrowRight;
  const ArrowPrev = isHe ? ArrowRight : ArrowLeft;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(26,21,18,0.75)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}>

      <div className="w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col"
        dir={isHe ? "rtl" : "ltr"}
        style={{ background: P.card, border: `1px solid ${P.border}`, maxHeight: "92vh" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${P.border}`, background: P.dark, borderRadius: "24px 24px 0 0" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: P.copper }}>
              {isHe ? "InfrAI" : "InfrAI"}
            </p>
            <h2 className="text-[17px] font-bold text-white">
              {isHe ? "פרויקט חדש" : "New Project Setup"}
            </h2>
          </div>

          {/* Step pills */}
          <div className="flex items-center gap-1">
            {steps.map((label, i) => {
              const Icon = STEP_ICONS[i];
              const done   = i < step;
              const active = i === step;
              return (
                <div key={i} title={label}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: done ? P.good : active ? P.copper : "rgba(255,255,255,0.1)" }}>
                  {done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-white"/>
                    : <Icon className="w-3.5 h-3.5" style={{ color: active ? "#fff" : "rgba(255,255,255,0.35)" }}/>
                  }
                </div>
              );
            })}
          </div>

          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <X className="w-4 h-4 text-white"/>
          </button>
        </div>

        {/* Step label */}
        <div className="px-6 py-3 shrink-0 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${P.border}`, background: P.copperLight }}>
          {(() => { const Icon = STEP_ICONS[step]; return <Icon className="w-4 h-4" style={{ color: P.copper }}/>; })()}
          <p className="text-[13px] font-bold" style={{ color: P.copper }}>{steps[step]}</p>
          {step >= 1 && step <= 4 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ms-1"
              style={{ background: P.border, color: P.text3 }}>
              {isHe ? "אופציונלי" : "Optional"}
            </span>
          )}
          <span className="ms-auto text-[11px]" style={{ color: P.text3 }}>
            {isHe ? `שלב ${step + 1} מתוך ${steps.length}` : `Step ${step + 1} of ${steps.length}`}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ════ STEP 0: PROJECT INFO ════ */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                    {isHe ? "שם הפרויקט (אנגלית) *" : "Project Name (English) *"}
                  </label>
                  <input value={name} onChange={e => setName(e.target.value)} dir="ltr"
                    placeholder="e.g. Highway 20 – North Extension"
                    className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                    style={{ background: P.bg, border: `1.5px solid ${name ? P.border : "#FCA5A5"}`, color: P.text1, outline: "none" }}/>
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                    {isHe ? "שם הפרויקט (עברית)" : "Project Name (Hebrew)"}
                  </label>
                  <input value={nameHe} onChange={e => setNameHe(e.target.value)} dir="rtl"
                    placeholder="לדוגמה: כביש 20 – הרחבה צפונית"
                    className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                    style={{ background: P.bg, border: `1.5px solid ${P.border}`, color: P.text1, outline: "none" }}/>
                </div>
              </div>

              {/* Project type */}
              <div>
                <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                  {isHe ? "סוג פרויקט" : "Project Type"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v:"Road",     en:"Road",     he:"כביש",    icon:"🛣️" },
                    { v:"Bridge",   en:"Bridge",   he:"גשר",     icon:"🌉" },
                    { v:"Building", en:"Building", he:"בנייה",   icon:"🏗️" },
                    { v:"Rail",     en:"Rail",     he:"מסילה",   icon:"🚆" },
                    { v:"Tunnel",   en:"Tunnel",   he:"מנהרה",   icon:"⛏️" },
                    { v:"Water",    en:"Water",    he:"מים",     icon:"💧" },
                    { v:"Energy",   en:"Energy",   he:"אנרגיה",  icon:"⚡" },
                    { v:"Other",    en:"Other",    he:"אחר",     icon:"📋" },
                  ].map(t => (
                    <button key={t.v} onClick={() => setType(t.v)}
                      className="py-2 px-1 rounded-xl text-[11px] font-bold text-center flex flex-col items-center gap-1"
                      style={{ background: type===t.v ? P.copperLight : P.bg, color: type===t.v ? P.copper : P.text3, border: `1.5px solid ${type===t.v ? P.copper+"50" : P.border}` }}>
                      <span className="text-[16px]">{t.icon}</span>
                      {isHe ? t.he : t.en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                    <Users className="w-3.5 h-3.5 inline me-1"/>{isHe ? "לקוח / מזמין *" : "Client / Owner *"}
                  </label>
                  <input value={client} onChange={e => setClient(e.target.value)}
                    placeholder={isHe ? "משרד התחבורה" : "Ministry of Transport"}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                    style={{ background: P.bg, border: `1.5px solid ${client ? P.border : "#FCA5A5"}`, color: P.text1, outline: "none" }}/>
                </div>
                <div>
                  <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                    <MapPin className="w-3.5 h-3.5 inline me-1"/>{isHe ? "מיקום" : "Location"}
                  </label>
                  <input value={location} onChange={e => setLocation(e.target.value)}
                    placeholder={isHe ? "צפון ישראל" : "Northern Israel"}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                    style={{ background: P.bg, border: `1.5px solid ${P.border}`, color: P.text1, outline: "none" }}/>
                </div>
                <div>
                  <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                    <Banknote className="w-3.5 h-3.5 inline me-1"/>{isHe ? "שווי חוזה (₪)" : "Contract Value (₪)"}
                  </label>
                  <input value={contractVal} onChange={e => setContractVal(e.target.value)}
                    placeholder="148,000,000" dir="ltr"
                    className="w-full px-3 py-2.5 rounded-xl text-[13px] font-mono"
                    style={{ background: P.bg, border: `1.5px solid ${P.border}`, color: P.text1, outline: "none" }}/>
                </div>
                <div>
                  <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                    <Users className="w-3.5 h-3.5 inline me-1"/>{isHe ? "מנהל פרויקט" : "Project Manager"}
                  </label>
                  <input value={pm} onChange={e => setPm(e.target.value)}
                    placeholder={isHe ? "שם מנהל" : "PM name"}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                    style={{ background: P.bg, border: `1.5px solid ${P.border}`, color: P.text1, outline: "none" }}/>
                </div>
                <div>
                  <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                    <Calendar className="w-3.5 h-3.5 inline me-1"/>{isHe ? "תאריך התחלה *" : "Start Date *"}
                  </label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                    style={{ background: P.bg, border: `1.5px solid ${startDate ? P.border : "#FCA5A5"}`, color: P.text1, outline: "none" }}/>
                </div>
                <div>
                  <label className="block text-[12px] font-bold mb-1.5" style={{ color: P.text2 }}>
                    <Calendar className="w-3.5 h-3.5 inline me-1"/>{isHe ? "תאריך סיום *" : "End Date *"}
                  </label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                    style={{ background: P.bg, border: `1.5px solid ${endDate ? P.border : "#FCA5A5"}`, color: P.text1, outline: "none" }}/>
                </div>
              </div>
            </div>
          )}

          {/* ════ STEP 1: SCHEDULE ════ */}
          {step === 1 && (
            <div className="space-y-4">
              <SkipNotice isHe={isHe} module={isHe ? "לוח הזמנים" : "Schedule"} />
              <div className="px-4 py-3 rounded-2xl flex items-start gap-3"
                style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: P.warn }}/>
                <div className="text-[12px]" style={{ color: P.warn }}>
                  <strong>{isHe ? "פורמטים נתמכים:" : "Supported formats:"}</strong>{" "}
                  {isHe
                    ? "נתמך: MS Project .mpp/.mpt, Excel .xlsx/.xls, CSV, Primavera P6 XER, MSPDI XML"
                    : "Supported: MS Project .mpp/.mpt, Excel .xlsx/.xls, CSV, Primavera P6 XER, MSPDI XML"}
                </div>
              </div>
              <DropZone
                label="Upload Project Schedule"
                labelHe="העלה לוח זמנים"
                hint="MS Project .mpp · Excel · CSV · Primavera P6 XER"
                hintHe="MS Project .mpp · Excel · CSV · Primavera P6 XER"
                accept=".mpp,.mpt,.xlsx,.xls,.csv,.xer,.xml"
                files={schedFiles}
                onChange={setSchedFiles}
                onRawFiles={raw => setSchedRawFiles(raw)}
                isHe={isHe}
                icon={Calendar}/>
            </div>
          )}

          {/* ════ STEP 2: CONTRACT + BOQ ════ */}
          {step === 2 && (
            <div className="space-y-5">
              <SkipNotice isHe={isHe} module={isHe ? "החוזה וכתב הכמויות" : "Contract & BOQ"} />
              <div>
                <p className="text-[13px] font-bold mb-2" style={{ color: P.text1 }}>
                  {isHe ? "קובץ חוזה" : "Contract Document"}
                </p>
                <DropZone
                  label="Upload Contract"
                  labelHe="העלה חוזה"
                  hint="PDF or Word document"
                  hintHe="מסמך PDF או Word"
                  accept=".pdf,.doc,.docx"
                  files={contractFiles}
                  onChange={setContractFiles}
                  isHe={isHe}
                  icon={FileText}/>
              </div>
              <div>
                <p className="text-[13px] font-bold mb-2" style={{ color: P.text1 }}>
                  {isHe ? "כתב כמויות (BOQ)" : "Bill of Quantities (BOQ)"}
                </p>
                <DropZone
                  label="Upload BOQ"
                  labelHe="העלה כתב כמויות"
                  hint="Excel or CSV · columns: Item / Description / Unit / Qty / Rate"
                  hintHe="Excel או CSV · עמודות: פריט / תיאור / יחידה / כמות / מחיר"
                  accept=".xlsx,.csv,.xls,.ods"
                  files={boqFiles}
                  onChange={setBoqFiles}
                  isHe={isHe}
                  icon={FileSpreadsheet}/>
              </div>
            </div>
          )}

          {/* ════ STEP 3: DRAWINGS ════ */}
          {step === 3 && (
            <div className="space-y-4">
              <SkipNotice isHe={isHe} module={isHe ? "התכניות" : "Drawings"} />
              <div className="grid grid-cols-3 gap-3 mb-2">
                {[
                  { en:"Civil / Road", he:"תכניות כביש", icon:"🛣️" },
                  { en:"Structural",   he:"קונסטרוקציה", icon:"🏗️" },
                  { en:"MEP",          he:"מכ\"א",        icon:"⚙️" },
                  { en:"Drainage",     he:"ניקוז",        icon:"💧" },
                  { en:"As-Built",     he:"כמבוצע",       icon:"✅" },
                  { en:"Other",        he:"אחר",          icon:"📄" },
                ].map(d => (
                  <div key={d.en} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold"
                    style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
                    <span>{d.icon}</span>{isHe ? d.he : d.en}
                  </div>
                ))}
              </div>
              <DropZone
                label="Upload Drawings"
                labelHe="העלה תכניות"
                hint="PDF · DWG · DXF · Images — all categories accepted"
                hintHe="PDF · DWG · DXF · תמונות — כל הקטגוריות"
                accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.svg,.tiff"
                files={drawingFiles}
                onChange={setDrawingFiles}
                isHe={isHe}
                icon={Image}/>
              {drawingFiles.length > 0 && (
                <p className="text-[11.5px] text-center" style={{ color: P.text3 }}>
                  {isHe
                    ? `${drawingFiles.length} תכניות · AI יסווג אוטומטית לפי שם הקובץ`
                    : `${drawingFiles.length} drawing(s) · AI will auto-classify by filename`}
                </p>
              )}
            </div>
          )}

          {/* ════ STEP 4: MILESTONES ════ */}
          {step === 4 && (
            <div className="space-y-4">
              <SkipNotice isHe={isHe} module={isHe ? "אבני הדרך" : "Milestones"} />
              {msFiles.length === 0 && (
                <div>
                  <p className="text-[12px] font-semibold mb-2" style={{ color: P.text2 }}>
                    {isHe ? "העלה מסמך אבני דרך (אופציונלי — AI יחלץ מלוח הזמנים)" : "Upload milestones document (optional — AI extracts from schedule)"}
                  </p>
                  <DropZone
                    label="Upload Milestones"
                    labelHe="העלה אבני דרך"
                    hint="PDF · Excel — or fill manually below"
                    hintHe="PDF · Excel — או מלא ידנית למטה"
                    accept=".pdf,.xlsx,.csv,.xls"
                    files={msFiles}
                    onChange={setMsFiles}
                    isHe={isHe}
                    icon={ClipboardList}/>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-bold" style={{ color: P.text1 }}>
                    {isHe ? "אבני דרך עיקריות" : "Key Milestones"}
                  </p>
                  <button onClick={addMilestone}
                    className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: P.copperLight, color: P.copper }}>
                    <Plus className="w-3 h-3"/>
                    {isHe ? "הוסף" : "Add"}
                  </button>
                </div>

                <div className="space-y-2">
                  {milestones.map((m, i) => (
                    <div key={m.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center px-3 py-2.5 rounded-xl"
                      style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                      <input value={m.name} onChange={e => updateMilestone(m.id, "name", e.target.value)}
                        placeholder={`Milestone ${i + 1}`} dir="ltr"
                        className="text-[12px] bg-transparent outline-none font-medium" style={{ color: P.text1 }}/>
                      <input value={m.nameHe} onChange={e => updateMilestone(m.id, "nameHe", e.target.value)}
                        placeholder={`אבן דרך ${i + 1}`} dir="rtl"
                        className="text-[12px] bg-transparent outline-none" style={{ color: P.text2 }}/>
                      <input type="date" value={m.date} onChange={e => updateMilestone(m.id, "date", e.target.value)}
                        className="text-[11.5px] px-2 py-1 rounded-lg bg-transparent"
                        style={{ border: `1px solid ${P.border}`, color: P.text2, outline: "none" }}/>
                      <button onClick={() => removeMilestone(m.id)}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: P.text3 }}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ STEP 5: PROCESSING ════ */}
          {step === 5 && (
            <div className="space-y-4">
              {procPhase === 0 && (
                <div className="space-y-4">
                  {/* Summary card */}
                  <div className="rounded-2xl p-5 space-y-3" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                    <p className="text-[13px] font-bold" style={{ color: P.text1 }}>
                      {isHe ? "סיכום הפרויקט" : "Project Summary"}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      {[
                        { l:isHe?"שם":"Name",          v:name||"—" },
                        { l:isHe?"לקוח":"Client",      v:client||"—" },
                        { l:isHe?"סוג":"Type",          v:type },
                        { l:isHe?"שווי חוזה":"Value",  v:contractVal?"₪"+contractVal:"—" },
                        { l:isHe?"התחלה":"Start",       v:startDate||"—" },
                        { l:isHe?"סיום":"End",           v:endDate||"—" },
                      ].map(r => (
                        <div key={r.l} className="flex justify-between gap-2">
                          <span style={{ color: P.text3 }}>{r.l}</span>
                          <span className="font-semibold" style={{ color: P.text1 }}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* File counts */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { en:"Schedule",   he:"לוח זמנים", count:schedFiles.length,    icon:Calendar       },
                      { en:"Contract",   he:"חוזה",      count:contractFiles.length,  icon:FileText       },
                      { en:"BOQ",        he:"כמויות",    count:boqFiles.length,       icon:FileSpreadsheet},
                      { en:"Drawings",   he:"תכניות",    count:drawingFiles.length,   icon:Image          },
                    ].map(f => {
                      const Icon = f.icon;
                      return (
                        <div key={f.en} className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-center"
                          style={{ background: P.bg, border: `1px solid ${f.count>0 ? P.copper+"40" : P.border}` }}>
                          <Icon className="w-4 h-4" style={{ color: f.count>0 ? P.copper : P.text3 }}/>
                          <span className="text-[10.5px] font-bold" style={{ color: f.count>0 ? P.copper : P.text3 }}>
                            {isHe ? f.he : f.en}
                          </span>
                          <span className="text-[13px] font-bold" style={{ color: f.count>0 ? P.text1 : P.text3 }}>
                            {f.count > 0 ? f.count : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={startProcessing}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${P.copper}, #B8762E)`, boxShadow: "0 4px 20px rgba(139,90,43,0.3)" }}>
                    <Cpu className="w-5 h-5"/>
                    {isHe ? "עבד ובנה פרויקט עם AI" : "Process & Build Project with AI"}
                  </button>
                </div>
              )}

              {procPhase > 0 && procPhase < 99 && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: P.copperLight }}>
                      <Cpu className="w-8 h-8 animate-pulse" style={{ color: P.copper }}/>
                    </div>
                    <p className="text-[14px] font-bold" style={{ color: P.copper }}>
                      {isHe ? "AI בונה את הפרויקט…" : "AI is building your project…"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {(isHe ? PROC_STEPS_HE : PROC_STEPS_EN).map((msg, i) => {
                      const done   = i < procPhase - 1;
                      const active = i === procPhase - 1;
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                          style={{ background: active ? P.copperLight : "transparent", border: `1px solid ${active ? P.copper+"30" : "transparent"}` }}>
                          {done
                            ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: P.good }}/>
                            : active
                              ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" style={{ color: P.copper }}/>
                              : <div className="w-4 h-4 rounded-full shrink-0" style={{ border: `1.5px solid ${P.border}` }}/>
                          }
                          <span className="text-[12.5px]" style={{ color: done || active ? P.text1 : P.text3 }}>{msg}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {procPhase === 99 && (
                <div className="flex flex-col items-center gap-5 py-6 text-center">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: P.goodBg, border: `2px solid #BBF7D0` }}>
                    <CheckCircle2 className="w-10 h-10" style={{ color: P.good }}/>
                  </div>
                  <div>
                    <p className="text-[18px] font-bold mb-1" style={{ color: P.text1 }}>
                      {isHe ? "הפרויקט מוכן!" : "Project Ready!"}
                    </p>
                    <p className="text-[13px]" style={{ color: P.text2 }}>
                      {isHe
                        ? `"${name || "הפרויקט"}" הוגדר בהצלחה. כל המודולים אוכלסו.`
                        : `"${name || "Your project"}" has been configured. All modules are populated.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full text-[11.5px]">
                    {[
                      { en:"Dashboard",    he:"לוח בקרה",    icon:"📊", ok:true,                          detail:"" },
                      { en:"Schedule",     he:"לוח זמנים",   icon:"📅", ok:parsedActivities.length>0,    detail: parsedActivities.length>0 ? `${parsedActivities.length} activities` : schedParseError ? "parse error" : schedFiles.length>0 ? "no activities found" : "" },
                      { en:"Finance",      he:"פיננסים",     icon:"💰", ok:!!contractVal,                detail:"" },
                      { en:"Documents",    he:"מסמכים",      icon:"📁", ok:totalFiles>0,                 detail:"" },
                      { en:"Drawings",     he:"תכניות",      icon:"📐", ok:drawingFiles.length>0,        detail:"" },
                      { en:"Milestones",   he:"אבני דרך",    icon:"🏁", ok:milestones.some(m=>m.name),  detail:"" },
                    ].map(m => (
                      <div key={m.en} className="flex flex-col px-3 py-2 rounded-xl"
                        style={{ background: m.ok ? P.goodBg : P.bg, border: `1px solid ${m.ok ? "#BBF7D0" : P.border}` }}>
                        <div className="flex items-center gap-1.5">
                          <span>{m.icon}</span>
                          <span style={{ color: m.ok ? P.good : P.text3 }}>{isHe ? m.he : m.en}</span>
                          {m.ok
                            ? <CheckCircle2 className="w-3 h-3 ms-auto" style={{ color: P.good }}/>
                            : <span className="ms-auto text-[9px] font-bold" style={{ color: P.text3 }}>{isHe?"ריק":"empty"}</span>
                          }
                        </div>
                        {m.detail ? <span className="text-[10px] mt-0.5 font-semibold" style={{ color: m.ok ? P.good : P.warn }}>{m.detail}</span> : null}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const id = `project-${Date.now()}`;
                      addProject({
                        id,
                        name:          name || "New Project",
                        nameHe:        nameHe || name || "פרויקט חדש",
                        type,
                        client,
                        location,
                        contractValue: contractVal,
                        startDate,
                        endDate,
                        pm,
                        createdAt:     new Date().toISOString().slice(0, 10),
                        scheduleFiles:      schedFiles.length,
                        contractFiles:      contractFiles.length,
                        boqFiles:           boqFiles.length,
                        drawingFiles:       drawingFiles.length,
                        milestones:         milestones.filter(m => m.name),
                        scheduleActivities: parsedActivities,
                      });
                      onClose();
                      router.push("/dashboard");
                    }}
                    className="px-8 py-3 rounded-2xl text-[14px] font-bold text-white"
                    style={{ background: P.good, boxShadow: "0 4px 20px rgba(21,128,61,0.25)" }}>
                    {isHe ? "עבור לפרויקט ←" : "Go to Project →"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {procPhase === 0 && (
          <div className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderTop: `1px solid ${P.border}`, background: P.bg }}>
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold"
              style={{ background: P.border, color: P.text2 }}>
              {isHe ? "ביטול" : "Cancel"}
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button onClick={() => setStep(s => (s - 1) as typeof step)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold"
                  style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
                  <ArrowPrev className="w-3.5 h-3.5"/>
                  {isHe ? "חזרה" : "Back"}
                </button>
              )}

              {step < 5 && (() => {
                const advance = () => setStep(s => (s + 1) as typeof step);
                const isUploadStep = step >= 1 && step <= 4;
                const stepHasFiles =
                  (step === 1 && schedFiles.length > 0) ||
                  (step === 2 && (contractFiles.length > 0 || boqFiles.length > 0)) ||
                  (step === 3 && drawingFiles.length > 0) ||
                  (step === 4 && (msFiles.length > 0 || milestones.some(m => m.name)));

                if (isUploadStep && !stepHasFiles) {
                  return (
                    <button onClick={advance}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold"
                      style={{ background: P.bg, border: `1.5px dashed ${P.copper}`, color: P.copper }}>
                      {isHe ? "הוסף מאוחר יותר ←" : "Add later →"}
                    </button>
                  );
                }

                return (
                  <button onClick={advance}
                    disabled={step === 0 && !step0Valid}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
                    style={{ background: P.copper }}>
                    {isHe ? "הבא" : "Next"}
                    <ArrowNext className="w-3.5 h-3.5"/>
                  </button>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
