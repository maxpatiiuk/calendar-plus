import React from 'react';

import { useBooleanState } from '../../hooks/useBooleanState';
import { commonText } from '../../localization/common';
import { isDefined, type IR } from '../../utils/types';
import { Button, H3, Link, Widget } from '../Atoms';
import { downloadFile, FilePicker, fileToText } from '../Molecules/FilePicker';
import { PageHeader } from '../Molecules/PageHeader';
import { PreferencesContext } from './Context';
import type {
  GenericPreferencesCategories,
  PreferenceItem,
} from './definitions';
import { noLabelRenderers, preferenceDefinitions } from './definitions';
import { usePref } from './usePref';
import { dateToIso } from '../Atoms/Internationalization';
import { output } from '../Errors/exceptions';
import { storageAdapters } from '../../hooks/useStorage';

export function PreferencesPage({
  onClose: handleClose,
}: {
  readonly onClose: () => void;
}): JSX.Element {
  const [_, setPreferences] = React.useContext(PreferencesContext);
  const [isImporting, handleImport, handleImported] = useBooleanState();

  return isImporting ? (
    <Import onCancel={handleImported} />
  ) : (
    <>
      <PageHeader label={commonText('preferences')}>
        <Link.LikeButton
          href="https://github.com/maxpatiiuk/calendar-plus#calendar-plus"
          rel="noreferrer"
          target="_blank"
        >
          {commonText('aboutExtension')}
        </Link.LikeButton>
        <Link.LikeButton
          href="https://calendar-plus.patii.uk/privacy"
          rel="noreferrer"
          target="_blank"
        >
          {commonText('privacyPolicy')}
        </Link.LikeButton>
        <Button.Default
          onClick={(): void =>
            void fetchDataForExport()
              .then(async (data) =>
                downloadFile(
                  `${commonText('calendarPlus')} - ${dateToIso(
                    new Date(),
                  )}.json`,
                  JSON.stringify(data, null, 4),
                ),
              )
              .catch(output.error)
          }
        >
          {commonText('exportAllSettings')}
        </Button.Default>
        <Button.Default onClick={handleImport}>
          {commonText('importAllSettings')}
        </Button.Default>
        <ResetToDefaultButton onClick={(): void => setPreferences({})} />
        <Button.Default onClick={handleClose}>
          {commonText('close')}
        </Button.Default>
      </PageHeader>
      <div className="flex flex-1 flex-col gap-4">
        {Object.entries(
          preferenceDefinitions as GenericPreferencesCategories,
        ).map(([categoryName, { title, items }]) => (
          <Widget className="gap-4 p-4" key={categoryName}>
            <H3>{title}</H3>
            <div className="flex flex-col gap-2">
              {Object.entries(items).map(([itemName, definition]) => {
                const hasLabel = !noLabelRenderers.includes(
                  definition.renderer,
                );
                return React.createElement(
                  hasLabel ? 'label' : 'div',
                  {
                    className: 'flex gap-4',
                    key: itemName,
                  },
                  <>
                    <div className="flex-1 text-right">
                      <div className="min-h-4 leading-8">
                        {definition.title}
                      </div>
                      {typeof definition.description === 'string' && (
                        <span className="leading-8 text-gray-400 dark:text-neutral-400">
                          {definition.description}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <Item
                        categoryName={categoryName}
                        definition={definition}
                        itemName={itemName}
                      />
                    </div>
                  </>,
                );
              })}
            </div>
          </Widget>
        ))}
      </div>
    </>
  );
}

async function fetchDataForExport(): Promise<IR<unknown>> {
  const data: IR<unknown> = await chrome.storage.sync.get();
  const objectStorage = storageAdapters.object(data);
  const entries = await Promise.all(
    Object.keys(data).map(async (key) => {
      if (key.includes('_')) return;
      const value = await objectStorage.get(key as 'weekStart');
      return [key, value] as const;
    }),
  );
  return Object.fromEntries(entries.filter(isDefined));
}

function Item({
  categoryName,
  itemName,
  definition,
}: {
  readonly categoryName: string;
  readonly itemName: string;
  readonly definition: PreferenceItem<unknown>;
}): JSX.Element {
  const [value, setValue] = usePref(categoryName, itemName as never);
  return definition.renderer({ value, onChange: setValue, definition });
}

function Import({
  onCancel: handleCancel,
}: {
  readonly onCancel: () => void;
}): JSX.Element {
  return (
    <>
      <PageHeader label={commonText('preferences')}>
        <Button.Default onClick={handleCancel}>
          {commonText('cancel')}
        </Button.Default>
      </PageHeader>
      <FilePicker
        acceptedFormats={['.json']}
        onSelected={(file) =>
          void fileToText(file)
            .then((text) => JSON.parse(text))
            .then(async (data) => {
              const adapter = storageAdapters.object(data);
              await Promise.all(
                Object.keys(data).map(async (key) => {
                  if (key.includes('_')) return;
                  const value = await adapter.get(key as 'weekStart');
                  await storageAdapters.sync.set(key as 'weekStart', value);
                }),
              );
            })
            .then(() => globalThis.location.reload())
            .catch(output.error)
        }
      />
    </>
  );
}

export function ResetToDefaultButton({
  onClick: handleClick,
}: {
  readonly onClick: () => void;
}): JSX.Element {
  const [confirmResetToDefault, setConfirmResetToDefault] =
    React.useState(false);
  return (
    <Button.Default
      onClick={(): void => {
        if (confirmResetToDefault) {
          handleClick();
          setConfirmResetToDefault(false);
        } else setConfirmResetToDefault(true);
      }}
    >
      {confirmResetToDefault
        ? commonText('areYouSure')
        : commonText('resetToDefault')}
    </Button.Default>
  );
}
