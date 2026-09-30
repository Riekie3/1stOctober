import { useRef, useState } from "react";
import { AlertTriangle, GripVertical, ImagePlus, Loader2, Play, RefreshCw, Trash2, Upload } from "lucide-react";
import { LiveIcon } from "../../components/MediaModal";
import type { ContentBundle, MemoryItem } from "../../content/types";
import { Card, ItemTools, move } from "../fields";
import { processFiles, replacePhoto } from "../media";
import { edit, mediaUrl, useAdmin } from "../store";

export default function Memories({ d }: { d: ContentBundle }) {
  const { pending } = useAdmin();
  const s = d.site.memories;
  const [status, setStatus] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const add = async (list: FileList | File[]) => {
    const files = [...list];
    if (!files.length) return;
    setWarnings([]);
    const { items, warnings } = await processFiles(files, setStatus);
    setWarnings(warnings);
    if (items.length) edit((x) => void x.memories.push(...items));
  };

  return (
    <div className="space-y-6">
      <Card title="Memories page">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-semibold text-ink-soft">Title</span>
            <input className="w-full rounded-lg border border-gold/25 bg-white px-3 py-2 text-[0.92rem] outline-none focus:border-gold" value={s.title} onChange={(e) => edit((x) => void (x.site.memories.title = e.target.value))} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.78rem] font-semibold text-ink-soft">Subtitle</span>
            <input className="w-full rounded-lg border border-gold/25 bg-white px-3 py-2 text-[0.92rem] outline-none focus:border-gold" value={s.subtitle} onChange={(e) => edit((x) => void (x.site.memories.subtitle = e.target.value))} />
          </label>
        </div>
      </Card>

      {/* Upload */}
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setOver(true);
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${over ? "border-gold bg-champagne/30" : "border-gold/35 bg-cream"}`}
      >
        <input ref={input} type="file" multiple accept="image/*,video/*,.heic,.heif,.mov" className="hidden" onChange={(e) => e.target.files && add(e.target.files).finally(() => (e.target.value = ""))} />
        {status ? (
          <p className="flex items-center justify-center gap-2 text-[0.9rem] text-ink-soft">
            <Loader2 size={18} className="animate-spin text-gold" /> {status}
          </p>
        ) : (
          <>
            <Upload className="mx-auto text-gold" size={26} strokeWidth={1.5} />
            <p className="mt-2 font-display text-[1.3rem] text-ink">Drop photos & videos here</p>
            <p className="mt-1 text-[0.8rem] text-taupe">
              JPG, PNG, HEIC, MP4, MOV — as many as you like. Photos are resized and their location data removed. A photo and a short clip with the same name become a Live Photo.
            </p>
            <button type="button" onClick={() => input.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[0.82rem] font-medium text-cream transition hover:bg-gold-deep">
              <ImagePlus size={16} /> Choose files
            </button>
          </>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="space-y-1.5 rounded-xl border border-rose/30 bg-blush/40 p-4 text-[0.82rem] text-ink-soft">
          {warnings.map((w, i) => (
            <p key={i} className="flex gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose" /> {w}
            </p>
          ))}
        </div>
      )}

      <Card title={`${d.memories.length} memories`} hint="Drag the cards (or use the arrows) to change the order. New ones are added at the end.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {d.memories.map((m, i) => (
            <div
              key={`${m.src}-${i}`}
              draggable
              onDragStart={(e) => {
                setDragFrom(i);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (dragFrom === null) return;
                e.preventDefault();
                setDropAt(i);
              }}
              onDragEnd={() => {
                setDragFrom(null);
                setDropAt(null);
              }}
              onDrop={(e) => {
                if (dragFrom === null) return;
                e.preventDefault();
                const from = dragFrom;
                edit((x) => {
                  const [it] = x.memories.splice(from, 1);
                  x.memories.splice(i, 0, it);
                });
                setDragFrom(null);
                setDropAt(null);
              }}
              className={`overflow-hidden rounded-xl border bg-white transition ${dropAt === i && dragFrom !== i ? "border-gold ring-2 ring-gold/30" : "border-gold/20"} ${dragFrom === i ? "opacity-40" : ""}`}
            >
              <MemoryThumb m={m} isNew={!!pending[m.src] && !pending[m.src].uploaded} index={i} />
              <div className="space-y-2 p-3">
                <input
                  aria-label="Caption"
                  placeholder="Caption (required)"
                  className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-[0.86rem] outline-none focus:border-gold ${m.caption.trim() ? "border-gold/25" : "border-rose/60"}`}
                  value={m.caption}
                  onChange={(e) => edit((x) => void (x.memories[i].caption = e.target.value))}
                />
                <input
                  aria-label="Date or note"
                  placeholder="Date or note (optional)"
                  className="w-full rounded-md border border-gold/25 bg-white px-2.5 py-1.5 text-[0.8rem] outline-none focus:border-gold"
                  value={m.date ?? ""}
                  onChange={(e) =>
                    edit((x) => {
                      if (e.target.value) x.memories[i].date = e.target.value;
                      else delete x.memories[i].date;
                    })
                  }
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-taupe" title="Drag to reorder">
                    <GripVertical size={15} />
                  </span>
                  <div className="flex items-center gap-0.5">
                    {m.type === "image" && (
                      <ReplaceButton
                        onPicked={(src, date) =>
                          edit((x) => {
                            const it = x.memories[i];
                            it.src = src;
                            delete it.live; // the old Live Photo clip belongs to the old photo
                            if (date && !it.date) it.date = date;
                          })
                        }
                      />
                    )}
                    <ItemTools index={i} count={d.memories.length} onMove={(dir) => edit((x) => move(x.memories, i, dir))} />
                    <button
                      type="button"
                      title="Remove"
                      aria-label="Remove memory"
                      onClick={() => confirm("Remove this memory? Its file is deleted when you publish.") && edit((x) => void x.memories.splice(i, 1))}
                      className="grid h-8 w-8 place-items-center rounded-md text-taupe transition hover:bg-rose/10 hover:text-rose"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MemoryThumb({ m, isNew, index }: { m: MemoryItem; isNew: boolean; index: number }) {
  const thumb = m.type === "image" ? mediaUrl(m.src) : mediaUrl(m.poster);
  return (
    <div className="relative aspect-[4/3] bg-[#2a221c]">
      {thumb ? (
        <img src={thumb} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
      ) : (
        <video src={mediaUrl(m.src)} muted preload="metadata" className="h-full w-full object-cover" />
      )}
      <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white">{index + 1}</span>
      <div className="absolute right-2 top-2 flex gap-1">
        {isNew && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">New</span>}
        {m.type === "video" && (
          <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            <Play size={9} fill="currentColor" /> Video
          </span>
        )}
        {m.live && (
          <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            <LiveIcon size={11} /> Live
          </span>
        )}
      </div>
    </div>
  );
}

function ReplaceButton({ onPicked }: { onPicked: (src: string, date?: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          try {
            const { src, date } = await replacePhoto(f);
            onPicked(src, date);
          } catch {
            alert("That photo couldn't be read.");
          } finally {
            setBusy(false);
          }
        }}
      />
      <button
        type="button"
        title="Replace photo"
        aria-label="Replace photo"
        onClick={() => ref.current?.click()}
        className="grid h-8 w-8 place-items-center rounded-md text-taupe transition hover:bg-ivory hover:text-ink"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
      </button>
    </>
  );
}
