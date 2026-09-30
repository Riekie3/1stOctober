import type { ContentBundle } from "../content/types";
import { ITINERARY_ICONS } from "../content/types";

export interface Problem {
  section: "general" | "itinerary" | "letter" | "love" | "memories";
  message: string;
}

const isTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
const isDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(`${d}T00:00`).getTime());
const blank = (s: unknown) => typeof s !== "string" || s.trim() === "";

/** Everything that would break or look broken on the live site. */
export function validate(c: ContentBundle): Problem[] {
  const p: Problem[] = [];
  const s = c.site;

  if (blank(s.girlfriendName)) p.push({ section: "general", message: "Her name is empty." });
  if (blank(s.boyfriendName)) p.push({ section: "general", message: "Your name is empty." });
  if (!isDate(s.birthdayDate)) p.push({ section: "general", message: "The birthday date isn't a valid date." });
  if (!isTime(s.menu.sealed.opensAt)) p.push({ section: "general", message: "The time the sealed cards open isn't a valid time." });
  if (!(s.music.volume >= 0 && s.music.volume <= 1)) p.push({ section: "general", message: "Music volume must be between 0 and 1." });
  if (blank(s.introduction.title)) p.push({ section: "general", message: "The welcome title is empty." });
  if (s.introduction.noTeases.length === 0) p.push({ section: "general", message: "Add at least one NO-button tease." });
  const mins = s.itinerary.unlockMinutesBefore;
  if (!Number.isInteger(mins) || mins < 0 || mins > 240) p.push({ section: "itinerary", message: "“Reveal minutes before” must be a whole number from 0 to 240." });
  if (!isTime(s.itinerary.dayEndsAt)) p.push({ section: "itinerary", message: "“Day ends at” isn't a valid time." });

  if (c.itinerary.length === 0) p.push({ section: "itinerary", message: "The itinerary needs at least one stop." });
  const times = new Set<string>();
  c.itinerary.forEach((e, i) => {
    const n = `Stop ${i + 1}`;
    if (!isTime(e.time)) p.push({ section: "itinerary", message: `${n}: the time isn't valid.` });
    else if (times.has(e.time)) p.push({ section: "itinerary", message: `${n}: another stop already uses ${e.time}.` });
    times.add(e.time);
    if (blank(e.title)) p.push({ section: "itinerary", message: `${n}: the title is empty.` });
    if (!ITINERARY_ICONS.includes(e.icon)) p.push({ section: "itinerary", message: `${n}: pick an icon.` });
  });

  if (blank(c.letter.salutation)) p.push({ section: "letter", message: "The letter's opening line is empty." });
  if (c.letter.paragraphs.filter((x) => !blank(x)).length === 0) p.push({ section: "letter", message: "The letter has no paragraphs." });

  c.loveNotes.forEach((n, i) => {
    if (blank(n.title)) p.push({ section: "love", message: `Reason ${i + 1}: the title is empty.` });
  });

  c.memories.forEach((m, i) => {
    if (blank(m.src)) p.push({ section: "memories", message: `Memory ${i + 1}: the file is missing.` });
    if (blank(m.caption)) p.push({ section: "memories", message: `Memory ${i + 1}: add a caption.` });
  });

  return p;
}
