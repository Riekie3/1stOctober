import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

/** Persistent "back to the menu" control on every secondary page. */
export default function BackButton() {
  const { pathname } = useLocation();
  const show = !["/", "/menu"].includes(pathname);
  const dark = pathname === "/memories";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="back"
          className="fixed left-4 top-4 z-40 sm:left-6 sm:top-6"
          style={{ top: "max(1rem, env(safe-area-inset-top))" }}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, x: -12, transition: { duration: 0.25 } }}
        >
          <Link
            to="/menu"
            aria-label="Back to the menu"
            className={`group flex h-11 items-center gap-2.5 rounded-full border pl-2 pr-4 backdrop-blur-md transition-colors duration-500 ${
              dark
                ? "border-white/15 bg-white/[0.06] text-[#f3e6cf] hover:bg-white/10"
                : "border-gold/25 bg-cream/70 text-ink hover:border-gold/50 hover:bg-cream"
            }`}
          >
            <span
              className={`grid h-7 w-7 place-items-center rounded-full transition-transform duration-500 ease-[var(--ease-silk)] group-hover:-translate-x-0.5 ${
                dark ? "bg-white/10" : "bg-ivory"
              }`}
            >
              <ArrowLeft size={15} strokeWidth={1.6} />
            </span>
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.28em]">Menu</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
