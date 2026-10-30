#!/usr/bin/env node

/**
 * ============================================================================
 * TRI-AGENT ORCHESTRATOR • ANTIGRAVITY CLUSTER DASHBOARD
 * ============================================================================
 * Hub de orquestração e despacho direto entre as 3 Frentes de Inteligência:
 * - Frente 1: Antigravity (Tech Lead & Arquiteto Geral - Chat Principal)
 * - Frente 2: Cline no Antigravity IDE (Operário Especialista de UI & Telas)
 * - Frente 3: Gemini / Antigravity IDE (Especialista Cirúrgico & Inline Assistant)
 *
 * Padrão Erick Ruan Finger • Autonomia Operacional Máxima
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const CLINE_TASK_FILE = path.join(ROOT_DIR, 'CLINE_TASK.md');

const cmd = process.argv[2] || 'status';

console.log(`[Tri-Agent Orchestrator] Executando comando: ${cmd}`);

switch (cmd) {
  case 'cline':
    console.log(`[Frente 2: Cline] Despachando especificações para ${CLINE_TASK_FILE}...`);
    if (!fs.existsSync(CLINE_TASK_FILE)) {
      fs.writeFileSync(CLINE_TASK_FILE, `# Tarefa Cline\n- Atualizar UI da Dashboard\n`);
    }
    console.log('✓ CLINE_TASK.md pronto.');
    break;

  case 'audit':
  case 'test':
    console.log('[Frente 1: Antigravity] Executando auditoria e suíte de testes...');
    try {
      execSync('node test/dashboard.test.cjs', { stdio: 'inherit', cwd: ROOT_DIR });
      console.log('✓ Auditoria concluída com 100% de sucesso.');
    } catch (e) {
      console.error('❌ Falha na auditoria:', e.message);
      process.exit(1);
    }
    break;

  case 'status':
  default:
    console.log('[Status] Cluster Dashboard Operacional. Pronto para deploy Vercel e Git.');
    break;
}
