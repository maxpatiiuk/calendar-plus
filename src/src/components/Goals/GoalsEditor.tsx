import { GetSet, RA } from '../../utils/types';
import { SupportedView } from '../Contexts/CurrentViewContext';
import { CalendarListEntry } from '../Contexts/CalendarsContext';
import { Button, Select } from '../Atoms';
import { commonText } from '../../localization/common';
import { removeItem, replaceItem } from '../../utils/utils';
import { icon } from '../Atoms/Icon';
import { DurationPicker } from '../Molecules/DurationPicker';
import React from 'react';
import { Goal } from './Widget';

export function GoalsEditor({
  goals: [goals, setGoals],
  currentView,
  calendars,
}: {
  readonly goals: GetSet<RA<Goal>>;
  readonly currentView: SupportedView;
  readonly calendars: RA<CalendarListEntry>;
}) {
  return (
    <>
      {goals.map((goal, index) =>
        goal.view === currentView ? (
          <div className="flex gap-2" key={index}>
            <Button.Red
              title={commonText('remove')}
              aria-label={commonText('remove')}
              onClick={(): void => setGoals(removeItem(goals, index))}
              className="!p-1"
            >
              {icon.trash}
            </Button.Red>
            <Select
              value={goal.calendarId}
              onValueChange={(calendarId): void =>
                setGoals(
                  replaceItem(goals, index, {
                    ...goal,
                    calendarId,
                  })
                )
              }
              title={commonText('calendar')}
              aria-label={commonText('calendar')}
              required
            >
              {calendars.map(({ id, summary }) => (
                <option key={id} value={id}>
                  {summary}
                </option>
              ))}
            </Select>
            <DurationPicker
              value={goal.duration}
              onChange={(duration): void =>
                setGoals(
                  replaceItem(goals, index, {
                    ...goal,
                    duration,
                  })
                )
              }
            />
          </div>
        ) : undefined
      )}
      <div>
        <Button.White
          onClick={(): void =>
            setGoals([
              ...goals,
              {
                calendarId: calendars[0].id,
                duration: 0,
                view: currentView,
              },
            ])
          }
        >
          {commonText('addGoal')}
        </Button.White>
      </div>
    </>
  );
}
