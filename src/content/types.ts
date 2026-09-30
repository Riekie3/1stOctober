import site from "./site.json";

/**
 * Shapes of the editable content. The content itself lives in the JSON files
 * next to this one — edited by hand or through /admin.
 */

export type SiteContent = typeof site;

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

export const ITINERARY_ICONS: ItineraryIcon[] = ["car", "food", "coffee", "activity", "sea", "snow", "rest", "evening", "dinner", "gift", "camera"];

export interface ItineraryEvent {
  id: number;
  /** 24-hour "HH:MM" on the birthday */
  time: string;
  title: string;
  location: string;
  description: string;
  icon: ItineraryIcon;
  /** a hint shown while the stop is still locked */
  clue?: string;
  /** never hidden (use for the first stop) */
  alwaysVisible: boolean;
}

export interface LetterContent {
  title: string;
  envelopeLabel: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
}

export interface LoveNote {
  title: string;
  line: string;
  note: string;
}

export interface MemoryItem {
  type: "image" | "video";
  src: string;
  caption: string;
  date?: string;
  poster?: string;
  alt?: string;
  /** iPhone Live Photo clip for an image */
  live?: string;
}

export interface ContentBundle {
  site: SiteContent;
  itinerary: ItineraryEvent[];
  letter: LetterContent;
  loveNotes: LoveNote[];
  memories: MemoryItem[];
}

/** Where each part lives in the repository. */
export const CONTENT_FILES: Record<keyof ContentBundle, string> = {
  site: "src/content/site.json",
  itinerary: "src/content/itinerary.json",
  letter: "src/content/letter.json",
  loveNotes: "src/content/loveNotes.json",
  memories: "src/content/memories.json",
};
