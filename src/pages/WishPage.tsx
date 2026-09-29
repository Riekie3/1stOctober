import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "../lib/motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { birthdayConfig } from "../config/birthday";
import { letter } from "../data/letter";
import PageTransition from "../components/PageTransition";
import { Rule, Sprig } from "../components/Ornaments";

const silk = [0.22, 1, 0.36, 1] as const;
type Stage = "sealed" | "opening" | "open";

export default function WishPage() {
  const reduce = usePrefersReducedMotion();
  // Always arrives folded in its envelope; she opens it herself.
  const [stage, setStage] = useState<Stage>("sealed");
  const timers = useRef<number[]>([]);
  const letterRef = useRef<HTMLElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (stage !== "sealed") return;
    setStage("opening");
    // With "reduce motion" on, skip the long flap/slide sequence.
    timers.current.push(window.setTimeout(() => setStage("open"), reduce ? 500 : 2100));
  };

  useEffect(() => {
    if (stage === "open") letterRef.current?.focus({ preventScroll: true });
  }, [stage]);

  return (
    <PageTransition kind="paper" label="A Little Wish — a letter">
      <div className="mx-auto w-full max-w-4xl px-4 pb-32 pt-24 sm:px-8 sm:pt-28">
        <header className="text-center">
          <p className="eyebrow">{birthdayConfig.menu.cards.wish.title}</p>
          <h1 className="display mx-auto mt-4 max-w-2xl text-[clamp(2.3rem,7.5vw,4.4rem)]">{letter.title}</h1>
          <Rule className="mt-6" width="4rem" />
        </header>

        <div className="relative mt-12 sm:mt-16">
          <AnimatePresence mode="wait">
            {stage !== "open" ? (
              <motion.div
                key="envelope"
                exit={{ opacity: 0, y: 60, scale: 0.94, transition: { duration: 0.6, ease: silk } }}
                className="flex flex-col items-center"
              >
                <Envelope opening={stage === "opening"} onOpen={open} />
                <motion.p
                  className="mt-8 text-[0.7rem] uppercase tracking-[0.3em] text-taupe"
                  animate={{ opacity: stage === "opening" ? 0 : 1 }}
                >
                  Tap the seal to open
                </motion.p>
              </motion.div>
            ) : (
              <motion.div key="letter" initial={{ opacity: 0, y: -40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, ease: silk }}>
                <Letter ref={letterRef} />
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStage("sealed");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex h-12 items-center gap-2 rounded-full border border-gold/35 px-6 text-[0.72rem] uppercase tracking-[0.24em] text-ink-soft transition hover:border-gold hover:bg-cream"
                  >
                    <RotateCcw size={14} strokeWidth={1.6} aria-hidden /> Fold it back up
                  </button>
                  <Link
                    to="/memories"
                    className="group flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[0.72rem] uppercase tracking-[0.24em] text-cream shadow-paper transition hover:bg-gold-deep"
                  >
                    {birthdayConfig.menu.cards.memories.title}
                    <ArrowRight size={15} strokeWidth={1.6} aria-hidden className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}

/* ─── The envelope ───────────────────────────────────────── */

function Envelope({ opening, onOpen }: { opening: boolean; onOpen: () => void }) {
  const initial = birthdayConfig.girlfriendName.trim().charAt(0).toUpperCase() || "✦";
  const [flapBehind, setFlapBehind] = useState(false);

  useEffect(() => {
    if (!opening) return setFlapBehind(false);
    const t = window.setTimeout(() => setFlapBehind(true), 750);
    return () => clearTimeout(t);
  }, [opening]);

  return (
    <motion.div
      className="relative aspect-[3/2] w-[min(32rem,90vw)] [perspective:1100px]"
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      animate={{ opacity: 1, y: opening ? 60 : 0, rotate: opening ? 0 : -2 }}
      transition={{ duration: opening ? 1.2 : 1, delay: opening ? 0.9 : 0.3, ease: silk }}
    >
      {/* back */}
      <div className="absolute inset-0 rounded-[6px] bg-[#ecdfcd] shadow-lift" />

      {/* letter inside */}
      <motion.div
        className="paper absolute inset-x-[6%] top-[6%] h-[88%] rounded-[3px] px-[8%] pt-[7%] shadow-sm"
        style={{ zIndex: 2 }}
        initial={false}
        animate={{ y: opening ? "-58%" : "0%" }}
        transition={{ duration: 1.1, delay: opening ? 0.95 : 0, ease: silk }}
      >
        <p className="font-script text-[clamp(1.6rem,6vw,2.4rem)] leading-none text-gold-deep">{letter.salutation}</p>
        <div className="mt-4 space-y-2.5">
          {[92, 100, 84, 96, 60].map((w, i) => (
            <span key={i} className="block h-px bg-champagne" style={{ width: `${w}%` }} />
          ))}
        </div>
      </motion.div>

      {/* front pocket */}
      <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }} aria-hidden>
        <defs>
          <linearGradient id="pocket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6ede1" />
            <stop offset="1" stopColor="#efe2d0" />
          </linearGradient>
        </defs>
        <path d="M0 0 L150 128 L300 0 V200 H0 Z" fill="url(#pocket)" />
        <path d="M0 0 L150 128 L300 0" fill="none" stroke="#d9c6ad" strokeWidth="0.8" />
        <path d="M0 200 L128 116 M300 200 L172 116" fill="none" stroke="#e1cfb6" strokeWidth="0.8" />
      </svg>
      <p
        className="pointer-events-none absolute inset-x-0 bottom-[6%] text-center font-script text-[clamp(1.5rem,5vw,2.2rem)] leading-none text-ink-soft"
        style={{ zIndex: 4 }}
      >
        For {birthdayConfig.girlfriendName}
      </p>

      {/* flap */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[64%] origin-top"
        style={{ zIndex: flapBehind ? 1 : 5, transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateX: opening ? 180 : 0 }}
        transition={{ duration: 1, delay: opening ? 0.35 : 0, ease: [0.65, 0, 0.35, 1] }}
      >
        <svg viewBox="0 0 300 128" preserveAspectRatio="none" className="h-full w-full drop-shadow-[0_4px_6px_rgba(90,60,30,0.12)]" aria-hidden>
          <path d="M0 0 H300 L150 128 Z" fill="#f1e5d5" stroke="#d9c6ad" strokeWidth="0.8" />
        </svg>
      </motion.div>

      {/* wax seal = the button */}
      <motion.button
        type="button"
        onClick={onOpen}
        disabled={opening}
        aria-label={`Open the letter — ${letter.envelopeLabel}`}
        className="absolute left-1/2 top-[64%] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-cream sm:h-[4.5rem] sm:w-[4.5rem]"
        style={{
          zIndex: 6,
          background: "radial-gradient(circle at 35% 30%, #c9a07f 0%, #a8745f 55%, #8a5a49 100%)",
          boxShadow: "0 6px 14px rgba(90,50,30,0.35), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 2px 3px rgba(255,255,255,0.25)",
        }}
        whileHover={{ scale: 1.06, rotate: -4 }}
        whileTap={{ scale: 0.94 }}
        animate={opening ? { scale: [1, 1.15, 0], opacity: [1, 1, 0], rotate: 20 } : { scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.55, ease: silk }}
      >
        <span aria-hidden className="absolute inset-[5px] rounded-full border border-white/25" />
        <span className="display text-[1.8rem] italic leading-none">{initial}</span>
      </motion.button>
    </motion.div>
  );
}

/* ─── The letter ─────────────────────────────────────────── */

function Letter({ ref }: { ref: React.Ref<HTMLElement> }) {
  const date = new Date(`${birthdayConfig.birthdayDate}T00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <article
      ref={ref}
      tabIndex={-1}
      aria-label="Letter"
      className="paper relative mx-auto max-w-2xl rounded-[4px] px-6 pb-14 pt-12 shadow-lift outline-none sm:px-16 sm:pb-20 sm:pt-16"
    >
      {/* fold creases */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[rgba(120,90,50,0.10)] to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-gradient-to-r from-transparent via-[rgba(120,90,50,0.10)] to-transparent" />
      <Sprig className="pointer-events-none absolute -left-3 -top-6 h-32 w-20 -rotate-12 text-gold/55 sm:-left-8 sm:h-40 sm:w-24" />

      <p className="text-right text-[0.68rem] uppercase tracking-[0.28em] text-taupe">{date}</p>

      <Handwritten className="mt-8 text-[clamp(2.3rem,8vw,3.3rem)] text-gold-deep" delay={0.4}>
        {letter.salutation}
      </Handwritten>

      <div className="mt-6 space-y-5 font-display text-[1.2rem] leading-[1.75] text-ink-soft sm:text-[1.34rem]">
        {letter.paragraphs.map((p, i) => (
          <motion.p
            key={i}
            className="whitespace-pre-line"
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1, delay: i < 2 ? 1 + i * 0.35 : 0.1, ease: silk }}
          >
            {p}
          </motion.p>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-end gap-1 text-right">
        <Handwritten className="text-[clamp(2rem,7vw,2.7rem)] text-ink-soft" inView>
          {letter.closing}
        </Handwritten>
        <Handwritten className="-mt-1 text-[clamp(2.6rem,9vw,3.6rem)] text-gold-deep" inView delay={0.9}>
          {birthdayConfig.boyfriendName}
        </Handwritten>
        <span aria-hidden className="mt-1 h-px w-28 bg-gradient-to-l from-gold/60 to-transparent" />
      </div>
    </article>
  );
}

/** Script text that appears as if being written, left to right. */
function Handwritten({ children, className = "", delay = 0.2, inView = false }: { children: string; className?: string; delay?: number; inView?: boolean }) {
  const hidden = { clipPath: "inset(-20% 100% -20% 0)", opacity: 0.2 };
  const shown = { clipPath: "inset(-20% 0% -20% 0)", opacity: 1 };
  const duration = Math.min(2.6, 0.6 + children.length * 0.06);
  return (
    <motion.p
      className={`font-script leading-[1.25] ${className}`}
      initial={hidden}
      {...(inView ? { whileInView: shown, viewport: { once: true, margin: "0px 0px -10% 0px" } } : { animate: shown })}
      transition={{ duration, delay, ease: [0.45, 0, 0.25, 1] }}
    >
      {children}
    </motion.p>
  );
}
