#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { buildGraph } from "./graph";
import { serializeGraph } from "./yamlSerializer";

interface CliOptions {
  root: string;
  out: string;
  extensions?: string[];
  help?: boolean;
}

function printHelp(): void {
  console.log(`YAML Code Graph (TypeScript)
Usage: ycg [options]

Options:
  -r, --root <path>         Root directory to scan (default: .)
  -o, --out <file>          Output YAML file (default: graph.yaml)
  -e, --extensions <list>   Comma-separated list of extensions to include (default: .ts,.tsx,.js,.jsx,.mjs,.cjs)
  -h, --help                Show this help message
`);
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { root: ".", out: "graph.yaml" };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "-r":
      case "--root":
        options.root = argv[i + 1] ?? options.root;
        i += 1;
        break;
      case "-o":
      case "--out":
        options.out = argv[i + 1] ?? options.out;
        i += 1;
        break;
      case "-e":
      case "--extensions": {
        const value = argv[i + 1];
        if (value) {
          options.extensions = value.split(",").map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));
        }
        i += 1;
        break;
      }
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        break;
    }
  }

  return options;
}

function ensureDirectoryExists(filePath: string): void {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function run(): void {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const graph = buildGraph(args.root, { extensions: args.extensions });
  const serialized = serializeGraph(graph);
  const outputPath = path.resolve(args.out);

  ensureDirectoryExists(outputPath);
  fs.writeFileSync(outputPath, serialized, "utf8");
  console.log(`Graph written to ${outputPath}`);
}

run();
