import { extractCalendarId, notEvent } from './index';
import { ParsedDomEvent } from './types';

export function parseAllDayEventNode(
  allDayEvent: HTMLElement,
): ParsedDomEvent | typeof notEvent | string {
  const eventContainer = allDayEvent.parentElement;
  if (eventContainer === null)
    return 'Failed to locate all-day event container';

  const calendarId = extractCalendarId(eventContainer);
  if (calendarId === undefined) {
    return notEvent;
  }

  const summary =
    Array.from(allDayEvent.children).find((child) => child.ariaHidden)
      ?.textContent ?? undefined;
  if (summary === undefined) {
    return 'Failed to read the all day event name';
  }

  return {
    calendarId,
    summary,
    /**
     * Minor bug: event that lasts more than 24hr may have precise start and end
     * time, but we treat it as 0-24. Because of am/pm ambiguity, we can't
     * decode the event start/end time from events that are rendered as all day
     * events, without hardcoding the precise string that is rendered for am/pm
     * in each language Google Calendar supports - I very much want to avoid
     * that as language formatting can change, break thing, and I won't be there
     * to notice the breakage since my Google Calendar is only in English.
     *
     * Two possible solutions:
     * - disable dom reading if ignoreAllDayEvents=false
     * - setup E2E Google Calendar tests for every language in 24hr and am/pm
     *   combination
     *   - then, I can hardcode language specific parsing logic with comfort,
     *     and simplify a lot of DOM reading.
     *   - though if I am doing that, then it might be worth it to reverse
     *     engineer Google's bundled JavaScript for the place where language
     *     formatting is stored - Google has separate JavaScript bundle for
     *     each language, at a separate URL, so the formatting is in the same
     *     place in each bundle (but of course bundle structure itself can
     *     change)
     */
    startTime: 0,
    endTime: 24,
  };
}
