import { cookies } from "next/headers";
import { Bell, Plus, Lightbulb, AlertTriangle, Package } from "lucide-react";

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
    title: "Inventory Management", addItem: "Add Item",
    kpis: [
      { label: "Material Lines",   val: "64"     },
      { label: "Low Stock Alerts", val: "5"      },
      { label: "Critical Stock",   val: "2"      },
      { label: "Total Value",      val: "₪4.2M"  },
    ],
    ai: "Rebar 20mm stock is 6 days below minimum reorder point — at current consumption (12t/day) stock will hit zero on 5 July. Cement stock will be critical on 4 July. Formwork panels are overstocked (167% of planned need) — consider returning surplus to supplier.",
    aiLabel: "AI Inventory Insight",
    colItem: "Material", colCat: "Category", colOnHand: "On Hand", colMin: "Min Stock",
    colDaily: "Daily Usage", colUnit: "Unit", colLocation: "Location", colStatus: "Stock Status",
    consumTitle: "7-Day Consumption Summary",
  },
  he: {
    title: "ניהול מלאי", addItem: "הוסף פריט",
    kpis: [
      { label: "שורות חומרים",   val: "64"     },
      { label: "התראות מלאי",    val: "5"      },
      { label: "מלאי קריטי",     val: "2"      },
      { label: "שווי כולל",      val: "4.2M ₪" },
    ],
    ai: "מלאי ברזל 20 מ\"מ נמוך מנקודת ההזמנה מחדש ב-6 ימים — בצריכה הנוכחית (12 טון/יום) המלאי יגיע לאפס ב-5 יולי. מלאי מלט יהיה קריטי ב-4 יולי. לוחות טפסנות במלאי עודף (167% מהצורך המתוכנן) — שקול החזרת עודפים לספק.",
    aiLabel: "תובנת AI למלאי",
    colItem: "חומר", colCat: "קטגוריה", colOnHand: "קיים", colMin: "מינימום",
    colDaily: "שימוש יומי", colUnit: "יחידה", colLocation: "מיקום", colStatus: "סטטוס מלאי",
    consumTitle: "סיכום צריכה 7 ימים",
  },
};

type StockStatus = "OK" | "LOW" | "CRITICAL" | "OVERSTOCK";

const inventory: {
  item: string; itemHe: string; cat: string; catHe: string;
  onHand: number; minStock: number; dailyUsage: number; unit: string;
  location: string; locationHe: string; status: StockStatus;
}[] = [
  { item:"Rebar 20mm HY",            itemHe:"ברזל 20 מ\"מ",          cat:"Rebar",      catHe:"ברזל",         onHand:24,    minStock:72,    dailyUsage:12,   unit:"t",   location:"Yard B-02", locationHe:"מחסן B-02", status:"CRITICAL"  },
  { item:"Portland Cement CEM I",    itemHe:"מלט פורטלנד",           cat:"Cement",     catHe:"מלט",          onHand:38,    minStock:60,    dailyUsage:8,    unit:"t",   location:"Silo S-01", locationHe:"ממגורה S-01",status:"LOW"       },
  { item:"Rebar 12mm HY",            itemHe:"ברזל 12 מ\"מ",          cat:"Rebar",      catHe:"ברזל",         onHand:18,    minStock:30,    dailyUsage:4,    unit:"t",   location:"Yard B-02", locationHe:"מחסן B-02", status:"LOW"       },
  { item:"Concrete C35/45 (on call)",itemHe:"בטון C35/45 (הזמנה)",   cat:"Concrete",   catHe:"בטון",         onHand:0,     minStock:0,     dailyUsage:85,   unit:"m³",  location:"Ready-mix", locationHe:"מוכן מיד",  status:"OK"        },
  { item:"Formwork H20 Beams",       itemHe:"קורות טפסנות H20",       cat:"Formwork",   catHe:"טפסנות",        onHand:1680,  minStock:400,   dailyUsage:20,   unit:"lm",  location:"Yard F-01", locationHe:"מחסן F-01", status:"OVERSTOCK" },
  { item:"Formwork Panels (Doka)",   itemHe:"לוחות טפסנות (דוקה)",    cat:"Formwork",   catHe:"טפסנות",        onHand:840,   minStock:200,   dailyUsage:0,    unit:"m²",  location:"Yard F-01", locationHe:"מחסן F-01", status:"OVERSTOCK" },
  { item:"Shotcrete Accelerator",    itemHe:"מאיץ שוטקריט",          cat:"Admixtures", catHe:"תוספים",       onHand:8.5,   minStock:5,     dailyUsage:1.2,  unit:"t",   location:"Chem Store",locationHe:"מחסן כימי", status:"OK"        },
  { item:"Waterproof Membrane",      itemHe:"ממברנה אטום",           cat:"Waterproof", catHe:"איטום",        onHand:480,   minStock:200,   dailyUsage:30,   unit:"m²",  location:"Yard A-01", locationHe:"מחסן A-01", status:"OK"        },
  { item:"Prestressed Strand 15.2mm",itemHe:"כבל פרסטרס 15.2 מ\"מ", cat:"Prestress",  catHe:"פרסטרס",       onHand:0.8,   minStock:2,     dailyUsage:0.5,  unit:"t",   location:"Yard B-03", locationHe:"מחסן B-03", status:"LOW"       },
  { item:"Geotextile 200 g/m²",      itemHe:"ג'יאוטקסטיל 200 גרם",  cat:"Drainage",   catHe:"ניקוז",        onHand:3200,  minStock:800,   dailyUsage:120,  unit:"m²",  location:"Yard D-01", locationHe:"מחסן D-01", status:"OK"        },
  { item:"Diesel Fuel",              itemHe:"סולר",                  cat:"Fuel",       catHe:"דלק",          onHand:28400, minStock:10000, dailyUsage:4200, unit:"L",   location:"Tank T-01", locationHe:"מיכל T-01", status:"OK"        },
  { item:"Pile Casing 600mm",        itemHe:"צנרת קידוח 600 מ\"מ",   cat:"Piling",     catHe:"קידוח",        onHand:4,     minStock:6,     dailyUsage:1,    unit:"no.", location:"Yard C-01", locationHe:"מחסן C-01", status:"LOW"       },
  { item:"Rockbolts + Grout",        itemHe:"עוגני סלע + הזרקה",    cat:"Ground Supp",catHe:"עיגון קרקע",   onHand:80,    minStock:60,    dailyUsage:8,    unit:"set", location:"Yard D-02", locationHe:"מחסן D-02", status:"OK"        },
  { item:"Traffic Cones",            itemHe:"קונוסי תנועה",          cat:"Traffic",    catHe:"תנועה",        onHand:380,   minStock:200,   dailyUsage:0,    unit:"no.", location:"Traffic Y.",locationHe:"מחסן תנועה",status:"OK"        },
  { item:"Shotcrete Cement CEM II",  itemHe:"מלט שוטקריט CEM II",   cat:"Cement",     catHe:"מלט",          onHand:22,    minStock:20,    dailyUsage:3,    unit:"t",   location:"Silo S-02", locationHe:"ממגורה S-02",status:"LOW"       },
];

