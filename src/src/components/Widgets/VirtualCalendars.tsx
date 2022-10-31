import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import type { RA, RR } from '../../utils/types';
import { removeItem, replaceItem } from '../../utils/utils';
import { Button, Input, Select } from '../Atoms';
import { icon } from '../Atoms/Icon';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { CalendarIndicator } from '../Molecules/CalendarIndicator';
import { CalendarList } from '../Molecules/CalendarList';
import { WidgetContainer } from './WidgetContainer';

type MatchRule = 'contains' | 'endsWith' | 'equals' | 'regex' | 'startsWith';

export type VirtualCalendar = {
  readonly calendarId: string;
  readonly rule: MatchRule;
  readonly value: string;
  readonly virtualCalendar: string;
};

const ruleLabel: RR<MatchRule, string> = {
  equals: commonText('equals'),
  startsWith: commonText('startsWith'),
  endsWith: commonText('endsWith'),
  contains: commonText('contains'),
  regex: commonText('regex'),
};

export function VirtualCalendars({
  label,
}: {
  readonly label: string;
}): JSX.Element {
  const [isEditing, setIsEditing] = React.useState(false);
  const [virtualCalendars, setVirtualCalendars] = useStorage(
    'virtualCalendars',
    []
  );

  // Don't update the shared state until the user is done editing.
  const [localCalendars, setLocalCalendars] = React.useState<
    RA<VirtualCalendar> | undefined
  >(undefined);
  React.useEffect(
    () => setLocalCalendars(virtualCalendars),
    [virtualCalendars]
  );
  React.useEffect(
    () =>
      isEditing || localCalendars === undefined
        ? undefined
        : setVirtualCalendars(localCalendars),
    [isEditing, localCalendars, setVirtualCalendars]
  );

  const calendars = React.useContext(CalendarsContext)!;
  return (
    <WidgetContainer editing={[isEditing, setIsEditing]} header={label}>
      {Array.isArray(virtualCalendars) ? (
        !isEditing && virtualCalendars.length === 0 ? (
          commonText('noVirtualCalendars')
        ) : (
          <table className="text-left">
            <thead>
              <tr>
                <td />
                <th scope="col">{commonText('sourceCalendar')}</th>
                <th scope="col">{commonText('matchRule')}</th>
                <th scope="col">{commonText('value')}</th>
                <th scope="col">{commonText('virtualCalendar')}</th>
              </tr>
            </thead>
            <tbody>
              {isEditing ? (
                <EditableCalendarList
                  calendars={calendars}
                  virtualCalendars={localCalendars ?? virtualCalendars}
                  onChange={setVirtualCalendars}
                />
              ) : (
                <Calendars
                  calendars={calendars}
                  virtualCalendars={localCalendars ?? virtualCalendars}
                />
              )}
            </tbody>
          </table>
        )
      ) : (
        commonText('loading')
      )}
    </WidgetContainer>
  );
}

function Calendars({
  virtualCalendars,
  calendars,
}: {
  readonly virtualCalendars: RA<VirtualCalendar>;
  readonly calendars: RA<CalendarListEntry>;
}): JSX.Element {
  return (
    <>
      {virtualCalendars.map(
        ({ calendarId, rule, value, virtualCalendar }, index) => {
          const calendar = calendars.find(({ id }) => id === calendarId);
          return typeof calendar === 'object' ? (
            <tr key={index}>
              <td>
                <CalendarIndicator color={calendar.backgroundColor} />
              </td>
              <td>{calendar.summary}</td>
              <td>{ruleLabel[rule]}</td>
              <td>{value}</td>
              <td>{virtualCalendar}</td>
            </tr>
          ) : undefined;
        }
      )}
    </>
  );
}

function EditableCalendarList({
  virtualCalendars,
  calendars,
  onChange: handleChange,
}: {
  readonly virtualCalendars: RA<VirtualCalendar>;
  readonly calendars: RA<CalendarListEntry>;
  readonly onChange: (virtualCalendars: RA<VirtualCalendar>) => void;
}): JSX.Element {
  return (
    <>
      {virtualCalendars.map((definition, index) => {
        const { calendarId, rule, value, virtualCalendar } = definition;
        const handleEdited = (newDefinition: Partial<VirtualCalendar>): void =>
          handleChange(
            replaceItem(virtualCalendars, index, {
              ...definition,
              ...newDefinition,
            })
          );
        const calendar = calendars.find(({ id }) => id === calendarId);
        return typeof calendar === 'object' ? (
          <tr key={index}>
            <td>
              <Button.Red
                aria-label={commonText('remove')}
                className="!p-1"
                title={commonText('remove')}
                onClick={(): void =>
                  handleChange(removeItem(virtualCalendars, index))
                }
              >
                {icon.trash}
              </Button.Red>
            </td>
            <td>
              <CalendarList
                calendars={calendars}
                value={calendarId}
                onChange={(calendarId): void => handleEdited({ calendarId })}
              />
            </td>
            <td>
              <Select
                required
                value={rule}
                onValueChange={(rule): void =>
                  handleEdited({ rule: rule as MatchRule })
                }
              >
                {Object.entries(ruleLabel).map(([rule, label]) => (
                  <option key={rule} value={rule}>
                    {label}
                  </option>
                ))}
              </Select>
            </td>
            <td>
              {/* FEATURE: provide regex validation */}
              <div className="flex">
                <Input.Text
                  placeholder={rule === 'regex' ? '/abc/i' : undefined}
                  required
                  value={value}
                  onValueChange={(value): void => handleEdited({ value })}
                />
              </div>
            </td>
            <td>
              {/* FEATURE: autocomplete virtualCalendar name based on existing names */}
              <div className="flex">
                <Input.Text
                  placeholder={calendar.summary}
                  value={virtualCalendar}
                  onValueChange={(virtualCalendar): void =>
                    handleEdited({ virtualCalendar })
                  }
                />
              </div>
            </td>
          </tr>
        ) : undefined;
      })}
      <tr>
        <td />
        <td colSpan={4}>
          <Button.White
            onClick={(): void =>
              handleChange([
                ...virtualCalendars,
                {
                  calendarId: calendars[0].id,
                  rule: 'equals',
                  value: '',
                  virtualCalendar: '',
                },
              ])
            }
          >
            {commonText('addGoal')}
          </Button.White>
        </td>
      </tr>
    </>
  );
}
