#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { buildGraph } from "./graph";
import { serializeGraph } from "./yamlSerializer";
import { generateGraphHtml, parseGraphFromYaml, Theme } from "./visualizer";

type Command = "generate" | "visualize";

interface GenerateOptions {
  root: string;
  out: string;
  extensions?: string[];
}

interface VisualizeOptions {
  input: string;
  out: string;
  title?: string;
  theme?: Theme;
}

interface CliResult {
  command: Command;
  help?: boolean;
  generate: GenerateOptions;
  visualize: VisualizeOptions;
}

function printHelp(): void {
  console.log(`YAML Code Graph (TypeScript)
Usage:
  ycg [options]                  Generate YAML graph (default)
  ycg visualize [options]        Render graph YAML into an interactive HTML viewer

Generate options:
  -r, --root <path>         Root directory to scan (default: .)
  -o, --out <file>          Output YAML file (default: graph.yaml)
  -e, --extensions <list>   Comma-separated list of extensions (default: .ts,.tsx,.js,.jsx,.mjs,.cjs)

Visualize options:
  -i, --input <file>        Graph YAML to visualize (default: graph.yaml)
  -o, --out <file>          Output HTML file (default: graph.html)
  -t, --title <text>        Page title (default: Project dependency graph)
  --theme <light|dark>      Color theme (default: dark)

Other:
  -h, --help                Show this help message
`);
}

function parseArgs(argv: string[]): CliResult {
  const command: Command = argv[0] === "visualize" ? "visualize" : "generate";
  const slice = command === "visualize" ? argv.slice(1) : argv;

  const result: CliResult = {
    command,
    generate: { root: ".", out: "graph.yaml" },
    visualize: { input: "graph.yaml", out: "graph.html" },
  };

  for (let i = 0; i < slice.length; i += 1) {
    const arg = slice[i];
    switch (arg) {
      case "-r":
      case "--root":
        result.generate.root = slice[i + 1] ?? result.generate.root;
        i += 1;
        break;
      case "-o":
      case "--out":
        if (command === "visualize") {
          result.visualize.out = slice[i + 1] ?? result.visualize.out;
        } else {
          result.generate.out = slice[i + 1] ?? result.generate.out;
        }
        i += 1;
        break;
      case "-e":
      case "--extensions": {
        const value = slice[i + 1];
        if (value) {
          result.generate.extensions = value
            .split(",")
            .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));
        }
        i += 1;
        break;
      }
      case "-i":
      case "--input":
        result.visualize.input = slice[i + 1] ?? result.visualize.input;
        i += 1;
        break;
      case "-t":
      case "--title":
        result.visualize.title = slice[i + 1] ?? result.visualize.title;
        i += 1;
        break;
      case "--theme": {
        const value = slice[i + 1];
        if (value === "light" || value === "dark") {
          result.visualize.theme = value;
        }
        i += 1;
        break;
      }
      case "-h":
      case "--help":
        result.help = true;
        break;
      default:
        break;
    }
  }

  return result;
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

  if (args.command === "visualize") {
    const inputPath = path.resolve(args.visualize.input);
    const outputPath = path.resolve(args.visualize.out);
    const yaml = fs.readFileSync(inputPath, "utf8");
    const graph = parseGraphFromYaml(yaml);
    const html = generateGraphHtml(graph, { title: args.visualize.title, theme: args.visualize.theme });

    ensureDirectoryExists(outputPath);
    fs.writeFileSync(outputPath, html, "utf8");
    console.log(`Visualization written to ${outputPath}`);
    return;
  }

  const graph = buildGraph(args.generate.root, { extensions: args.generate.extensions });
  const serialized = serializeGraph(graph);
  const outputPath = path.resolve(args.generate.out);

  ensureDirectoryExists(outputPath);
  fs.writeFileSync(outputPath, serialized, "utf8");
  console.log(`Graph written to ${outputPath}`);
}

run();
