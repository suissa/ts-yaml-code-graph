import path from "path";
import { collectSourceFiles } from "./scanner";
import { parseSourceFile } from "./parser";
import { CodeGraph } from "./types";

export interface GraphOptions {
  extensions?: string[];
}

export function buildGraph(root: string, options: GraphOptions = {}): CodeGraph {
  const normalizedRoot = path.resolve(root);
  const files = collectSourceFiles(normalizedRoot, options.extensions);
  const parsedFiles = files.map((file) => parseSourceFile(file, normalizedRoot));

  return {
    root: normalizedRoot,
    generatedAt: new Date().toISOString(),
    files: parsedFiles,
  };
}
