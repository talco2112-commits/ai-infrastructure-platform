"use client";

import { useState, useEffect } from "react";
import { Pencil, X, Check, Loader2, ChevronDown, ChevronRight } from "lucide-react";

const copper  = "#D4714A";
const bg      = "#EDE8E1";
const card    = "#FAF8F5";
const border  = "#DDD5CB";
const text1   = "#1C1917";
const text2   = "#57534E";
const text3   = "#A8A29E";

export type FlatContent = {
  // Hero
  badge?: string;
  headline1?: string; headline2?: string; heroDesc?: string;
  requestDemo?: string; seePlatform?: string;
  // Nav
  nav0?: string; nav1?: string; nav2?: string; nav3?: string;
  logIn?: string; requestNav?: string;
  // Stats
  stat0value?: string; stat0label?: string;
  stat1value?: string; stat1label?: string;
  stat2value?: string; stat2label?: string;
  // Scenes
  scene1Title?: string; scene1Desc?: string;
  scene2Title?: string; scene2Desc?: string;
  // Platform
  platformTag?: string; platformTitle?: string; platformDesc?: string;
  // Solution modules
  sol0title?: string; sol0desc?: string;
  sol1title?: string; sol1desc?: string;
  sol2title?: string; sol2desc?: string;
  sol3title?: string; sol3desc?: string;
  sol4title?: string; sol4desc?: string;
  sol5title?: string; sol5desc?: string;
  // DatumBIM
  datumTag?: string; datumTitle?: string; datumDesc?: string;
  datumFeature0?: string; datumFeature1?: string; datumFeature2?: string; datumFeature3?: string;
  datumSub?: string; datumLive?: string;
  // AI section
  aiTag?: string; aiTitle?: string; aiDesc?: string; aiConnected?: string; aiInput?: string;
  aiQ0?: string; aiA0?: string;
  aiQ1?: string; aiA1?: string;
  aiQ2?: string; aiA2?: string;
  // CTA
  ctaLine1?: string; ctaLine2?: string; ctaDesc?: string; exploreBtn?: string;
  // Footer
  footer0?: string; footer1?: string; footer2?: string; footer3?: string;
  copyright?: string;
};

export type SavedContent = { en: FlatContent; he: FlatContent };

interface Props {
  currentEn: Record<string, unknown>;
  currentHe: Record<string, unknown>;
  onSaved: (c: SavedContent) => void;
}

type Field = { key: keyof FlatContent; label: string; long?: boolean };
type Section = { label: string; fields: Field[] };

