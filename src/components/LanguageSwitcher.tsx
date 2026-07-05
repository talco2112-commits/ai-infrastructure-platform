"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitcher({ lang }: { lang: "en" | "he" }) {
  const router = useRouter();
  const { setLang } = useLanguage();

  function toggle() {
    const next = lang === "en" ? "he" : "en";
    setLang(next);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-[13px] font-semibold transition-colors"
      style={{ color: "#78716C" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.color = "#E7E5E4";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#78716C";
      }}
    >
      <Languages className="w-[15px] h-[15px] shrink-0" />
      {lang === "en" ? "עברית" : "English"}
    </button>
  );
}
