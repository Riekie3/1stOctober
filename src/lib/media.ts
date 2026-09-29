import { memories, type MemoryItem } from "../data/memories";
import { assetUrl } from "./assets";

/** The memories list with every path made host-safe (see lib/assets.ts). */
export const media: MemoryItem[] = memories.map((m) => ({
  ...m,
  src: assetUrl(m.src) ?? m.src,
  poster: assetUrl(m.poster),
}));