const SECTIONS: Section[] = [
  {
    label: "Hero",
    fields: [
      { key: "badge",       label: "Badge text" },
      { key: "headline1",   label: "Headline line 1" },
      { key: "headline2",   label: "Headline line 2" },
      { key: "heroDesc",    label: "Description", long: true },
      { key: "requestDemo", label: "Primary button" },
      { key: "seePlatform", label: "Secondary button" },
    ],
  },
  {
    label: "Navigation",
    fields: [
      { key: "nav0",       label: "Nav item 1" },
      { key: "nav1",       label: "Nav item 2" },
      { key: "nav2",       label: "Nav item 3" },
      { key: "nav3",       label: "Nav item 4" },
      { key: "logIn",      label: "Log in button" },
      { key: "requestNav", label: "Request Demo button" },
    ],
  },
  {
    label: "Stats",
    fields: [
      { key: "stat0value", label: "Stat 1 — value" },
      { key: "stat0label", label: "Stat 1 — label" },
      { key: "stat1value", label: "Stat 2 — value" },
      { key: "stat1label", label: "Stat 2 — label" },
      { key: "stat2value", label: "Stat 3 — value" },
      { key: "stat2label", label: "Stat 3 — label" },
    ],
  },
  {
    label: "Scene Photos",
    fields: [
      { key: "scene1Title", label: "Scene 1 — title" },
      { key: "scene1Desc",  label: "Scene 1 — description", long: true },
      { key: "scene2Title", label: "Scene 2 — title" },
      { key: "scene2Desc",  label: "Scene 2 — description", long: true },
    ],
  },
  {
    label: "Platform Section",
    fields: [
      { key: "platformTag",   label: "Tag" },
      { key: "platformTitle", label: "Title" },
      { key: "platformDesc",  label: "Description", long: true },
    ],
  },
  {
    label: "Modules (6 cards)",
    fields: [
      { key: "sol0title", label: "Module 1 — title" },
      { key: "sol0desc",  label: "Module 1 — description", long: true },
      { key: "sol1title", label: "Module 2 — title" },
      { key: "sol1desc",  label: "Module 2 — description", long: true },
      { key: "sol2title", label: "Module 3 — title" },
      { key: "sol2desc",  label: "Module 3 — description", long: true },
      { key: "sol3title", label: "Module 4 — title" },
      { key: "sol3desc",  label: "Module 4 — description", long: true },
      { key: "sol4title", label: "Module 5 — title" },
      { key: "sol4desc",  label: "Module 5 — description", long: true },
      { key: "sol5title", label: "Module 6 — title" },
      { key: "sol5desc",  label: "Module 6 — description", long: true },
    ],
  },
  {
    label: "DatumBIM Integration",
    fields: [
      { key: "datumTag",      label: "Tag" },
      { key: "datumTitle",    label: "Title" },
      { key: "datumDesc",     label: "Description", long: true },
      { key: "datumFeature0", label: "Feature 1" },
      { key: "datumFeature1", label: "Feature 2" },
      { key: "datumFeature2", label: "Feature 3" },
      { key: "datumFeature3", label: "Feature 4" },
      { key: "datumSub",      label: "Sub label" },
      { key: "datumLive",     label: "Live badge text" },
    ],
  },
  {
    label: "AI Assistant",
    fields: [
      { key: "aiTag",       label: "Tag" },
      { key: "aiTitle",     label: "Title" },
      { key: "aiDesc",      label: "Description", long: true },
      { key: "aiConnected", label: "\"Connected\" label" },
      { key: "aiInput",     label: "Input placeholder" },
      { key: "aiQ0",        label: "Question 1" },
      { key: "aiA0",        label: "Answer 1", long: true },
      { key: "aiQ1",        label: "Question 2" },
      { key: "aiA1",        label: "Answer 2", long: true },
      { key: "aiQ2",        label: "Question 3" },
      { key: "aiA2",        label: "Answer 3", long: true },
    ],
  },
  {
    label: "Call to Action",
    fields: [
      { key: "ctaLine1",   label: "Headline line 1" },
      { key: "ctaLine2",   label: "Headline line 2" },
      { key: "ctaDesc",    label: "Description", long: true },
      { key: "exploreBtn", label: "Button text" },
    ],
  },
  {
    label: "Footer",
    fields: [
      { key: "footer0",   label: "Footer link 1" },
      { key: "footer1",   label: "Footer link 2" },
      { key: "footer2",   label: "Footer link 3" },
      { key: "footer3",   label: "Footer link 4" },
      { key: "copyright", label: "Copyright text" },
    ],
  },
];

