import YAML from "yaml";
import { CodeGraph } from "./types";

export type Theme = "dark" | "light";

export interface VisualizationOptions {
  title?: string;
  theme?: Theme;
}

interface VisualizationNode {
  id: string;
  label: string;
  imports: number;
  symbols: number;
  value: number;
}

interface VisualizationLink {
  source: string;
  target: string;
  weight: number;
}

interface VisualizationData {
  nodes: VisualizationNode[];
  links: VisualizationLink[];
}

function normalizeTheme(theme?: string): Theme {
  return theme === "light" ? "light" : "dark";
}

export function parseGraphFromYaml(content: string): CodeGraph {
  const parsed = YAML.parse(content);
  if (!parsed || !Array.isArray(parsed.files)) {
    throw new Error("Invalid graph YAML: missing files array");
  }

  return parsed as CodeGraph;
}

export function buildVisualizationData(graph: CodeGraph): VisualizationData {
  const nodes: VisualizationNode[] = graph.files.map((file) => {
    const imports = file.imports.length;
    const symbols = file.symbols.length;
    const value = imports + symbols + 1;

    return {
      id: file.path,
      label: file.path,
      imports,
      symbols,
      value,
    };
  });

  const links: VisualizationLink[] = [];
  const seen = new Set<string>();

  for (const file of graph.files) {
    for (const edge of file.imports) {
      const key = `${file.path}__${edge.from}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      links.push({ source: file.path, target: edge.from, weight: Math.max(edge.symbols.length, 1) });
    }
  }

  return { nodes, links };
}

export function generateGraphHtml(graph: CodeGraph, options: VisualizationOptions = {}): string {
  const theme = normalizeTheme(options.theme);
  const title = options.title ?? "Project dependency graph";
  const data = buildVisualizationData(graph);

  const serializedData = JSON.stringify(data);
  const serializedMeta = JSON.stringify({
    root: graph.root,
    generatedAt: graph.generatedAt,
    files: graph.files.length,
  });

  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root {
      --bg: #0b1221;
      --panel: rgba(255, 255, 255, 0.04);
      --border: rgba(255, 255, 255, 0.08);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --accent: #60a5fa;
      --accent-2: #a78bfa;
      --shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    }

    :root[data-theme="light"] {
      --bg: #f7f8fb;
      --panel: rgba(0, 0, 0, 0.02);
      --border: rgba(0, 0, 0, 0.06);
      --text: #0f172a;
      --muted: #334155;
      --accent: #2563eb;
      --accent-2: #7c3aed;
      --shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Inter", system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.07), transparent 22%),
                  radial-gradient(circle at 80% 10%, rgba(124, 58, 237, 0.08), transparent 25%),
                  var(--bg);
      color: var(--text);
      min-height: 100vh;
    }

    header {
      padding: 20px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 14px;
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .title {
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge {
      padding: 6px 10px;
      border-radius: 999px;
      background: linear-gradient(120deg, rgba(96, 165, 250, 0.15), rgba(124, 58, 237, 0.18));
      color: var(--text);
      border: 1px solid var(--border);
      font-size: 12px;
      letter-spacing: 0.01em;
    }

    .stats {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-left: auto;
    }

    .stat {
      background: var(--panel);
      border: 1px solid var(--border);
      padding: 10px 14px;
      border-radius: 14px;
      box-shadow: var(--shadow);
      min-width: 120px;
    }

    .stat h4 {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--muted);
      font-weight: 600;
    }

    .stat p {
      margin: 4px 0 0 0;
      font-size: 18px;
      font-weight: 700;
    }

    .theme-toggle {
      border: 1px solid var(--border);
      background: var(--panel);
      color: var(--text);
      border-radius: 12px;
      padding: 8px 12px;
      cursor: pointer;
      box-shadow: var(--shadow);
      transition: transform 120ms ease, box-shadow 200ms ease;
    }

    .theme-toggle:hover { transform: translateY(-1px); }

    main {
      padding: 16px;
    }

    #graph {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: var(--shadow);
      min-height: 720px;
      position: relative;
      overflow: hidden;
    }

    .tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(15, 23, 42, 0.92);
      color: #e2e8f0;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      box-shadow: 0 12px 38px rgba(0, 0, 0, 0.35);
      font-size: 13px;
      line-height: 1.4;
      max-width: 320px;
      opacity: 0;
      transition: opacity 140ms ease;
      backdrop-filter: blur(8px);
      z-index: 20;
    }

    :root[data-theme="light"] .tooltip {
      background: rgba(255, 255, 255, 0.98);
      color: #0f172a;
      border-color: rgba(15, 23, 42, 0.12);
    }

    .legend {
      position: absolute;
      right: 14px;
      bottom: 14px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 12px;
      color: var(--muted);
      font-size: 12px;
      box-shadow: var(--shadow);
      backdrop-filter: blur(12px);
    }

    svg text {
      fill: var(--text);
      font-size: 11px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <header>
    <div class="title">
      <span>✨</span>
      <span>${title}</span>
      <span class="badge">YAML code graph</span>
    </div>
    <div class="stats" id="stats"></div>
    <button class="theme-toggle" id="themeToggle">Toggle theme</button>
  </header>
  <main>
    <div id="graph">
      <div class="tooltip" id="tooltip"></div>
      <div class="legend">
        <div><strong>Node size</strong>: imports + symbols</div>
        <div><strong>Edge weight</strong>: imported symbols</div>
      </div>
    </div>
  </main>
  <script type="module">
    import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

    const data = ${serializedData};
    const meta = ${serializedMeta};
    const graphEl = document.getElementById("graph");
    const tooltip = document.getElementById("tooltip");
    const statsEl = document.getElementById("stats");
    const themeToggle = document.getElementById("themeToggle");

    const width = graphEl.clientWidth;
    const height = Math.max(760, Math.round(window.innerHeight * 0.75));

    const svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", \`0 0 \${width} \${height}\`);

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "edgeGradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "var(--accent)");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "var(--accent-2)");

    const link = svg
      .append("g")
      .attr("stroke", "url(#edgeGradient)")
      .attr("stroke-linecap", "round")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) => Math.min(10, Math.sqrt(d.weight) + 1))
      .attr("opacity", 0.6);

    const node = svg
      .append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag()
          .on("start", (event) => {
            if (!event.active) simulation.alphaTarget(0.2).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on("drag", (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on("end", (event) => {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", (d) => Math.min(38, Math.sqrt(d.value) * 6 + 8))
      .attr("fill", "var(--panel)")
      .attr("stroke", "var(--accent)")
      .attr("stroke-width", 1.6)
      .attr("opacity", 0.9)
      .on("mouseenter", (event, d) => showTooltip(event, d))
      .on("mouseleave", hideTooltip);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 3)
      .text((d) => shortenLabel(d.label));

    const simulation = d3
      .forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d) => d.id).distance(120).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide((d) => Math.min(60, Math.sqrt(d.value) * 6 + 10)))
      .on("tick", () => {
        link
          .attr("x1", (d) => (d.source as any).x)
          .attr("y1", (d) => (d.source as any).y)
          .attr("x2", (d) => (d.target as any).x)
          .attr("y2", (d) => (d.target as any).y);

        node.attr("transform", (d) => \`translate(\${d.x},\${d.y})\`);
      });

    function shortenLabel(label) {
      if (label.length <= 32) return label;
      const start = label.slice(0, 16);
      const end = label.slice(-12);
      return \`\${start}…\${end}\`;
    }

    function showTooltip(evt, d) {
      tooltip.style.opacity = 1;
      tooltip.innerHTML = \`
        <strong>\${d.label}</strong><br />
        Imports: <b>\${d.imports}</b><br />
        Symbols: <b>\${d.symbols}</b>
      \`;

      const { x, y } = d3.pointer(evt, graphEl);
      tooltip.style.left = \`\${x + 14}px\`;
      tooltip.style.top = \`\${y + 14}px\`;
    }

    function hideTooltip() {
      tooltip.style.opacity = 0;
    }

    function renderStats() {
      statsEl.innerHTML = '';
      const items = [
        { label: 'Files', value: meta.files },
        { label: 'Imports', value: data.links.length },
        { label: 'Generated', value: new Date(meta.generatedAt).toLocaleString() }
      ];

      items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'stat';
        card.innerHTML = \`<h4>\${item.label}</h4><p>\${item.value}</p>\`;
        statsEl.appendChild(card);
      });
    }

    function toggleTheme() {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
    }

    themeToggle.addEventListener('click', toggleTheme);
    renderStats();
  </script>
</body>
</html>`;
}

export function renderVisualizationPageFromYaml(content: string, options: VisualizationOptions = {}): string {
  const graph = parseGraphFromYaml(content);
  return generateGraphHtml(graph, options);
}
