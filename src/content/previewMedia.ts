import { idb } from "../admin/idb";
import { media } from "../lib/media";
import { content } from "./index";

/**
 * In an admin preview tab, photos and videos that haven't been published yet
 * live only in this browser's storage. Point the gallery at them before the
 * site renders — so the preview works even if the admin tab gets closed.
 */
export async function resolvePreviewMedia() {
  const files = await idb.all();
  if (!Object.keys(files).length) return;
  const fields = ["src", "poster", "live"] as const;
  content.memories.forEach((m, i) => {
    for (const f of fields) {
      const path = m[f];
      if (path && files[path] && media[i]) media[i][f] = URL.createObjectURL(files[path]);
    }
  });
}
