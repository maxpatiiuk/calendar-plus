import React from 'react';

import { useBooleanState } from '../../hooks/useBooleanState';
import { isOverSizeLimit, storageDefinitions } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import type { IR, RA } from '../../utils/types';
import { Button, H3, Widget } from '../Atoms';
import { downloadFile, FilePicker, fileToText } from '../Molecules/FilePicker';
import { PageHeader } from '../Molecules/PageHeader';
import { PreferencesContext } from './Context';
import type {
  GenericPreferencesCategories,
  PreferenceItem,
} from './definitions';
import { noLabelRenderers, preferenceDefinitions } from './definitions';
import { usePref } from './usePref';

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
        <Button.White
          onClick={(): void =>
            void fetchDataForExport()
              .then(async (data) =>
                downloadFile(
                  `${commonText(
                    'calendarPlus'
                  )} - ${new Date().toLocaleDateString()}.json`,
                  JSON.stringify(data, null, 4)
                )
              )
              .catch(console.error)
          }
        >
          {commonText('exportAllSettings')}
        </Button.White>
        <Button.White onClick={handleImport}>
          {commonText('exportAllSettings')}
        </Button.White>
        <Button.White onClick={(): void => setPreferences({})}>
          {commonText('resetToDefault')}
        </Button.White>
        <Button.White onClick={handleClose}>{commonText('close')}</Button.White>
      </PageHeader>
      <div className="flex flex-1 flex-col gap-4">
        {Object.entries(
          preferenceDefinitions as GenericPreferencesCategories
        ).map(([categoryName, { title, items }]) => (
          <Widget className="gap-4 p-4" key={categoryName}>
            <H3>{title}</H3>
            <div className="flex flex-col gap-2">
              {Object.entries(items).map(([itemName, definition]) => {
                const hasLabel = !noLabelRenderers.includes(
                  definition.renderer
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
                        <span className="leading-8 text-gray-500">
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
                  </>
                );
              })}
            </div>
          </Widget>
        ))}
      </div>
    </>
  );
}

const fetchDataForExport = async (): Promise<IR<unknown>> =>
  chrome.storage.sync
    .get('overSizeStorage')
    .then(async ({ overSizeStorage = [] }) =>
      Promise.all(
        Object.entries(storageDefinitions)
          // Only export storage that is synced
          .filter(([_key, { type }]) => type === 'sync')
          .map(async ([key]) => [
            key,
            await chrome.storage[
              (overSizeStorage as RA<string>).includes(key) ? 'local' : 'sync'
            ]
              .get(key)
              .then((data) => data[key]),
          ])
      )
    )
    .then((data) => Object.fromEntries(data));

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
        <Button.White onClick={handleCancel}>
          {commonText('cancel')}
        </Button.White>
      </PageHeader>
      <FilePicker
        acceptedFormats={['.json']}
        onSelected={(file) =>
          // FIXME: update the "overSizeStorage" entry
          void fileToText(file)
            .then((text) => JSON.parse(text))
            .then((data) =>
              Promise.all(
                Object.entries(data).map(async ([key, value]) => {
                  const isOverLimit = isOverSizeLimit(key, value);
                  await chrome.storage[isOverLimit ? 'local' : 'sync'].set({
                    [key]: value,
                  });
                  return isOverLimit;
                })
              )
            )
            .then(() => globalThis.location.reload())
            .catch(console.error)
        }
      />
    </>
  );
}
