"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import {
  Bell, Plus, Search, Lightbulb, AlertTriangle, Filter,
  ClipboardList, CalendarCheck, Calendar, Zap, ShoppingCart,
  Package, BookOpen, Truck, Users, CheckCircle2, Clock,
  XCircle, Sun, Camera, Wrench, TrendingUp, TrendingDown,
} from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
};

type Lang = "en" | "he";

const TABS = [
  { id: "daily",          icon: ClipboardList, labelEn: "Daily Tasks",       labelHe: "משימות יומיות",  newEn: "New Task",        newHe: "משימה חדשה"       },
  { id: "weekly",         icon: CalendarCheck, labelEn: "Weekly Plan",       labelHe: "תכנון שבועי",    newEn: "New Activity",    newHe: "פעילות חדשה"      },
  { id: "monthly",        icon: Calendar,      labelEn: "Monthly Plan",      labelHe: "תכנון חודשי",    newEn: "New Milestone",   newHe: "אבן דרך חדשה"     },
  { id: "operations",     icon: Zap,           labelEn: "Special Ops",       labelHe: "פעולות מיוחדות", newEn: "New Operation",   newHe: "פעולה חדשה"       },
  { id: "procurement",    icon: ShoppingCart,  labelEn: "Procurement",       labelHe: "רכש",            newEn: "New PO",          newHe: "הזמנת רכש חדשה"   },
  { id: "inventory",      icon: Package,       labelEn: "Inventory",         labelHe: "מלאי",           newEn: "Add Item",        newHe: "הוסף פריט"        },
  { id: "diary",          icon: BookOpen,      labelEn: "Site Diary",        labelHe: "יומן אתר",       newEn: "New Entry",       newHe: "רשומה חדשה"       },
  { id: "equipment",      icon: Truck,         labelEn: "Plant & Equipment", labelHe: "ציוד ומכשור",    newEn: "Add Equipment",   newHe: "הוסף ציוד"        },
  { id: "subcontractors", icon: Users,         labelEn: "Subcontractors",    labelHe: "קבלני משנה",     newEn: "Add Subcontractor",newHe: "הוסף קבלן משנה"  },
] as const;

type TabId = typeof TABS[number]["id"];

/* ─── shared helpers ─── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
      {children}
    </div>
  );
}
function KPIRow({ items, colors }: { items: { label: string; val: string }[]; colors: string[] }) {
  return (
    <div className={`grid gap-3 mb-4`} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((k, i) => (
        <Card key={k.label} className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{k.label}</p>
          <p className="text-[26px] font-bold" style={{ color: colors[i] }}>{k.val}</p>
        </Card>
      ))}
    </div>
  );
}
function AIBanner({ text, label, danger }: { text: string; label: string; danger?: boolean }) {
  const bg = danger ? P.dangerBg : P.warnBg;
  const border = danger ? "#FECACA" : "#FDE68A";
  const color = danger ? P.danger : P.warn;
  const iconBg = danger ? "#FEE2E2" : "#FEF3C7";
  const Icon = danger ? AlertTriangle : Lightbulb;
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl mb-4" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: iconBg }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div>
        <p className="text-[12px] font-bold mb-0.5" style={{ color }}>{label}</p>
        <p className="text-[12.5px]" style={{ color: P.text2 }}>{text}</p>
      </div>
    </div>
  );
}
function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr style={{ borderBottom: `1px solid ${P.border}` }}>
        {cols.map(h => <th key={h} className="px-4 py-3 text-left font-bold whitespace-nowrap" style={{ color: P.text3, background: P.bg }}>{h}</th>)}
      </tr>
    </thead>
  );
}
function ZoneBadge({ z }: { z: string }) {
  return <span className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto" style={{ background: P.copperLight, color: P.copper }}>{z}</span>;
}
function Chip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: bg, color }}>{label}</span>;
}

/* ─── TAB CONTENT COMPONENTS ─── */

function DailyTasks({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const kpisRaw = isHe
    ? [{ label:"הוקצו היום", val:"28" }, { label:"הושלמו", val:"12" }, { label:"בביצוע", val:"11" }, { label:"חסומות", val:"5" }]
    : [{ label:"Assigned Today", val:"28" }, { label:"Completed", val:"12" }, { label:"In Progress", val:"11" }, { label:"Blocked", val:"5" }];
  const kpis = isDemo ? kpisRaw : kpisRaw.map(k => ({ ...k, val: "–" }));
  const ai = isHe
    ? "5 משימות באזור D חסומות ממתינות לאישור העברת תשתיות. הזזת יציקת הבטון באזור B ליום שישי תשחרר 3 צוותים."
    : "5 tasks in Zone D blocked pending utility relocation sign-off. Moving Zone B concrete pour to Friday frees 3 crews for Zone D recovery.";

  type S = "COMPLETE"|"IN PROGRESS"|"PENDING"|"BLOCKED";
  type Pr = "CRITICAL"|"HIGH"|"MEDIUM"|"LOW";
  const tasks: { id:string;task:string;taskHe:string;zone:string;crew:string;priority:Pr;start:string;end:string;status:S }[] = isDemo ? [
    { id:"DT-001",task:"Concrete pour – Bridge pier P7",          taskHe:"יציקת בטון – כן גשר P7",          zone:"B",crew:"Crew A – Levy",    priority:"CRITICAL",start:"06:00",end:"14:00",status:"IN PROGRESS"},
    { id:"DT-002",task:"Rebar fabrication – Zone C pile cage",    taskHe:"עיבוד ברזל – כלוב קידוח אזור C",  zone:"C",crew:"Crew B – Peretz",  priority:"HIGH",   start:"06:00",end:"15:00",status:"IN PROGRESS"},
    { id:"DT-003",task:"Formwork stripping – Bridge deck 4A",     taskHe:"פירוק קינוף – מקטע גשר 4A",       zone:"B",crew:"Crew C – Dror",    priority:"HIGH",   start:"07:00",end:"13:00",status:"COMPLETE"   },
    { id:"DT-004",task:"Earthworks cut – Ch.3+400 to Ch.3+600",  taskHe:"חפירה – ק\"מ 3+400 עד 3+600",      zone:"C",crew:"Crew D – Cohen",   priority:"HIGH",   start:"06:00",end:"16:00",status:"IN PROGRESS"},
    { id:"DT-005",task:"Utility trench – Zone D Section 2",       taskHe:"תעלת תשתיות – אזור D קטע 2",      zone:"D",crew:"Crew E – Ben-Ami", priority:"CRITICAL",start:"07:00",end:"17:00",status:"BLOCKED"    },
    { id:"DT-006",task:"Road base compaction – Section A",        taskHe:"דחיסת שכבת בסיס – קטע A",         zone:"A",crew:"Crew F – Mizrahi", priority:"MEDIUM", start:"07:00",end:"15:30",status:"COMPLETE"   },
    { id:"DT-007",task:"Install drainage culvert – STA 0+220",    taskHe:"התקנת תעלת ניקוז – עמדה 0+220",   zone:"A",crew:"Crew G – Katz",    priority:"MEDIUM", start:"08:00",end:"14:00",status:"COMPLETE"   },
    { id:"DT-008",task:"Pre-pour survey – Pier P8 formwork",      taskHe:"מדידה לפני יציקה – קינוף כן P8",  zone:"B",crew:"Surveyor Shapira", priority:"HIGH",   start:"09:00",end:"11:00",status:"COMPLETE"   },
    { id:"DT-009",task:"Retaining wall backfill – Zone C sec.3",  taskHe:"מילוי קיר תומך – אזור C קטע 3",  zone:"C",crew:"Crew B – Peretz",  priority:"MEDIUM", start:"13:00",end:"17:00",status:"PENDING"    },
    { id:"DT-010",task:"Fuel storage relocation – Zone D",        taskHe:"העברת מיכל דלק – אזור D",         zone:"D",crew:"HSE – Ben-Ami",    priority:"CRITICAL",start:"08:00",end:"10:00",status:"BLOCKED"    },
    { id:"DT-011",task:"Pile drilling – Positions 29–34",         taskHe:"קידוח יסודות – עמדות 29–34",      zone:"C",crew:"Drill – Goldberg", priority:"HIGH",   start:"06:00",end:"18:00",status:"IN PROGRESS"},
    { id:"DT-012",task:"Night shift prep – Zone B lighting",      taskHe:"הכנת משמרת לילה – תאורה אזור B",  zone:"B",crew:"Crew A – Levy",    priority:"MEDIUM", start:"15:00",end:"17:00",status:"PENDING"    },
  ] : [];
  const prStyle: Record<Pr,{bg:string;color:string}> = { CRITICAL:{bg:"#FEF2F2",color:"#991B1B"}, HIGH:{bg:P.warnBg,color:"#92400E"}, MEDIUM:{bg:"#EFF6FF",color:"#1D4ED8"}, LOW:{bg:P.goodBg,color:P.good} };
  const stStyle: Record<S,{bg:string;color:string;Icon:React.FC<{className?:string}>}> = {
    "COMPLETE":    {bg:P.goodBg,  color:P.good,   Icon:CheckCircle2},
    "IN PROGRESS": {bg:"#EFF6FF", color:"#1D4ED8",Icon:Clock},
    "PENDING":     {bg:P.warnBg,  color:P.warn,   Icon:Clock},
    "BLOCKED":     {bg:P.dangerBg,color:P.danger, Icon:XCircle},
  };
  const cols = isHe ? ["מזהה","משימה","אזור","צוות","עדיפות","התחלה","סיום","סטטוס"] : ["ID","Task","Zone","Crew","Priority","Start","End","Status"];
  return (
    <>
      <KPIRow items={kpis} colors={[P.text1, P.good, "#1D4ED8", P.danger]} />
      {isDemo && <AIBanner label={isHe?"תובנת AI לתכנית עבודה":"AI Work Plan Insight"} text={ai} />}
      <Card>
        <table className="w-full text-[12px]"><THead cols={cols} /><tbody>
          {tasks.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין משימות עדיין":"No tasks yet"}</td></tr>
          )}
          {tasks.map(t => { const ps=prStyle[t.priority]; const ss=stStyle[t.status]; const SI=ss.Icon; return (
            <tr key={t.id} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
              <td className="px-4 py-2.5 font-mono text-[11px]" style={{color:P.text3}}>{t.id}</td>
              <td className="px-4 py-2.5 max-w-[240px] font-medium" style={{color:P.text1}}>{isHe?t.taskHe:t.task}</td>
              <td className="px-4 py-2.5 text-center"><ZoneBadge z={t.zone}/></td>
              <td className="px-4 py-2.5 whitespace-nowrap" style={{color:P.text2}}>{t.crew}</td>
              <td className="px-4 py-2.5"><Chip label={t.priority} bg={ps.bg} color={ps.color}/></td>
              <td className="px-4 py-2.5 font-mono" style={{color:P.text3}}>{t.start}</td>
              <td className="px-4 py-2.5 font-mono" style={{color:P.text3}}>{t.end}</td>
              <td className="px-4 py-2.5"><span className="flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full w-fit" style={{background:ss.bg,color:ss.color}}><SI className="w-3 h-3"/>{t.status}</span></td>
            </tr>
          );})}
        </tbody></table>
      </Card>
    </>
  );
}

