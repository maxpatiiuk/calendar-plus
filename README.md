# Calendar Plus 

A Chrome extension for Google Calendar that allows to easily see what you spend
your time, get insights on and set goals

## Installation

Pre-requisites:

```
Node.js 18
Npm 8
```

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

Note, on any rebuilds, you will have to press the "Reload" button next
to extension name on the Chrome extensions page. However, [there are
ways to automate
that](https://stackoverflow.com/questions/2963260/how-do-i-auto-reload-a-chrome-extension-im-developing).

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