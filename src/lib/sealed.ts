import { birthdayConfig } from "../config/birthday";
import { localDate, useNow } from "./clock";

export type CardKey = "itinerary" | "wish" | "memories" | "love";

const { cards, opensAt } = birthdayConfig.menu.sealed;

/** The moment the sealed cards open (birthday date + opensAt, local time). */
export const sealOpensAt = localDate(birthdayConfig.birthdayDate, opensAt).getTime();

export function isSealed(card: CardKey, now: number) {
  return cards.includes(card) && now < sealOpensAt;
}

/** Re-renders every second so a card opens the moment its time arrives. */
export function useSealed(card: CardKey) {
  return isSealed(card, useNow());
}
