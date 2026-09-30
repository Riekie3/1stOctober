import type { ContentBundle } from "../../content/types";
import { Card, DateInput, LongText, NumberInput, Row, StringList, Text, TimeInput, Toggle } from "../fields";
import { edit } from "../store";

const CARD_KEYS = [
  ["itinerary", "01 · The Day Ahead"],
  ["wish", "02 · A Little Wish"],
  ["memories", "03 · Our Memories"],
  ["love", "04 · Why I Love You"],
] as const;

export default function General({ d }: { d: ContentBundle }) {
  const s = d.site;
  return (
    <div className="space-y-6">
      <Card title="Names & date">
        <Row>
          <Text label="Her name" value={s.girlfriendName} onChange={(v) => edit((x) => void (x.site.girlfriendName = v))} />
          <Text label="Your name" hint="Signs the letter and the final message." value={s.boyfriendName} onChange={(v) => edit((x) => void (x.site.boyfriendName = v))} />
        </Row>
        <DateInput
          label="Birthday"
          hint="The itinerary and the sealed cards unlock on this date, using her phone's clock."
          value={s.birthdayDate}
          onChange={(v) => edit((x) => void (x.site.birthdayDate = v))}
        />
      </Card>

      <Card title="Welcome page">
        <Row>
          <Text label="Small line above the title" value={s.introduction.eyebrow} onChange={(v) => edit((x) => void (x.site.introduction.eyebrow = v))} />
          <Text label="Title" value={s.introduction.title} onChange={(v) => edit((x) => void (x.site.introduction.title = v))} />
        </Row>
        <StringList
          label="Message (one line each)"
          items={s.introduction.message}
          addLabel="Add a line"
          onChange={(v) => edit((x) => void (x.site.introduction.message = v))}
        />
        <Text label="Question" value={s.introduction.question} onChange={(v) => edit((x) => void (x.site.introduction.question = v))} />
        <Row>
          <Text label="YES button" value={s.introduction.yesLabel} onChange={(v) => edit((x) => void (x.site.introduction.yesLabel = v))} />
          <Text label="NO button" value={s.introduction.noLabel} onChange={(v) => edit((x) => void (x.site.introduction.noLabel = v))} />
        </Row>
        <StringList
          label="Teases when she tries to press NO"
          hint="Shown one after another, then they repeat."
          items={s.introduction.noTeases}
          addLabel="Add a tease"
          onChange={(v) => edit((x) => void (x.site.introduction.noTeases = v))}
        />
      </Card>

      <Card title="Menu">
        <Row>
          <Text label="Title" value={s.menu.title} onChange={(v) => edit((x) => void (x.site.menu.title = v))} />
          <Text label="Subtitle" value={s.menu.subtitle} onChange={(v) => edit((x) => void (x.site.menu.subtitle = v))} />
        </Row>
        <div className="grid gap-4 lg:grid-cols-2">
          {CARD_KEYS.map(([key, name]) => (
            <div key={key} className="rounded-xl border border-gold/15 bg-ivory/50 p-4">
              <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">{name}</p>
              <div className="space-y-3">
                <Text label="Card title" value={s.menu.cards[key].title} onChange={(v) => edit((x) => void (x.site.menu.cards[key].title = v))} />
                <Text label="Card line" value={s.menu.cards[key].line} onChange={(v) => edit((x) => void (x.site.menu.cards[key].line = v))} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Sealed cards" hint="These cards stay blurred and locked until the time below on the birthday.">
        <div className="grid gap-2 sm:grid-cols-2">
          {CARD_KEYS.map(([key, name]) => (
            <Toggle
              key={key}
              label={name}
              checked={s.menu.sealed.cards.includes(key)}
              onChange={(on) =>
                edit((x) => {
                  const set = new Set(x.site.menu.sealed.cards);
                  if (on) set.add(key);
                  else set.delete(key);
                  x.site.menu.sealed.cards = CARD_KEYS.map(([k]) => k).filter((k) => set.has(k));
                })
              }
            />
          ))}
        </div>
        <Row>
          <TimeInput label="They open at" value={s.menu.sealed.opensAt} onChange={(v) => edit((x) => void (x.site.menu.sealed.opensAt = v))} />
          <Text label="Note under the cards while sealed" value={s.menu.sealed.footnote} onChange={(v) => edit((x) => void (x.site.menu.sealed.footnote = v))} />
        </Row>
      </Card>

      <Card title="Page titles">
        <Row>
          <Text label="Memories — title" value={s.memories.title} onChange={(v) => edit((x) => void (x.site.memories.title = v))} />
          <Text label="Memories — subtitle" value={s.memories.subtitle} onChange={(v) => edit((x) => void (x.site.memories.subtitle = v))} />
        </Row>
        <Row>
          <Text label="Love — title" value={s.love.title} onChange={(v) => edit((x) => void (x.site.love.title = v))} />
          <Text label="Love — subtitle" value={s.love.subtitle} onChange={(v) => edit((x) => void (x.site.love.subtitle = v))} />
        </Row>
        <p className="text-[0.76rem] text-taupe">The itinerary's title is under Itinerary, and the letter's title is under Letter.</p>
      </Card>

      <Card title="Final message" hint="The closing scene at the bottom of “Why I Love You”.">
        <Text label="First line" value={s.finale.thankYou} onChange={(v) => edit((x) => void (x.site.finale.thankYou = v))} />
        <Text
          label="Birthday line"
          hint="{name} is replaced with her name."
          value={s.finale.birthdayLine}
          onChange={(v) => edit((x) => void (x.site.finale.birthdayLine = v))}
        />
        <LongText label="Closing line" value={s.finale.closing} rows={2} onChange={(v) => edit((x) => void (x.site.finale.closing = v))} />
      </Card>

      <Card title="Song" hint="The file itself is public/assets/music/sempurna.mp3.">
        <Row>
          <Text label="Title" value={s.music.title} onChange={(v) => edit((x) => void (x.site.music.title = v))} />
          <Text label="Artist" value={s.music.artist} onChange={(v) => edit((x) => void (x.site.music.artist = v))} />
        </Row>
        <NumberInput
          label="Starting volume"
          hint="0 = silent, 1 = full. Currently a gentle 0.55."
          value={s.music.volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => edit((x) => void (x.site.music.volume = v))}
        />
      </Card>
    </div>
  );
}
