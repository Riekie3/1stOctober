/**
 * ─────────────────────────────────────────────────────────────
 *  THE DAY AHEAD — itinerary
 * ─────────────────────────────────────────────────────────────
 *  • time         24-hour "HH:MM" on the birthday (see config/birthday.ts)
 *  • title        what she'll see once it unlocks
 *  • location     where (optional)
 *  • description  one short line
 *  • icon         car | food | coffee | activity | sea | snow | rest | evening | dinner | gift | camera
 *  • clue         (optional) a tiny hint shown even while the stop is still locked
 *  • alwaysVisible  true = never hidden (use it for the first stop)
 *
 *  Every stop without alwaysVisible unlocks 10 minutes before its time
 *  (change unlockMinutesBefore in config/birthday.ts).
 *
 *  location is optional: leave it "" and the pin line is simply hidden.
 */

export type ItineraryIcon =
  | "car"
  | "food"
  | "coffee"
  | "activity"
  | "sea"
  | "snow"
  | "rest"
  | "evening"
  | "dinner"
  | "gift"
  | "camera";

export interface ItineraryEvent {
  id: number;
  time: string;
  title: string;
  location: string;
  description: string;
  icon: ItineraryIcon;
  clue?: string;
  alwaysVisible: boolean;
}

export const itinerary: ItineraryEvent[] = [
  {
    id: 1,
    time: "08:15",
    title: "Depart Shah Alam",
    location: "Shah Alam",
    description: "The day begins here.",
    icon: "car",
    alwaysVisible: true,
  },
  {
    id: 2,
    time: "10:00",
    title: "Aquaria KLCC",
    location: "KLCC, Kuala Lumpur",
    description: "A marine adventure awaits.",
    icon: "sea",
    clue: "Somewhere cool and blue.",
    alwaysVisible: false,
  },
  {
    id: 3,
    time: "12:30",
    title: "Lunch at Serai @ KLCC",
    location: "KLCC, Kuala Lumpur",
    description: "Good food, great company.",
    icon: "food",
    clue: "Come hungry.",
    alwaysVisible: false,
  },
  {
    id: 4,
    time: "14:00",
    title: "Blue Ice Snow Park",
    location: "",
    description: "Something cool, something fun.",
    icon: "snow",
    clue: "Bring a jacket, trust me.",
    alwaysVisible: false,
  },
  {
    id: 5,
    time: "16:00",
    title: "Home, to rest",
    location: "",
    description: "A quick pause before the evening.",
    icon: "rest",
    alwaysVisible: false,
  },
  {
    id: 6,
    time: "18:00",
    title: "Back out we go",
    location: "",
    description: "The city waits again.",
    icon: "evening",
    clue: "Wear the outfit you love most.",
    alwaysVisible: false,
  },
  {
    id: 7,
    time: "20:00",
    title: "Dinner at Ginger",
    location: "",
    description: "The night's main event.",
    icon: "dinner",
    alwaysVisible: false,
  },
];
