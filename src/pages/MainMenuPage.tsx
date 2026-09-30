import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Camera, Compass, Feather, Infinity as InfinityIcon, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { birthdayConfig } from "../config/birthday";
import { media as memories } from "../lib/media";
import { loveNotes } from "../data/loveNotes";
import AccentTitle from "../components/AccentTitle";
import PageTransition from "../components/PageTransition";
import Countdown from "../components/Countdown";
import { Burst, Rule, Spark } from "../components/Ornaments";
import { useNow } from "../lib/clock";
import { formatClock } from "../lib/schedule";
import { isSealed, sealOpensAt, useSealed, type CardKey } from "../lib/sealed";

const silk = [0.22, 1, 0.36, 1] as const;

export default function MainMenuPage() {
  const { title, subtitle, cards } = birthdayConfig.menu;
  const now = useNow();
  const anySealed = (["itinerary", "wish", "memories", "love"] as CardKey[]).some((c) => isSealed(c, now));

  return (
    <PageTransition kind="zoom" label="Menu">
      <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-16 sm:px-8 sm:pt-20 lg:pt-24">
        <header className="text-center">
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
            For {birthdayConfig.girlfriendName}
          </motion.p>
          <motion.h1
            className="display mx-auto mt-4 max-w-4xl text-balance text-[clamp(2.7rem,9vw,5.6rem)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 1.1, ease: silk }}
          >
            <AccentTitle text={title} />
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
            <Rule className="mt-6" width="4rem" />
            <p className="mx-auto mt-5 max-w-md font-display text-[1.3rem] italic text-ink-soft sm:text-[1.45rem]">{subtitle}</p>
          </motion.div>
        </header>

        <nav aria-label="Surprises" className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-12">
          <TiltCard to="/itinerary" card="itinerary" label={`${cards.itinerary.title}: ${cards.itinerary.line}`} delay={0.7} className="lg:col-span-7">
            <TicketCard />
          </TiltCard>
          <TiltCard to="/wish" card="wish" label={`${cards.wish.title}: ${cards.wish.line}`} delay={0.82} className="lg:col-span-5">
            <EnvelopeCard />
          </TiltCard>
          <TiltCard to="/memories" card="memories" label={`${cards.memories.title}: ${cards.memories.line}`} delay={0.94} className="lg:col-span-5" dark>
            <DarkroomCard />
          </TiltCard>
          <TiltCard to="/love" card="love" label={`${cards.love.title}: ${cards.love.line}`} delay={1.06} className="lg:col-span-7">
            <IndexCard />
          </TiltCard>
        </nav>

        <motion.p
          className="mt-12 text-center text-[0.7rem] uppercase tracking-[0.3em] text-taupe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          {anySealed ? birthdayConfig.menu.sealed.footnote : "Take your time · there’s no wrong order"}
        </motion.p>
      </div>
    </PageTransition>
  );
}

/* ─── Shared tilt / depth wrapper ─────────────────────────── */

