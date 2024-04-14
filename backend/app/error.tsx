'use client';

import React from 'react';

import { Metadata } from 'next';
import { localization } from '../const/localization';

export default function Error({ error }: { error: Error }): JSX.Element {
  return <h1>{String(error)}</h1>;
}

export const metadata: Metadata = {
  title: localization.unexpectedErrorHasOccurred,
};
