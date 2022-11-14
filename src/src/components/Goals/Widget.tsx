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
  return (
    <WidgetContainer editing={[isEditing, setIsEditing]} header={label}>
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
  return typeof durations === 'object' ? (
    <div
      className={`
        grid flex-1 grid-cols-[repeat(auto-fill,var(--size))] items-center
        justify-evenly gap-2
      `}
      style={{ '--size': `${size}rem` } as React.CSSProperties}
    >
      {goals.length === 0
        ? commonText('noGoals')
        : goals.map((goal, index) => (
            <GoalComponent
              calendars={calendars}
              durations={durations}
              goal={goal}
              key={index}
            />
          ))}
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
  const currentDuration = React.useMemo(() => {
    const durations =
      virtualCalendar === undefined
        ? Object.values(currentDurations ?? {}).flatMap((durations) =>
            Object.values(durations)
          )
        : Object.values(currentDurations?.[virtualCalendar] ?? {});
    return durations.reduce((total, value) => total + (value ?? 0), 0);
  }, [currentDurations, virtualCalendar]);
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
