import React from 'react';

import { useSafeStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import { removeItem, replaceItem } from '../../utils/utils';
import { Button, Input } from '../Atoms';
import { icon } from '../Atoms/Icon';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { CalendarIndicator } from '../Molecules/CalendarIndicator';
import { CalendarList } from '../Molecules/CalendarList';
import { WidgetContainer } from './WidgetContainer';

export type Shortcut = {
  readonly calendar: string;
  readonly shortcut: string;
};

export function Shortcuts({ label }: { readonly label: string }): JSX.Element {
  const [shortcuts, setShortcuts] = useSafeStorage('shortcuts', []);
  const editing = React.useState<boolean>(false);
  const [isEditing] = editing;
  const calendars = React.useContext(CalendarsContext);
  return (
    <WidgetContainer editing={editing} header={label}>
      {Array.isArray(calendars) && Array.isArray(shortcuts) ? (
        <table className="text-left">
          <thead>
            <tr>
              <td />
              <th scope="col">{commonText('calendar')}</th>
              <th scope="col">{commonText('shortName')}</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map(({ calendar: calendarId, shortcut }, index) => {
              const calendar = calendars.find(({ id }) => id === calendarId);
              if (calendar === undefined) return undefined;
              return (
                <tr key={index}>
                  <td>
                    {isEditing ? (
                      <Button.Red
                        aria-label={commonText('remove')}
                        className="!p-1"
                        title={commonText('remove')}
                        onClick={(): void =>
                          setShortcuts(removeItem(shortcuts, index))
                        }
                      >
                        {icon.trash}
                      </Button.Red>
                    ) : (
                      <CalendarIndicator color={calendar.backgroundColor} />
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <CalendarList
                        calendars={calendars}
                        value={calendar.id}
                        onChange={(calendar): void =>
                          setShortcuts(
                            replaceItem(shortcuts, index, {
                              calendar,
                              shortcut,
                            })
                          )
                        }
                      />
                    ) : (
                      calendar.summary
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <Input.Text
                        value={shortcut}
                        onValueChange={(shortcut): void =>
                          setShortcuts(
                            replaceItem(shortcuts, index, {
                              calendar: calendarId,
                              shortcut,
                            })
                          )
                        }
                      />
                    ) : (
                      shortcut
                    )}
                  </td>
                </tr>
              );
            })}
            {isEditing && (
              <tr>
                <td />
                <td colSpan={2}>
                  <Button.White
                    onClick={(): void =>
                      setShortcuts([
                        ...shortcuts,
                        { calendar: calendars[0].id, shortcut: '' },
                      ])
                    }
                  >
                    {commonText('add')}
                  </Button.White>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        commonText('loading')
      )}
    </WidgetContainer>
  );
}
