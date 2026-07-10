"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, ChevronDown, ChevronUp, X, Send } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { SendToWorkerModal } from "@/components/SendToWorkerModal";

const P = {
  card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4", track: "#E7E0D8",
};

const TAGS = ["Design", "Finance", "Site", "RFI", "Reports", "Meeting", "Safety", "Quality", "Other"];
const TAGS_HE: Record<string, string> = {
  Design: "תכנון", Finance: "פיננסים", Site: "אתר", RFI: "בקשת מידע",
  Reports: "דוחות", Meeting: "פגישה", Safety: "בטיחות", Quality: "איכות", Other: "אחר",
};
const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  Design:   { bg: "#EEF2FF", color: "#4338CA" },
  Finance:  { bg: "#FEF9C3", color: "#A16207" },
  Site:     { bg: "#F0FDF4", color: "#15803D" },
  RFI:      { bg: "#FFF7ED", color: "#C2410C" },
  Reports:  { bg: "#F5F3FF", color: "#7C3AED" },
  Meeting:  { bg: "#F0F9FF", color: "#0369A1" },
  Safety:   { bg: "#FEF2F2", color: "#B91C1C" },
  Quality:  { bg: "#F0FDF4", color: "#166534" },
  Other:    { bg: "#F5F5F4", color: "#57534E" },
};

type Task = {
  id: number;
  text: string;
  tag: string;
  urgent: boolean;
  done: boolean;
  doneAt?: string;
  workerId?: string;
  sentAt?: string;
};

type Props = {
  lang?: "en" | "he";
  initialTasks?: Task[];
};

const STORAGE_KEY = "infrai_tasks";

const DEFAULT_TASKS: Task[] = [
  { id: 1, text: "Review structural drawings Rev.C – Bridge 3", tag: "Design",  urgent: true,  done: false },
  { id: 2, text: "Approve 4 supplier invoices (₪2.3M)",         tag: "Finance", urgent: true,  done: false },
  { id: 3, text: "Morning site walkthrough – Zone B",            tag: "Site",    urgent: false, done: true,  doneAt: "Earlier today" },
  { id: 4, text: "RFI response – Electrical conduit routing",    tag: "RFI",     urgent: false, done: false },
  { id: 5, text: "Submit weekly progress report",                tag: "Reports", urgent: true,  done: false },
  { id: 6, text: "Design coordination meeting – 14:00",          tag: "Meeting", urgent: false, done: false },
];

