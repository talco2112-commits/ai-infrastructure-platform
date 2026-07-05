"use client";

import { useState, useEffect } from "react";
import { VideoBackground } from "@/components/VideoBackground";
import { LogoAnimation } from "@/components/LogoAnimation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";

const copper  = "#8B5A2B";
const copperD = "#6B3E18";
const copperL = "#C49A6C";
const bg      = "#EDE8E1";
const card    = "#FAF8F5";
const border  = "#DDD5CB";
const text1   = "#1C1917";
const text2   = "#57534E";
const text3   = "#A8A29E";

const TRANSPARENT_LOGO = "/לוגו חום בלי רקע.png";

const T = {
  en: {
    dir: "ltr" as const,
    back: "Back",
    headline1: "Your entire project",
    headline2: "in one place",
    sub: "Documents, schedule, finance, and site data —\nall connected, from day one",
    welcome: "Welcome back",
    welcomeSub: "Sign in to your project command center",
    email: "Email address",
    emailPlaceholder: "you@company.com",
    password: "Password",
    forgot: "Forgot password?",
    signIn: "Sign in",
    signingIn: "Signing in…",
    noAccount: "Don't have an account?",
    requestAccess: "Request access",
    footer: "© 2026 InfrAI Ltd. All rights reserved",
  },
  he: {
    dir: "rtl" as const,
    back: "חזרה",
    headline1: "כל הפרויקט",
    headline2: "במקום אחד",
    sub: "מסמכים, לוחות זמנים, פיננסים ונתוני אתר —\nמחוברים, מהיום הראשון",
    welcome: "ברוך הבא",
    welcomeSub: "התחבר למרכז הפיקוד שלך",
    email: "כתובת דוא\"ל",
    emailPlaceholder: "you@company.com",
    password: "סיסמה",
    forgot: "שכחת סיסמה?",
    signIn: "כניסה",
    signingIn: "מתחבר…",
    noAccount: "אין לך חשבון?",
    requestAccess: "בקש גישה",
    footer: "© 2026 InfrAI בע\"מ. כל הזכויות שמורות",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [lang, setLang]                 = useState<"en" | "he">("en");

  useEffect(() => {
    const cookieLang = document.cookie
      .split(";")
      .find(c => c.trim().startsWith("lang="))
      ?.split("=")[1]
      ?.trim();
    if (cookieLang === "he") setLang("he");
  }, []);

  const t   = T[lang];
  const isHe = lang === "he";
  const BackArrow = isHe ? ArrowRight : ArrowLeft;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  }

  return (
    <div className="min-h-screen flex" dir={t.dir} style={{ background: bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Left panel — atmospheric background ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-between p-12">
        <VideoBackground className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(20,14,10,0.72) 0%, rgba(26,21,18,0.80) 100%)" }} />
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(160deg, #2C1810 0%, #1A1512 60%, #2A1A0E 100%)" }} />

        {/* Logo — transparent, looks clean on dark */}
        <div className="relative z-10">
          <LogoAnimation size={80} src={TRANSPARENT_LOGO} />
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <h2 className="text-[36px] font-bold text-white leading-tight mb-3">
            {t.headline1}<br />
            <span style={{ backgroundImage: `linear-gradient(135deg, ${copperL}, #F5C4A8)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t.headline2}
            </span>
          </h2>
          <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.6)" }}>
            {t.sub}
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-[440px] shrink-0 flex flex-col justify-center px-8 py-12 relative"
        style={{ background: card, borderInlineStart: `1px solid ${border}` }}>

        {/* Back link */}
        <Link href="/"
          className="absolute top-8 flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
          style={{ color: text3, insetInlineStart: "32px" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = copper)}
          onMouseLeave={(e) => (e.currentTarget.style.color = text3)}>
          <BackArrow className="w-3.5 h-3.5" />
          {t.back}
        </Link>

        {/* Mobile logo */}
        <div className="flex lg:hidden mb-10">
          <LogoAnimation size={56} src={TRANSPARENT_LOGO} />
        </div>

        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-[26px] font-bold mb-1" style={{ color: text1 }}>{t.welcome}</h1>
          <p className="text-[14px] mb-8" style={{ color: text2 }}>{t.welcomeSub}</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: text1 }}>
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                dir="ltr"
                style={{ background: bg, border: `1.5px solid ${border}`, color: text1, outline: "none" }}
                className="w-full px-4 py-3 text-[14px] rounded-xl transition-all placeholder:text-[#C4BAB2]"
                onFocus={(e) => { e.currentTarget.style.border = `1.5px solid ${copper}`; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e)  => { e.currentTarget.style.border = `1.5px solid ${border}`; e.currentTarget.style.background = bg; }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold" style={{ color: text1 }}>{t.password}</label>
                <button type="button" className="text-[12px] font-semibold transition-colors"
                  style={{ color: copper }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = copperD)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = copper)}>
                  {t.forgot}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  dir="ltr"
                  style={{ background: bg, border: `1.5px solid ${border}`, color: text1, outline: "none" }}
                  className="w-full px-4 py-3 pr-11 text-[14px] rounded-xl transition-all placeholder:text-[#C4BAB2]"
                  onFocus={(e) => { e.currentTarget.style.border = `1.5px solid ${copper}`; e.currentTarget.style.background = "#fff"; }}
                  onBlur={(e)  => { e.currentTarget.style.border = `1.5px solid ${border}`; e.currentTarget.style.background = bg; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: text3, insetInlineEnd: "14px" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = text2)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = text3)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white text-[15px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
              style={{ background: loading ? copperD : copper, boxShadow: "0 4px 16px rgba(139,90,43,0.28)" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = copperD; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = copper; }}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                  {t.signingIn}
                </>
              ) : t.signIn}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${border}` }}>
            <p className="text-[13px] text-center" style={{ color: text3 }}>
              {t.noAccount}{" "}
              <a href="#" className="font-semibold transition-colors" style={{ color: copper }}
                onMouseEnter={(e) => (e.currentTarget.style.color = copperD)}
                onMouseLeave={(e) => (e.currentTarget.style.color = copper)}>
                {t.requestAccess}
              </a>
            </p>
          </div>
        </div>

        <p className="absolute bottom-8 left-0 right-0 text-center text-[12px]" style={{ color: text3 }}>
          {t.footer}
        </p>
      </div>
    </div>
  );
}