function WeeklyPlan({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const kpisRaw = isHe
    ? [{ label:"פעילויות (ש89)", val:"38" }, { label:"הושלמו", val:"12" }, { label:"בביצוע", val:"14" }, { label:"בסיכון", val:"6" }]
    : [{ label:"Planned (W89)", val:"38" }, { label:"Completed", val:"12" }, { label:"In Progress", val:"14" }, { label:"At Risk", val:"6" }];
  const kpis = isDemo ? kpisRaw : kpisRaw.map(k => ({ ...k, val: "–" }));
  const ai = isHe
    ? "אזור D הוא האילוץ העיקרי לשבוע 89. אם לא ייפתר עד 4 יולי, 9 פעילויות שבוע 90 ידחו."
    : "Zone D utility relocation is the top constraint for Week 89 — if unresolved by 4 July, 9 downstream activities in Week 90 will slip.";
  type S = "COMPLETE"|"IN PROGRESS"|"PLANNED"|"AT RISK"|"NOT STARTED";
  const activities: {id:string;activity:string;actHe:string;zone:string;week:string;duration:string;status:S}[] = isDemo ? [
    {id:"A-001",activity:"Concrete pour – Bridge pier P7",          actHe:"יציקת בטון – כן P7",           zone:"B",week:"W89",duration:"1d", status:"IN PROGRESS"},
    {id:"A-002",activity:"Pile drilling – positions 29–34",         actHe:"קידוח יסודות 29–34",            zone:"C",week:"W89",duration:"2d", status:"IN PROGRESS"},
    {id:"A-003",activity:"Formwork erection – P8 (North)",          actHe:"הקמת קינוף – P8 (צפון)",        zone:"B",week:"W89",duration:"2d", status:"IN PROGRESS"},
    {id:"A-004",activity:"Road base compaction – Sec. A",           actHe:"דחיסת בסיס – קטע A",            zone:"A",week:"W89",duration:"3d", status:"IN PROGRESS"},
    {id:"A-005",activity:"Utility trench – Zone D sec. 2",          actHe:"חפירת תשתיות – אזור D קטע 2",  zone:"D",week:"W89",duration:"4d", status:"AT RISK"    },
    {id:"A-006",activity:"Pile cage fabrication #22–28",            actHe:"ייצור כלוב קידוח #22–28",       zone:"C",week:"W89",duration:"1d", status:"COMPLETE"   },
    {id:"A-007",activity:"Drainage culvert – STA 0+220",            actHe:"תעלת ניקוז – עמדה 0+220",       zone:"A",week:"W89",duration:"1d", status:"COMPLETE"   },
    {id:"B-001",activity:"Concrete pour – Bridge pier P8",          actHe:"יציקת בטון – כן P8",            zone:"B",week:"W90",duration:"1d", status:"NOT STARTED"},
    {id:"B-002",activity:"Pile drilling – positions 35–42",         actHe:"קידוח יסודות 35–42",            zone:"C",week:"W90",duration:"3d", status:"NOT STARTED"},
    {id:"B-003",activity:"Earthworks Zone D – if unblocked",        actHe:"עפר אזור D – אם מוסר חסם",     zone:"D",week:"W90",duration:"5d", status:"AT RISK"    },
    {id:"C-001",activity:"Concrete pour – deck segment 5A",         actHe:"יציקת בטון – מקטע גשר 5A",     zone:"B",week:"W91",duration:"2d", status:"NOT STARTED"},
    {id:"C-002",activity:"Pile completion Zone C (final 8)",        actHe:"השלמת קידוח אזור C (8 אחרון)",  zone:"C",week:"W91",duration:"4d", status:"NOT STARTED"},
  ] : [];
  const ss: Record<S,{bg:string;color:string}> = {
    "COMPLETE":    {bg:P.goodBg,  color:P.good},
    "IN PROGRESS": {bg:"#EFF6FF", color:"#1D4ED8"},
    "PLANNED":     {bg:"#F1F5F9", color:"#475569"},
    "AT RISK":     {bg:P.dangerBg,color:P.danger},
    "NOT STARTED": {bg:P.bg,      color:P.text3},
  };
  const weekLabel = (w:string) => w === "W89" ? (isHe?"שבוע 89 (נוכחי)":"Week 89 (Current)") : w === "W90" ? (isHe?"שבוע 90":"Week 90") : (isHe?"שבוע 91":"Week 91");
  const cols = isHe ? ["מזהה","פעילות","אזור","שבוע","משך","סטטוס"] : ["ID","Activity","Zone","Week","Duration","Status"];
  return (
    <>
      <KPIRow items={kpis} colors={[P.text1, P.good, "#1D4ED8", P.danger]} />
      {isDemo && <AIBanner label={isHe?"תובנת AI לתחזית":"AI Lookahead Insight"} text={ai} />}
      <Card>
        <table className="w-full text-[12px]"><THead cols={cols} /><tbody>
          {activities.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין פעילויות עדיין":"No activities yet"}</td></tr>
          )}
          {activities.map(a => { const s=ss[a.status]; return (
            <tr key={a.id} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
              <td className="px-4 py-2.5 font-mono text-[11px]" style={{color:P.text3}}>{a.id}</td>
              <td className="px-4 py-2.5 font-medium" style={{color:P.text1}}>{isHe?a.actHe:a.activity}</td>
              <td className="px-4 py-2.5 text-center"><ZoneBadge z={a.zone}/></td>
              <td className="px-4 py-2.5 text-[11px] font-semibold" style={{color:P.copper}}>{weekLabel(a.week)}</td>
              <td className="px-4 py-2.5 font-mono text-[11px]" style={{color:P.text2}}>{a.duration}</td>
              <td className="px-4 py-2.5"><Chip label={a.status} bg={s.bg} color={s.color}/></td>
            </tr>
          );})}
        </tbody></table>
      </Card>
    </>
  );
}

