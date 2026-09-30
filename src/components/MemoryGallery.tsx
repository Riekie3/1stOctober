import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { MemoryItem } from "../data/memories";
import MediaModal, { LiveIcon, type Origin } from "./MediaModal";

/* ─── Layout: lanes of memories flying right → left ─────── */

interface Flight {
  lane: number;
  /** vertical centre of the item, px from the top of the sky */
  top: number;
  /** frame width */
  w: number;
  /** CSS variables driving the flight + the gentle bob */
  vars: Record<string, string>;
}

function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/**
 * Splits the memories into horizontal lanes. Every item in a lane travels the
 * same loop at the same speed, evenly spaced, so they never bump into each
 * other; each lane has its own size and speed so the sky feels layered.
 */
function planFlights(n: number, W: number, H: number) {
  const r = seeded(20261001);
  const narrow = W < 640;
  const pad = 28; // room for bob, tilt and hover lift inside the fade mask
  const inner = Math.max(200, H - pad * 2);
  const lanes = Math.max(2, Math.min(4, Math.round(inner / (narrow ? 240 : 250))));
  const laneH = inner / lanes;
  // The tallest frame (a portrait photo + caption) is ~1.5× its width.
  const baseW = Math.min(narrow ? 150 : 240, (laneH * 0.86) / 1.5);
  const laneScale = [1, 0.84, 0.94, 0.8];
  const laneSpeed = [1, 0.82, 1.14, 0.9]; // relative
  const pxPerSec = narrow ? 20 : 30; // "slowly enough"
  const gap = narrow ? 34 : 72;

  const perLane: number[][] = Array.from({ length: lanes }, () => []);
  for (let i = 0; i < n; i++) perLane[i % lanes].push(i);

  const flights: Flight[] = new Array(n);
  perLane.forEach((ids, lane) => {
    const w = baseW * laneScale[lane % laneScale.length];
    const speed = pxPerSec * laneSpeed[lane % laneSpeed.length];
    // Loop length: long enough that every item leaves the screen before it re-enters.
    const track = Math.max(W + w + 60, ids.length * (w + gap));
    const dur = track / speed;
    const laneShift = r() * dur;
    ids.forEach((id, j) => {
      const from = W + 20;
      flights[id] = {
        lane,
        top: pad + laneH * (lane + 0.5) + (r() - 0.5) * laneH * 0.1,
        w,
        vars: {
          "--from": `${from}px`,
          "--to": `${from - track}px`,
          "--fly-dur": `${dur.toFixed(1)}s`,
          "--fly-delay": `${(-((j / ids.length) * dur + laneShift)).toFixed(1)}s`,
          // bob / tilt (memory-drift)
          "--rot": `${((r() - 0.5) * 10).toFixed(1)}deg`,
          "--rj": `${(0.8 + r() * 1.4).toFixed(1)}deg`,
          "--dx1": "0px",
          "--dx2": "0px",
          "--dx3": "0px",
          "--dy1": `${((r() - 0.5) * 16).toFixed(1)}px`,
          "--dy2": `${((r() - 0.5) * 16).toFixed(1)}px`,
          "--dy3": `${((r() - 0.5) * 16).toFixed(1)}px`,
          "--dur": `${(9 + r() * 7).toFixed(1)}s`,
          "--delay": `${(-r() * 12).toFixed(1)}s`,
        },
      };
    });
  });
  return flights;
}

/* ─── Gallery ────────────────────────────────────────────── */

