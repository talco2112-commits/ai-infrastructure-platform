import { cookies } from "next/headers";
import { Bell, Plus, Lightbulb, Truck, AlertTriangle } from "lucide-react";

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
    title: "Procurement", newPO: "New PO",
    kpis: [
      { label: "Open Purchase Orders", val: "23"    },
      { label: "Pending Approval",     val: "7"     },
      { label: "Value Committed",      val: "₪28.4M"},
      { label: "On-Time Delivery",     val: "81%"   },
    ],
    ai: "Rebar delivery from Haifa Steel is 6 days late — pile cage fabrication in Zone C will stall by 4 July if not resolved. Concrete cement stock reaches critical level on 5 July at current pour rates. Recommend expediting PO-2024-187 (cement) and issuing a shortage notice to Haifa Steel today.",
    aiLabel: "AI Procurement Alert",
    poTitle: "Purchase Orders", reqTitle: "Material Requests — Awaiting Approval",
    colPO: "PO #", colMaterial: "Material", colSupplier: "Supplier", colQty: "Qty",
    colUnit: "Unit", colValue: "Value", colDelivery: "Expected Delivery", colStatus: "Status",
    colReq: "Request #", colDesc: "Description", colRequestor: "Requestor", colUrgency: "Urgency",
  },
  he: {
    title: "רכש", newPO: "הזמנת רכש חדשה",
    kpis: [
      { label: "הזמנות רכש פתוחות", val: "23"    },
      { label: "ממתינות לאישור",    val: "7"     },
      { label: "ערך מחויב",         val: "28.4M ₪"},
      { label: "אספקה בזמן",        val: "81%"   },
    ],
    ai: "משלוח ברזל מפלדה חיפה באיחור של 6 ימים — ייצור כלובי קידוח באזור C ייעצר ב-4 יולי אם לא ייפתר. מלאי מלט בטון מגיע לרמה קריטית ב-5 יולי בקצב היציקות הנוכחי. מומלץ להאיץ הזמנה PO-2024-187 (מלט) ולהנפיק הודעת מחסור לפלדה חיפה היום.",
    aiLabel: "התראת רכש AI",
    poTitle: "הזמנות רכש", reqTitle: "בקשות חומרים — ממתינות לאישור",
    colPO: "מס' הזמנה", colMaterial: "חומר", colSupplier: "ספק", colQty: "כמות",
    colUnit: "יחידה", colValue: "ערך", colDelivery: "אספקה צפויה", colStatus: "סטטוס",
    colReq: "מס' בקשה", colDesc: "תיאור", colRequestor: "מבקש", colUrgency: "דחיפות",
  },
};

type POStatus = "DELIVERED" | "IN TRANSIT" | "CONFIRMED" | "DELAYED" | "PENDING";

const purchaseOrders: {
  po: string; material: string; matHe: string; supplier: string;
  qty: string; unit: string; value: string; delivery: string; status: POStatus;
}[] = [
  { po:"PO-2024-182", material:"Rebar 20mm HY deformed bars",       matHe:"ברזל 20 מ\"מ עמוד",               supplier:"Haifa Steel Ltd.",        qty:"48.5",  unit:"t",   value:"₪485,000",   delivery:"26 Jun", status:"DELAYED"    },
  { po:"PO-2024-183", material:"Ready-mix concrete C35/45",         matHe:"בטון מוכן C35/45",                supplier:"Nesher Ready-Mix",        qty:"320",   unit:"m³",  value:"₪192,000",   delivery:"2 Jul",  status:"CONFIRMED"  },
  { po:"PO-2024-184", material:"Prestressed concrete strand 15.2mm", matHe:"כבל פרסטרס 15.2 מ\"מ",           supplier:"Elco Industries",         qty:"2.4",   unit:"t",   value:"₪216,000",   delivery:"5 Jul",  status:"IN TRANSIT" },
  { po:"PO-2024-185", material:"Structural formwork H20 beams",      matHe:"קורות טפסנות H20",                supplier:"Doka Israel",             qty:"840",   unit:"lm",  value:"₪126,000",   delivery:"3 Jul",  status:"IN TRANSIT" },
  { po:"PO-2024-186", material:"Waterproof membrane – Bridge deck",  matHe:"ממברנה אטום – גשר",              supplier:"Sika Israel",             qty:"1,200", unit:"m²",  value:"₪84,000",    delivery:"8 Jul",  status:"CONFIRMED"  },
  { po:"PO-2024-187", material:"Portland cement CEM I 52.5",        matHe:"מלט פורטלנד CEM I 52.5",         supplier:"Nesher Cement Ltd.",      qty:"120",   unit:"t",   value:"₪62,400",    delivery:"4 Jul",  status:"PENDING"    },
  { po:"PO-2024-188", material:"Drainage geotextile 200 g/m²",      matHe:"ג'יאוטקסטיל ניקוז 200 גרם/מ\"ר",supplier:"Polyplex Israel",         qty:"2,400", unit:"m²",  value:"₪28,800",    delivery:"6 Jul",  status:"CONFIRMED"  },
  { po:"PO-2024-189", material:"Shotcrete accelerator (bulk)",       matHe:"מאיץ שוטקריט (בתפזורת)",         supplier:"Basf Construction",       qty:"8",     unit:"t",   value:"₪48,000",    delivery:"1 Jul",  status:"DELIVERED"  },
  { po:"PO-2024-190", material:"Pile casing 600mm steel pipes",      matHe:"צנרת פלדה 600 מ\"מ לקידוח",      supplier:"Mechling Steel",          qty:"18",    unit:"no.", value:"₪324,000",   delivery:"9 Jul",  status:"CONFIRMED"  },
  { po:"PO-2024-191", material:"Rockbolt & grouting kit Zone D",     matHe:"עוגן סלע וערכת הזרקה אזור D",    supplier:"Geotech Supply Ltd.",     qty:"240",   unit:"set", value:"₪72,000",    delivery:"7 Jul",  status:"PENDING"    },
  { po:"PO-2024-192", material:"Traffic signal equipment – Package 1",matHe:"ציוד אותות תנועה – חבילה 1",    supplier:"Siemens Road Tech",       qty:"1",     unit:"lot", value:"₪1,240,000", delivery:"15 Jul", status:"CONFIRMED"  },
  { po:"PO-2024-193", material:"Diesel fuel (bulk delivery)",        matHe:"סולר (אספקה בתפזורת)",           supplier:"Paz Fuel Systems",        qty:"12,000",unit:"L",   value:"₪74,400",    delivery:"4 Jul",  status:"CONFIRMED"  },
];

