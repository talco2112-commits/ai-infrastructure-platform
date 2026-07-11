import { cookies } from "next/headers";
import { Bell, Plus, Wrench, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
};

const TRANSLATIONS = {
  en: {
    title: "Plant & Equipment", addEquip: "Add Equipment",
    kpis: [
      { label: "Total Fleet",        val: "42" },
      { label: "Active",             val: "31" },
      { label: "Idle / Standby",     val: "7"  },
      { label: "Breakdown / Repair", val: "4"  },
    ],
    ai: "Concrete pump #2 breakdown reduces pour capacity by 50% for Zone B. Recommend hiring a third-party pump for tomorrow's pour at P8. Excavator utilization in Zone A is at 34% — consider redeployment to Zone C to support pile operations.",
    aiLabel: "AI Fleet Insight",
    colID: "ID", colDesc: "Equipment", colType: "Type", colZone: "Zone",
    colHours: "Hours Today", colUtil: "Utilization", colStatus: "Status", colNext: "Next Service",
    maintenance: "Maintenance Alerts",
  },
  he: {
    title: "ציוד ומכשור", addEquip: "הוסף ציוד",
    kpis: [
      { label: "סה\"כ צי",      val: "42" },
      { label: "פעיל",          val: "31" },
      { label: "לא פעיל/מוכן", val: "7"  },
      { label: "תקלה/תיקון",   val: "4"  },
    ],
    ai: "תקלת משאבת בטון #2 מפחיתה את קיבולת היציקה ב-50% באזור B. מומלץ להשכיר משאבה חיצונית ליציקה של מחר בכן P8. ניצול מחפרים באזור A עומד על 34% — שקול העברה לאזור C לתמיכה בפעולות קידוח.",
    aiLabel: "תובנת AI לצי ציוד",
    colID: "מזהה", colDesc: "ציוד", colType: "סוג", colZone: "אזור",
    colHours: "שעות היום", colUtil: "ניצול", colStatus: "סטטוס", colNext: "טיפול הבא",
    maintenance: "התראות תחזוקה",
  },
};

type EquipStatus = "ACTIVE" | "IDLE" | "BREAKDOWN" | "MAINTENANCE";

const equipment: {
  id: string; desc: string; descHe: string; type: string; typeHe: string;
  zone: string; hours: string; util: number; status: EquipStatus; nextService: string;
}[] = [
  { id:"EXC-01", desc:"Komatsu PC360 Excavator",    descHe:"מחפר קומטסו PC360",      type:"Excavator",     typeHe:"מחפר",          zone:"C", hours:"9.5h", util:79, status:"ACTIVE",      nextService:"15 Jul" },
  { id:"EXC-02", desc:"Caterpillar 336 Excavator",  descHe:"מחפר קטרפילר 336",       type:"Excavator",     typeHe:"מחפר",          zone:"C", hours:"10h",  util:83, status:"ACTIVE",      nextService:"22 Jul" },
  { id:"EXC-03", desc:"Hitachi ZX350 Excavator",    descHe:"מחפר היטאצ'י ZX350",     type:"Excavator",     typeHe:"מחפר",          zone:"A", hours:"4h",   util:34, status:"IDLE",        nextService:"28 Jul" },
  { id:"EXC-04", desc:"Volvo EC380 Excavator",      descHe:"מחפר וולוו EC380",        type:"Excavator",     typeHe:"מחפר",          zone:"D", hours:"0h",   util:0,  status:"BREAKDOWN",   nextService:"Repair" },
  { id:"DRL-01", desc:"Soilmec SR-75 Piling Rig",   descHe:"מכונת קידוח Soilmec SR-75",type:"Piling Rig",  typeHe:"מכשור קידוח",   zone:"C", hours:"11h",  util:92, status:"ACTIVE",      nextService:"10 Jul" },
  { id:"CRN-01", desc:"Liebherr LTM 1100 Crane",    descHe:"עגורן ליבהר LTM 1100",   type:"Mobile Crane",  typeHe:"עגורן נייד",    zone:"B", hours:"8h",   util:67, status:"ACTIVE",      nextService:"20 Jul" },
  { id:"CRN-02", desc:"Tadano ATF 60G-4 Crane",     descHe:"עגורן טאדאנו ATF 60G-4", type:"Mobile Crane",  typeHe:"עגורן נייד",    zone:"B", hours:"6h",   util:50, status:"ACTIVE",      nextService:"5 Aug"  },
  { id:"DMP-01", desc:"Caterpillar 745 Articulated", descHe:"משאית כתף קטרפילר 745",  type:"Dump Truck",    typeHe:"משאית כתף",     zone:"C", hours:"9h",   util:75, status:"ACTIVE",      nextService:"12 Jul" },
  { id:"DMP-02", desc:"Volvo A40G Dump Truck",       descHe:"משאית כתף וולוו A40G",   type:"Dump Truck",    typeHe:"משאית כתף",     zone:"C", hours:"8.5h", util:71, status:"ACTIVE",      nextService:"18 Jul" },
  { id:"DMP-03", desc:"Komatsu HM400 Dump Truck",    descHe:"משאית כתף קומטסו HM400", type:"Dump Truck",    typeHe:"משאית כתף",     zone:"A", hours:"0h",   util:0,  status:"IDLE",        nextService:"30 Jul" },
  { id:"PMP-01", desc:"Putzmeister M52-5 Concrete Pump", descHe:"משאבת בטון פוצמייסטר M52-5", type:"Concrete Pump", typeHe:"משאבת בטון", zone:"B", hours:"7h", util:58, status:"ACTIVE", nextService:"8 Jul"  },
  { id:"PMP-02", desc:"Schwing S47 SX Concrete Pump",descHe:"משאבת בטון שוויינג S47 SX",type:"Concrete Pump",typeHe:"משאבת בטון", zone:"B", hours:"0h",   util:0,  status:"BREAKDOWN",   nextService:"Repair" },
  { id:"GRD-01", desc:"Caterpillar 140M Motor Grader",descHe:"מגרדה קטרפילר 140M",    type:"Grader",        typeHe:"מגרדה",         zone:"A", hours:"6h",   util:50, status:"ACTIVE",      nextService:"25 Jul" },
  { id:"CPT-01", desc:"Bomag BW 213 D-50 Roller",    descHe:"גלגלת בומאג BW 213 D-50",type:"Compactor",    typeHe:"גלגלת דחיסה",   zone:"A", hours:"8h",   util:67, status:"ACTIVE",      nextService:"14 Jul" },
  { id:"CPT-02", desc:"Hamm HD 120 VV Tandem Roller", descHe:"גלגלת טנדם האם HD 120", type:"Compactor",    typeHe:"גלגלת דחיסה",   zone:"A", hours:"7.5h", util:63, status:"MAINTENANCE", nextService:"Today"  },
];

