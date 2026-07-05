"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, CalendarDays, Banknote,
  Satellite, HelpCircle, Scale, ClipboardCheck, Shield,
  FileBarChart, Settings, LogOut, ChevronDown, Pencil,
  HardHat, Receipt, Plus, CheckCircle2,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoAnimation } from "@/components/LogoAnimation";
import { NewProjectModal } from "@/components/NewProjectModal";
import { useProjects } from "@/contexts/ProjectContext";

const navItems = [
  { href: "/dashboard",     icon: LayoutDashboard, labelEn: "Dashboard",     labelHe: "לוח בקרה"    },
  { href: "/documents",     icon: FolderOpen,      labelEn: "Documents",     labelHe: "מסמכים"      },
  { href: "/design",        icon: Pencil,           labelEn: "Design",        labelHe: "תכנון"       },
  { href: "/schedule",      icon: CalendarDays,    labelEn: "Schedule",      labelHe: "לוח זמנים"   },
  { href: "/finance",       icon: Banknote,        labelEn: "Finance",       labelHe: "פיננסים"     },
  { href: "/construction",  icon: HardHat,         labelEn: "Construction",  labelHe: "בנייה וביצוע"},
  { href: "/site-progress", icon: Satellite,       labelEn: "Site Progress", labelHe: "מודל"        },
  { href: "/rfis",          icon: HelpCircle,      labelEn: "RFIs",          labelHe: "בקשות מידע"  },
  { href: "/claims",        icon: Scale,           labelEn: "Claims",        labelHe: "תביעות"      },
  { href: "/safety",        icon: Shield,          labelEn: "Safety",        labelHe: "בטיחות"      },
  { href: "/quality",       icon: ClipboardCheck,  labelEn: "Quality",       labelHe: "איכות"       },
  { href: "/billing",       icon: Receipt,         labelEn: "Billing",       labelHe: "חשבונות"     },
  { href: "/reports",       icon: FileBarChart,    labelEn: "Reports",       labelHe: "דוחות"       },
];

const TYPE_EMOJI: Record<string, string> = {
  Road: "🛣️", Bridge: "🌉", Building: "🏗️", Rail: "🚆",
  Tunnel: "⛏️", Water: "💧", Energy: "⚡", Other: "📋",
};

function fmtYear(d: string) {
  if (!d) return "";
  return new Date(d).getFullYear().toString();
}

