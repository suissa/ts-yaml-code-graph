export type SymbolKind =
  | "function"
  | "class"
  | "interface"
  | "type"
  | "enum"
  | "variable";

export interface Location {
  line: number;
  column: number;
}

export interface SymbolNode {
  name: string;
  kind: SymbolKind;
  exported: boolean;
  signature?: string;
  doc?: string;
  location: Location;
}

export interface ImportEdge {
  from: string;
  symbols: string[];
}

export interface FileGraph {
  path: string;
  imports: ImportEdge[];
  symbols: SymbolNode[];
}

export interface CodeGraph {
  root: string;
  generatedAt: string;
  files: FileGraph[];
}
