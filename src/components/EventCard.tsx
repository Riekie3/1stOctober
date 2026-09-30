import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Car,
  Check,
  Coffee,
  Fish,
  Gift,
  Lock,
  LockOpen,
  MapPin,
  Moon,
  Snowflake,
  Sparkles,
  Sunset,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";
import type { ItineraryIcon } from "../data/itinerary";
import { formatClock, formatTime, type ScheduledStop, type StopPhase } from "../lib/schedule";
import Countdown from "./Countdown";
import { Burst, Stamp } from "./Ornaments";

export const itineraryIcons: Record<ItineraryIcon, LucideIcon> = {
  car: Car,
  food: Utensils,
  coffee: Coffee,
  activity: Sparkles,
  sea: Fish,
  snow: Snowflake,
  rest: Moon,
  evening: Sunset,
  dinner: Wine,
  gift: Gift,
  camera: Camera,
};

const silk = [0.22, 1, 0.36, 1] as const;

export interface EventCardProps {
  stop: ScheduledStop;
  phase: StopPhase;
  now: number;
  isNext: boolean;
  /** play the unlock ceremony (first time she sees it revealed) */
  celebrate: boolean;
  onCelebrated: () => void;
  /** 0–1 how much of the rail below this stop is filled */
  railFill: number;
  isLast: boolean;
}

export default function EventCard({ stop, phase, now, isNext, celebrate, onCelebrated, railFill, isLast }: EventCardProps) {
  const locked = phase === "locked";
  const { clock, suffix } = formatTime(stop.time);
  const Icon = itineraryIcons[stop.icon] ?? Sparkles;
  const stampLabel = stop.alwaysVisible ? "DEPARTURE" : phase === "done" ? "VISITED" : "REVEALED";
  const rotation = ((stop.id * 37) % 26) - 13;

  return (
    <li className="grid grid-cols-[3.9rem_1.75rem_minmax(0,1fr)] gap-x-2 sm:grid-cols-[6.5rem_2.5rem_minmax(0,1fr)] sm:gap-x-4">
      {/* Time */}
      <div className="pt-4 text-right sm:pt-5">
        <p className={`display text-[1.65rem] sm:text-[2.35rem] ${locked ? "text-ink/80" : "text-ink"}`}>{clock}</p>
        <p className="eyebrow mt-1 !text-[0.6rem] !tracking-[0.3em]">{suffix}</p>
      </div>

      {/* Node + rail */}
      <div className="relative flex justify-center">
        {!isLast && (
          <div aria-hidden className="absolute bottom-[-1.75rem] top-[2.35rem] w-px bg-champagne/60 sm:top-[2.85rem]">
            <motion.div
              className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-gold to-gold-soft"
              initial={false}
              animate={{ scaleY: railFill }}
              transition={{ duration: 1.2, ease: silk }}
            />
          </div>
        )}
        <Node phase={phase} celebrate={celebrate} />
      </div>

      {/* Card */}
      <motion.article
        aria-label={locked ? `${clock} ${suffix}, secret stop, unlocks at ${formatClock(stop.unlockAt)}` : `${clock} ${suffix}, ${stop.title}`}
        className={`relative mb-7 overflow-visible rounded-[1.1rem] border sm:mb-9 ${
          locked ? "border-gold/15 bg-cream/55" : "paper border-gold/25 shadow-paper"
        } ${phase === "now" ? "ring-1 ring-gold/50" : ""}`}
        initial={false}
        animate={
          celebrate
            ? { boxShadow: ["0 0 0 0 rgba(205,176,125,0)", "0 0 0 10px rgba(205,176,125,0.28)", "0 0 0 0 rgba(205,176,125,0)"] }
            : undefined
        }
        transition={{ duration: 1.6, delay: 0.4 }}
      >
        <div className="relative min-h-[8.5rem] px-4 py-4 sm:px-7 sm:py-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {locked ? (
              <motion.div
                key="locked"
                exit={{ opacity: 0, filter: "blur(10px)", scale: 0.98, transition: { duration: 0.6 } }}
              >
                <LockedContent stop={stop} now={now} />
              </motion.div>
            ) : (
              <motion.div key="open" className="relative">
                <RevealedContent stop={stop} phase={phase} now={now} isNext={isNext} Icon={Icon} celebrate={celebrate} onCelebrated={onCelebrated} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Passport stamp */}
        {!locked && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-2 -top-4 h-[4.2rem] w-[4.2rem] stamp-ink text-gold-deep mix-blend-multiply sm:-right-4 sm:-top-5 sm:h-[5.4rem] sm:w-[5.4rem]"
            initial={celebrate ? { opacity: 0, scale: 1.9 } : false}
            animate={{ opacity: phase === "done" ? 0.34 : 0.5, scale: 1 }}
            transition={{ delay: celebrate ? 1.05 : 0, type: "spring", stiffness: 420, damping: 16 }}
          >
            <Stamp label={stampLabel} sub="01·10" rotate={rotation} className="h-full w-full" />
          </motion.div>
        )}

        {celebrate && <Burst count={16} radius={90} />}
      </motion.article>
    </li>
  );
}

