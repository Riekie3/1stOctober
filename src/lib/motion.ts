import { useReducedMotion } from "framer-motion";

/**
 * Respects the visitor's "reduce motion" setting.
 * Developers can preview the full animations anyway with ?motion=full
 * (remembered for the browser tab; ?motion=auto switches back).
 */
function readForce() {
  if (typeof window === "undefined") return false;
  try {
    const p = new URLSearchParams(window.location.search).get("motion");
    if (p === "full") sessionStorage.setItem("adm:motion", "full");
    if (p === "auto") sessionStorage.removeItem("adm:motion");
    return sessionStorage.getItem("adm:motion") === "full";
  } catch {
    return false;
  }
}

export const forceFullMotion = readForce();

export function usePrefersReducedMotion() {
  const reduce = useReducedMotion();
  return forceFullMotion ? false : !!reduce;
}
