import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Spark } from "./Ornaments";

/**
 * Notices when a newer version of the site has been published while it is
 * already open (for example, a new photo added from /admin), and offers a
 * gentle refresh. If she hasn't started yet (still on the welcome page, no
 * taps), it simply refreshes by itself.
 */

const CHECK_EVERY = 90_000;

function currentBundle() {
  return document.querySelector<HTMLScriptElement>('script[type="module"][src*="static/index-"]')?.src ?? null;
}

async function latestBundle(): Promise<string | null> {
  const res = await fetch(`${import.meta.env.BASE_URL}index.html?check=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return null;
  const m = (await res.text()).match(/src="([^"]*static\/index-[^"]+\.js)"/);
  return m ? new URL(m[1], window.location.href).href : null;
}

export default function UpdateNotice({ dark = false }: { dark?: boolean }) {
  const [ready, setReady] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) return;
    const mine = currentBundle();
    if (!mine) return;
    let busy = false;
    const check = async () => {
      if (busy || document.hidden) return;
      busy = true;
      try {
        const latest = await latestBundle();
        if (latest && latest !== mine) setReady(true);
      } catch {
        /* offline — try again later */
      } finally {
        busy = false;
      }
    };
    const first = window.setTimeout(check, 8000);
    const timer = window.setInterval(check, CHECK_EVERY);
    const onVisible = () => !document.hidden && check();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  // Not started yet? Then there's nothing to interrupt — just refresh.
  useEffect(() => {
    if (!ready) return;
    const untouched = pathname === "/" && !(navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive;
    if (untouched) window.location.reload();
  }, [ready, pathname]);

  return (
    <AnimatePresence>
      {ready && (
        <motion.div
          className="fixed inset-x-0 z-[45] flex justify-center px-4"
          style={{ bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 4.25rem)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
        >
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`flex items-center gap-3 rounded-full border py-2 pl-3 pr-4 text-left shadow-lift backdrop-blur-xl transition ${
              dark ? "border-white/15 bg-[#2a221c]/85 text-[#f3e6cf] hover:bg-[#2a221c]" : "border-gold/30 bg-cream/90 text-ink hover:bg-cream"
            }`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-full ${dark ? "bg-white/10 text-gold-soft" : "bg-gold/15 text-gold-deep"}`}>
              <Spark size={11} />
            </span>
            <span className="font-display text-[1.05rem] italic leading-tight">Something new was just added</span>
            <span className={`flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${dark ? "text-gold-soft" : "text-gold-deep"}`}>
              <RefreshCw size={12} /> Refresh
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