function MonthlyPlan({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const kpisRaw = isHe
    ? [{ label:"התקדמות חודשית", val:"6%" }, { label:"אבני דרך", val:"8" }, { label:"הושגו", val:"1" }, { label:"בסיכון", val:"4" }]
    : [{ label:"Month Progress", val:"6%" }, { label:"Milestones", val:"8" }, { label:"Achieved", val:"1" }, { label:"At Risk", val:"4" }];
  const kpis = isDemo ? kpisRaw : kpisRaw.map(k => ({ ...k, val: "–" }));
  const ai = isHe
    ? "יולי הוא חודש קריטי — יציקת גשר P8 ותשתיות אזור D נמצאים שניהם בנתיב הקריטי. אם אזור D יישאר חסום אחרי 10 יולי, אבני דרך אוגוסט ידחו בכ-18 יום."
    : "July is critical — Bridge P8 pour and Zone D utilities are both on the critical path. If Zone D stays blocked past 10 July, August milestones slip ~18 days.";
  type MS = "ACHIEVED"|"ON TRACK"|"AT RISK"|"NOT STARTED";
  const milestones: {ms:string;msHe:string;date:string;owner:string;status:MS}[] = isDemo ? [
    {ms:"Complete Zone A road base (Sec. A)",      msHe:"השלמת שכבת בסיס אזור A",    date:"6 Jul",  owner:"Eng. Mizrahi", status:"ON TRACK"   },
    {ms:"Complete Bridge P8 concrete pour",        msHe:"השלמת יציקת בטון כן P8",    date:"8 Jul",  owner:"Eng. Cohen",   status:"AT RISK"    },
    {ms:"Complete pile drilling Zone C (42 piles)",msHe:"השלמת קידוח יסודות אזור C", date:"13 Jul", owner:"Drill Co.",    status:"ON TRACK"   },
    {ms:"Zone D utility trench 50%",               msHe:"50% תעלת תשתיות אזור D",    date:"15 Jul", owner:"Eng. Ben-Ami", status:"AT RISK"    },
    {ms:"Bridge deck formwork segment 5A",         msHe:"קינוף מקטע גשר 5A",         date:"16 Jul", owner:"Foreman Dror", status:"NOT STARTED"},
    {ms:"Section B road base start",               msHe:"תחילת שכבת בסיס קטע B",     date:"18 Jul", owner:"Crew F",       status:"NOT STARTED"},
    {ms:"Bridge P8 deck pour",                     msHe:"יציקת סיפון גשר P8",        date:"22 Jul", owner:"Eng. Cohen",   status:"NOT STARTED"},
    {ms:"Drainage installation Zone A complete",   msHe:"השלמת מערכת ניקוז אזור A",  date:"31 Jul", owner:"Crew G",       status:"ACHIEVED"   },
  ] : [];
  const msStyle: Record<MS,{bg:string;color:string}> = { ACHIEVED:{bg:P.goodBg,color:P.good}, "ON TRACK":{bg:"#EFF6FF",color:"#1D4ED8"}, "AT RISK":{bg:P.dangerBg,color:P.danger}, "NOT STARTED":{bg:P.bg,color:P.text3} };
  const cols = isHe ? ["אבן דרך","תאריך יעד","אחראי","סטטוס"] : ["Milestone","Target Date","Owner","Status"];
  return (
    <>
      <KPIRow items={kpis} colors={[P.copper, P.text1, P.good, P.danger]} />
      {isDemo && <AIBanner label={isHe?"תחזית AI חודשית":"AI Monthly Outlook"} text={ai} />}
      <Card>
        <table className="w-full text-[12px]"><THead cols={cols} /><tbody>
          {milestones.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין אבני דרך עדיין":"No milestones yet"}</td></tr>
          )}
          {milestones.map(m => { const s=msStyle[m.status]; return (
            <tr key={m.ms} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
              <td className="px-4 py-3 font-medium" style={{color:P.text1}}>{isHe?m.msHe:m.ms}</td>
              <td className="px-4 py-3 whitespace-nowrap" style={{color:P.text2}}>{m.date}</td>
              <td className="px-4 py-3 whitespace-nowrap" style={{color:P.text2}}>{m.owner}</td>
              <td className="px-4 py-3"><Chip label={m.status} bg={s.bg} color={s.color}/></td>
            </tr>
          );})}
        </tbody></table>
      </Card>
    </>
  );
}

