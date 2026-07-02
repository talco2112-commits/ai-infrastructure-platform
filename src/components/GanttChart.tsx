"use client";

import {
  useRef, useState, useMemo, useCallback,
  useEffect, type ChangeEvent,
} from "react";
import { Search, Link2 } from "lucide-react";
import type { ScheduleActivity } from "@/contexts/ProjectContext";

/* ── constants ──────────────────────────────────────────────────────── */

const ROW_H    = 26;
const HEADER_H = 40;   // two rows, 20px each
const LEFT_W   = 260;
const MIN_PX   = 1.2;
const MAX_PX   = 55;
const DEP_OVERHANG = 7; // px past bar end before turning

const C = {
  bg:       "#F4F0EA",
  card:     "#FAF8F5",
  border:   "#DDD6CE",
  copper:   "#8B5A2B",
  copperMd: "#A0703F",
  copperLt: "#C49568",
  text1:    "#1C1917",
  text2:    "#57534E",
  text3:    "#A8A29E",
  danger:   "#B91C1C",
  dangerLt: "#FECACA",
  mile:     "#7C3AED",
  stripe0:  "#FAF8F5",
  stripe1:  "#F0EBE4",
  gridLine: "#E5DDD5",
  today:    "#8B5A2B",
  depNorm:  "#B0A398",
  depCrit:  "#DC2626",
};

type FilterMode = "all" | "summary" | "critical" | "milestones";

/* ── date helpers ───────────────────────────────────────────────────── */

function toDate(s: string) { return new Date(s + "T00:00:00"); }
function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfNextMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 1); }

/* ── zoom snap (for toolbar label only) ──────────────────────────────── */

function zoomLabel(px: number) {
  if (px <  3)   return "Q";
  if (px <  6.5) return "M";
  if (px < 18)   return "W";
  return "D";
}

const ZOOM_SNAPS = [2.0, 4.5, 11, 38];

/* ── time header data ──────────────────────────────────────────────── */

interface ColDef { label: string; left: number; width: number }