function Node({ phase, celebrate }: { phase: StopPhase; celebrate: boolean }) {
  const base = "relative z-[1] mt-5 grid h-7 w-7 place-items-center rounded-full border transition-colors duration-700 sm:mt-6 sm:h-9 sm:w-9";
  return (
    <motion.div
      className={`${base} ${
        phase === "locked"
          ? "border-dashed border-gold/45 bg-ivory text-gold/70"
          : phase === "done"
            ? "border-gold bg-gold text-cream"
            : phase === "now"
              ? "border-gold bg-ink text-cream"
              : "border-gold bg-cream text-gold-deep"
      }`}
      initial={false}
      animate={celebrate ? { scale: [1, 1.35, 1] } : { scale: 1 }}
      transition={{ duration: 0.9, delay: 0.5 }}
    >
      {phase === "now" && (
        <span aria-hidden className="absolute inset-0 rounded-full border border-gold" style={{ animation: "pulse-ring 2s ease-out infinite" }} />
      )}
      {phase === "locked" ? (
        <Lock size={12} strokeWidth={1.8} />
      ) : phase === "done" ? (
        <Check size={13} strokeWidth={2.2} />
      ) : (
        <span className="block h-2 w-2 rounded-full bg-current" />
      )}
    </motion.div>
  );
}

function LockedContent({ stop, now }: { stop: ScheduledStop; now: number }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="eyebrow flex items-center gap-2 !text-[0.62rem]">
          <Lock size={11} strokeWidth={2} aria-hidden /> Sealed surprise
        </p>
        <p className="text-[0.72rem] text-taupe">Opens at {formatClock(stop.unlockAt)}</p>
      </div>

      <div aria-hidden className="mt-4 space-y-2.5">
        <span className="redacted" style={{ width: "58%", height: "1.2rem" }} />
        <span className="redacted" style={{ width: "34%", animationDelay: "0.3s" }} />
        <span className="redacted" style={{ width: "78%", animationDelay: "0.6s" }} />
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm text-taupe">
          Reveals in{" "}
          <Countdown target={stop.unlockAt} now={now} className="display text-[1.35rem] font-medium italic text-gold-deep" />
        </p>
        {stop.clue && <p className="font-display text-[1.05rem] italic text-ink-soft">Clue: {stop.clue}</p>}
      </div>
    </div>
  );
}

function RevealedContent({
  stop,
  phase,
  now,
  isNext,
  Icon,
  celebrate,
  onCelebrated,
}: {
  stop: ScheduledStop;
  phase: StopPhase;
  now: number;
  isNext: boolean;
  Icon: LucideIcon;
  celebrate: boolean;
  onCelebrated: () => void;
}) {
  const hidden = { opacity: 0, y: 10, filter: "blur(10px)" };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
  const item = (i: number) => ({
    initial: celebrate ? hidden : false,
    animate: shown,
    transition: { duration: 0.9, delay: celebrate ? 0.45 + i * 0.14 : 0, ease: silk },
  });

  return (
    <div className="relative">
      {/* The lock opening */}
      {celebrate && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -ml-6 -mt-6 grid h-12 w-12 place-items-center rounded-full bg-cream text-gold-deep shadow-paper"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.6, rotate: -8 }}
          transition={{ duration: 0.9, delay: 0.25, ease: silk }}
          onAnimationComplete={onCelebrated}
        >
          <LockOpen size={20} strokeWidth={1.6} />
        </motion.div>
      )}

      <motion.div {...item(0)} className="flex flex-wrap items-center gap-x-3 gap-y-2 pr-12 sm:pr-16">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-ivory text-gold-deep">
          <Icon size={16} strokeWidth={1.6} aria-hidden />
        </span>
        <StatusChip stop={stop} phase={phase} now={now} isNext={isNext} />
      </motion.div>

      <motion.h3 {...item(1)} className="display mt-3 text-[1.7rem] font-medium sm:text-[2.1rem]">
        {stop.title}
      </motion.h3>

      {stop.location && (
        <motion.p {...item(2)} className="mt-1 flex items-center gap-1.5 text-[0.8rem] uppercase tracking-[0.16em] text-gold-deep">
          <MapPin size={13} strokeWidth={1.8} aria-hidden /> {stop.location}
        </motion.p>
      )}

      <motion.p {...item(3)} className="mt-2.5 max-w-prose font-display text-[1.15rem] italic leading-snug text-ink-soft sm:text-[1.25rem]">
        {stop.description}
      </motion.p>
    </div>
  );
}

function StatusChip({ stop, phase, now, isNext }: { stop: ScheduledStop; phase: StopPhase; now: number; isNext: boolean }) {
  const chip = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.66rem] font-medium uppercase tracking-[0.18em]";
  if (phase === "now")
    return (
      <span className={`${chip} bg-ink text-cream`}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-gold-soft" style={{ animation: "pulse-ring 1.6s ease-out infinite" }} />
          <span className="relative h-1.5 w-1.5 rounded-full bg-gold-soft" />
        </span>
        Happening now
      </span>
    );
  if (phase === "done")
    return (
      <span className={`${chip} bg-gold/10 text-gold-deep`}>
        <Check size={11} strokeWidth={2.4} aria-hidden /> Visited
      </span>
    );
  return (
    <span className={`${chip} ${isNext ? "bg-gold text-cream" : "bg-gold/10 text-gold-deep"}`}>
      {isNext ? "Up next" : "Revealed"} · in <Countdown target={stop.start} now={now} />
    </span>
  );
}
