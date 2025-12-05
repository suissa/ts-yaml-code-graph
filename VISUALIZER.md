# Graph visualizer

Gere um HTML interativo a partir do YAML produzido pelo `ycg`. O viewer usa D3 com força dirigida, tooltips, legenda e alternância de tema dark/light, tudo em um único arquivo estático.

## Pré‑requisitos
1. Tenha um YAML de grafo gerado com `ycg generate` (padrão: `graph.yaml`).
2. Node.js 18+ instalado para executar o CLI ou um runtime capaz de ler arquivos e gravar o HTML.

## Usando via CLI
```bash
# 1) Gere o YAML (opcional se já existir)
ycg --root . --out graph.yaml

# 2) Renderize o HTML interativo
ycg visualize --input graph.yaml --out graph.html --title "Mapa do projeto" --theme light
```

### Flags disponíveis
- `-i, --input <file>`: caminho do YAML (padrão: `graph.yaml`).
- `-o, --out <file>`: caminho do HTML (padrão: `graph.html`).
- `-t, --title <text>`: título exibido no cabeçalho.
- `--theme <light|dark>`: tema inicial (padrão: `dark`).

Abra o arquivo `graph.html` no navegador — não há dependências externas além do bundle em linha. O layout mostra um nó por arquivo, tamanho proporcional a `imports + symbols`, arestas ponderadas pelo número de símbolos importados e tooltips com contagens por arquivo. Há um botão para alternar o tema.

## Usando como biblioteca
```ts
import { readFileSync, writeFileSync } from "node:fs";
import { parseGraphFromYaml, generateGraphHtml } from "ts-yaml-code-graph";

const yaml = readFileSync("graph.yaml", "utf8");
const graph = parseGraphFromYaml(yaml);
const html = generateGraphHtml(graph, {
  title: "Mapa do projeto",
  theme: "light",
});

writeFileSync("graph.html", html, "utf8");
```

### API rápida
- `parseGraphFromYaml(content)`: lê o YAML (string) e retorna um `CodeGraph` tipado.
- `generateGraphHtml(graph, options)`: recebe o `CodeGraph` e retorna a string HTML completa.
- `renderVisualizationPageFromYaml(content, options)`: atalho que aceita a string YAML diretamente.

> Dica: se quiser enviar o grafo para outro serviço (ex.: S3), apenas envie o HTML gerado. Tudo está embutido no documento.
