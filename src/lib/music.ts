import { useSyncExternalStore } from "react";
import { birthdayConfig } from "../config/birthday";
import { assetUrl } from "./assets";

/**
 * One <audio> element for the whole visit. It lives outside React, so
 * route changes never recreate it and the song never restarts.
 *
 * Behaviour:
 *  • It tries to play the moment the site opens.
 *  • If the browser blocks sound until the visitor interacts (most do),
 *    it starts on her very first tap / click / key press, anywhere.
 *  • Once playing it only ever stops when she presses pause. Anything else
 *    that pauses it (phone call, locked screen, background tab) is undone
 *    as soon as the browser allows.
 */

interface MusicState {
  playing: boolean;
  muted: boolean;
  volume: number;
  /** playback has succeeded at least once */
  started: boolean;
  /** the browser is waiting for her first interaction before allowing sound */
  blocked: boolean;
  /** the file is missing or can't be decoded */
  error: boolean;
  /** the song is temporarily quieter (a memory video is playing) */
  ducked: boolean;
}

let state: MusicState = {
  playing: false,
  muted: false,
  volume: birthdayConfig.music.volume,
  started: false,
  blocked: false,
  error: false,
  ducked: false,
};

const listeners = new Set<() => void>();
const set = (patch: Partial<MusicState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

let audio: HTMLAudioElement | null = null;
let fadeTimer: number | undefined;
let resumeTimer: number | undefined;
/** true only when she pressed pause herself */
let userPaused = false;

function getAudio() {
  if (audio || typeof window === "undefined") return audio;
  audio = new Audio();
  audio.src = assetUrl(birthdayConfig.music.src) ?? birthdayConfig.music.src;
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  audio.addEventListener("playing", () => set({ playing: true, started: true, blocked: false, error: false }));
  audio.addEventListener("pause", () => {
    set({ playing: false });
    // Not her choice? Put the song back on.
    if (!userPaused) {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => play(900), 400);
    }
  });
  audio.addEventListener("error", () => set({ error: true, playing: false }));
  if (import.meta.env.DEV) (window as unknown as { __song: HTMLAudioElement }).__song = audio;
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !userPaused && audio?.paused) play(900);
  });
  return audio;
}

function targetVolume() {
  if (state.muted) return 0;
  return state.ducked ? state.volume * 0.12 : state.volume;
}

/** Time-based fade (keeps working in background tabs, unlike animation frames). */
function fadeTo(to: number, ms = 1600, done?: () => void) {
  const a = getAudio();
  if (!a) return;
  window.clearInterval(fadeTimer);
  const from = a.volume;
  const t0 = performance.now();
  fadeTimer = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    const eased = 1 - Math.pow(1 - k, 3);
    a.volume = Math.min(1, Math.max(0, from + (to - from) * eased));
    if (k >= 1) {
      window.clearInterval(fadeTimer);
      fadeTimer = undefined;
      done?.();
    }
  }, 30);
}

/* ─── Waiting for her first interaction ─────────────────── */

const GESTURES = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;
let waiting = false;

function onGesture(e: Event) {
  // The player's own buttons handle themselves (otherwise the play button
  // would start the song and then immediately toggle it off again).
  if (e.target instanceof Element && e.target.closest("[data-music-player]")) return;
  play(2400);
}

function waitForGesture() {
  if (waiting) return;
  waiting = true;
  GESTURES.forEach((g) => window.addEventListener(g, onGesture, { capture: true, passive: true }));
}

function stopWaiting() {
  if (!waiting) return;
  waiting = false;
  GESTURES.forEach((g) => window.removeEventListener(g, onGesture, { capture: true }));
}

/* ─── Core ──────────────────────────────────────────────── */

function play(fadeMs: number) {
  const a = getAudio();
  if (!a || userPaused) return;
  if (!a.paused) {
    // Already playing (maybe mid fade-out) — just bring the volume back.
    fadeTo(targetVolume(), fadeMs);
    return;
  }
  if (a.error) a.load();
  a.volume = 0;
  a.play()
    .then(() => {
      stopWaiting();
      fadeTo(targetVolume(), fadeMs);
    })
    .catch((err: DOMException) => {
      if (err.name === "NotAllowedError") {
        set({ blocked: true });
        waitForGesture();
      }
      // AbortError = superseded by another call; anything else surfaces via the "error" event.
    });
}

export const music = {
  /** Called once when the site opens: play now, or on the first interaction. */
  autoStart() {
    play(2400);
  },
  /** Safe to call any time (e.g. from the "Yes" button). */
  start() {
    play(2400);
  },
  toggle() {
    const a = getAudio();
    if (!a) return;
    if (userPaused || a.paused) {
      userPaused = false;
      play(900);
    } else {
      userPaused = true;
      window.clearTimeout(resumeTimer);
      fadeTo(0, 450, () => a.pause());
    }
  },
  setVolume(v: number) {
    set({ volume: v, muted: v === 0 ? state.muted : false });
    const a = getAudio();
    if (a && !a.paused && !userPaused) {
      window.clearInterval(fadeTimer);
      a.volume = targetVolume();
    }
  },
  toggleMute() {
    set({ muted: !state.muted });
    if (!userPaused) fadeTo(targetVolume(), 350);
  },
  /** Quietly lowers the song while a memory video plays. */
  duck(on: boolean) {
    if (state.ducked === on) return;
    set({ ducked: on });
    const a = getAudio();
    if (a && !a.paused && !userPaused) fadeTo(targetVolume(), on ? 500 : 1400);
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useMusic() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}
