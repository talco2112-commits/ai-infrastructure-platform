import { cookies } from "next/headers";
import {
  Bell, Search, TrendingDown, TrendingUp, Minus,
  AlertTriangle, AlertCircle, Info, CheckCircle2, Circle,
  Clock, Sun, Cloud, CloudRain, Zap, ChevronRight,
  Banknote, Lightbulb, Satellite, ClipboardCheck,
  RefreshCw, ExternalLink, ArrowUpRight, Layers, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

const P = {
  bg: "#EDE8E1",
  card: "#FAF8F5",
  border: "#EDE8DF",
  copper: "#8B5A2B",
  copperLight: "#F5EBE0",
  copperMid: "#B5855A",
  text1: "#1C1917",
  text2: "#57534E",
  text3: "#A8A29E",
  good: "#15803D",
  goodBg: "#F0FDF4",
  warn: "#B45309",
  warnBg: "#FFFBEB",
  danger: "#B91C1C",
  track: "#E7E0D8",
};

const TRANSLATIONS = {
  en: {
    greeting: "Good morning",
    projectLine: "Week %w of %t",
    aiBrief: "AI Daily Brief",
    aiText: "Schedule is <b>14 days behind</b>, driven by utility relocation in Zone D. You have <b>7 pending approvals</b> worth ₪4.2M and <b>3 overdue RFIs</b>. Rain Monday — concrete pours in Zone B should move to Friday.",
    budget: "Budget Spent",
    budgetSub: "of ₪450M contract",
    schedule: "Schedule",
    scheduleSub: "Week 89 of 156",
    issues: "Open Issues",
    issuesSub: "8 critical · 15 medium",
    approvals: "Pending Approvals",
    approvalsSub: "₪4.2M total value",
    behind: "days behind",
    tasks: "Today's Tasks",
    alerts: "Active Alerts",
    approvalsTitle: "Pending Approvals",
    scheduleTitle: "Schedule Status",
    siteTitle: "Site Progress",
    datumLive: "DatumBIM Live",
    datumRefresh: "Today 07:30",
    datumOpen: "Open DatumBIM",
    datumScan: "Latest drone scan — photogrammetry model",
    datumView: "View 3D model",
    weatherTitle: "Weather Forecast",
    modulesTitle: "Platform Modules",
    planned: "Planned",
    signOut: "Sign out",
    critical: "critical",
    oldest: "Oldest",
    days: "days",
  },
  he: {
    greeting: "בוקר טוב",
    projectLine: "שבוע %w מתוך %t",
    aiBrief: "תדריך יומי AI",
    aiText: "לוח הזמנים באיחור של <b>14 יום</b>, עקב העברת תשתיות באזור D. יש לך <b>7 אישורים ממתינים</b> בסך 4.2M ₪ ו-<b>3 בקשות מידע פגי תוקף</b>. גשם ביום שני — יציקות בטון באזור B יש להעביר ליום שישי.",
    budget: "תקציב מנוצל",
    budgetSub: "מתוך 450M ₪ חוזה",
    schedule: "לוח זמנים",
    scheduleSub: "שבוע 89 מתוך 156",
    issues: "נושאים פתוחים",
    issuesSub: "8 קריטי · 15 בינוני",
    approvals: "ממתינים לאישור",
    approvalsSub: "סך 4.2M ₪",
    behind: "ימי איחור",
    tasks: "משימות היום",
    alerts: "התראות פעילות",
    approvalsTitle: "ממתינים לאישור",
    scheduleTitle: "מצב לוח זמנים",
    siteTitle: "התקדמות אתר",
    datumLive: "DatumBIM חי",
    datumRefresh: "היום 07:30",
    datumOpen: "פתח DatumBIM",
    datumScan: "סריקת רחפן אחרונה — מודל פוטוגרמטרי",
    datumView: "צפה במודל תלת-מימדי",
    weatherTitle: "תחזית מזג אוויר",
    modulesTitle: "מודולי הפלטפורמה",
    planned: "מתוכנן",
    signOut: "התנתק",
    critical: "קריטי",
    oldest: "ישן ביותר",
    days: "ימים",
  },
};

type Lang = "en" | "he";

function Ring({ percent, size = 56, stroke = 5.5, color, trackColor }: {
  percent: number; size?: number; stroke?: number; color?: string; trackColor?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const fill = Math.min(percent / 100, 1) * circ;
  const c = size / 2;
  const fs = size >= 80 ? "text-[15px]" : size >= 56 ? "text-[12px]" : "text-[11px]";
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={trackColor ?? P.track} strokeWidth={stroke} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color ?? P.copper} strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className={cn("relative font-bold", fs)} style={{ color: P.text1 }}>{percent}%</span>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl", className)}
      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
      {children}
    </div>
  );
}

