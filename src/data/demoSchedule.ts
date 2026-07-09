import type { ScheduleActivity } from "@/contexts/ProjectContext";

interface RawRow {
  uid: number;
  wbs: string;
  name: string;
  start: string;
  finish: string;
  pct: number;
  critical: boolean;
  isMilestone?: boolean;
  preds?: number[];
  chainageStart?: number;
  chainageEnd?: number;
  linear?: boolean;
}

function diffDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

// Total alignment length 8.4km, four zones — matches the Design module's chainage scheme.
const RAW: RawRow[] = [
  { uid: 1,  wbs: "1",   name: "Earthworks",                       start: "2026-01-02", finish: "2026-07-15", pct: 78, critical: false },
  { uid: 2,  wbs: "1.1", name: "Site clearing & grubbing",          start: "2026-01-02", finish: "2026-02-15", pct: 100, critical: false, preds: [], chainageStart: 0, chainageEnd: 8400, linear: true },
  { uid: 3,  wbs: "1.2", name: "Bulk excavation – Zone A",          start: "2026-02-01", finish: "2026-04-30", pct: 92,  critical: false, preds: [2], chainageStart: 0, chainageEnd: 2100, linear: true },
  { uid: 4,  wbs: "1.3", name: "Bulk excavation – Zone B",          start: "2026-03-15", finish: "2026-06-30", pct: 75,  critical: false, preds: [2], chainageStart: 2100, chainageEnd: 4800, linear: true },
  { uid: 5,  wbs: "1.4", name: "Utility relocation – Zone D",       start: "2026-03-01", finish: "2026-07-15", pct: 23,  critical: true,  preds: [2], chainageStart: 6600, chainageEnd: 8400, linear: true },
  { uid: 6,  wbs: "2",   name: "Foundations",                       start: "2026-04-15", finish: "2026-10-31", pct: 35, critical: true },
  { uid: 7,  wbs: "2.1", name: "Pile drilling – Sec. A",             start: "2026-04-15", finish: "2026-07-31", pct: 65,  critical: true,  preds: [3], chainageStart: 0, chainageEnd: 2100, linear: true },
  { uid: 8,  wbs: "2.2", name: "Pile drilling – Sec. B",             start: "2026-06-01", finish: "2026-09-30", pct: 30,  critical: true,  preds: [4], chainageStart: 2100, chainageEnd: 4800, linear: true },
  { uid: 9,  wbs: "2.3", name: "Pile caps & grade beams",            start: "2026-07-15", finish: "2026-10-31", pct: 12,  critical: true,  preds: [7, 8], chainageStart: 0, chainageEnd: 4800, linear: true },
  { uid: 10, wbs: "3",   name: "Structures",                        start: "2026-06-15", finish: "2026-12-31", pct: 10, critical: true },
  { uid: 11, wbs: "3.1", name: "Bridge 68 – substructure",           start: "2026-08-01", finish: "2026-11-30", pct: 5,   critical: true,  preds: [9], chainageStart: 3200, chainageEnd: 3600, linear: false },
  { uid: 12, wbs: "3.2", name: "Bridge 68 – superstructure",         start: "2026-11-01", finish: "2026-12-31", pct: 0,   critical: true,  preds: [11], chainageStart: 3200, chainageEnd: 3600, linear: false },
  { uid: 13, wbs: "3.3", name: "Retaining walls – Zone A",           start: "2026-06-15", finish: "2026-09-30", pct: 28,  critical: false, preds: [3], chainageStart: 0, chainageEnd: 2100, linear: true },
  { uid: 14, wbs: "3.4", name: "Bridge deck formwork",                start: "2026-08-15", finish: "2026-12-15", pct: 0,   critical: false, preds: [12], chainageStart: 3200, chainageEnd: 3600, linear: false },
  { uid: 15, wbs: "4",   name: "Road pavement",                     start: "2026-05-01", finish: "2026-12-31", pct: 24, critical: false },
  { uid: 16, wbs: "4.1", name: "Subgrade preparation",                start: "2026-05-01", finish: "2026-08-31", pct: 61,  critical: false, preds: [3, 4], chainageStart: 0, chainageEnd: 8400, linear: true },
  { uid: 17, wbs: "4.2", name: "Sub-base layer",                     start: "2026-08-01", finish: "2026-10-31", pct: 15,  critical: false, preds: [16], chainageStart: 0, chainageEnd: 8400, linear: true },
  { uid: 18, wbs: "4.3", name: "Asphalt base course",                start: "2026-10-15", finish: "2026-12-31", pct: 0,   critical: false, preds: [17], chainageStart: 0, chainageEnd: 8400, linear: true },
  { uid: 19, wbs: "4.4", name: "Wearing course & markings",          start: "2026-12-01", finish: "2026-12-31", pct: 0,   critical: false, preds: [18], chainageStart: 0, chainageEnd: 8400, linear: true },
  { uid: 20, wbs: "5",   name: "Traffic systems",                    start: "2026-09-01", finish: "2026-12-31", pct: 0,  critical: false },
  { uid: 21, wbs: "5.1", name: "Traffic signals & signage",          start: "2026-09-01", finish: "2026-12-31", pct: 0,   critical: false, preds: [18], chainageStart: 0, chainageEnd: 8400, linear: true },
  { uid: 22, wbs: "5.2", name: "Lighting installation",              start: "2026-10-01", finish: "2026-12-31", pct: 0,   critical: false, preds: [21], chainageStart: 0, chainageEnd: 8400, linear: true },
  // Milestones
  { uid: 23, wbs: "1.5", name: "Utility Relocation Complete",        start: "2026-07-15", finish: "2026-07-15", pct: 0, critical: false, isMilestone: true, preds: [5] },
  { uid: 24, wbs: "3.5", name: "Bridge 68 Substructure Complete",    start: "2026-11-30", finish: "2026-11-30", pct: 0, critical: false, isMilestone: true, preds: [11] },
  { uid: 25, wbs: "6",   name: "Practical Completion",               start: "2026-12-31", finish: "2026-12-31", pct: 0, critical: false, isMilestone: true, preds: [19, 22] },
];

