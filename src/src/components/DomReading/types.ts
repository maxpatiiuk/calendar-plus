export type RawDomEvent = {
  /*
   * Because of RTL, you can't trust that the aria string will have start time
   * before end time. Fortunately, we know for a fact that the time dom node
   * will include the start time, so the other time mentioned in the aria string
   * must be the end time.
   */
  readonly aria: string;
  readonly summary: string;
  readonly calendarId: string;
  readonly touchesTop: boolean;
};

export type ParsedDomEvent = {
  readonly calendarId: string;
  readonly summary: string;
  readonly startTime: number;
  readonly endTime: number;
};
