"use client";

import { useState, useEffect } from "react";
import { EditDrawer, type SavedContent, type FlatContent } from "@/components/EditDrawer";
import { VideoBackground } from "@/components/VideoBackground";
import { LogoAnimation } from "@/components/LogoAnimation";
import { LogoIntro } from "@/components/LogoIntro";
import Link from "next/link";
import {
  ArrowRight, Zap, FolderOpen, CalendarDays, Banknote,
  Satellite, Pencil, CheckCircle, Scale, Lightbulb, Languages,
} from "lucide-react";

const L = {
  bg:      "#EDE8E1",
  bgAlt:   "#E4DDD5",
  card:    "#FAF8F5",
  border:  "#DDD5CB",
  copper:  "#D4714A",
  copperL: "#ECA070",
  copperD: "#B05E38",
  text1:   "#1C1917",
  text2:   "#57534E",
  text3:   "#A8A29E",
};

const FONT_HE = "'Heebo', 'Arial Hebrew', sans-serif";
const FONT_EN = "var(--font-inter), Inter, system-ui, sans-serif";

const T = {
  en: {
    badge:       "AI-Powered Infrastructure Management",
    headline1:   "Your Entire Project",
    headline2:   "In One Place",
    heroDesc:    "Documents, schedule, finance, and site data — all connected, all in InfrAI, all working together from day one",
    requestDemo: "Request a Demo",
    seePlatform: "See the Platform →",
    navItems:    ["Solutions", "How It Works", "Integrations", "About"],
    logIn:       "Log in",
    requestNav:  "Request Demo",
    langToggle:  "עברית",
    stats: [
      { value: "₪12B+", label: "Managed in active projects" },
      { value: "47",    label: "Infrastructure projects"     },
      { value: "230+",  label: "Active project managers"     },
    ],
    scenesTag:   "In Practice",
    scene1Title: "Morning review, site office",
    scene1Desc:  "PMs and engineers reviewing last night's drone scan against the schedule — in under 8 minutes",
    scene2Title: "Board presentation, HQ",
    scene2Desc:  "Executive team reviewing live project KPIs during a board meeting — no spreadsheets, no manual prep",
    platformTag:   "Platform",
    platformTitle: "Everything a PM needs, finally in one place",
    platformDesc:  "Six specialized modules. One unified AI layer. Zero switching between tools",
    processTag:   "Process",
    processTitle: "Up and running in one day",
    intTag:   "Integrations",
    intTitle: "Works with the tools your team already uses",
    datumTag:      "Featured Integration",
    datumTitle:    "DatumBIM",
    datumDesc:     "InfrAI is natively integrated with DatumBIM drone and BIM platform. Site progress from your latest drone scans appears automatically in your dashboard — compared against your schedule and BIM model in real time",
    datumFeatures: ["Drone scan sync", "BIM model comparison", "Zone-by-zone progress", "AI deviation alerts"],
    datumSub:      "Drone · BIM · Progress",
    datumLive:     "Live integration",
    aiTag:       "AI Layer",
    aiTitle:     "Ask anything about your project",
    aiDesc:      "InfrAI understands your actual project — contracts, drawings, schedule, and site data. Not generic answers. Answers grounded in your documents",
    aiConnected: "Connected to project",
    aiInput:     "Ask about your project…",
    aiQA: [
      { q: "What is delaying Bridge 68?",               a: "Utility relocation in Zone D is 14 days behind, blocking the Bridge 68 approach. RFI-042 is also unresolved" },
      { q: "Which quantities exceed the contract?",     a: "Steel reinforcement is 12% above BoQ quantities. Concrete for Zone C is tracking 8% over" },
      { q: "What activities are on the critical path?", a: "Utility relocation → Pile foundations → Bridge deck formwork → Deck slab concrete pour" },
    ],
    ctaLine1:   "Ready to take control",
    ctaLine2:   "of your project?",
    ctaDesc:    "Join infrastructure teams already managing their projects smarter with InfrAI",
    exploreBtn: "Explore the platform →",
    footerLinks: ["Privacy", "Terms", "Security", "Contact"],
    copyright:   "© 2026 InfrAI Ltd. All rights reserved",
  },
  he: {
    badge:       "ניהול תשתיות מבוסס בינה מלאכותית",
    headline1:   "כל הפרויקט",
    headline2:   "במקום אחד",
    heroDesc:    "מסמכים, לוח זמנים, פיננסים ונתוני אתר — הכל מחובר, הכל ב-InfrAI, הכל עובד יחד מהיום הראשון",
    requestDemo: "בקש הדגמה",
    seePlatform: "צפה בפלטפורמה ←",
    navItems:    ["פתרונות", "איך זה עובד", "אינטגרציות", "אודות"],
    logIn:       "כניסה",
    requestNav:  "בקש הדגמה",
    langToggle:  "English",
    stats: [
      { value: "12B+ ₪", label: "מנוהל בפרויקטים פעילים" },
      { value: "47",     label: "פרויקטי תשתית"            },
      { value: "230+",   label: "מנהלי פרויקטים פעילים"    },
    ],
    scenesTag:   "בפועל",
    scene1Title: "סקירת בוקר, משרד האתר",
    scene1Desc:  "מנהלי פרויקט ומהנדסים סוקרים את סריקת הרחפן האחרונה מול לוח הזמנים — תוך 8 דקות",
    scene2Title: "מצגת דירקטוריון, מטה",
    scene2Desc:  "צוות ניהול בכיר סוקר KPI חיים של פרויקטים בישיבת הדירקטוריון — ללא גיליונות אלקטרוניים",
    platformTag:   "פלטפורמה",
    platformTitle: "כל מה שמנהל פרויקט צריך, סוף סוף במקום אחד",
    platformDesc:  "שישה מודולים מתמחים, שכבת AI אחת מאוחדת, אפס החלפה בין כלים",
    processTag:   "תהליך",
    processTitle: "פעיל ומוכן תוך יום אחד",
    intTag:   "אינטגרציות",
    intTitle: "עובד עם הכלים שהצוות שלך כבר משתמש בהם",
    datumTag:      "אינטגרציה מובחרת",
    datumTitle:    "DatumBIM",
    datumDesc:     "InfrAI משולב ישירות עם פלטפורמת הרחפן ו-BIM של DatumBIM — התקדמות האתר מסריקות הרחפן מופיעה אוטומטית בלוח הבקרה בהשוואה ללוח הזמנים ולמודל ה-BIM",
    datumFeatures: ["סנכרון סריקת רחפן", "השוואת מודל BIM", "התקדמות לפי אזור", "התראות AI על סטיות"],
    datumSub:      "רחפן · BIM · התקדמות",
    datumLive:     "אינטגרציה חיה",
    aiTag:       "שכבת AI",
    aiTitle:     "שאל כל שאלה על הפרויקט שלך",
    aiDesc:      "InfrAI מבין את הפרויקט האמיתי שלך — חוזים, תוכניות, לוח זמנים ונתוני אתר, לא תשובות גנריות, תשובות המבוססות על המסמכים שלך",
    aiConnected: "מחובר לפרויקט",
    aiInput:     "שאל על הפרויקט שלך",
    aiQA: [
      { q: "מה מעכב את גשר 68",                          a: "העברת תשתיות באזור D מאחרת ב-14 יום, חוסמת את גישת גשר 68 — בקשת מידע 042 עדיין ללא מענה" },
      { q: "אילו כמויות חורגות מהחוזה",                  a: "ברזל לא מרותך גבוה ב-12% מכמויות החוזה — בטון באזור C גבוה ב-8%" },
      { q: "אילו פעילויות נמצאות בנתיב הקריטי",         a: "העברת תשתיות ← יסודות קידוח ← קינוף גשר ← יציקת כרכוב" },
    ],
    ctaLine1:   "מוכן להשתלט",
    ctaLine2:   "על הפרויקט שלך?",
    ctaDesc:    "הצטרף לצוותי תשתית שכבר מנהלים את הפרויקטים שלהם בצורה חכמה יותר עם InfrAI",
    exploreBtn: "גלה את הפלטפורמה ←",
    footerLinks: ["פרטיות", "תנאים", "אבטחה", "צור קשר"],
    copyright:   "© 2026 InfrAI בע״מ — כל הזכויות שמורות",
  },
};