function SpecialOps({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const kpisRaw = isHe
    ? [{ label:"היתרים פעילים", val:"3" }, { label:"קרובות (7 ימים)", val:"5" }, { label:"הושלמו החודש", val:"18" }, { label:"בוטלו/פגו", val:"2" }]
    : [{ label:"Active Permits", val:"3" }, { label:"Upcoming (7d)", val:"5" }, { label:"Completed MTD", val:"18" }, { label:"Cancelled", val:"2" }];
  const kpis = isDemo ? kpisRaw : kpisRaw.map(k => ({ ...k, val: "–" }));
  const ai = isHe
    ? "היתר משמרת לילה אזור B פג מחר — חדש לפני 22:00. הרמת עגורן OP-054 מצריכה רוח מתחת 40 ק\"מ/ש; תחזית: 55 ק\"מ/ש ביום שישי — תזמן מחדש לשבת."
    : "Night shift permit Zone B expires tomorrow — renew before 22:00. Crane lift OP-054 requires wind under 40 km/h; forecast shows 55 km/h Friday — reschedule to Saturday.";
  type OS = "ACTIVE"|"COMPLETE"|"PENDING APPROVAL"|"CANCELLED";
  const ops: {id:string;type:string;typeHe:string;desc:string;descHe:string;zone:string;datetime:string;permit:string;status:OS}[] = isDemo ? [
    {id:"OP-048",type:"Night Shift",   typeHe:"משמרת לילה",  desc:"Concrete pour – Bridge pier P7",          descHe:"יציקת בטון – כן גשר P7",          zone:"B",datetime:"1 Jul 22:00",  permit:"NS-2026-31",status:"COMPLETE"        },
    {id:"OP-049",type:"Crane Lift",    typeHe:"הרמת עגורן",  desc:"Steel cage lift – 18t positions 27–28",   descHe:"הרמת כלוב פלדה – 18 טון עמדות 27–28",zone:"C",datetime:"2 Jul 07:00",permit:"CL-2026-44",status:"ACTIVE"          },
    {id:"OP-050",type:"Night Shift",   typeHe:"משמרת לילה",  desc:"Zone B – P7 formwork stripping",          descHe:"פירוק קינוף P7 אזור B",            zone:"B",datetime:"2 Jul 22:00",  permit:"NS-2026-32",status:"ACTIVE"          },
    {id:"OP-051",type:"Concrete Pour", typeHe:"יציקת בטון",  desc:"Bridge pier P8 – 185m³",                  descHe:"יציקת כן גשר P8 – 185 מ\"ק",       zone:"B",datetime:"3 Jul 06:00",  permit:"CP-2026-18",status:"PENDING APPROVAL"},
    {id:"OP-052",type:"Blasting",      typeHe:"פיצוץ",       desc:"Rock blasting – Zone D corridor sec.3",   descHe:"פיצוץ סלע – פרוזדור אזור D קטע 3", zone:"D",datetime:"5 Jul 09:00",  permit:"BL-2026-09",status:"PENDING APPROVAL"},
    {id:"OP-053",type:"Lane Closure",  typeHe:"סגירת נתיב",  desc:"Full closure Route 20N – falsework rem.", descHe:"סגירת כביש 20N – פינוי שלד גשר",   zone:"B",datetime:"6 Jul 00:00",  permit:"LC-2026-14",status:"PENDING APPROVAL"},
    {id:"OP-054",type:"Crane Lift",    typeHe:"הרמת עגורן",  desc:"Precast girder lift – 28t Bridge Zone B", descHe:"הרמת קורה מוגמרת – 28 טון אזור B",  zone:"B",datetime:"4 Jul 07:00",  permit:"CL-2026-45",status:"PENDING APPROVAL"},
    {id:"OP-044",type:"Night Shift",   typeHe:"משמרת לילה",  desc:"Cancelled – Zone D access blocked",       descHe:"בוטלה – גישה לאזור D חסומה",       zone:"D",datetime:"28 Jun",        permit:"NS-2026-29",status:"CANCELLED"       },
  ] : [];
  const ss: Record<OS,{bg:string;color:string}> = { ACTIVE:{bg:P.goodBg,color:P.good}, COMPLETE:{bg:"#F1F5F9",color:"#475569"}, "PENDING APPROVAL":{bg:P.warnBg,color:P.warn}, CANCELLED:{bg:P.dangerBg,color:P.danger} };
  const typeColors: Record<string,string> = { "Night Shift":"#5B21B6","Crane Lift":"#1D4ED8","Concrete Pour":P.copper,Blasting:P.danger,"Lane Closure":P.warn };
  const cols = isHe ? ["מס' פעולה","סוג","תיאור","אזור","תאריך / שעה","מס' היתר","סטטוס"] : ["Op #","Type","Description","Zone","Date / Time","Permit #","Status"];
  return (
    <>
      <KPIRow items={kpis} colors={[P.good, "#1D4ED8", P.copper, P.danger]} />
      {isDemo && <AIBanner label={isHe?"התראת AI לפעולות":"AI Operations Alert"} text={ai} danger />}
      <Card>
        <table className="w-full text-[12px]"><THead cols={cols} /><tbody>
          {ops.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין פעולות מיוחדות עדיין":"No special operations yet"}</td></tr>
          )}
          {ops.map(op => { const s=ss[op.status]; const tc=typeColors[op.type]??P.text2; return (
            <tr key={op.id} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
              <td className="px-4 py-2.5 font-mono text-[11px]" style={{color:P.text3}}>{op.id}</td>
              <td className="px-4 py-2.5"><span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{background:tc+"18",color:tc}}>{isHe?op.typeHe:op.type}</span></td>
              <td className="px-4 py-2.5 max-w-[200px] font-medium" style={{color:P.text1}}>{isHe?op.descHe:op.desc}</td>
              <td className="px-4 py-2.5 text-center"><ZoneBadge z={op.zone}/></td>
              <td className="px-4 py-2.5 whitespace-nowrap text-[11px]" style={{color:P.text2}}>{op.datetime}</td>
              <td className="px-4 py-2.5 font-mono text-[11px]" style={{color:P.text3}}>{op.permit}</td>
              <td className="px-4 py-2.5"><Chip label={op.status} bg={s.bg} color={s.color}/></td>
            </tr>
          );})}
        </tbody></table>
      </Card>
    </>
  );
}

function Procurement({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const kpisRaw = isHe
    ? [{ label:"הזמנות פתוחות", val:"23" }, { label:"ממתינות לאישור", val:"7" }, { label:"ערך מחויב", val:"28.4M ₪" }, { label:"אספקה בזמן", val:"81%" }]
    : [{ label:"Open POs", val:"23" }, { label:"Pending Approval", val:"7" }, { label:"Value Committed", val:"₪28.4M" }, { label:"On-Time Delivery", val:"81%" }];
  const kpis = isDemo ? kpisRaw : kpisRaw.map(k => ({ ...k, val: "–" }));
  const ai = isHe
    ? "משלוח ברזל מפלדה חיפה באיחור 6 ימים — ייצור כלובי קידוח באזור C ייעצר ב-4 יולי. מלאי מלט קריטי ב-5 יולי."
    : "Rebar from Haifa Steel is 6 days late — Zone C pile cage fabrication stalls by 4 July. Cement stock hits critical on 5 July.";
  type PS = "DELIVERED"|"IN TRANSIT"|"CONFIRMED"|"DELAYED"|"PENDING";
  const pos: {po:string;material:string;matHe:string;supplier:string;qty:string;unit:string;value:string;delivery:string;status:PS}[] = isDemo ? [
    {po:"PO-2024-182",material:"Rebar 20mm HY deformed bars",      matHe:"ברזל 20 מ\"מ",           supplier:"Haifa Steel Ltd.",  qty:"48.5",  unit:"t",   value:"₪485,000",   delivery:"26 Jun",status:"DELAYED"   },
    {po:"PO-2024-183",material:"Ready-mix concrete C35/45",        matHe:"בטון מוכן C35/45",        supplier:"Nesher Ready-Mix",  qty:"320",   unit:"m³",  value:"₪192,000",   delivery:"2 Jul", status:"CONFIRMED" },
    {po:"PO-2024-184",material:"Prestressed strand 15.2mm",        matHe:"כבל פרסטרס 15.2 מ\"מ",   supplier:"Elco Industries",   qty:"2.4",   unit:"t",   value:"₪216,000",   delivery:"5 Jul", status:"IN TRANSIT"},
    {po:"PO-2024-185",material:"Structural formwork H20 beams",    matHe:"קורות קינוף H20",         supplier:"Doka Israel",       qty:"840",   unit:"lm",  value:"₪126,000",   delivery:"3 Jul", status:"IN TRANSIT"},
    {po:"PO-2024-186",material:"Waterproof membrane – Bridge deck",matHe:"ממברנה אטום גשר",         supplier:"Sika Israel",       qty:"1,200", unit:"m²",  value:"₪84,000",    delivery:"8 Jul", status:"CONFIRMED" },
    {po:"PO-2024-187",material:"Portland cement CEM I 52.5",      matHe:"מלט פורטלנד CEM I 52.5",  supplier:"Nesher Cement",     qty:"120",   unit:"t",   value:"₪62,400",    delivery:"4 Jul", status:"PENDING"   },
    {po:"PO-2024-189",material:"Shotcrete accelerator (bulk)",     matHe:"מאיץ שוטקריט",            supplier:"Basf Construction", qty:"8",     unit:"t",   value:"₪48,000",    delivery:"1 Jul", status:"DELIVERED" },
    {po:"PO-2024-190",material:"Pile casing 600mm steel pipes",    matHe:"צנרת פלדה 600 מ\"מ",      supplier:"Mechling Steel",    qty:"18",    unit:"no.", value:"₪324,000",   delivery:"9 Jul", status:"CONFIRMED" },
  ] : [];
  const ss: Record<PS,{bg:string;color:string}> = { DELIVERED:{bg:P.goodBg,color:P.good}, "IN TRANSIT":{bg:"#EFF6FF",color:"#1D4ED8"}, CONFIRMED:{bg:P.goodBg,color:P.good}, DELAYED:{bg:P.dangerBg,color:P.danger}, PENDING:{bg:P.warnBg,color:P.warn} };
  const cols = isHe ? ["מס' הזמנה","חומר","ספק","כמות","יחידה","ערך","אספקה צפויה","סטטוס"] : ["PO #","Material","Supplier","Qty","Unit","Value","Expected Delivery","Status"];
  return (
    <>
      <KPIRow items={kpis} colors={[P.text1, P.warn, P.copper, P.good]} />
      {isDemo && <AIBanner label={isHe?"התראת רכש AI":"AI Procurement Alert"} text={ai} danger />}
      <Card>
        <table className="w-full text-[12px]"><THead cols={cols} /><tbody>
          {pos.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין הזמנות רכש עדיין":"No purchase orders yet"}</td></tr>
          )}
          {pos.map(po => { const s=ss[po.status]; return (
            <tr key={po.po} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
              <td className="px-4 py-2.5 font-mono text-[11px]" style={{color:P.text3}}>{po.po}</td>
              <td className="px-4 py-2.5 font-medium" style={{color:P.text1}}>{isHe?po.matHe:po.material}</td>
              <td className="px-4 py-2.5 whitespace-nowrap" style={{color:P.text2}}>{po.supplier}</td>
              <td className="px-4 py-2.5 font-mono text-right" style={{color:P.text1}}>{po.qty}</td>
              <td className="px-4 py-2.5" style={{color:P.text3}}>{po.unit}</td>
              <td className="px-4 py-2.5 font-mono font-semibold whitespace-nowrap" style={{color:P.copper}}>{po.value}</td>
              <td className="px-4 py-2.5 whitespace-nowrap" style={{color:po.status==="DELAYED"?P.danger:P.text2}}>{po.delivery}</td>
              <td className="px-4 py-2.5"><Chip label={po.status} bg={s.bg} color={s.color}/></td>
            </tr>
          );})}
        </tbody></table>
      </Card>
    </>
  );
}

