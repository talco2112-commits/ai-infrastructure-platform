import { cookies } from "next/headers";
import { Bell, Search, Satellite, RefreshCw, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";

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
    title: "Site Progress",
    lastScan: "Last scan: Today 07:14",
    refresh: "Refresh",
    view3d: "View 3D Model",
    actual: "Actual",
    planned: "Planned",
    variance: "Variance",
    droneScan: "Drone scan:",
    activityLogTitle: "DatumBIM Activity Log",
    measurementsTitle: "Key Measurements",
    zoneLabel: "Zone",
    statuses: {
      AHEAD: "AHEAD",
      BEHIND: "BEHIND",
      "SLIGHT DELAY": "SLIGHT DELAY",
      "CRITICAL DELAY": "CRITICAL DELAY",
    },
    measurements: [
      { label: "Total Excavation Volume",      sub: "of 481,000 m³ target" },
      { label: "Concrete Poured (Cumulative)", sub: "piles, caps & walls"  },
      { label: "Structural Steel Erected",     sub: "of 3,400 t total"     },
      { label: "Compacted Subgrade",           sub: "of 102,000 m² total"  },
      { label: "Utility Pipe Installed",       sub: "of 16,500 LM total"   },
      { label: "Drainage Works",               sub: "of 9,100 LM total"    },
    ],
  },
  he: {
    title: "התקדמות אתר",
    lastScan: "סריקה אחרונה: היום 07:14",
    refresh: "רענן",
    view3d: "פתח מודל תלת-ממד",
    actual: "בפועל",
    planned: "מתוכנן",
    variance: "סטייה",
    droneScan: "סריקת רחפן:",
    activityLogTitle: "יומן פעילות DatumBIM",
    measurementsTitle: "מדידות מרכזיות",
    zoneLabel: "אזור",
    statuses: {
      AHEAD: "מקדים",
      BEHIND: "מאחר",
      "SLIGHT DELAY": "איחור קל",
      "CRITICAL DELAY": "איחור קריטי",
    },
    measurements: [
      { label: "נפח חפירה כולל",         sub: "מתוך 481,000 מ״ק יעד"   },
      { label: "בטון שנוצק (מצטבר)",     sub: "קלונסאות, כובעים, קירות" },
      { label: "פלדה מבנית שהוקמה",      sub: "מתוך 3,400 טון"          },
      { label: "תת-בסיס מוכן",           sub: "מתוך 102,000 מ״ר"        },
      { label: "צינורות תשתית שהונחו",   sub: "מתוך 16,500 מ״ר"         },
      { label: "עבודות ניקוז",           sub: "מתוך 9,100 מ״ר"          },
    ],
  },
};

const zones = [
  { id: "A", name: "Zone A – Earthworks",  actual: 89, planned: 85, diff: 4,   status: "AHEAD",          scanDate: "27 Jun 2026", statusColor: P.good,   statusBg: P.goodBg,   activities: "Bulk excavation 92% · Subgrade prep 61%" },
  { id: "B", name: "Zone B – Foundations", actual: 74, planned: 79, diff: -5,  status: "BEHIND",         scanDate: "27 Jun 2026", statusColor: P.warn,   statusBg: P.warnBg,   activities: "Piling Sec.A 65% · Sub-base 15%" },
  { id: "C", name: "Zone C – Structures",  actual: 52, planned: 55, diff: -3,  status: "SLIGHT DELAY",   scanDate: "26 Jun 2026", statusColor: P.warn,   statusBg: P.warnBg,   activities: "Retaining walls 28% · Subgrade 61%" },
  { id: "D", name: "Zone D – Utilities",   actual: 23, planned: 37, diff: -14, status: "CRITICAL DELAY", scanDate: "26 Jun 2026", statusColor: P.danger, statusBg: P.dangerBg, activities: "Utility relocation 23% · Blockage at Ch.2+450" },
];

