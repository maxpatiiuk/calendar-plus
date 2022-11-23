import React from 'react';

import { commonText } from '../../localization/common';
import { Button, H3, Widget } from '../Atoms';
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

  return (
    <>
      <PageHeader label={commonText('preferences')}>
        <Button.White onClick={(): void => setPreferences({})}>
          {commonText('resetToDefault')}
        </Button.White>
        <Button.White onClick={handleClose}>{commonText('close')}</Button.White>
      </PageHeader>
      <div className="flex flex-1 flex-col gap-4">
        {Object.entries(
          preferenceDefinitions as GenericPreferencesCategories
        ).map(([categoryName, { title, items }]) => (
          <Widget key={categoryName} className="gap-4 p-4">
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