function CardTitle({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-1">
      <h3 className="text-[15px] font-bold" style={{ color: P.text1 }}>{title}</h3>
      {aside}
    </div>
  );
}

function AiInsight({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 pt-4 flex items-start gap-2.5" style={{ borderTop: `1px solid ${P.border}` }}>
      <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: P.copperLight }}>
        <Lightbulb className="w-3 h-3" style={{ color: P.copper }} />
      </div>
      <p className="text-[12.5px] font-medium leading-relaxed" style={{ color: P.copper }}>{children}</p>
    </div>
  );
}

type Status = "good" | "warning" | "danger";
const barColor: Record<Status, string> = { good: "#15803D", warning: "#D97706", danger: "#DC2626" };
const alertStyle = {
  critical: { bg: "#FEF2F2", border: "#FECACA", tc: "#991B1B" },
  warning:  { bg: "#FFFBEB", border: "#FDE68A", tc: "#92400E" },
  info:     { bg: "#F0F9FF", border: "#BAE6FD", tc: "#075985" },
};
const tagStyle: Record<string, { bg: string; color: string }> = {
  Design:  { bg: "#EDE9FF", color: "#5B21B6" },
  Finance: { bg: "#EFF6FF", color: "#1D4ED8" },
  Site:    { bg: "#F0FDF4", color: "#15803D" },
  RFI:     { bg: "#FFFBEB", color: "#B45309" },
  Reports: { bg: "#F5F5F4", color: "#57534E" },
  Meeting: { bg: "#EFF6FF", color: "#3730A3" },
};
const tagHe: Record<string, string> = {
  Design: "תכנון", Finance: "פיננסים", Site: "אתר",
  RFI: "בקשת מידע", Reports: "דוחות", Meeting: "פגישה",
};

const tasks = [
  { id: 1, text: "Review structural drawings Rev.C – Bridge 3", textHe: "סקירת תוכניות קונסטרוקציה Rev.C – גשר 3", done: false, urgent: true,  tag: "Design"  },
  { id: 2, text: "Approve 4 supplier invoices (₪2.3M)",         textHe: "אישור 4 חשבוניות ספקים (2.3M ₪)",    done: false, urgent: true,  tag: "Finance" },
  { id: 3, text: "Morning site walkthrough – Zone B",            textHe: "סיור בוקר באתר – אזור B",            done: true,  urgent: false, tag: "Site"    },
  { id: 4, text: "RFI response – Electrical conduit routing",    textHe: "תשובה לבקשת מידע – ניתוב צנרת חשמל", done: false, urgent: false, tag: "RFI"     },
  { id: 5, text: "Submit weekly progress report",                textHe: "הגשת דוח התקדמות שבועי",             done: false, urgent: true,  tag: "Reports" },
  { id: 6, text: "Design coordination meeting – 14:00",          textHe: "פגישת תיאום תכנון – 14:00",           done: false, urgent: false, tag: "Meeting" },
];

const approvalItems = [
  { id: 1, title: "Steel supplier – Invoice #4821",       titleHe: "ספק פלדה – חשבונית 4821",      amount: "₪1,200,000", age: "5d", ageHe: "5י", urgent: true  },
  { id: 2, title: "Subcontractor – Excavation works",     titleHe: "קבלן משנה – עבודות עפר",        amount: "₪890,000",   age: "3d", ageHe: "3י", urgent: false },
  { id: 3, title: "Material procurement – Rebar",         titleHe: "רכש חומרים – ברזל",             amount: "₪650,000",   age: "2d", ageHe: "2י", urgent: false },
  { id: 4, title: "Change order #18 – Utility relocation",titleHe: "פקודת שינוי 18 – העברת תשתיות", amount: "₪340,000",   age: "1d", ageHe: "1י", urgent: false },
];

