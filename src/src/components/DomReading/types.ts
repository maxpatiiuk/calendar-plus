export type RawDomEvent = {
  /*
   * Because of RTL, you can't trust that the aria string will have start time
   * before end time. Fortunately, we know for a fact that the time dom node
   * will include the start time, so the other time mentioned in the aria string
   * must be the end time.
   */
  readonly aria: string;
  readonly summary: string;
  readonly times: string;
  readonly calendarId: string;
  // top < parent.clientHeight/2
  readonly amStart: boolean;
  // top+height > parent.clientHeight/2 - 3px
  readonly amEnd: boolean;
  // top <= 1
  readonly touchesTop: boolean;
  // does not have data-dragsource-type
  /*
   * NOTE: if event duration is 15 min but settings say to display
   * "15 min events as 30 min", then it may touch the bottom, despite not
   * lasting till midnight
   */
  readonly touchesBottom: boolean;
  readonly previousDayNumber: number;
  readonly todayDayNumber: number;
  readonly nextDayNumber: number;
};

export type ParsedDomEvent = {
  readonly calendarId: string;
  readonly summary: string;
  readonly startTime: number;
  readonly endTime: number;
};
