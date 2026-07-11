"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTeam } from "@/contexts/TeamContext";
import { Bell, Search, Plus, Lightbulb, Trash2, TrendingUp, TrendingDown, Send } from "lucide-react";
import { QuickAddModal } from "@/components/QuickAddModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SendToWorkerModal } from "@/components/SendToWorkerModal";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  track: "#E7E0D8",
};

const TRANSLATIONS = {
  en: {
    title: "Goals",
    newGoal: "New Goal",
    searchPlaceholder: "Search goals...",
    kpis: ["Active Goals", "Achieved", "At Risk", "Avg Progress"],
    aiLabel: "AI Team Insight",
    aiText: "Goals built around recurring team habits (daily safety huddles, weekly toolbox talks) have a 100% success rate this quarter. Goals depending on a single external approval step (RFI response time) are the most likely to miss deadline — assign a backup approver before setting similar goals next quarter.",
    goalsTitle: "Team Goals",
    lessonsTitle: "Lessons Learned",
    colGoal: "Goal",
    colCategory: "Category",
    colAssignee: "Assignee",
    colProgress: "Progress",
    colDeadline: "Deadline",
    colStatus: "Status",
    noGoals: "No goals set yet",
    noLessons: "No lessons recorded yet — they appear here once a goal is Achieved or Missed",
    statusLabels: { "ON TRACK": "On Track", "AT RISK": "At Risk", ACHIEVED: "Achieved", MISSED: "Missed" },
    categoryLabels: { Safety: "Safety", Quality: "Quality", Schedule: "Schedule", Productivity: "Productivity", Training: "Training" },
    sendToWorker: "Send to worker",
    notSent: "Not sent",
    sentAt: "Sent",
  },
  he: {
    title: "יעדים",
    newGoal: "יעד חדש",
    searchPlaceholder: "חיפוש יעדים...",
    kpis: ["יעדים פעילים", "הושגו", "בסיכון", "התקדמות ממוצעת"],
    aiLabel: "תובנת צוות AI",
    aiText: "יעדים המבוססים על הרגלי צוות חוזרים (תדריכי בטיחות יומיים, שיחות כלים שבועיות) מגיעים ל-100% הצלחה הרבעון. יעדים התלויים בשלב אישור חיצוני בודד (זמן תגובה לבקשות מידע) הם הסיכוי הגבוה ביותר לפספס יעד — מנה מאשר גיבוי לפני קביעת יעדים דומים ברבעון הבא.",
    goalsTitle: "יעדי הצוות",
    lessonsTitle: "לקחים שנלמדו",
    colGoal: "יעד",
    colCategory: "קטגוריה",
    colAssignee: "אחראי",
    colProgress: "התקדמות",
    colDeadline: "תאריך יעד",
    colStatus: "סטטוס",
    noGoals: "לא הוגדרו יעדים עדיין",
    noLessons: "לא נרשמו לקחים עדיין — הם יופיעו כאן ברגע שיעד יושג או יפוספס",
    statusLabels: { "ON TRACK": "בתוכנית", "AT RISK": "בסיכון", ACHIEVED: "הושג", MISSED: "פוספס" },
    categoryLabels: { Safety: "בטיחות", Quality: "איכות", Schedule: "לוח זמנים", Productivity: "פרודוקטיביות", Training: "הכשרה" },
    sendToWorker: "שלח לעובד",
    notSent: "לא נשלח",
    sentAt: "נשלח",
  },
};

type Category = "Safety" | "Quality" | "Schedule" | "Productivity" | "Training";
type Status = "ON TRACK" | "AT RISK" | "ACHIEVED" | "MISSED";

interface Goal {
  id: string; title: string; titleHe: string; category: Category;
  assignee: string; progress: number; deadline: string; status: Status;
  lesson?: string; lessonHe?: string;
  workerId?: string; sentAt?: string;
}

