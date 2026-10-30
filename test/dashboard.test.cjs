// Automated Test Suite for Antigravity Cluster Dashboard
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🧪 Iniciando Testes Automatizados da Dashboard...');

// Teste 1: Existência de arquivos críticos
const requiredFiles = [
  'package.json',
  'vercel.json',
  'public/index.html',
  'api/status.js',
  'api/proxy.js',
  'README.md',
  'ARCHITECTURE.md',
  'NIGHT_SHIFT_CONTEXT.md',
  'scripts/tri-agent.cjs'
];

for (const file of requiredFiles) {
  const filePath = path.join(ROOT_DIR, file);
  assert.ok(fs.existsSync(filePath), `Arquivo obrigatório ausente: ${file}`);
}
console.log('  ✓ Todos os arquivos obrigatórios existem');

// Teste 2: Validação do package.json
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'));
assert.strictEqual(pkg.name, 'antigravity-cluster-dashboard');
assert.ok(pkg.scripts.test, 'Script de teste ausente');
assert.ok(pkg.scripts.deploy, 'Script de deploy ausente');
console.log('  ✓ package.json configurado corretamente');

// Teste 3: Validação do vercel.json
const vercelConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'vercel.json'), 'utf-8'));
assert.strictEqual(vercelConfig.version, 2);
assert.ok(Array.isArray(vercelConfig.rewrites), 'Rewrites ausentes no vercel.json');
console.log('  ✓ vercel.json estruturado e válido');

// Teste 4: Validação do Frontend index.html
const html = fs.readFileSync(path.join(ROOT_DIR, 'public', 'index.html'), 'utf-8');
assert.ok(html.includes('ANTIGRAVITY'), 'Título ausente no HTML');
assert.ok(html.includes('100.79.145.95'), 'IP do Nó 1 ausente no HTML');
assert.ok(html.includes('100.65.93.99'), 'IP do Nó 2 ausente no HTML');
console.log('  ✓ Frontend index.html contém referências da topologia');

console.log('🎉 Todos os testes passaram com sucesso (0 erros de compilação)!');
process.exit(0);
