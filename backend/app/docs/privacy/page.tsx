'use server';

import { markdownToJsx } from '../../../utils/markdownToHtml';

export default async function MainPage(): Promise<JSX.Element> {
  return markdownToJsx('../docs/privacy/README.md');
}
