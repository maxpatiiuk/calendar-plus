import React from 'react';
import { commonText } from '../../localization/common';
import { WidgetContainer } from '../Widgets/WidgetContainer';
import { useStorage } from '../../hooks/useStorage';
import {
  CurrentViewContext,
  SupportedView,
} from '../Contexts/CurrentViewContext';
import {
  CalendarListEntry,
  CalendarsContext,
} from '../Contexts/CalendarsContext';
import { RA } from '../../utils/types';
import { EventsStore } from '../EventsStore';
import { GoalsEditor } from './GoalsEditor';
import { Gage } from '../Molecules/Gage';
import { formatDuration } from '../Atoms/Internationalization';

export type Goal = {
  readonly calendarId: string;
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
  const [goals, setGoals] = useStorage('goals', []);
  const calendars = React.useContext(CalendarsContext);
  const [isEditing, setIsEditing] = React.useState(false);
  const { view: currentView } = React.useContext(CurrentViewContext)!;
  return (
    <WidgetContainer header={label} editing={[isEditing, setIsEditing]}>
      {goals === undefined || calendars === undefined ? (
        commonText('loading')
      ) : isEditing ? (
        <GoalsEditor
          goals={[goals, setGoals]}
          calendars={calendars}
          currentView={currentView}
        />
      ) : (
        <Goals
          goals={goals.filter(({ view }) => view === currentView)}
          durations={durations}
          calendars={calendars}
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
              key={index}
              goal={goal}
              durations={durations}
              calendars={calendars}
            />
          ))}
    </div>
  ) : (
    <>{commonText('loading')}</>
  );
}

function GoalComponent({
  goal: { calendarId, duration: goalDuration },
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
    () =>
      Object.values(currentDurations ?? {}).reduce(
        (total, value) => total + (value ?? 0),
        0
      ),
    [currentDurations]
  );
  return typeof calendar === 'object' ? (
    <Gage
      value={currentDuration}
      max={goalDuration}
      label={`${calendar.summary} - ${commonText(
        'aOutOfB',
        formatDuration(currentDuration),
        formatDuration(goalDuration)
      )}`}
      color={calendar.backgroundColor}
      size={size}
      fontSize={fontSize}
    />
  ) : null;
}