export function TaskWidget({ lang = "en" }: Props) {
  const isHe = lang === "he";
  const { workers } = useTeam();
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [newText, setNewText]           = useState("");
  const [newTag, setNewTag]             = useState("Other");
  const [showAdd, setShowAdd]           = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [sendTaskId, setSendTaskId]     = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setTasks(stored ? JSON.parse(stored) : DEFAULT_TASKS);
    setMounted(true);
  }, []);

  // Save whenever tasks change
  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, mounted]);

  function toggleDone(id: number) {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined }
        : t
    ));
  }

  function addTask() {
    if (!newText.trim()) return;
    const task: Task = {
      id: Date.now(),
      text: newText.trim(),
      tag: newTag,
      urgent: false,
      done: false,
    };
    setTasks(prev => [task, ...prev]);
    setNewText("");
    setShowAdd(false);
  }

  function removeTask(id: number) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function sendTask(id: number, workerId: string) {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, workerId, sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) } : t
    ));
    setSendTaskId(null);
  }

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);
  const sendTarget = pending.find(t => t.id === sendTaskId);

  if (!mounted) return null;

  return (
    <div className="px-3 pb-4 pt-2 space-y-1">

      {/* Pending tasks */}
      {pending.length === 0 && (
        <p className="text-center text-[13px] py-4" style={{ color: P.text3 }}>
          {isHe ? "כל המשימות הושלמו 🎉" : "All tasks done 🎉"}
        </p>
      )}

      {pending.map((task) => {
        const worker = workers.find(w => w.id === task.workerId);
        return (
        <div key={task.id}
          className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl group transition-colors"
          style={{ background: "transparent" }}
          onMouseEnter={e => (e.currentTarget.style.background = P.copperLight)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => toggleDone(task.id)} className="shrink-0 transition-transform active:scale-90">
              <Circle className="w-[18px] h-[18px]" style={{ color: P.track }} />
            </button>
            <p className="flex-1 text-[13.5px] font-medium leading-snug" style={{ color: P.text1 }}>
              {task.text}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              {task.urgent && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
              {TAG_COLORS[task.tag] && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: TAG_COLORS[task.tag].bg, color: TAG_COLORS[task.tag].color }}>
                  {isHe ? TAGS_HE[task.tag] : task.tag}
                </span>
              )}
              <button onClick={() => removeTask(task.id)}
                className="transition-colors ml-1 p-0.5 rounded"
                title={isHe ? "מחק משימה" : "Delete task"}
                style={{ color: P.text3 }}
                onMouseEnter={e => (e.currentTarget.style.color = "#B91C1C")}
                onMouseLeave={e => (e.currentTarget.style.color = P.text3)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="ps-[30px] flex items-center justify-between">
            {worker ? (
              <button onClick={() => setSendTaskId(task.id)}
                className="flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: P.copper }}>
                <Send className="w-3 h-3" />
                {isHe
                  ? `נשלח ל${worker.nameHe} · ${task.sentAt}`
                  : `Sent to ${worker.name} · ${task.sentAt}`}
              </button>
            ) : (
              <button onClick={() => setSendTaskId(task.id)}
                className="flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: P.copper }}>
                <Send className="w-3 h-3" />
                {isHe ? "שלח לעובד" : "Send to worker"}
              </button>
            )}
          </div>
        </div>
        );
      })}

      {/* Add task */}
      {showAdd ? (
        <div className="mt-2 rounded-xl p-3 space-y-2.5" style={{ background: P.copperLight, border: `1px solid ${P.border}` }}>
          <input
            autoFocus
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setShowAdd(false); }}
            placeholder={isHe ? "תיאור המשימה..." : "Task description..."}
            dir={isHe ? "rtl" : "ltr"}
            className="w-full text-[13px] rounded-lg px-3 py-2 outline-none"
            style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text1 }}
          />
          <div className="flex items-center gap-2">
            <select
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              className="flex-1 text-[12px] rounded-lg px-2 py-1.5 outline-none"
              style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text2 }}
            >
              {TAGS.map(tag => (
                <option key={tag} value={tag}>{isHe ? TAGS_HE[tag] : tag}</option>
              ))}
            </select>
            <button onClick={addTask}
              className="px-4 py-1.5 rounded-lg text-[12px] font-bold text-white transition-colors"
              style={{ background: P.copper }}
              onMouseEnter={e => (e.currentTarget.style.background = "#6B3E18")}
              onMouseLeave={e => (e.currentTarget.style.background = P.copper)}>
              {isHe ? "הוסף" : "Add"}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ color: P.text3, background: P.card, border: `1px solid ${P.border}` }}>
              {isHe ? "ביטול" : "Cancel"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors mt-1"
          style={{ color: P.copper, border: `1.5px dashed ${P.track}` }}
          onMouseEnter={e => { e.currentTarget.style.background = P.copperLight; e.currentTarget.style.borderColor = P.copper; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = P.track; }}
        >
          <Plus className="w-4 h-4" />
          {isHe ? "הוסף משימה" : "Add task"}
        </button>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowCompleted(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-semibold transition-colors"
            style={{ color: P.text3 }}
            onMouseEnter={e => (e.currentTarget.style.background = P.copperLight)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: P.good }} />
              {isHe ? `${completed.length} משימות שהושלמו` : `${completed.length} completed task${completed.length > 1 ? "s" : ""}`}
            </span>
            {showCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCompleted && (
            <div className="mt-1 space-y-0.5 rounded-xl overflow-hidden" style={{ border: `1px solid ${P.border}` }}>
              {completed.map(task => (
                <div key={task.id}
                  className="flex items-center gap-3 px-3 py-2.5 group"
                  style={{ background: P.goodBg, opacity: 0.75 }}
                >
                  <button onClick={() => toggleDone(task.id)} className="shrink-0">
                    <CheckCircle2 className="w-[18px] h-[18px]" style={{ color: P.good }} />
                  </button>
                  <p className="flex-1 text-[13px] leading-snug line-through" style={{ color: P.text3 }}>
                    {task.text}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {task.doneAt && (
                      <span className="text-[11px]" style={{ color: P.text3 }}>{task.doneAt}</span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: P.goodBg, color: P.good, border: `1px solid #BBF7D0` }}>
                      {isHe ? "הושלם" : "Done"}
                    </span>
                    <button onClick={() => removeTask(task.id)}
                      className="transition-colors p-0.5 rounded"
                      title={isHe ? "מחק משימה" : "Delete task"}
                      style={{ color: P.text3 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#B91C1C")}
                      onMouseLeave={e => (e.currentTarget.style.color = P.text3)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sendTarget && (
        <SendToWorkerModal
          isHe={isHe}
          itemLabel={sendTarget.text}
          itemLabelHe={sendTarget.text}
          currentWorkerId={sendTarget.workerId}
          onClose={() => setSendTaskId(null)}
          onSend={workerId => sendTask(sendTarget.id, workerId)}
        />
      )}
    </div>
  );
}