const solutions = [
  { icon: FolderOpen,   iconCls: "text-violet-600", iconBg: "rgba(124,58,237,0.1)",
    titleEn: "Document Intelligence", titleHe: "בינת מסמכים",
    descEn: "Upload contracts, drawings, specs, and RFIs. InfrAI reads every page, extracts clauses, and understands relationships between documents",
    descHe: "העלה חוזים, תוכניות, מפרטים ובקשות מידע — InfrAI קורא כל עמוד, מחלץ סעיפים ומבין את הקשרים בין מסמכים",
    kickEn: "AI detects contradictions between drawings and specs before they hit the site",
    kickHe: "AI מזהה סתירות בין תוכניות ומפרטים לפני שמגיעים לאתר" },
  { icon: Pencil,       iconCls: "text-indigo-600", iconBg: "rgba(79,70,229,0.1)",
    titleEn: "Design Management", titleHe: "ניהול תכנון",
    descEn: "Centralize all drawing revisions, design change orders, and coordination issues with full history",
    descHe: "ריכוז כל תיקוני תוכניות, פקודות שינוי ובעיות תיאום עם היסטוריה מלאה",
    kickEn: "AI flags engineering inconsistencies across structural, MEP, and architectural drawings",
    kickHe: "AI מסמן אי-התאמות הנדסיות בין תוכניות קונסטרוקציה, מכונות וארכיטקטורה" },
  { icon: CalendarDays, iconCls: "text-amber-700",  iconBg: "rgba(180,83,9,0.1)",
    titleEn: "Schedule Analysis", titleHe: "ניתוח לוח זמנים",
    descEn: "Import P6 or MS Project files. Real-time critical path analysis, delay impact modeling, and what-if scenarios",
    descHe: "ייבוא קבצי P6 או MS Project — ניתוח נתיב קריטי בזמן אמת, מידול השפעות איחורים ותרחישי מה-אם",
    kickEn: "AI proactively reorders activities to recover delay and presents alternative critical paths",
    kickHe: "AI מארגן מחדש פעילויות לשחזור איחור ומציג נתיבים קריטיים חלופיים" },
  { icon: Banknote,     iconCls: "text-[#B05E38]",  iconBg: "rgba(176,94,56,0.1)",
    titleEn: "Finance & Budget", titleHe: "פיננסים ותקציב",
    descEn: "Track budget vs actuals, validate quantities against your BoQ, manage procurement — connected to SAP or Priority",
    descHe: "מעקב תקציב מול ביצוע, אימות כמויות מול כתב הכמויות, ניהול רכש — מחובר ל-SAP או Priority",
    kickEn: "AI detects cost overruns and invoice anomalies before they become claims",
    kickHe: "AI מזהה חריגות עלות ואנומליות בחשבוניות לפני שהופכות לתביעות" },
  { icon: Satellite,    iconCls: "text-emerald-700", iconBg: "rgba(4,120,87,0.1)",
    titleEn: "Site Progress", titleHe: "התקדמות אתר",
    descEn: "Connect DatumBIM drone scans to your schedule. Compare photogrammetry data to your BIM model",
    descHe: "חיבור סריקות רחפן DatumBIM ללוח הזמנים — השוואת נתוני פוטוגרמטריה למודל ה-BIM",
    kickEn: "AI compares drone imagery to BIM model and predicts completion dates per zone",
    kickHe: "AI משווה תמונות רחפן למודל BIM וחוזה תאריכי סיום לפי אזור" },
  { icon: Scale,        iconCls: "text-red-700",    iconBg: "rgba(185,28,28,0.1)",
    titleEn: "Claims & Risk", titleHe: "תביעות וסיכונים",
    descEn: "Track every RFI, change order, and contractual event. AI monitors for risk signals before small issues escalate",
    descHe: "מעקב אחר כל בקשת מידע, פקודת שינוי ואירוע חוזי — AI עוקב אחר אותות סיכון לפני שמסלימים",
    kickEn: "AI identifies contractual risk patterns and drafts preliminary claim documentation",
    kickHe: "AI מזהה דפוסי סיכון חוזיים ומכין תיעוד תביעה ראשוני" },
];

