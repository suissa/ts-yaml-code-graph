import fs from "fs";
import path from "path";

const DEFAULT_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const IGNORED_DIRECTORIES = new Set(["node_modules", "dist", ".git", ".turbo", ".idea", ".vscode"]);

export function collectSourceFiles(root: string, extensions?: string[]): string[] {
  const normalizedRoot = path.resolve(root);
  const effectiveExtensions = extensions?.length ? extensions : DEFAULT_EXTENSIONS;
  const result: string[] = [];

  function walk(current: string): void {
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        if (entry.name === "." || entry.name === "..") continue;
      }

      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          continue;
        }
        walk(fullPath);
      } else if (effectiveExtensions.includes(path.extname(entry.name))) {
        result.push(fullPath);
      }
    }
  }

  walk(normalizedRoot);
  return result.sort();
}
