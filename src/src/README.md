# Front-end files

Front-end JavaScript and TypeScript files

## Folder Structure

Folder structure has been adapted from that of
[Josh Comeau](https://www.joshwcomeau.com/react/file-structure/), which in turn
is similar to how most modern React projects are structured.

### Utils

There is an `utils` folder that contains all the utility functions that don't
belong to any single component, but are used by many of them.

The files in the `utils` folder must not be React components or React hooks (for
the sake of consistency). React hooks that are used by several components should
be placed in the `./hooks` directory. Hooks used by only a single component
should be placed somewhere within the component directory (either separate file
or inline with the component)

### Tests

`./tests` directory includes the mocks and helpers for tests. The tests themself
are to be located in the `__tests__` directory inside of each component. This
ensures tests are closer to the component they are testing when looking at the
file tree.

### Components

Create a directory for each feature in the `./components` folder.

What constitutes a single feature depends on your judgement, and the number of
files included in the feature.

Utils and hook files that are applicable to a single feature only should be
placed in the directory along with the other files.

## DevTools for development

### React DevTools

React DevTools Chrome and Firefox extension is an integral part of
troubleshooting or developing a React application. They allow to preview and
modify the state of any component.

## TODOs

Instead of `// TODO: ` comments, the front-end uses the following comments:

- `// REFACTOR:` - for code refactoring tasks.
- `// FEATURE:` - a task that add a new feature. Use this only if a feature is
  small. For larger features create a GitHub issue.
- `// BUG:` - a small bug, or a possible bug. For larger bugs, create a GitHub
  issue.
- `// TEST:` - a task that requires manually verifying some behavior, or adding
  an automated test.
- `// FIXME:` - a task that must be completed in this commit. This commonly
  includes temporary code modifications that must be reversed before pushing the
  code.

  `ESLint` config has a rule that highlights all `FIXME` comments as errors,
  thus helping you to remember to fix them before committing.

  More importantly the `regex-blacklist` hook for `pre-commit.com` prevents a
  commit if it contains `FIXME` comments.

The benefit of using several types of comments rather than just `TODO`:

- You can configure your IDE to assign different colors to different TODO types
- You can configure automated tools to work on specific types of TODOs (like
  `ESLint` and `pre-commit.com` for `FIXME` comments).
- If you IDE has a tool that displays a list of all TODOs, you can set a filter
  there to see only a single type of TODOs at a time.
- When `grep`ing tcode, there are fewer `TODOs` to grep for, if you know the
  category your `TODO` belongs to.
- Can visually scan a `TODO` and immediately know what it involves doing
  (testing / bug fixing / refactoring / adding a feature)
