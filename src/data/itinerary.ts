/**
 * The day's plan. The stops live in src/content/itinerary.json
 * (edit there, or through /admin).
 */
import { content } from "../content";
export type { ItineraryEvent, ItineraryIcon } from "../content/types";

export const itinerary = content.itinerary;
