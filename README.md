# ts-yaml-code-graph

`ts-yaml-code-graph` is a lightweight npm library and CLI that scans JavaScript/TypeScript projects and emits a YAML summary of files, imports, and top-level symbols. Use it to visualize dependencies, feed docs generators, or seed LLM pipelines with structured context.

## Installation

```bash
# Install as a project dependency
npm install ts-yaml-code-graph

# Or install globally to use the CLI everywhere
npm install -g ts-yaml-code-graph
```

Requirements: Node.js 18 or newer.

## CLI usage

After installing (or with `npx`), run the `ycg` command.

```bash
# Generate a graph for the current directory
npx ycg --out graph.yaml

# Scan a specific folder with custom extensions
ycg --root ./packages/api --extensions .ts,.tsx --out ./artifacts/api-graph.yaml

# Turn an existing YAML graph into an interactive HTML viewer
ycg visualize --input graph.yaml --out graph.html --title "API graph" --theme light
```

### Options
- `-r, --root <path>`: Directory to scan (default: `.`)
- `-o, --out <file>`: Output YAML file when generating or HTML file when visualizing (default: `graph.yaml` / `graph.html`)
- `-e, --extensions <list>`: Comma-separated extensions to include (default: `.ts,.tsx,.js,.jsx,.mjs,.cjs`)
- `-i, --input <file>`: YAML file to visualize (default: `graph.yaml`)
- `-t, --title <text>`: Custom page title for the HTML viewer
- `--theme <light|dark>`: Visualizer theme (default: `dark`)
- `-h, --help`: Show the CLI help text

## Library usage

Use the library to build graphs programmatically:

```ts
import { buildGraph, generateGraphHtml, renderVisualizationPageFromYaml, serializeGraph } from "ts-yaml-code-graph";

const graph = buildGraph("./src", { extensions: [".ts", ".tsx"] });
const yaml = serializeGraph(graph);

console.log(yaml);

// Render an interactive HTML page from the graph object
const html = generateGraphHtml(graph, { title: "My project graph", theme: "dark" });

// Or render from YAML that was saved earlier
const htmlFromYaml = renderVisualizationPageFromYaml(yaml, { theme: "light" });
```

## Visualizing the output

The `visualize` command and the `generateGraphHtml` helper produce a standalone HTML page with a force-directed graph powered by
D3. Node sizes reflect the number of imports plus symbols in a file, and edge thickness reflects how many symbols are imported
between files. Hover nodes to see tooltips, and use the theme toggle to switch between dark and light palettes.

For a step-by-step walkthrough (CLI and library snippets) see [VISUALIZER.md](VISUALIZER.md).

## Output schema

The YAML output is a plain object with metadata and per-file details:

```yaml
root: /absolute/path/to/project
generatedAt: 2024-01-01T12:00:00.000Z
files:
  - path: src/index.ts
    imports:
      - from: fs
        symbols: [readFileSync]
    symbols:
      - name: buildGraph
        kind: function
        exported: true
        signature: buildGraph(root: string): CodeGraph
        doc: Optional JSDoc block
        location:
          line: 10
          column: 1
```

## Development

```bash
npm install
npm run build
```

The TypeScript build emits CommonJS modules and type declarations into `dist/`. The published package ships the compiled output along with typings, the CLI entrypoint, and the README.

## License

Licensed under the Apache 2.0 License. See [LICENSE](LICENSE).
