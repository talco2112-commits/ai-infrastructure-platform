"use client";

import { useState, useEffect, useRef } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Bell, Plus, Search, Lightbulb, AlertTriangle, X,
  CheckCircle2, Clock, XCircle, FileText,
  TrendingUp, TrendingDown, Download, Send,
  Upload, Cpu, Eye, Paperclip, Trash2, Loader2,
  FileImage, Box, ArrowLeft, ArrowRight,
  Ruler, ScanLine, File, ChevronRight,
} from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperD: "#6B3E18", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  blue: "#1D4ED8", blueBg: "#EFF6FF",
};

/* ─────────────────────────── TYPES ─────────────────────────── */

type InvoiceStatus = "DRAFT" | "PENDING APPROVAL" | "CERTIFIED" | "PAID" | "OVERDUE" | "DISPUTED";
type InvoiceType   = "PROGRESS" | "MILESTONE" | "VARIATION" | "RETENTION RELEASE" | "FINAL";

interface Invoice {
  id: string;
  type: InvoiceType;
  description: string;
  descriptionHe: string;
  period: string;
  periodHe: string;
  submittedDate: string;
  dueDate: string;
  claimedAmount: number;
  certifiedAmount: number | null;
  paidAmount: number | null;
  retentionHeld: number;
  status: InvoiceStatus;
  approver: string;
  ref: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  category: "measurement" | "drawing" | "receipt" | "drone" | "other";
}

interface AILineItem {
  activity: string;
  activityHe: string;
  zone: string;
  qty: number;
  unit: string;
  rate: number;
}

/* ─────────────────────────── DATA ─────────────────────────── */