const steps = [
  { num: "01",
    titleEn: "Connect your project",    titleHe: "חבר את הפרויקט",
    descEn: "Upload contract, drawings, schedule (P6/MSP), and BoQ. Connect SAP, Priority, and DatumBIM. InfrAI builds a unified project model",
    descHe: "העלה חוזה, תוכניות, לוח זמנים ו-BoQ — חבר SAP, Priority ו-DatumBIM, InfrAI בונה מודל פרויקט מאוחד" },
  { num: "02",
    titleEn: "Get your command center",  titleHe: "קבל את מרכז הפיקוד",
    descEn: "Your dashboard goes live instantly. PM, engineer, subcontractor, and executive each get a role-specific view",
    descHe: "לוח הבקרה עולה לאוויר מיידית — מנהל פרויקט, מהנדס, קבלן משנה ומנהל כל אחד מקבל תצוגה מותאמת לתפקיד" },
  { num: "03",
    titleEn: "Ask, decide, act",         titleHe: "שאל, החלט, פעל",
    descEn: "Ask anything in plain language. Instant answers grounded in your actual documents, schedule, and site data",
    descHe: "שאל כל שאלה בשפה רגילה — תשובות מיידיות המבוססות על המסמכים, לוח הזמנים ונתוני האתר האמיתיים שלך" },
];

const integrations = [
  { name: "SAP ERP",      descEn: "Finance & procurement", descHe: "פיננסים ורכש",     bg: "rgba(212,113,74,0.07)", tc: "#B05E38", bc: "#DDD5CB" },
  { name: "Priority",     descEn: "Israeli ERP platform",  descHe: "מערכת ERP ישראלית", bg: "rgba(124,58,237,0.07)", tc: "#5B21B6", bc: "#DDD5CB" },
  { name: "Primavera P6", descEn: "Schedule management",   descHe: "ניהול לוח זמנים",  bg: "rgba(180,83,9,0.07)",   tc: "#92400E", bc: "#DDD5CB" },
  { name: "MS Project",   descEn: "Schedule management",   descHe: "ניהול לוח זמנים",  bg: "rgba(194,65,12,0.07)",  tc: "#9A3412", bc: "#DDD5CB" },
  { name: "AutoCAD",      descEn: "Drawing management",    descHe: "ניהול תוכניות",    bg: "rgba(185,28,28,0.07)",  tc: "#991B1B", bc: "#DDD5CB" },
];

