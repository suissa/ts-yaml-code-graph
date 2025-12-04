# Installation Guide

This project is distributed as the npm package `ts-yaml-code-graph`. You can install it locally to use in your own tooling or globally to access the `ycg` CLI everywhere.

## Prerequisites
- Node.js 18 or newer
- npm 9+

## Local install (recommended)

```bash
npm install ts-yaml-code-graph
```

This makes the library available from your project code:

```ts
import { buildGraph } from "ts-yaml-code-graph";
```

You can also run the CLI with `npx ycg` when installed locally.

## Global install

```bash
npm install -g ts-yaml-code-graph
```

Afterward the `ycg` command is available on your PATH:

```bash
ycg --help
```

## Building from source

If you are working from a clone of the repository:

```bash
npm install
npm run build
```

The compiled files and type declarations are emitted to `dist/` and are what ship to npm.