const DEMO_GOALS: Goal[] = [
  { id:"G-01", title:"Reduce safety near-misses by 30%",            titleHe:"הפחתת כמעט-תאונות ב-30%",              category:"Safety",       assignee:"S.O. Ben-Ami",     progress:65,  deadline:"2026-08-15", status:"ON TRACK" },
  { id:"G-02", title:"Achieve zero NCRs on concrete pours",          titleHe:"אפס אי-התאמות ביציקות בטון",           category:"Quality",      assignee:"QC Eng. Avraham",  progress:40,  deadline:"2026-07-31", status:"AT RISK"  },
  { id:"G-03", title:"Recover 8 days on critical path (Zone D)",     titleHe:"שחזור 8 ימים בנתיב הקריטי (אזור D)",  category:"Schedule",     assignee:"Eng. Mizrahi",     progress:20,  deadline:"2026-07-20", status:"AT RISK"  },
  { id:"G-04", title:"Raise subcontractor performance score to 90%",titleHe:"העלאת ציון ביצוע קבלני משנה ל-90%",   category:"Productivity", assignee:"David Cohen",      progress:82,  deadline:"2026-09-30", status:"ON TRACK" },
  { id:"G-05", title:"100% toolbox talk attendance",                 titleHe:"100% נוכחות בשיחות כלים",              category:"Training",     assignee:"Foreman Peretz",   progress:100, deadline:"2026-06-15", status:"ACHIEVED",
    lesson:"Weekly reminders + sign-in on site tablet worked well — replicate the format for Zone D crews.",
    lessonHe:"תזכורות שבועיות + חתימה בטאבלט באתר עבדו היטב — לשכפל את הפורמט לצוותי אזור D." },
  { id:"G-06", title:"Cut rework costs by 15%",                      titleHe:"הפחתת עלויות עבודה חוזרת ב-15%",       category:"Productivity", assignee:"Eng. Cohen",       progress:55,  deadline:"2026-08-31", status:"ON TRACK" },
  { id:"G-07", title:"Zero lost-time injuries this quarter",         titleHe:"אפס תאונות עם ימי היעדרות הרבעון",     category:"Safety",       assignee:"Site Safety Office",progress:100, deadline:"2026-06-30", status:"ACHIEVED",
    lesson:"Daily pre-shift safety huddles dropped incidents to zero — keep running them company-wide.",
    lessonHe:"תדריכי בטיחות יומיים לפני משמרת הורידו תאונות לאפס — להמשיך להריץ בכל האתרים." },
  { id:"G-08", title:"Cut RFI response time to under 5 days",        titleHe:"קיצור זמן תגובה לבקשות מידע ל-5 ימים",category:"Quality",      assignee:"Eng. Shapira",     progress:30,  deadline:"2026-05-31", status:"MISSED",
    lesson:"Bottleneck was the structural engineer approval queue — assign a backup approver next quarter.",
    lessonHe:"הצוואר בקבוק היה תור אישור מהנדס הקונסטרוקציה — למנות מאשר גיבוי ברבעון הבא." },
];

const statusStyle: Record<Status, { bg: string; color: string }> = {
  "ON TRACK": { bg: "#EFF6FF",  color: "#1D4ED8" },
  "AT RISK":  { bg: P.warnBg,   color: P.warn    },
  ACHIEVED:   { bg: P.goodBg,   color: P.good    },
  MISSED:     { bg: P.dangerBg, color: P.danger  },
};
const categoryColor: Record<Category, string> = {
  Safety: P.danger, Quality: "#0891B2", Schedule: P.warn, Productivity: "#7C3AED", Training: "#15803D",
};

