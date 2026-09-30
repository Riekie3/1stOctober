import type { ContentBundle } from "../../content/types";
import { Card, LongText, StringList, Text } from "../fields";
import { edit } from "../store";

export default function Letter({ d }: { d: ContentBundle }) {
  const l = d.letter;
  return (
    <div className="space-y-6">
      <Card title="Letter page">
        <Text label="Page title" value={l.title} onChange={(v) => edit((x) => void (x.letter.title = v))} />
        <Text label="Envelope label" hint="Read aloud by screen readers on the wax seal." value={l.envelopeLabel} onChange={(v) => edit((x) => void (x.letter.envelopeLabel = v))} />
      </Card>

      <Card title="The letter" hint="The opening and closing lines are written in handwriting. Your name signs it (set under General).">
        <Text label="Opening line" value={l.salutation} onChange={(v) => edit((x) => void (x.letter.salutation = v))} />
        <StringList
          label="Paragraphs"
          hint="One box per paragraph. Press Enter inside a box for a line break."
          items={l.paragraphs}
          long
          addLabel="Add a paragraph"
          onChange={(v) => edit((x) => void (x.letter.paragraphs = v))}
        />
        <LongText label="Sign-off" rows={1} value={l.closing} onChange={(v) => edit((x) => void (x.letter.closing = v))} />
      </Card>
    </div>
  );
}
