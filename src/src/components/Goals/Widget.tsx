import React from 'react';

import { useSimpleStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import type { RA } from '../../utils/types';
import { formatDuration } from '../Atoms/Internationalization';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { SupportedView } from '../Contexts/CurrentViewContext';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import type { EventsStore } from '../EventsStore';
import { Gage } from '../Molecules/Gage';
import { WidgetContainer } from '../Widgets/WidgetContainer';
import { GoalsEditor } from './GoalsEditor';

export type Goal = {
  readonly calendarId: string;
  readonly virtualCalendar?: string;
  readonly duration: number;
  readonly view: SupportedView;
};

export function GoalsWidget({
  label,
  durations,
}: {
  readonly label: string;
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const [goals, setGoals] = useSimpleStorage('goals', []);
  const calendars = React.useContext(CalendarsContext);
  const [isEditing, setIsEditing] = React.useState(false);
  const { view: currentView } = React.useContext(CurrentViewContext)!;

  const doJsonExport = () =>
    goals
      ?.filter(({ view }) => view === currentView)
      .map(({ calendarId, ...rest }) => ({
        calendarName:
          calendars?.find(({ id }) => id === calendarId)?.summary ?? calendarId,
        completed:
          typeof durations?.[calendarId] === 'object'
            ? computeGoal(durations[calendarId], rest.virtualCalendar)
            : 0,
        ...rest,
      })) ?? [];

  const doTsvExport = () =>
    doJsonExport().map(
      ({ calendarName, virtualCalendar, duration, completed, view }) => ({
        [commonText('calendar')]: calendarName,
        [commonText('virtualCalendar')]: virtualCalendar,
        [commonText('perDuration')]: view,
        [commonText('goal')]: formatDuration(duration),
        [commonText('completed')]: formatDuration(completed),
      })
    );

  return (
    <WidgetContainer
      editing={[isEditing, setIsEditing]}
      getJsonExport={doJsonExport}
      getTsvExport={doTsvExport}
      header={label}
    >
      {goals === undefined || calendars === undefined ? (
        commonText('loading')
      ) : isEditing ? (
        <GoalsEditor
          calendars={calendars}
          currentView={currentView}
          goals={[goals, setGoals]}
        />
      ) : (
        <Goals
          calendars={calendars}
          durations={durations}
          goals={goals.filter(({ view }) => view === currentView)}
        />
      )}
    </WidgetContainer>
  );
}

const size = 7;
const fontSize = 1.5;

function Goals({
  goals,
  durations,
  calendars,
}: {
  readonly goals: RA<Goal>;
  readonly durations: EventsStore | undefined;
  readonly calendars: RA<CalendarListEntry>;
}): JSX.Element {
  const hasGoals = goals.length > 0;
  return typeof durations === 'object' ? (
    <div
      className={`
        grid flex-1 gap-2
        ${
          hasGoals
            ? 'grid-cols-[repeat(auto-fill,var(--size))] items-center justify-evenly'
            : ''
        }
      `}
      style={{ '--size': `${size}rem` } as React.CSSProperties}
    >
      {hasGoals
        ? goals.map((goal, index) => (
            <GoalComponent
              calendars={calendars}
              durations={durations}
              goal={goal}
              key={index}
            />
          ))
        : commonText('noGoals')}
    </div>
  ) : (
    <>{commonText('loading')}</>
  );
}

function GoalComponent({
  goal: { calendarId, virtualCalendar, duration: goalDuration },
  durations,
  calendars,
}: {
  readonly goal: Goal;
  readonly durations: EventsStore;
  readonly calendars: RA<CalendarListEntry>;
}): JSX.Element | null {
  const calendar = calendars.find(({ id }) => id === calendarId);
  const currentDurations = durations[calendarId];
  const currentDuration = React.useMemo(
    () => computeGoal(currentDurations, virtualCalendar),
    [currentDurations, virtualCalendar]
  );
  return typeof calendar === 'object' ? (
    <Gage
      color={calendar.backgroundColor}
      fontSize={fontSize}
      label={`${
        virtualCalendar === undefined
          ? calendar.summary
          : `${virtualCalendar} (${calendar.summary})`
      } - ${commonText(
        'aOutOfB',
        formatDuration(currentDuration),
        formatDuration(goalDuration)
      )}`}
      max={goalDuration}
      size={size}
      value={currentDuration}
    />
  ) : null;
}

function computeGoal(
  currentDurations: EventsStore[string],
  virtualCalendar?: string
): number {
  const durations =
    virtualCalendar === undefined
      ? Object.values(currentDurations ?? {}).flatMap((durations) =>
          Object.values(durations)
        )
      : Object.values(currentDurations?.[virtualCalendar] ?? {});
  return durations.reduce((total, value) => total + value.total, 0);
}
