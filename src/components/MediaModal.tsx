import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MemoryItem } from "../data/memories";
import { music } from "../lib/music";

export interface Origin {
  cx: number;
  cy: number;
  w: number;
  rot: number;
}

interface Props {
  items: MemoryItem[];
  index: number | null;
  origin: Origin | null;
  aspectOf: (i: number) => number | undefined;
  onClose: () => void;
  onClosed: () => void;
  onNavigate: (dir: 1 | -1) => void;
}

function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return vp;
}

/**
 * The memory she picked, lifted out of the field and held in front of her.
 * The rest keep drifting behind a soft blur.
 */
export default function MediaModal({ items, index, origin, aspectOf, onClose, onClosed, onNavigate }: Props) {
  const vp = useViewport();
  const open = index !== null;
  const item = open ? items[index] : null;
  const figRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspect, setAspect] = useState<number>(1);

  useLayoutEffect(() => {
    if (index === null) return;
    setAspect(aspectOf(index) ?? (items[index].type === "video" ? 16 / 9 : 1));
  }, [index, aspectOf, items]);

  // Size: large enough to enjoy, never swallowing the whole screen.
  const narrow = vp.w < 640;
  const pad = narrow ? 10 : 16;
  const captionH = narrow ? 64 : 76;
  const maxW = Math.min(vp.w - (narrow ? 24 : 180), 960);
  const maxH = vp.h * (narrow ? 0.62 : 0.7) - captionH;
  const mediaW = Math.max(160, Math.min(maxW - pad * 2, maxH * aspect));
  const figW = mediaW + pad * 2;

  const variants: Variants = {
    from: (o: Origin | null) =>
      o
        ? { x: o.cx - vp.w / 2, y: o.cy - vp.h / 2, scale: o.w / figW, rotate: o.rot }
        : { opacity: 0, scale: 0.9, x: 0, y: 0, rotate: 0 },
    center: { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
  };

  const pauseVideo = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      music.duck(false);
    }
  };

  const close = () => {
    pauseVideo();
    onClose();
  };

  // Keyboard: Esc closes, arrows browse, Tab stays inside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight" && !(e.target instanceof HTMLVideoElement)) onNavigate(1);
      else if (e.key === "ArrowLeft" && !(e.target instanceof HTMLVideoElement)) onNavigate(-1);
      else if (e.key === "Tab" && figRef.current) {
        const f = [...figRef.current.querySelectorAll<HTMLElement>("button, video, [href]")].filter((el) => !el.hasAttribute("disabled"));
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return createPortal(
    <AnimatePresence custom={origin} onExitComplete={onClosed}>
      {open && item && (
        <div key="modal" className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-[#120d0a]/55 backdrop-blur-[7px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            onClick={close}
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <motion.figure
              ref={figRef}
              role="dialog"
              aria-modal="true"
              aria-label={item.caption}
              custom={origin}
              variants={variants}
              initial="from"
              animate="center"
              exit="from"
              transition={{ type: "spring", stiffness: 170, damping: 23, mass: 0.9 }}
              className="pointer-events-auto relative m-0 bg-[#f7f1e6] shadow-[0_40px_90px_-20px_rgba(0,0,0,0.7),0_10px_25px_rgba(0,0,0,0.35)]"
              style={{ width: figW, padding: pad, paddingBottom: 0 }}
            >
              <div className="relative overflow-hidden bg-[#1d1814]" style={{ aspectRatio: `${aspect}` }}>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.src}
                        alt={item.alt ?? item.caption}
                        decoding="async"
                        draggable={false}
                        onLoad={(e) => setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <ModalVideo item={item} videoRef={videoRef} onAspect={setAspect} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <figcaption className="flex items-center justify-between gap-3 px-1" style={{ height: captionH }}>
                <div className="min-w-0">
                  <p className="truncate font-script text-[clamp(1.6rem,4.5vw,2.2rem)] leading-tight text-ink-soft">{item.caption}</p>
                  {item.date && <p className="truncate text-[0.62rem] uppercase tracking-[0.26em] text-taupe">{item.date}</p>}
                </div>
                <p className="shrink-0 font-display text-sm italic tabular-nums text-taupe">
                  {index + 1} / {items.length}
                </p>
              </figcaption>

              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close memory"
                className="absolute -right-3 -top-3 grid h-11 w-11 place-items-center rounded-full bg-ink text-cream shadow-lift transition hover:bg-gold-deep sm:-right-4 sm:-top-4"
              >
                <X size={18} strokeWidth={1.6} />
              </button>

              {items.length > 1 && (
                <>
                  <NavButton dir={-1} onClick={() => onNavigate(-1)} narrow={narrow} />
                  <NavButton dir={1} onClick={() => onNavigate(1)} narrow={narrow} />
                </>
              )}
            </motion.figure>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function NavButton({ dir, onClick, narrow }: { dir: 1 | -1; onClick: () => void; narrow: boolean }) {
  const Icon = dir === 1 ? ChevronRight : ChevronLeft;
  const pos = narrow
    ? dir === 1
      ? "right-[calc(50%-3.25rem)] -bottom-16"
      : "left-[calc(50%-3.25rem)] -bottom-16"
    : dir === 1
      ? "-right-[4.5rem] top-1/2 -translate-y-1/2"
      : "-left-[4.5rem] top-1/2 -translate-y-1/2";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? "Next memory" : "Previous memory"}
      className={`absolute ${pos} grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-[#f6ead6] backdrop-blur-md transition hover:bg-white/20`}
    >
      <Icon size={20} strokeWidth={1.5} />
    </button>
  );
}

/** Plays with sound — she explicitly asked for it by tapping. */
function ModalVideo({ item, videoRef, onAspect }: { item: MemoryItem; videoRef: React.RefObject<HTMLVideoElement | null>; onAspect: (a: number) => void }) {
  const local = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = local.current;
    if (!v) return;
    videoRef.current = v;
    v.muted = false;
    v.play().catch((err: DOMException) => {
      // Only a real autoplay refusal falls back to muted playback (controls stay visible).
      // An AbortError just means this play() was superseded — e.g. by closing quickly.
      if (err.name !== "NotAllowedError" || local.current !== v) return;
      v.muted = true;
      v.play().catch(() => {});
    });
    return () => {
      v.pause();
      v.currentTime = 0;
      music.duck(false);
      if (videoRef.current === v) videoRef.current = null;
    };
  }, [item.src, videoRef]);

  return (
    <video
      ref={local}
      src={item.src}
      poster={item.poster}
      controls
      playsInline
      preload="auto"
      aria-label={item.alt ?? item.caption}
      onLoadedMetadata={(e) => e.currentTarget.videoWidth && onAspect(e.currentTarget.videoWidth / e.currentTarget.videoHeight)}
      onPlay={() => music.duck(true)}
      onPause={() => music.duck(false)}
      onEnded={() => music.duck(false)}
      className="h-full w-full bg-black object-contain"
    />
  );
}