function buildHeader(origin: Date, totalDays: number, pxPerDay: number, isHe: boolean) {
  const locale = isHe ? "he-IL" : "en-GB";
  const major: ColDef[] = [];
  const minor: ColDef[] = [];
  const scale = zoomLabel(pxPerDay);

  if (scale === "D") {
    // major = months, minor = days
    let m = startOfMonth(origin);
    while (diffDays(origin, m) < totalDays) {
      const left  = Math.max(0, diffDays(origin, m)) * pxPerDay;
      const right = Math.min(totalDays, diffDays(origin, startOfNextMonth(m))) * pxPerDay;
      if (right > left) major.push({ label: m.toLocaleDateString(locale, { month: "short", year: "2-digit" }), left, width: right - left });
      m = startOfNextMonth(m);
    }
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(origin, i);
      const dow = d.getDay();
      minor.push({ label: dow === 1 || (i === 0) || d.getDate() === 1 ? String(d.getDate()) : "", left: i * pxPerDay, width: pxPerDay });
    }
  } else if (scale === "W") {
    // major = months, minor = weeks
    let m = startOfMonth(origin);
    while (diffDays(origin, m) < totalDays) {
      const left  = Math.max(0, diffDays(origin, m)) * pxPerDay;
      const right = Math.min(totalDays, diffDays(origin, startOfNextMonth(m))) * pxPerDay;
      if (right > left) major.push({ label: m.toLocaleDateString(locale, { month: "short", year: "2-digit" }), left, width: right - left });
      m = startOfNextMonth(m);
    }
    // weeks starting Monday
    let i = 0;
    const firstDay = addDays(origin, 0);
    const dow0 = firstDay.getDay();
    i = dow0 === 0 ? 0 : (dow0 <= 1 ? 1 - dow0 : 8 - dow0);
    while (i < totalDays) {
      const d = addDays(origin, i);
      minor.push({ label: d.toLocaleDateString(locale, { day: "numeric", month: "short" }), left: i * pxPerDay, width: Math.min(7, totalDays - i) * pxPerDay });
      i += 7;
    }
  } else if (scale === "M") {
    // major = years, minor = months
    let yr = origin.getFullYear();
    const endYr = addDays(origin, totalDays).getFullYear();
    for (; yr <= endYr; yr++) {
      const y0 = new Date(yr, 0, 1);
      const y1 = new Date(yr + 1, 0, 1);
      const left  = Math.max(0, diffDays(origin, y0)) * pxPerDay;
      const right = Math.min(totalDays, diffDays(origin, y1)) * pxPerDay;
      if (right > left) major.push({ label: String(yr), left, width: right - left });
    }
    let m = startOfMonth(origin);
    while (diffDays(origin, m) < totalDays) {
      const left  = Math.max(0, diffDays(origin, m)) * pxPerDay;
      const right = Math.min(totalDays, diffDays(origin, startOfNextMonth(m))) * pxPerDay;
      if (right > left) minor.push({ label: m.toLocaleDateString(locale, { month: "short" }), left, width: right - left });
      m = startOfNextMonth(m);
    }
  } else {
    // Quarter: major = years, minor = quarters
    let yr = origin.getFullYear();
    const endYr = addDays(origin, totalDays).getFullYear();
    for (; yr <= endYr; yr++) {
      const y0 = new Date(yr, 0, 1);
      const y1 = new Date(yr + 1, 0, 1);
      const left  = Math.max(0, diffDays(origin, y0)) * pxPerDay;
      const right = Math.min(totalDays, diffDays(origin, y1)) * pxPerDay;
      if (right > left) major.push({ label: String(yr), left, width: right - left });
    }
    for (let q = 0; q < 4; q++) {
      for (let y = origin.getFullYear() - 1; y <= endYr + 1; y++) {
        const qStart = new Date(y, q * 3, 1);
        const qEnd   = new Date(y, q * 3 + 3, 1);
        const left  = diffDays(origin, qStart) * pxPerDay;
        const right = diffDays(origin, qEnd)   * pxPerDay;
        const clLeft  = Math.max(0, left);
        const clRight = Math.min(totalDays * pxPerDay, right);
        if (clRight > clLeft) minor.push({ label: `Q${q + 1}`, left: clLeft, width: clRight - clLeft });
      }
    }
    minor.sort((a, b) => a.left - b.left);
  }

  return { major, minor };
}

/* ── dependency arrow path ─────────────────────────────────────────── */

function depPath(x0: number, y0: number, x1: number, y1: number): string {
  const xMid = x0 + DEP_OVERHANG;
  if (Math.abs(y0 - y1) < 2) {
    // same row — draw simple horizontal
    return `M${x0},${y0} H${x1}`;
  }
  return `M${x0},${y0} H${xMid} V${y1} H${x1}`;
}

/* ── main component ─────────────────────────────────────────────────── */