// Converts a T.en-style object into a FlatContent object
function flatten(t: Record<string, unknown>): FlatContent {
  const s    = t.stats       as Array<{ value: string; label: string }> | undefined;
  const nav  = t.navItems    as string[] | undefined;
  const feat = t.datumFeatures as string[] | undefined;
  const qa   = t.aiQA        as Array<{ q: string; a: string }> | undefined;
  const fl   = t.footerLinks as string[] | undefined;
  const sols = t.solutions   as Array<{ title?: string; desc?: string }> | undefined;

  return {
    badge:        t.badge        as string,
    headline1:    t.headline1    as string,
    headline2:    t.headline2    as string,
    heroDesc:     t.heroDesc     as string,
    requestDemo:  t.requestDemo  as string,
    seePlatform:  t.seePlatform  as string,
    nav0: nav?.[0], nav1: nav?.[1], nav2: nav?.[2], nav3: nav?.[3],
    logIn:       t.logIn       as string,
    requestNav:  t.requestNav  as string,
    stat0value: s?.[0]?.value, stat0label: s?.[0]?.label,
    stat1value: s?.[1]?.value, stat1label: s?.[1]?.label,
    stat2value: s?.[2]?.value, stat2label: s?.[2]?.label,
    scene1Title: t.scene1Title as string,
    scene1Desc:  t.scene1Desc  as string,
    scene2Title: t.scene2Title as string,
    scene2Desc:  t.scene2Desc  as string,
    platformTag:   t.platformTag   as string,
    platformTitle: t.platformTitle as string,
    platformDesc:  t.platformDesc  as string,
    sol0title: sols?.[0]?.title, sol0desc: sols?.[0]?.desc,
    sol1title: sols?.[1]?.title, sol1desc: sols?.[1]?.desc,
    sol2title: sols?.[2]?.title, sol2desc: sols?.[2]?.desc,
    sol3title: sols?.[3]?.title, sol3desc: sols?.[3]?.desc,
    sol4title: sols?.[4]?.title, sol4desc: sols?.[4]?.desc,
    sol5title: sols?.[5]?.title, sol5desc: sols?.[5]?.desc,
    datumTag:      t.datumTag   as string,
    datumTitle:    t.datumTitle as string,
    datumDesc:     t.datumDesc  as string,
    datumFeature0: feat?.[0], datumFeature1: feat?.[1],
    datumFeature2: feat?.[2], datumFeature3: feat?.[3],
    datumSub:  t.datumSub  as string,
    datumLive: t.datumLive as string,
    aiTag:       t.aiTag       as string,
    aiTitle:     t.aiTitle     as string,
    aiDesc:      t.aiDesc      as string,
    aiConnected: t.aiConnected as string,
    aiInput:     t.aiInput     as string,
    aiQ0: qa?.[0]?.q, aiA0: qa?.[0]?.a,
    aiQ1: qa?.[1]?.q, aiA1: qa?.[1]?.a,
    aiQ2: qa?.[2]?.q, aiA2: qa?.[2]?.a,
    ctaLine1:   t.ctaLine1   as string,
    ctaLine2:   t.ctaLine2   as string,
    ctaDesc:    t.ctaDesc    as string,
    exploreBtn: t.exploreBtn as string,
    footer0: fl?.[0], footer1: fl?.[1], footer2: fl?.[2], footer3: fl?.[3],
    copyright: t.copyright as string,
  };
}

