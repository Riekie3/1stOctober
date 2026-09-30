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
 *  • live     optional for photos — the short clip of an iPhone Live Photo.
 *             It plays once (silently) when she opens the photo; a LIVE
 *             badge replays it.
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
  live?: string;
}

export const memories: MemoryItem[] = [
  { type: "image", src: "/assets/photos/e721b13e-d778-4355-ac54-29baf957d40e.jpg", caption: "Little you, already the star of the party", date: "Where it all began" },
  { type: "image", src: "/assets/photos/img-7331.jpg", live: "/assets/videos/live-7331.mp4", caption: "One of our early days", date: "5 Dec 2025" },
  { type: "image", src: "/assets/photos/img-9383.jpg", live: "/assets/videos/live-9383.mp4", caption: "A night I still think about", date: "22 Feb 2026" },
  { type: "image", src: "/assets/photos/img-9501.jpg", live: "/assets/videos/live-9501.mp4", caption: "You, being you", date: "27 Feb 2026" },
  { type: "image", src: "/assets/photos/img20260228210510.jpg", caption: "Evenings with you", date: "28 Feb 2026" },
  { type: "image", src: "/assets/photos/img20260305202711.jpg", caption: "Just us", date: "5 Mar 2026" },
  { type: "image", src: "/assets/photos/img20260326222529.jpg", caption: "Late nights, good company", date: "26 Mar 2026" },
  { type: "image", src: "/assets/photos/img-0192.jpg", caption: "That smile on my screen", date: "Apr 2026" },
  { type: "image", src: "/assets/photos/img-0315.jpg", live: "/assets/videos/live-0315.mp4", caption: "A little adventure", date: "18 Apr 2026" },
  { type: "image", src: "/assets/photos/screenshot-2026-05-07-00-23-49-26-6012fa.jpg", caption: "Our late-night calls", date: "7 May 2026" },
  { type: "image", src: "/assets/photos/img-20260509-wa0046.jpg", caption: "A day to remember", date: "9 May 2026" },
  { type: "image", src: "/assets/photos/img20260509105738.jpg", caption: "Morning with you", date: "9 May 2026" },
  { type: "image", src: "/assets/photos/img20260509110834.jpg", caption: "Still that same morning", date: "9 May 2026" },
  { type: "image", src: "/assets/photos/img-0696.jpg", live: "/assets/videos/live-0696.mp4", caption: "Somewhere beautiful, with someone beautiful", date: "17 May 2026" },
  { type: "image", src: "/assets/photos/img-0813.jpg", live: "/assets/videos/live-0813.mp4", caption: "Another page of our story", date: "20 May 2026" },
  { type: "image", src: "/assets/photos/img-20260611-wa0149.jpg", caption: "Little moments", date: "11 Jun 2026" },
  { type: "image", src: "/assets/photos/img-2794.jpg", caption: "Out and about", date: "13 Jun 2026" },
  { type: "image", src: "/assets/photos/img-20260705-wa0116.jpg", caption: "The best kind of day", date: "5 Jul 2026" },
  { type: "image", src: "/assets/photos/img-20260705-wa0245.jpg", caption: "Same day, still smiling", date: "5 Jul 2026" },
  { type: "image", src: "/assets/photos/img-1684.jpg", live: "/assets/videos/live-1684.mp4", caption: "Views like this", date: "5 Jul 2026" },
  { type: "image", src: "/assets/photos/img-20260718-wa0026.jpg", caption: "Being silly together", date: "18 Jul 2026" },
  { type: "video", src: "/assets/videos/vid-20260905.mp4", poster: "/assets/photos/vid-20260905-poster.jpg", caption: "Press play", date: "5 Sep 2026" },
  { type: "image", src: "/assets/photos/img-20260906-wa0097.jpg", caption: "You and me", date: "6 Sep 2026" },
  { type: "video", src: "/assets/videos/img-3008.mp4", poster: "/assets/photos/img-3008-poster.jpg", caption: "Just the other day", date: "28 Sep 2026" },
  { type: "image", src: "/assets/photos/3dd0c1a7-0e7f-4890-888c-43e8567e81c7.jpg", caption: "Flowers, for you" },
  { type: "video", src: "/assets/videos/my-video.mp4", poster: "/assets/photos/my-video-poster.jpg", caption: "Something I made for you" },
];
