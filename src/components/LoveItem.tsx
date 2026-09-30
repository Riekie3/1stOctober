import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { LoveNote } from "../data/loveNotes";
import { Spark } from "./Ornaments";

const silk = [0.22, 1, 0.36, 1] as const;

export default function LoveItem({
  note,
  index,
  open,
  onToggle,
}: {
  note: LoveNote;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const num = String(index + 1).padStart(2, "0");
  const id = `love-note-${index}`;

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.06, ease: silk }}
      className={`group relative rounded-[1.1rem] border transition-[background-color,border-color,box-shadow] duration-500 ${
        open ? "border-gold/35 bg-cream shadow-lift" : "border-transparent hover:border-gold/20 hover:bg-cream/70 hover:shadow-paper"
      }`}
    >
      {/* left hairline that grows on hover */}
      <span
        aria-hidden
        className={`absolute bottom-4 left-0 top-4 w-px origin-center bg-gradient-to-b from-transparent via-gold to-transparent transition-transform duration-700 ease-[var(--ease-silk)] ${
          open ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
        }`}
      />

      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-start gap-4 rounded-[1.1rem] px-4 py-5 text-left outline-offset-2 sm:gap-7 sm:px-7 sm:py-6"
        >
          <span className="relative w-10 shrink-0 pt-1 sm:w-14">
            <span className="display block text-[1.9rem] italic leading-none text-gold sm:text-[2.6rem]">{num}</span>
            <span
              aria-hidden
              className={`absolute -right-1 -top-1 text-gold-soft transition-all duration-500 ${open ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"}`}
            >
              <Spark size={10} />
            </span>
          </span>

          <span className={`min-w-0 flex-1 transition-transform duration-500 ease-[var(--ease-silk)] ${open ? "" : "group-hover:translate-x-1.5"}`}>
            <span className="display block text-[1.6rem] font-medium leading-tight text-ink sm:text-[2.1rem]">{note.title}</span>
            <span className="mt-1.5 block text-[0.92rem] leading-relaxed text-taupe sm:text-[0.98rem]">{note.line}</span>
          </span>

          <span
            aria-hidden
            className={`mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-silk)] ${
              open ? "rotate-45 border-ink bg-ink text-cream" : "border-gold/35 text-gold-deep group-hover:border-gold"
            }`}
          >
            <Plus size={16} strokeWidth={1.5} />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            aria-label={note.title}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: silk }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-6 sm:pl-[6.9rem] sm:pr-10 sm:pb-8">
              {/* the secret note unfolding */}
              <motion.div
                initial={{ rotateX: -70, opacity: 0, y: -10 }}
                animate={{ rotateX: 0, opacity: 1, y: 0 }}
                exit={{ rotateX: -40, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: silk }}
                style={{ transformOrigin: "top center", transformPerspective: 900 }}
                className="keep-light relative rounded-md px-5 pb-5 pt-6 sm:px-8 sm:pt-7"
              >
                <div aria-hidden className="absolute inset-0 rounded-md bg-[#f6ebe5]" style={{ backgroundImage: "var(--grain)" }} />
                <span aria-hidden className="absolute inset-x-4 top-3 border-t border-dashed border-rose/30" />
                <p className="relative font-display text-[1.25rem] italic leading-[1.6] text-ink-soft sm:text-[1.4rem]">{note.note}</p>
                <p className="relative mt-2 text-right font-script text-[1.8rem] leading-none text-rose">— always</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
