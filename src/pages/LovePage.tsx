import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { birthdayConfig } from "../config/birthday";
import { loveNotes } from "../data/loveNotes";
import AccentTitle from "../components/AccentTitle";
import LoveItem from "../components/LoveItem";
import PageTransition from "../components/PageTransition";
import { Rule, Spark } from "../components/Ornaments";

const silk = [0.22, 1, 0.36, 1] as const;

export default function LovePage() {
  const [open, setOpen] = useState<number | null>(null);
  const { title, subtitle } = birthdayConfig.love;

  return (
    <PageTransition kind="rise" label="Things I Love About You">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-24 sm:px-8 sm:pt-28">
        <header className="text-center">
          <p className="eyebrow">{birthdayConfig.menu.cards.love.title}</p>
          <h1 className="display mt-4 text-[clamp(2.6rem,8.5vw,5rem)]">
            <AccentTitle text={title} />
          </h1>
          <Rule className="mt-6" width="4rem" />
          <p className="mt-5 font-display text-[1.3rem] italic text-ink-soft sm:text-[1.45rem]">{subtitle}</p>
        </header>

        <ol className="mt-12 space-y-2 sm:mt-16" aria-label="Reasons">
          {loveNotes.map((note, i) => (
            <LoveItem key={i} note={note} index={i} open={open === i} onToggle={() => setOpen((o) => (o === i ? null : i))} />
          ))}
        </ol>

        <p className="mt-8 text-center text-[0.68rem] uppercase tracking-[0.3em] text-taupe">…and about a thousand more</p>
      </div>

      <Finale />
    </PageTransition>
  );
}

/* ─── The closing scene ──────────────────────────────────── */

function Finale() {
  const { thankYou, birthdayLine, closing } = birthdayConfig.finale;
  const [before, after] = birthdayLine.split("{name}");
  const name = birthdayConfig.girlfriendName;

  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        size: 2 + ((i * 7) % 4),
        dur: `${14 + ((i * 13) % 12)}s`,
        delay: `${-((i * 5) % 16)}s`,
        sx: `${((i * 23) % 60) - 30}px`,
        o: 0.35 + ((i * 11) % 5) / 10,
      })),
    [],
  );

  const line = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    show: (d: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.4, delay: d, ease: silk } }),
  };

  return (
    <section aria-label="A final message" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pb-28 pt-24">
      {/* the page warms into candlelight */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(234,214,207,0.55) 30%, rgba(222,196,160,0.55) 70%, rgba(205,172,125,0.5) 100%)",
        }}
      />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,246,228,0.95) 0%, rgba(255,240,214,0.4) 40%, transparent 70%)" }}
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 3, ease: silk }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {motes.map((m, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full bg-gold-soft"
            style={{
              left: m.left,
              opacity: 0,
              width: m.size,
              height: m.size,
              animation: `rise ${m.dur} linear infinite`,
              animationDelay: m.delay,
              ["--sx" as string]: m.sx,
              ["--o" as string]: m.o,
            }}
          />
        ))}
      </div>

      <motion.div className="relative max-w-3xl text-center" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
        <motion.div variants={line} custom={0} className="flex justify-center text-gold">
          <Spark size={16} />
        </motion.div>
        <motion.p variants={line} custom={0.3} className="display mt-6 text-[clamp(1.8rem,5.5vw,2.8rem)] italic text-ink-soft">
          {thankYou}
        </motion.p>

        <motion.div variants={line} custom={1.3}>
          <Rule className="my-8" width="5rem" />
        </motion.div>

        <motion.h2 variants={line} custom={1.7} className="display">
          <span className="block text-[clamp(1.1rem,3.2vw,1.5rem)] uppercase tracking-[0.3em] text-gold-deep">{before.trim()}</span>
          {name && <span className="mt-2 block font-script text-[clamp(4.2rem,17vw,9rem)] leading-[1.05] text-ink">{name}</span>}
          {after && <span className="block">{after}</span>}
        </motion.h2>

        <motion.p variants={line} custom={2.6} className="mx-auto mt-6 max-w-md font-display text-[clamp(1.3rem,4vw,1.7rem)] leading-snug text-ink-soft">
          {closing}
        </motion.p>

        <motion.p variants={line} custom={3.4} className="mt-6 font-script text-[2.2rem] text-gold-deep">
          — {birthdayConfig.boyfriendName}
        </motion.p>

        <motion.div variants={line} custom={3.8} className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/menu"
            className="flex h-12 items-center gap-2 rounded-full border border-gold/40 bg-cream/60 px-6 text-[0.7rem] uppercase tracking-[0.24em] text-ink-soft backdrop-blur transition hover:bg-cream"
          >
            <Home size={14} strokeWidth={1.6} aria-hidden /> Back to the surprises
          </Link>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-12 items-center gap-2 rounded-full px-5 text-[0.7rem] uppercase tracking-[0.24em] text-taupe transition hover:text-ink"
          >
            <ArrowUp size={14} strokeWidth={1.6} aria-hidden /> Read them again
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
