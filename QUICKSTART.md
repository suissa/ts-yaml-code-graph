# Quickstart

Follow these steps to produce a YAML code graph in minutes.

## 1. Install

```bash
npm install -g ts-yaml-code-graph
```

> Prefer not to install globally? Run `npx ycg` in any project after `npm install ts-yaml-code-graph`.

## 2. Generate a graph

```bash
ycg --root . --out graph.yaml
```

The command scans JavaScript and TypeScript files under the current directory (skipping `node_modules`, build output, and editor folders) and writes `graph.yaml`.

## 3. Explore the output

Open the YAML to see each file, its imports, and the top-level symbols (functions, classes, interfaces, types, enums, variables). Use this file to visualize dependencies or feed automation.

To convert the YAML into a shareable visualization, run:

```bash
ycg visualize --input graph.yaml --out graph.html --theme light
```

The generated HTML contains an interactive force-directed graph with a legend, tooltips, and a built-in theme toggle.

## 4. Use as a library

```ts
import { buildGraph, serializeGraph } from "ts-yaml-code-graph";

const graph = buildGraph("./packages/web", { extensions: [".ts", ".tsx"] });
const yaml = serializeGraph(graph);
```

You now have a structured description of your codebase ready to consume programmatically.
