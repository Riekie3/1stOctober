import { motion } from "framer-motion";
import { useMemo } from "react";

/** Four-point star used as the site's recurring mark. */
export function Spark({ size = 12, className = "", color = "currentColor" }: { size?: number; className?: string; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" width={size} height={size} className={className}>
      <path d="M10 0 L11.3 8.7 L20 10 L11.3 11.3 L10 20 L8.7 11.3 L0 10 L8.7 8.7 Z" fill={color} />
    </svg>
  );
}

/** A fine gold rule with a small spark in the middle. */
export function Rule({ className = "", width = "9rem" }: { className?: string; width?: string }) {
  return (
    <div aria-hidden className={`flex items-center justify-center gap-3 text-gold ${className}`}>
      <span className="h-px bg-gradient-to-r from-transparent to-gold-soft" style={{ width }} />
      <Spark size={9} />
      <span className="h-px bg-gradient-to-l from-transparent to-gold-soft" style={{ width }} />
    </div>
  );
}

/** A small burst of gold motes — used when something is revealed. */
export function Burst({ count = 14, radius = 70, className = "", color = "#b8955a" }: { count?: number; radius?: number; className?: string; color?: string }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const r = radius * (0.55 + Math.random() * 0.6);
        return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 2 + Math.random() * 3.5, d: Math.random() * 0.12, star: i % 4 === 0 };
      }),
    [count, radius],
  );
  return (
    <div aria-hidden className={`pointer-events-none absolute left-1/2 top-1/2 ${className}`}>
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{ width: m.star ? m.s * 2.4 : m.s, height: m.star ? m.s * 2.4 : m.s, marginLeft: -m.s / 2, marginTop: -m.s / 2 }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: m.x, y: m.y, opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
          transition={{ duration: 1.3, delay: m.d, ease: [0.22, 1, 0.36, 1] }}
        >
          {m.star ? <Spark size={m.s * 2.4} color={color} /> : <span className="block h-full w-full rounded-full" style={{ background: color }} />}
        </motion.span>
      ))}
    </div>
  );
}

/** Pressed botanical sprig, drawn in a single fine line. */
export function Sprig({ className = "", draw = true }: { className?: string; draw?: boolean }) {
  const path = { hidden: { pathLength: draw ? 0 : 1, opacity: draw ? 0 : 1 }, show: { pathLength: 1, opacity: 1 } };
  const t = (d: number) => ({ duration: 2.2, delay: d, ease: [0.22, 1, 0.36, 1] as const });
  return (
    <motion.svg aria-hidden viewBox="0 0 120 200" className={className} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" initial="hidden" animate="show">
      <motion.path variants={path} transition={t(0)} d="M62 196 C 58 150, 66 110, 56 60 C 52 40, 58 20, 70 6" />
      <motion.path variants={path} transition={t(0.4)} d="M59 150 C 40 144, 26 130, 22 112 C 38 114, 52 126, 59 150 Z" />
      <motion.path variants={path} transition={t(0.6)} d="M61 118 C 80 112, 94 98, 98 80 C 82 82, 68 96, 61 118 Z" />
      <motion.path variants={path} transition={t(0.8)} d="M57 86 C 40 80, 30 66, 28 50 C 42 54, 54 66, 57 86 Z" />
      <motion.path variants={path} transition={t(1)} d="M58 56 C 72 50, 80 38, 82 24 C 70 28, 60 40, 58 56 Z" />
      <motion.circle variants={path} transition={t(1.2)} cx="70" cy="6" r="3.2" />
      <motion.circle variants={path} transition={t(1.3)} cx="28" cy="46" r="2.2" />
      <motion.circle variants={path} transition={t(1.4)} cx="99" cy="76" r="2.2" />
    </motion.svg>
  );
}

/** Circular passport-style stamp. */
export function Stamp({ label, sub, rotate = -12, className = "" }: { label: string; sub: string; rotate?: number; className?: string }) {
  const id = useMemo(() => `stamp-${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <path id={id} d="M50 50 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0" />
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <text fontSize="8.6" letterSpacing="2.4" fill="currentColor" fontFamily="DM Sans Variable, sans-serif" fontWeight="600">
        <textPath href={`#${id}`} startOffset="0">
          {`${label} · ${label} ·`}
        </textPath>
      </text>
      <text x="50" y="47" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="Cormorant Garamond, serif" fontStyle="italic">
        {sub}
      </text>
      <path d="M50 55 L51.2 58.8 L55 60 L51.2 61.2 L50 65 L48.8 61.2 L45 60 L48.8 58.8 Z" fill="currentColor" />
    </svg>
  );
}