function Inventory({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const kpisRaw = isHe
    ? [{ label:"שורות חומרים", val:"64" }, { label:"התראות מלאי", val:"5" }, { label:"מלאי קריטי", val:"2" }, { label:"שווי כולל", val:"4.2M ₪" }]
    : [{ label:"Material Lines", val:"64" }, { label:"Low Stock Alerts", val:"5" }, { label:"Critical Stock", val:"2" }, { label:"Total Value", val:"₪4.2M" }];
  const kpis = isDemo ? kpisRaw : kpisRaw.map(k => ({ ...k, val: "–" }));
  const ai = isHe
    ? "ברזל 20 מ\"מ יגיע לאפס ב-5 יולי בצריכה הנוכחית. מלאי מלט יהיה קריטי ב-4 יולי. לוחות קינוף בעודף (167%) — שקול החזרה לספק."
    : "Rebar 20mm hits zero on 5 July at current consumption. Cement stock critical on 4 July. Formwork panels overstocked (167%) — consider returning surplus.";
  type IS = "OK"|"LOW"|"CRITICAL"|"OVERSTOCK";
  const items: {item:string;itemHe:string;cat:string;onHand:number;minStock:number;dailyUsage:number;unit:string;status:IS}[] = isDemo ? [
    {item:"Rebar 20mm HY",         itemHe:"ברזל 20 מ\"מ",     cat:"Rebar",    onHand:24,   minStock:72,   dailyUsage:12,  unit:"t",   status:"CRITICAL" },
    {item:"Portland Cement CEM I", itemHe:"מלט פורטלנד",      cat:"Cement",   onHand:38,   minStock:60,   dailyUsage:8,   unit:"t",   status:"LOW"      },
    {item:"Rebar 12mm HY",         itemHe:"ברזל 12 מ\"מ",     cat:"Rebar",    onHand:18,   minStock:30,   dailyUsage:4,   unit:"t",   status:"LOW"      },
    {item:"Formwork H20 Beams",    itemHe:"קורות קינוף H20",  cat:"Formwork", onHand:1680, minStock:400,  dailyUsage:20,  unit:"lm",  status:"OVERSTOCK"},
    {item:"Shotcrete Accelerator", itemHe:"מאיץ שוטקריט",     cat:"Admixtures",onHand:8.5, minStock:5,    dailyUsage:1.2, unit:"t",   status:"OK"       },
    {item:"Waterproof Membrane",   itemHe:"ממברנה אטום",       cat:"Waterproof",onHand:480, minStock:200,  dailyUsage:30,  unit:"m²",  status:"OK"       },
    {item:"Diesel Fuel",           itemHe:"סולר",              cat:"Fuel",     onHand:28400,minStock:10000,dailyUsage:4200,unit:"L",   status:"OK"       },
    {item:"Pile Casing 600mm",     itemHe:"צנרת קידוח 600 מ\"מ",cat:"Piling", onHand:4,    minStock:6,    dailyUsage:1,   unit:"no.", status:"LOW"      },
  ] : [];
  const ss: Record<IS,{bg:string;color:string;label:string;labelHe:string}> = {
    OK:       {bg:P.goodBg,  color:P.good,   label:"OK",       labelHe:"תקין"},
    LOW:      {bg:P.warnBg,  color:P.warn,   label:"LOW",      labelHe:"נמוך"},
    CRITICAL: {bg:P.dangerBg,color:P.danger, label:"CRITICAL", labelHe:"קריטי"},
    OVERSTOCK:{bg:"#EFF6FF", color:"#1D4ED8",label:"OVERSTOCK",labelHe:"עודף"},
  };
  const cols = isHe ? ["חומר","קטגוריה","קיים","מינימום","שימוש יומי","יחידה","סטטוס מלאי"] : ["Material","Category","On Hand","Min Stock","Daily Usage","Unit","Stock Status"];
  return (
    <>
      <KPIRow items={kpis} colors={[P.text1, P.warn, P.danger, P.copper]} />
      {isDemo && <AIBanner label={isHe?"תובנת AI למלאי":"AI Inventory Insight"} text={ai} />}
      <Card>
        <table className="w-full text-[12px]"><THead cols={cols} /><tbody>
          {items.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין פריטי מלאי עדיין":"No inventory items yet"}</td></tr>
          )}
          {items.map(it => { const s=ss[it.status]; const pct=it.minStock>0?Math.min((it.onHand/it.minStock)*100,200):100; return (
            <tr key={it.item} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
              <td className="px-4 py-2.5 font-medium" style={{color:P.text1}}>{isHe?it.itemHe:it.item}</td>
              <td className="px-4 py-2.5" style={{color:P.text2}}>{it.cat}</td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 rounded-full" style={{background:P.border}}><div className="h-1.5 rounded-full" style={{width:`${Math.min(pct,100)}%`,background:s.color}}/></div>
                  <span className="font-mono font-bold text-[11px]" style={{color:s.color}}>{it.onHand.toLocaleString()}</span>
                </div>
              </td>
              <td className="px-4 py-2.5 font-mono text-[11px]" style={{color:P.text3}}>{it.minStock.toLocaleString()}</td>
              <td className="px-4 py-2.5 font-mono text-[11px]" style={{color:P.text2}}>{it.dailyUsage}</td>
              <td className="px-4 py-2.5 text-[11px]" style={{color:P.text3}}>{it.unit}</td>
              <td className="px-4 py-2.5"><Chip label={isHe?s.labelHe:s.label} bg={s.bg} color={s.color}/></td>
            </tr>
          );})}
        </tbody></table>
      </Card>
    </>
  );
}

