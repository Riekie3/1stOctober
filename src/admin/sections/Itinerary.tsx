import { itineraryIcons } from "../../components/EventCard";
import { ITINERARY_ICONS, type ContentBundle, type ItineraryIcon } from "../../content/types";
import { formatTime } from "../../lib/schedule";
import { AddButton, Card, ItemTools, LongText, NumberInput, Row, Text, TimeInput, Toggle, move } from "../fields";
import { edit } from "../store";

const ICON_NAMES: Record<ItineraryIcon, string> = {
  car: "Drive",
  food: "Food",
  coffee: "Coffee",
  activity: "Activity",
  sea: "Aquarium / sea",
  snow: "Snow / cold",
  rest: "Rest",
  evening: "Evening",
  dinner: "Dinner",
  gift: "Gift",
  camera: "Photos",
};

export default function Itinerary({ d }: { d: ContentBundle }) {
  const s = d.site.itinerary;
  const stops = d.itinerary;

  return (
    <div className="space-y-6">
      <Card title="Itinerary page">
        <Text label="Title" value={s.title} onChange={(v) => edit((x) => void (x.site.itinerary.title = v))} />
        <LongText label="Subtitle" rows={2} value={s.subtitle} onChange={(v) => edit((x) => void (x.site.itinerary.subtitle = v))} />
        <Row>
          <NumberInput
            label="Reveal each stop this many minutes before"
            value={s.unlockMinutesBefore}
            min={0}
            max={240}
            onChange={(v) => edit((x) => void (x.site.itinerary.unlockMinutesBefore = v))}
          />
          <TimeInput
            label="The day ends at"
            hint="After this, the last stop shows as visited."
            value={s.dayEndsAt}
            onChange={(v) => edit((x) => void (x.site.itinerary.dayEndsAt = v))}
          />
        </Row>
        <Text label="Message when a stop unlocks" value={s.revealToast} onChange={(v) => edit((x) => void (x.site.itinerary.revealToast = v))} />
      </Card>

      <Card title="Stops" hint="They're shown in time order on the site, whatever the order here.">
        {stops.map((e, i) => {
          const Icon = itineraryIcons[e.icon];
          const t = formatTime(e.time || "00:00");
          return (
            <div key={e.id} className="rounded-xl border border-gold/15 bg-ivory/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-cream text-gold-deep">{Icon && <Icon size={16} strokeWidth={1.6} />}</span>
                  <p className="truncate font-display text-[1.2rem] text-ink">
                    <span className="tabular-nums text-gold-deep">
                      {t.clock} {t.suffix}
                    </span>{" "}
                    · {e.title || "Untitled stop"}
                  </p>
                </div>
                <ItemTools
                  index={i}
                  count={stops.length}
                  onMove={(dir) => edit((x) => move(x.itinerary, i, dir))}
                  onRemove={() => confirm(`Remove “${e.title || "this stop"}”?`) && edit((x) => void x.itinerary.splice(i, 1))}
                  removeLabel="Remove stop"
                />
              </div>
              <div className="space-y-3">
                <Row>
                  <TimeInput label="Time" value={e.time} onChange={(v) => edit((x) => void (x.itinerary[i].time = v))} />
                  <div>
                    <p className="mb-1.5 text-[0.78rem] font-semibold text-ink-soft">Icon</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ITINERARY_ICONS.map((key) => {
                        const I = itineraryIcons[key];
                        const on = e.icon === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            title={ICON_NAMES[key]}
                            aria-label={ICON_NAMES[key]}
                            aria-pressed={on}
                            onClick={() => edit((x) => void (x.itinerary[i].icon = key))}
                            className={`grid h-9 w-9 place-items-center rounded-lg border transition ${on ? "border-gold bg-gold text-cream" : "border-gold/25 bg-white text-gold-deep hover:border-gold"}`}
                          >
                            <I size={16} strokeWidth={1.6} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Row>
                <Row>
                  <Text label="Title" value={e.title} onChange={(v) => edit((x) => void (x.itinerary[i].title = v))} />
                  <Text label="Location" hint="Optional." value={e.location} onChange={(v) => edit((x) => void (x.itinerary[i].location = v))} />
                </Row>
                <Text label="Short description" value={e.description} onChange={(v) => edit((x) => void (x.itinerary[i].description = v))} />
                <Text
                  label="Clue while it's still locked"
                  hint="Optional. Leave empty for no clue."
                  value={e.clue ?? ""}
                  onChange={(v) =>
                    edit((x) => {
                      if (v) x.itinerary[i].clue = v;
                      else delete x.itinerary[i].clue;
                    })
                  }
                />
                <Toggle
                  label="Always visible"
                  hint="Never hidden — use it for the first stop."
                  checked={e.alwaysVisible}
                  onChange={(v) => edit((x) => void (x.itinerary[i].alwaysVisible = v))}
                />
              </div>
            </div>
          );
        })}
        <AddButton
          onClick={() =>
            edit((x) => {
              const id = Math.max(0, ...x.itinerary.map((e) => e.id)) + 1;
              const last = [...x.itinerary].sort((a, b) => a.time.localeCompare(b.time)).pop();
              const [h, m] = (last?.time ?? "20:00").split(":").map(Number);
              const time = `${String(Math.min(23, h + 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
              x.itinerary.push({ id, time, title: "", location: "", description: "", icon: "activity", alwaysVisible: false });
            })
          }
        >
          Add a stop
        </AddButton>
      </Card>
    </div>
  );
}
