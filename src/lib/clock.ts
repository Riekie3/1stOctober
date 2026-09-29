import { useSyncExternalStore } from "react";
import { birthdayConfig } from "../config/birthday";

/**
 * A tiny shared clock.
 *
 * Normal visitors get the real device time.
 * Test mode (?testTime=09:49, optionally &testDate=2026-10-01) simulates a
 * start time on the birthday; the simulated clock then ticks forward in real
 * time so countdowns and unlocks can be watched live.
 * ?dev shows the developer panel while keeping the real clock.
 */

const SESSION_KEY = "adm:test-clock";

interface TestSettings {
  testTime: string | null;
  testDate: string;
  dev: boolean;
}

function readSettings(): TestSettings {
  const fallback: TestSettings = { testTime: null, testDate: birthdayConfig.birthdayDate, dev: false };
  if (typeof window === "undefined") return fallback;

  const params = new URLSearchParams(window.location.search);
  if (params.get("testTime") === "off" || params.get("dev") === "off") {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
    return fallback;
  }

  const t = params.get("testTime");
  if ((t && /^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) || params.has("dev")) {
    const settings: TestSettings = {
      testTime: t && /^\d{1,2}:\d{2}(:\d{2})?$/.test(t) ? t : null,
      testDate: params.get("testDate") ?? birthdayConfig.birthdayDate,
      dev: true,
    };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(settings));
    } catch {
      /* storage unavailable */
    }
    return settings;
  }

  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) return { ...fallback, ...JSON.parse(saved) };
  } catch {
    /* storage unavailable */
  }
  return fallback;
}

/** Builds a local Date from "YYYY-MM-DD" + "HH:MM[:SS]". */
export function localDate(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm, ss = 0] = time.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss);
}

const settings = readSettings();
let offset = settings.testTime ? localDate(settings.testDate, settings.testTime).getTime() - Date.now() : 0;
let current = Date.now() + offset;

const listeners = new Set<() => void>();
let timer: number | undefined;

function emit() {
  current = Date.now() + offset;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === undefined) {
    emit();
    timer = window.setInterval(emit, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}

export const clock = {
  isTestMode: settings.dev,
  testTime: settings.testTime,
  now: () => Date.now() + offset,
  /** Jump the simulated clock to an exact moment. */
  set(to: Date | number) {
    offset = (typeof to === "number" ? to : to.getTime()) - Date.now();
    emit();
  },
  /** Back to the ?testTime start (or the real time with ?dev). */
  reset() {
    offset = settings.testTime ? localDate(settings.testDate, settings.testTime).getTime() - Date.now() : 0;
    emit();
  },
  exit() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
    window.location.href = window.location.pathname;
  },
};

/** Current (possibly simulated) time in ms, re-rendering every second. */
export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
}
