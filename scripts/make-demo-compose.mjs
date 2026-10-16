// Generates docker-compose.demo.yml: the stock node image plus the compiled files as inline
// compose configs, so the demo needs no image build and no host mounts. The files travel
// base64-encoded (compose would otherwise read every template literal as a variable) and a
// small boot script unpacks them before the server starts.
// Usage: npm run build && node scripts/make-demo-compose.mjs > docker-compose.demo.yml
import { readFileSync, readdirSync } from "node:fs";

const files = [
  ...readdirSync("dist/src").filter((f) => f.endsWith(".js")).sort().map((f) => `dist/src/${f}`),
  "package.json",
];
const name = (f) => f.replace(/\W/g, "_");
const wrap = (s) => s.match(/.{1,76}/g).map((l) => "      " + l).join("\n");
const boot = [
  "const fs = require('fs');",
  "for (const f of fs.readdirSync('/files')) {",
  "  const target = f.split('__').join('/');",
  "  fs.mkdirSync(require('path').dirname(target), { recursive: true });",
  "  fs.writeFileSync(target, Buffer.from(fs.readFileSync('/files/' + f, 'utf8').replace(/\\s+/g, ''), 'base64'));",
  "}",
];

let out = "services:\n  app:\n    image: node:22-alpine\n    working_dir: /app\n";
out += '    command: ["sh", "-c", "node /boot.cjs && exec node dist/src/cli.js serve --port 3000 --host 0.0.0.0 --self-only"]\n';
out += '    environment:\n      PORT: "3000"\n      NODE_ENV: production\n    expose:\n      - "3000"\n';
out += '    deploy:\n      resources:\n        limits:\n          cpus: "0.50"\n          memory: 256M\n    configs:\n';
out += "      - source: boot_cjs\n        target: /boot.cjs\n";
for (const f of files) out += `      - source: ${name(f)}\n        target: /files/${f.split("/").join("__")}\n`;
out += `configs:\n  boot_cjs:\n    content: |\n${boot.map((l) => "      " + l).join("\n")}\n`;
for (const f of files) out += `  ${name(f)}:\n    content: |\n${wrap(readFileSync(f).toString("base64"))}\n`;
process.stdout.write(out);
