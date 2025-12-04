# CLI Reference

`ycg` is the command-line interface shipped with `ts-yaml-code-graph`. It scans a project for JavaScript/TypeScript files and outputs a YAML representation of imports and top-level symbols.

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
```

### Options

| Flag | Description | Default |
| ---- | ----------- | ------- |
| `-r, --root <path>` | Directory to scan recursively | `.` |
| `-o, --out <file>` | Output YAML file path | `graph.yaml` |
| `-e, --extensions <list>` | Comma-separated list of file extensions to include | `.ts,.tsx,.js,.jsx,.mjs,.cjs` |
| `-h, --help` | Print usage information | — |

### Examples

```bash
# Basic usage (current directory)
ycg --out graph.yaml

# Target a specific folder
ycg --root ./packages/service --out ./artifacts/service-graph.yaml

# Only include TypeScript sources
ycg --extensions .ts,.tsx --out ts-only.yaml
```

### Output
The CLI writes a YAML document describing the project root, generation timestamp, and a `files` list. Each file entry includes imports and top-level symbols with kind, export flag, signature, optional JSDoc, and location (line/column).
