import React from 'react';

import { commonText } from '../../localization/common';
import { Button, Link } from '../Atoms';
import { useStorage } from '../../hooks/useStorage';

/**
 * This dialog is displayed on first use promoting user to sign in with Google
 * and give us read-only access to calendar.
 */
export function FirstAuthScreen({
  onClose: handleClose,
  onAuth: handleAuth,
}: {
  readonly onClose: () => void;
  readonly onAuth: () => Promise<void>;
}): JSX.Element {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  React.useEffect(() => {
    dialogRef.current?.showModal();
    return (): void => dialogRef.current?.close();
  }, []);

  const [error, setError] = React.useState<string>('');

  const [theme] = useStorage('theme');

  return (
    <dialog
      ref={dialogRef}
      className={`
        max-w-[min(90%,theme(spacing.96))]
        whitespace-normal rounded border-4 border-gray-300 dark:border-neutral-700
        [&::backdrop]:bg-gray-400 [&::backdrop]:dark:bg-neutral-800 [&::backdrop]:!bg-opacity-50 [&>p]:m-0
      `}
      onKeyDown={(event): void =>
        event.key === 'Escape' ? handleClose() : undefined
      }
      onClick={(event): void =>
        event.target === dialogRef.current ? handleClose() : undefined
      }
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div
        className="flex flex-col gap-4 p-6"
        onClick={(event): void => event.stopPropagation()}
      >
        <h1 className="m-0">{commonText('calendarPlus')}</h1>
        <p>{commonText('signInDescription')}</p>
        <p>
          {commonText('privacyPolicyDescription')}{' '}
          <Link.Default
            href="https://calendar-plus.patii.uk/docs/privacy/"
            rel="noreferrer"
            target="_blank"
          >
            {commonText('privacyPolicy')}
          </Link.Default>
        </p>
        <button
          type="button"
          className="w-full cursor-pointer border-none p-0 [background:none] hover:brightness-90"
          onClick={(): void =>
            void handleAuth()
              .then(() => handleClose())
              .then(() => setError(''))
              .catch((error) => setError(error.toString()))
          }
        >
          {/**
           * To avoid splash of unstyled content, and have images pre-load
           * faster, include both light and dark mode images, but selectively
           * hide one of them.
           */}
          <img
            alt={commonText('signInWithGoogle')}
            src={lightImageUrl}
            className="dark:hidden max-w-[200px]"
          />
          <img
            alt={commonText('signInWithGoogle')}
            src={darkImageUrl}
            className="light:hidden max-w-[200px]"
          />
        </button>
        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <Button.Default onClick={handleClose}>
            {commonText('cancel')}
          </Button.Default>
        </div>
      </div>
    </dialog>
  );
}

const lightImageUrl = chrome.runtime.getURL(
  '/src/public/images/web_light_rd_SI@2x.webp',
);
const darkImageUrl = chrome.runtime.getURL(
  '/src/public/images/web_dark_rd_SI@2x.webp',
);
