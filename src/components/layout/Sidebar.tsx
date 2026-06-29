"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FolderOpen, CalendarDays, Banknote,
  Satellite, HelpCircle, Scale, ClipboardCheck, Shield,
  FileBarChart, Settings, LogOut, ChevronDown, Pencil,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoAnimation } from "@/components/LogoAnimation";

const navItems = [
  { href: "/dashboard",      icon: LayoutDashboard, labelEn: "Dashboard",     labelHe: "לוח בקרה"  },
  { href: "/documents",      icon: FolderOpen,      labelEn: "Documents",     labelHe: "מסמכים"    },
  { href: "/design",         icon: Pencil,           labelEn: "Design",        labelHe: "תכנון"     },
  { href: "/schedule",       icon: CalendarDays,    labelEn: "Schedule",      labelHe: "לוח זמנים" },
  { href: "/finance",        icon: Banknote,        labelEn: "Finance",       labelHe: "פיננסים"   },
  { href: "/site-progress",  icon: Satellite,       labelEn: "Site Progress", labelHe: "התקדמות"   },
  { href: "/rfis",           icon: HelpCircle,      labelEn: "RFIs",          labelHe: "בקשות מידע"},
  { href: "/claims",         icon: Scale,           labelEn: "Claims",        labelHe: "תביעות"    },
  { href: "/safety",         icon: Shield,          labelEn: "Safety",        labelHe: "בטיחות"    },
  { href: "/quality",        icon: ClipboardCheck,  labelEn: "Quality",       labelHe: "איכות"     },
  { href: "/reports",        icon: FileBarChart,    labelEn: "Reports",       labelHe: "דוחות"     },
];

export function Sidebar({ lang }: { lang: "en" | "he" }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHe = lang === "he";

  return (
    <aside className="w-56 flex flex-col h-full shrink-0" style={{ background: "#1A1512" }}>
      {/* Logo */}
      <div className="flex items-center px-4 h-[60px] border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <LogoAnimation size={44} />
      </div>

      {/* Project Selector */}
      <div className="px-3 pt-3">
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left group transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#78716C" }}>
              {isHe ? "פרויקט פעיל" : "Active Project"}
            </p>
            <p className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: "#D6D0CA" }}>
              {isHe ? "כביש 20 – הרחבה צפונית" : "Highway 20 – North Ext."}
            </p>
          </div>
          <ChevronDown className="w-3 h-3 shrink-0 ml-2" style={{ color: "#57534E" }} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, labelEn, labelHe }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
              style={{
                background: active ? "#D4714A" : "transparent",
                color: active ? "#fff" : "#A8A29E",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                if (!active) e.currentTarget.style.color = "#E7E5E4";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
                if (!active) e.currentTarget.style.color = "#A8A29E";
              }}
            >
              <Icon className="w-[15px] h-[15px] shrink-0" />
              {isHe ? labelHe : labelEn}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 shrink-0 pt-3 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <LanguageSwitcher lang={lang} />

        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
          style={{ color: "#78716C" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#E7E5E4"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#78716C"; e.currentTarget.style.background = "transparent"; }}
        >
          <Settings className="w-[15px] h-[15px] shrink-0" />
          {isHe ? "הגדרות" : "Settings"}
        </Link>

        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: "#D4714A" }}>
            DC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: "#D6D0CA" }}>David Cohen</p>
            <p className="text-[10px] truncate" style={{ color: "#57534E" }}>{isHe ? "מנהל פרויקט" : "Project Manager"}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            title={isHe ? "התנתק" : "Sign out"}
            className="transition-colors"
            style={{ color: "#57534E" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D6D0CA")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#57534E")}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
