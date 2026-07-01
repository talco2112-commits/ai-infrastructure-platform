"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, FolderOpen, CalendarDays, Banknote,
  Satellite, HelpCircle, Scale, ClipboardCheck, Shield,
  FileBarChart, Settings, LogOut, ChevronDown, Pencil,
  HardHat, ClipboardList, CalendarCheck, Calendar,
  Zap, ShoppingCart, Package, BookOpen, Truck, Users,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoAnimation } from "@/components/LogoAnimation";

const navItems = [
  { href: "/dashboard",      icon: LayoutDashboard, labelEn: "Dashboard",     labelHe: "לוח בקרה"   },
  { href: "/documents",      icon: FolderOpen,      labelEn: "Documents",     labelHe: "מסמכים"     },
  { href: "/design",         icon: Pencil,          labelEn: "Design",        labelHe: "תכנון"      },
  { href: "/schedule",       icon: CalendarDays,    labelEn: "Schedule",      labelHe: "לוח זמנים"  },
  { href: "/finance",        icon: Banknote,        labelEn: "Finance",       labelHe: "פיננסים"    },
  { href: "/site-progress",  icon: Satellite,       labelEn: "Site Progress", labelHe: "התקדמות"    },
  { href: "/rfis",           icon: HelpCircle,      labelEn: "RFIs",          labelHe: "בקשות מידע" },
  { href: "/claims",         icon: Scale,           labelEn: "Claims",        labelHe: "תביעות"     },
  { href: "/safety",         icon: Shield,          labelEn: "Safety",        labelHe: "בטיחות"     },
  { href: "/quality",        icon: ClipboardCheck,  labelEn: "Quality",       labelHe: "איכות"      },
  { href: "/reports",        icon: FileBarChart,    labelEn: "Reports",       labelHe: "דוחות"      },
];

const constructionItems = [
  { href: "/construction/daily",          icon: ClipboardList,  labelEn: "Daily Tasks",       labelHe: "משימות יומיות"  },
  { href: "/construction/weekly",         icon: CalendarCheck,  labelEn: "Weekly Plan",       labelHe: "תכנון שבועי"    },
  { href: "/construction/monthly",        icon: Calendar,       labelEn: "Monthly Plan",      labelHe: "תכנון חודשי"    },
  { href: "/construction/operations",     icon: Zap,            labelEn: "Special Ops",       labelHe: "פעולות מיוחדות" },
  { href: "/construction/procurement",    icon: ShoppingCart,   labelEn: "Procurement",       labelHe: "רכש"            },
  { href: "/construction/inventory",      icon: Package,        labelEn: "Inventory",         labelHe: "מלאי"           },
  { href: "/construction/diary",          icon: BookOpen,       labelEn: "Site Diary",        labelHe: "יומן אתר"       },
  { href: "/construction/equipment",      icon: Truck,          labelEn: "Plant & Equipment", labelHe: "ציוד ומכשור"    },
  { href: "/construction/subcontractors", icon: Users,          labelEn: "Subcontractors",    labelHe: "קבלני משנה"     },
];

export function Sidebar({ lang }: { lang: "en" | "he" }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isHe     = lang === "he";
  const [constructionOpen, setConstructionOpen] = useState(
    () => pathname.startsWith("/construction")
  );

  return (
    <aside className="w-56 flex flex-col h-full shrink-0" style={{ background: "#1A1512" }}>
      {/* Logo */}
      <div className="flex items-center px-4 h-[60px] border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <LogoAnimation size={44} />
      </div>

      {/* Project Selector */}
      <div className="px-3 pt-3">
        <button
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
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
              style={{ background: active ? "#8B5A2B" : "transparent", color: active ? "#fff" : "#A8A29E" }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#E7E5E4"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A8A29E"; } }}
            >
              <Icon className="w-[15px] h-[15px] shrink-0" />
              {isHe ? labelHe : labelEn}
            </Link>
          );
        })}

        {/* Section divider */}
        <div className="h-px mx-1 my-2" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Construction group header */}
        <button
          onClick={() => setConstructionOpen(v => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-colors"
          style={{ color: constructionOpen ? "#C4A882" : "#57534E" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#C4A882")}
          onMouseLeave={e => (e.currentTarget.style.color = constructionOpen ? "#C4A882" : "#57534E")}
        >
          <HardHat className="w-[13px] h-[13px] shrink-0" />
          <span className="flex-1 text-left">{isHe ? "בנייה וביצוע" : "Construction"}</span>
          <ChevronDown
            className="w-3 h-3 transition-transform duration-200"
            style={{ transform: constructionOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
        </button>

        {/* Construction sub-items */}
        {constructionOpen && (
          <div className="mt-0.5 ml-1 pl-3 space-y-0.5" style={{ borderLeft: "1.5px solid rgba(255,255,255,0.08)" }}>
            {constructionItems.map(({ href, icon: Icon, labelEn, labelHe }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[12px] font-medium transition-all"
                  style={{ background: active ? "#8B5A2B" : "transparent", color: active ? "#fff" : "#78716C" }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#D6D0CA"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#78716C"; } }}
                >
                  <Icon className="w-[13px] h-[13px] shrink-0" />
                  {isHe ? labelHe : labelEn}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 shrink-0 pt-3 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <LanguageSwitcher lang={lang} />
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all"
          style={{ color: "#78716C" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#E7E5E4"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#78716C"; e.currentTarget.style.background = "transparent"; }}
        >
          <Settings className="w-[15px] h-[15px] shrink-0" />
          {isHe ? "הגדרות" : "Settings"}
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: "#8B5A2B" }}>DC</div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: "#D6D0CA" }}>David Cohen</p>
            <p className="text-[10px] truncate" style={{ color: "#57534E" }}>{isHe ? "מנהל פרויקט" : "Project Manager"}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            title={isHe ? "התנתק" : "Sign out"}
            className="transition-colors"
            style={{ color: "#57534E" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#D6D0CA")}
            onMouseLeave={e => (e.currentTarget.style.color = "#57534E")}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
