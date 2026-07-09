"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Discipline {
  code: string;
  en: string;
  he: string;
}

// Standard CAD/AEC disciplines for an infrastructure project — shared by every
// module that classifies work by discipline (Design's Drawing Register, RFIs, ...).
const DEFAULT_DISCIPLINES: Discipline[] = [
  { code: "SU", en: "Survey",                    he: "מדידה" },
  { code: "GT", en: "Geotechnical",               he: "גיאוטכני" },
  { code: "HW", en: "Highways / Roadworks",       he: "כבישים" },
  { code: "ST", en: "Structural",                 he: "קונסטרוקציה" },
  { code: "DR", en: "Drainage & Hydrology",        he: "ניקוז והידרולוגיה" },
  { code: "AR", en: "Architectural",              he: "אדריכלות" },
  { code: "ME", en: "Mechanical",                 he: "מכונות" },
  { code: "EL", en: "Electrical",                 he: "חשמל" },
  { code: "TR", en: "Traffic & ITS",              he: "תנועה ומערכות חכמות" },
  { code: "LA", en: "Landscape & Environmental",   he: "נוף וסביבה" },
  { code: "WS", en: "Water & Sewage",             he: "מים וביוב" },
  { code: "UT", en: "Utilities",                  he: "תשתיות" },
];

// Color palette assigned by list position (cycles), so any user-added discipline
// automatically gets a distinct, consistent color without needing a hardcoded entry.
const PALETTE: { bg: string; color: string }[] = [
  { bg: "#F1F5F9", color: "#475569" }, // slate
  { bg: "#FEF3C7", color: "#92400E" }, // amber
  { bg: "#E0F2FE", color: "#0369A1" }, // sky
  { bg: "#EDE9FE", color: "#7C3AED" }, // violet
  { bg: "#CCFBF1", color: "#0F766E" }, // teal
  { bg: "#FCE7F3", color: "#BE185D" }, // pink
  { bg: "#FFEDD5", color: "#C2410C" }, // orange
  { bg: "#FEF9C3", color: "#A16207" }, // yellow
  { bg: "#ECFDF5", color: "#047857" }, // emerald
  { bg: "#F0FDF4", color: "#15803D" }, // green
  { bg: "#CFFAFE", color: "#0E7490" }, // cyan
  { bg: "#F5F5F4", color: "#78716C" }, // stone
  { bg: "#E0E7FF", color: "#4338CA" }, // indigo
  { bg: "#FFE4E6", color: "#BE123C" }, // rose
];

interface Ctx {
  disciplines: Discipline[];
  addDiscipline: (d: Discipline) => void;
  removeDiscipline: (code: string) => void;
  styleFor: (code: string) => { bg: string; color: string };
}

const DisciplineContext = createContext<Ctx | null>(null);

export function DisciplineProvider({ children }: { children: ReactNode }) {
  const [disciplines, setDisciplines] = useState<Discipline[]>(DEFAULT_DISCIPLINES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("infrai_disciplines");
      if (raw) {
        const parsed: Discipline[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setDisciplines(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem("infrai_disciplines", JSON.stringify(disciplines)); } catch {}
  }, [disciplines, hydrated]);

  function addDiscipline(d: Discipline) {
    setDisciplines(prev => (prev.some(x => x.code === d.code) ? prev : [...prev, d]));
  }
  function removeDiscipline(code: string) {
    setDisciplines(prev => prev.filter(x => x.code !== code));
  }
  function styleFor(code: string) {
    const idx = disciplines.findIndex(x => x.code === code);
    return PALETTE[(idx >= 0 ? idx : 0) % PALETTE.length];
  }

  return (
    <DisciplineContext.Provider value={{ disciplines, addDiscipline, removeDiscipline, styleFor }}>
      {children}
    </DisciplineContext.Provider>
  );
}

export function useDisciplines() {
  const ctx = useContext(DisciplineContext);
  if (!ctx) throw new Error("useDisciplines must be inside DisciplineProvider");
  return ctx;
}
