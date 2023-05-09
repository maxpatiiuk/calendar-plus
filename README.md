# Calendar Plus

[A browser extension for Google Calendar](https://chrome.google.com/webstore/detail/calendar-plus/kgbbebdcmdgkbopcffmpgkgcmcoomhmh)
that provides insights into where your time goes. Includes power user tools,
data export and customization

[Add to Chrome](https://chrome.google.com/webstore/detail/calendar-plus/kgbbebdcmdgkbopcffmpgkgcmcoomhmh)

Features:

- Plot your week/month/year using Bar Chart, Pie Chart or a Time Chart
- Adds ability to ghost an event (make it semi transparent and non-interactive)
- Adds ability to condense the interface to have more space for events
- Adds autocomplete for event names when creating events
- Allows to automatically place events into correct calendars based on defined
  rules
- Supports exporting plotted data and exporting/importing plugin settings

[Privacy Policy](https://calendar-plus.patii.uk/docs/privacy)

[Video Demo](https://youtu.be/FZ_468t033A)

[Report a Bug/Feature Request](https://github.com/maxxxxxdlp/calendar-plus/issues/new)

## Screenshots

Column chart:
[![Column chart](./docs/img/1.jpg)](https://youtu.be/FZ_468t033A)

Time chart:
[![Time chart](./docs/img/2.png)](https://youtu.be/FZ_468t033A)

Pie chart:
[![Pie chart](./docs/img/3.png)](https://youtu.be/FZ_468t033A)

Settings:
[![Settings](./docs/img/4.png)](https://youtu.be/FZ_468t033A)

Expanded time chart
[![Expanded time chart](./docs/img/5.png)](https://youtu.be/FZ_468t033A)

Editing the layout
[![Editing the layout](./docs/img/6.png)](https://youtu.be/FZ_468t033A)

## Installation

Pre-requisites:

```
Node.js 18
Npm 8
```

(Run all commands from the /src directory)
Install dependencies:

```sh
npm install
```

## Running

Build the front-end for production:

```sh
npm run build
```

## Development

Start the watcher script which would rebuild the code on any changes:

```sh
npm run watch
```

Load unpacked extension into Chrome by [following the
instructions](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/).

Note, on any code change, you will have to press the `Reload Extension` button
in the top left corner of Google Calendar in order to see the newest changes.

## React DevTools

You may have noticed that despite our app being built with React,
React DevTools browser extension does not work for debugging it.

Instead, a standalone React DevTools (an Electron app) needs to be
used. [Installation
Instructions](https://github.com/facebook/react/tree/main/packages/react-devtools#installation),

Note, this will only work for when WebPack is run in development mode
as we disabled react DevTools integration in production to reduce
bundle size.

## Testing

Unit tests are powered by Jest. Static Typechecking is powered by TypeScript.

You can run both like this:

```sh
npm test
```

or:

```sh
npm t
```

Alternatively, you can start Jest in watch mode:

```
npm run unitTests:watch
```

## Generating Docs

```
cd src
npm run docs
```
