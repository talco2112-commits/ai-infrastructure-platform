"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "he";

interface Ctx {
  lang: Lang;
  isHe: boolean;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ defaultLang, children }: { defaultLang: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  // AppLayout is a server component that re-reads the `lang` cookie on every
  // router.refresh(); sync that fresh value into client state so pages that
  // only ever read this context stay correct without needing their own
  // cookie-polling effect (which previously only ran once on mount).
  useEffect(() => { setLangState(defaultLang); }, [defaultLang]);

  function setLang(l: Lang) {
    document.cookie = `lang=${l}; path=/; max-age=31536000`;
    setLangState(l);
  }

  return (
    <LanguageContext.Provider value={{ lang, isHe: lang === "he", setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
}
