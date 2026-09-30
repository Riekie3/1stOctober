import type { ContentBundle } from "../../content/types";
import { AddButton, Card, ItemTools, LongText, Text, move } from "../fields";
import { edit } from "../store";

export default function LoveNotes({ d }: { d: ContentBundle }) {
  const notes = d.loveNotes;
  return (
    <Card title="Things I love about you" hint="Numbering is automatic. The closing message is under General → Final message.">
      {notes.map((n, i) => (
        <div key={i} className="rounded-xl border border-gold/15 bg-ivory/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="truncate font-display text-[1.2rem] text-ink">
              <span className="italic text-gold-deep">{String(i + 1).padStart(2, "0")}</span> · {n.title || "Untitled"}
            </p>
            <ItemTools
              index={i}
              count={notes.length}
              onMove={(dir) => edit((x) => move(x.loveNotes, i, dir))}
              onRemove={() => confirm(`Remove “${n.title || "this reason"}”?`) && edit((x) => void x.loveNotes.splice(i, 1))}
              removeLabel="Remove reason"
            />
          </div>
          <div className="space-y-3">
            <Text label="Reason" value={n.title} onChange={(v) => edit((x) => void (x.loveNotes[i].title = v))} />
            <LongText label="Short line (always visible)" rows={1} value={n.line} onChange={(v) => edit((x) => void (x.loveNotes[i].line = v))} />
            <LongText label="Secret note (shown when she opens it)" rows={2} value={n.note} onChange={(v) => edit((x) => void (x.loveNotes[i].note = v))} />
          </div>
        </div>
      ))}
      <AddButton onClick={() => edit((x) => void x.loveNotes.push({ title: "", line: "", note: "" }))}>Add a reason</AddButton>
    </Card>
  );
}