function buildSuccessors(rows: RawRow[]): Map<number, number[]> {
  const succ = new Map<number, number[]>();
  for (const r of rows) {
    for (const p of r.preds ?? []) {
      succ.set(p, [...(succ.get(p) ?? []), r.uid]);
    }
  }
  return succ;
}

const SLACK: Record<number, number> = {
  5: -14, 7: -7, 8: -14, 9: -14, 11: -14, 12: -14,
  3: 8, 4: 5, 13: 15, 16: 10, 17: 6, 18: 4, 19: 4, 21: 20, 22: 22,
};

export const DEMO_SCHEDULE_ACTIVITIES: ScheduleActivity[] = (() => {
  const successors = buildSuccessors(RAW);
  return RAW.map((r) => ({
    id: String(r.uid),
    uniqueId: r.uid,
    name: r.name,
    start: r.start,
    finish: r.finish,
    duration: Math.max(diffDays(r.start, r.finish), 0),
    pct: r.pct,
    isMilestone: !!r.isMilestone,
    isCritical: r.critical,
    level: r.wbs.includes(".") || r.isMilestone ? 1 : 0,
    wbs: r.wbs,
    baselineStart: r.start,
    baselineFinish: r.finish,
    predecessors: r.preds ?? [],
    successors: successors.get(r.uid) ?? [],
    totalSlack: SLACK[r.uid] ?? 0,
    freeSlack: SLACK[r.uid] ?? 0,
    chainageStart: r.chainageStart,
    chainageEnd: r.chainageEnd,
    linear: r.linear,
  }));
})();

export const DEMO_SCHEDULE_FILE_NAME = "HW20-MasterSchedule.xer";

export const TOTAL_CHAINAGE = 8400;
export const ZONE_BOUNDS: { zone: "A" | "B" | "C" | "D"; start: number; end: number }[] = [
  { zone: "A", start: 0,    end: 2100 },
  { zone: "B", start: 2100, end: 4800 },
  { zone: "C", start: 4800, end: 6600 },
  { zone: "D", start: 6600, end: 8400 },
];
