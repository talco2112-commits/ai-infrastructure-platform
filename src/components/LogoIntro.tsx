"use client";
import { useEffect, useRef } from "react";

const LOGO_SRC = "/לוגו עם כיתוב חום רקע קרם.png";
const BG       = "237,232,225";

export function LogoIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    const img = new Image();
    img.src = LOGO_SRC;

    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight;
      const logoW  = Math.min(W * 0.60, H * 0.50 * aspect);
      const logoH  = logoW / aspect;
      const logoX  = (W - logoW) / 2;
      const logoY  = (H - logoH) / 2;

      // Sample at high resolution
      const SAMPLE_W = 600;
      const SAMPLE_H = Math.round(SAMPLE_W / aspect);
      const STEP     = 2;

      const tmp  = document.createElement("canvas");
      tmp.width  = SAMPLE_W;
      tmp.height = SAMPLE_H;
      const tCtx = tmp.getContext("2d")!;
      tCtx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
      const { data } = tCtx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);

      const px = (cx: number, cy: number) => {
        const i = (cy * SAMPLE_W + cx) * 4;
        return [data[i], data[i+1], data[i+2]] as const;
      };
      const cs  = [px(0,0), px(SAMPLE_W-1,0), px(0,SAMPLE_H-1), px(SAMPLE_W-1,SAMPLE_H-1)];
      const bgR = cs.reduce((s,c) => s+c[0], 0) / 4;
      const bgG = cs.reduce((s,c) => s+c[1], 0) / 4;
      const bgB = cs.reduce((s,c) => s+c[2], 0) / 4;

      type Particle = {
        tx: number; ty: number; sx: number; sy: number;
        r: number; g: number; b: number;
        radius: number; delay: number;
        wobblePhase: number; wobbleAmp: number;
      };

      const particles: Particle[] = [];

      for (let y = 0; y < SAMPLE_H; y += STEP) {
        for (let x = 0; x < SAMPLE_W; x += STEP) {
          const i = (y * SAMPLE_W + x) * 4;
          const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
          const diff = Math.abs(r-bgR) + Math.abs(g-bgG) + Math.abs(b-bgB);
          if (a > 60 && diff > 12) {
            particles.push({
              tx: logoX + (x / SAMPLE_W) * logoW,
              ty: logoY + (y / SAMPLE_H) * logoH,
              sx: Math.random() * W,
              sy: Math.random() * H,
              r, g, b,
              radius: 1.1 + Math.random() * 0.8,
              delay: Math.random(),
              wobblePhase: Math.random() * Math.PI * 2,
              wobbleAmp:   18 + Math.random() * 38,
            });
          }
        }
      }

      // ── Timing ─────────────────────────────────────────────────────────
      const STAGGER_MS   = 1000;
      const PARTICLE_MS  = 3200;
      const ASSEMBLE_MS  = 4000;
      const CROSSFADE_MS = 500;
      const HOLD_MS      = 2000; // 2 s hold
      const FADE_MS      = 1000; // 1 s fade

      let raf: number;
      let startTime: number | null = null;
      type Phase = "assemble" | "crossfade" | "hold" | "fade";
      let phase: Phase = "assemble";
      let phaseStart    = 0;
      let fadeFired     = false;

      function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4); }

      function fillBg() {
        ctx.fillStyle = `rgb(${BG})`;
        ctx.fillRect(0, 0, W, H);
      }

      function drawLogoImage(alpha = 1) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(img, logoX, logoY, logoW, logoH);
        ctx.globalAlpha = 1;
      }

      function frame(now: number) {
        if (!startTime) { startTime = now; phaseStart = now; }
        const elapsed = now - phaseStart;

        fillBg();

        // Phase 1 — particles fly in
        if (phase === "assemble") {
          for (const p of particles) {
            const start = p.delay * STAGGER_MS;
            const t     = Math.max(0, Math.min((elapsed - start) / PARTICLE_MS, 1));
            const e     = easeOutQuart(t);
            const bx    = p.sx + (p.tx - p.sx) * e;
            const by    = p.sy + (p.ty - p.sy) * e;
            const dist  = Math.hypot(p.tx - p.sx, p.ty - p.sy) || 1;
            const nx    = -(p.ty - p.sy) / dist;
            const ny    =  (p.tx - p.sx) / dist;
            const wob   = p.wobbleAmp * (1 - e) * Math.sin(p.wobblePhase + elapsed * 0.0025);
            ctx.beginPath();
            ctx.arc(bx + nx*wob, by + ny*wob, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${0.1 + e * 0.9})`;
            ctx.fill();
          }
          if (elapsed >= ASSEMBLE_MS) { phase = "crossfade"; phaseStart = now; }

        // Phase 2 — particles cross-fade to the actual image
        } else if (phase === "crossfade") {
          for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.tx, p.ty, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
            ctx.fill();
          }
          drawLogoImage(Math.min(elapsed / CROSSFADE_MS, 1));
          if (elapsed >= CROSSFADE_MS) { phase = "hold"; phaseStart = now; }

        // Phase 3 — hold the real logo for 2 s
        } else if (phase === "hold") {
          drawLogoImage();
          if (elapsed >= HOLD_MS) { phase = "fade"; phaseStart = now; }

        // Phase 4 — fade canvas opacity while page fades in simultaneously
        } else if (phase === "fade") {
          drawLogoImage();
          const progress = Math.min(elapsed / FADE_MS, 1);

          // Fire onDone immediately so page starts its own 1 s opacity transition
          if (!fadeFired) {
            fadeFired = true;
            onDone();
          }

          // Fade out canvas by lowering its CSS opacity
          canvas.style.opacity = String(1 - progress);
          canvas.style.pointerEvents = "none";

          if (progress >= 1) {
            cancelAnimationFrame(raf);
            return;
          }
        }

        raf = requestAnimationFrame(frame);
      }

      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        zIndex: 1000,
        display: "block",
        background: `rgb(${BG})`,
      }}
    />
  );
}
