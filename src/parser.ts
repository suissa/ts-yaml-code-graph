import fs from "fs";
import path from "path";
import ts from "typescript";
import { FileGraph, ImportEdge, SymbolNode } from "./types";

const printer = ts.createPrinter({ removeComments: true });

function hasExportModifier(modifiers?: readonly ts.ModifierLike[]): boolean {
  return Boolean(modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function getLocation(sourceFile: ts.SourceFile, node: ts.Node) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return { line: line + 1, column: character + 1 };
}

function formatFunctionSignature(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): string {
  const name = node.name?.getText(sourceFile) ?? "anonymous";
  const parameters = node.parameters.map((param) => printer.printNode(ts.EmitHint.Unspecified, param, sourceFile)).join(", ");
  const returnType = node.type ? printer.printNode(ts.EmitHint.Unspecified, node.type, sourceFile) : "void";
  return `${name}(${parameters}): ${returnType}`;
}

function formatClassSignature(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): string {
  const name = node.name?.getText(sourceFile) ?? "anonymous";
  const heritageClauses = node.heritageClauses?.map((clause) => clause.getText(sourceFile)).join(" ") ?? "";
  return heritageClauses ? `${name} ${heritageClauses}` : name;
}

function formatInterfaceSignature(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): string {
  const name = node.name.getText(sourceFile);
  const heritageClauses = node.heritageClauses?.map((clause) => clause.getText(sourceFile)).join(" ") ?? "";
  return heritageClauses ? `${name} ${heritageClauses}` : name;
}

function formatTypeAliasSignature(node: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile): string {
  const name = node.name.getText(sourceFile);
  const typeText = printer.printNode(ts.EmitHint.Unspecified, node.type, sourceFile);
  return `${name} = ${typeText}`;
}

function formatEnumSignature(node: ts.EnumDeclaration, sourceFile: ts.SourceFile): string {
  const name = node.name.getText(sourceFile);
  const members = node.members.map((member) => member.name.getText(sourceFile)).join(", ");
  return members ? `${name} { ${members} }` : name;
}

function stripCommentDelimiters(raw: string): string {
  return raw
    .replace(/^\s*\/\*\*?/, "")
    .replace(/\*\/\s*$/, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*?\s?/, "").trimEnd())
    .join("\n")
    .trim();
}

function extractDoc(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  const fullText = sourceFile.getFullText();
  const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart()) ?? [];
  const docRange = commentRanges
    .filter((range) => fullText.slice(range.pos, range.end).startsWith("/*"))
    .map((range) => fullText.slice(range.pos, range.end))
    .find((comment) => comment.startsWith("/**"));

  return docRange ? stripCommentDelimiters(docRange) : undefined;
}

function createSymbolNode(kind: SymbolNode["kind"], name: string, node: ts.Node, sourceFile: ts.SourceFile, exported: boolean): SymbolNode {
  return {
    kind,
    name,
    exported,
    signature: deriveSignature(kind, node as never, sourceFile),
    doc: extractDoc(node, sourceFile),
    location: getLocation(sourceFile, node),
  };
}

function deriveSignature(kind: SymbolNode["kind"], node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
  switch (kind) {
    case "function":
      return formatFunctionSignature(node as ts.FunctionDeclaration, sourceFile);
    case "class":
      return formatClassSignature(node as ts.ClassDeclaration, sourceFile);
    case "interface":
      return formatInterfaceSignature(node as ts.InterfaceDeclaration, sourceFile);
    case "type":
      return formatTypeAliasSignature(node as ts.TypeAliasDeclaration, sourceFile);
    case "enum":
      return formatEnumSignature(node as ts.EnumDeclaration, sourceFile);
    case "variable":
    default:
      return (node as ts.Node).getText(sourceFile).split(/\r?\n/)[0];
  }
}

function parseImport(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): ImportEdge {
  const moduleName = node.moduleSpecifier.getText(sourceFile).replace(/["']/g, "");
  const clause = node.importClause;
  const symbols: string[] = [];

  if (clause?.name) {
    symbols.push(clause.name.getText(sourceFile));
  }

  if (clause?.namedBindings) {
    if (ts.isNamespaceImport(clause.namedBindings)) {
      symbols.push(`* as ${clause.namedBindings.name.getText(sourceFile)}`);
    } else {
      clause.namedBindings.elements.forEach((element) => symbols.push(element.getText(sourceFile)));
    }
  }

  return { from: moduleName, symbols };
}

function parseVariableStatement(node: ts.VariableStatement, sourceFile: ts.SourceFile): SymbolNode[] {
  const exported = hasExportModifier(node.modifiers);
  const symbols: SymbolNode[] = [];

  node.declarationList.declarations.forEach((declaration) => {
    const name = declaration.name.getText(sourceFile);
    symbols.push(createSymbolNode("variable", name, declaration, sourceFile, exported));
  });

  return symbols;
}

export function parseSourceFile(filePath: string, root: string): FileGraph {
  const content = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const imports: ImportEdge[] = [];
  const symbols: SymbolNode[] = [];
  const relativePath = path.relative(root, filePath) || path.basename(filePath);

  sourceFile.forEachChild((node) => {
    if (ts.isImportDeclaration(node)) {
      imports.push(parseImport(node, sourceFile));
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      symbols.push(createSymbolNode("function", node.name.getText(sourceFile), node, sourceFile, hasExportModifier(node.modifiers)));
    }

    if (ts.isClassDeclaration(node) && node.name) {
      symbols.push(createSymbolNode("class", node.name.getText(sourceFile), node, sourceFile, hasExportModifier(node.modifiers)));
    }

    if (ts.isInterfaceDeclaration(node)) {
      symbols.push(createSymbolNode("interface", node.name.getText(sourceFile), node, sourceFile, hasExportModifier(node.modifiers)));
    }

    if (ts.isTypeAliasDeclaration(node)) {
      symbols.push(createSymbolNode("type", node.name.getText(sourceFile), node, sourceFile, hasExportModifier(node.modifiers)));
    }

    if (ts.isEnumDeclaration(node)) {
      symbols.push(createSymbolNode("enum", node.name.getText(sourceFile), node, sourceFile, hasExportModifier(node.modifiers)));
    }

    if (ts.isVariableStatement(node)) {
      symbols.push(...parseVariableStatement(node, sourceFile));
    }
  });

  return {
    path: relativePath,
    imports,
    symbols,
  };
}
