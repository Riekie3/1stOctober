import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { birthdayConfig } from "../config/birthday";
import { media as memories } from "../lib/media";
import AccentTitle from "../components/AccentTitle";
import MemoryGallery from "../components/MemoryGallery";
import PageTransition from "../components/PageTransition";
import { Spark } from "../components/Ornaments";

const silk = [0.22, 1, 0.36, 1] as const;

export default function MemoriesPage() {
  const { title, subtitle } = birthdayConfig.memories;

  return (
    <PageTransition kind="depth" label="Our Memories" className="text-[#f3e6cf]">
      <div className="pb-32 pt-24 sm:pt-28">
        <header className="mx-auto max-w-2xl px-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1, ease: silk }} className="flex justify-center text-gold-soft">
            <Spark size={14} />
          </motion.div>
          <motion.h1
            className="display mt-4 text-[clamp(2.8rem,9vw,5.2rem)] text-[#f6ead6]"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.35, duration: 1.2, ease: silk }}
          >
            <AccentTitle text={title} accentClass="font-light text-gold-soft" />
          </motion.h1>
          <motion.p
            className="mx-auto mt-4 max-w-md font-display text-[1.2rem] italic leading-snug text-[#d8c7ad] sm:text-[1.35rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            {subtitle}
          </motion.p>
        </header>

        <div className="mt-8 w-full sm:mt-10">
          {memories.length ? (
            <MemoryGallery items={memories} />
          ) : (
            <p className="px-6 text-center font-display text-xl italic text-[#d8c7ad]">Add photos in src/data/memories.ts</p>
          )}
        </div>

        <div className="mt-10 flex justify-center px-6">
          <Link
            to="/love"
            className="group flex h-12 items-center gap-2 rounded-full border border-gold-soft/40 px-6 text-[0.72rem] uppercase tracking-[0.24em] text-[#f3e6cf] transition hover:border-gold-soft hover:bg-white/5"
          >
            {birthdayConfig.menu.cards.love.title}
            <ArrowRight size={15} strokeWidth={1.6} aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