const statusStyle: Record<EquipStatus, { bg: string; color: string }> = {
  ACTIVE:      { bg: P.goodBg,   color: P.good    },
  IDLE:        { bg: "#F1F5F9",  color: "#475569"  },
  BREAKDOWN:   { bg: P.dangerBg, color: P.danger  },
  MAINTENANCE: { bg: P.warnBg,   color: P.warn    },
};

const kpiColors = [P.text1, P.good, "#475569", P.danger];

const maintenanceAlerts = [
  { id:"EXC-04", desc:"Hydraulic cylinder seal failure – requires replacement",  descHe:"כשל מיכל הידראולי – מצריך החלפה",   severity:"BREAKDOWN" },
  { id:"PMP-02", desc:"Hydraulic oil leak – removed from service",               descHe:"דליפת שמן הידראולי – הוצא משירות",  severity:"BREAKDOWN" },
  { id:"CPT-02", desc:"Scheduled service due today – drum bearing inspection",   descHe:"טיפול תזמוני היום – בדיקת מיסב תוף", severity:"MAINTENANCE" },
  { id:"DRL-01", desc:"Overdue 250h service – schedule within 3 days",          descHe:"טיפול 250 שעות באיחור – תזמן תוך 3 ימים", severity:"MAINTENANCE" },
];

export default async function EquipmentPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg }}>
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white" style={{ background: P.copper }}>
            <Plus className="w-3 h-3" /> {T.addEquip}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {T.kpis.map((k, i) => (
            <div key={k.label} className="rounded-2xl p-4"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{k.label}</p>
              <p className="text-[28px] font-bold" style={{ color: kpiColors[i] }}>{k.val}</p>
            </div>
          ))}
        </div>

        {/* AI */}
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: P.warnBg, border: "1px solid #FDE68A" }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
            <Lightbulb className="w-3.5 h-3.5" style={{ color: P.warn }} />
          </div>
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: P.warn }}>{T.aiLabel}</p>
            <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.ai}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Equipment Table */}
          <div className="col-span-3 rounded-2xl overflow-hidden"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colID, T.colDesc, T.colType, T.colZone, T.colHours, T.colUtil, T.colStatus, T.colNext].map(h => (
                    <th key={h} className="px-3 py-3 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipment.map((e) => {
                  const ss = statusStyle[e.status];
                  return (
                    <tr key={e.id} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: P.text3 }}>{e.id}</td>
                      <td className="px-3 py-2.5 font-medium" style={{ color: P.text1 }}>{isHe ? e.descHe : e.desc}</td>
                      <td className="px-3 py-2.5" style={{ color: P.text2 }}>{isHe ? e.typeHe : e.type}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto"
                          style={{ background: P.copperLight, color: P.copper }}>{e.zone}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono" style={{ color: P.text2 }}>{e.hours}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: P.border }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${e.util}%`, background: e.util > 70 ? P.good : e.util > 40 ? P.warn : e.util === 0 ? P.danger : "#94A3B8" }} />
                          </div>
                          <span className="text-[11px] font-bold w-8" style={{ color: P.text2 }}>{e.util}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color }}>{e.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px]" style={{ color: e.nextService === "Repair" ? P.danger : e.nextService === "Today" ? P.warn : P.text3 }}>{e.nextService}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Maintenance Alerts */}
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.maintenance}</h3>
            {maintenanceAlerts.map((a) => {
              const isBreak = a.severity === "BREAKDOWN";
              return (
                <div key={a.id} className="p-3 rounded-xl" style={{ background: isBreak ? P.dangerBg : P.warnBg, border: `1px solid ${isBreak ? "#FECACA" : "#FDE68A"}` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {isBreak ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} /> : <Wrench className="w-3.5 h-3.5" style={{ color: P.warn }} />}
                    <span className="text-[11px] font-bold font-mono" style={{ color: isBreak ? P.danger : P.warn }}>{a.id}</span>
                  </div>
                  <p className="text-[12px]" style={{ color: P.text2 }}>{isHe ? a.descHe : a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