const INVOICES: Invoice[] = [
  { id:"INV-2024-001", type:"PROGRESS",  description:"Progress Claim #1 – Mobilisation & Earthworks Zone A",   descriptionHe:"תביעת התקדמות #1 – גיוס ועפר אזור A",         period:"Jan 2024",periodHe:"ינואר 2024",   submittedDate:"31 Jan 2024",dueDate:"28 Feb 2024",claimedAmount:1_840_000,certifiedAmount:1_748_000,paidAmount:1_748_000,retentionHeld:87_400,  status:"PAID",             approver:"Eng. Cohen",  ref:"PC-001"},
  { id:"INV-2024-002", type:"PROGRESS",  description:"Progress Claim #2 – Earthworks Zone A–B & Drainage",      descriptionHe:"תביעת התקדמות #2 – עפר A–B וניקוז",           period:"Feb 2024",periodHe:"פברואר 2024",  submittedDate:"29 Feb 2024",dueDate:"28 Mar 2024",claimedAmount:2_210_000,certifiedAmount:2_099_500,paidAmount:2_099_500,retentionHeld:104_975, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-002"},
  { id:"INV-2024-003", type:"PROGRESS",  description:"Progress Claim #3 – Zone B Road Base & Piling",           descriptionHe:"תביעת התקדמות #3 – בסיס אזור B וקידוח",       period:"Mar 2024",periodHe:"מרץ 2024",     submittedDate:"31 Mar 2024",dueDate:"28 Apr 2024",claimedAmount:2_650_000,certifiedAmount:2_517_500,paidAmount:2_517_500,retentionHeld:125_875, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-003"},
  { id:"INV-2024-004", type:"MILESTONE", description:"Milestone Payment – Pile Driving Completion Zone C",       descriptionHe:"תשלום אבן דרך – השלמת קידוח אזור C",          period:"Apr 2024",periodHe:"אפריל 2024",   submittedDate:"15 Apr 2024",dueDate:"15 May 2024",claimedAmount:3_500_000,certifiedAmount:3_325_000,paidAmount:3_325_000,retentionHeld:166_250, status:"PAID",             approver:"PM Shapira",  ref:"MS-001"},
  { id:"INV-2024-005", type:"PROGRESS",  description:"Progress Claim #4 – Zone C Pile Caps & Zone A Road Base", descriptionHe:"תביעת התקדמות #4 – כובעי יסוד C ובסיס A",     period:"Apr 2024",periodHe:"אפריל 2024",   submittedDate:"30 Apr 2024",dueDate:"28 May 2024",claimedAmount:2_975_000,certifiedAmount:2_826_250,paidAmount:2_826_250,retentionHeld:141_313, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-004"},
  { id:"INV-2024-006", type:"VARIATION", description:"VO-003 – Unforeseen rock excavation Zone D",               descriptionHe:"פקודת שינוי VO-003 – חפירת סלע בלתי צפויה",   period:"May 2024",periodHe:"מאי 2024",     submittedDate:"10 May 2024",dueDate:"9 Jun 2024", claimedAmount:780_000, certifiedAmount:741_000, paidAmount:741_000, retentionHeld:37_050,  status:"PAID",             approver:"PM Shapira",  ref:"VO-003"},
  { id:"INV-2024-007", type:"PROGRESS",  description:"Progress Claim #5 – Bridge P5 & P6 Concrete Works",       descriptionHe:"תביעת התקדמות #5 – גשר P5 ו-P6",              period:"May 2024",periodHe:"מאי 2024",     submittedDate:"31 May 2024",dueDate:"28 Jun 2024",claimedAmount:3_120_000,certifiedAmount:2_964_000,paidAmount:2_964_000,retentionHeld:148_200, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-005"},
  { id:"INV-2024-008", type:"PROGRESS",  description:"Progress Claim #6 – Bridge P7 Formwork & Piers Zone B",  descriptionHe:"תביעת התקדמות #6 – קינוף גשר P7 אזור B",     period:"Jun 2024",periodHe:"יוני 2024",    submittedDate:"30 Jun 2024",dueDate:"28 Jul 2024",claimedAmount:2_860_000,certifiedAmount:2_717_000,paidAmount:2_717_000,retentionHeld:135_850, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-006"},
  { id:"INV-2024-009", type:"VARIATION", description:"VO-007 – Additional drainage channels Zone A extension",  descriptionHe:"פקודת שינוי VO-007 – תעלות ניקוז נוספות",     period:"Jun 2024",periodHe:"יוני 2024",    submittedDate:"14 Jun 2024",dueDate:"14 Jul 2024",claimedAmount:310_000, certifiedAmount:294_500, paidAmount:294_500, retentionHeld:14_725,  status:"PAID",             approver:"PM Shapira",  ref:"VO-007"},
  { id:"INV-2024-010", type:"PROGRESS",  description:"Progress Claim #7 – Zone C Abutment & Bridge Deck 3A",   descriptionHe:"תביעת התקדמות #7 – משקוף C ומשטח גשר 3A",    period:"Jul 2024",periodHe:"יולי 2024",    submittedDate:"31 Jul 2024",dueDate:"28 Aug 2024",claimedAmount:3_450_000,certifiedAmount:3_277_500,paidAmount:3_277_500,retentionHeld:163_875, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-007"},
  { id:"INV-2024-011", type:"PROGRESS",  description:"Progress Claim #8 – Bridge Zone B Deck Pour 3B–4A",      descriptionHe:"תביעת התקדמות #8 – יציקת סיפון גשר B 3B–4A", period:"Aug 2024",periodHe:"אוגוסט 2024",  submittedDate:"31 Aug 2024",dueDate:"28 Sep 2024",claimedAmount:3_210_000,certifiedAmount:3_049_500,paidAmount:3_049_500,retentionHeld:152_475, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-008"},
  { id:"INV-2024-012", type:"PROGRESS",  description:"Progress Claim #9 – Zone D Drainage & Utility Trenching", descriptionHe:"תביעת התקדמות #9 – ניקוז ותשתיות אזור D",    period:"Sep 2024",periodHe:"ספטמבר 2024",  submittedDate:"30 Sep 2024",dueDate:"28 Oct 2024",claimedAmount:2_740_000,certifiedAmount:2_603_000,paidAmount:2_603_000,retentionHeld:130_150, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-009"},
  { id:"INV-2024-013", type:"PROGRESS",  description:"Progress Claim #10 – Prestress Works Bridge Zone B",      descriptionHe:"תביעת התקדמות #10 – עבודות פרסטרס גשר B",    period:"Oct 2024",periodHe:"אוקטובר 2024", submittedDate:"31 Oct 2024",dueDate:"28 Nov 2024",claimedAmount:3_880_000,certifiedAmount:3_686_000,paidAmount:3_686_000,retentionHeld:184_300, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-010"},
  { id:"INV-2024-014", type:"VARIATION", description:"VO-011 – Ground improvement Zone D stabilisation layer",  descriptionHe:"פקודת שינוי VO-011 – שיפור קרקע אזור D",      period:"Oct 2024",periodHe:"אוקטובר 2024", submittedDate:"18 Oct 2024",dueDate:"17 Nov 2024",claimedAmount:520_000, certifiedAmount:494_000, paidAmount:494_000, retentionHeld:24_700,  status:"PAID",             approver:"PM Shapira",  ref:"VO-011"},
  { id:"INV-2024-015", type:"MILESTONE", description:"Milestone Payment – Bridge Superstructure Zone B Complete",descriptionHe:"תשלום אבן דרך – כפת גשר B הושלמה",            period:"Nov 2024",periodHe:"נובמבר 2024",  submittedDate:"15 Nov 2024",dueDate:"15 Dec 2024",claimedAmount:4_200_000,certifiedAmount:3_990_000,paidAmount:3_990_000,retentionHeld:199_500, status:"PAID",             approver:"PM Shapira",  ref:"MS-002"},
  { id:"INV-2024-016", type:"PROGRESS",  description:"Progress Claim #11 – Zone A Asphalt Layer 1 & Kerbing",  descriptionHe:"תביעת התקדמות #11 – אספלט שכבה 1 אזור A",    period:"Nov 2024",periodHe:"נובמבר 2024",  submittedDate:"30 Nov 2024",dueDate:"28 Dec 2024",claimedAmount:2_420_000,certifiedAmount:2_299_000,paidAmount:2_299_000,retentionHeld:114_950, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-011"},
  { id:"INV-2024-017", type:"PROGRESS",  description:"Progress Claim #12 – Zone B Asphalt & Bridge Waterproofing",descriptionHe:"תביעת התקדמות #12 – אספלט B ואטום גשר",   period:"Dec 2024",periodHe:"דצמבר 2024",   submittedDate:"31 Dec 2024",dueDate:"28 Jan 2025",claimedAmount:3_060_000,certifiedAmount:2_907_000,paidAmount:2_907_000,retentionHeld:145_350, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-012"},
  { id:"INV-2025-001", type:"PROGRESS",  description:"Progress Claim #13 – Zone C Retaining Walls & Road Base", descriptionHe:"תביעת התקדמות #13 – קיר תומך C ובסיס כביש",  period:"Jan 2025",periodHe:"ינואר 2025",   submittedDate:"31 Jan 2025",dueDate:"28 Feb 2025",claimedAmount:2_890_000,certifiedAmount:2_745_500,paidAmount:2_745_500,retentionHeld:137_275, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-013"},
  { id:"INV-2025-002", type:"VARIATION", description:"VO-014 – Revised traffic management scheme Phase 2",       descriptionHe:"פקודת שינוי VO-014 – תכנית תנועה שלב 2",      period:"Jan 2025",periodHe:"ינואר 2025",   submittedDate:"20 Jan 2025",dueDate:"19 Feb 2025",claimedAmount:185_000, certifiedAmount:175_750, paidAmount:175_750, retentionHeld:8_788,   status:"PAID",             approver:"PM Shapira",  ref:"VO-014"},
  { id:"INV-2025-003", type:"PROGRESS",  description:"Progress Claim #14 – Zone D Earthworks & Piling Restart", descriptionHe:"תביעת התקדמות #14 – עפר D והפעלת קידוח",     period:"Feb 2025",periodHe:"פברואר 2025",  submittedDate:"28 Feb 2025",dueDate:"28 Mar 2025",claimedAmount:3_340_000,certifiedAmount:3_173_000,paidAmount:3_173_000,retentionHeld:158_650, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-014"},
  { id:"INV-2025-004", type:"PROGRESS",  description:"Progress Claim #15 – Zone A Final Asphalt & Line Marking",descriptionHe:"תביעת התקדמות #15 – אספלט סופי A וסימון",     period:"Mar 2025",periodHe:"מרץ 2025",     submittedDate:"31 Mar 2025",dueDate:"28 Apr 2025",claimedAmount:1_980_000,certifiedAmount:1_881_000,paidAmount:1_881_000,retentionHeld:94_050,  status:"PAID",             approver:"Eng. Cohen",  ref:"PC-015"},
  { id:"INV-2025-005", type:"MILESTONE", description:"Milestone Payment – Zone A Road Practical Completion",     descriptionHe:"תשלום אבן דרך – השלמה מעשית כביש אזור A",    period:"Apr 2025",periodHe:"אפריל 2025",   submittedDate:"5 Apr 2025", dueDate:"5 May 2025", claimedAmount:5_000_000,certifiedAmount:4_750_000,paidAmount:4_750_000,retentionHeld:237_500, status:"PAID",             approver:"PM Shapira",  ref:"MS-003"},
  { id:"INV-2025-006", type:"PROGRESS",  description:"Progress Claim #16 – Zone B & C Asphalt Layers 1–2",     descriptionHe:"תביעת התקדמות #16 – אספלט שכבות 1–2 B ו-C",  period:"Apr 2025",periodHe:"אפריל 2025",   submittedDate:"30 Apr 2025",dueDate:"28 May 2025",claimedAmount:3_570_000,certifiedAmount:3_391_500,paidAmount:3_391_500,retentionHeld:169_575, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-016"},
  { id:"INV-2025-007", type:"PROGRESS",  description:"Progress Claim #17 – Zone D Pile Caps & Abutment Works",  descriptionHe:"תביעת התקדמות #17 – כובעי יסוד ומשקופים D",  period:"May 2025",periodHe:"מאי 2025",     submittedDate:"31 May 2025",dueDate:"28 Jun 2025",claimedAmount:3_120_000,certifiedAmount:2_964_000,paidAmount:2_964_000,retentionHeld:148_200, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-017"},
  { id:"INV-2025-008", type:"VARIATION", description:"VO-019 – Scope increase Zone D bridge extension 8m",       descriptionHe:"פקודת שינוי VO-019 – הרחבת גשר D ב-8 מ'",     period:"May 2025",periodHe:"מאי 2025",     submittedDate:"12 May 2025",dueDate:"11 Jun 2025",claimedAmount:1_240_000,certifiedAmount:1_178_000,paidAmount:1_178_000,retentionHeld:58_900,  status:"PAID",             approver:"PM Shapira",  ref:"VO-019"},
  { id:"INV-2025-009", type:"PROGRESS",  description:"Progress Claim #18 – Zone D Bridge Superstructure Phase 1",descriptionHe:"תביעת התקדמות #18 – גשר D מבנה עליון שלב 1",  period:"Jun 2025",periodHe:"יוני 2025",    submittedDate:"30 Jun 2025",dueDate:"28 Jul 2025",claimedAmount:4_210_000,certifiedAmount:3_999_500,paidAmount:3_999_500,retentionHeld:199_975, status:"PAID",             approver:"Eng. Cohen",  ref:"PC-018"},
  { id:"INV-2026-001", type:"PROGRESS",  description:"Progress Claim #19 – Bridge P7 Pour & Zone B Completion", descriptionHe:"תביעת התקדמות #19 – יציקת גשר P7 ואזור B",     period:"May 2026",periodHe:"מאי 2026",     submittedDate:"31 May 2026",dueDate:"28 Jun 2026",claimedAmount:3_840_000,certifiedAmount:3_648_000,paidAmount:null,        retentionHeld:182_400, status:"OVERDUE",           approver:"Eng. Cohen",  ref:"PC-019"},
  { id:"INV-2026-002", type:"VARIATION", description:"VO-023 – Land access compensation Zone D private parcels", descriptionHe:"פקודת שינוי VO-023 – פיצוי גישה לקרקע D",      period:"May 2026",periodHe:"מאי 2026",     submittedDate:"14 May 2026",dueDate:"13 Jun 2026",claimedAmount:420_000, certifiedAmount:null,    paidAmount:null,        retentionHeld:0,       status:"DISPUTED",         approver:"PM Shapira",  ref:"VO-023"},
  { id:"INV-2026-003", type:"PROGRESS",  description:"Progress Claim #20 – Zone C Final Asphalt & Zone D Piling",descriptionHe:"תביעת התקדמות #20 – אספלט C וקידוח D",        period:"Jun 2026",periodHe:"יוני 2026",    submittedDate:"30 Jun 2026",dueDate:"28 Jul 2026",claimedAmount:3_260_000,certifiedAmount:null,    paidAmount:null,        retentionHeld:0,       status:"PENDING APPROVAL", approver:"Eng. Cohen",  ref:"PC-020"},
  { id:"INV-2026-004", type:"VARIATION", description:"VO-024 – Night shift cost recovery Zone B – June",          descriptionHe:"פקודת שינוי VO-024 – עלות משמרת לילה B",       period:"Jun 2026",periodHe:"יוני 2026",    submittedDate:"15 Jun 2026",dueDate:"15 Jul 2026",claimedAmount:195_000, certifiedAmount:null,    paidAmount:null,        retentionHeld:0,       status:"PENDING APPROVAL", approver:"PM Shapira",  ref:"VO-024"},
];

const STATUS_STYLE: Record<InvoiceStatus, { bg:string; color:string; label:string; labelHe:string; Icon:React.FC<{className?:string}> }> = {
  "DRAFT":            { bg:"#F1F5F9", color:"#475569", label:"DRAFT",            labelHe:"טיוטה",        Icon:FileText      },
  "PENDING APPROVAL": { bg:P.warnBg,  color:P.warn,   label:"PENDING APPROVAL", labelHe:"ממתין לאישור", Icon:Clock         },
  "CERTIFIED":        { bg:P.blueBg,  color:P.blue,   label:"CERTIFIED",         labelHe:"מאושר",        Icon:CheckCircle2  },
  "PAID":             { bg:P.goodBg,  color:P.good,   label:"PAID",              labelHe:"שולם",         Icon:CheckCircle2  },
  "OVERDUE":          { bg:P.dangerBg,color:P.danger, label:"OVERDUE",           labelHe:"באיחור",       Icon:AlertTriangle },
  "DISPUTED":         { bg:"#FDF4FF", color:"#7E22CE",label:"DISPUTED",          labelHe:"במחלוקת",      Icon:XCircle       },
};

const TYPE_STYLE: Record<InvoiceType, { bg:string; color:string; label:string; labelHe:string }> = {
  "PROGRESS":          { bg:P.copperLight, color:P.copper,  label:"Progress",  labelHe:"התקדמות"       },
  "MILESTONE":         { bg:"#FEF3C7",     color:"#92400E", label:"Milestone", labelHe:"אבן דרך"       },
  "VARIATION":         { bg:P.blueBg,      color:P.blue,    label:"Variation", labelHe:"פקודת שינוי"   },
  "RETENTION RELEASE": { bg:P.goodBg,      color:P.good,    label:"Retention", labelHe:"שחרור עכבון"   },
  "FINAL":             { bg:"#F3E8FF",     color:"#7E22CE", label:"Final",     labelHe:"חשבון סופי"    },
};

const fmt = (n: number) =>
  "₪" + n.toLocaleString("en-IL", { minimumFractionDigits:0, maximumFractionDigits:0 });

/* ─────────────────────────── SUB COMPONENTS ─────────────────────────── */

function Card({ children, className="" }: { children:React.ReactNode; className?:string }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background:P.card, border:`1px solid ${P.border}`, boxShadow:"0 2px 12px rgba(28,25,23,0.06)" }}>
      {children}
    </div>
  );
}

function Chip({ label, bg, color }: { label:string; bg:string; color:string }) {
  return (
    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background:bg, color }}>{label}</span>
  );
}

/* ─────────────────────────── FILE ATTACHMENT HELPERS ─────────────────────────── */

const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];

const CAT_ICON: Record<AttachedFile["category"], React.FC<{className?:string; style?: React.CSSProperties}>> = {
  measurement: Ruler, drawing: FileImage, receipt: FileText, drone: Box, other: File,
};
const CAT_COLOR: Record<AttachedFile["category"], string> = {
  measurement: P.blue, drawing: P.copper, receipt: P.good, drone: "#7E22CE", other: P.text3,
};
const CAT_EN: Record<AttachedFile["category"], string> = {
  measurement:"Measurement", drawing:"Drawing", receipt:"Receipt", drone:"Drone / 3D", other:"Other",
};
const CAT_HE: Record<AttachedFile["category"], string> = {
  measurement:"כמויות", drawing:"תכנית", receipt:"קבלה", drone:"מודל תלת-מימד", other:"אחר",
};

function guessCategory(name: string): AttachedFile["category"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx","csv","ods","xls"].includes(ext))               return "measurement";
  if (["dwg","dxf","pdf","svg"].includes(ext))                return "drawing";
  if (["jpg","jpeg","png","heic"].includes(ext))              return "receipt";
  if (["obj","las","ply","e57","laz","xyz","glb","fbx"].includes(ext)) return "drone";
  return "other";
}

function fmtSize(b: number) {
  if (b < 1024)        return `${b} B`;
  if (b < 1024*1024)   return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1024/1024).toFixed(1)} MB`;
}

/* ─────────────────────────── AI SIMULATION DATA ─────────────────────────── */

const AI_LINE_ITEMS: AILineItem[] = [
  { activity:"Concrete pour C35/45 – Bridge P8",          activityHe:"יציקת בטון C35/45 – גשר P8",       zone:"B", qty:192,  unit:"m³",   rate:1100   },
  { activity:"Formwork – Bridge P8 piers",                activityHe:"קינוף – כני גשר P8",               zone:"B", qty:840,  unit:"m²",   rate:165    },
  { activity:"Rebar HY 20mm – Zone B",                    activityHe:"ברזל HY 20מ\"מ – אזור B",           zone:"B", qty:22.4, unit:"t",    rate:9200   },
  { activity:"Prestressed strand installation – P8",      activityHe:"התקנת כבל פרסטרס – P8",            zone:"B", qty:2.4,  unit:"t",    rate:118000 },
  { activity:"Waterproof membrane – Bridge P8 deck",      activityHe:"ממברנה אטום – סיפון גשר P8",        zone:"B", qty:480,  unit:"m²",   rate:135    },
  { activity:"Pile drilling – Zone D pos. 35–42",         activityHe:"קידוח יסודות – עמדות 35–42 אזור D", zone:"D", qty:8,    unit:"no.",  rate:78000  },
  { activity:"Earthworks cut – Zone D corridor",          activityHe:"חפירת עפר – פרוזדור אזור D",        zone:"D", qty:6800, unit:"m³",   rate:78     },
  { activity:"Road base compaction – Zone B sec. 2",      activityHe:"דחיסת שכבת בסיס – B קטע 2",        zone:"B", qty:3200, unit:"m²",   rate:68     },
  { activity:"Drainage culvert – STA 0+220",              activityHe:"תעלת ניקוז – עמדה 0+220",          zone:"A", qty:45,   unit:"lm",   rate:2100   },
  { activity:"Retaining wall – Zone C sec. 3",            activityHe:"קיר תומך – אזור C קטע 3",          zone:"C", qty:280,  unit:"m²",   rate:680    },
  { activity:"Night shift premium – July 2026",           activityHe:"תוספת משמרת לילה – יולי 2026",     zone:"B", qty:18,   unit:"shift",rate:14200  },
  { activity:"Plant & equipment hire contribution",       activityHe:"תרומת שכירת ציוד",                  zone:"—", qty:1,    unit:"ls",   rate:384000 },
];
const AI_TOTAL = AI_LINE_ITEMS.reduce((s, l) => s + l.qty * l.rate, 0);

const AI_MSGS_EN = ["Reading uploaded files…","Extracting quantities & measurements…","Computing line-item amounts…","Finalising bill…"];
const AI_MSGS_HE = ["קורא קבצים שהועלו…","מחלץ כמויות ומדידות…","מחשב סכומים לפי סעיפים…","מסיים חשבון…"];

/* ─────────────────────────── NEW BILL MODAL ─────────────────────────── */

function NewBillModal({ isHe, onClose, onSave }: { isHe:boolean; onClose:()=>void; onSave:(inv:Invoice)=>void }) {
  const now       = new Date();
  const overlayRef   = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep]       = useState<0|1|2>(0);
  const [isDragging, setDrag] = useState(false);
  const [files, setFiles]     = useState<AttachedFile[]>([]);
  const [aiPhase, setAiPhase] = useState(0);   // 0=idle 1-4=steps 5=done
  const [aiFilled, setAiFilled] = useState(false);

  /* form fields */
  const [type, setType]           = useState<InvoiceType>("PROGRESS");
  const [description, setDesc]    = useState("");
  const [descHe, setDescHe]       = useState("");
  const [month, setMonth]         = useState(now.getMonth());
  const [year, setYear]           = useState(now.getFullYear());
  const [claimed, setClaimed]     = useState("");
  const [retention, setRetention] = useState("5");
  const [approver, setApprover]   = useState("Eng. Cohen");
  const [billRef, setBillRef]     = useState("");
  const [lineItems, setLineItems] = useState<AILineItem[]>([]);

  /* ── file helpers ── */
  function addRaw(rawFiles: FileList | File[]) {
    setFiles(prev => [...prev, ...Array.from(rawFiles).map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      name: f.name, size: f.size, category: guessCategory(f.name),
    } as AttachedFile))]);
  }
  function addDemo() {
    setFiles([
      { id:"d1", name:"July_2026_measurements.xlsx",    size:248_320,    category:"measurement" },
      { id:"d2", name:"Bridge_P8_deck_shop_dwg.pdf",    size:4_102_400,  category:"drawing"     },
      { id:"d3", name:"Zone_D_survey_pointcloud.las",   size:62_914_560, category:"drone"       },
      { id:"d4", name:"Concrete_delivery_receipts.pdf", size:890_112,    category:"receipt"     },
    ]);
  }
  function removeFile(id: string) { setFiles(prev => prev.filter(f => f.id !== id)); }
  function updateCat(id: string, cat: AttachedFile["category"]) {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, category: cat } : f));
  }

  /* ── drag & drop ── */
  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDrag(true); }
  function onDragLeave() { setDrag(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files.length) addRaw(e.dataTransfer.files);
  }

  /* ── AI simulation ── */
  function runAI() {
    if (!files.length) return;
    setAiPhase(1);
    [1,2,3,4].forEach(p => setTimeout(() => setAiPhase(p), (p-1)*900));
    setTimeout(() => {
      setAiPhase(5);
      setLineItems(AI_LINE_ITEMS);
      setDesc("Progress Claim #21 – Zone D Bridge Superstructure Ph.2 & Zone B Road Completion");
      setDescHe("תביעת התקדמות #21 – גשר D מבנה עליון שלב 2 והשלמת כביש אזור B");
      setClaimed(AI_TOTAL.toLocaleString());
      setMonth(6); setYear(2026); setType("PROGRESS"); setBillRef("PC-021");
      setAiFilled(true);
    }, 4 * 900);
  }

  /* ── save ── */
  function handleSave() {
    const num  = parseFloat(claimed.replace(/,/g,"")) || 0;
    const retP = parseFloat(retention) / 100;
    const sub  = new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
    const due  = new Date(year, month+1, 28).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
    onSave({
      id:`INV-${year}-${String(Math.floor(Math.random()*900)+100)}`,
      type, description, descriptionHe: descHe||description,
      period:`${MONTHS_EN[month]} ${year}`, periodHe:`${MONTHS_HE[month]} ${year}`,
      submittedDate:sub, dueDate:due,
      claimedAmount:num, certifiedAmount:null, paidAmount:null,
      retentionHeld:Math.round(num*retP),
      status:"PENDING APPROVAL", approver, ref:billRef||"PC-NEW",
    });
  }

  const claimedNum = parseFloat(claimed.replace(/,/g,"")) || 0;
  const retNum     = Math.round(claimedNum * parseFloat(retention) / 100);
  const netPayable = claimedNum - retNum;

  const stepLabels = isHe ? ["העלאה","פרטים","תצוגה מקדימה"] : ["Upload","Details","Preview"];

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(28,25,23,0.55)", backdropFilter:"blur(6px)" }}
      onClick={e => { if (e.target===overlayRef.current) onClose(); }}>

      <input ref={fileInputRef} type="file" multiple className="hidden"
        accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.heic,.xlsx,.csv,.obj,.las,.ply,.e57,.laz,.glb,.fbx"
        onChange={e => { if (e.target.files) addRaw(e.target.files); e.target.value=""; }}/>

      <div className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
        dir={isHe?"rtl":"ltr"}
        style={{ background:P.card, border:`1px solid ${P.border}`, maxHeight:"90vh" }}>

        {/* ── Modal header / step indicator ── */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom:`1px solid ${P.border}`, background:P.bg }}>
          <div className="flex items-center gap-1">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background:i<step?P.good:i===step?P.copper:P.border, color:(i<=step)?"#fff":P.text3 }}>
                    {i<step?<CheckCircle2 className="w-3 h-3"/>:i+1}
                  </div>
                  <span className="text-[12px] font-semibold"
                    style={{ color:i===step?P.copper:i<step?P.good:P.text3 }}>{label}</span>
                </div>
                {i<2 && <ChevronRight className="w-3.5 h-3.5 mx-1" style={{ color:P.text3 }}/>}
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background:P.border }}>
            <X className="w-4 h-4" style={{ color:P.text2 }}/>
          </button>
        </div>

        {/* ══════════ STEP 0: UPLOAD ══════════ */}
        {step===0 && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {/* Drop zone */}
            <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
              onClick={() => !files.length && fileInputRef.current?.click()}
              className="rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all p-8"
              style={{ border:`2px dashed ${isDragging?P.copper:P.border}`, background:isDragging?P.copperLight:P.bg, minHeight:160 }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background:P.copperLight }}>
                <Upload className="w-6 h-6" style={{ color:P.copper }}/>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold" style={{ color:P.text1 }}>
                  {isHe?"גרור קבצים לכאן לייצור אוטומטי":"Drop files here for AI auto-generation"}
                </p>
                <p className="text-[12px] mt-1" style={{ color:P.text3 }}>
                  {isHe?"מדידות · תכניות · קבלות · מודל תלת-מימד / רחפן":"Measurements · Drawings · Receipts · Drone / 3D model"}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {["XLSX/CSV","DWG/PDF","JPG/PNG","OBJ/LAS/PLY"].map(t => (
                  <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background:P.card, border:`1px solid ${P.border}`, color:P.text3 }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold"
                style={{ background:P.bg, border:`1px solid ${P.border}`, color:P.text2 }}>
                <File className="w-3.5 h-3.5"/>
                {isHe?"בחר קבצים":"Browse files"}
              </button>
              <button onClick={addDemo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold"
                style={{ background:P.blueBg, border:`1px solid #BFDBFE`, color:P.blue }}>
                <ScanLine className="w-3.5 h-3.5"/>
                {isHe?"נסה עם קבצי דוגמה":"Try with sample files"}
              </button>
              <button onClick={() => setStep(1)} className="ms-auto text-[12px] font-semibold"
                style={{ color:P.text3 }}>
                {isHe?"דלג — מלא ידנית":"Skip — fill manually"}
              </button>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] font-bold" style={{ color:P.text2 }}>
                  {isHe?`${files.length} קבצים`:`${files.length} file(s) ready`}
                </p>
                {files.map(f => {
                  const Icon  = CAT_ICON[f.category];
                  const color = CAT_COLOR[f.category];
                  return (
                    <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background:P.bg, border:`1px solid ${P.border}` }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background:color+"20" }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate" style={{ color:P.text1 }}>{f.name}</p>
                        <p className="text-[10.5px]" style={{ color:P.text3 }}>{fmtSize(f.size)}</p>
                      </div>
                      <select value={f.category}
                        onChange={e => updateCat(f.id, e.target.value as AttachedFile["category"])}
                        className="text-[11px] px-2 py-1 rounded-lg"
                        style={{ background:P.card, border:`1px solid ${P.border}`, color, outline:"none" }}>
                        {(["measurement","drawing","receipt","drone","other"] as AttachedFile["category"][]).map(c => (
                          <option key={c} value={c}>{isHe?CAT_HE[c]:CAT_EN[c]}</option>
                        ))}
                      </select>
                      <button onClick={() => removeFile(f.id)}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color:P.text3 }}/>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI analyze button */}
            {files.length>0 && aiPhase===0 && (
              <button onClick={runAI}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold text-white"
                style={{ background:`linear-gradient(135deg,${P.copper},#B8762E)`, boxShadow:"0 4px 16px rgba(139,90,43,0.28)" }}>
                <Cpu className="w-4 h-4"/>
                {isHe?"נתח עם AI":"Analyze with AI"}
              </button>
            )}

            {/* AI progress */}
            {files.length>0 && aiPhase>0 && aiPhase<5 && (
              <div className="rounded-2xl p-5" style={{ background:P.bg, border:`1px solid ${P.border}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color:P.copper }}/>
                  <p className="text-[13px] font-bold" style={{ color:P.copper }}>
                    {(isHe?AI_MSGS_HE:AI_MSGS_EN)[aiPhase-1]}
                  </p>
                </div>
                <div className="space-y-2">
                  {(isHe?AI_MSGS_HE:AI_MSGS_EN).map((msg,i) => (
                    <div key={i} className="flex items-center gap-2">
                      {i<aiPhase-1
                        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color:P.good }}/>
                        : i===aiPhase-1
                          ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ color:P.copper }}/>
                          : <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ border:`1.5px solid ${P.border}` }}/>}
                      <span className="text-[12px]" style={{ color:i<=aiPhase-1?P.text1:P.text3 }}>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI results table */}
            {aiPhase===5 && (
              <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid #BBF7D0` }}>
                <div className="px-4 py-3 flex items-center gap-2"
                  style={{ background:P.goodBg, borderBottom:`1px solid #BBF7D0` }}>
                  <Cpu className="w-4 h-4" style={{ color:P.good }}/>
                  <p className="text-[12px] font-bold" style={{ color:P.good }}>
                    {isHe?`AI מילא מ-${files.length} קבצים · ביטחון 91%`:`AI pre-filled from ${files.length} file(s) · 91% confidence`}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead><tr style={{ borderBottom:`1px solid ${P.border}` }}>
                      {(isHe?["פעילות","אזור","כמות","יחידה","מחיר","סכום"]:["Activity","Zone","Qty","Unit","Rate","Amount"]).map(h =>
                        <th key={h} className="px-3 py-2 text-left font-bold" style={{ color:P.text3, background:P.bg }}>{h}</th>
                      )}
                    </tr></thead>
                    <tbody>
                      {lineItems.map((li,i) => (
                        <tr key={i} style={{ borderBottom:`1px solid ${P.border}` }}>
                          <td className="px-3 py-2 font-medium" style={{ color:P.text1 }}>{isHe?li.activityHe:li.activity}</td>
                          <td className="px-3 py-2 text-center"><span className="text-[10px] font-bold w-5 h-5 rounded-full inline-flex items-center justify-center" style={{ background:P.copperLight, color:P.copper }}>{li.zone}</span></td>
                          <td className="px-3 py-2 font-mono text-right" style={{ color:P.text1 }}>{li.qty.toLocaleString()}</td>
                          <td className="px-3 py-2" style={{ color:P.text3 }}>{li.unit}</td>
                          <td className="px-3 py-2 font-mono text-right" style={{ color:P.text2 }}>₪{li.rate.toLocaleString()}</td>
                          <td className="px-3 py-2 font-mono font-bold text-right" style={{ color:P.copper }}>₪{(li.qty*li.rate).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop:`2px solid ${P.border}` }}>
                        <td colSpan={5} className="px-3 py-2.5 text-right font-bold text-[12px]" style={{ color:P.text1 }}>
                          {isHe?"סה\"כ הוגש:":"Total Claimed:"}
                        </td>
                        <td className="px-3 py-2.5 font-bold font-mono text-right text-[13px]" style={{ color:P.copper }}>
                          {"₪"}{AI_TOTAL.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ STEP 1: FORM ══════════ */}
        {step===1 && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">

            {aiFilled && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background:P.goodBg, border:`1px solid #BBF7D0` }}>
                <Cpu className="w-4 h-4" style={{ color:P.good }}/>
                <span className="text-[12px] font-semibold" style={{ color:P.good }}>
                  {isHe?`AI מילא מ-${files.length} קבצים · ביטחון 91%`:`AI pre-filled from ${files.length} file(s) · 91% confidence`}
                </span>
              </div>
            )}

            {/* Invoice type */}
            <div>
              <label className="block text-[12px] font-bold mb-1.5" style={{ color:P.text2 }}>
                {isHe?"סוג חשבון":"Invoice Type"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["PROGRESS","MILESTONE","VARIATION","RETENTION RELEASE","FINAL"] as InvoiceType[]).map(t => {
                  const ts=TYPE_STYLE[t]; const active=t===type;
                  return (
                    <button key={t} onClick={() => setType(t)}
                      className="py-2 px-2 rounded-xl text-[11px] font-bold text-center"
                      style={{ background:active?ts.bg:P.bg, color:active?ts.color:P.text3, border:`1.5px solid ${active?ts.color+"50":P.border}` }}>
                      {isHe?ts.labelHe:ts.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="block text-[12px] font-bold mb-1.5" style={{ color:P.text2 }}>
                {isHe?"תקופת חיוב":"Billing Period"}
              </label>
              <div className="flex gap-2">
                <select value={month} onChange={e => setMonth(Number(e.target.value))}
                  className="flex-1 px-3 py-2.5 rounded-xl text-[13px]"
                  style={{ background:P.bg, border:`1.5px solid ${P.border}`, color:P.text1, outline:"none" }}>
                  {MONTHS_EN.map((m,i) => <option key={i} value={i}>{isHe?MONTHS_HE[i]:m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(Number(e.target.value))}
                  className="w-28 px-3 py-2.5 rounded-xl text-[13px]"
                  style={{ background:P.bg, border:`1.5px solid ${P.border}`, color:P.text1, outline:"none" }}>
                  {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-bold mb-1.5" style={{ color:P.text2 }}>
                {isHe?"תיאור (אנגלית)":"Description (English)"}
              </label>
              <textarea value={description} onChange={e => setDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2.5 rounded-xl text-[13px] resize-none"
                style={{ background:P.bg, border:`1.5px solid ${description?P.border:"#FCA5A5"}`, color:P.text1, outline:"none" }}
                placeholder="Describe the work being claimed..."/>
            </div>
            <div>
              <label className="block text-[12px] font-bold mb-1.5" style={{ color:P.text2 }}>
                {isHe?"תיאור (עברית)":"Description (Hebrew)"}
              </label>
              <textarea value={descHe} onChange={e => setDescHe(e.target.value)} rows={2} dir="rtl"
                className="w-full px-3 py-2.5 rounded-xl text-[13px] resize-none"
                style={{ background:P.bg, border:`1.5px solid ${P.border}`, color:P.text1, outline:"none" }}
                placeholder="תיאור בעברית..."/>
            </div>

            {/* Amount + Retention */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold mb-1.5" style={{ color:P.text2 }}>
                  {isHe?"סכום הוגש (₪)":"Claimed Amount (₪)"}
                </label>
                <div className="relative">
                  <span className="absolute top-1/2 -translate-y-1/2 text-[14px] font-bold"
                    style={{ color:P.text3, insetInlineStart:"12px" }}>₪</span>
                  <input type="text" value={claimed} onChange={e => setClaimed(e.target.value)} dir="ltr"
                    className="w-full py-2.5 rounded-xl text-[13px] font-mono"
                    style={{ paddingLeft:"28px", paddingRight:"12px", textAlign:"right", background:P.bg, border:`1.5px solid ${claimed?P.border:"#FCA5A5"}`, color:P.text1, outline:"none" }}
                    placeholder="0"/>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1.5" style={{ color:P.text2 }}>
                  {isHe?"אחוז עכבון (%)":"Retention %"}
                </label>
                <input type="number" value={retention} onChange={e => setRetention(e.target.value)}
                  min="0" max="10" dir="ltr"
                  className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                  style={{ background:P.bg, border:`1.5px solid ${P.border}`, color:P.text1, outline:"none" }}/>
              </div>
            </div>

            {claimedNum>0 && (
              <div className="px-3 py-2.5 rounded-xl flex items-center gap-4 text-[12px]"
                style={{ background:P.warnBg, border:`1px solid #FDE68A` }}>
                <span style={{ color:P.warn }}>
                  {isHe?"עכבון שינוכה:":"Retention to be held:"} <strong>{fmt(retNum)}</strong>
                </span>
                <span style={{ color:P.text2 }}>
                  {isHe?"נטו לתשלום:":"Net Payable:"} <strong style={{ color:P.good }}>{fmt(netPayable)}</strong>
                </span>
              </div>
            )}

            {/* Approver + Ref */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold mb-1.5" style={{ color:P.text2 }}>
                  {isHe?"מאשר":"Approver"}
                </label>
                <select value={approver} onChange={e => setApprover(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px]"
                  style={{ background:P.bg, border:`1.5px solid ${P.border}`, color:P.text1, outline:"none" }}>
                  {["Eng. Cohen","PM Shapira","Eng. Mizrahi","Dir. Ben-David"].map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1.5" style={{ color:P.text2 }}>
                  {isHe?"מס' אסמכתא":"Reference #"}
                </label>
                <input type="text" value={billRef} onChange={e => setBillRef(e.target.value)} dir="ltr"
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] font-mono"
                  style={{ background:P.bg, border:`1.5px solid ${P.border}`, color:P.text1, outline:"none" }}
                  placeholder="PC-021"/>
              </div>
            </div>

            {/* Annexes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-bold flex items-center gap-1" style={{ color:P.text2 }}>
                  <Paperclip className="w-3.5 h-3.5"/>
                  {isHe?"נספחים":"Annexes"}
                  {files.length>0 && (
                    <span className="ms-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background:P.copperLight, color:P.copper }}>{files.length}</span>
                  )}
                </p>
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background:P.bg, border:`1px solid ${P.border}`, color:P.text2 }}>
                  <Plus className="w-3 h-3"/>{isHe?"הוסף קובץ":"Add file"}
                </button>
              </div>
              {files.length===0
                ? <p className="text-[12px] text-center py-3" style={{ color:P.text3 }}>
                    {isHe?"לא הועלו קבצים עדיין":"No files uploaded yet"}
                  </p>
                : (
                  <div className="space-y-1.5">
                    {files.map(f => {
                      const Icon=CAT_ICON[f.category]; const color=CAT_COLOR[f.category];
                      return (
                        <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                          style={{ background:P.bg, border:`1px solid ${P.border}` }}>
                          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }}/>
                          <span className="text-[11px] flex-1 truncate" style={{ color:P.text1 }}>{f.name}</span>
                          <span className="text-[10px]" style={{ color:P.text3 }}>{fmtSize(f.size)}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background:color+"18", color }}>
                            {isHe?CAT_HE[f.category]:CAT_EN[f.category]}
                          </span>
                          <button onClick={() => removeFile(f.id)}>
                            <X className="w-3 h-3" style={{ color:P.text3 }}/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </div>
          </div>
        )}

        {/* ══════════ STEP 2: PREVIEW ══════════ */}
        {step===2 && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${P.border}` }}>

              {/* Invoice header strip */}
              <div className="px-6 py-5 flex items-start justify-between"
                style={{ background:P.copperLight }}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                    style={{ color:P.copper }}>{isHe?"InfrAI בע\"מ":"InfrAI Ltd."}</p>
                  <p className="text-[20px] font-bold" style={{ color:P.text1 }}>
                    {isHe?"תצוגה מקדימה — חשבון":"Invoice Preview"}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color:P.text2 }}>
                    {isHe?"כביש 20 – הרחבה צפונית":"Highway 20 – North Extension"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold" style={{ color:P.text3 }}>{isHe?"מס' אסמכתא":"Ref #"}</p>
                  <p className="text-[16px] font-bold font-mono" style={{ color:P.copper }}>{billRef||"PC-NEW"}</p>
                </div>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-3" style={{ borderBottom:`1px solid ${P.border}` }}>
                {[
                  { l:isHe?"לקוח":"Client",     v:isHe?"משרד התחבורה – מחוז צפון":"Ministry of Transport – Northern District" },
                  { l:isHe?"תקופה":"Period",     v:`${MONTHS_EN[month]} ${year}` },
                  { l:isHe?"מועד פירעון":"Due",  v:new Date(year,month+1,28).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) },
                ].map((m,i) => (
                  <div key={i} className="px-5 py-3"
                    style={{ borderInlineEnd:i<2?`1px solid ${P.border}`:"none", background:P.card }}>
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color:P.text3 }}>{m.l}</p>
                    <p className="text-[12px] font-semibold mt-0.5" style={{ color:P.text1 }}>{m.v}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="px-5 py-3" style={{ borderBottom:`1px solid ${P.border}`, background:P.card }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color:P.text3 }}>
                  {isHe?"תיאור":"Description"}
                </p>
                <p className="text-[13px] font-medium" style={{ color:P.text1 }}>{description||"—"}</p>
              </div>

              {/* Line items */}
              {lineItems.length>0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-[11.5px]">
                    <thead><tr style={{ borderBottom:`1px solid ${P.border}` }}>
                      {(isHe?["#","פעילות","אזור","כמות","יחידה","מחיר","סכום"]:["#","Activity","Zone","Qty","Unit","Rate","Amount"]).map(h =>
                        <th key={h} className="px-4 py-2.5 text-left font-bold" style={{ color:P.text3, background:P.bg }}>{h}</th>
                      )}
                    </tr></thead>
                    <tbody>
                      {lineItems.map((li,i) => (
                        <tr key={i} style={{ borderBottom:`1px solid ${P.border}` }}>
                          <td className="px-4 py-2 font-mono text-[10px]" style={{ color:P.text3 }}>{i+1}</td>
                          <td className="px-4 py-2 font-medium" style={{ color:P.text1 }}>{isHe?li.activityHe:li.activity}</td>
                          <td className="px-4 py-2 text-center text-[10px] font-bold" style={{ color:P.copper }}>{li.zone}</td>
                          <td className="px-4 py-2 font-mono text-right" style={{ color:P.text1 }}>{li.qty.toLocaleString()}</td>
                          <td className="px-4 py-2" style={{ color:P.text3 }}>{li.unit}</td>
                          <td className="px-4 py-2 font-mono text-right" style={{ color:P.text2 }}>₪{li.rate.toLocaleString()}</td>
                          <td className="px-4 py-2 font-mono font-bold text-right" style={{ color:P.copper }}>₪{(li.qty*li.rate).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-3" style={{ borderBottom:`1px solid ${P.border}` }}>
                  <p className="text-[12px]" style={{ color:P.text2 }}>
                    {isHe?"סעיף יחיד — ללא פירוט":"Single line — no item breakdown"}
                  </p>
                </div>
              )}

              {/* Financial summary */}
              <div className="px-5 py-4 space-y-2" style={{ background:P.bg }}>
                {[
                  { l:isHe?"סה\"כ הוגש":"Gross Claimed",                          v:fmt(claimedNum),  c:P.text1, bold:false },
                  { l:isHe?`ניכוי עכבון (${retention}%)`:`Less Retention (${retention}%)`, v:`(${fmt(retNum)})`, c:P.warn,  bold:false },
                  { l:isHe?"נטו לתשלום":"Net Payable",                             v:fmt(netPayable),  c:P.good,  bold:true  },
                ].map(row => (
                  <div key={row.l} className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ color:P.text2, fontWeight:row.bold?700:400 }}>{row.l}</span>
                    <span className="text-[13px] font-mono" style={{ color:row.c, fontWeight:row.bold?800:600 }}>{row.v}</span>
                  </div>
                ))}
              </div>

              {/* Annexes */}
              {files.length>0 && (
                <div className="px-5 py-4" style={{ borderTop:`1px solid ${P.border}` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color:P.text3 }}>
                    {isHe?"נספחים":"Annexes"} ({files.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {files.map(f => {
                      const Icon=CAT_ICON[f.category]; const color=CAT_COLOR[f.category];
                      return (
                        <span key={f.id} className="flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-lg"
                          style={{ background:color+"14", color, border:`1px solid ${color}30` }}>
                          <Icon className="w-3 h-3"/>
                          {f.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Approver */}
              <div className="px-5 py-3 text-[11px]"
                style={{ borderTop:`1px solid ${P.border}`, color:P.text3 }}>
                {isHe?"לאישור:":"For approval:"}{" "}
                <strong style={{ color:P.text2 }}>{approver}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 shrink-0"
          style={{ borderTop:`1px solid ${P.border}`, background:P.bg }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold"
            style={{ background:P.border, color:P.text2 }}>
            {isHe?"ביטול":"Cancel"}
          </button>

          <div className="flex items-center gap-2">
            {step>0 && (
              <button onClick={() => setStep((step-1) as 0|1|2)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold"
                style={{ background:P.bg, border:`1px solid ${P.border}`, color:P.text2 }}>
                {isHe?<ArrowRight className="w-3.5 h-3.5"/>:<ArrowLeft className="w-3.5 h-3.5"/>}
                {isHe?"חזרה":"Back"}
              </button>
            )}

            {step===0 && (
              <button onClick={() => setStep(1)}
                disabled={aiPhase>0 && aiPhase<5}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
                style={{ background:P.copper }}>
                {isHe?<ArrowLeft className="w-3.5 h-3.5"/>:<ArrowRight className="w-3.5 h-3.5"/>}
                {isHe?"לפרטים →":"To Details →"}
              </button>
            )}
            {step===1 && (
              <button onClick={() => setStep(2)}
                disabled={!description||!claimed}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
                style={{ background:P.copper }}>
                <Eye className="w-3.5 h-3.5"/>
                {isHe?"תצוגה מקדימה":"Preview"}
              </button>
            )}
            {step===2 && (
              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-bold text-white"
                style={{ background:P.good }}>
                <Send className="w-3.5 h-3.5"/>
                {isHe?"שלח חשבון":"Submit Invoice"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */

type TabId = "all" | "pending" | "overdue" | "paid" | "disputed" | "retention";

export default function BillingPage() {
  const { active }                = useProjects();
  const isDemo                    = active.id === "highway-20";
  const { isHe }                   = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [invoices, setInvoices]   = useState<Invoice[]>(isDemo ? INVOICES : []);

  // ProjectProvider hydrates `active` from localStorage asynchronously after
  // first paint, so isDemo can flip after this component already mounted.
  useEffect(() => {
    setInvoices(isDemo ? INVOICES : []);
  }, [isDemo]);

  const contractValue   = isDemo ? 148_000_000 : (Number(active.contractValue.replace(/,/g, "")) || 0);
  const totalClaimed    = invoices.reduce((s, i) => s + i.claimedAmount, 0);
  const totalCertified  = invoices.reduce((s, i) => s + (i.certifiedAmount ?? 0), 0);
  const totalPaid       = invoices.reduce((s, i) => s + (i.paidAmount ?? 0), 0);
  const totalRetention  = invoices.reduce((s, i) => s + i.retentionHeld, 0);
  const totalOutstanding= totalCertified - totalPaid;
  const progress        = contractValue ? Math.round((totalClaimed / contractValue) * 100) : 0;

  const tabs: { id:TabId; labelEn:string; labelHe:string; count:number }[] = [
    { id:"all",       labelEn:"All Invoices",      labelHe:"כל החשבונות",   count:invoices.length },
    { id:"pending",   labelEn:"Pending Approval",  labelHe:"ממתין לאישור",  count:invoices.filter(i=>i.status==="PENDING APPROVAL"||i.status==="DRAFT").length },
    { id:"overdue",   labelEn:"Overdue",            labelHe:"באיחור",        count:invoices.filter(i=>i.status==="OVERDUE").length },
    { id:"disputed",  labelEn:"Disputed",           labelHe:"במחלוקת",       count:invoices.filter(i=>i.status==="DISPUTED").length },
    { id:"paid",      labelEn:"Paid",               labelHe:"שולם",          count:invoices.filter(i=>i.status==="PAID").length },
    { id:"retention", labelEn:"Retention Schedule", labelHe:"לוח עכבונות",  count:invoices.filter(i=>i.retentionHeld>0).length },
  ];

  const filtered = invoices.filter(inv => {
    const matchSearch = !search ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.description.toLowerCase().includes(search.toLowerCase()) ||
      inv.descriptionHe.includes(search) ||
      inv.ref.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      activeTab==="all"       ? true :
      activeTab==="pending"   ? (inv.status==="PENDING APPROVAL"||inv.status==="DRAFT") :
      activeTab==="overdue"   ? inv.status==="OVERDUE" :
      activeTab==="disputed"  ? inv.status==="DISPUTED" :
      activeTab==="paid"      ? inv.status==="PAID" :
      activeTab==="retention" ? inv.retentionHeld>0 : true;
    return matchSearch && matchTab;
  });

  function handleNewBill(inv: Invoice) {
    setInvoices(prev => [inv, ...prev]);
    setShowModal(false);
    setActiveTab("pending");
  }

  const L = {
    title:       isHe?"חשבונות":"Billing",
    newBill:     isHe?"חשבון חודשי חדש":"New Monthly Bill",
    search:      isHe?"חיפוש חשבון...":"Search invoices...",
    contract:    isHe?"שווי חוזה":"Contract Value",
    claimed:     isHe?"סה\"כ הוגש":"Total Claimed",
    certified:   isHe?"מאושר":"Certified",
    paid:        isHe?"שולם":"Paid",
    outstanding: isHe?"יתרה לתשלום":"Outstanding",
    retention:   isHe?"עכבון מצטבר":"Retention Held",
    progress:    isHe?"% ביצוע לפי חוזה":"% Claimed of Contract",
    aiLabel:     isHe?"תובנת AI לחיובים":"AI Billing Insight",
    aiText:      isHe
      ? "חשבון #19 (₪3.84M) עבר את מועד התשלום ב-4 ימים — שלח תזכורת לפקיד החשבונות. פקודת שינוי VO-023 במחלוקת; צפי לדחייה של ₪420K בהכנסה. עכבון מצטבר: ₪3.12M — שחרור מחצית צפוי בהשלמה מעשית של פרויקט."
      : "Invoice #19 (₪3.84M) is 4 days past due — send payment reminder to client's finance team. VO-023 is disputed; expect ₪420K revenue delay. Cumulative retention ₪3.12M — half expected to release on Practical Completion.",
    colId:       isHe?"מס' חשבון":"Invoice #",
    colType:     isHe?"סוג":"Type",
    colDesc:     isHe?"תיאור":"Description",
    colPeriod:   isHe?"תקופה":"Period",
    colSubmitted:isHe?"הוגש":"Submitted",
    colDue:      isHe?"פירעון":"Due Date",
    colClaimed:  isHe?"הוגש":"Claimed",
    colCertified:isHe?"מאושר":"Certified",
    colRetention:isHe?"עכבון":"Retention",
    colStatus:   isHe?"סטטוס":"Status",
    colApprover: isHe?"מאשר":"Approver",
    noResults:   isHe?"לא נמצאו חשבונות":"No invoices found",
  };

  return (
    <div dir={isHe?"rtl":"ltr"} className="flex flex-col h-full" style={{ background:P.bg }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background:P.card, borderBottom:`1px solid ${P.border}` }}>
        <h1 className="text-[18px] font-bold" style={{ color:P.text1 }}>{L.title}</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px]"
            style={{ background:P.bg, border:`1px solid ${P.border}` }}>
            <Search className="w-3.5 h-3.5" style={{ color:P.text3 }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={L.search}
              className="bg-transparent text-[13px] outline-none w-44" style={{ color:P.text1 }}/>
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{ background:P.bg, border:`1px solid ${P.border}`, color:P.text2 }}>
            <Download className="w-3.5 h-3.5"/>
            {isHe?"ייצוא":"Export"}
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background:P.copper }}>
            <Plus className="w-3.5 h-3.5"/>
            {L.newBill}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:P.bg, border:`1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color:P.text2 }}/>
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
            style={{ background:P.copper }}>DC</div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* KPI Row */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label:L.contract,    val:fmt(contractValue),    color:P.text1, sub:null },
            { label:L.claimed,     val:fmt(totalClaimed),     color:P.copper,sub:`${progress}% ${isHe?"מהחוזה":"of contract"}` },
            { label:L.certified,   val:fmt(totalCertified),   color:P.blue,  sub:null },
            { label:L.paid,        val:fmt(totalPaid),        color:P.good,  sub:null },
            { label:L.outstanding, val:fmt(totalOutstanding), color:totalOutstanding>0?P.danger:P.good, sub:null },
            { label:L.retention,   val:fmt(totalRetention),   color:P.warn,  sub:isHe?"~5% עכבון":"~5% held" },
          ].map(k => (
            <Card key={k.label} className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color:P.text3 }}>{k.label}</p>
              <p className="text-[20px] font-bold leading-tight" style={{ color:k.color }}>{k.val}</p>
              {k.sub && <p className="text-[10.5px] mt-0.5" style={{ color:P.text3 }}>{k.sub}</p>}
            </Card>
          ))}
        </div>

        {/* Progress bar */}
        <Card className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold" style={{ color:P.text2 }}>{L.progress}</p>
            <div className="flex items-center gap-4 text-[12px]">
              <span style={{ color:P.copper }}>{isHe?"הוגש":"Claimed"} {fmt(totalClaimed)}</span>
              <span style={{ color:P.good }}>{isHe?"שולם":"Paid"} {fmt(totalPaid)}</span>
              <span style={{ color:P.text3 }}>{isHe?"חוזה":"Contract"} {fmt(contractValue)}</span>
            </div>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{ background:P.border }}>
            <div className="absolute inset-y-0 start-0 rounded-full"
              style={{ width:`${Math.min((totalPaid/contractValue)*100,100)}%`, background:P.good }}/>
            <div className="absolute inset-y-0 start-0 rounded-full opacity-50"
              style={{ width:`${Math.min(progress,100)}%`, background:P.copper }}/>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[10.5px]" style={{ color:P.text3 }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background:P.good }}/>
              {isHe?"שולם":"Paid"} {Math.round((totalPaid/contractValue)*100)}%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block opacity-50" style={{ background:P.copper }}/>
              {isHe?"הוגש":"Claimed"} {progress}%
            </span>
            <span className="flex items-center gap-1" style={{ marginInlineStart:"auto" }}>
              {isHe?"יתרה לתביעה:":"Remaining to claim:"} {fmt(contractValue-totalClaimed)}
            </span>
          </div>
        </Card>

        {/* AI Insight */}
        {isDemo && (
          <div className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background:P.warnBg, border:`1px solid #FDE68A` }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background:"#FEF3C7" }}>
              <Lightbulb className="w-3.5 h-3.5" style={{ color:P.warn }}/>
            </div>
            <div>
              <p className="text-[12px] font-bold mb-0.5" style={{ color:P.warn }}>{L.aiLabel}</p>
              <p className="text-[12.5px]" style={{ color:P.text2 }}>{L.aiText}</p>
            </div>
          </div>
        )}

        {/* Invoice Table Card */}
        <Card>
          {/* Tab bar */}
          <div className="flex items-center overflow-x-auto px-4 pt-3"
            style={{ borderBottom:`1px solid ${P.border}` }}>
            {tabs.map(t => {
              const active = t.id===activeTab;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-semibold whitespace-nowrap border-b-2 shrink-0"
                  style={{ color:active?P.copper:P.text3, borderBottomColor:active?P.copper:"transparent", background:"transparent", marginBottom:"-1px" }}>
                  {isHe?t.labelHe:t.labelEn}
                  {t.count>0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                      style={{ background:active?P.copperLight:P.bg, color:active?P.copper:P.text3 }}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTab==="retention" ? (
            <div>
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[12px] font-bold" style={{ color:P.text2 }}>
                    {isHe?`עכבון כולל מוחזק: ${fmt(totalRetention)}`:`Total Retention Held: ${fmt(totalRetention)}`}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color:P.text3 }}>
                    {isHe?"50% ישוחרר בהשלמה מעשית • 50% בתום תקופת אחריות":"50% releases at Practical Completion • 50% at end of Defects Liability Period"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px]" style={{ color:P.text3 }}>{isHe?"שחרור ראשון (צפוי)":"First Release (est.)"}</p>
                  <p className="text-[13px] font-bold" style={{ color:P.good }}>{fmt(Math.round(totalRetention/2))} — {isHe?"דצמבר 2026":"Dec 2026"}</p>
                </div>
              </div>
              <table className="w-full text-[12px]">
                <thead><tr style={{ borderBottom:`1px solid ${P.border}` }}>
                  {[L.colId,isHe?"תיאור":"Description",L.colPeriod,L.colClaimed,L.colRetention,isHe?"שחרור צפוי":"Release Est."].map(h =>
                    <th key={h} className="px-4 py-3 text-left font-bold" style={{ color:P.text3, background:P.bg }}>{h}</th>
                  )}
                </tr></thead>
                <tbody>
                  {filtered.filter(i => i.retentionHeld>0).map(inv => (
                    <tr key={inv.id} className="hover:bg-[#F5F2EF]" style={{ borderBottom:`1px solid ${P.border}` }}>
                      <td className="px-4 py-2.5 font-mono text-[11px]" style={{ color:P.text3 }}>{inv.id}</td>
                      <td className="px-4 py-2.5 max-w-[220px]" style={{ color:P.text1 }}>{isHe?inv.descriptionHe:inv.description}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap" style={{ color:P.text2 }}>{isHe?inv.periodHe:inv.period}</td>
                      <td className="px-4 py-2.5 font-mono text-right" style={{ color:P.text2 }}>{fmt(inv.claimedAmount)}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-right" style={{ color:P.warn }}>{fmt(inv.retentionHeld)}</td>
                      <td className="px-4 py-2.5 text-[11px]" style={{ color:P.text3 }}>
                        <span style={{ color:P.good }}>{fmt(Math.round(inv.retentionHeld/2))}</span> {isHe?"בהשלמה":"at PC"} ·{" "}
                        <span style={{ color:P.good }}>{fmt(Math.round(inv.retentionHeld/2))}</span> {isHe?"בתום אחריות":"at DLP"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr style={{ borderBottom:`1px solid ${P.border}` }}>
                  {[L.colId,L.colType,L.colDesc,L.colPeriod,L.colSubmitted,L.colDue,L.colClaimed,L.colCertified,L.colRetention,L.colStatus,L.colApprover].map(h =>
                    <th key={h} className="px-4 py-3 text-left font-bold whitespace-nowrap" style={{ color:P.text3, background:P.bg }}>{h}</th>
                  )}
                </tr></thead>
                <tbody>
                  {filtered.length===0
                    ? <tr><td colSpan={11} className="px-4 py-10 text-center text-[13px]" style={{ color:P.text3 }}>{L.noResults}</td></tr>
                    : filtered.map(inv => {
                      const ss=STATUS_STYLE[inv.status]; const ts=TYPE_STYLE[inv.type]; const SI=ss.Icon;
                      const isOverdue = inv.status==="OVERDUE";
                      return (
                        <tr key={inv.id} className="hover:bg-[#F5F2EF] transition-colors"
                          style={{ borderBottom:`1px solid ${P.border}`, background:isOverdue?"#FFF8F8":undefined }}>
                          <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap" style={{ color:P.text3 }}>{inv.id}</td>
                          <td className="px-4 py-3"><Chip label={isHe?ts.labelHe:ts.label} bg={ts.bg} color={ts.color}/></td>
                          <td className="px-4 py-3 max-w-[220px]">
                            <p className="font-medium leading-snug" style={{ color:P.text1 }}>{isHe?inv.descriptionHe:inv.description}</p>
                            <p className="text-[10.5px] mt-0.5 font-mono" style={{ color:P.text3 }}>{inv.ref}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color:P.text2 }}>{isHe?inv.periodHe:inv.period}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-[11px]" style={{ color:P.text3 }}>{inv.submittedDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-[11px] font-semibold"
                            style={{ color:isOverdue?P.danger:P.text2 }}>
                            {inv.dueDate}
                            {isOverdue && <p className="text-[10px] font-bold" style={{ color:P.danger }}>{isHe?"⚠ פג מועד":"⚠ Past due"}</p>}
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-right whitespace-nowrap" style={{ color:P.text1 }}>{fmt(inv.claimedAmount)}</td>
                          <td className="px-4 py-3 font-mono text-right whitespace-nowrap"
                            style={{ color:inv.certifiedAmount!==null?P.blue:P.text3 }}>
                            {inv.certifiedAmount!==null?fmt(inv.certifiedAmount):"—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-right whitespace-nowrap"
                            style={{ color:inv.retentionHeld>0?P.warn:P.text3 }}>
                            {inv.retentionHeld>0?fmt(inv.retentionHeld):"—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full w-fit whitespace-nowrap"
                              style={{ background:ss.bg, color:ss.color }}>
                              <SI className="w-3 h-3"/>{isHe?ss.labelHe:ss.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color:P.text2 }}>{inv.approver}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          )}

          {filtered.length>0 && (
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop:`1px solid ${P.border}` }}>
              <p className="text-[12px]" style={{ color:P.text3 }}>
                {isHe?`מציג ${filtered.length} מתוך ${invoices.length} חשבונות`:`Showing ${filtered.length} of ${invoices.length} invoices`}
              </p>
              {activeTab!=="retention" && (
                <div className="flex items-center gap-6 text-[12px]">
                  <span style={{ color:P.text2 }}>
                    {isHe?"סה\"כ הוגש:":"Total Claimed:"}{" "}
                    <span className="font-bold" style={{ color:P.text1 }}>{fmt(filtered.reduce((s,i)=>s+i.claimedAmount,0))}</span>
                  </span>
                  <span style={{ color:P.text2 }}>
                    {isHe?"סה\"כ מאושר:":"Total Certified:"}{" "}
                    <span className="font-bold" style={{ color:P.blue }}>{fmt(filtered.reduce((s,i)=>s+(i.certifiedAmount??0),0))}</span>
                  </span>
                  <span style={{ color:P.text2 }}>
                    {isHe?"שולם:":"Paid:"}{" "}
                    <span className="font-bold" style={{ color:P.good }}>{fmt(filtered.reduce((s,i)=>s+(i.paidAmount??0),0))}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <NewBillModal isHe={isHe} onClose={() => setShowModal(false)} onSave={handleNewBill}/>
      )}
    </div>
  );
}
