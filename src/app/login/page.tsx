"use client";

import { useState } from "react";
import { VideoBackground } from "@/components/VideoBackground";
import { LogoAnimation } from "@/components/LogoAnimation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const copper  = "#D4714A";
const copperD = "#B05E38";
const copperL = "#ECA070";
const bg      = "#EDE8E1";
const card    = "#FAF8F5";
const border  = "#DDD5CB";
const text1   = "#1C1917";
const text2   = "#57534E";
const text3   = "#A8A29E";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword]  = useState(false);
  const [loading, setLoading]            = useState(false);
  const [email, setEmail]                = useState("");
  const [password, setPassword]          = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  }

  return (
    <div className="min-h-screen flex" style={{ background: bg, fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Left panel — atmospheric image/video ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-between p-12">
        {/* video / image background */}
        <VideoBackground className="absolute inset-0 w-full h-full object-cover" />
        {/* warm dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(20,14,10,0.72) 0%, rgba(26,21,18,0.80) 100%)" }} />
        {/* fallback */}
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(160deg, #2C1810 0%, #1A1512 60%, #2A1A0E 100%)" }} />

        {/* Logo top-left */}
        <div className="relative z-10">
          <LogoAnimation size={80} />
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <h2 className="text-[36px] font-bold text-white leading-tight mb-3">
            כל הפרויקט<br />
            <span style={{ backgroundImage: `linear-gradient(135deg, ${copperL}, #F5C4A8)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              במקום אחד
            </span>
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Documents, schedule, finance, and site data —<br />all connected, from day one
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="w-full lg:w-[440px] shrink-0 flex flex-col justify-center px-8 py-12 relative"
        style={{ background: card, borderLeft: `1px solid ${border}` }}>

        {/* Back link */}
        <Link href="/"
          className="absolute top-8 left-8 flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
          style={{ color: text3 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = copper)}
          onMouseLeave={(e) => (e.currentTarget.style.color = text3)}>
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* Mobile logo (hidden on lg) */}
        <div className="flex lg:hidden mb-10">
          <LogoAnimation size={56} />
        </div>

        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-[26px] font-bold mb-1" style={{ color: text1 }}>Welcome back</h1>
          <p className="text-[14px] mb-8" style={{ color: text2 }}>Sign in to your project command center</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: text1 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={{
                  background: bg,
                  border: `1.5px solid ${border}`,
                  color: text1,
                  outline: "none",
                }}
                className="w-full px-4 py-3 text-[14px] rounded-xl transition-all placeholder:text-[#C4BAB2]"
                onFocus={(e) => { e.currentTarget.style.border = `1.5px solid ${copper}`; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e) => { e.currentTarget.style.border = `1.5px solid ${border}`; e.currentTarget.style.background = bg; }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold" style={{ color: text1 }}>Password</label>
                <button type="button" className="text-[12px] font-semibold transition-colors"
                  style={{ color: copper }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = copperD)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = copper)}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    background: bg,
                    border: `1.5px solid ${border}`,
                    color: text1,
                    outline: "none",
                  }}
                  className="w-full px-4 py-3 pr-11 text-[14px] rounded-xl transition-all placeholder:text-[#C4BAB2]"
                  onFocus={(e) => { e.currentTarget.style.border = `1.5px solid ${copper}`; e.currentTarget.style.background = "#fff"; }}
                  onBlur={(e) => { e.currentTarget.style.border = `1.5px solid ${border}`; e.currentTarget.style.background = bg; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: text3 }}
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
              style={{ background: loading ? copperD : copper, boxShadow: "0 4px 16px rgba(212,113,74,0.28)" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = copperD; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = copper; }}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${border}` }}>
            <p className="text-[13px] text-center" style={{ color: text3 }}>
              Don&apos;t have an account?{" "}
              <a href="#" className="font-semibold transition-colors" style={{ color: copper }}
                onMouseEnter={(e) => (e.currentTarget.style.color = copperD)}
                onMouseLeave={(e) => (e.currentTarget.style.color = copper)}>
                Request access
              </a>
            </p>
          </div>
        </div>

        <p className="absolute bottom-8 left-0 right-0 text-center text-[12px]" style={{ color: text3 }}>
          © 2026 InfrAI Ltd. All rights reserved
        </p>
      </div>
    </div>
  );
}
