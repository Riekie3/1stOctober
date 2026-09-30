/**
 * Photos & videos — listed in src/content/memories.json (edit there, or
 * through /admin). Files live in public/assets/photos and public/assets/videos.
 */
import { content } from "../content";
export type { MemoryItem } from "../content/types";

export const memories = content.memories;
