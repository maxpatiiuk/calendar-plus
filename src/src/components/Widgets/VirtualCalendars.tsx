import React from 'react';

import { useId } from '../../hooks/useId';
import { useSafeStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import { f } from '../../utils/functools';
import type { RA, RR } from '../../utils/types';
import { filterArray } from '../../utils/types';
import { group, removeItem, replaceItem } from '../../utils/utils';
import { Button, Input, Select } from '../Atoms';
import { icon } from '../Atoms/Icon';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { RawEventsStore } from '../EventsStore';
import { cacheEvents } from '../EventsStore';
import { CalendarIndicator } from '../Molecules/CalendarIndicator';
import { CalendarList } from '../Molecules/CalendarList';
import { WidgetContainer } from './WidgetContainer';

export const matchRules = [
  'equals',
  'endsWith',
  'startsWith',
  'contains',
  'regex',
] as const;
export type MatchRule = typeof matchRules[number];

export type VirtualCalendar = {
  readonly calendarId: string;
  readonly rule: MatchRule;
  readonly value: string;
  readonly virtualCalendar?: string;
};

const ruleLabel: RR<MatchRule, string> = {
  equals: commonText('equals'),
  endsWith: commonText('endsWith'),
  startsWith: commonText('startsWith'),
  contains: commonText('contains'),
  regex: commonText('regex'),
};

export function VirtualCalendars({
  label,
  eventsStore,
}: {
  readonly label: string;
  readonly eventsStore: React.MutableRefObject<RawEventsStore> | undefined;
}): JSX.Element {
  const [isEditing, setIsEditing] = React.useState(false);
  const [virtualCalendars, setVirtualCalendars] = useSafeStorage(
    'virtualCalendars',
    []
  );
  const virtualCalendarsRef = React.useRef(virtualCalendars);

  // Don't update the shared state until the user is done editing.
  const [localCalendars, setLocalCalendars] = React.useState<
    RA<VirtualCalendar> | undefined
  >(undefined);
  React.useEffect(() => {
    setLocalCalendars(virtualCalendars);
    virtualCalendarsRef.current = virtualCalendars;
  }, [virtualCalendars]);
  React.useEffect(() => {
    if (isEditing || localCalendars === undefined) return;
    setVirtualCalendars(localCalendars);

    // Clear cache for calendars whose rules changed
    if (eventsStore === undefined) return;
    const indexedOldCalendars = Object.fromEntries(
      group(
        virtualCalendarsRef.current?.map(({ calendarId, ...rest }) => [
          calendarId,
          rest,
        ]) ?? []
      )
    );
    const oldKeys = Object.keys(indexedOldCalendars);
    const indexedNewCalendars = Object.fromEntries(
      group(localCalendars.map(({ calendarId, ...rest }) => [calendarId, rest]))
    );
    const newKeys = Object.keys(indexedNewCalendars);
    const changedKeys = f
      .unique([...oldKeys, ...newKeys])
      .filter(
        (calendarId) =>
          JSON.stringify(indexedOldCalendars[calendarId] ?? []) !==
          JSON.stringify(indexedNewCalendars[calendarId] ?? [])
      );
    if (changedKeys.length === 0) return;
    changedKeys.forEach((changedKey) => {
      eventsStore.current[changedKey] = {};
    });
    cacheEvents.trigger('changed');
  }, [isEditing, localCalendars, setVirtualCalendars]);

  const calendars = React.useContext(CalendarsContext)!;
  return (
    <WidgetContainer editing={[isEditing, setIsEditing]} header={label}>
      {Array.isArray(virtualCalendars) ? (
        !isEditing && virtualCalendars.length === 0 ? (
          commonText('noVirtualCalendars')
        ) : isEditing ? (
          <EditableCalendarList
            calendars={calendars}
            virtualCalendars={localCalendars ?? virtualCalendars}
            onChange={setLocalCalendars}
          />
        ) : (
          <Calendars
            calendars={calendars}
            virtualCalendars={localCalendars ?? virtualCalendars}
          />
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
    <Table>
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
    </Table>
  );
}

function Table({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <table className="text-left">
      <thead>
        <tr>
          <td />
          <th scope="col">{commonText('sourceCalendar')}</th>
          <th scope="col">{commonText('matchRule')}</th>
          <th scope="col">{commonText('value')}</th>
          <th scope="col">{commonText('category')}</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
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
  const categories = React.useMemo(
    () =>
      Object.fromEntries(
        group(
          virtualCalendars.map(({ calendarId, virtualCalendar }) => [
            calendarId,
            virtualCalendar,
          ])
        ).map(([calendarId, categories]) => [
          calendarId,
          filterArray(f.unique(categories)),
        ])
      ),
    []
  );
  const id = useId('virtual-calendar');

  return (
    <>
      {calendars.map(({ id: calendarId }) => (
        <datalist id={id(calendarId)} key={calendarId}>
          {(categories[calendarId] ?? []).map((category, index) => (
            <option key={index} value={category} />
          ))}
        </datalist>
      ))}
      <Table>
        {virtualCalendars.map((definition, index) => {
          const { calendarId, rule, value, virtualCalendar } = definition;
          const handleEdited = (
            newDefinition: Partial<VirtualCalendar>
          ): void =>
            handleChange(
              replaceItem(virtualCalendars, index, {
                ...definition,
                ...newDefinition,
              })
            );
          const calendar: CalendarListEntry | undefined = calendars.find(
            ({ id }) => id === calendarId
          );
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
                    placeholder={rule === 'regex' ? 'a*b+c?' : undefined}
                    required
                    value={value}
                    onValueChange={(value): void => handleEdited({ value })}
                  />
                </div>
              </td>
              <td>
                <div className="flex">
                  <Input.Text
                    list={id(calendar.id)}
                    placeholder={calendar.summary}
                    value={virtualCalendar ?? ''}
                    onValueChange={(virtualCalendar): void =>
                      handleEdited({
                        virtualCalendar: virtualCalendar || undefined,
                      })
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
                    calendarId:
                      virtualCalendars.at(-1)?.calendarId ?? calendars[0].id,
                    rule: virtualCalendars.at(-1)?.rule ?? 'equals',
                    value: '',
                    virtualCalendar: '',
                  },
                ])
              }
            >
              {commonText('addPrediction')}
            </Button.White>
          </td>
        </tr>
      </Table>
    </>
  );
}
