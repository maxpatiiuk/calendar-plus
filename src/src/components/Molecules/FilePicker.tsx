import React from 'react';

import { useBooleanState } from '../../hooks/useBooleanState';
import type { RA } from '../../utils/types';
import { className } from '../Atoms';
import { commonText } from '../../localization/common';

export function FilePicker({
  onSelected: handleSelected,
  acceptedFormats,
}: {
  readonly onSelected: (file: File) => void;
  readonly acceptedFormats: RA<string> | undefined;
}): JSX.Element {
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const filePickerButton = React.useRef<HTMLButtonElement>(null);

  function handleFileSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    if (handleFileChange(event.target.files?.[0])) event.target.value = '';
  }

  function handleFileDropped(event: React.DragEvent): void {
    const file = event.dataTransfer?.items?.[0]?.getAsFile() ?? undefined;
    handleFileChange(file);
    preventPropagation(event);
    setIsDragging(false);
  }

  function handleFileChange(file: File | undefined): boolean {
    if (file) {
      handleSelected(file);
      setFileName(file.name);
      return true;
    } else {
      setFileName(undefined);
      return false;
    }
  }

  function handleDragEnter(event: React.DragEvent): void {
    setIsDragging((event.dataTransfer?.items?.length ?? 0) !== 0);
    preventPropagation(event);
  }

  function handleDragLeave(event: React.DragEvent): void {
    if (
      event.relatedTarget === null ||
      filePickerButton.current === null ||
      event.target !== filePickerButton.current ||
      filePickerButton.current.contains(event.relatedTarget as Node)
    )
      return;
    setIsDragging(false);
    preventPropagation(event);
  }

  function preventPropagation(event: React.DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  const [fileName, setFileName] = React.useState<string | undefined>(undefined);
  const [isFocused, handleFocus, handleBlur] = useBooleanState();

  return (
    <label
      className="contents"
      onBlur={handleBlur}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={preventPropagation}
      onDrop={handleFileDropped}
      onFocus={handleFocus}
    >
      <input
        accept={acceptedFormats?.join(',')}
        className="sr-only"
        required
        type="file"
        onChange={handleFileSelected}
      />
      <span
        className={`
          flex h-44 w-full items-center justify-center text-center
          ${className.buttonWhite}
          ${isDragging ? 'bg-white ring ring-blue-200' : ''}
          ${isFocused ? '!ring ring-blue-500' : ''}
        `}
        ref={filePickerButton}
      >
        <span>
          {commonText('filePickerMessage')}
          {typeof fileName === 'string' && (
            <>
              <br />
              <br />
              <b>{`${commonText('selectedFileName')}: ${fileName}`}</b>
            </>
          )}
        </span>
      </span>
    </label>
  );
}

export const downloadFile = async (
  fileName: string,
  text: string
): Promise<void> =>
  new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.addEventListener('load', () => {
      if (iframe.contentWindow === null) return;
      const element = iframe.contentWindow.document.createElement('a');
      element.setAttribute(
        'href',
        `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
      );
      element.setAttribute('download', fileName);

      element.style.display = 'none';
      iframe.contentWindow.document.body.append(element);

      element.click();
      globalThis.setTimeout(() => {
        iframe.remove();
        resolve();
      }, 100);
    });
    const html = '<body></body>';
    document.body.append(iframe);
    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(html);
    iframe.contentWindow?.document.close();
  });

export const fileToText = async (
  file: File,
  encoding = 'utf-8'
): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', ({ target }) =>
      typeof target?.result === 'string'
        ? resolve(target.result)
        : reject(new Error('File is not a text file'))
    );
    fileReader.addEventListener('error', () => reject(fileReader.error));
    fileReader.readAsText(file, encoding);
  });