function applyFlat(base: typeof T.en, f: FlatContent): typeof T.en {
  const o = (v: string | undefined, b: string) => v || b;
  return {
    ...base,
    badge:        o(f.badge,        base.badge),
    headline1:    o(f.headline1,    base.headline1),
    headline2:    o(f.headline2,    base.headline2),
    heroDesc:     o(f.heroDesc,     base.heroDesc),
    requestDemo:  o(f.requestDemo,  base.requestDemo),
    seePlatform:  o(f.seePlatform,  base.seePlatform),
    logIn:        o(f.logIn,        base.logIn),
    requestNav:   o(f.requestNav,   base.requestNav),
    navItems: [
      o(f.nav0, base.navItems[0]),
      o(f.nav1, base.navItems[1]),
      o(f.nav2, base.navItems[2]),
      o(f.nav3, base.navItems[3]),
    ],
    stats: [
      { value: o(f.stat0value, base.stats[0].value), label: o(f.stat0label, base.stats[0].label) },
      { value: o(f.stat1value, base.stats[1].value), label: o(f.stat1label, base.stats[1].label) },
      { value: o(f.stat2value, base.stats[2].value), label: o(f.stat2label, base.stats[2].label) },
    ],
    scene1Title:   o(f.scene1Title,   base.scene1Title),
    scene1Desc:    o(f.scene1Desc,    base.scene1Desc),
    scene2Title:   o(f.scene2Title,   base.scene2Title),
    scene2Desc:    o(f.scene2Desc,    base.scene2Desc),
    platformTag:   o(f.platformTag,   base.platformTag),
    platformTitle: o(f.platformTitle, base.platformTitle),
    platformDesc:  o(f.platformDesc,  base.platformDesc),
    datumTag:      o(f.datumTag,      base.datumTag),
    datumTitle:    o(f.datumTitle,    base.datumTitle),
    datumDesc:     o(f.datumDesc,     base.datumDesc),
    datumFeatures: [
      o(f.datumFeature0, base.datumFeatures[0]),
      o(f.datumFeature1, base.datumFeatures[1]),
      o(f.datumFeature2, base.datumFeatures[2]),
      o(f.datumFeature3, base.datumFeatures[3]),
    ],
    datumSub:   o(f.datumSub,   base.datumSub),
    datumLive:  o(f.datumLive,  base.datumLive),
    aiTag:       o(f.aiTag,       base.aiTag),
    aiTitle:     o(f.aiTitle,     base.aiTitle),
    aiDesc:      o(f.aiDesc,      base.aiDesc),
    aiConnected: o(f.aiConnected, base.aiConnected),
    aiInput:     o(f.aiInput,     base.aiInput),
    aiQA: [
      { q: o(f.aiQ0, base.aiQA[0].q), a: o(f.aiA0, base.aiQA[0].a) },
      { q: o(f.aiQ1, base.aiQA[1].q), a: o(f.aiA1, base.aiQA[1].a) },
      { q: o(f.aiQ2, base.aiQA[2].q), a: o(f.aiA2, base.aiQA[2].a) },
    ],
    ctaLine1:   o(f.ctaLine1,   base.ctaLine1),
    ctaLine2:   o(f.ctaLine2,   base.ctaLine2),
    ctaDesc:    o(f.ctaDesc,    base.ctaDesc),
    exploreBtn: o(f.exploreBtn, base.exploreBtn),
    footerLinks: [
      o(f.footer0, base.footerLinks[0]),
      o(f.footer1, base.footerLinks[1]),
      o(f.footer2, base.footerLinks[2]),
      o(f.footer3, base.footerLinks[3]),
    ],
    copyright: o(f.copyright, base.copyright),
  };
}

