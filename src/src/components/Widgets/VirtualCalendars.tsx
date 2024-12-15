import React from 'react';

import { useId } from '../../hooks/useId';
import { useStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import { f } from '../../utils/functools';
import type { RA, RR } from '../../utils/types';
import { isDefined } from '../../utils/types';
import { group, removeItem, replaceItem } from '../../utils/utils';
import { Button, Input, Select } from '../Atoms';
import { icons } from '../Atoms/Icon';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { CalendarIndicator } from '../Molecules/CalendarIndicator';
import { CalendarList } from '../Molecules/CalendarList';
import { RegexInput } from '../Molecules/RegexInput';
import { WidgetContainer } from './WidgetContainer';

/**
 * UI for editing autocomplete rules for event names and automatic placement of
 * events into correct calendar.
 *
 * Also handles defining virtual calendars, which are then used by the Doughnut
 * chart and the Time chart to visually partition the event durations
 */
export function VirtualCalendars({
  label,
}: {
  readonly label: string;
}): JSX.Element {
  const [isEditing, setIsEditing] = React.useState(false);
  const [virtualCalendars, setVirtualCalendars] =
    useStorage('virtualCalendars');
  const virtualCalendarsRef = React.useRef(virtualCalendars);
  const isEmpty = (virtualCalendars?.length ?? 0) === 0;

  // Don't update the shared state until the user is done editing.
  const [localCalendars, setLocalCalendars] = React.useState<
    RA<VirtualCalendar> | undefined
  >(undefined);
  React.useEffect(() => {
    setLocalCalendars(virtualCalendars);
    virtualCalendarsRef.current = virtualCalendars;
  }, [virtualCalendars]);
  React.useEffect(
    () =>
      isEditing || localCalendars === undefined
        ? undefined
        : setVirtualCalendars(localCalendars),
    [isEditing, localCalendars, setVirtualCalendars],
  );

  const getJsonExport = () =>
    virtualCalendars?.map(({ calendarId, ...rest }) => ({
      calendar:
        calendars.find(({ id }) => id === calendarId)?.summary ?? calendarId,
      ...rest,
    })) ?? [];

  const getTsvExport = () =>
    getJsonExport().map(({ calendar, rule, value, virtualCalendar }) => ({
      [commonText('sourceCalendar')]: calendar,
      [commonText('matchRule')]: ruleLabel[rule],
      [commonText('value')]: value,
      [commonText('category')]: virtualCalendar,
    }));

  const calendars = React.useContext(CalendarsContext)!;
  return (
    <WidgetContainer
      editing={[isEditing, setIsEditing]}
      getJsonExport={isEmpty ? undefined : getJsonExport}
      getTsvExport={isEmpty ? undefined : getTsvExport}
      header={label}
      className="relative min-h-[theme(spacing.96)]"
    >
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

export const matchRules = [
  'equals',
  'endsWith',
  'startsWith',
  'contains',
  'regex',
] as const;
export type MatchRule = (typeof matchRules)[number];

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
        },
      )}
    </Table>
  );
}

const thClassName = 'bg-white dark:bg-neutral-600 top-0 sticky';

function Table({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <table
      className={`
        calendar-plus-grid-table absolute h-full w-full
        grid-cols-[min-content_auto_auto_auto_auto] overflow-auto text-left
        [&_:is(th,td)]:p-1
      `}
    >
      <thead>
        <tr>
          <td className={thClassName} />
          <th className={thClassName} scope="col">
            {commonText('sourceCalendar')}
          </th>
          <th className={thClassName} scope="col">
            {commonText('matchRule')}
          </th>
          <th className={thClassName} scope="col">
            {commonText('value')}
          </th>
          <th className={thClassName} scope="col">
            {commonText('category')}
          </th>
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
          ]),
        ).map(([calendarId, categories]) => [
          calendarId,
          f.unique(categories).filter(isDefined),
        ]),
      ),
    [],
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
            newDefinition: Partial<VirtualCalendar>,
          ): void =>
            handleChange(
              replaceItem(virtualCalendars, index, {
                ...definition,
                ...newDefinition,
              }),
            );
          const calendar: CalendarListEntry | undefined = calendars.find(
            ({ id }) => id === calendarId,
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
                  {icons.trash}
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
                <div className="flex w-full">
                  {rule === 'regex' ? (
                    <RegexInput
                      value={value}
                      onChange={(value): void => handleEdited({ value })}
                    />
                  ) : (
                    <Input.Text
                      required
                      value={value}
                      onValueChange={(value): void => handleEdited({ value })}
                    />
                  )}
                </div>
              </td>
              <td>
                <div className="flex w-full">
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
            <Button.Default
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
            </Button.Default>
          </td>
        </tr>
      </Table>
    </>
  );
}