const statusStyle: Record<StockStatus, { bg: string; color: string; label: string; labelHe: string }> = {
  OK:        { bg: P.goodBg,   color: P.good,   label: "OK",        labelHe: "תקין"       },
  LOW:       { bg: P.warnBg,   color: P.warn,   label: "LOW",       labelHe: "נמוך"       },
  CRITICAL:  { bg: P.dangerBg, color: P.danger, label: "CRITICAL",  labelHe: "קריטי"      },
  OVERSTOCK: { bg: "#EFF6FF",  color: "#1D4ED8",label: "OVERSTOCK", labelHe: "עודף מלאי" },
};

const kpiColors = [P.text1, P.warn, P.danger, P.copper];

const weeklyConsumption: { item: string; itemHe: string; values: number[]; unit: string }[] = [
  { item:"Rebar 20mm", itemHe:"ברזל 20 מ\"מ", values:[11,14,12,13,12,11,12], unit:"t"  },
  { item:"Cement CEM I",  itemHe:"מלט CEM I",  values:[6,9,8,10,7,8,9],       unit:"t"  },
  { item:"Concrete",      itemHe:"בטון",        values:[80,95,87,0,92,84,85],  unit:"m³" },
];
const days = ["Thu","Fri","Sat","Sun","Mon","Tue","Wed"];
const daysHe = ["חמי","שישי","שבת","ראשון","שני","שלישי","רביעי"];

export default async function InventoryPage() {
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
            <Plus className="w-3 h-3" /> {T.addItem}
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
        <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: P.warnBg, border: "1px solid #FDE68A" }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#FEF3C7" }}>
            <Lightbulb className="w-3.5 h-3.5" style={{ color: P.warn }} />
          </div>
          <div>
            <p className="text-[12px] font-bold mb-0.5" style={{ color: P.warn }}>{T.aiLabel}</p>
            <p className="text-[12.5px]" style={{ color: P.text2 }}>{T.ai}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Inventory Table */}
          <div className="col-span-2 rounded-2xl overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {[T.colItem, T.colCat, T.colOnHand, T.colMin, T.colDaily, T.colUnit, T.colLocation, T.colStatus].map(h => (
                    <th key={h} className="px-3 py-3 text-start font-bold" style={{ color: P.text3, background: P.bg }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const ss = statusStyle[item.status];
                  const pct = item.minStock > 0 ? Math.min((item.onHand / item.minStock) * 100, 200) : 100;
                  return (
                    <tr key={item.item} className="hover:bg-[#F5F2EF]" style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td className="px-3 py-2.5 font-medium" style={{ color: P.text1 }}>{isHe ? item.itemHe : item.item}</td>
                      <td className="px-3 py-2.5" style={{ color: P.text2 }}>{isHe ? item.catHe : item.cat}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full" style={{ background: P.border }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: ss.color }} />
                          </div>
                          <span className="font-mono font-bold text-[11px]" style={{ color: ss.color }}>{item.onHand.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: P.text3 }}>{item.minStock.toLocaleString()}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: P.text2 }}>{item.dailyUsage}</td>
                      <td className="px-3 py-2.5 text-[11px]" style={{ color: P.text3 }}>{item.unit}</td>
                      <td className="px-3 py-2.5 text-[11px] whitespace-nowrap" style={{ color: P.text3 }}>{isHe ? item.locationHe : item.location}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color }}>
                          {isHe ? ss.labelHe : ss.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Consumption Chart */}
          <div className="rounded-2xl p-5 space-y-5" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
            <h3 className="text-[14px] font-bold" style={{ color: P.text1 }}>{T.consumTitle}</h3>
            {weeklyConsumption.map((m) => {
              const maxVal = Math.max(...m.values);
              return (
                <div key={m.item}>
                  <p className="text-[12px] font-semibold mb-2" style={{ color: P.text2 }}>{isHe ? m.itemHe : m.item} ({m.unit})</p>
                  <div className="flex items-end gap-1 h-16">
                    {m.values.map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full rounded-t"
                          style={{ height: `${maxVal > 0 ? (v / maxVal) * 56 : 0}px`, background: v === 0 ? P.border : P.copper, opacity: 0.8, minHeight: v > 0 ? 4 : 0 }} />
                        <span className="text-[9px]" style={{ color: P.text3 }}>{isHe ? daysHe[i] : days[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
