/**
 * ─────────────────────────────────────────────────────────────
 *  A DAY MADE FOR YOU — personal configuration
 * ─────────────────────────────────────────────────────────────
 *  Everything personal lives here (and in /src/data).
 *  Change the values, save, and the whole site updates.
 */

export const birthdayConfig = {
  /** Her name — used on the welcome page, itinerary and final message. */
  girlfriendName: "A’ida",

  /** Your name — used to sign the letter. */
  boyfriendName: "Azri",

  /**
   * The birthday, as YYYY-MM-DD.
   * The itinerary unlocks against this date + each event's time,
   * using her phone's local clock.
   */
  birthdayDate: "2026-10-01",

  /** Path to the song inside /public (see README). */
  music: {
    src: "/assets/music/sempurna.mp3",
    title: "Sempurna",
    artist: "Insomniacks",
    /** 0 – 1. The song fades in to this volume on her first tap. */
    volume: 0.55,
  },

  introduction: {
    eyebrow: "A day made for you",
    title: "Happy Birthday",
    message: [
      "This is the most meaningful day,",
      "because it is the day you were born.",
    ],
    question: "Are you ready to start the day?",
    yesLabel: "Yes",
    noLabel: "No",
    /** Little notes that appear each time she tries to press NO. */
    noTeases: [
      "Hehe, nice try.",
      "Nope, not that one.",
      "It's a little shy today.",
      "Almost… but no.",
      "The other button looks nicer.",
      "You know the answer already.",
      "Still no. Try “Yes”?",
      "Persistent. I like that.",
    ],
  },

  menu: {
    title: "Today Is All About You",
    subtitle: "I planned a few little surprises for you.",
    /**
     * These cards stay sealed (blurred, locked, impossible to open) until
     * this time on the birthday (24h HH:MM, her phone's clock). Their pages
     * can't be reached by typing the address either.
     * Card names: "itinerary" | "wish" | "memories" | "love"
     */
    sealed: {
      cards: ["wish", "memories", "love"] as string[],
      opensAt: "19:30",
      /** Shown under the cards while some are still sealed. */
      footnote: "Some surprises are still sealed · start with the day ahead",
    },
    cards: {
      itinerary: {
        number: "01",
        title: "The Day Ahead",
        line: "Your little adventure starts here.",
      },
      wish: {
        number: "02",
        title: "A Little Wish",
        line: "A few things I want you to know.",
      },
      memories: {
        number: "03",
        title: "Our Memories",
        line: "Some moments I never want to forget.",
      },
      love: {
        number: "04",
        title: "Why I Love You",
        line: "A list that could honestly go on forever.",
      },
    },
  },

  itinerary: {
    title: "The Day Ahead",
    subtitle: "Your birthday passport. Each stop reveals itself ten minutes before we get there.",
    /** How many minutes before each event its details are revealed. */
    unlockMinutesBefore: 10,
    /** After the last event starts, when does the day count as "done"? (24h HH:MM) */
    dayEndsAt: "23:30",
    revealToast: "Your next surprise has been revealed.",
  },

  memories: {
    title: "Our Memories",
    subtitle: "Some moments I never want to forget. Tap one to hold it for a while.",
  },

  love: {
    title: "Things I Love About You",
    subtitle: "I could probably keep going forever…",
  },

  finale: {
    thankYou: "Thank you for being you.",
    /** "{name}" is replaced with girlfriendName. */
    birthdayLine: "Happy Birthday, {name}",
    closing: "Here's to another beautiful year together.",
  },
};

export type BirthdayConfig = typeof birthdayConfig;
