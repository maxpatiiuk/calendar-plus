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
    startTime: 0,
    endTime: 24,
  };
}