function TiltCard({
  to,
  card,
  label,
  delay,
  className = "",
  dark = false,
  children,
}: {
  to: string;
  card: CardKey;
  label: string;
  delay: number;
  className?: string;
  dark?: boolean;
  children: ReactNode;
}) {
  const sealed = useSealed(card);
  // Remember whether it opened while she was looking, to celebrate it.
  const wasSealed = useRef(sealed);
  const [justOpened, setJustOpened] = useState(false);
  useEffect(() => {
    if (wasSealed.current && !sealed) setJustOpened(true);
    wasSealed.current = sealed;
  }, [sealed]);

  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(30);
  const glow = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 18 });
  const sry = useSpring(ry, { stiffness: 160, damping: 18 });
  const sglow = useSpring(glow, { stiffness: 120, damping: 20 });
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, ${dark ? "rgba(255,226,170,0.16)" : "var(--glare)"}, transparent 55%)`;

  const onMove = (e: React.PointerEvent) => {
    if (sealed || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 7);
    rx.set(-(py - 0.5) * 7);
    gx.set(px * 100);
    gy.set(py * 100);
    glow.set(1);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    glow.set(0);
  };

  return (
    <motion.div
      className={`[perspective:1200px] ${className}`}
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 1, ease: silk }}
    >
      <motion.div
        ref={ref}
        role={sealed ? "group" : undefined}
        aria-label={sealed ? `${label.split(":")[0]} — sealed until ${sealLabel()}` : undefined}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        variants={{ rest: { y: 0 }, hover: { y: -6 } }}
        initial="rest"
        animate="rest"
        whileHover={sealed ? undefined : "hover"}
        whileTap={sealed ? undefined : { scale: 0.985 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className={`relative h-full min-h-[17.5rem] overflow-hidden rounded-[1.5rem] shadow-paper transition-shadow duration-700 sm:min-h-[20rem] ${
          sealed ? "cursor-not-allowed select-none" : "group hover:shadow-lift"
        }`}
      >
        {/* The card itself — blurred while sealed */}
        <motion.div
          aria-hidden={sealed || undefined}
          className="h-full"
          initial={false}
          animate={sealed ? { filter: "blur(9px) saturate(0.75)", scale: 1.05 } : { filter: "blur(0px) saturate(1)", scale: 1 }}
          transition={{ duration: 1.4, ease: silk }}
        >
          {children}
        </motion.div>

        {!sealed && <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare, opacity: sglow }} />}

        <AnimatePresence>{sealed && <SealOverlay key="seal" title={label.split(":")[0]} dark={dark} />}</AnimatePresence>

        {justOpened && <Burst count={22} radius={150} color={dark ? "#e8cf9c" : "#b8955a"} />}

        {/* Only a real link once it's open — before that there is nothing to click. */}
        {!sealed && (
          <Link
            to={to}
            aria-label={label}
            className="absolute inset-0 z-10 rounded-[1.5rem] focus-visible:outline-offset-[-4px]"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function sealLabel() {
  return `${formatClock(sealOpensAt)} on ${new Date(sealOpensAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}

/** Lock, time and countdown shown over a sealed card. */
function SealOverlay({ title, dark }: { title: string; dark: boolean }) {
  const now = useNow();
  const sameDay = new Date(now).toDateString() === new Date(sealOpensAt).toDateString();
  const when = sameDay
    ? `Opens tonight at ${formatClock(sealOpensAt)}`
    : `Opens ${new Date(sealOpensAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${formatClock(sealOpensAt)}`;

  return (
    <motion.div
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center ${
        dark ? "bg-black/25 text-[#f3e6cf]" : "bg-ivory/35 text-ink"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.9, ease: silk } }}
    >
      <motion.span
        className={`grid h-14 w-14 place-items-center rounded-full border shadow-paper backdrop-blur-sm ${
          dark ? "border-gold-soft/40 bg-white/10 text-gold-soft" : "border-gold/35 bg-cream/80 text-gold-deep"
        }`}
        exit={{ rotate: -12, scale: 1.3, opacity: 0, transition: { duration: 0.6 } }}
      >
        <Lock size={20} strokeWidth={1.6} aria-hidden />
      </motion.span>
      <p className={`eyebrow !text-[0.6rem] ${dark ? "!text-gold-soft" : ""}`}>{title}</p>
      <p className="display text-[1.45rem] italic leading-tight sm:text-[1.6rem]">{when}</p>
      <p className={`text-[0.72rem] uppercase tracking-[0.22em] ${dark ? "text-[#d9c9b1]" : "text-taupe"}`}>
        in <Countdown target={sealOpensAt} now={now} />
      </p>
    </motion.div>
  );
}

function CardText({ card, Icon, dark = false }: { card: { number: string; title: string; line: string }; Icon: typeof Compass; dark?: boolean }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className={`display text-[1.05rem] italic ${dark ? "text-gold-soft" : "text-gold-deep"}`}>{card.number}</span>
        <span className={`h-px w-8 ${dark ? "bg-gold-soft/40" : "bg-gold/40"}`} />
        <Icon aria-hidden size={16} strokeWidth={1.5} className={dark ? "text-gold-soft" : "text-gold"} />
      </div>
      <h2 className={`display mt-3 text-[2rem] font-medium sm:text-[2.35rem] ${dark ? "text-[#f6ead6]" : "text-ink"}`}>{card.title}</h2>
      <p className={`mt-1.5 max-w-[22rem] font-display text-[1.15rem] italic leading-snug ${dark ? "text-[#d9c9b1]" : "text-ink-soft"}`}>{card.line}</p>
    </div>
  );
}