const activityLog = [
  { icon: "scan",  time: "27 Jun 07:14", text: "Drone scan completed – Zone A & B. 847 photos processed. Photogrammetry model updated.",           zone: "A/B" },
  { icon: "alert", time: "26 Jun 16:52", text: "AI detected deviation: Zone D utility trench depth -0.4m below design at Ch.2+380 to Ch.2+450.", zone: "D"   },
  { icon: "ok",    time: "26 Jun 14:30", text: "Bridge 68 pier P7 formwork inspection passed. Concrete pour cleared for 29 Jun.",                 zone: "B"   },
  { icon: "scan",  time: "26 Jun 07:11", text: "Drone scan completed – Zone C & D. Volume calculations updated. Cut/fill balance report ready.",  zone: "C/D" },
  { icon: "alert", time: "25 Jun 11:20", text: "Zone B pile SP-42 drilling halted: obstruction encountered at -14m. Geotechnical review initiated.", zone: "B" },
  { icon: "ok",    time: "24 Jun 15:00", text: "Monthly progress photos uploaded – all zones. Owner report package auto-generated.",               zone: "All" },
];

const measurementVals = ["428,350 m³", "18,240 m³", "820 t", "61,800 m²", "3,840 LM", "4,620 LM"];
const measurementPcts = [89, 42, 24, 61, 23, 51];

function Ring({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const stroke = 5;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const c = size / 2;
  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={P.track} strokeWidth={stroke} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="relative text-[13px] font-bold" style={{ color: P.text1 }}>{pct}%</span>
    </div>
  );
}

export default async function SiteProgressPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";
  const isHe = lang === "he";
  const T = TRANSLATIONS[lang];

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            DatumBIM Live
          </div>
          <span className="text-[11px]" style={{ color: P.text3 }}>{T.lastScan}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
            <RefreshCw className="w-3 h-3" /> {T.refresh}
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Layers className="w-3 h-3" /> {T.view3d}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">

        {/* Zone progress grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {zones.map((z) => (
            <div key={z.id} className="rounded-2xl p-5"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: P.text3 }}>{T.zoneLabel} {z.id}</p>
                  <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{z.name}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: P.text3 }}>{T.droneScan} {z.scanDate}</p>
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: z.statusBg, color: z.statusColor }}>
                  {T.statuses[z.status as keyof typeof T.statuses] ?? z.status}
                </span>
              </div>

              <div className="flex items-center gap-5">
                <Ring pct={z.actual} color={z.statusColor} size={72} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[10.5px]" style={{ color: P.text3 }}>{T.actual}</p>
                      <p className="text-[20px] font-bold" style={{ color: z.statusColor }}>{z.actual}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10.5px]" style={{ color: P.text3 }}>{T.planned}</p>
                      <p className="text-[20px] font-bold" style={{ color: P.text2 }}>{z.planned}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10.5px]" style={{ color: P.text3 }}>{T.variance}</p>
                      <p className="text-[20px] font-bold" style={{ color: z.diff >= 0 ? P.good : P.danger }}>
                        {z.diff > 0 ? "+" : ""}{z.diff}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: P.track }}>
                    <div className="h-full rounded-full" style={{ width: `${z.actual}%`, background: z.statusColor }} />
                  </div>
                  <p className="text-[10.5px] mt-1.5" style={{ color: P.text3 }}>{z.activities}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">

          {/* Activity log */}
          <div className="col-span-2 rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold mb-4" style={{ color: P.text1 }}>{T.activityLogTitle}</h3>
            <div className="flex flex-col gap-3">
              {activityLog.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: item.icon === "alert" ? P.dangerBg : item.icon === "ok" ? P.goodBg : P.copperLight,
                    }}>
                    {item.icon === "alert"
                      ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
                      : item.icon === "ok"
                      ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: P.good }} />
                      : <Satellite className="w-3.5 h-3.5" style={{ color: P.copper }} />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10.5px] font-bold" style={{ color: P.text3 }}>{item.time}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: P.bg, color: P.text3 }}>{T.zoneLabel} {item.zone}</span>
                    </div>
                    <p className="text-[12px]" style={{ color: P.text2 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="rounded-2xl p-5"
            style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold mb-4" style={{ color: P.text1 }}>{T.measurementsTitle}</h3>
            <div className="flex flex-col gap-3">
              {T.measurements.map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] font-medium" style={{ color: P.text2 }}>{m.label}</p>
                    <p className="text-[11px] font-bold" style={{ color: P.copper }}>{measurementPcts[i]}%</p>
                  </div>
                  <p className="text-[13px] font-bold mb-1" style={{ color: P.text1 }}>{measurementVals[i]}</p>
                  <div className="w-full h-1.5 rounded-full" style={{ background: P.track }}>
                    <div className="h-full rounded-full" style={{ width: `${measurementPcts[i]}%`, background: P.copper }} />
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: P.text3 }}>{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
