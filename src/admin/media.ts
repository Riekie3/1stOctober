import type { MemoryItem } from "../content/types";
import { addPending } from "./store";

/**
 * Turns dropped files into ready-to-publish memories, entirely in the browser:
 *  • photos (JPG/PNG/WebP/HEIC) → resized JPG, location & camera data removed
 *  • videos → kept as they are, with a cover image taken from the first second
 *  • a photo + a short clip with the same name → an iPhone Live Photo
 */

export interface Processed {
  items: MemoryItem[];
  warnings: string[];
}

const IMAGE = /\.(jpe?g|png|webp|heic|heif)$/i;
const VIDEO = /\.(mp4|mov|m4v|webm)$/i;
const MAX_VIDEO = 95 * 1024 * 1024; // GitHub refuses files over 100 MB
const BIG_VIDEO = 50 * 1024 * 1024;

const baseName = (f: File) => f.name.replace(/\.[^.]+$/, "");
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "memory";
const tag = () => Math.random().toString(36).slice(2, 6);
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(0)} MB`;

export async function processFiles(files: File[], onStatus: (text: string) => void): Promise<Processed> {
  const warnings: string[] = [];
  const items: MemoryItem[] = [];

  const images = files.filter((f) => IMAGE.test(f.name));
  const videos = files.filter((f) => VIDEO.test(f.name));
  files.filter((f) => !IMAGE.test(f.name) && !VIDEO.test(f.name)).forEach((f) => warnings.push(`${f.name}: not a photo or video, skipped.`));

  // Read every video's details first so short clips can be matched to photos.
  const videoInfo = new Map<File, VideoInfo>();
  for (const v of videos) {
    onStatus(`Checking ${v.name}…`);
    videoInfo.set(v, await inspectVideo(v));
  }

  const usedAsLive = new Set<File>();
  for (const [i, img] of images.entries()) {
    onStatus(`Preparing photo ${i + 1} of ${images.length} — ${img.name}`);
    try {
      const id = `${slug(baseName(img))}-${tag()}`;
      const { blob, date } = await preparePhoto(img);
      const src = `/assets/photos/${id}.jpg`;
      await addPending(src, blob);
      const item: MemoryItem = { type: "image", src, caption: "", ...(date ? { date } : {}) };

      // Same name + a clip of a few seconds = Live Photo.
      const clip = videos.find((v) => baseName(v).toLowerCase() === baseName(img).toLowerCase() && (videoInfo.get(v)?.duration ?? 99) <= 4.5);
      if (clip) {
        const info = videoInfo.get(clip)!;
        if (info.playable) {
          const live = `/assets/videos/live-${id}.${ext(clip)}`;
          await addPending(live, clip);
          item.live = live;
        } else warnings.push(`${clip.name}: the Live Photo motion can't play in this browser (probably HEVC), so only the still photo was added.`);
        usedAsLive.add(clip);
      }
      items.push(item);
    } catch (e) {
      warnings.push(`${img.name}: couldn't be read (${e instanceof Error ? e.message : "unknown error"}).`);
    }
  }

  for (const [i, v] of videos.filter((v) => !usedAsLive.has(v)).entries()) {
    onStatus(`Preparing video ${i + 1} — ${v.name}`);
    const info = videoInfo.get(v)!;
    if (v.size > MAX_VIDEO) {
      warnings.push(`${v.name} is ${mb(v.size)} — too big (GitHub's limit is 100 MB). Send it to me to shrink, or trim it first.`);
      continue;
    }
    if (v.size > BIG_VIDEO) warnings.push(`${v.name} is ${mb(v.size)}. It works, but it will load slowly on her phone.`);
    if (!info.playable) warnings.push(`${v.name}: this browser can't play it (probably an iPhone HEVC video). It may not play for her either — set iPhone Camera → Formats → Most Compatible, or send it to me to convert.`);
    const id = `${slug(baseName(v))}-${tag()}`;
    const src = `/assets/videos/${id}.${ext(v)}`;
    await addPending(src, v);
    const item: MemoryItem = { type: "video", src, caption: "" };
    if (info.poster) {
      const poster = `/assets/photos/${id}-poster.jpg`;
      await addPending(poster, info.poster);
      item.poster = poster;
    }
    items.push(item);
  }

  if (videos.length) warnings.push("Videos are uploaded as they are: if one was filmed with location turned on, that location stays inside the file.");
  onStatus("");
  return { items, warnings };
}

const ext = (f: File) => (f.name.split(".").pop() ?? "mp4").toLowerCase();

/* ─── Photos ────────────────────────────────────────────── */

async function preparePhoto(file: File): Promise<{ blob: Blob; date?: string }> {
  let date: string | undefined;
  try {
    const exifr = (await import("exifr")).default;
    const tags = await exifr.parse(file, ["DateTimeOriginal", "CreateDate"]);
    const d: Date | undefined = tags?.DateTimeOriginal ?? tags?.CreateDate;
    if (d instanceof Date && !Number.isNaN(d.getTime())) date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    /* no date — fine */
  }

  let source: Blob = file;
  if (/\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type)) {
    const { heicTo } = await import("heic-to");
    source = await heicTo({ blob: file, type: "image/jpeg", quality: 0.95 });
  }

  // Re-drawing on a canvas keeps only the pixels — GPS and camera data are gone.
  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("encoding failed"))), "image/jpeg", 0.82));
  return { blob, date };
}

/** One photo → one ready file (used by “Replace”). */
export async function replacePhoto(file: File): Promise<{ src: string; date?: string }> {
  const { blob, date } = await preparePhoto(file);
  const src = `/assets/photos/${slug(baseName(file))}-${tag()}.jpg`;
  await addPending(src, blob);
  return { src, date };
}

/* ─── Videos ────────────────────────────────────────────── */

interface VideoInfo {
  playable: boolean;
  duration: number;
  poster?: Blob;
}

function inspectVideo(file: File): Promise<VideoInfo> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    let settled = false;
    const done = (info: VideoInfo) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      v.removeAttribute("src");
      v.load();
      resolve(info);
    };
    const timer = window.setTimeout(() => done({ playable: false, duration: Number.isFinite(v.duration) ? v.duration : 99 }), 15000);
    v.onerror = () => {
      window.clearTimeout(timer);
      done({ playable: false, duration: 99 });
    };
    v.onloadedmetadata = () => {
      if (!v.videoWidth) {
        window.clearTimeout(timer);
        return done({ playable: false, duration: v.duration });
      }
      v.currentTime = Math.min(1, v.duration / 3);
    };
    v.onseeked = () => {
      window.clearTimeout(timer);
      const scale = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(v.videoWidth * scale);
      c.height = Math.round(v.videoHeight * scale);
      c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob((poster) => done({ playable: true, duration: v.duration, poster: poster ?? undefined }), "image/jpeg", 0.8);
    };
    v.src = url;
  });
}
