"use client";
import { useEffect, useRef, useState } from "react";

const LOGO = "/לוגו עם כיתוב חום רקע קרם.png";

export function LogoAnimation({
  size = 44,          // controls HEIGHT; width is derived from aspect ratio
  onComplete,
  holdMs = 0,
  showFinalImage = true,
  style,
  className,
}: {
  size?: number;
  onComplete?: () => void;
  holdMs?: number;
  showFinalImage?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [showImage, setShowImage] = useState(false);
  // Actual pixel dims once image aspect ratio is known
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  // Step 1: load image → compute display dimensions from aspect ratio
  useEffect(() => {
    const img = new Image();
    img.src = LOGO;
    img.onload = () => {
      const w = Math.round(size * (img.naturalWidth / img.naturalHeight));
      setDims({ w, h: size });
    };
  }, [size]);

  // Step 2: run particle animation once dims are known
  useEffect(() => {
    if (!dims) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const { w, h } = dims;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const img = new Image();
    img.src = LOGO;

    img.onload = () => {
      // Sample at proportional resolution
      const SAMPLE_H = 100;
      const SAMPLE_W = Math.round(SAMPLE_H * (w / h));
      const STEP = 2;

      const tmp  = document.createElement("canvas");
      tmp.width  = SAMPLE_W;
      tmp.height = SAMPLE_H;
      const tCtx = tmp.getContext("2d")!;
      tCtx.drawImage(img, 0, 0, SAMPLE_W, SAMPLE_H);
      const { data } = tCtx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);

      // Auto-detect background from corners
      const corner = (cx: number, cy: number) => {
        const i = (cy * SAMPLE_W + cx) * 4;
        return [data[i], data[i + 1], data[i + 2]];
      };
      const corners = [
        corner(0, 0), corner(SAMPLE_W - 1, 0),
        corner(0, SAMPLE_H - 1), corner(SAMPLE_W - 1, SAMPLE_H - 1),
      ];
      const bgR = corners.reduce((s, c) => s + c[0], 0) / 4;
      const bgG = corners.reduce((s, c) => s + c[1], 0) / 4;
      const bgB = corners.reduce((s, c) => s + c[2], 0) / 4;

      type Dot = {
        tx: number; ty: number;
        sx: number; sy: number;
        r: number; g: number; b: number;
        radius: number;
        delay: number;
      };

      const dots: Dot[] = [];
      const baseR = Math.max(0.6, (h / 80) * 0.8);

      for (let y = 0; y < SAMPLE_H; y += STEP) {
        for (let x = 0; x < SAMPLE_W; x += STEP) {
          const i = (y * SAMPLE_W + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          if (a > 60 && diff > 25) {
            dots.push({
              tx: (x / SAMPLE_W) * w,
              ty: (y / SAMPLE_H) * h,
              sx: (Math.random() - 0.5) * w * 5 + w / 2,
              sy: (Math.random() - 0.5) * h * 5 + h / 2,
              r, g, b,
              radius: baseR + Math.random() * baseR * 0.6,
              delay: Math.random() * 0.35,
            });
          }
        }
      }

      const DURATION = 900;
      const DELAY_MS = 350;
      let startTime: number | null = null;
      let raf: number;

      function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

      function frame(now: number) {
        if (!ctx) return;
        if (!startTime) startTime = now;
        const elapsed = now - startTime;

        ctx.clearRect(0, 0, w, h);

        let allSettled = true;
        for (const d of dots) {
          const t = Math.max(0, Math.min((elapsed - d.delay * DELAY_MS) / DURATION, 1));
          if (t < 1) allSettled = false;
          const e = easeOut(t);
          const x = d.sx + (d.tx - d.sx) * e;
          const y = d.sy + (d.ty - d.sy) * e;
          ctx.beginPath();
          ctx.arc(x, y, d.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${d.r},${d.g},${d.b},${0.3 + e * 0.7})`;
          ctx.fill();
        }

        if (!allSettled) {
          raf = requestAnimationFrame(frame);
        } else {
          setTimeout(() => {
            if (showFinalImage) {
              setShowImage(true);
              setTimeout(() => onComplete?.(), 400);
            } else {
              onComplete?.();
            }
          }, holdMs);
        }
      }

      raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    };
  }, [dims]); // eslint-disable-line react-hooks/exhaustive-deps

  // Placeholder while image loads
  if (!dims) return <div style={{ height: size, width: size * 3.5, ...style }} />;

  return (
    <div
      className={className}
      style={{ position: "relative", width: dims.w, height: dims.h, flexShrink: 0, ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: dims.w, height: dims.h,
          opacity: showImage ? 0 : 1,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
        }}
      />
      {showFinalImage && (
        <img
          src={LOGO}
          alt="InfrAI"
          style={{
            position: "absolute", inset: 0,
            width: dims.w, height: dims.h,
            objectFit: "fill",
            opacity: showImage ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        />
      )}
    </div>
  );
}