const scheduleItems: { name: string; nameHe: string; percent: number; status: Status; delta: string; deltaHe: string }[] = [
  { name: "Earthworks – Zone C",       nameHe: "עבודות עפר – אזור C",  percent: 85, status: "good",    delta: "",           deltaHe: ""          },
  { name: "Pile foundations",          nameHe: "יסודות קידוח",          percent: 72, status: "warning", delta: "2d delay",   deltaHe: "2י עיכוב"  },
  { name: "Bridge deck formwork",      nameHe: "שיפוע גשר – קינוף",     percent: 45, status: "good",    delta: "",           deltaHe: ""          },
  { name: "Utility relocation",        nameHe: "העברת תשתיות",          percent: 23, status: "danger",  delta: "14d behind", deltaHe: "14י איחור" },
  { name: "Road base layer – Sec. A",  nameHe: "שכבת בסיס – קטע A",    percent: 61, status: "good",    delta: "",           deltaHe: ""          },
];

const alerts: { level: "critical"|"warning"|"info"; title: string; titleHe: string; desc: string; descHe: string }[] = [
  { level: "critical", title: "Utility relocation 14 days behind",   titleHe: "העברת תשתיות – 14 יום איחור",      desc: "Blocking Bridge 68 handover",         descHe: "חוסם מסירת גשר 68 – יש להסלים מיידית" },
  { level: "warning",  title: "3 RFIs unanswered over 7 days",       titleHe: "3 בקשות מידע ללא מענה מעל 7 ימים", desc: "Electrical, structural, drainage",      descHe: "חשמל, קונסטרוקציה, ניקוז ממתינים" },
  { level: "warning",  title: "Concrete supplier delivery at risk",   titleHe: "אספקת בטון בסיכון",                desc: "Shortage expected next week",           descHe: "מחסור צפוי השבוע הבא – יש לתאם חלופות" },
  { level: "info",     title: "AI Weekly Report ready",              titleHe: "דוח AI שבועי מוכן",                desc: "Automated insights for Week 89",       descHe: "תובנות אוטומטיות לשבוע 89" },
];

const datubimZones = [
  { name: "Zone A", nameHe: "אזור A", label: "Earthworks",  labelHe: "עבודות עפר", scanned: 89, planned: 85, delta: +4 },
  { name: "Zone B", nameHe: "אזור B", label: "Foundations", labelHe: "יסודות",     scanned: 74, planned: 79, delta: -5 },
  { name: "Zone C", nameHe: "אזור C", label: "Structures",  labelHe: "קונסטרוקציה",scanned: 52, planned: 55, delta: -3 },
  { name: "Zone D", nameHe: "אזור D", label: "Finishes",    labelHe: "גמרים",      scanned: 18, planned: 22, delta: -4 },
];

const weatherDays: { day: string; dayHe: string; icon: "sun"|"cloud"|"rain"; temp: string; label: string; labelHe: string; risk?: string; riskHe?: string }[] = [
  { day: "Today",    dayHe: "היום",    icon: "sun",   temp: "31°", label: "Clear",          labelHe: "בהיר"        },
  { day: "Saturday", dayHe: "שבת",     icon: "sun",   temp: "33°", label: "Clear",          labelHe: "בהיר"        },
  { day: "Sunday",   dayHe: "ראשון",   icon: "cloud", temp: "28°", label: "Partly cloudy",  labelHe: "מעונן חלקית" },
  { day: "Monday",   dayHe: "שני",     icon: "rain",  temp: "22°", label: "Rain", labelHe: "גשם", risk: "Concrete pour risk", riskHe: "סיכון ליציקת בטון" },
];