function SiteDiary({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const ai = isHe
    ? "יציקת הבטון בכן P7 מתקדמת היטב — 87 מ\"ק הונחו עד 13:00. תעלת תשתיות אזור D חסומה בשל סכסוך גישה לקרקע; צפי עיכוב יומיים."
    : "Concrete pour at P7 progressing well — 87m³ placed by 13:00. Zone D utility trench blocked by land access dispute; expect 2-day delay.";
  const work: {zone:string;activity:string;actHe:string;crew:string;qty:string;note:string;noteHe:string}[] = isDemo ? [
    {zone:"A",activity:"Road base compaction – Sec. A",    actHe:"דחיסת שכבת בסיס – קטע A",    crew:"Crew F – Mizrahi",  qty:"500 m",  note:"Passed compaction test (98% MDD)", noteHe:"עבר בדיקת דחיסה (98% MDD)"},
    {zone:"B",activity:"Concrete pour – Bridge pier P7",   actHe:"יציקת בטון – כן גשר P7",     crew:"Crew A – Levy",     qty:"87 m³",  note:"Pour ongoing, est. complete 16:00",noteHe:"יציקה בביצוע, צפי סיום 16:00"},
    {zone:"B",activity:"Formwork stripping – deck 4A",     actHe:"פירוק קינוף – מקטע גשר 4A",  crew:"Crew C – Dror",     qty:"180 m²", note:"Complete",                        noteHe:"הושלם"},
    {zone:"C",activity:"Pile drilling – positions 29–34",  actHe:"קידוח יסודות – עמדות 29–34", crew:"Drill – Goldberg",  qty:"6 piles",note:"4 of 6 complete",                 noteHe:"4 מתוך 6 הושלמו"},
    {zone:"D",activity:"Utility trench – Section 2",       actHe:"חפירת תשתיות – קטע 2",       crew:"Crew E – Ben-Ami",  qty:"0 m",    note:"BLOCKED – land access dispute",    noteHe:"חסום – סכסוך גישה לקרקע"},
  ] : [];
  const issues: {type:string;desc:string;descHe:string;reporter:string}[] = isDemo ? [
    {type:"Blocker",  desc:"Zone D private land access blocked by owner",        descHe:"גישה לקרקע פרטית באזור D חסומה",     reporter:"Eng. Cohen"},
    {type:"Issue",    desc:"Concrete pump #2 hydraulic oil leak – removed",       descHe:"דליפת שמן משאבת בטון #2 – הוצאה",   reporter:"Foreman Levy"},
    {type:"Positive", desc:"Zone B pile crew – safety audit zero findings",       descHe:"צוות יסודות B – ביקורת בטיחות ללא ממצאים",reporter:"S.O. Ben-Ami"},
    {type:"Near Miss",desc:"Crane slew near unsupervised pedestrian path Zone C", descHe:"עגורן סב ליד שביל הולכי רגל לא מפוקח",reporter:"S.O. Dror Katz"},
  ] : [];
  const issueStyle: Record<string,{bg:string;color:string}> = { Blocker:{bg:P.dangerBg,color:P.danger}, Issue:{bg:P.warnBg,color:P.warn}, Positive:{bg:P.goodBg,color:P.good}, "Near Miss":{bg:"#FEF2F2",color:"#7F1D1D"} };
  const wcols = isHe ? ["אזור","פעילות","צוות","כמות","הערות"] : ["Zone","Activity","Crew","Qty","Notes"];
  const icols = isHe ? ["סוג","תיאור","מדווח"] : ["Type","Description","Reporter"];
  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {(isDemo
          ? [{label:isHe?"מזג אוויר":"Weather",val:"☀ 31°C"},{label:isHe?"עובדים":"Workers on Site",val:"312"},{label:isHe?"מבקרים":"Visitors",val:"4"},{label:isHe?"שעות עבודה":"Manhours",val:"1,842"}]
          : [{label:isHe?"מזג אוויר":"Weather",val:"–"},{label:isHe?"עובדים":"Workers on Site",val:"–"},{label:isHe?"מבקרים":"Visitors",val:"–"},{label:isHe?"שעות עבודה":"Manhours",val:"–"}]
        ).map((k,i)=>(
          <Card key={k.label} className="p-4"><p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{color:P.text3}}>{k.label}</p><p className="text-[26px] font-bold" style={{color:[P.text1,P.copper,P.text1,P.good][i]}}>{k.val}</p></Card>
        ))}
      </div>
      {isDemo && <AIBanner label={isHe?"סיכום יומן AI":"AI Diary Summary"} text={ai} />}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card>
            <div className="px-5 pt-4 pb-2"><p className="text-[14px] font-bold" style={{color:P.text1}}>{isHe?"פעילויות עבודה":"Work Activities"}</p></div>
            <table className="w-full text-[12px]"><THead cols={wcols}/><tbody>
              {work.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין רשומות יומן עדיין":"No diary entries yet"}</td></tr>
              )}
              {work.map((a,i)=>(
                <tr key={i} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
                  <td className="px-4 py-2.5 text-center"><ZoneBadge z={a.zone}/></td>
                  <td className="px-4 py-2.5 font-medium" style={{color:P.text1}}>{isHe?a.actHe:a.activity}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap" style={{color:P.text2}}>{a.crew}</td>
                  <td className="px-4 py-2.5 font-mono font-bold" style={{color:P.text1}}>{a.qty}</td>
                  <td className="px-4 py-2.5" style={{color:a.note.includes("BLOCKED")?P.danger:P.text3}}>{isHe?a.noteHe:a.note}</td>
                </tr>
              ))}
            </tbody></table>
          </Card>
        </div>
        <Card className="p-4">
          <p className="text-[14px] font-bold mb-3" style={{color:P.text1}}>{isHe?"נושאים ותצפיות":"Issues & Observations"}</p>
          <div className="space-y-2">
            {issues.length === 0 && (
              <p className="text-[12px] text-center py-6" style={{color:P.text3}}>{isHe?"אין נושאים או תצפיות עדיין":"No issues or observations yet"}</p>
            )}
            {issues.map((iss,i)=>{ const s=issueStyle[iss.type]; return (
              <div key={i} className="p-3 rounded-xl" style={{background:s.bg}}>
                <div className="flex items-center gap-1.5 mb-1"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{background:s.bg,color:s.color}}>{iss.type}</span><span className="text-[10px]" style={{color:P.text3}}>{iss.reporter}</span></div>
                <p className="text-[12px]" style={{color:P.text1}}>{isHe?iss.descHe:iss.desc}</p>
              </div>
            );})}
          </div>
          <div className="mt-3 pt-3" style={{borderTop:`1px solid ${P.border}`}}>
            <p className="text-[13px] font-bold mb-2" style={{color:P.text1}}>{isHe?"תמונות":"Photos"}</p>
            {isDemo ? (
              <div className="grid grid-cols-4 gap-1.5">
                {[...Array(8)].map((_,i)=><div key={i} className="aspect-square rounded-lg flex items-center justify-center" style={{background:P.bg,border:`1px solid ${P.border}`}}><Camera className="w-4 h-4" style={{color:P.text3}}/></div>)}
              </div>
            ) : (
              <p className="text-[12px] text-center py-4" style={{color:P.text3}}>{isHe?"אין תמונות עדיין":"No photos yet"}</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

function Equipment({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const kpisRaw = isHe
    ? [{ label:"סה\"כ צי", val:"42" }, { label:"פעיל", val:"31" }, { label:"לא פעיל", val:"7" }, { label:"תקלה/תיקון", val:"4" }]
    : [{ label:"Total Fleet", val:"42" }, { label:"Active", val:"31" }, { label:"Idle / Standby", val:"7" }, { label:"Breakdown", val:"4" }];
  const kpis = isDemo ? kpisRaw : kpisRaw.map(k => ({ ...k, val: "–" }));
  const ai = isHe
    ? "משאבת בטון #2 תקלה מפחיתה קיבולת יציקה ב-50%. מחפרים באזור A בניצול 34% — שקול העברה לאזור C."
    : "Concrete pump #2 breakdown reduces pour capacity 50%. Excavator utilization in Zone A at 34% — consider redeployment to Zone C.";
  type ES = "ACTIVE"|"IDLE"|"BREAKDOWN"|"MAINTENANCE";
  const equip: {id:string;desc:string;descHe:string;type:string;zone:string;hours:string;util:number;status:ES;next:string}[] = isDemo ? [
    {id:"EXC-01",desc:"Komatsu PC360 Excavator",       descHe:"מחפר קומטסו PC360",       type:"Excavator",    zone:"C",hours:"9.5h",util:79,status:"ACTIVE",     next:"15 Jul"},
    {id:"EXC-02",desc:"Caterpillar 336 Excavator",     descHe:"מחפר קטרפילר 336",        type:"Excavator",    zone:"C",hours:"10h", util:83,status:"ACTIVE",     next:"22 Jul"},
    {id:"EXC-03",desc:"Hitachi ZX350 Excavator",       descHe:"מחפר היטאצ'י ZX350",      type:"Excavator",    zone:"A",hours:"4h",  util:34,status:"IDLE",       next:"28 Jul"},
    {id:"EXC-04",desc:"Volvo EC380 Excavator",         descHe:"מחפר וולוו EC380",         type:"Excavator",    zone:"D",hours:"0h",  util:0, status:"BREAKDOWN",  next:"Repair"},
    {id:"DRL-01",desc:"Soilmec SR-75 Piling Rig",      descHe:"מכשור קידוח Soilmec SR-75",type:"Piling Rig",  zone:"C",hours:"11h", util:92,status:"ACTIVE",     next:"10 Jul"},
    {id:"CRN-01",desc:"Liebherr LTM 1100 Crane",       descHe:"עגורן ליבהר LTM 1100",    type:"Mobile Crane", zone:"B",hours:"8h",  util:67,status:"ACTIVE",     next:"20 Jul"},
    {id:"PMP-01",desc:"Putzmeister M52-5 Concrete Pump",descHe:"משאבת בטון פוצמייסטר",   type:"Concrete Pump",zone:"B",hours:"7h",  util:58,status:"ACTIVE",     next:"8 Jul" },
    {id:"PMP-02",desc:"Schwing S47 SX Concrete Pump",  descHe:"משאבת בטון שוויינג",       type:"Concrete Pump",zone:"B",hours:"0h",  util:0, status:"BREAKDOWN",  next:"Repair"},
    {id:"GRD-01",desc:"Caterpillar 140M Motor Grader",  descHe:"מגרדה קטרפילר 140M",      type:"Grader",       zone:"A",hours:"6h",  util:50,status:"ACTIVE",     next:"25 Jul"},
    {id:"CPT-01",desc:"Bomag BW 213 D-50 Roller",       descHe:"גלגלת בומאג BW 213",       type:"Compactor",    zone:"A",hours:"8h",  util:67,status:"ACTIVE",     next:"14 Jul"},
    {id:"CPT-02",desc:"Hamm HD 120 VV Tandem Roller",   descHe:"גלגלת טנדם האם HD 120",   type:"Compactor",    zone:"A",hours:"0h",  util:0, status:"MAINTENANCE",next:"Today" },
  ] : [];
  const ss: Record<ES,{bg:string;color:string}> = { ACTIVE:{bg:P.goodBg,color:P.good}, IDLE:{bg:"#F1F5F9",color:"#475569"}, BREAKDOWN:{bg:P.dangerBg,color:P.danger}, MAINTENANCE:{bg:P.warnBg,color:P.warn} };
  const cols = isHe ? ["מזהה","ציוד","סוג","אזור","שעות היום","ניצול","סטטוס","טיפול הבא"] : ["ID","Equipment","Type","Zone","Hours Today","Utilization","Status","Next Service"];
  return (
    <>
      <KPIRow items={kpis} colors={[P.text1, P.good, "#475569", P.danger]} />
      {isDemo && <AIBanner label={isHe?"תובנת AI לצי ציוד":"AI Fleet Insight"} text={ai} />}
      <Card>
        <table className="w-full text-[12px]"><THead cols={cols}/><tbody>
          {equip.length === 0 && (
            <tr><td colSpan={8} className="px-3 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין ציוד עדיין":"No equipment yet"}</td></tr>
          )}
          {equip.map(e=>{ const s=ss[e.status]; return (
            <tr key={e.id} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
              <td className="px-3 py-2.5 font-mono text-[11px]" style={{color:P.text3}}>{e.id}</td>
              <td className="px-3 py-2.5 font-medium" style={{color:P.text1}}>{isHe?e.descHe:e.desc}</td>
              <td className="px-3 py-2.5" style={{color:P.text2}}>{e.type}</td>
              <td className="px-3 py-2.5 text-center"><ZoneBadge z={e.zone}/></td>
              <td className="px-3 py-2.5 font-mono" style={{color:P.text2}}>{e.hours}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2"><div className="w-14 h-1.5 rounded-full" style={{background:P.border}}><div className="h-1.5 rounded-full" style={{width:`${e.util}%`,background:e.util>70?P.good:e.util>40?P.warn:e.util===0?P.danger:"#94A3B8"}}/></div><span className="text-[11px] font-bold" style={{color:P.text2}}>{e.util}%</span></div>
              </td>
              <td className="px-3 py-2.5"><Chip label={e.status} bg={s.bg} color={s.color}/></td>
              <td className="px-3 py-2.5 text-[11px]" style={{color:e.next==="Repair"?P.danger:e.next==="Today"?P.warn:P.text3}}>{e.next}</td>
            </tr>
          );})}
        </tbody></table>
      </Card>
    </>
  );
}

function Subcontractors({ isHe, isDemo }: { isHe: boolean; isDemo: boolean }) {
  const kpisRaw = isHe
    ? [{ label:"קבלני משנה פעילים", val:"14" }, { label:"עובדים באתר", val:"218" }, { label:"ביצוע ממוצע", val:"82%" }, { label:"NCR פתוחים", val:"6" }]
    : [{ label:"Active Subs", val:"14" }, { label:"Workers on Site", val:"218" }, { label:"Avg Performance", val:"82%" }, { label:"Open NCRs", val:"6" }];
  const kpis = isDemo ? kpisRaw : kpisRaw.map(k => ({ ...k, val: "–" }));
  const ai = isHe
    ? "אמבר חפירות נמוכה ב-11% ממטרת הביצוע החודשית עקב בעיות ציוד. צוות הבטון של גל הנדסה — ציון הפרודוקטיביות הגבוה ביותר (94%)."
    : "Ambar Excavations is 11% below performance target due to equipment issues. Gal Civil's concrete crew has the highest productivity score (94%) — consider expanding their scope.";
  type SS2 = "ACTIVE"|"ON HOLD"|"MOBILIZING";
  const subs: {company:string;companyHe:string;trade:string;tradeHe:string;workers:number;contract:string;perf:number;schedule:"ahead"|"on-track"|"behind";ncrs:number;status:SS2}[] = isDemo ? [
    {company:"Ambar Excavations Ltd.",   companyHe:"אמבר חפירות",        trade:"Earthworks",        tradeHe:"עפר",          workers:42,contract:"₪12.4M",perf:71,schedule:"behind",  ncrs:2,status:"ACTIVE"    },
    {company:"Gal Civil Engineering",    companyHe:"גל הנדסה אזרחית",    trade:"Concrete & Formwork",tradeHe:"בטון וקינוף", workers:38,contract:"₪18.7M",perf:94,schedule:"ahead",   ncrs:0,status:"ACTIVE"    },
    {company:"Goldberg Drilling Co.",    companyHe:"חברת קידוח גולדברג", trade:"Piling & Foundations",tradeHe:"יסודות",      workers:22,contract:"₪9.2M", perf:88,schedule:"on-track",ncrs:1,status:"ACTIVE"    },
    {company:"Stern Traffic Management",companyHe:"שטרן ניהול תנועה",   trade:"Traffic Control",    tradeHe:"ניהול תנועה", workers:14,contract:"₪3.1M", perf:96,schedule:"on-track",ncrs:0,status:"ACTIVE"    },
    {company:"Mizrahi MEP Services",    companyHe:"מזרחי שירותי מ.מ.ח", trade:"MEP",                tradeHe:"מ.מ.ח",        workers:29,contract:"₪7.8M", perf:79,schedule:"behind",  ncrs:1,status:"ACTIVE"    },
    {company:"Ben-David Steel Erectors",companyHe:"בן-דוד קונסטרוקטורים",trade:"Structural Steel",  tradeHe:"פלדה",         workers:18,contract:"₪5.4M", perf:85,schedule:"on-track",ncrs:0,status:"ACTIVE"    },
    {company:"Peretz Road Surfacing",   companyHe:"פרץ כבישים",          trade:"Asphalt & Road Base",tradeHe:"אספלט",        workers:16,contract:"₪8.9M", perf:82,schedule:"on-track",ncrs:0,status:"ACTIVE"    },
    {company:"Dror Safety Solutions",   companyHe:"דרור בטיחות",         trade:"Safety & PPE",       tradeHe:"בטיחות",       workers:6, contract:"₪1.2M", perf:98,schedule:"ahead",   ncrs:0,status:"ACTIVE"    },
    {company:"Katz Crane Services",     companyHe:"קץ שירותי עגורנים",   trade:"Lifting Operations", tradeHe:"הרמות",        workers:9, contract:"₪4.6M", perf:87,schedule:"on-track",ncrs:1,status:"ACTIVE"    },
    {company:"Oren Electrical",         companyHe:"אורן חשמל",           trade:"Electrical",         tradeHe:"חשמל",         workers:1, contract:"₪3.4M", perf:0, schedule:"on-track",ncrs:0,status:"MOBILIZING"},
  ] : [];
  const ssStyle: Record<SS2,{bg:string;color:string}> = { ACTIVE:{bg:P.goodBg,color:P.good}, "ON HOLD":{bg:P.warnBg,color:P.warn}, MOBILIZING:{bg:"#EFF6FF",color:"#1D4ED8"} };
  const cols = isHe ? ["חברה","מקצוע","עובדים","חוזה","ביצוע","לוח זמנים","NCR פתוחים","סטטוס"] : ["Company","Trade","Workers","Contract","Performance","Schedule","Open NCRs","Status"];
  return (
    <>
      <KPIRow items={kpis} colors={[P.text1, P.copper, P.good, P.danger]} />
      {isDemo && <AIBanner label={isHe?"תובנת AI לקבלני משנה":"AI Subcontractor Insight"} text={ai} />}
      <Card>
        <table className="w-full text-[12px]"><THead cols={cols}/><tbody>
          {subs.length === 0 && (
            <tr><td colSpan={8} className="px-3 py-10 text-center text-[13px]" style={{color:P.text3}}>{isHe?"אין קבלני משנה עדיין":"No subcontractors yet"}</td></tr>
          )}
          {subs.map(s=>{ const ss=ssStyle[s.status]; const pc=s.perf>=90?P.good:s.perf>=80?P.warn:s.status==="MOBILIZING"?P.text3:P.danger; return (
            <tr key={s.company} className="hover:bg-[#F5F2EF]" style={{borderBottom:`1px solid ${P.border}`}}>
              <td className="px-3 py-2.5 font-semibold" style={{color:P.text1}}>{isHe?s.companyHe:s.company}</td>
              <td className="px-3 py-2.5" style={{color:P.text2}}>{isHe?s.tradeHe:s.trade}</td>
              <td className="px-3 py-2.5 text-center font-bold" style={{color:P.text1}}>{s.workers}</td>
              <td className="px-3 py-2.5 font-mono font-semibold" style={{color:P.text1}}>{s.contract}</td>
              <td className="px-3 py-2.5">
                {s.status==="MOBILIZING"?<span style={{color:P.text3}}>—</span>:(
                  <div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full" style={{background:P.border}}><div className="h-1.5 rounded-full" style={{width:`${s.perf}%`,background:pc}}/></div><span className="text-[11px] font-bold" style={{color:pc}}>{s.perf}%</span></div>
                )}
              </td>
              <td className="px-3 py-2.5">
                {s.schedule==="ahead"    &&<span className="flex items-center gap-1 text-[11px] font-bold" style={{color:P.good}}><TrendingUp className="w-3 h-3"/>Ahead</span>}
                {s.schedule==="on-track"&&<span className="flex items-center gap-1 text-[11px] font-bold" style={{color:"#1D4ED8"}}><CheckCircle2 className="w-3 h-3"/>On Track</span>}
                {s.schedule==="behind"  &&<span className="flex items-center gap-1 text-[11px] font-bold" style={{color:P.danger}}><TrendingDown className="w-3 h-3"/>Behind</span>}
              </td>
              <td className="px-3 py-2.5 text-center">{s.ncrs>0?<Chip label={String(s.ncrs)} bg={P.dangerBg} color={P.danger}/>:<span style={{color:P.text3}}>—</span>}</td>
              <td className="px-3 py-2.5"><Chip label={s.status} bg={ss.bg} color={ss.color}/></td>
            </tr>
          );})}
        </tbody></table>
      </Card>
    </>
  );
}

const TAB_CONTENT: Record<TabId, React.FC<{ isHe: boolean; isDemo: boolean }>> = {
  daily: DailyTasks, weekly: WeeklyPlan, monthly: MonthlyPlan,
  operations: SpecialOps, procurement: Procurement, inventory: Inventory,
  diary: SiteDiary, equipment: Equipment, subcontractors: Subcontractors,
};

/* ─── MAIN PAGE ─── */
export default function ConstructionPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";
  const [activeTab, setActiveTab] = useState<TabId>("daily");
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const c = document.cookie.split(";").find(s => s.trim().startsWith("lang="))?.split("=")[1]?.trim();
    if (c === "he") setLang("he");
  }, []);

  const isHe = lang === "he";
  const tab = TABS.find(t => t.id === activeTab)!;
  const Content = TAB_CONTENT[activeTab];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>
          {isHe ? "בנייה וביצוע" : "Construction"}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px]"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Search className="w-3.5 h-3.5" style={{ color: P.text3 }} />
            <span style={{ color: P.text3 }}>{isHe ? "חיפוש..." : "Search..."}</span>
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Plus className="w-3 h-3" />
            {isHe ? tab.newHe : tab.newEn}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
            style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 pt-3 pb-0 flex items-center gap-1 overflow-x-auto shrink-0"
        style={{ borderBottom: `1px solid ${P.border}`, background: P.card }}>
        {TABS.map(t => {
          const active = t.id === activeTab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-all shrink-0 border-b-2"
              style={{
                color: active ? P.copper : P.text3,
                borderBottomColor: active ? P.copper : "transparent",
                background: "transparent",
                marginBottom: "-1px",
              }}>
              <Icon className="w-3.5 h-3.5" />
              {isHe ? t.labelHe : t.labelEn}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        <Content isHe={isHe} isDemo={isDemo} />
      </div>
    </div>
  );
}
