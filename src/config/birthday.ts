/**
 * Personal settings — names, date, song and all page wording.
 * The values live in src/content/site.json (edit there, or through /admin).
 */
import { content } from "../content";
import type { SiteContent } from "../content/types";

export const birthdayConfig: SiteContent = content.site;
export type BirthdayConfig = SiteContent;
