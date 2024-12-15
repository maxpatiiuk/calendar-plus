import { RA } from '../../utils/types';
import { SupportedView } from '../Contexts/CurrentViewContext';
import { getDatesBetween } from '../EventsStore';
import { parseAllDayEventNode } from './allDayEvents';
import { rawDomEventToParsed } from './parseTime';
import { ParsedDomEvent } from './types';

/**
 * For these views, there is enough information in the DOM to parse each event.
 * In others, data is obscured, especially if there are many events.
 */
export const domReadingEligibleViews = new Set<SupportedView>([
  'day',
  'customday',
  'week',
]);

export function parseEventsFromDom(
  timeMin: Date,
  timeMax: Date,
  ignoreAllDayEvents: boolean,
): RA<RA<ParsedDomEvent>> | string {
  try {
    return parseDom(timeMin, timeMax, ignoreAllDayEvents);
  } catch (error) {
    return String(error);
  }
}

function parseDom(
  timeMin: Date,
  timeMax: Date,
  ignoreAllDayEvents: boolean,
): RA<RA<ParsedDomEvent>> | string {
  const columns = document.querySelectorAll(
    '[role="gridcell"][data-column-index]',
  );
  if (columns.length === 0) return 'Failed to locate day columns';
  const columnsContainer = columns[0].closest('[role="grid"]');
  if (columnsContainer === null) return 'Failed to locate day columns';

  const dayBefore = new Date(timeMin);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const dayAfter = new Date(timeMax);
  dayAfter.setDate(dayAfter.getDate() + 1);
  const dates = getDatesBetween(dayBefore, dayAfter).map((date) =>
    date.getDate(),
  );
  const expectedColumns = dates.length - 2;

  let resolvedColumns = Array.from(columns);
  if (columns.length !== expectedColumns) {
    /**
     * When going between weeks, animation plays. During animation, both old and
     * new set of events are present in the DOM. Picking the first pair
     * randomly, but it doesn't matter much as MutationObserver will call
     * parseDom() again in such case.
     */
    if (columns.length === expectedColumns * 2)
      resolvedColumns = resolvedColumns.slice(0, expectedColumns);
    else
      return `Expected to find ${expectedColumns} columns, but found ${columns.length}`;
  }

  const allDayEventColumns = Array.from(
    columnsContainer.querySelectorAll(
      '[role="gridcell"]:not([data-column-index]',
    ),
    (allDayColumn) =>
      Array.from(
        allDayColumn.querySelectorAll<HTMLElement>('[jslog] > [role="button"]'),
      ),
  );

  if (allDayEventColumns.length !== expectedColumns)
    return `Expected to find ${expectedColumns} all day event columns, but found ${allDayEventColumns.length}`;

  const columnEvents = resolvedColumns.map((column, columnIndex) => {
    const previousDay = dates[columnIndex];
    const today = dates[columnIndex + 1];
    const nextDay = dates[columnIndex + 2];
    const events = Array.from(
      column.querySelectorAll<HTMLElement>('[role="button"][tabindex="0"]'),
      (event) => parseEventNode(event, previousDay, today, nextDay),
    );
    const combinedEvents = ignoreAllDayEvents
      ? events
      : [
          ...events,
          ...allDayEventColumns[columnIndex].map(parseAllDayEventNode),
        ];
    return combinedEvents.filter(excludeNonEvents);
  });

  const flat = columnEvents.flat();

  const errors = flat.filter((entry) => typeof entry === 'string').join('\n');
  // Failed parsing some event
  if (errors.length > 0) return errors;

  return columnEvents as RA<RA<ParsedDomEvent>>;
}

export const notEvent = Symbol('notEvent');
const excludeNonEvents = (
  maybeParsed: ParsedDomEvent | typeof notEvent | string,
): maybeParsed is ParsedDomEvent | string => maybeParsed !== 'notEvent';

function parseEventNode(
  event: HTMLElement,
  previousDayNumber: number,
  todayDayNumber: number,
  nextDayNumber: number,
): ParsedDomEvent | typeof notEvent | string {
  const calendarId = extractCalendarId(event);
  if (calendarId === undefined) {
    return notEvent;
  }
  // If event color differs from calendar color, first element is decorative rather than ariaLabel - offsets our index by 1
  const isAriaLabelFirst = event.children[0]?.ariaHidden === null;
  const aria = isAriaLabelFirst
    ? event.children[0]?.textContent
    : event.children[1]?.textContent;
  if (aria == null) return 'Unable to find event label';
  const container = event.children[1 + (isAriaLabelFirst ? 0 : 1)];
  const titleContainer = container?.children[0]?.children[0]?.children[0];
  /*
   * This is quite fragile to Google Calendar's DOM changes, but, that is ok as
   * we have API calls to fallback to if DOM parsing fails
   */
  const summary = titleContainer?.children[0]?.textContent;
  if (summary == null) return 'Failed to extract event summary';

  // First case for larger events; 2nd case for one-line events
  const timesContainer =
    container?.children[0]?.children[1] ?? titleContainer?.children[2];
  // For one line events with a location data, this span would contain both - pick the first text node
  const times = timesContainer?.childNodes[0].textContent;
  if (times == null) return 'Failed to extract event times';

  const parent = event.parentElement;
  if (parent === null) return 'Expected event node to have a parent';

  if (!event.style.top.endsWith('px'))
    return 'Expected event "top" style to be in px';
  if (!event.style.height.endsWith('px'))
    return 'Expected event "height" style to be in px';

  const top = Number.parseInt(event.style.top.slice(0, -2));
  const height = Number.parseInt(event.style.height.slice(0, -2));
  if (Number.isNaN(top)) return 'Failed to parse event "top" style';
  if (Number.isNaN(height)) return 'Failed to parse event "height" style';

  // FIXME: This is 0 when parent is not visible - remember last height?
  const parentMiddle = parent.clientHeight / 2;
  return rawDomEventToParsed({
    aria,
    summary,
    times,
    calendarId,
    amStart: top < parentMiddle,
    amEnd: top + height < parentMiddle - 3,
    touchesTop: top <= 1,
    touchesBottom: !event.children[event.children.length - 1].hasAttribute(
      'data-dragsource-type',
    ),
    previousDayNumber,
    todayDayNumber,
    nextDayNumber,
  });
}

export function extractCalendarId(event: HTMLElement): string | undefined {
  const calendarId = event.getAttribute('jslog')?.split('"')[3];
  /*
   * If calendarId is undefined, this may be a task, a schedule or other
   * non-event entity. If this is a calendar event and we failed to parse it
   * because event dom changed, then the issue would most likely be present for
   * all events on the page, thus triggering the API fetching fallback
   */
  return calendarId;
}