const materialRequests = [
  { req:"MR-2024-067", desc:"Additional rebar 12mm for drainage culverts Zone A",  descHe:"ברזל 12 מ\"מ נוסף לתעלות ניקוז אזור A", requestor:"Eng. Katz",     urgency:"HIGH"   },
  { req:"MR-2024-068", desc:"Epoxy injection kits for bridge deck cracks repair",  descHe:"ערכות הזרקת אפוקסי לתיקון סדקי גשר",    requestor:"Eng. Cohen",    urgency:"MEDIUM" },
  { req:"MR-2024-069", desc:"Bearing pads – Bridge abutment A1 (8 no.)",          descHe:"כריות מיסב – משקוף גשר A1 (8 יחידות)",  requestor:"Foreman Peretz", urgency:"HIGH"   },
  { req:"MR-2024-070", desc:"Precast manhole rings 1200mm (6 no.) – Zone C",      descHe:"טבעות ביוב מוגמרות 1200 מ\"מ (6 יחידות) – אזור C", requestor:"Eng. Levy", urgency:"LOW" },
  { req:"MR-2024-071", desc:"Survey targets and prisms for BIM integration",       descHe:"מטרות ופריזמות מדידה לאינטגרציית BIM",    requestor:"Surveyor Shapira", urgency:"MEDIUM" },
  { req:"MR-2024-072", desc:"Night shift portable lighting – 4 tower units",       descHe:"תאורה ניידת למשמרת לילה – 4 יחידות",    requestor:"Foreman Levy",  urgency:"CRITICAL" },
];

const statusStyle: Record<POStatus, { bg: string; color: string }> = {
  DELIVERED:  { bg: P.goodBg,   color: P.good    },
  "IN TRANSIT":{ bg: "#EFF6FF", color: "#1D4ED8" },
  CONFIRMED:  { bg: P.goodBg,   color: "#15803D" },
  DELAYED:    { bg: P.dangerBg, color: P.danger  },
  PENDING:    { bg: P.warnBg,   color: P.warn    },
};
const urgencyStyle: Record<string, { bg: string; color: string }> = {
  CRITICAL: { bg: "#FEF2F2", color: "#7F1D1D" },
  HIGH:     { bg: P.dangerBg, color: P.danger },
  MEDIUM:   { bg: P.warnBg,   color: P.warn   },
  LOW:      { bg: P.goodBg,   color: P.good   },
};
const kpiColors = [P.text1, P.warn, P.copper, P.good];

export default async function ProcurementPage() {
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
            <Plus className="w-3 h-3" /> {T.newPO}
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {T.kpis.map((k, i) => (
            <div key={k.label} className="rounded-2xl p-4" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{k.label}</p>
              <p className="text-[28px] font-bold" style={{ color: kpiColors[i] }}>{k.val}</p>
            </div>
          ))}
        </div>

        {/* AI */}
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: P.dangerBg, border: "1px solid #FECACA" }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEE2E2" }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
          </div>
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: P.danger }}>{T.aiLabel}</p>
            <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.ai}</p>
          </div>
        </div>

        {/* PO Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.poTitle}</h3>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {[T.colPO, T.colMaterial, T.colSupplier, T.colQty, T.colUnit, T.colValue, T.colDelivery, T.colStatus].map(h => (
                  <th key={h} className="px-4 py-2.5 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => {
                const ss = statusStyle[po.status];
                return (
                  <tr key={po.po} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-2.5 font-mono text-[11px]" style={{ color: P.text3 }}>{po.po}</td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: P.text1 }}>{isHe ? po.matHe : po.material}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: P.text2 }}>{po.supplier}</td>
                    <td className="px-4 py-2.5 font-mono text-right" style={{ color: P.text1 }}>{po.qty}</td>
                    <td className="px-4 py-2.5" style={{ color: P.text3 }}>{po.unit}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold whitespace-nowrap" style={{ color: P.copper }}>{po.value}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: po.status === "DELAYED" ? P.danger : P.text2 }}>{po.delivery}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color }}>{po.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Material Requests */}
        <div className="rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.reqTitle}</h3>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {[T.colReq, T.colDesc, T.colRequestor, T.colUrgency].map(h => (
                  <th key={h} className="px-4 py-2.5 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materialRequests.map((r) => {
                const us = urgencyStyle[r.urgency];
                return (
                  <tr key={r.req} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td className="px-4 py-2.5 font-mono text-[11px]" style={{ color: P.text3 }}>{r.req}</td>
                    <td className="px-4 py-2.5 font-medium" style={{ color: P.text1 }}>{isHe ? r.descHe : r.desc}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: P.text2 }}>{r.requestor}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: us.bg, color: us.color }}>{r.urgency}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
