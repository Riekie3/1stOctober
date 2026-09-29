import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { MemoryItem } from "../data/memories";
import MediaModal, { type Origin } from "./MediaModal";

/* ─── Layout ─────────────────────────────────────────────── */

interface Placed {
  x: number;
  y: number;
  w: number;
  /** height / width of the floating frame's picture area */
  ratio: number;
  z: number;
  vars: Record<string, string>;
}

function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/**
 * Scatters memories into a loose, staggered field: one per cell, each with its
 * own size, tilt, drift path and speed — so it reads as organic, never as a grid.
 */
function layoutField(n: number, W: number) {
  const r = seeded(20261001);
  const narrow = W < 560;
  const cols = narrow ? 2 : W < 900 ? 3 : W < 1320 ? 4 : 5;
  const gutter = narrow ? 10 : 28;
  const cellW = (W - gutter * 2) / cols;
  const cellH = cellW * (narrow ? 1.28 : 1.02);
  const rows = Math.ceil(n / cols);
  const ratios = [1.2, 0.8, 1, 1.25, 0.75, 1.1];

  const placed: Placed[] = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    // Rotate the column order every row so neighbours don't line up.
    const col = (i + row * 2) % cols;
    const size = narrow ? 0.82 + r() * 0.14 : 0.6 + r() * 0.3;
    const w = cellW * size;
    const ratio = ratios[i % ratios.length];
    const h = w * ratio * 1.14; // frame is a bit taller than the picture
    const stagger = col % 2 ? cellH * 0.18 : 0;
    const x = gutter + col * cellW + (cellW - w) * (0.15 + r() * 0.7);
    const y = row * cellH + stagger + Math.max(0, cellH - h) * r() * 0.8;
    const amp = narrow ? 8 : 18;
    const d = () => `${((r() - 0.5) * 2 * amp).toFixed(1)}px`;
    const dur = 17 + r() * 12;
    placed.push({
      x,
      y,
      w,
      ratio,
      z: 1 + Math.floor(r() * 4),
      vars: {
        "--rot": `${((r() - 0.5) * 16).toFixed(1)}deg`,
        "--rj": `${(0.8 + r() * 1.6).toFixed(1)}deg`,
        "--dx1": d(),
        "--dy1": d(),
        "--dx2": d(),
        "--dy2": d(),
        "--dx3": d(),
        "--dy3": d(),
        "--dur": `${dur.toFixed(1)}s`,
        "--delay": `${(-r() * dur).toFixed(1)}s`,
      },
    });
  }
  const height = rows * cellH + cellH * 0.25;
  return { placed, height };
}

/* ─── Gallery ────────────────────────────────────────────── */

export default function MemoryGallery({ items }: { items: MemoryItem[] }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 1200 : window.innerWidth));
  const [selected, setSelected] = useState<number | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [hidden, setHidden] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const drifts = useRef<(HTMLDivElement | null)[]>([]);
  const aspects = useRef<Record<number, number>>({});

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { placed, height } = useMemo(() => layoutField(items.length, width), [items.length, width]);

  // Pause drifting memories that are scrolled out of view.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => ((e.target as HTMLElement).dataset.offscreen = String(!e.isIntersecting))),
      { rootMargin: "120px" },
    );
    drifts.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [placed]);

  const originOf = useCallback(
    (i: number): Origin => {
      const btn = buttons.current[i];
      const rot = parseFloat(placed[i]?.vars["--rot"] ?? "0");
      if (!btn) return { cx: window.innerWidth / 2, cy: window.innerHeight / 2, w: 200, rot: 0 };
      const r = btn.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: btn.offsetWidth, rot };
    },
    [placed],
  );

  const open = (i: number) => {
    setOrigin(originOf(i));
    setSelected(i);
    setHidden(i);
  };

  const go = (dir: 1 | -1) => {
    if (selected === null) return;
    const next = (selected + dir + items.length) % items.length;
    setOrigin(originOf(next));
    setSelected(next);
    setHidden(next);
  };

  const close = () => {
    if (selected === null) return;
    setOrigin(originOf(selected));
    setSelected(null);
  };

  return (
    <>
      <div ref={fieldRef} className="relative w-full overflow-x-clip" style={{ height }}>
        {items.map((m, i) => {
          const p = placed[i];
          if (!p) return null;
          return (
            <motion.div
              key={`${m.src}-${i}`}
              className="absolute"
              style={{ left: p.x, top: p.y, width: p.w, zIndex: hidden === i ? 20 : p.z }}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                ref={(el) => {
                  drifts.current[i] = el;
                }}
                className="memory-drift"
                data-paused={hidden === i}
                style={p.vars as React.CSSProperties}
              >
                <motion.button
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  type="button"
                  onClick={() => open(i)}
                  aria-label={`${m.type === "video" ? "Play video" : "Open photo"}: ${m.caption}`}
                  aria-haspopup="dialog"
                  className="group block w-full cursor-zoom-in bg-[#f7f1e6] p-[5%] pb-[4%] text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55),0_4px_10px_rgba(0,0,0,0.25)] outline-offset-4"
                  style={{ visibility: hidden === i ? "hidden" : "visible" }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <span className="relative block w-full overflow-hidden bg-[#2a221c]" style={{ aspectRatio: `1 / ${p.ratio}` }}>
                    {m.type === "image" ? (
                      <img
                        src={m.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        onLoad={(e) => (aspects.current[i] = e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
                        className="h-full w-full object-cover transition-[filter] duration-700 [filter:sepia(0.12)_saturate(0.95)] group-hover:[filter:none]"
                      />
                    ) : (
                      <VideoThumb item={m} onAspect={(a) => (aspects.current[i] = a)} />
                    )}
                    <span aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.18)]" />
                  </span>
                  <span className="mt-[4%] block truncate text-center font-script text-[clamp(1rem,2.6vw,1.45rem)] leading-tight text-ink-soft">
                    {m.caption}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <MediaModal
        items={items}
        index={selected}
        origin={origin}
        aspectOf={(i) => aspects.current[i]}
        onClose={close}
        onNavigate={go}
        onClosed={() => {
          const i = hidden;
          setHidden(null);
          // wait for the frame to become visible again before handing focus back
          if (i !== null) window.setTimeout(() => buttons.current[i]?.focus({ preventScroll: true }), 30);
        }}
      />
    </>
  );
}

/** A lazy, silent first frame (or poster) for a floating video. */
function VideoThumb({ item, onAspect }: { item: MemoryItem; onAspect: (a: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);
  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <span ref={ref} className="block h-full w-full">
      {item.poster ? (
        <img src={item.poster} alt="" loading="lazy" decoding="async" draggable={false} className="h-full w-full object-cover" />
      ) : (
        near && (
          <video
            src={`${item.src}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth) onAspect(v.videoWidth / v.videoHeight);
              const s = Math.round(v.duration);
              if (Number.isFinite(s)) setDuration(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
            }}
            className="pointer-events-none h-full w-full object-cover"
          />
        )
      )}
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
          <Play size={16} fill="currentColor" className="ml-0.5" aria-hidden />
        </span>
      </span>
      {duration && <span className="absolute bottom-1.5 right-2 text-[10px] font-medium tabular-nums text-white/85">{duration}</span>}
    </span>
  );
}