export default function LandingPage() {
  const [lang, setLang]           = useState<"en" | "he">("en");
  const [custom, setCustom]       = useState<SavedContent | null>(null);
  const [introDone,    setIntroDone]    = useState(false);
  const [introMounted, setIntroMounted] = useState(true);
  const isHe = lang === "he";
  const font = isHe ? FONT_HE : FONT_EN;
  const t    = custom ? applyFlat(T[lang], custom[lang]) : T[lang];

  const mergedSolutions = solutions.map((s, i) => {
    const f = custom?.[lang];
    const ti = `sol${i}title` as keyof FlatContent;
    const di = `sol${i}desc`  as keyof FlatContent;
    return {
      ...s,
      titleEn: (!isHe && f?.[ti]) ? (f[ti] as string) : s.titleEn,
      titleHe: (isHe  && f?.[ti]) ? (f[ti] as string) : s.titleHe,
      descEn:  (!isHe && f?.[di]) ? (f[di] as string) : s.descEn,
      descHe:  (isHe  && f?.[di]) ? (f[di] as string) : s.descHe,
    };
  });

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
    if (match?.[1] === "he") setLang("he");
    fetch("/api/content")
      .then(r => r.json())
      .then(d => { if (d?.en || d?.he) setCustom(d); })
      .catch(() => {});
  }, []);

  function toggleLang() {
    const next = lang === "en" ? "he" : "en";
    setLang(next);
    document.cookie = `lang=${next}; path=/; max-age=31536000`;
  }

  return (
    <>
      {/* Canvas stays mounted during its own 1 s fade so it doesn't snap off */}
      {introMounted && (
        <LogoIntro onDone={() => {
          setIntroDone(true);                              // page fades in (1 s)
          setTimeout(() => setIntroMounted(false), 1200); // remove canvas after fade
        }} />
      )}

    <div className="overflow-x-hidden" dir={isHe ? "rtl" : "ltr"}
      style={{
        background: L.bg, color: L.text1, fontFamily: font,
        opacity: introDone ? 1 : 0,
        transition: introDone ? "opacity 1s ease" : "none",
      }}>

      {/* ── Nav (dark, fixed over video) ──────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md flex items-center px-8"
        style={{ background: "rgba(22,17,14,0.88)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <Link href="/" className="flex items-center me-12">
            <LogoAnimation size={48} />
          </Link>
          <div className="hidden md:flex items-center gap-8 flex-1">
            {t.navItems.map((item, i) => (
              <a key={i} href={`#section-${i}`} className="text-[14px] font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 ms-auto">
            <button onClick={toggleLang}
              className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)", fontFamily: FONT_HE }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = L.copperL; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
              <Languages className="w-3.5 h-3.5" />
              {t.langToggle}
            </button>
            <Link href="/login" className="text-[14px] font-medium transition-colors" style={{ color: "rgba(255,255,255,0.6)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
              {t.logIn}
            </Link>
            <Link href="/login"
              className="flex items-center gap-1.5 text-white text-[14px] font-semibold px-4 py-2 rounded-xl transition-colors"
              style={{ background: L.copper }}
              onMouseEnter={(e) => (e.currentTarget.style.background = L.copperD)}
              onMouseLeave={(e) => (e.currentTarget.style.background = L.copper)}>
              {t.requestNav} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — full-screen video background ─ */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "65vh" }}>
        <VideoBackground className="absolute inset-0 w-full h-full object-cover" />
        {/* warm dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(20,14,10,0.7) 0%, rgba(26,21,18,0.62) 60%, rgba(26,21,18,0.85) 100%)" }} />
        {/* fallback shown while video is absent */}
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(160deg, #2C1810 0%, #1A1512 55%, #2A1A0E 100%)" }} />

        <div className="relative z-10 px-6 text-center max-w-5xl mx-auto pt-16">
          <h1 className="text-[52px] sm:text-[64px] lg:text-[76px] font-bold text-center leading-[1.06] tracking-tight mb-6"
            style={{ color: "#fff", textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}>
            {t.headline1}
            <br />
            <span style={{ backgroundImage: `linear-gradient(135deg, ${L.copperL}, #F5C4A8)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t.headline2}
            </span>
          </h1>
          <p className="text-[18px] sm:text-[20px] text-center max-w-2xl mx-auto leading-relaxed mb-10 font-medium"
            style={{ color: "rgba(255,255,255,0.72)" }}>
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login"
              className="flex items-center gap-2 text-white text-[16px] font-bold px-7 py-3.5 rounded-xl transition-all"
              style={{ background: L.copper, boxShadow: "0 8px 28px rgba(212,113,74,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = L.copperD)}
              onMouseLeave={(e) => (e.currentTarget.style.background = L.copper)}>
              {t.requestDemo} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard"
              className="text-[16px] font-semibold px-7 py-3.5 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
              {t.seePlatform}
            </Link>
          </div>
        </div>

      </section>

      {/* ── Dashboard Mockup ─────────────────── */}
      <section className="py-16 px-6" style={{ background: L.bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${L.border}`, boxShadow: "0 24px 60px rgba(28,25,23,0.14)" }}>
            <div className="flex items-center px-4 py-3 gap-2" style={{ background: L.card, borderBottom: `1px solid ${L.border}` }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex-1 mx-4 rounded-lg px-3 py-1 text-[12px]" style={{ background: L.bg, color: L.text3, fontFamily: FONT_EN }}>
                app.infrai.io/dashboard
              </div>
            </div>
            <div className="flex gap-0 overflow-hidden" dir="ltr" style={{ background: L.bg, height: 400 }}>

              {/* Sidebar */}
              <div className="w-36 shrink-0 flex flex-col py-2 px-2 gap-0.5" style={{ background: "#1A1512" }}>
                <div className="flex items-center gap-1.5 px-2 py-2 mb-1">
                  <div className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-white text-[8px] font-bold" style={{ background: L.copper }}>AI</div>
                  <span className="text-[11px] font-bold text-white" style={{ fontFamily: FONT_EN }}>InfrAI</span>
                </div>
                <div className="px-2 py-1.5 rounded-lg mb-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <p className="text-[8px] font-bold uppercase" style={{ color: "#78716C" }}>Active Project</p>
                  <p className="text-[9px] font-semibold truncate" style={{ color: "#D6D0CA" }}>Highway 20 – North</p>
                </div>
                {[
                  { label: "Dashboard", active: true },
                  { label: "Documents",  active: false },
                  { label: "Schedule",   active: false },
                  { label: "Finance",    active: false },
                  { label: "Site Progress", active: false },
                  { label: "RFIs",       active: false },
                  { label: "Claims",     active: false },
                ].map(({ label, active }) => (
                  <div key={label} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                    style={{ background: active ? L.copper : "transparent" }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? "#fff" : "rgba(255,255,255,0.25)" }} />
                    <span className="text-[10px] font-medium" style={{ color: active ? "#fff" : "#78716C", fontFamily: FONT_EN }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col gap-2.5 p-3 overflow-hidden">

                {/* Top bar */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl shrink-0" style={{ background: L.card }}>
                  <div>
                    <p className="text-[10px] font-bold" style={{ color: L.text1, fontFamily: FONT_EN }}>Good morning, David</p>
                    <p className="text-[9px]" style={{ color: L.text3, fontFamily: FONT_EN }}>Highway 20 – North Extension · Day 284 of 500</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#92400E", fontFamily: FONT_EN }}>2 Alerts</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: L.copper }}>DC</div>
                  </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-4 gap-2 shrink-0">
                  {[
                    { label: "Budget Used",    value: "₪312M",  sub: "of ₪450M",    pct: 69,  color: "#15803D", ring: true  },
                    { label: "Schedule",       value: "57%",    sub: "On track",     pct: 57,  color: "#D97706", ring: true  },
                    { label: "Open Issues",    value: "23",     sub: "4 critical",   color: "#B91C1C", ring: false },
                    { label: "Pending Approv", value: "7",      sub: "2 urgent",     color: "#B45309", ring: false },
                  ].map((k) => (
                    <div key={k.label} className="rounded-xl p-2.5" style={{ background: L.card }}>
                      <p className="text-[8px] font-bold uppercase tracking-wide mb-1.5" style={{ color: L.text3, fontFamily: FONT_EN }}>{k.label}</p>
                      <div className="flex items-center gap-2">
                        {k.ring ? (
                          <svg width="30" height="30" className="shrink-0" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="15" cy="15" r="11" fill="none" stroke="#E7E0D8" strokeWidth="3.5" />
                            <circle cx="15" cy="15" r="11" fill="none" stroke={k.color} strokeWidth="3.5"
                              strokeDasharray={`${(k.pct! / 100) * 69.1} 69.1`} strokeLinecap="round" />
                          </svg>
                        ) : (
                          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
                            style={{ background: `${k.color}15`, color: k.color }}>{k.value}</div>
                        )}
                        <div>
                          {k.ring && <p className="text-[11px] font-bold leading-none" style={{ color: L.text1, fontFamily: FONT_EN }}>{k.value}</p>}
                          <p className="text-[9px]" style={{ color: k.color, fontFamily: FONT_EN }}>{k.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detail cards */}
                <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">

                  {/* Critical path */}
                  <div className="rounded-xl p-2.5 overflow-hidden" style={{ background: L.card }}>
                    <p className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: L.text3, fontFamily: FONT_EN }}>Critical Path</p>
                    {[
                      { label: "Utility relocation",  status: "late",    days: "-14d" },
                      { label: "Pile foundations",    status: "at-risk",  days: "-3d"  },
                      { label: "Bridge deck form",    status: "on-track", days: "0"    },
                      { label: "Deck slab pour",      status: "on-track", days: "+2d"  },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1" style={{ borderBottom: `1px solid ${L.border}` }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.status === "late" ? "#B91C1C" : item.status === "at-risk" ? "#D97706" : "#15803D" }} />
                          <span className="text-[9px]" style={{ color: L.text2, fontFamily: FONT_EN }}>{item.label}</span>
                        </div>
                        <span className="text-[8px] font-bold" style={{ color: item.status === "late" ? "#B91C1C" : item.status === "at-risk" ? "#D97706" : "#15803D", fontFamily: FONT_EN }}>{item.days}</span>
                      </div>
                    ))}
                  </div>

                  {/* Budget by zone */}
                  <div className="rounded-xl p-2.5 overflow-hidden" style={{ background: L.card }}>
                    <p className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: L.text3, fontFamily: FONT_EN }}>Budget by Zone</p>
                    {[
                      { zone: "Zone A – Bridge",   pct: 82, over: false },
                      { zone: "Zone B – Road",     pct: 61, over: false },
                      { zone: "Zone C – Drainage", pct: 108, over: true  },
                      { zone: "Zone D – Utilities", pct: 44, over: false },
                    ].map((z) => (
                      <div key={z.zone} className="mb-1.5">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[8.5px]" style={{ color: L.text2, fontFamily: FONT_EN }}>{z.zone}</span>
                          <span className="text-[8px] font-bold" style={{ color: z.over ? "#B91C1C" : L.text3, fontFamily: FONT_EN }}>{z.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: L.bg }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(z.pct, 100)}%`, background: z.over ? "#B91C1C" : "#15803D" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div className="rounded-xl p-2.5 overflow-hidden" style={{ background: L.card }}>
                    <p className="text-[9px] font-bold uppercase tracking-wide mb-2" style={{ color: L.text3, fontFamily: FONT_EN }}>Recent Activity</p>
                    {[
                      { text: "RFI-042 submitted",       time: "2h ago",  dot: "#D97706" },
                      { text: "Drone scan uploaded",     time: "5h ago",  dot: "#15803D" },
                      { text: "Invoice #312 approved",   time: "Yesterday", dot: "#15803D" },
                      { text: "Design rev. D uploaded",  time: "2d ago",  dot: L.copper  },
                      { text: "Zone C over-budget alert", time: "2d ago", dot: "#B91C1C" },
                    ].map((a) => (
                      <div key={a.text} className="flex items-start gap-1.5 py-1" style={{ borderBottom: `1px solid ${L.border}` }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ background: a.dot }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[8.5px] leading-tight truncate" style={{ color: L.text2, fontFamily: FONT_EN }}>{a.text}</p>
                          <p className="text-[7.5px]" style={{ color: L.text3, fontFamily: FONT_EN }}>{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────── */}
      <section className="py-14" style={{ background: L.card, borderBottom: `1px solid ${L.border}` }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-8">
          {t.stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[34px] font-bold tracking-tight" style={{ color: L.copper }}>{s.value}</p>
              <p className="text-[14px] font-medium mt-1" style={{ color: L.text2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scene Photos — full-bleed split panels ── */}
      <section className="flex flex-col md:flex-row gap-2 px-2 pb-2" style={{ minHeight: 500, background: L.bg }}>

        <div className="flex-1 relative flex items-end overflow-hidden rounded-2xl" style={{ minHeight: 500 }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2C2218 0%, #1A1512 100%)" }} />
          <img src="/ChatGPT Image Jun 28, 2026, 11_48_21 PM.png" alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(20,14,10,0.93) 0%, rgba(20,14,10,0.35) 55%, rgba(20,14,10,0.1) 100%)" }} />
          <div className="absolute inset-y-0 end-0 w-px hidden md:block" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="relative z-10 p-8 pb-10">
            <h3 className="text-[24px] font-bold text-white mb-2 leading-snug">{t.scene1Title}</h3>
            <p className="text-[15px] leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.62)" }}>{t.scene1Desc}</p>
          </div>
        </div>

        <div className="flex-1 relative flex items-end overflow-hidden rounded-2xl" style={{ minHeight: 500 }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #18202C 0%, #0E1520 100%)" }} />
          <img src="/ChatGPT Image Jun 29, 2026, 12_04_28 AM.png" alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,14,22,0.93) 0%, rgba(10,14,22,0.35) 55%, rgba(10,14,22,0.1) 100%)" }} />
          <div className="relative z-10 p-8 pb-10">
            <h3 className="text-[24px] font-bold text-white mb-2 leading-snug">{t.scene2Title}</h3>
            <p className="text-[15px] leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.62)" }}>{t.scene2Desc}</p>
          </div>
        </div>

      </section>

      {/* ── Solutions ─────────────────────────── */}
      <section id="section-0" className="py-20 px-6" style={{ background: L.bgAlt, borderTop: `1px solid ${L.border}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-3" style={{ color: L.copper }}>{t.platformTag}</p>
            <h2 className="text-[38px] sm:text-[46px] font-bold leading-tight tracking-tight" style={{ color: L.text1 }}>{t.platformTitle}</h2>
            <p className="text-[16px] mt-4 max-w-2xl mx-auto" style={{ color: L.text2 }}>{t.platformDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mergedSolutions.map((sol) => (
              <div key={sol.titleEn} className="rounded-2xl p-6 transition-all"
                style={{ background: L.card, border: `1px solid ${L.border}`, boxShadow: "0 2px 8px rgba(28,25,23,0.04)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,113,74,0.35)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,113,74,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.boxShadow = "0 2px 8px rgba(28,25,23,0.04)"; }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: sol.iconBg }}>
                  <sol.icon className={`w-5 h-5 ${sol.iconCls}`} />
                </div>
                <h3 className="text-[16px] font-bold mb-2" style={{ color: L.text1 }}>{isHe ? sol.titleHe : sol.titleEn}</h3>
                <p className="text-[14px] leading-relaxed mb-4" style={{ color: L.text2 }}>{isHe ? sol.descHe : sol.descEn}</p>
                <div className="flex items-start gap-2 pt-4" style={{ borderTop: `1px solid ${L.border}` }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(212,113,74,0.12)" }}>
                    <Lightbulb className="w-2.5 h-2.5" style={{ color: L.copper }} />
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed" style={{ color: L.copperD }}>{isHe ? sol.kickHe : sol.kickEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────── */}
      <section id="section-1" className="py-20 px-6" style={{ background: L.bg, borderTop: `1px solid ${L.border}` }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-3" style={{ color: L.copper }}>{t.processTag}</p>
            <h2 className="text-[38px] sm:text-[46px] font-bold leading-tight tracking-tight" style={{ color: L.text1 }}>{t.processTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num}>
                <div className="text-[60px] font-black leading-none mb-4 select-none" style={{ color: "rgba(212,113,74,0.16)" }}>{step.num}</div>
                <h3 className="text-[19px] font-bold mb-3" style={{ color: L.text1 }}>{isHe ? step.titleHe : step.titleEn}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: L.text2 }}>{isHe ? step.descHe : step.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ──────────────────────── */}
      <section id="section-2" className="py-20 px-6" style={{ background: L.bgAlt, borderTop: `1px solid ${L.border}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[13px] font-bold uppercase tracking-widest mb-3" style={{ color: L.copper }}>{t.intTag}</p>
            <h2 className="text-[38px] sm:text-[46px] font-bold leading-tight tracking-tight" style={{ color: L.text1 }}>{t.intTitle}</h2>
          </div>
          <div className="rounded-2xl p-8 mb-6 flex flex-col md:flex-row items-center gap-8"
            style={{ background: L.card, border: "1px solid #BBF7D0", boxShadow: "0 4px 20px rgba(4,120,87,0.07)" }}>
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 px-3 py-1 rounded-full mb-4"
                style={{ background: "rgba(4,120,87,0.08)", border: "1px solid rgba(4,120,87,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t.datumTag}
              </span>
              <h3 className="text-[26px] font-bold mb-3" style={{ color: L.text1, fontFamily: FONT_EN }}>{t.datumTitle}</h3>
              <p className="text-[15px] leading-relaxed mb-5 max-w-lg" style={{ color: L.text2 }}>{t.datumDesc}</p>
              <div className="flex flex-wrap gap-2.5">
                {t.datumFeatures.map((f) => (
                  <span key={f} className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-800 px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(4,120,87,0.08)" }}>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />{f}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full md:w-48 shrink-0">
              <div className="rounded-xl p-5 text-center" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <Satellite className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <p className="text-[15px] font-bold" style={{ color: L.text1, fontFamily: FONT_EN }}>DatumBIM</p>
                <p className="text-[12px] mt-1" style={{ color: L.text2, fontFamily: FONT_EN }}>{t.datumSub}</p>
                <div className="mt-3 text-[11px] font-bold text-emerald-700 px-2 py-1 rounded-lg" style={{ background: "rgba(4,120,87,0.08)" }}>
                  {t.datumLive}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {integrations.map((int) => (
              <div key={int.name} className="rounded-xl p-4 text-center" style={{ background: int.bg, border: `1px solid ${int.bc}` }}>
                <p className="text-[14px] font-bold mb-0.5" style={{ color: int.tc, fontFamily: FONT_EN }}>{int.name}</p>
                <p className="text-[12px]" style={{ color: L.text2 }}>{isHe ? int.descHe : int.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Section ────────────────────────── */}
      <section className="py-20 px-6" style={{ background: L.bg, borderTop: `1px solid ${L.border}` }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[13px] font-bold uppercase tracking-widest mb-3" style={{ color: L.copper }}>{t.aiTag}</p>
          <h2 className="text-[38px] sm:text-[46px] font-bold leading-tight tracking-tight mb-5" style={{ color: L.text1 }}>{t.aiTitle}</h2>
          <p className="text-[16px] mb-10" style={{ color: L.text2 }}>{t.aiDesc}</p>
          <div className="rounded-2xl p-6 text-left max-w-2xl mx-auto" dir="ltr"
            style={{ background: "#1A1512", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", fontFamily: FONT_EN }}>
            <div className="flex items-center gap-2.5 mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: L.copper }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[14px] font-bold text-white">InfrAI Assistant</span>
              <span className="ml-auto text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.12)" }}>{t.aiConnected}</span>
            </div>
            <div className="space-y-3">
              {t.aiQA.map(({ q, a }) => (
                <div key={q} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="text-white text-[13px] px-4 py-2.5 rounded-xl rounded-tr-sm max-w-xs" style={{ background: L.copper }}>{q}</div>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: L.copper }}>
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="text-[13px] px-4 py-2.5 rounded-xl rounded-tl-sm max-w-sm leading-relaxed"
                      style={{ background: "rgba(255,255,255,0.07)", color: "#D6D0CA" }}>{a}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex-1 rounded-xl px-4 py-2.5 text-[13px]" style={{ background: "rgba(255,255,255,0.06)", color: "#78716C" }}>
                {t.aiInput}
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: L.copper }}>
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#1A1512" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[42px] sm:text-[50px] font-bold text-white leading-tight tracking-tight mb-5">
            {t.ctaLine1}<br />
            <span style={{ backgroundImage: `linear-gradient(135deg, ${L.copperL}, ${L.copper})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t.ctaLine2}
            </span>
          </h2>
          <p className="text-[17px] mb-10" style={{ color: "#A8A29E" }}>{t.ctaDesc}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login"
              className="flex items-center gap-2 text-white text-[16px] font-bold px-8 py-4 rounded-xl transition-all"
              style={{ background: L.copper, boxShadow: "0 8px 24px rgba(212,113,74,0.35)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = L.copperD)}
              onMouseLeave={(e) => (e.currentTarget.style.background = L.copper)}>
              {t.requestDemo} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className="text-[16px] font-semibold transition-colors" style={{ color: "#78716C" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D6D0CA")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#78716C")}>
              {t.exploreBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────── */}
      <footer className="py-10 px-6" style={{ background: L.card, borderTop: `1px solid ${L.border}` }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <LogoAnimation size={52} />
          </div>
          <div className="flex items-center gap-8">
            {t.footerLinks.map((item) => (
              <a key={item} href="#" className="text-[13px] font-medium transition-colors" style={{ color: L.text3 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = L.copper)}
                onMouseLeave={(e) => (e.currentTarget.style.color = L.text3)}>
                {item}
              </a>
            ))}
          </div>
          <p className="text-[13px]" style={{ color: L.text3 }}>{t.copyright}</p>
        </div>
      </footer>

      <EditDrawer
        currentEn={{
          ...(custom ? applyFlat(T.en, custom.en) : T.en) as unknown as Record<string, unknown>,
          solutions: mergedSolutions.map(s => ({ title: s.titleEn, desc: s.descEn })),
        }}
        currentHe={{
          ...(custom ? applyFlat(T.he, custom.he) : T.he) as unknown as Record<string, unknown>,
          solutions: mergedSolutions.map(s => ({ title: s.titleHe, desc: s.descHe })),
        }}
        onSaved={(c) => setCustom(c)}
      />
    </div>
    </>
  );
}
