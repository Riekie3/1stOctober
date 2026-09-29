import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

/**
 * Each page has its own entrance personality:
 *  welcome  – soft fade
 *  zoom     – cinematic push-in (menu, after “Yes”)
 *  slide    – horizontal travel (itinerary)
 *  paper    – a sheet settling onto the desk (wish)
 *  depth    – focus pull out of blur (memories)
 *  rise     – gentle upward reveal (love)
 */
export type TransitionKind = "welcome" | "zoom" | "slide" | "paper" | "depth" | "rise";

const silk = [0.22, 1, 0.36, 1] as const;

const variants: Record<TransitionKind, Variants> = {
  welcome: {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: 1.1, ease: silk } },
    exit: { opacity: 0, transition: { duration: 0.35 } },
  },
  zoom: {
    initial: { opacity: 0, scale: 1.08, filter: "blur(10px)" },
    enter: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 1.1, ease: silk }, transitionEnd: { filter: "none" } },
    exit: { opacity: 0, scale: 0.97, filter: "blur(4px)", transition: { duration: 0.4, ease: silk } },
  },
  slide: {
    initial: { opacity: 0, x: 80 },
    enter: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 70, damping: 18, mass: 0.9 } },
    exit: { opacity: 0, x: -60, transition: { duration: 0.35, ease: silk } },
  },
  paper: {
    initial: { opacity: 0, y: 40, rotateX: 10, transformPerspective: 1400 },
    enter: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 1, ease: silk } },
    exit: { opacity: 0, y: 24, rotateX: -6, transition: { duration: 0.35, ease: silk } },
  },
  depth: {
    initial: { opacity: 0, scale: 0.9, filter: "blur(16px)" },
    enter: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 1.2, ease: silk }, transitionEnd: { filter: "none" } },
    exit: { opacity: 0, scale: 1.04, filter: "blur(8px)", transition: { duration: 0.4, ease: silk } },
  },
  rise: {
    initial: { opacity: 0, y: 90 },
    enter: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 55, damping: 17 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.35, ease: silk } },
  },
};

export default function PageTransition({
  kind,
  children,
  className = "",
  label,
}: {
  kind: TransitionKind;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <motion.main
      aria-label={label}
      className={`relative min-h-dvh w-full ${className}`}
      variants={variants[kind]}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.main>
  );
}