export default function MemoryGallery({ items }: { items: MemoryItem[] }) {
  const skyRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() => ({
    w: typeof window === "undefined" ? 1200 : window.innerWidth,
    h: typeof window === "undefined" ? 600 : Math.max(380, window.innerHeight - 260),
  }));
  const [selected, setSelected] = useState<number | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [held, setHeld] = useState<number | null>(null);
  /** picture height / width per item, learned when each photo loads */
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const aspects = useRef<Record<number, number>>({});
  // Only hand focus back after a keyboard close — after a tap/click the memory should just fly on.
  const usingKeyboard = useRef(false);
  useEffect(() => {
    const key = () => (usingKeyboard.current = true);
    const pointer = () => (usingKeyboard.current = false);
    window.addEventListener("keydown", key, true);
    window.addEventListener("pointerdown", pointer, true);
    return () => {
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("pointerdown", pointer, true);
    };
  }, []);

  useEffect(() => {
    const el = skyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (Math.abs(s.w - width) > 2 || Math.abs(s.h - height) > 2 ? { w: Math.round(width), h: Math.round(height) } : s));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const flights = useMemo(() => planFlights(items.length, size.w, size.h), [items.length, size.w, size.h]);

  const learnShape = (i: number, w: number, h: number) => {
    if (!w || !h) return;
    aspects.current[i] = w / h;
    const ratio = Math.min(1.45, Math.max(0.7, h / w));
    setRatios((prev) => (prev[i] === ratio ? prev : { ...prev, [i]: ratio }));
  };

  /** Where the item is right now — or null if it has flown off-screen. */
  const originOf = useCallback(
    (i: number): Origin | null => {
      const btn = buttons.current[i];
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      if (r.right < 0 || r.left > window.innerWidth || r.bottom < 0 || r.top > window.innerHeight) return null;
      const rot = parseFloat(flights[i]?.vars["--rot"] ?? "0");
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: btn.offsetWidth, rot };
    },
    [flights],
  );

  const open = (i: number) => {
    setOrigin(originOf(i));
    setSelected(i);
    setHeld(i);
  };

  const go = (dir: 1 | -1) => {
    if (selected === null) return;
    const next = (selected + dir + items.length) % items.length;
    setOrigin(originOf(next));
    setSelected(next);
    setHeld(next);
  };

  const close = () => {
    if (selected === null) return;
    // The held item hasn't moved, so it shrinks straight back into its place.
    setOrigin(originOf(selected));
    setSelected(null);
  };

  return (
    <>
      <motion.div
        ref={skyRef}
        className="memory-sky relative w-full overflow-x-clip"
        style={{ height: "clamp(24rem, calc(100svh - 15rem), 52rem)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.3 }}
      >
        {items.map((m, i) => {
          const f = flights[i];
          if (!f) return null;
          const paused = held === i;
          const ratio = ratios[i] ?? 1.25;
          return (
            <div key={`${m.src}-${i}`} className="absolute left-0" style={{ top: f.top, width: f.w, zIndex: paused ? 20 : 4 - f.lane }}>
              <div className="memory-fly" data-paused={paused} style={f.vars as React.CSSProperties}>
                <div style={{ translate: "0 -50%" }}>
                  <div className="memory-drift" data-paused={paused} style={f.vars as React.CSSProperties}>
                    <motion.button
                      ref={(el) => {
                        buttons.current[i] = el;
                      }}
                      type="button"
                      onClick={() => open(i)}
                      aria-label={`${m.type === "video" ? "Play video" : m.live ? "Open live photo" : "Open photo"}: ${m.caption}`}
                      aria-haspopup="dialog"
                      className="group block w-full cursor-zoom-in bg-[#f7f1e6] p-[5%] pb-[4%] text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55),0_4px_10px_rgba(0,0,0,0.25)] outline-offset-4"
                      style={{ visibility: paused ? "hidden" : "visible" }}
                      whileHover={{ scale: 1.06, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <span className="relative block w-full overflow-hidden bg-[#2a221c]" style={{ aspectRatio: `1 / ${ratio}` }}>
                        {m.type === "image" ? (
                          <img
                            src={m.src}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            onLoad={(e) => learnShape(i, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                            className="h-full w-full object-cover transition-[filter] duration-700 [filter:sepia(0.12)_saturate(0.95)] group-hover:[filter:none]"
                          />
                        ) : (
                          <VideoThumb item={m} onShape={(w, h) => learnShape(i, w, h)} />
                        )}
                        {m.live && (
                          <span aria-hidden className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm">
                            <LiveIcon size={12} />
                          </span>
                        )}
                        <span aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.18)]" />
                      </span>
                      <span className="mt-[4%] block truncate text-center font-script text-[clamp(0.95rem,2.4vw,1.35rem)] leading-tight text-ink-soft">
                        {m.caption}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>

      <MediaModal
        items={items}
        index={selected}
        origin={origin}
        aspectOf={(i) => aspects.current[i]}
        onClose={close}
        onNavigate={go}
        onClosed={() => {
          const i = held;
          setHeld(null); // back into the flow — it resumes flying from where it stopped
          if (i !== null && usingKeyboard.current) window.setTimeout(() => buttons.current[i]?.focus({ preventScroll: true }), 30);
          else (document.activeElement as HTMLElement | null)?.blur?.();
        }}
      />
    </>
  );
}

/** A lazy, silent first frame (or poster) for a flying video. */
function VideoThumb({ item, onShape }: { item: MemoryItem; onShape: (w: number, h: number) => void }) {
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
        <img
          src={item.poster}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={(e) => onShape(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
          className="h-full w-full object-cover"
        />
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
              onShape(v.videoWidth, v.videoHeight);
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
