"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, Satellite, RefreshCw, Layers, AlertTriangle, CheckCircle2, ArrowUpRight } from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0", copperMid: "#B5855A",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  warn: "#B45309", warnBg: "#FFFBEB",
  danger: "#B91C1C", dangerBg: "#FEF2F2",
  track: "#E7E0D8",
};

const TRANSLATIONS = {
  en: {
    title: "Site Progress",
    lastScan: "Last scan: Today 07:14",
    refresh: "Refresh",
    view3d: "View 3D Model",
    droneScan: "Latest drone scan — photogrammetry model",
    viewModel: "View 3D model",
    insightsTitle: "AI Insights",
    zoneLabel: "Zone",
  },
  he: {
    title: "מודל",
    lastScan: "סריקה אחרונה: היום 07:14",
    refresh: "רענן",
    view3d: "פתח מודל תלת-ממד",
    droneScan: "סריקת רחפן אחרונה — מודל פוטוגרמטרי",
    viewModel: "צפה במודל תלת-ממד",
    insightsTitle: "תובנות AI",
    zoneLabel: "אזור",
  },
};

const DEMO_ACTIVITY_LOG = [
  { icon: "scan",  time: "27 Jun 07:14", text: "Drone scan completed – Zone A & B. 847 photos processed. Photogrammetry model updated.",           zone: "A/B" },
  { icon: "alert", time: "26 Jun 16:52", text: "AI detected deviation: Zone D utility trench depth -0.4m below design at Ch.2+380 to Ch.2+450.", zone: "D"   },
  { icon: "ok",    time: "26 Jun 14:30", text: "Bridge 68 pier P7 formwork inspection passed. Concrete pour cleared for 29 Jun.",                 zone: "B"   },
  { icon: "scan",  time: "26 Jun 07:11", text: "Drone scan completed – Zone C & D. Volume calculations updated. Cut/fill balance report ready.",  zone: "C/D" },
  { icon: "alert", time: "25 Jun 11:20", text: "Zone B pile SP-42 drilling halted: obstruction encountered at -14m. Geotechnical review initiated.", zone: "B" },
  { icon: "ok",    time: "24 Jun 15:00", text: "Monthly progress photos uploaded – all zones. Owner report package auto-generated.",               zone: "All" },
];

export default function SiteProgressPage() {
  const { active } = useProjects();
  const isDemo = active.id === "highway-20";

  const { lang, isHe } = useLanguage();
  const T = TRANSLATIONS[lang];

  const activityLog      = isDemo ? DEMO_ACTIVITY_LOG : [];
  const lastScanLabel    = isDemo ? T.lastScan : (isHe ? "אין סריקה עדיין" : "No scan yet");

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
            style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            DatumBIM Live
          </div>
          <span className="text-[11px]" style={{ color: P.text3 }}>{lastScanLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text2 }}>
            <RefreshCw className="w-3 h-3" /> {T.refresh}
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white"
            style={{ background: P.copper }}>
            <Layers className="w-3 h-3" /> {T.view3d}
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
            <Bell className="w-4 h-4" style={{ color: P.text2 }} />
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5">

        {/* 3D Model viewer */}
        <div className="rounded-2xl mb-5 h-72 flex items-center justify-center relative overflow-hidden"
          style={{ background: "#1A1512", border: `1px solid ${P.border}` }}>
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(ellipse at 30% 60%, #8B5A2B 0%, transparent 55%), radial-gradient(ellipse at 75% 30%, #15803D 0%, transparent 45%)" }} />
          <div className="text-center relative z-10">
            <Satellite className="w-9 h-9 mx-auto mb-3" style={{ color: "#78716C" }} />
            <p className="text-[13px] font-medium" style={{ color: "#A8A29E" }}>{T.droneScan}</p>
            <button className="mt-2 text-[13px] font-bold flex items-center gap-1.5 mx-auto"
              style={{ color: P.copperMid }}>
              {T.viewModel} <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-2xl p-5"
          style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <h3 className="text-[14px] font-bold mb-4" style={{ color: P.text1 }}>{T.insightsTitle}</h3>
          <div className="flex flex-col gap-3">
            {activityLog.length === 0 && (
              <p className="text-[12px] text-center py-6" style={{ color: P.text3 }}>
                {isHe ? "אין תובנות עדיין" : "No insights yet"}
              </p>
            )}
            {activityLog.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: item.icon === "alert" ? P.dangerBg : item.icon === "ok" ? P.goodBg : P.copperLight,
                  }}>
                  {item.icon === "alert"
                    ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: P.danger }} />
                    : item.icon === "ok"
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: P.good }} />
                    : <Satellite className="w-3.5 h-3.5" style={{ color: P.copper }} />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10.5px] font-bold" style={{ color: P.text3 }}>{item.time}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: P.bg, color: P.text3 }}>{T.zoneLabel} {item.zone}</span>
                  </div>
                  <p className="text-[12px]" style={{ color: P.text2 }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
