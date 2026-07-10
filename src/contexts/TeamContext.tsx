"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

export interface Worker {
  id: string;
  name: string;
  nameHe: string;
  role: string;
  roleHe: string;
}

export const DEFAULT_WORKERS: Worker[] = [
  { id: "w-cohen",   name: "Eng. Cohen",      nameHe: "מהנדס כהן",              role: "Site Engineer",       roleHe: "מהנדס אתר" },
  { id: "w-mizrahi", name: "Eng. Mizrahi",    nameHe: "מהנדס מזרחי",            role: "Design Engineer",     roleHe: "מהנדס תכנון" },
  { id: "w-shapira", name: "Eng. Shapira",    nameHe: "מהנדס שפירא",            role: "Structural Engineer", roleHe: "מהנדס קונסטרוקציה" },
  { id: "w-katz",    name: "Eng. Katz",       nameHe: "מהנדס כץ",               role: "Site Engineer",       roleHe: "מהנדס אתר" },
  { id: "w-peretz",  name: "Foreman Peretz",  nameHe: "מנהל עבודה פרץ",         role: "Foreman",             roleHe: "מנהל עבודה" },
  { id: "w-dror",    name: "Foreman Dror",    nameHe: "מנהל עבודה דרור",        role: "Foreman",             roleHe: "מנהל עבודה" },
  { id: "w-benami",  name: "S.O. Ben-Ami",    nameHe: "קצין בטיחות בן-עמי",      role: "Safety Officer",      roleHe: "קצין בטיחות" },
  { id: "w-avraham", name: "QC Eng. Avraham", nameHe: "מהנדס בקרת איכות אברהם", role: "QA/QC Engineer",      roleHe: "מהנדס בקרת איכות" },
];

const STORAGE_KEY = "infrai_team";

interface Ctx {
  workers: Worker[];
  addWorker: (w: Omit<Worker, "id">) => void;
  removeWorker: (id: string) => void;
}

const TeamContext = createContext<Ctx | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>(DEFAULT_WORKERS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setWorkers(JSON.parse(stored)); } catch { /* ignore corrupt storage */ }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(workers));
  }, [workers, hydrated]);

  const addWorker = useCallback((w: Omit<Worker, "id">) => {
    setWorkers(prev => [...prev, { ...w, id: `w-${Date.now()}` }]);
  }, []);

  const removeWorker = useCallback((id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
  }, []);

  const value = useMemo(() => ({ workers, addWorker, removeWorker }), [workers, addWorker, removeWorker]);

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be inside TeamProvider");
  return ctx;
}