export function EditDrawer({ currentEn, currentHe, onSaved }: Props) {
  const [visible, setVisible]     = useState(false);
  const [open, setOpen]           = useState(false);
  const [tab, setTab]             = useState<"en" | "he">("en");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [en, setEn]               = useState<FlatContent>({});
  const [he, setHe]               = useState<FlatContent>({});
  const [status, setStatus]       = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setVisible(window.location.search.includes("edit"));
  }, []);

  function openDrawer() {
    setEn(flatten(currentEn));
    setHe(flatten(currentHe));
    setOpen(true);
  }

  function set(lang: "en" | "he", key: keyof FlatContent, val: string) {
    if (lang === "en") setEn(p => ({ ...p, [key]: val }));
    else               setHe(p => ({ ...p, [key]: val }));
  }

  function toggle(label: string) {
    setCollapsed(p => ({ ...p, [label]: !p[label] }));
  }

  async function save() {
    setStatus("saving");
    try {
      await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ en, he }),
      });
      onSaved({ en, he });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }

  if (!visible) return null;

  const fields = tab === "en" ? en : he;
  const isRTL  = tab === "he";

  return (
    <>
      {!open && (
        <button onClick={openDrawer}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 rounded-2xl text-white text-[13px] font-bold shadow-2xl transition-transform hover:scale-105"
          style={{ background: copper, boxShadow: "0 8px 32px rgba(212,113,74,0.45)" }}>
          <Pencil className="w-4 h-4" />
          Edit Content
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[9998] bg-black/25"
          onClick={() => setOpen(false)} />
      )}

      <div className="fixed top-0 right-0 h-full z-[9999] flex flex-col transition-transform duration-300"
        style={{
          width: 400,
          background: card,
          borderLeft: `1px solid ${border}`,
          transform: open ? "translateX(0)" : "translateX(100%)",
          boxShadow: open ? "-8px 0 40px rgba(0,0,0,0.15)" : "none",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: copper }}>
              <Pencil className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[15px]" style={{ color: text1 }}>Edit Content</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ color: text3 }}
            className="hover:text-stone-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex shrink-0 px-5 pt-4 pb-3 gap-2" style={{ borderBottom: `1px solid ${border}` }}>
          {(["en", "he"] as const).map(l => (
            <button key={l} onClick={() => setTab(l)}
              className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all"
              style={{ background: tab === l ? copper : bg, color: tab === l ? "#fff" : text2 }}>
              {l === "en" ? "English" : "עברית"}
            </button>
          ))}
          <span className="ms-auto text-[11px] self-center" style={{ color: text3 }}>
            {Object.values(SECTIONS).reduce((a, s) => a + s.fields.length, 0)} fields
          </span>
        </div>

        {/* Fields — scrollable */}
        <div className="flex-1 overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
          {SECTIONS.map(section => {
            const isOpen = !collapsed[section.label];
            return (
              <div key={section.label} style={{ borderBottom: `1px solid ${border}` }}>
                <button
                  className="w-full flex items-center justify-between px-5 py-3 text-left"
                  style={{ background: isOpen ? bg : card }}
                  onClick={() => toggle(section.label)}>
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: text2 }}>
                    {section.label}
                  </span>
                  {isOpen
                    ? <ChevronDown className="w-4 h-4" style={{ color: text3 }} />
                    : <ChevronRight className="w-4 h-4" style={{ color: text3 }} />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 space-y-3">
                    {section.fields.map(f => (
                      <div key={f.key}>
                        <label className="block text-[11px] font-semibold mb-1" style={{ color: text3 }}>
                          {f.label}
                        </label>
                        {f.long ? (
                          <textarea rows={3}
                            value={(fields[f.key] as string) ?? ""}
                            onChange={e => set(tab, f.key, e.target.value)}
                            className="w-full px-3 py-2 text-[13px] rounded-xl resize-none"
                            style={{ background: "#fff", border: `1.5px solid ${border}`, color: text1, outline: "none" }}
                            onFocus={e => (e.currentTarget.style.borderColor = copper)}
                            onBlur={e  => (e.currentTarget.style.borderColor = border)}
                          />
                        ) : (
                          <input type="text"
                            value={(fields[f.key] as string) ?? ""}
                            onChange={e => set(tab, f.key, e.target.value)}
                            className="w-full px-3 py-2 text-[13px] rounded-xl"
                            style={{ background: "#fff", border: `1.5px solid ${border}`, color: text1, outline: "none" }}
                            onFocus={e => (e.currentTarget.style.borderColor = copper)}
                            onBlur={e  => (e.currentTarget.style.borderColor = border)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save */}
        <div className="shrink-0 px-5 py-4" style={{ borderTop: `1px solid ${border}` }}>
          <button onClick={save} disabled={status !== "idle"}
            className="w-full py-3 rounded-xl text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all"
            style={{ background: status === "saved" ? "#16a34a" : copper, opacity: status === "saving" ? 0.7 : 1 }}>
            {status === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === "saved"  && <Check   className="w-4 h-4" />}
            {status === "idle"   && <Pencil  className="w-4 h-4" />}
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
