import React from 'react';

import { commonText } from '../../localization/common';
import { Button, Link } from '../Atoms';

/**
 * This dialog is displayed on first use promoting user to sign in with Google
 * and give us read-only access to calendar.
 */
export function FirstAuthScreen({
  onClose: handleClose,
  onAuth: handleAuth,
}: {
  readonly onClose: () => void;
  readonly onAuth: () => void;
}): JSX.Element {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  React.useEffect(() => {
    dialogRef.current?.showModal();
    return (): void => dialogRef.current?.close();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className={`
        max-w-[min(90%,theme(spacing.96))]
        whitespace-normal rounded border-4 border-gray-300
        [&::backdrop]:bg-gray-400 [&::backdrop]:bg-opacity-50 [&>p]:m-0
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
          onClick={(): void => {
            handleAuth();
            handleClose();
          }}
        >
          <img
            alt={commonText('signInWithGoogle')}
            src={imageUrl}
            className="max-w-[200px]"
          />
        </button>
        <div className="flex justify-end">
          <Button.White onClick={handleClose}>
            {commonText('cancel')}
          </Button.White>
        </div>
      </div>
    </dialog>
  );
}

const imageUrl = chrome.runtime.getURL(
  '/src/public/images/btn_google_signin_light_normal_web@2x.png'
);
