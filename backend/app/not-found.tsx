import React from 'react';

import { localization } from '../const/localization';
import { Metadata } from 'next';

export default function NotFound(): JSX.Element {
  return <h1>{localization.notFound}</h1>;
}

export const metadata: Metadata = {
  title: localization.notFound,
};