const modules = [
  { labelEn: "Documents", labelHe: "מסמכים",    sub: "124 files · 3 new",         subHe: "124 קבצים · 3 חדשים",     icon: Layers,        bg: "#EDE9FF", color: "#5B21B6", alert: false },
  { labelEn: "Design",    labelHe: "תכנון",      sub: "2 drawing inconsistencies", subHe: "2 אי-התאמות בתוכניות",   icon: Pencil,        bg: "#EDE9FF", color: "#4338CA", alert: true  },
  { labelEn: "Schedule",  labelHe: "לוח זמנים",  sub: "14d behind critical path",  subHe: "14י מאחורי נתיב קריטי",  icon: Clock,         bg: "#FFFBEB", color: "#B45309", alert: true  },
  { labelEn: "Finance",   labelHe: "פיננסים",    sub: "₪312M of ₪450M",           subHe: "312M ₪ מתוך 450M ₪",     icon: Banknote,      bg: "#F5EBE0", color: "#8B5A2B", alert: false },
  { labelEn: "RFIs",      labelHe: "בקשות מידע", sub: "3 overdue · 8 open",        subHe: "3 פגי תוקף · 8 פתוחים",  icon: AlertTriangle, bg: "#FEF2F2", color: "#B91C1C", alert: true  },
  { labelEn: "Quality",   labelHe: "איכות",      sub: "6 open NCRs",               subHe: "6 אי-התאמות פתוחות",      icon: ClipboardCheck,bg: "#F0FDF4", color: "#15803D", alert: false },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as Lang;
  const t = TRANSLATIONS[lang];
  const isHe = lang === "he";

  return (
    <div className="min-h-full" style={{ background: P.bg }}>

      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-20 h-[60px] px-7 flex items-center gap-5"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}`, boxShadow: "0 1px 0 rgba(28,25,23,0.06)" }}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: P.text3, [isHe ? "right" : "left"]: "14px" }} />
          <input
            placeholder={isHe ? "חיפוש פרויקטים, מסמכים, בקשות מידע…" : "Search projects, documents, RFIs…"}
            readOnly
            className="w-full py-2 text-[14px] rounded-xl border-0 outline-none"
            style={{
              background: P.bg, color: P.text1,
              paddingInlineStart: "40px", paddingInlineEnd: "16px",
            }}
          />
        </div>
        <div className="flex items-center gap-4 ms-auto">
          <span className="text-[13px] font-medium hidden md:block" style={{ color: P.text3 }}>
            {isHe ? "יום שישי, 27 יוני 2026" : "Friday, 27 June 2026"}
          </span>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl" style={{ color: P.text2 }}>
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold" style={{ background: P.copper }}>DC</div>
            <div className="hidden md:block">
              <p className="text-[13px] font-semibold leading-tight" style={{ color: P.text1 }}>David Cohen</p>
              <p className="text-[12px]" style={{ color: P.text3 }}>{isHe ? "מנהל פרויקט" : "Project Manager"}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-7 py-6 space-y-6 max-w-[1440px] mx-auto pb-28">

        {/* ── Greeting + AI Brief ─────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight leading-tight" style={{ color: P.text1 }}>
              {t.greeting}, David
            </h1>
            <p className="text-[15px] font-medium mt-1" style={{ color: P.text2 }}>
              {isHe ? "כביש 20 – הרחבה צפונית · " : "Highway 20 – Northern Extension · "}
              {t.projectLine.replace("%w", "89").replace("%t", "156")}
            </p>
          </div>
          <div className="flex-1 max-w-3xl lg:ms-auto">
            <div className="flex items-start gap-4 rounded-2xl px-6 py-4"
              style={{ background: `linear-gradient(135deg, ${P.copper}, #6B3E18)`, boxShadow: "0 4px 20px rgba(139,90,43,0.25)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>{t.aiBrief}</p>
                <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}
                  dangerouslySetInnerHTML={{ __html: t.aiText.replace(/<b>/g, '<strong class="text-white">').replace(/<\/b>/g, '</strong>') }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── KPIs ────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Budget — ring inside card */}
          <Card className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: P.text3 }}>{t.budget}</p>
            <div className="flex items-center gap-4">
              <Ring percent={69} size={84} stroke={12} color="#15803D" trackColor="#EEEAE5" />
              <div className="min-w-0">
                <p className="text-[26px] font-bold leading-none" style={{ color: P.text1 }}>₪312M</p>
                <p className="text-[12px] mt-1.5 leading-snug" style={{ color: P.text3 }}>{t.budgetSub}</p>
                <div className="flex items-center gap-1 mt-2.5 text-[12px] font-semibold" style={{ color: "#15803D" }}>
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  {isHe ? "+18M ₪ החודש" : "+₪18M this month"}
                </div>
              </div>
            </div>
          </Card>

          {/* Schedule — ring inside card */}
          <Card className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: P.text3 }}>{t.schedule}</p>
            <div className="flex items-center gap-4">
              <Ring percent={57} size={84} stroke={12} color="#D97706" trackColor="#EEEAE5" />
              <div className="min-w-0">
                <p className="text-[26px] font-bold leading-none" style={{ color: P.text1 }}>57%</p>
                <p className="text-[12px] mt-1.5 leading-snug" style={{ color: P.text3 }}>{t.scheduleSub}</p>
                <div className="flex items-center gap-1 mt-2.5 text-[12px] font-semibold" style={{ color: "#B45309" }}>
                  <TrendingDown className="w-3 h-3 shrink-0" />
                  {isHe ? "14 ימי איחור" : "14 days behind"}
                </div>
              </div>
            </div>
          </Card>

          {/* Open Issues — plain number */}
          <Card className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text3 }}>{t.issues}</p>
              <span className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ background: P.danger }} />
            </div>
            <p className="text-[42px] font-bold leading-none tracking-tight" style={{ color: P.text1 }}>23</p>
            <p className="text-[12px] mt-2" style={{ color: P.text3 }}>{t.issuesSub}</p>
            <div className="flex items-center gap-1 mt-3 text-[12px] font-semibold" style={{ color: P.danger }}>
              <TrendingUp className="w-3 h-3 shrink-0" />
              {isHe ? "+4 השבוע" : "+4 this week"}
            </div>
          </Card>

          {/* Pending Approvals — plain number */}
          <Card className="p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text3 }}>{t.approvals}</p>
              <span className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ background: P.warn }} />
            </div>
            <p className="text-[42px] font-bold leading-none tracking-tight" style={{ color: P.text1 }}>7</p>
            <p className="text-[12px] mt-2" style={{ color: P.text3 }}>{t.approvalsSub}</p>
            <div className="flex items-center gap-1 mt-3 text-[12px] font-semibold" style={{ color: P.warn }}>
              <Minus className="w-3 h-3 shrink-0" />
              {isHe ? "ישן ביותר: 5 ימים" : "Oldest: 5 days"}
            </div>
          </Card>
        </div>

        {/* ── Row 2 ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Tasks */}
          <Card>
            <CardTitle
              title={t.tasks}
              aside={<span className="text-[13px] font-bold" style={{ color: P.text3 }}>{tasks.filter(t => !t.done).length}/{tasks.length}</span>}
            />
            <div className="px-3 pb-5 pt-3 space-y-0.5">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ opacity: task.done ? 0.45 : 1 }}>
                  <div className="shrink-0">
                    {task.done
                      ? <CheckCircle2 className="w-[18px] h-[18px]" style={{ color: P.good }} />
                      : <Circle       className="w-[18px] h-[18px]" style={{ color: P.track }} />}
                  </div>
                  <p className="flex-1 text-[13.5px] font-medium leading-snug"
                    style={{ color: task.done ? P.text3 : P.text1, textDecoration: task.done ? "line-through" : "none" }}>
                    {isHe ? task.textHe : task.text}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.urgent && !task.done && <span className="w-2 h-2 rounded-full bg-red-500" />}
                    {tagStyle[task.tag] && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                        style={{ background: tagStyle[task.tag].bg, color: tagStyle[task.tag].color }}>
                        {isHe ? tagHe[task.tag] : task.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Alerts */}
          <Card>
            <CardTitle
              title={t.alerts}
              aside={
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-red-700 px-2.5 py-1 rounded-lg" style={{ background: "#FEF2F2" }}>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />2 {t.critical}
                </span>
              }
            />
            <div className="px-5 pb-5 pt-3 space-y-2">
              {alerts.map((alert, i) => {
                const s = alertStyle[alert.level];
                return (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <div className="shrink-0 mt-0.5">
                      {alert.level === "critical" && <AlertCircle   className="w-[18px] h-[18px] text-red-500" />}
                      {alert.level === "warning"  && <AlertTriangle className="w-[18px] h-[18px] text-amber-500" />}
                      {alert.level === "info"     && <Info          className="w-[18px] h-[18px] text-sky-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold leading-snug" style={{ color: s.tc }}>{isHe ? alert.titleHe : alert.title}</p>
                      <p className="text-[12px] mt-0.5 leading-snug" style={{ color: P.text2 }}>{isHe ? alert.descHe : alert.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: P.text3 }} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Approvals */}
          <Card>
            <CardTitle title={t.approvalsTitle} aside={<span className="text-[14px] font-bold" style={{ color: P.text3 }}>₪4.2M</span>} />
            <div className="px-5 pb-5 pt-3 space-y-1.5">
              {approvalItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3.5 rounded-xl">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: P.copperLight }}>
                    <Banknote className="w-4 h-4" style={{ color: P.copper }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: P.text1 }}>{isHe ? item.titleHe : item.title}</p>
                    <p className="text-[12px] mt-0.5 font-medium" style={{ color: P.text3 }}>{item.amount}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.urgent && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "#FEF2F2", color: P.danger }}>
                        {isHe ? "דחוף" : "URGENT"}
                      </span>
                    )}
                    <span className="text-[12px] font-medium" style={{ color: P.text3 }}>{isHe ? item.ageHe : item.age}</span>
                  </div>
                </div>
              ))}
              <AiInsight>
                {isHe
                  ? "חשבונית 4821 מציינת כמויות פלדה גבוהות ב-12% מכמויות החוזה. יש לאמת לפני אישור."
                  : "Invoice #4821 references steel quantities 12% above contract BoQ. Verify before approving."}
              </AiInsight>
            </div>
          </Card>
        </div>

        {/* ── Row 3 ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Schedule */}
          <Card className="lg:col-span-2">
            <CardTitle
              title={t.scheduleTitle}
              aside={
                <span className="flex items-center gap-1.5 text-[13px] font-bold px-3 py-1 rounded-lg" style={{ background: P.warnBg, color: P.warn }}>
                  <Clock className="w-3.5 h-3.5" />14{isHe ? "י" : "d"} {isHe ? "איחור" : "behind"}
                </span>
              }
            />
            <div className="px-6 pb-6 pt-4 space-y-4">
              {scheduleItems.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <Ring percent={item.percent} size={44} stroke={4.5} color={barColor[item.status]} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[13px] font-semibold truncate" style={{ color: P.text1 }}>{isHe ? item.nameHe : item.name}</p>
                      {item.delta && (
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg ms-2 shrink-0"
                          style={{ background: item.status === "danger" ? "#FEF2F2" : P.warnBg, color: item.status === "danger" ? P.danger : P.warn }}>
                          {isHe ? item.deltaHe : item.delta}
                        </span>
                      )}
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ background: P.track }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${item.percent}%`, background: barColor[item.status] }} />
                    </div>
                  </div>
                </div>
              ))}
              <AiInsight>
                {isHe
                  ? "הזזת יסודות הקידוח לפני העברת התשתיות עשויה לחסוך 8 ימים בנתיב הקריטי."
                  : "Moving pile foundations before utility relocation could recover 8 days on the critical path."}
              </AiInsight>
            </div>
          </Card>

          {/* DatumBIM */}
          <Card className="lg:col-span-3">
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-[15px] font-bold" style={{ color: P.text1 }}>{t.siteTitle}</h3>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: P.goodBg, color: P.good, border: "1px solid #BBF7D0" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: P.good }} />
                    {t.datumLive}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-medium flex items-center gap-1" style={{ color: P.text3 }}>
                    <RefreshCw className="w-3 h-3" />{t.datumRefresh}
                  </span>
                  <button className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: P.copper }}>
                    {t.datumOpen} <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mx-6 mt-4 h-24 rounded-xl flex items-center justify-center relative overflow-hidden" style={{ background: "#1A1512" }}>
              <div className="absolute inset-0 opacity-25" style={{
                backgroundImage: "radial-gradient(ellipse at 30% 60%, #8B5A2B 0%, transparent 55%), radial-gradient(ellipse at 75% 30%, #15803D 0%, transparent 45%)"
              }} />
              <div className="text-center relative z-10">
                <Satellite className="w-6 h-6 mx-auto mb-1.5" style={{ color: "#78716C" }} />
                <p className="text-[12px] font-medium" style={{ color: "#78716C" }}>{t.datumScan}</p>
                <button className="mt-1 text-[12px] font-bold flex items-center gap-1 mx-auto" style={{ color: P.copperMid }}>
                  {t.datumView} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 gap-3">
              {datubimZones.map((zone) => (
                <div key={zone.name} className="p-4 rounded-xl flex items-center gap-4"
                  style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                  <Ring percent={zone.scanned} size={64} stroke={6} color={zone.delta >= 0 ? P.good : P.danger} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-[12px] font-bold" style={{ color: P.text1 }}>{isHe ? zone.nameHe : zone.name}</p>
                        <p className="text-[11px]" style={{ color: P.text3 }}>{isHe ? zone.labelHe : zone.label}</p>
                      </div>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg"
                        style={{ background: zone.delta >= 0 ? P.goodBg : "#FEF2F2", color: zone.delta >= 0 ? P.good : P.danger }}>
                        {zone.delta > 0 ? `+${zone.delta}%` : `${zone.delta}%`}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium" style={{ color: P.text3 }}>{t.planned}: {zone.planned}%</p>
                    <div className="mt-1.5 w-full rounded-full h-1" style={{ background: P.track }}>
                      <div className="h-1 rounded-full opacity-40" style={{ width: `${zone.planned}%`, background: P.text3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <AiInsight>
                {isHe
                  ? "אזור B נמוך ב-5% מתחזית המודל. צילומי הרחפן מראים שהקינוף טרם הוסר."
                  : "Zone B is 5% below model prediction. Drone imagery shows foundation formwork not yet stripped."}
              </AiInsight>
            </div>
          </Card>
        </div>

        {/* ── Row 4 ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* Weather */}
          <Card>
            <CardTitle title={t.weatherTitle} />
            <div className="px-5 pb-5 pt-3 space-y-1.5">
              {weatherDays.map((w) => (
                <div key={w.day} className="flex items-center gap-3 px-3 py-3 rounded-xl"
                  style={{ background: w.icon === "rain" ? "#EFF6FF" : "transparent", border: w.icon === "rain" ? "1px solid #BFDBFE" : "1px solid transparent" }}>
                  {w.icon === "sun"   && <Sun       className="w-6 h-6 text-amber-400" />}
                  {w.icon === "rain"  && <CloudRain  className="w-6 h-6 text-blue-400" />}
                  {w.icon === "cloud" && <Cloud      className="w-6 h-6 text-slate-400" />}
                  <div className="flex-1">
                    <p className="text-[14px] font-bold" style={{ color: P.text1 }}>{isHe ? w.dayHe : w.day}</p>
                    <p className="text-[12px] font-medium" style={{ color: P.text3 }}>{isHe ? w.labelHe : w.label}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-[16px] font-bold" style={{ color: P.text1 }}>{w.temp}</p>
                    {w.risk && <p className="text-[11px] font-bold text-blue-600">{isHe ? w.riskHe : w.risk}</p>}
                  </div>
                </div>
              ))}
              <AiInsight>
                {isHe
                  ? "גשם ביום שני מעצור יציקת בטון באזור B. יש להקדים ליום שישי."
                  : "Rain Monday halts Zone B concrete. Pull forward to Friday to stay on schedule."}
              </AiInsight>
            </div>
          </Card>

          {/* Modules */}
          <Card className="lg:col-span-3">
            <CardTitle title={t.modulesTitle} />
            <div className="px-5 pb-5 pt-3 grid grid-cols-3 gap-3">
              {modules.map((mod) => (
                <button key={mod.labelEn} className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                  style={{ border: `1px solid ${P.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: mod.bg }}>
                    <mod.icon className="w-[18px] h-[18px]" style={{ color: mod.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[14px] font-bold" style={{ color: P.text1 }}>{isHe ? mod.labelHe : mod.labelEn}</p>
                      {mod.alert && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                    </div>
                    <p className="text-[12px] font-medium mt-0.5 truncate" style={{ color: P.text3 }}>{isHe ? mod.subHe : mod.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 mt-1 shrink-0" style={{ color: P.text3 }} />
                </button>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
