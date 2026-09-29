import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, SlidersHorizontal, Volume2, VolumeX, X } from "lucide-react";
import { birthdayConfig } from "../config/birthday";
import { music, useMusic } from "../lib/music";

/**
 * Floating record player. The <audio> itself lives in lib/music.ts,
 * so this component can come and go without interrupting the song.
 */
export default function MusicPlayer({ dark = false }: { dark?: boolean }) {
  const { playing, muted, volume, error, blocked } = useMusic();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { title, artist } = birthdayConfig.music;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // Missing song: stay out of her way in production, leave a hint while developing.
  if (error && !import.meta.env.DEV) return null;

  const surface = dark
    ? "border-white/12 bg-[#2a221c]/70 text-[#f3e6cf]"
    : "border-gold/25 bg-cream/75 text-ink";

  return (
    <div
      ref={panelRef}
      // Tells lib/music.ts that taps here are handled by the player itself.
      data-music-player
      className="fixed right-4 z-40 flex flex-col items-end gap-2 sm:right-6"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id="music-panel"
            role="dialog"
            aria-label="Music controls"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={`w-[min(17rem,calc(100vw-2rem))] origin-bottom-right rounded-2xl border p-4 shadow-lift backdrop-blur-xl ${surface}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow !text-[0.6rem] !tracking-[0.28em] opacity-80" style={dark ? { color: "#d8bf8f" } : undefined}>
                  Our song
                </p>
                <p className="display mt-1 truncate text-2xl italic">{title}</p>
                <p className="truncate text-xs opacity-70">{artist}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close music controls"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full opacity-70 transition hover:opacity-100"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-rose/10 px-3 py-2 text-xs leading-snug">
                Song file not found. Put it at <code className="font-mono">public{birthdayConfig.music.src}</code>
              </p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => music.toggle()}
                aria-label={playing ? "Pause music" : "Play music"}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream transition hover:bg-gold-deep"
              >
                {playing ? <Pause size={16} strokeWidth={1.8} /> : <Play size={16} strokeWidth={1.8} className="ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => music.toggleMute()}
                aria-label={muted ? "Unmute music" : "Mute music"}
                aria-pressed={muted}
                className="grid h-11 w-9 shrink-0 place-items-center rounded-full opacity-80 transition hover:opacity-100"
              >
                {muted || volume === 0 ? <VolumeX size={18} strokeWidth={1.6} /> : <Volume2 size={18} strokeWidth={1.6} />}
              </button>
              <label className="sr-only" htmlFor="music-volume">
                Volume
              </label>
              <input
                id="music-volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => music.setVolume(Number(e.target.value))}
                className="range w-full"
                style={{ ["--fill" as string]: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Only shown if the browser is holding the sound until her first tap. */}
      <AnimatePresence>
        {blocked && !playing && !open && (
          <motion.button
            type="button"
            onClick={() => music.start()}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.2, duration: 0.8 } }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.3 } }}
            className={`rounded-full border px-3 py-1.5 font-display text-[0.95rem] italic shadow-paper backdrop-blur-xl ${surface}`}
          >
            Tap anywhere to play our song
          </motion.button>
        )}
      </AnimatePresence>

      <div className={`flex items-center gap-1 rounded-full border p-1 shadow-paper backdrop-blur-xl ${surface}`}>
        <button
          type="button"
          onClick={() => music.toggle()}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          className="relative grid h-11 w-11 place-items-center rounded-full"
        >
          <Vinyl spinning={playing} />
          {blocked && !playing && (
            <span aria-hidden className="absolute inset-0 rounded-full border border-gold/60" style={{ animation: "pulse-ring 2.4s ease-out infinite" }} />
          )}
        </button>

        <div className="hidden min-w-0 items-center gap-2 pl-1 pr-1 sm:flex" aria-hidden>
          <Equalizer active={playing} />
          <span className="max-w-[9rem] truncate font-display text-[0.95rem] italic leading-none">
            {title}
            <span className="ml-1.5 font-sans text-[0.6rem] not-italic uppercase tracking-[0.2em] opacity-60">{artist}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Music settings"
          aria-expanded={open}
          aria-controls="music-panel"
          className="grid h-11 w-10 place-items-center rounded-full opacity-70 transition hover:opacity-100"
        >
          <SlidersHorizontal size={16} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}

function Vinyl({ spinning }: { spinning: boolean }) {
  return (
    <span
      aria-hidden
      className="animate-spin-slow relative block h-10 w-10 rounded-full"
      style={{
        animationDuration: "5s",
        animationPlayState: spinning ? "running" : "paused",
        background:
          "radial-gradient(circle at 50% 50%, #cdb07d 0 17%, #2a2521 18% 21%, transparent 22%), repeating-radial-gradient(circle at 50% 50%, #2a2521 0 1px, #3a332d 1.5px 2.5px), #2a2521",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.25)",
      }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: "conic-gradient(from 30deg, transparent 0 20%, rgba(255,255,255,0.14) 25%, transparent 32% 70%, rgba(255,255,255,0.08) 75%, transparent 80%)" }}
      />
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
    </span>
  );
}

function Equalizer({ active }: { active: boolean }) {
  return (
    <span className="flex h-3.5 items-end gap-[2px]">
      {[0, 0.2, 0.4, 0.1].map((d, i) => (
        <span
          key={i}
          className="eq-bar block w-[2px] rounded-full bg-gold"
          style={{
            height: "100%",
            animationDelay: `${d}s`,
            animationDuration: `${0.8 + i * 0.15}s`,
            animationPlayState: active ? "running" : "paused",
            transform: active ? undefined : "scaleY(0.3)",
          }}
        />
      ))}
    </span>
  );
}