export function Sidebar({ lang }: { lang: "en" | "he" }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isHe     = lang === "he";

  const { projects, activeId, active, setActiveId } = useProjects();

  const [open, setOpen]                   = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);

  function switchProject(id: string) {
    setActiveId(id);
    setOpen(false);
    router.push("/dashboard");
  }

  const displayName = isHe ? (active.nameHe || active.name) : active.name;

  return (
    <>
      <aside className="w-56 flex flex-col h-full shrink-0" style={{ background: "#1A1512" }}>

        {/* ── Logo ── */}
        <div className="flex items-center justify-center h-[72px] border-b shrink-0 overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <LogoAnimation size={64} src="/לוגו חום בלי רקע.png" />
        </div>

        {/* ── Project selector + inline dropdown ── */}
        <div className="px-3 pt-3 shrink-0">

          {/* Selector row */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOpen(v => !v)}
              className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors"
              style={{ background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)" }}
              onMouseEnter={e => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { if (!open) e.currentTarget.style.background = open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"; }}>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#78716C" }}>
                  {isHe ? "פרויקט פעיל" : "Active Project"}
                </p>
                <p className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: "#D6D0CA" }}>
                  {TYPE_EMOJI[active.type] ?? "📋"}&nbsp;{displayName}
                </p>
              </div>
              <ChevronDown
                className="w-3 h-3 shrink-0 ms-1"
                style={{
                  color: "#57534E",
                  transform: open ? "rotate(180deg)" : "none",
                  transition: "transform 200ms",
                }}/>
            </button>

            {/* New project shortcut */}
            <button
              onClick={() => { setOpen(false); setShowNewProject(true); }}
              title={isHe ? "פרויקט חדש" : "New Project"}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(139,90,43,0.25)", color: "#C49A6C" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#8B5A2B"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,90,43,0.25)"; e.currentTarget.style.color = "#C49A6C"; }}>
              <Plus className="w-4 h-4"/>
            </button>
          </div>

          {/* Inline dropdown */}
          {open && (
            <div className="mt-1.5 rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>

              {/* Scrollable project list */}
              <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
                {projects.map((p, i) => {
                  const isActive = p.id === activeId;
                  const pName    = isHe ? (p.nameHe || p.name) : p.name;
                  return (
                    <button
                      key={p.id}
                      onClick={() => switchProject(p.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                      style={{
                        background: isActive ? "rgba(139,90,43,0.22)" : "rgba(0,0,0,0.18)",
                        borderBottom: i < projects.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(0,0,0,0.18)"; }}>

                      {/* Emoji badge */}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] shrink-0"
                        style={{ background: isActive ? "rgba(139,90,43,0.35)" : "rgba(255,255,255,0.06)" }}>
                        {TYPE_EMOJI[p.type] ?? "📋"}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11.5px] font-semibold leading-tight truncate"
                          style={{ color: isActive ? "#E7CFBA" : "#A8A29E" }}>
                          {pName}
                        </p>
                        <p className="text-[9.5px] mt-0.5 truncate" style={{ color: "#57534E" }}>
                          {fmtYear(p.startDate)}{p.endDate ? ` – ${fmtYear(p.endDate)}` : ""}
                          {p.client ? ` · ${p.client.split("–")[0].trim()}` : ""}
                        </p>
                      </div>

                      {/* Active tick */}
                      {isActive && (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#8B5A2B" }}/>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* New project row */}
              <button
                onClick={() => { setOpen(false); setShowNewProject(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                style={{ background: "rgba(139,90,43,0.1)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,90,43,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,90,43,0.1)"; }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(139,90,43,0.25)", border: "1px dashed rgba(139,90,43,0.5)" }}>
                  <Plus className="w-3.5 h-3.5" style={{ color: "#C49A6C" }}/>
                </div>
                <span className="text-[11.5px] font-semibold" style={{ color: "#C49A6C" }}>
                  {isHe ? "פרויקט חדש…" : "New project…"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, labelEn, labelHe }) => {
            const isActive = href === "/construction"
              ? pathname.startsWith("/construction")
              : pathname === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
                style={{ background: isActive ? "#8B5A2B" : "transparent", color: isActive ? "#fff" : "#A8A29E" }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#E7E5E4"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A8A29E"; } }}>
                <Icon className="w-[15px] h-[15px] shrink-0"/>
                {isHe ? labelHe : labelEn}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom ── */}
        <div className="px-3 pb-4 shrink-0 pt-3 space-y-0.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <LanguageSwitcher lang={lang}/>
          <Link href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
            style={{ color: "#78716C" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#E7E5E4"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#78716C"; e.currentTarget.style.background = "transparent"; }}>
            <Settings className="w-[15px] h-[15px] shrink-0"/>
            {isHe ? "הגדרות" : "Settings"}
          </Link>
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: "#8B5A2B" }}>DC</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: "#D6D0CA" }}>David Cohen</p>
              <p className="text-[10px] truncate" style={{ color: "#57534E" }}>{isHe ? "מנהל פרויקט" : "Project Manager"}</p>
            </div>
            <button onClick={() => router.push("/")} title={isHe ? "התנתק" : "Sign out"}
              className="transition-colors" style={{ color: "#57534E" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#D6D0CA")}
              onMouseLeave={e => (e.currentTarget.style.color = "#57534E")}>
              <LogOut className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>
      </aside>

      {/* ── New project wizard ── */}
      {showNewProject && (
        <NewProjectModal isHe={isHe} onClose={() => setShowNewProject(false)}/>
      )}
    </>
  );
}
