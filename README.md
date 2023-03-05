# Calendar Plus

A browser extension for Google Calendar that provides insights into where your time goes. Includes power user tools, data export and customization

## Screenshots

Column chart:
![Column chart](./docs/img/1.png)

Time chart:
![Time chart](./docs/img/2.png)

Pie chart:
![Pie chart](./docs/img/3.png)

Settings:
![Settings](./docs/img/4.png)

Expanded time chart
![Expanded time chart](./docs/img/5.png)

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
npx typedoc --out docs src
```
