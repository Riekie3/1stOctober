/**
 * ─────────────────────────────────────────────────────────────
 *  OUR MEMORIES — photos & videos
 * ─────────────────────────────────────────────────────────────
 *  1. Drop files into  public/assets/photos/  and  public/assets/videos/
 *  2. Add one line per file below. That's it — the gallery lays itself out.
 *
 *  • type     "image" (jpg, jpeg, png, webp, svg) or "video" (mp4, webm, mov*)
 *  • src      path starting with /assets/…
 *  • caption  short line shown when she opens it
 *  • date     optional, any text ("12 Apr 2024", "Our first trip", …)
 *  • poster   optional for videos — a still image shown while it floats.
 *             Without one, the first frame of the video is used.
 *  • alt      optional description for screen readers (defaults to caption)
 *
 *  * .mov plays in Safari; Chrome/Firefox only play .mov files encoded as H.264.
 *    Converting to .mp4 is the safest choice.
 *
 *  The placeholder-XX.svg files are just stand-ins — replace them.
 */

export interface MemoryItem {
  type: "image" | "video";
  src: string;
  caption: string;
  date?: string;
  poster?: string;
  alt?: string;
}

export const memories: MemoryItem[] = [
  { type: "image", src: "/assets/photos/placeholder-01.svg", caption: "That sunset we almost missed", date: "12 Apr 2024" },
  { type: "image", src: "/assets/photos/placeholder-02.svg", caption: "City lights, late night talks", date: "Kuala Lumpur" },
  { type: "image", src: "/assets/photos/placeholder-03.svg", caption: "The flowers you pretended not to love" },
  { type: "video", src: "/assets/videos/placeholder-01.mp4", caption: "That silly day", date: "Press play" },
  { type: "image", src: "/assets/photos/placeholder-04.svg", caption: "Our first trip", date: "Somewhere green" },
  { type: "image", src: "/assets/photos/placeholder-05.svg", caption: "Dinner by candlelight" },
  { type: "image", src: "/assets/photos/placeholder-06.svg", caption: "The calm before the laughing fit" },
  { type: "image", src: "/assets/photos/placeholder-07.svg", caption: "Golden hour, golden you", date: "Last summer" },
  { type: "image", src: "/assets/photos/placeholder-08.svg", caption: "Two coffees, zero plans" },
  { type: "image", src: "/assets/photos/placeholder-09.svg", caption: "Counting stars instead of sleeping" },
  { type: "image", src: "/assets/photos/placeholder-10.svg", caption: "Road trip, windows down" },
];