export default function GoalsPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";
  const { isHe } = useLanguage();
  const { workers } = useTeam();
  const T = TRANSLATIONS[isHe ? "he" : "en"];

  const [goals, setGoals] = useState<Goal[]>(isDemo ? DEMO_GOALS : []);
  const [showModal, setShowModal] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [sendIdx, setSendIdx] = useState<number | null>(null);
  useEffect(() => { setGoals(isDemo ? DEMO_GOALS : []); }, [isDemo]);

  const activeCount   = goals.filter(g => g.status === "ON TRACK" || g.status === "AT RISK").length;
  const achievedCount = goals.filter(g => g.status === "ACHIEVED").length;
  const atRiskCount   = goals.filter(g => g.status === "AT RISK").length;
  const avgProgress   = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;
  const kpiVals   = [String(activeCount), String(achievedCount), String(atRiskCount), `${avgProgress}%`];
  const kpiColors = [P.copper, P.good, P.warn, "#1D4ED8"];

  const lessons = goals.filter(g => g.status === "ACHIEVED" || g.status === "MISSED");

  function addGoal(values: Record<string, string>) {
    const id = `G-${String(goals.length + 1).padStart(2, "0")}`;
    const worker = workers.find(w => w.id === values.assignee);
    setGoals(prev => [{
      id, title: values.title || "", titleHe: values.title || "",
      category: (values.category as Category) || "Productivity",
      assignee: worker ? worker.name : "",
      progress: 0,
      deadline: values.deadline || "",
      status: "ON TRACK" as Status,
      workerId: worker?.id,
      sentAt: worker ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    }, ...prev]);
    setShowModal(false);
  }

  function confirmDelete() {
    if (deleteIdx === null) return;
    setGoals(prev => prev.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  }

  function sendGoal(idx: number, workerId: string) {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;
    setGoals(prev => prev.map((g, i) => i === idx
      ? { ...g, assignee: worker.name, workerId: worker.id, sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      : g));
    setSendIdx(null);
  }

  function fmtDate(d: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(isHe ? "he-IL" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px]"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Search className="w-3.5 h-3.5" style={{ color: P.text3 }} />
            <span style={{ color: P.text3 }}>{T.searchPlaceholder}</span>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.newGoal}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {T.kpis.map((label, i) => (
            <div key={label} className="rounded-2xl p-4 text-center"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[26px] font-bold" style={{ color: kpiColors[i] }}>{kpiVals[i]}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: P.text3 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* AI insight */}
        {isDemo && (
          <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
            style={{ background: P.warnBg, border: `1px solid #FDE68A` }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
              <Lightbulb className="w-3.5 h-3.5" style={{ color: P.warn }} />
            </div>
            <div>
              <p className="text-[12px] font-bold mb-0.5" style={{ color: P.warn }}>{T.aiLabel}</p>
              <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.aiText}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-5">

          {/* Goals table */}
          <div className="col-span-2 rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.goalsTitle}</h3>
            </div>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colGoal, T.colCategory, T.colAssignee, T.colProgress, T.colDeadline, T.colStatus, ""].map(h => (
                    <th key={h} className="px-4 py-2.5 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {goals.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px]" style={{ color: P.text3 }}>
                    {T.noGoals}
                  </td></tr>
                )}
                {goals.map((g, i) => {
                  const s = statusStyle[g.status];
                  return (
                    <tr key={g.id} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td className="px-4 py-2.5 max-w-[220px]">
                        <p className="font-medium leading-snug" style={{ color: P.text1 }}>{isHe ? g.titleHe : g.title}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ background: categoryColor[g.category] }}>
                          {T.categoryLabels[g.category]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button onClick={() => setSendIdx(i)}
                          className="flex flex-col items-start transition-colors"
                          title={T.sendToWorker}>
                          <span style={{ color: g.assignee ? P.text2 : P.text3 }}>{g.assignee || T.notSent}</span>
                          {g.sentAt ? (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: P.good }}>
                              <Send className="w-2.5 h-2.5" /> {T.sentAt} {g.sentAt}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px]" style={{ color: P.copper }}>
                              <Send className="w-2.5 h-2.5" /> {T.sendToWorker}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full" style={{ background: P.track }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${g.progress}%`, background: s.color }} />
                          </div>
                          <span className="text-[11px] font-bold" style={{ color: s.color }}>{g.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-[11px]" style={{ color: P.text3 }}>{fmtDate(g.deadline)}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                          {T.statusLabels[g.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => setDeleteIdx(i)} className="p-1 rounded-lg transition-colors hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" style={{ color: P.danger }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Lessons Learned */}
          <div className="rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold mb-3" style={{ color: P.text1 }}>{T.lessonsTitle}</h3>
            <div className="flex flex-col gap-3">
              {lessons.length === 0 && (
                <p className="text-[12px] text-center py-6" style={{ color: P.text3 }}>{T.noLessons}</p>
              )}
              {lessons.map(g => {
                const win = g.status === "ACHIEVED";
                return (
                  <div key={g.id} className="p-3 rounded-xl" style={{ background: win ? P.goodBg : P.dangerBg }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {win ? <TrendingUp className="w-3.5 h-3.5" style={{ color: P.good }} /> : <TrendingDown className="w-3.5 h-3.5" style={{ color: P.danger }} />}
                      <span className="text-[11.5px] font-bold" style={{ color: win ? P.good : P.danger }}>
                        {isHe ? g.titleHe : g.title}
                      </span>
                    </div>
                    <p className="text-[11.5px] leading-snug" style={{ color: P.text2 }}>
                      {isHe ? g.lessonHe : g.lesson}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {deleteIdx !== null && (
        <ConfirmDialog
          isHe={isHe}
          message={`Delete goal "${goals[deleteIdx]?.title}"? This cannot be undone.`}
          messageHe={`למחוק את היעד "${goals[deleteIdx]?.titleHe}"? לא ניתן לשחזר פעולה זו.`}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={confirmDelete}
        />
      )}

      {showModal && (
        <QuickAddModal
          isHe={isHe}
          title="New Goal" titleHe="יעד חדש"
          onClose={() => setShowModal(false)}
          onSave={addGoal}
          fields={[
            { key: "title", label: "Goal", labelHe: "יעד", type: "text", required: true },
            { key: "category", label: "Category", labelHe: "קטגוריה", type: "select", options: [
              { value: "Safety", label: "Safety", labelHe: "בטיחות" },
              { value: "Quality", label: "Quality", labelHe: "איכות" },
              { value: "Schedule", label: "Schedule", labelHe: "לוח זמנים" },
              { value: "Productivity", label: "Productivity", labelHe: "פרודוקטיביות" },
              { value: "Training", label: "Training", labelHe: "הכשרה" },
            ]},
            { key: "assignee", label: "Assignee (sends immediately)", labelHe: "אחראי (נשלח מיידית)", type: "select", options: workers.map(w => ({ value: w.id, label: w.name, labelHe: w.nameHe })) },
            { key: "deadline", label: "Deadline", labelHe: "תאריך יעד", type: "date" },
          ]}
        />
      )}

      {sendIdx !== null && goals[sendIdx] && (
        <SendToWorkerModal
          isHe={isHe}
          itemLabel={goals[sendIdx].title}
          itemLabelHe={goals[sendIdx].titleHe}
          currentWorkerId={goals[sendIdx].workerId}
          onClose={() => setSendIdx(null)}
          onSend={workerId => sendGoal(sendIdx, workerId)}
        />
      )}
    </div>
  );
}
