import React from 'react';

import { localization } from '../const/localization';
import type { Metadata } from 'next';

export default function NotFound(): React.JSX.Element {
  return <h1>{localization.notFound}</h1>;
}

export const metadata: Metadata = {
  title: localization.notFound,
};
