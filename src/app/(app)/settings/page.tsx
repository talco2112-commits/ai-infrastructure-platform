"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Bell, Mail, LogOut, Info } from "lucide-react";

const P = {
  bg: "#EDE8E1", card: "#FAF8F5", border: "#EDE8DF",
  copper: "#8B5A2B", copperLight: "#F5EBE0",
  text1: "#1C1917", text2: "#57534E", text3: "#A8A29E",
  good: "#15803D", goodBg: "#F0FDF4",
  track: "#E7E0D8",
};

const TRANSLATIONS = {
  en: {
    title: "Settings",
    profile: "Profile",
    name: "David Cohen",
    role: "Project Manager",
    email: "david.cohen@datumbuild.demo",
    language: "Language",
    languageSub: "Interface language for this account",
    english: "English",
    hebrew: "עברית",
    notifications: "Notifications",
    notifScheduleDelay: "Schedule delay alerts",
    notifScheduleDelaySub: "Notify when a critical-path activity slips",
    notifInvoice: "Invoice & billing updates",
    notifInvoiceSub: "Notify on invoice status changes",
    notifRfi: "RFI reminders",
    notifRfiSub: "Notify before an RFI due date",
    about: "About",
    aboutVersion: "Version",
    aboutBuild: "Demo build",
    signOut: "Sign out",
  },
  he: {
    title: "הגדרות",
    profile: "פרופיל",
    name: "David Cohen",
    role: "מנהל פרויקט",
    email: "david.cohen@datumbuild.demo",
    language: "שפה",
    languageSub: "שפת הממשק עבור חשבון זה",
    english: "English",
    hebrew: "עברית",
    notifications: "התראות",
    notifScheduleDelay: "התראות עיכוב בלו״ז",
    notifScheduleDelaySub: "התראה כאשר פעילות בנתיב הקריטי מתעכבת",
    notifInvoice: "עדכוני חשבונות",
    notifInvoiceSub: "התראה על שינוי סטטוס חשבונית",
    notifRfi: "תזכורות בקשות מידע",
    notifRfiSub: "התראה לפני מועד יעד של בקשת מידע",
    about: "אודות",
    aboutVersion: "גרסה",
    aboutBuild: "בנייית דמו",
    signOut: "התנתק",
  },
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="w-9 h-5 rounded-full relative shrink-0 transition-colors"
      style={{ background: checked ? P.copper : P.track }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(-18px)" : "translateX(-2px)", right: 0 }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { lang, isHe, setLang } = useLanguage();
  const T = TRANSLATIONS[lang];
  const router = useRouter();

  const [notifScheduleDelay, setNotifScheduleDelay] = useState(true);
  const [notifInvoice, setNotifInvoice] = useState(true);
  const [notifRfi, setNotifRfi] = useState(false);

  return (
    <div dir={isHe ? "rtl" : "ltr"} className="flex flex-col h-full" style={{ background: P.bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      <header className="h-[60px] flex items-center justify-between px-6 shrink-0"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}` }}>
        <h1 className="text-[18px] font-bold" style={{ color: P.text1 }}>{T.title}</h1>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: P.copper }}>DC</div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 max-w-2xl w-full mx-auto space-y-5">

        {/* Profile */}
        <section className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide mb-4" style={{ color: P.text3 }}>{T.profile}</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[15px] font-bold shrink-0" style={{ background: P.copper }}>DC</div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: P.text1 }}>{T.name}</p>
              <p className="text-[12px]" style={{ color: P.text2 }}>{T.role}</p>
              <p className="text-[12px] flex items-center gap-1.5 mt-1" style={{ color: P.text3 }}>
                <Mail className="w-3 h-3" />{T.email}
              </p>
            </div>
          </div>
        </section>

        {/* Language */}
        <section className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide mb-1" style={{ color: P.text3 }}>{T.language}</h2>
          <p className="text-[12px] mb-4" style={{ color: P.text3 }}>{T.languageSub}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang("en")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all"
              style={{ background: lang === "en" ? P.copper : P.bg, color: lang === "en" ? "#fff" : P.text2, border: `1px solid ${P.border}` }}>
              <Globe className="w-3.5 h-3.5" />{T.english}
            </button>
            <button onClick={() => setLang("he")}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all"
              style={{ background: lang === "he" ? P.copper : P.bg, color: lang === "he" ? "#fff" : P.text2, border: `1px solid ${P.border}` }}>
              <Globe className="w-3.5 h-3.5" />{T.hebrew}
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide mb-4 flex items-center gap-1.5" style={{ color: P.text3 }}>
            <Bell className="w-3.5 h-3.5" />{T.notifications}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium" style={{ color: P.text1 }}>{T.notifScheduleDelay}</p>
                <p className="text-[12px]" style={{ color: P.text3 }}>{T.notifScheduleDelaySub}</p>
              </div>
              <Toggle checked={notifScheduleDelay} onChange={() => setNotifScheduleDelay(v => !v)} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium" style={{ color: P.text1 }}>{T.notifInvoice}</p>
                <p className="text-[12px]" style={{ color: P.text3 }}>{T.notifInvoiceSub}</p>
              </div>
              <Toggle checked={notifInvoice} onChange={() => setNotifInvoice(v => !v)} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium" style={{ color: P.text1 }}>{T.notifRfi}</p>
                <p className="text-[12px]" style={{ color: P.text3 }}>{T.notifRfiSub}</p>
              </div>
              <Toggle checked={notifRfi} onChange={() => setNotifRfi(v => !v)} />
            </div>
          </div>
        </section>

        {/* About */}
        <section className="rounded-2xl p-5" style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: "0 2px 12px rgba(28,25,23,0.06)" }}>
          <h2 className="text-[13px] font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: P.text3 }}>
            <Info className="w-3.5 h-3.5" />{T.about}
          </h2>
          <div className="flex items-center justify-between text-[13px] mb-1">
            <span style={{ color: P.text2 }}>{T.aboutVersion}</span>
            <span style={{ color: P.text1 }}>0.1.0</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span style={{ color: P.text2 }}>{T.aboutBuild}</span>
            <span style={{ color: P.text1 }}>InfrAI Demo</span>
          </div>
        </section>

        {/* Sign out */}
        <button onClick={() => router.push("/")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold transition-all"
          style={{ background: P.card, border: `1px solid ${P.border}`, color: "#B91C1C" }}>
          <LogOut className="w-4 h-4" />{T.signOut}
        </button>
      </div>
    </div>
  );
}