export function GanttChart({ activities, isHe }: {
  activities: ScheduleActivity[];
  isHe: boolean;
}) {
  const pxRef     = useRef(4.5);
  const [px, setPx]         = useState(4.5);
  const [mode, setMode]     = useState<FilterMode>("all");
  const [maxLvl, setMaxLvl] = useState(99);
  const [search, setSearch] = useState("");
  const [showDeps, setShowDeps] = useState(true);

  const bodyRef   = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const leftRef   = useRef<HTMLDivElement>(null);

  /* project extents */
  const { origin, totalDays } = useMemo(() => {
    if (!activities.length) {
      const now = new Date();
      return { origin: new Date(now.getFullYear(), now.getMonth() - 1, 1), totalDays: 365 };
    }
    const starts = activities.map(a => toDate(a.start).getTime());
    const ends   = activities.map(a => toDate(a.finish).getTime());
    const minD   = new Date(Math.min(...starts));
    const maxD   = new Date(Math.max(...ends));
    const origin = new Date(minD.getFullYear(), minD.getMonth() - 1, 1);
    const endBound = new Date(maxD.getFullYear(), maxD.getMonth() + 2, 1);
    return { origin, totalDays: diffDays(origin, endBound) };
  }, [activities]);

  /* filtered rows */
  const rows = useMemo(() => {
    const lc = search.toLowerCase();
    return activities.filter(a => {
      if (mode === "summary"    && a.level > 1 && !a.isMilestone) return false;
      if (mode === "critical"   && !a.isCritical && !a.isMilestone) return false;
      if (mode === "milestones" && !a.isMilestone) return false;
      if (a.level > maxLvl) return false;
      if (lc && !a.name.toLowerCase().includes(lc)) return false;
      return true;
    });
  }, [activities, mode, maxLvl, search]);

  /* uniqueId → visible row index (for dependency drawing) */
  const rowIdx = useMemo(() => {
    const m = new Map<number, number>();
    rows.forEach((t, i) => m.set(t.uniqueId, i));
    return m;
  }, [rows]);

  const totalW = totalDays * px;
  const todayX = diffDays(origin, new Date()) * px;
  const { major, minor } = useMemo(() => buildHeader(origin, totalDays, px, isHe), [origin, totalDays, px, isHe]);

  /* sync scroll */
  const onBodyScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (headerRef.current) headerRef.current.scrollLeft = el.scrollLeft;
    if (leftRef.current)   leftRef.current.scrollTop   = el.scrollTop;
  }, []);

  /* mouse-wheel zoom — keeps focused date under cursor */
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect  = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const focusDay = (el.scrollLeft + mouseX) / pxRef.current;
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      const newPx  = Math.min(MAX_PX, Math.max(MIN_PX, pxRef.current * factor));
      pxRef.current = newPx;
      setPx(newPx);
      requestAnimationFrame(() => {
        el.scrollLeft = focusDay * newPx - mouseX;
        if (headerRef.current) headerRef.current.scrollLeft = el.scrollLeft;
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  /* snap to preset zoom */
  const snapTo = (target: number) => {
    const el = bodyRef.current;
    const scrollFrac = el ? (el.scrollLeft + el.clientWidth / 2) / (totalDays * pxRef.current) : 0.5;
    pxRef.current = target;
    setPx(target);
    requestAnimationFrame(() => {
      if (el) {
        el.scrollLeft = scrollFrac * totalDays * target - el.clientWidth / 2;
        if (headerRef.current) headerRef.current.scrollLeft = el.scrollLeft;
      }
    });
  };

  /* max outline level in dataset */
  const maxDataLevel = useMemo(() => Math.max(0, ...activities.map(a => a.level ?? 0)), [activities]);

  /* bar geometry for a task at its row */
  function barX(a: ScheduleActivity) { return diffDays(origin, toDate(a.start)) * px; }
  function barW(a: ScheduleActivity) { return Math.max(px * 0.5, diffDays(toDate(a.start), toDate(a.finish)) * px); }
  function barEndX(a: ScheduleActivity) { return barX(a) + barW(a); }

  /* bar fill colour */
  function barColor(a: ScheduleActivity) {
    if (a.isCritical) return C.danger;
    if (a.level === 0) return C.copper;
    if (a.level === 1) return C.copperMd;
    return C.copperLt;
  }
  function barHeight(a: ScheduleActivity) {
    return a.level === 0 ? 16 : a.level === 1 ? 14 : 12;
  }

  const label = (en: string, he: string) => isHe ? he : en;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg, overflow: "hidden", userSelect: "none" }}>

      {/* ── filter / toolbar ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 10px", flexShrink: 0,
        background: C.card, borderBottom: `1px solid ${C.border}`,
        flexWrap: "wrap",
      }}>

        {/* mode buttons */}
        {([
          ["all",        label("All",        "הכל")],
          ["summary",    label("Summary",    "סיכום")],
          ["critical",   label("Critical",   "קריטי")],
          ["milestones", label("Milestones", "אבני דרך")],
        ] as [FilterMode, string][]).map(([m, lbl]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "3px 10px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
            background: mode === m ? C.copper : C.bg,
            color:      mode === m ? "#fff"   : C.text2,
            border:     `1px solid ${mode === m ? C.copper : C.border}`,
          }}>{lbl}</button>
        ))}

        {/* WBS level */}
        <div style={{ width: 1, height: 16, background: C.border, margin: "0 2px" }} />
        <span style={{ fontSize: 11, color: C.text3, fontWeight: 600 }}>
          {label("Level", "רמה")}
        </span>
        {[...Array(Math.min(maxDataLevel + 1, 4))].map((_, lvl) => (
          <button key={lvl} onClick={() => setMaxLvl(maxLvl === lvl ? 99 : lvl)} style={{
            padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
            background: maxLvl === lvl ? C.copperMd : C.bg,
            color:      maxLvl === lvl ? "#fff"     : C.text3,
            border:     `1px solid ${maxLvl === lvl ? C.copperMd : C.border}`,
          }}>L{lvl + 1}</button>
        ))}
        {maxLvl < 99 && (
          <button onClick={() => setMaxLvl(99)} style={{
            padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
            cursor: "pointer", background: C.bg, color: C.text3, border: `1px solid ${C.border}`,
          }}>✕</button>
        )}

        {/* search */}
        <div style={{ width: 1, height: 16, background: C.border, margin: "0 2px" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search style={{ position: "absolute", left: 6, width: 12, height: 12, color: C.text3, pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder={label("Search…", "חיפוש…")}
            style={{
              padding: "3px 8px 3px 22px", borderRadius: 6, fontSize: 11.5,
              border: `1px solid ${search ? C.copper : C.border}`,
              background: C.bg, color: C.text1, outline: "none", width: 140,
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 6, fontSize: 11, color: C.text3,
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}>✕</button>
          )}
        </div>

        {/* deps toggle */}
        <div style={{ width: 1, height: 16, background: C.border, margin: "0 2px" }} />
        <button onClick={() => setShowDeps(v => !v)} title={label("Toggle dependency lines", "קישורי תלות")} style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
          background: showDeps ? C.copperMd + "20" : C.bg,
          color:      showDeps ? C.copperMd : C.text3,
          border:     `1px solid ${showDeps ? C.copperMd : C.border}`,
        }}>
          <Link2 style={{ width: 12, height: 12 }} />
          {label("Links", "קישורים")}
        </button>

        {/* zoom */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 10, color: C.text3, fontWeight: 700 }}>
            {label("Ctrl+scroll to zoom ·", "Ctrl+גלגל לזום ·")} {zoomLabel(px)}
          </span>
          {ZOOM_SNAPS.map((z, i) => {
            const lbl = ["Q","M","W","D"][i];
            return (
              <button key={lbl} onClick={() => snapTo(z)} style={{
                padding: "3px 7px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer",
                background: zoomLabel(px) === lbl ? C.copper : C.bg,
                color:      zoomLabel(px) === lbl ? "#fff"   : C.text3,
                border:     `1px solid ${zoomLabel(px) === lbl ? C.copper : C.border}`,
              }}>{lbl}</button>
            );
          })}
        </div>
      </div>

      {/* ── body ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left: task names */}
        <div style={{ width: LEFT_W, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${C.border}` }}>
          {/* header spacer */}
          <div style={{ height: HEADER_H, flexShrink: 0, background: C.card, borderBottom: `1px solid ${C.border}` }} />
          {/* rows */}
          <div ref={leftRef} style={{ flex: 1, overflowY: "hidden", overflowX: "hidden" }}>
            {rows.map((a, i) => {
              const indent = 6 + (a.level ?? 0) * 12;
              return (
                <div key={a.id} style={{
                  height: ROW_H, display: "flex", alignItems: "center",
                  paddingLeft: indent, paddingRight: 6,
                  background: i % 2 === 0 ? C.stripe0 : C.stripe1,
                  borderBottom: `1px solid ${C.gridLine}`,
                  overflow: "hidden",
                }}>
                  {a.isMilestone ? (
                    <span style={{ flexShrink: 0, marginRight: 4, width: 8, height: 8, background: C.mile, transform: "rotate(45deg)", display: "inline-block", borderRadius: 1 }} />
                  ) : (
                    <span style={{ flexShrink: 0, marginRight: 4, width: 6, height: 6, background: a.isCritical ? C.danger : barColor(a), borderRadius: 1, display: "inline-block" }} />
                  )}
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: a.level === 0 ? 700 : a.level === 1 ? 600 : 400,
                    color: a.isCritical ? C.danger : C.text1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {a.name}
                  </span>
                </div>
              );
            })}
            <div style={{ height: 60 }} />
          </div>
        </div>

        {/* Right: timeline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Sticky time header */}
          <div ref={headerRef} style={{ height: HEADER_H, overflowX: "hidden", overflowY: "hidden", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0, position: "relative" }}>
            <div style={{ width: totalW, height: "100%", position: "relative" }}>
              {/* major row (top 20px) */}
              {major.map((c, i) => (
                <div key={`maj${i}`} style={{
                  position: "absolute", left: c.left, width: c.width, top: 0, height: "50%",
                  borderRight: `1px solid ${C.border}`, overflow: "hidden",
                  display: "flex", alignItems: "center", paddingLeft: 5,
                  background: C.bg,
                }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: C.text2, whiteSpace: "nowrap" }}>{c.label}</span>
                </div>
              ))}
              {/* minor row (bottom 20px) */}
              {minor.map((c, i) => (
                <div key={`min${i}`} style={{
                  position: "absolute", left: c.left, width: c.width, top: "50%", height: "50%",
                  borderRight: `1px solid ${C.gridLine}`, overflow: "hidden",
                  display: "flex", alignItems: "center", paddingLeft: 3,
                }}>
                  <span style={{ fontSize: 10, color: C.text3, whiteSpace: "nowrap" }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable body */}
          <div ref={bodyRef} onScroll={onBodyScroll}
            style={{ flex: 1, overflowX: "scroll", overflowY: "scroll", position: "relative" }}>
            <div style={{ width: totalW, position: "relative", minHeight: rows.length * ROW_H + 60 }}>

              {/* vertical grid lines */}
              {minor.map((c, i) => (
                <div key={`gl${i}`} style={{
                  position: "absolute", left: c.left, top: 0,
                  width: 1, height: rows.length * ROW_H + 60,
                  background: C.gridLine, pointerEvents: "none",
                }} />
              ))}

              {/* today line */}
              {todayX > 0 && todayX < totalW && (
                <div style={{
                  position: "absolute", left: todayX - 1, top: 0,
                  width: 2, height: rows.length * ROW_H + 60,
                  background: C.today, opacity: 0.65, zIndex: 3, pointerEvents: "none",
                }} />
              )}

              {/* task bars */}
              {rows.map((a, i) => {
                const x = barX(a);
                const w = barW(a);
                const rowTop = i * ROW_H;
                const stripe = i % 2 === 0 ? C.stripe0 : C.stripe1;
                const bh = barHeight(a);

                return (
                  <div key={a.id} style={{
                    position: "absolute", top: rowTop, left: 0, right: 0, height: ROW_H,
                    background: stripe, borderBottom: `1px solid ${C.gridLine}`,
                  }}>
                    {a.isMilestone ? (
                      <div title={a.name} style={{
                        position: "absolute", left: x, top: "50%",
                        transform: "translate(-50%, -50%) rotate(45deg)",
                        width: 11, height: 11,
                        background: C.mile, borderRadius: 2,
                        boxShadow: "0 1px 3px rgba(0,0,0,.2)", zIndex: 2,
                      }} />
                    ) : (
                      <>
                        {/* baseline ghost */}
                        {a.baselineStart && a.baselineFinish && (() => {
                          const bx = diffDays(origin, toDate(a.baselineStart)) * px;
                          const bw = Math.max(px * 0.3, diffDays(toDate(a.baselineStart), toDate(a.baselineFinish)) * px);
                          return (
                            <div style={{
                              position: "absolute", left: bx, width: bw,
                              top: "50%", transform: "translateY(-50%)", height: bh + 4,
                              border: `1.5px dashed ${C.text3}`, borderRadius: 3,
                              opacity: 0.4, pointerEvents: "none",
                            }} />
                          );
                        })()}
                        {/* main bar */}
                        <div title={`${a.name} · ${a.pct}% · slack ${a.totalSlack}d`} style={{
                          position: "absolute", left: x, width: w,
                          top: "50%", transform: "translateY(-50%)", height: bh,
                          background: barColor(a), borderRadius: 3,
                          boxShadow: "0 1px 2px rgba(0,0,0,.15)", zIndex: 2, overflow: "hidden",
                        }}>
                          {/* progress */}
                          {a.pct > 0 && (
                            <div style={{
                              position: "absolute", left: 0, top: 0, bottom: 0,
                              width: `${a.pct}%`, background: "rgba(0,0,0,.28)", borderRadius: 3,
                            }} />
                          )}
                          {/* % label */}
                          {w > 40 && a.pct > 0 && (
                            <span style={{
                              position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)",
                              fontSize: 8.5, fontWeight: 700, color: "rgba(255,255,255,.9)",
                              pointerEvents: "none",
                            }}>{a.pct}%</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* dependency SVG overlay */}
              {showDeps && (
                <svg
                  style={{ position: "absolute", top: 0, left: 0, width: totalW, height: rows.length * ROW_H + 60, pointerEvents: "none", zIndex: 4, overflow: "visible" }}
                >
                  <defs>
                    <marker id="arr-norm" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                      <path d="M0,0 L5,2.5 L0,5 Z" fill={C.depNorm} />
                    </marker>
                    <marker id="arr-crit" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                      <path d="M0,0 L5,2.5 L0,5 Z" fill={C.depCrit} />
                    </marker>
                  </defs>
                  {rows.map((task, taskI) => {
                    const succs = task.successors ?? [];
                    return succs.map(succId => {
                      const succI = rowIdx.get(succId);
                      if (succI === undefined) return null;
                      const succTask = rows[succI];
                      const isCrit = task.isCritical && succTask?.isCritical;
                      const x0 = barEndX(task);
                      const y0 = taskI * ROW_H + ROW_H / 2;
                      const x1 = barX(succTask);
                      const y1 = succI * ROW_H + ROW_H / 2;
                      const color   = isCrit ? C.depCrit : C.depNorm;
                      const markEnd = isCrit ? "url(#arr-crit)" : "url(#arr-norm)";
                      return (
                        <path
                          key={`${task.uniqueId}-${succId}`}
                          d={depPath(x0, y0, x1, y1)}
                          stroke={color}
                          strokeWidth={isCrit ? 1.5 : 1}
                          fill="none"
                          opacity={isCrit ? 0.75 : 0.45}
                          markerEnd={markEnd}
                        />
                      );
                    });
                  })}
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── status bar ──────────────────────────────────────────────── */}
      <div style={{
        height: 22, flexShrink: 0, display: "flex", alignItems: "center",
        padding: "0 10px", gap: 12,
        background: C.card, borderTop: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 10.5, color: C.text3 }}>
          {rows.length} / {activities.length} {label("tasks", "פעילויות")}
          {rows.filter(r => r.isCritical).length > 0 &&
            ` · ${rows.filter(r => r.isCritical).length} ${label("critical", "קריטיות")}`}
        </span>
        <span style={{ fontSize: 10.5, color: C.text3 }}>
          {label("Ctrl+scroll to zoom", "Ctrl+גלגל = זום")}
        </span>
      </div>
    </div>
  );
}
