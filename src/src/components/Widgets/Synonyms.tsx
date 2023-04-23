import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import { removeItem, replaceItem } from '../../utils/utils';
import { Button, Input } from '../Atoms';
import { icons } from '../Atoms/Icon';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { CalendarIndicator } from '../Molecules/CalendarIndicator';
import { CalendarList } from '../Molecules/CalendarList';
import { WidgetContainer } from './WidgetContainer';

export type Synonym = {
  readonly calendar: string;
  readonly synonym: string;
};

/**
 * Show list of configured calendar synonyms and allow to edit them
 */
export function Synonyms({ label }: { readonly label: string }): JSX.Element {
  const [synonyms, setSynonyms] = useStorage('synonyms');
  const editing = React.useState<boolean>(false);
  const [isEditing] = editing;
  const calendars = React.useContext(CalendarsContext);

  const getJsonExport = () =>
    synonyms?.map(({ calendar, synonym }) => ({
      calendar:
        calendars?.find(({ id }) => id === calendar)?.summary ?? calendar,
      synonym,
    })) ?? [];

  const getTsvExport = () =>
    getJsonExport().map(({ calendar, synonym }) => ({
      [commonText('calendar')]: calendar,
      [commonText('shortName')]: synonym,
    })) ?? [];

  return (
    <WidgetContainer
      editing={editing}
      getJsonExport={getJsonExport}
      getTsvExport={getTsvExport}
      header={label}
    >
      {Array.isArray(calendars) && Array.isArray(synonyms) ? (
        <table className="text-left">
          <thead>
            <tr>
              <td />
              <th scope="col">{commonText('calendar')}</th>
              <th scope="col">{commonText('shortName')}</th>
            </tr>
          </thead>
          <tbody>
            {synonyms.map(({ calendar: calendarId, synonym }, index) => {
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
                          setSynonyms(removeItem(synonyms, index))
                        }
                      >
                        {icons.trash}
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
                          setSynonyms(
                            replaceItem(synonyms, index, {
                              calendar,
                              synonym,
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
                        value={synonym}
                        onValueChange={(synonym): void =>
                          setSynonyms(
                            replaceItem(synonyms, index, {
                              calendar: calendarId,
                              synonym,
                            })
                          )
                        }
                      />
                    ) : (
                      synonym
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
                      setSynonyms([
                        ...synonyms,
                        { calendar: calendars[0].id, synonym: '' },
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
