import { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "../lib/motion";

/**
 * The living paper world behind every page:
 * warm light pools, grain, a few twinkling stars and slow drifting dust.
 * Switches to a candle-lit "darkroom" tone on the memories page.
 */
export default function AnimatedBackground({ dark = false }: { dark?: boolean }) {
  const reduce = usePrefersReducedMotion();

  // Extremely slow pointer parallax for the light pools.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 12, damping: 20 });
  const sy = useSpring(py, { stiffness: 12, damping: 20 });
  const farX = useTransform(sx, (v) => v * 14);
  const farY = useTransform(sy, (v) => v * 10);
  const nearX = useTransform(sx, (v) => v * -26);
  const nearY = useTransform(sy, (v) => v * -18);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py, reduce]);

  const stars = useMemo(() => {
    let s = 7;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 16 }, () => ({
      left: `${4 + r() * 92}%`,
      top: `${4 + r() * 88}%`,
      size: 5 + r() * 7,
      t: `${3.5 + r() * 4}s`,
      d: `${-r() * 6}s`,
    }));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base paper */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, #fdf9f1 0%, #f5eee3 45%, #efe5d6 100%)",
        }}
      />

      {/* Light pools */}
      <motion.div className="absolute inset-0" style={{ x: farX, y: farY }}>
        <div
          className="animate-glow absolute -left-[15vw] -top-[20vh] h-[70vh] w-[70vw] rounded-full opacity-70 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,241,214,0.95), transparent 65%)", ["--dur" as string]: "32s" }}
        />
        <div
          className="animate-glow absolute -bottom-[25vh] -right-[10vw] h-[75vh] w-[65vw] rounded-full opacity-60 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(234,214,207,0.9), transparent 65%)",
            ["--dur" as string]: "38s",
            ["--gx" as string]: "-4vw",
            ["--gy" as string]: "3vh",
          }}
        />
      </motion.div>
      <motion.div className="absolute inset-0" style={{ x: nearX, y: nearY }}>
        <div
          className="animate-glow absolute left-[35vw] top-[30vh] h-[45vh] w-[45vw] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(220,198,160,0.6), transparent 70%)", ["--dur" as string]: "44s" }}
        />
      </motion.div>

      {/* Darkroom tone for memories */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:
            "radial-gradient(90% 70% at 50% 35%, #3a2d23 0%, #241c16 50%, #16110d 100%)",
        }}
      />

      {/* Stars */}
      {stars.map((st, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="animate-twinkle absolute"
          style={{ left: st.left, top: st.top, width: st.size, height: st.size, ["--t" as string]: st.t, ["--d" as string]: st.d }}
        >
          <path d="M10 0 L11.4 8.6 L20 10 L11.4 11.4 L10 20 L8.6 11.4 L0 10 L8.6 8.6 Z" fill={dark ? "#e8cf9c" : "#b89458"} />
        </svg>
      ))}

      {!reduce && <Dust dark={dark} />}

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.55] mix-blend-multiply"
        style={{ backgroundImage: "var(--grain)", opacity: dark ? 0.35 : 0.55 }}
      />
    </div>
  );
}

/** Slow golden dust on a single canvas. Pauses when the tab is hidden. */
function Dust({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const darkRef = useRef(dark);
  darkRef.current = dark;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; phase: number };
    let parts: P[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(46, Math.round((w * h) / 32000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.06,
        vy: -0.03 - Math.random() * 0.08,
        a: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      ctx.clearRect(0, 0, w, h);
      const color = darkRef.current ? "255, 226, 170" : "176, 140, 84";
      for (const p of parts) {
        p.phase += dt * 0.0006;
        p.x += (p.vx + Math.sin(p.phase) * 0.03) * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const flicker = 0.65 + Math.sin(p.phase * 3) * 0.35;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, ${p.a * flicker})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0" />;
}
