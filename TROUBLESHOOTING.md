# Troubleshooting

Common issues when running `ts-yaml-code-graph` and how to resolve them.

## "Command not found"
- Ensure the package is installed globally (`npm install -g ts-yaml-code-graph`) or run with `npx ycg` in a project that has it as a dependency.

## "Cannot write output file"
- The CLI creates parent directories automatically, but you need write permissions. Choose an output path inside your project or run with sufficient permissions.

## Unexpected empty graph
- Verify the `--extensions` flag matches the files you want to scan (default includes `.ts,.tsx,.js,.jsx,.mjs,.cjs`).
- Ensure your project files are not inside ignored folders such as `node_modules`, `dist`, or `.git`.

## TypeScript type errors during build
- Use Node.js 18+ and install dependencies with `npm install`.
- If you changed the source, run `npm run build` to regenerate `dist/` and the accompanying declaration files.
