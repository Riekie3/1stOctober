import { birthdayConfig } from "../config/birthday";
import { useNow } from "./clock";

/**
 * The sky follows her clock: daytime cream, a warm sunset in the early
 * evening, then a starry night. Times live in site.json → "sky" (editable in /admin).
 */
export type SkyTheme = "day" | "sunset" | "night";

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export function themeAt(ms: number): SkyTheme {
  const { sunsetFrom, nightFrom, morningFrom } = birthdayConfig.sky;
  const d = new Date(ms);
  const now = d.getHours() * 60 + d.getMinutes();
  const morning = minutes(morningFrom);
  const sunset = minutes(sunsetFrom);
  const night = minutes(nightFrom);
  if (now >= night || now < morning) return "night";
  if (now >= sunset) return "sunset";
  return "day";
}

/** Re-evaluates every second, so the sky changes the moment the time comes. */
export function useSkyTheme(): SkyTheme {
  return themeAt(useNow());
}
