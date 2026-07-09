"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Milestone {
  id: string;
  name: string;
  nameHe: string;
  date: string;
}

export interface ScheduleActivity {
  id: string;
  uniqueId: number;
  name: string;
  start: string;
  finish: string;
  duration: number;
  pct: number;          // 0–100
  isMilestone: boolean;
  isCritical: boolean;
  level: number;        // outline depth (0 = top)
  wbs: string | null;
  baselineStart: string | null;
  baselineFinish: string | null;
  predecessors: number[];
  successors: number[];
  totalSlack: number;
  freeSlack: number;
  // Optional — populated for projects with linear/chainage-based work (e.g. highway demo)
  // to drive the Time-Location (TILOS) view. Absent for normal uploaded schedules.
  chainageStart?: number;
  chainageEnd?: number;
  linear?: boolean;
}

export interface Project {
  id: string;
  name: string;
  nameHe: string;
  type: string;
  client: string;
  location: string;
  contractValue: string;
  startDate: string;
  endDate: string;
  pm: string;
  createdAt: string;
  scheduleFiles: number;
  contractFiles: number;
  boqFiles: number;
  drawingFiles: number;
  milestones: Milestone[];
  scheduleActivities: ScheduleActivity[];
}

const SEED: Project[] = [
  {
    id: "highway-20",
    name: "Highway 20 – North Extension",
    nameHe: "כביש 20 – הרחבה צפונית",
    type: "Road",
    client: "Ministry of Transport – Northern District",
    location: "Northern Israel",
    contractValue: "148,000,000",
    startDate: "2024-01-15",
    endDate: "2026-12-31",
    pm: "David Cohen",
    createdAt: "2024-01-01",
    scheduleFiles: 1,
    contractFiles: 1,
    boqFiles: 1,
    drawingFiles: 48,
    milestones: [
      { id: "m1", name: "Notice to Proceed",      nameHe: "הודעת תחילת עבודה", date: "2024-01-15" },
      { id: "m2", name: "Mobilisation Complete",  nameHe: "גיוס הושלם",        date: "2024-03-01" },
      { id: "m3", name: "Practical Completion",   nameHe: "השלמה מעשית",       date: "2026-09-30" },
      { id: "m4", name: "Defects Liability End",  nameHe: "תום תקופת אחריות",  date: "2027-09-30" },
    ],
    scheduleActivities: [],
  },
];

interface Ctx {
  projects: Project[];
  activeId: string;
  active: Project;
  setActiveId: (id: string) => void;
  addProject: (p: Project) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
}

const ProjectContext = createContext<Ctx | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(SEED);
  const [activeId, setActiveIdState] = useState<string>(SEED[0].id);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const ps = localStorage.getItem("infrai_projects");
      const ai = localStorage.getItem("infrai_active_project");
      if (ps) {
        // Ensure legacy projects without scheduleActivities still work
        const parsed: Project[] = JSON.parse(ps);
        setProjects(parsed.map(p => ({ ...p, scheduleActivities: p.scheduleActivities ?? [] })));
      }
      if (ai) setActiveIdState(ai);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem("infrai_projects", JSON.stringify(projects)); } catch {}
  }, [projects, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem("infrai_active_project", activeId); } catch {}
  }, [activeId, hydrated]);

  function setActiveId(id: string) { setActiveIdState(id); }

  function addProject(p: Project) {
    setProjects(prev => [...prev, p]);
    setActiveIdState(p.id);
  }

  function updateProject(id: string, patch: Partial<Project>) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  const active = projects.find(p => p.id === activeId) ?? projects[0];

  return (
    <ProjectContext.Provider value={{ projects, activeId, active, setActiveId, addProject, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be inside ProjectProvider");
  return ctx;
}