function Arrow({ dark = false }: { dark?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid h-10 w-10 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-silk)] group-hover:rotate-45 ${
        dark ? "border-gold-soft/40 text-gold-soft group-hover:bg-gold-soft group-hover:text-umber" : "border-gold/40 text-gold-deep group-hover:bg-ink group-hover:text-cream"
      }`}
    >
      <ArrowUpRight size={16} strokeWidth={1.5} />
    </span>
  );
}

/* ─── 01 · The day ahead — a boarding ticket ─────────────── */

function TicketCard() {
  const card = birthdayConfig.menu.cards.itinerary;
  return (
    <div className="paper flex h-full">
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
        <CardText card={card} Icon={Compass} />

        <div className="mt-8" aria-hidden>
          <div className="flex items-end justify-between text-[0.62rem] uppercase tracking-[0.24em] text-taupe">
            <span>
              <span className="display block text-[1.6rem] normal-case tracking-normal text-ink">08:15</span>Shah Alam
            </span>
            <span className="text-right">
              <span className="display block text-[1.6rem] italic normal-case tracking-normal text-gold-deep">? ? ?</span>A surprise
            </span>
          </div>
          <div className="relative mt-3 h-4">
            <svg viewBox="0 0 300 16" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path d="M4 8 H296" stroke="var(--color-gold)" strokeWidth="1" strokeDasharray="3 5" fill="none" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-ink" />
            <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-gold bg-cream" />
            <span className="absolute left-[8%] top-1/2 -translate-y-1/2 text-gold transition-[left] duration-[1400ms] ease-[var(--ease-silk)] group-hover:left-[86%]">
              <Spark size={14} />
            </span>
          </div>
        </div>
      </div>

      {/* Stub */}
      <div className="relative hidden w-24 shrink-0 flex-col items-center justify-between border-l border-dashed border-gold/40 py-6 min-[420px]:flex sm:w-28">
        <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-ivory shadow-[inset_0_-1px_2px_rgba(60,42,20,0.12)]" />
        <span className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-ivory shadow-[inset_0_1px_2px_rgba(60,42,20,0.12)]" />
        <Arrow />
        <span className="eyebrow !text-[0.58rem] [writing-mode:vertical-rl]">Admit one · birthday girl</span>
        <span aria-hidden className="flex h-8 w-14 items-stretch gap-[2px] opacity-70">
          {[2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2].map((w, i) => (
            <span key={i} className="bg-ink" style={{ width: w }} />
          ))}
        </span>
      </div>
    </div>
  );
}

/* ─── 02 · A little wish — a sealed envelope ─────────────── */

function EnvelopeCard() {
  const card = birthdayConfig.menu.cards.wish;
  const initial = birthdayConfig.girlfriendName.trim().charAt(0).toUpperCase() || "♡";
  return (
    <div className="keep-light relative flex h-full flex-col justify-between overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(160deg, #f6e9e3 0%, #ecd8d0 100%)" }}>
      <div aria-hidden className="absolute inset-0 opacity-60" style={{ backgroundImage: "var(--grain)" }} />
      <div className="relative flex items-start justify-between">
        <CardText card={card} Icon={Feather} />
        <Arrow />
      </div>

      {/* Envelope */}
      <div aria-hidden className="relative mx-auto mt-8 h-32 w-52 [perspective:700px] sm:h-36 sm:w-60">
        {/* letter peeking out */}
        <div className="absolute inset-x-4 top-2 h-28 rounded-md bg-cream shadow-sm transition-transform duration-700 ease-[var(--ease-silk)] group-hover:-translate-y-10">
          <p className="pt-3 text-center font-script text-[1.6rem] leading-none text-gold-deep">for you</p>
          <div className="mx-auto mt-2 w-3/5 space-y-1.5">
            <span className="block h-px bg-champagne" />
            <span className="block h-px bg-champagne" />
            <span className="block h-px w-2/3 bg-champagne" />
          </div>
        </div>
        {/* body */}
        <svg viewBox="0 0 240 144" className="absolute inset-0 h-full w-full drop-shadow-[0_10px_18px_rgba(120,70,50,0.18)]">
          <path d="M0 40 L120 104 L240 40 V144 H0 Z" fill="#f7ede6" />
          <path d="M0 144 L104 90 M240 144 L136 90" stroke="#dcc2b6" strokeWidth="1" />
        </svg>
        {/* flap */}
        <div
          className="absolute inset-x-0 top-0 h-[70%] origin-top transition-transform duration-700 ease-[var(--ease-silk)] [transform-style:preserve-3d] group-hover:[transform:rotateX(180deg)]"
        >
          <svg viewBox="0 0 240 100" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0 0 H240 L120 100 Z" fill="#efdfd6" stroke="#dcc2b6" strokeWidth="1" />
          </svg>
        </div>
        {/* wax seal */}
        <span className="absolute left-1/2 top-[52%] grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-lg italic text-cream shadow-md transition-opacity duration-300 group-hover:opacity-0" style={{ background: "radial-gradient(circle at 35% 30%, #c69a84, #9c6b5c 70%)" }}>
          {initial}
        </span>
      </div>
    </div>
  );
}

/* ─── 03 · Our memories — the darkroom ───────────────────── */

function DarkroomCard() {
  const card = birthdayConfig.menu.cards.memories;
  const shots = memories.filter((m) => m.type === "image").slice(0, 3);
  const poses = [
    { r: -10, x: -46, hx: -78, hr: -16 },
    { r: 5, x: 0, hx: 0, hr: 2 },
    { r: 14, x: 46, hx: 80, hr: 18 },
  ];
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden p-6 sm:p-8" style={{ background: "radial-gradient(120% 90% at 80% 0%, #4a3829 0%, #2a2019 45%, #1a1410 100%)" }}>
      <div aria-hidden className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#f3b77a]/20 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <CardText card={card} Icon={Camera} dark />
        <Arrow dark />
      </div>

      <div aria-hidden className="relative mx-auto mt-6 h-36 w-full max-w-xs">
        {shots.map((m, i) => (
          <motion.div
            key={m.src}
            className="absolute left-1/2 top-2 w-24 -translate-x-1/2 bg-[#f7f1e6] p-1.5 pb-5 shadow-[0_12px_24px_rgba(0,0,0,0.4)] sm:w-28"
            style={{ zIndex: i === 1 ? 2 : 1 }}
            variants={{ rest: { x: poses[i].x, rotate: poses[i].r, y: 0 }, hover: { x: poses[i].hx, rotate: poses[i].hr, y: i === 1 ? -8 : 0 } }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            <img src={m.src} alt="" loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── 04 · Why I love you — an endless index ─────────────── */

function IndexCard() {
  const card = birthdayConfig.menu.cards.love;
  const list = [...loveNotes, ...loveNotes];
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-cream p-6 sm:p-8"
      style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 31px, rgba(165,130,76,0.12) 31px 32px)" }}
    >
      <div aria-hidden className="absolute bottom-0 left-10 top-0 w-px bg-rose/25 sm:left-14" />
      <div className="relative flex flex-1 flex-col justify-between pl-6 sm:pl-9 lg:pr-60">
        <CardText card={card} Icon={InfinityIcon} />
        <div className="mt-6 flex items-center gap-3">
          <Arrow />
          <span className="text-[0.66rem] uppercase tracking-[0.26em] text-taupe">{loveNotes.length} reasons · and counting</span>
        </div>
      </div>

      <div
        aria-hidden
        className="relative mt-6 h-40 overflow-hidden lg:absolute lg:inset-y-0 lg:right-4 lg:mt-0 lg:h-auto lg:w-56"
        style={{ maskImage: "linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 25%, #000 75%, transparent)" }}
      >
        <div className="index-scroll space-y-0 pl-6 sm:pl-9 lg:pl-0">
          {list.map((n, i) => (
            <p key={i} className="flex h-8 items-baseline gap-3 whitespace-nowrap font-display text-[1.1rem] text-ink-soft">
              <span className="w-6 text-right text-[0.9rem] italic text-gold">{String((i % loveNotes.length) + 1).padStart(2, "0")}</span>
              {n.title}
            </p>
          ))}
        </div>
      </div>
      <style>{`
        .index-scroll { animation: index-scroll ${loveNotes.length * 3.2}s linear infinite; }
        @keyframes index-scroll { to { transform: translateY(-50%); } }
        @media (prefers-reduced-motion: reduce) { .index-scroll { animation: none; } }
      `}</style>
    </div>
  );
}
