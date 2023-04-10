import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import { removeItem } from '../../utils/utils';
import { Button, Ul } from '../Atoms';
import { ghostEventShortcuts } from '../Preferences/definitions';
import { usePref } from '../Preferences/usePref';
import { WidgetContainer } from './WidgetContainer';

export function GhostedEvents({
  label,
}: {
  readonly label: string;
}): JSX.Element {
  const [ghostedEvents, setGhostedEvents] = useStorage('ghostEvents');
  const [ghostEventShortcut] = usePref('feature', 'ghostEventShortcut');
  const isDisabled = ghostEventShortcut === 'none';
  const shortcutLabel = ghostEventShortcuts.find(
    ({ value }) => value === ghostEventShortcut
  )?.title;

  const getJsonExport = () => ghostedEvents ?? [];

  const getTsvExport = () =>
    getJsonExport().map((ghostedEvent) => ({
      [commonText('ghostedEvents')]: ghostedEvent,
    })) ?? [];

  return (
    <WidgetContainer
      editing={undefined}
      getJsonExport={getJsonExport}
      getTsvExport={getTsvExport}
      header={label}
    >
      {ghostedEvents === undefined ? (
        commonText('loading')
      ) : isDisabled ? (
        commonText('eventGhostingDisabled')
      ) : (
        <>
          {typeof shortcutLabel === 'string' &&
            commonText('ghostEventInstruction', shortcutLabel)}
          {ghostedEvents.length === 0 ? (
            commonText('noGhostedEvents')
          ) : (
            <Ul className="flex flex-col gap-2">
              {ghostedEvents.map((name, index) => (
                <li className="flex flex-wrap gap-2" key={index}>
                  <span className="flex-1">{name}</span>
                  <Button.Icon
                    icon="x"
                    title={commonText('remove')}
                    onClick={(): void =>
                      setGhostedEvents(removeItem(ghostedEvents, index))
                    }
                  />
                </li>
              ))}
            </Ul>
          )}
        </>
      )}
    </WidgetContainer>
  );
}
