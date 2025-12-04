import YAML from "yaml";
import { CodeGraph } from "./types";

export function serializeGraph(graph: CodeGraph): string {
  return YAML.stringify(graph, { simpleKeys: true });
}
