import site from "./site.json";
import itinerary from "./itinerary.json";
import letter from "./letter.json";
import loveNotes from "./loveNotes.json";
import memories from "./memories.json";
import type { ContentBundle } from "./types";

/**
 * The site's content. Normally exactly what's in the JSON files; in an admin
 * preview tab (?preview=1 opened from /admin) the unpublished draft is used
 * instead, so changes can be seen before publishing.
 */

export const PREVIEW_DRAFT_KEY = "adm:preview-draft";
const PREVIEW_FLAG = "adm:preview-on";

function readPreview(): Partial<ContentBundle> | null {
  if (typeof window === "undefined") return null;
  try {
    const q = new URLSearchParams(window.location.search).get("preview");
    if (q === "1") sessionStorage.setItem(PREVIEW_FLAG, "1");
    if (q === "0") sessionStorage.removeItem(PREVIEW_FLAG);
    if (sessionStorage.getItem(PREVIEW_FLAG) !== "1") return null;
    const raw = localStorage.getItem(PREVIEW_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<ContentBundle>) : null;
  } catch {
    return null;
  }
}

const draft = readPreview();

export const isPreview = draft !== null;

export const published: ContentBundle = {
  site,
  itinerary: itinerary as ContentBundle["itinerary"],
  letter,
  loveNotes,
  memories: memories as ContentBundle["memories"],
};

export const content: ContentBundle = {
  site: draft?.site ?? published.site,
  itinerary: draft?.itinerary ?? published.itinerary,
  letter: draft?.letter ?? published.letter,
  loveNotes: draft?.loveNotes ?? published.loveNotes,
  memories: draft?.memories ?? published.memories,
};
