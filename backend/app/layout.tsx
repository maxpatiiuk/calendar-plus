import React from 'react';

import { baseUrl, robots, twitter } from '../const/siteConfig';
import { Metadata, Viewport } from 'next';
import { localization } from '../const/localization';

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en-US">
      <body style={{ minHeight: '100vh', margin: 0, background: 'black' }}>
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    default: localization.siteTitle,
    template: `%s | ${localization.siteTitle}`,
  },
  description: localization.siteDescription,
  applicationName: localization.siteTitle,
  keywords: localization.siteKeywords,
  creator: localization.siteAuthor,
  generator: 'Next.js',
  robots,
  twitter: {
    card: 'summary_large_image',
    site: twitter,
    creator: twitter,
  },
  metadataBase: new URL(baseUrl),
};

export const viewport: Viewport = {
  colorScheme: 'light',
};
