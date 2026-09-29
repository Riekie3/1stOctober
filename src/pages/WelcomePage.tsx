import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import { usePrefersReducedMotion } from "../lib/motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { birthdayConfig } from "../config/birthday";
import PageTransition from "../components/PageTransition";
import { Burst, Rule, Spark, Sprig } from "../components/Ornaments";
import { music } from "../lib/music";

const silk = [0.22, 1, 0.36, 1] as const;

export default function WelcomePage() {
  const intro = birthdayConfig.introduction;
  const navigate = useNavigate();
  const reduce = usePrefersReducedMotion();

  const yesRef = useRef<HTMLButtonElement>(null);
  const [leaving, setLeaving] = useState<null | { x: number; y: number }>(null);

  const runaway = useRunawayNo(yesRef);

  const onYes = () => {
    if (leaving) return;
    music.start();
    const r = yesRef.current?.getBoundingClientRect();
    setLeaving({ x: r ? r.left + r.width / 2 : window.innerWidth / 2, y: r ? r.top + r.height / 2 : window.innerHeight / 2 });
    window.setTimeout(() => navigate("/menu"), reduce ? 250 : 1450);
  };

  const words = intro.title.split(" ");
  const yesScale = 1 + Math.min(runaway.attempts, 6) * 0.035;

  return (
    <PageTransition kind="welcome" label="Welcome">
      <Frame />

      <motion.div
        className="relative flex min-h-dvh flex-col items-center justify-center px-6 pb-24 pt-16 text-center"
        animate={leaving ? { scale: 1.08, opacity: 0, filter: "blur(6px)" } : undefined}
        transition={{ duration: 1.3, ease: silk }}
      >
        <DateSeal />

        <motion.p
          className="eyebrow mt-7"
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.34em" }}
          transition={{ duration: 1.6, delay: 0.35, ease: silk }}
        >
          {intro.eyebrow}
        </motion.p>

        <h1 className="display mt-5 text-[clamp(4.2rem,19vw,9.5rem)] leading-[0.88]" aria-label={intro.title}>
          {words.map((word, wi) => (
            <span
              key={wi}
              aria-hidden
              className={`block ${wi % 2 === 1 ? "font-light italic text-gold-deep sm:-mr-[0.6em] sm:ml-[0.9em]" : "sm:-ml-[0.9em] sm:mr-[0.6em]"}`}
            >
              {[...word].map((ch, ci) => (
                <motion.span
                  key={ci}
                  className="inline-block"
                  initial={{ opacity: 0, y: "0.35em", filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 1.1, delay: 0.6 + wi * 0.35 + ci * 0.055, ease: silk }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        <motion.div initial={{ opacity: 0, scaleX: 0.3 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1.2, delay: 1.6, ease: silk }}>
          <Rule className="mt-8" width="4.5rem" />
        </motion.div>

        <div className="mt-7 max-w-md space-y-0.5 font-display text-[1.28rem] leading-snug text-ink-soft sm:text-[1.5rem]">
          {intro.message.map((line, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.9 + i * 0.25, ease: silk }}>
              {line}
            </motion.p>
          ))}
        </div>

        <motion.p
          className="mt-8 text-[0.8rem] font-medium uppercase tracking-[0.22em] text-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.6 }}
        >
          {intro.question}
        </motion.p>

        <motion.div
          className="relative mt-6 flex items-center justify-center gap-4 sm:gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.9, ease: silk }}
        >
          <motion.button
            ref={yesRef}
            type="button"
            onClick={onYes}
            animate={{ scale: yesScale }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="group relative flex h-14 items-center gap-3 overflow-hidden rounded-full bg-ink pl-8 pr-6 text-cream shadow-lift outline-offset-4"
          >
            <span aria-hidden className="absolute inset-[3px] rounded-full border border-gold-soft/40" />
            <span
              aria-hidden
              className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-[var(--ease-silk)] group-hover:translate-x-[300%]"
            />
            <span className="relative text-[0.8rem] font-medium uppercase tracking-[0.34em]">{intro.yesLabel}</span>
            <ArrowRight aria-hidden size={17} strokeWidth={1.5} className="relative transition-transform duration-500 group-hover:translate-x-1" />
          </motion.button>

          {/* NO lives here until her first attempt — then it escapes into the viewport. */}
          <button
            ref={runaway.inFlowRef}
            type="button"
            {...runaway.handlers}
            style={{ visibility: runaway.escaped ? "hidden" : "visible" }}
            aria-hidden={runaway.escaped || undefined}
            tabIndex={runaway.escaped ? -1 : 0}
            className={noClass}
          >
            {intro.noLabel}
          </button>
        </motion.div>

        <div aria-live="polite" className="mt-6 h-8">
          <AnimatePresence mode="wait">
            {runaway.attempts > 0 && !leaving && (
              <motion.p
                key={runaway.attempts}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.45 }}
                className="font-display text-[1.25rem] italic text-gold-deep"
              >
                {intro.noTeases[(runaway.attempts - 1) % intro.noTeases.length]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {runaway.escaped &&
        createPortal(
          <motion.button
            ref={runaway.escapedRef}
            type="button"
            {...runaway.handlers}
            className={`${noClass} fixed left-0 top-0 z-30`}
            style={{ x: runaway.x, y: runaway.y, scale: runaway.scale, rotate: runaway.rotate }}
            animate={{ opacity: leaving ? 0 : 1 }}
            transition={{ duration: 0.4 }}
          >
            {intro.noLabel}
          </motion.button>,
          document.body,
        )}

      {/* “Yes” — the light blooms out from the button */}
      {leaving &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
            <motion.div
              className="absolute h-10 w-10 rounded-full"
              style={{
                left: leaving.x - 20,
                top: leaving.y - 20,
                background: "radial-gradient(circle, #fffaf0 0%, #fff6e6 45%, rgba(255,244,224,0) 70%)",
              }}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: Math.hypot(window.innerWidth, window.innerHeight) / 13, opacity: 1 }}
              transition={{ duration: 1.35, ease: [0.65, 0, 0.35, 1] }}
            />
            <div className="absolute" style={{ left: leaving.x, top: leaving.y }}>
              <Burst count={30} radius={Math.min(260, window.innerWidth * 0.45)} color="#c7a266" />
            </div>
          </div>,
          document.body,
        )}
    </PageTransition>
  );
}

const noClass =
  "h-12 select-none rounded-full border border-gold/40 bg-cream/80 px-7 font-display text-[1.2rem] italic text-ink-soft shadow-paper backdrop-blur-sm transition-colors hover:border-gold/60";

/**
 * The shy NO button. It never lets a click land — every attempt sends it
 * somewhere new, a little further, smaller or more tilted each time.
 */
function useRunawayNo(yesRef: React.RefObject<HTMLButtonElement | null>) {
  const inFlowRef = useRef<HTMLButtonElement>(null);
  const escapedRef = useRef<HTMLButtonElement>(null);
  const [escaped, setEscaped] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const attemptsRef = useRef(0);
  const size = useRef({ w: 96, h: 48 });
  const lastMove = useRef(0);
  const focusAfterEscape = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);

  const bounds = () => {
    const vw = window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const m = vw < 480 ? 14 : 24;
    return { minX: m, maxX: Math.max(m, vw - size.current.w - m), minY: m + 60, maxY: Math.max(m + 60, vh - size.current.h - 96) };
  };

  const dodge = useCallback(
    (pointer?: { x: number; y: number }) => {
      const now = performance.now();
      if (now - lastMove.current < 320) return; // one hop per attempt
      lastMove.current = now;

      const n = ++attemptsRef.current;
      setAttempts(n);

      if (!escaped && inFlowRef.current) {
        const r = inFlowRef.current.getBoundingClientRect();
        size.current = { w: r.width, h: r.height };
        x.set(r.left);
        y.set(r.top);
        focusAfterEscape.current = document.activeElement === inFlowRef.current;
        setEscaped(true);
      }

      const b = bounds();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const diag = Math.hypot(vw, vh);
      const cur = { x: x.get(), y: y.get() };
      const minDist = [0, 110, 200, 240, 260, 300][Math.min(n, 5)] * Math.min(1, diag / 1300) + (n > 5 ? diag * 0.18 : 0);
      const yes = yesRef.current?.getBoundingClientRect();
      const pad = 28;

      const valid = (c: { x: number; y: number }) => {
        const d = Math.hypot(c.x - cur.x, c.y - cur.y);
        if (d < minDist) return false;
        if (pointer && Math.hypot(c.x + size.current.w / 2 - pointer.x, c.y + size.current.h / 2 - pointer.y) < 150) return false;
        if (yes) {
          const overlap =
            c.x < yes.right + pad && c.x + size.current.w > yes.left - pad && c.y < yes.bottom + pad && c.y + size.current.h > yes.top - pad;
          if (overlap) return false;
        }
        return true;
      };

      const rand = (a: number, bb: number) => a + Math.random() * (bb - a);
      let pick: { x: number; y: number } | null = null;
      let far = { x: b.minX, y: b.minY, d: -1 };
      for (let i = 0; i < 60 && !pick; i++) {
        let c: { x: number; y: number };
        if (n === 1) {
          // a gentle side-step
          const a = rand(0, Math.PI * 2);
          const r = rand(110, 170);
          c = { x: cur.x + Math.cos(a) * r, y: cur.y + Math.sin(a) * r * 0.7 };
        } else if (n === 5 || (n > 6 && Math.random() < 0.35)) {
          // somewhere unexpected: hug an edge or a corner
          const edge = Math.floor(rand(0, 4));
          c = {
            x: edge === 0 ? b.minX : edge === 1 ? b.maxX : rand(b.minX, b.maxX),
            y: edge === 2 ? b.minY : edge === 3 ? b.maxY : rand(b.minY, b.maxY),
          };
        } else {
          c = { x: rand(b.minX, b.maxX), y: rand(b.minY, b.maxY) };
        }
        c.x = Math.min(b.maxX, Math.max(b.minX, c.x));
        c.y = Math.min(b.maxY, Math.max(b.minY, c.y));
        if (valid(c)) pick = c;
        const d = Math.hypot(c.x - cur.x, c.y - cur.y);
        if (d > far.d) far = { ...c, d };
      }
      const target = pick ?? far;

      const spring = n === 1 ? { type: "spring" as const, stiffness: 140, damping: 16 } : { type: "spring" as const, stiffness: 240 + Math.min(n, 8) * 12, damping: 17 };
      animate(x, target.x, spring);
      animate(y, target.y, spring);

      const nextScale = n < 3 ? 1 : n === 3 ? 0.88 : Math.max(0.7, 0.9 - (n - 3) * 0.03 + (Math.random() - 0.5) * 0.08);
      const nextRot = n < 4 ? 0 : n === 4 ? 12 : rand(-16, 16);
      animate(scale, nextScale, { type: "spring", stiffness: 300, damping: 15 });
      animate(rotate, nextRot, { type: "spring", stiffness: 220, damping: 12 });
    },
    [escaped, x, y, scale, rotate, yesRef],
  );

  // Hand keyboard focus over to the escaped copy.
  useLayoutEffect(() => {
    if (escaped && focusAfterEscape.current) {
      escapedRef.current?.focus({ preventScroll: true });
      focusAfterEscape.current = false;
    }
  }, [escaped]);

  // Stay inside the viewport when the window or phone keyboard resizes.
  useEffect(() => {
    if (!escaped) return;
    const clamp = () => {
      const b = bounds();
      x.set(Math.min(b.maxX, Math.max(b.minX, x.get())));
      y.set(Math.min(b.maxY, Math.max(b.minY, y.get())));
    };
    window.addEventListener("resize", clamp);
    window.visualViewport?.addEventListener("resize", clamp);
    return () => {
      window.removeEventListener("resize", clamp);
      window.visualViewport?.removeEventListener("resize", clamp);
    };
  }, [escaped, x, y]);

  const handlers = useMemo(
    () => ({
      onPointerEnter: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse") dodge({ x: e.clientX, y: e.clientY });
      },
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        dodge({ x: e.clientX, y: e.clientY });
      },
      onClick: (e: React.MouseEvent) => {
        // NO never completes. Pointer clicks were already handled on pointerdown;
        // keyboard "clicks" (Enter / Space) arrive with detail === 0.
        e.preventDefault();
        if (e.detail === 0) dodge();
      },
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    }),
    [dodge],
  );

  return { inFlowRef, escapedRef, escaped, attempts, x, y, scale, rotate, handlers };
}

/** Slowly turning seal with the date written around its edge. */
function DateSeal() {
  const d = new Date(`${birthdayConfig.birthdayDate}T00:00`);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const ring = `${d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()} · A DAY MADE FOR YOU · `;

  return (
    <motion.div
      aria-hidden
      className="relative h-24 w-24 text-gold sm:h-28 sm:w-28"
      initial={{ opacity: 0, scale: 0.85, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.6, delay: 0.1, ease: silk }}
    >
      <svg viewBox="0 0 120 120" className="animate-spin-slow absolute inset-0 h-full w-full">
        <defs>
          <path id="seal-ring" d="M60 60 m -48 0 a 48 48 0 1 1 96 0 a 48 48 0 1 1 -96 0" />
        </defs>
        <text fontSize="8.2" letterSpacing="2.6" fill="currentColor" fontFamily="DM Sans Variable, sans-serif" fontWeight="500">
          <textPath href="#seal-ring" textLength="298" lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full border border-gold/40 bg-cream/60">
        <span className="display text-[1.35rem] leading-none text-ink sm:text-[1.6rem]">{day}</span>
        <span className="my-0.5 block h-px w-5 bg-gold/50" />
        <span className="display text-[0.95rem] italic leading-none text-gold-deep sm:text-[1.1rem]">{month}</span>
      </div>
    </motion.div>
  );
}

/** A fine letterpress frame around the whole invitation. */
function Frame() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-3 z-0 sm:inset-5">
      <motion.div
        className="absolute inset-0 rounded-[1.75rem] border border-gold/25"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: silk }}
      />
      {[
        "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
        "right-0 top-0 translate-x-1/2 -translate-y-1/2",
        "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
        "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
      ].map((pos, i) => (
        <motion.span
          key={i}
          className={`absolute ${pos} m-5 text-gold`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 0.9, delay: 1 + i * 0.1, ease: silk }}
        >
          <Spark size={10} />
        </motion.span>
      ))}
      <Sprig className="absolute -bottom-2 left-6 hidden h-44 w-28 text-gold/50 sm:block" />
      <Sprig className="absolute -top-2 right-6 hidden h-36 w-24 rotate-180 text-gold/35 md:block" />
    </div>
  );
}
