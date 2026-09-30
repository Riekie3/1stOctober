import { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "../lib/motion";
import type { SkyTheme } from "../lib/theme";

/**
 * The living world behind every page. It follows the sky theme:
 *  • day    — warm paper, soft light pools, drifting golden dust
 *  • sunset — a peach-and-rose sky, a low glowing sun, clouds, first stars
 *  • night  — deep navy, a field of twinkling stars, the moon, a Milky Way
 *             haze and the occasional shooting star
 * The memories page gets a candle-lit "darkroom" in daytime and at sunset.
 */
export default function AnimatedBackground({ dark = false, theme = "day" }: { dark?: boolean; theme?: SkyTheme }) {
  const reduce = usePrefersReducedMotion();
  const fade = { duration: 2.4, ease: [0.4, 0, 0.2, 1] as const };

  // Extremely slow pointer parallax for the light pools and the moon.
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

  const sparks = useMemo(() => {
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

  const night = theme === "night";
  const sunset = theme === "sunset";
  const darkroom = dark && !night; // at night the memories float among the stars instead
  const sparkColor = night ? "#f3e3b8" : darkroom ? "#e8cf9c" : sunset ? "#c27a4a" : "#b89458";
  const dustTone: DustTone = night ? "night" : darkroom ? "darkroom" : sunset ? "sunset" : "day";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Day: base paper */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% 0%, #fdf9f1 0%, #f5eee3 45%, #efe5d6 100%)" }} />

      {/* Day: light pools */}
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: night ? 0 : sunset ? 0.55 : 1 }} transition={fade}>
        <motion.div className="absolute inset-0" style={{ x: farX, y: farY }}>
          <div
            className="animate-glow absolute -left-[15vw] -top-[20vh] h-[70vh] w-[70vw] rounded-full opacity-70 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,241,214,0.95), transparent 65%)", ["--dur" as string]: "32s" }}
          />
          <div
            className="animate-glow absolute -bottom-[25vh] -right-[10vw] h-[75vh] w-[65vw] rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(234,214,207,0.9), transparent 65%)", ["--dur" as string]: "38s", ["--gx" as string]: "-4vw", ["--gy" as string]: "3vh" }}
          />
        </motion.div>
        <motion.div className="absolute inset-0" style={{ x: nearX, y: nearY }}>
          <div
            className="animate-glow absolute left-[35vw] top-[30vh] h-[45vh] w-[45vw] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(220,198,160,0.6), transparent 70%)", ["--dur" as string]: "44s" }}
          />
        </motion.div>
      </motion.div>

      {/* Sunset */}
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: sunset ? 1 : 0 }} transition={fade}>
        <SunsetSky />
      </motion.div>

      {/* Night */}
      <motion.div className="absolute inset-0" initial={false} animate={{ opacity: night ? 1 : 0 }} transition={fade}>
        {night && <NightSky x={farX} y={farY} reduce={reduce} />}
      </motion.div>

      {/* Darkroom tone for memories (day & sunset) */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: darkroom ? 1 : 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: "radial-gradient(90% 70% at 50% 35%, #3a2d23 0%, #241c16 50%, #16110d 100%)" }}
      />

      {/* Sparkle stars */}
      {sparks.map((st, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="animate-twinkle absolute"
          style={{ left: st.left, top: st.top, width: st.size, height: st.size, ["--t" as string]: st.t, ["--d" as string]: st.d }}
        >
          <path d="M10 0 L11.4 8.6 L20 10 L11.4 11.4 L10 20 L8.6 11.4 L0 10 L8.6 8.6 Z" fill={sparkColor} style={{ transition: "fill 2.4s" }} />
        </svg>
      ))}

      {!reduce && <Dust tone={dustTone} />}

      {/* Grain */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{ backgroundImage: "var(--grain)", opacity: night ? 0.12 : darkroom ? 0.35 : 0.55, transition: "opacity 2.4s" }}
      />
    </div>
  );
}

/* ─── Sunset ────────────────────────────────────────────── */

