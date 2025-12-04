# YAML Code Graph (TypeScript)

YAML Code Graph is now a **pure TypeScript** CLI and library that scans JavaScript/TypeScript projects and emits a compact YAML description of your codebase. It captures top-level symbols, exports, and import relationships so you can quickly visualize or post-process project structure.

## Features
- 🚀 Zero Rust toolchain — built entirely with Node.js and TypeScript.
- 🧭 Recursive project scanning with sensible ignores for `node_modules`, build output, and editor folders.
- 🧩 Symbol extraction for functions, classes, interfaces, types, enums, and variables.
- 🔗 Import edge capture so you can understand dependencies between files.
- 📝 Optional JSDoc extraction to preserve API notes in the generated graph.

## Getting started
Prerequisites: Node.js 18+ and npm.

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Generate a graph for the current directory
node dist/cli.js --root . --out graph.yaml
```

### CLI options
- `-r, --root <path>`: directory to scan (default `.`)
- `-o, --out <file>`: output YAML file (default `graph.yaml`)
- `-e, --extensions <list>`: comma-separated extensions to include (default `.ts,.tsx,.js,.jsx,.mjs,.cjs`)
- `-h, --help`: print usage help

### Library usage
If you want to embed the graph generator in another tool, import it directly:

```ts
import { buildGraph, serializeGraph } from "ts-yaml-code-graph";

const graph = buildGraph("./src");
const yaml = serializeGraph(graph);
console.log(yaml);
```

## Output format
The generated YAML is a plain object with metadata and one entry per file:

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
        location:
          line: 10
          column: 1
```

Use the `files[*].imports` and `files[*].symbols` arrays to render diagrams, feed LLM pipelines, or drive documentation generators.

## License
Licensed under the Apache 2.0 License. See [LICENSE](LICENSE).
