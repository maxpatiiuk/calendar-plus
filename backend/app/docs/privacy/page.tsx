'use server';

import type React from 'react';

import { markdownToJsx } from '../../../utils/markdownToHtml';

export default async function MainPage(): Promise<React.JSX.Element> {
  return await markdownToJsx('../docs/privacy/README.md');
}
