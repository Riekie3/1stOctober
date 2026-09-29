import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSealed, type CardKey } from "../lib/sealed";

/** Sends anyone who types a sealed page's address straight back to the menu. */
export default function SealedRoute({ card, children }: { card: CardKey; children: ReactNode }) {
  const sealed = useSealed(card);
  return sealed ? <Navigate to="/menu" replace /> : <>{children}</>;
}
