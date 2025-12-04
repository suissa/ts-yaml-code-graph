# CLI Reference

`ycg` is the command-line interface shipped with `ts-yaml-code-graph`. It scans a project for JavaScript/TypeScript files and outputs a YAML representation of imports and top-level symbols. A `visualize` subcommand can render that YAML into a polished HTML graph viewer.

## Version
Current CLI shipped with package version 1.0.0.

## Installation

Use `npx ycg` after installing the package locally, or install globally for convenience:

```bash
npm install -g ts-yaml-code-graph
ycg --help
```

## Usage

```bash
ycg [options]
ycg visualize [options]
```

### Options

| Flag | Description | Default |
| ---- | ----------- | ------- |
| `-r, --root <path>` | Directory to scan recursively (generate) | `.` |
| `-o, --out <file>` | Output path (`graph.yaml` when generating, `graph.html` when visualizing) | `graph.yaml` / `graph.html` |
| `-e, --extensions <list>` | Comma-separated list of file extensions to include (generate) | `.ts,.tsx,.js,.jsx,.mjs,.cjs` |
| `-i, --input <file>` | YAML graph to visualize | `graph.yaml` |
| `-t, --title <text>` | Custom title for the HTML viewer | `Project dependency graph` |
| `--theme <light|dark>` | Theme for the viewer | `dark` |
| `-h, --help` | Print usage information | — |

### Examples

```bash
# Basic usage (current directory)
ycg --out graph.yaml

# Target a specific folder
ycg --root ./packages/service --out ./artifacts/service-graph.yaml

# Only include TypeScript sources
ycg --extensions .ts,.tsx --out ts-only.yaml

# Convert the YAML into an interactive HTML visualization
ycg visualize --input graph.yaml --out graph.html --theme light --title "Service graph"
```

### Output
The generate command writes a YAML document describing the project root, generation timestamp, and a `files` list. Each file entry includes imports and top-level symbols with kind, export flag, signature, optional JSDoc, and location (line/column).

The visualize command writes a single HTML file that embeds the YAML contents into a D3-powered force-directed graph with tooltips, a legend, and a built-in dark/light theme toggle.