function SunsetSky() {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #c7b3d6 0%, #eab7bb 26%, #f6c9a9 52%, #f5ad7e 78%, #e98e63 100%)",
        }}
      />
      {/* the setting sun, low on the horizon */}
      <div
        className="absolute left-1/2 top-[88%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, #fff3d1 0%, #ffd79a 22%, rgba(255,184,120,0.55) 45%, transparent 70%)" }}
      />
      {/* drifting clouds */}
      <div
        className="animate-glow absolute left-[-10vw] top-[18vh] h-[10vh] w-[60vw] rounded-full blur-2xl"
        style={{ background: "rgba(255, 226, 214, 0.55)", ["--dur" as string]: "60s", ["--gx" as string]: "8vw", ["--gy" as string]: "0vh" }}
      />
      <div
        className="animate-glow absolute right-[-12vw] top-[34vh] h-[8vh] w-[55vw] rounded-full blur-2xl"
        style={{ background: "rgba(248, 196, 180, 0.5)", ["--dur" as string]: "72s", ["--gx" as string]: "-7vw", ["--gy" as string]: "0vh" }}
      />
      <div
        className="animate-glow absolute left-[20vw] top-[58vh] h-[6vh] w-[45vw] rounded-full blur-2xl"
        style={{ background: "rgba(255, 214, 170, 0.45)", ["--dur" as string]: "66s", ["--gx" as string]: "6vw", ["--gy" as string]: "0vh" }}
      />
      {/* first faint stars near the top */}
      <StarField count={28} maxTop={32} brightness={0.55} seed={3} />
    </div>
  );
}

/* ─── Night ─────────────────────────────────────────────── */

function NightSky({ x, y, reduce }: { x: MotionValue<number>; y: MotionValue<number>; reduce: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{ background: "radial-gradient(130% 90% at 50% 0%, #1c2654 0%, #0f1530 45%, #070a18 100%)" }} />
      {/* Milky Way haze */}
      <div
        className="absolute left-1/2 top-1/2 h-[38vh] w-[160vmax] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] blur-3xl"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(170,180,255,0.16) 0%, rgba(140,120,200,0.08) 45%, transparent 75%)" }}
      />
      <StarField count={150} maxTop={100} brightness={1} seed={11} />
      {/* The moon */}
      <motion.div className="absolute right-[6%] top-[3.5%] sm:right-[14%] sm:top-[9%]" style={{ x, y }}>
        <div
          className="relative h-11 w-11 rounded-full sm:h-20 sm:w-20"
          style={{
            background: "radial-gradient(circle at 38% 35%, #fffbea 0%, #f1ead0 55%, #d9d0b0 100%)",
            boxShadow: "0 0 40px 12px rgba(240, 232, 200, 0.22), 0 0 120px 40px rgba(180, 190, 255, 0.12)",
          }}
        >
          <span className="absolute left-[22%] top-[48%] h-[18%] w-[18%] rounded-full bg-[#d8cfae]/60" />
          <span className="absolute left-[55%] top-[26%] h-[12%] w-[12%] rounded-full bg-[#d8cfae]/50" />
          <span className="absolute left-[58%] top-[60%] h-[9%] w-[9%] rounded-full bg-[#d8cfae]/45" />
        </div>
      </motion.div>
      {!reduce && (
        <>
          <span className="shooting-star" style={{ top: "12%", left: "62%", ["--shoot-delay" as string]: "3s", ["--shoot-dur" as string]: "13s" }} />
          <span className="shooting-star" style={{ top: "28%", left: "88%", ["--shoot-delay" as string]: "9s", ["--shoot-dur" as string]: "19s" }} />
        </>
      )}
    </div>
  );
}

/** Many small stars in a few twinkle groups (only 4 things animate, so it's cheap). */
function StarField({ count, maxTop, brightness, seed }: { count: number; maxTop: number; brightness: number; seed: number }) {
  const groups = useMemo(() => {
    let s = seed * 7919;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const g: { x: number; y: number; size: number; o: number; glow: boolean }[][] = [[], [], [], []];
    for (let i = 0; i < count; i++) {
      const big = r() > 0.9;
      g[i % 4].push({ x: r() * 100, y: r() * maxTop, size: big ? 2.2 + r() * 1.4 : 0.8 + r() * 1.2, o: (0.35 + r() * 0.65) * brightness, glow: big });
    }
    return g;
  }, [count, maxTop, brightness, seed]);
  return (
    <div className="absolute inset-0">
      {groups.map((stars, gi) => (
        <div key={gi} className="star-group absolute inset-0" style={{ ["--t" as string]: `${4 + gi * 1.3}s`, ["--d" as string]: `${-gi * 1.7}s` }}>
          {stars.map((st, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-[#fdf7e6]"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: st.size,
                height: st.size,
                opacity: st.o,
                boxShadow: st.glow ? "0 0 6px 1px rgba(255, 244, 214, 0.55)" : undefined,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Dust / star-dust ──────────────────────────────────── */

type DustTone = "day" | "sunset" | "darkroom" | "night";
const DUST_COLORS: Record<DustTone, string> = {
  day: "176, 140, 84",
  sunset: "226, 150, 96",
  darkroom: "255, 226, 170",
  night: "220, 228, 255",
};

/** Slow drifting motes on a single canvas. Pauses when the tab is hidden. */
function Dust({ tone }: { tone: DustTone }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const toneRef = useRef(tone);
  toneRef.current = tone;

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
      const color = DUST_COLORS[toneRef.current];
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
