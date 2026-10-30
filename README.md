# Antigravity // AI Compute Farm Dashboard

Dashboard unificada de telemetria, controle de VRAM e monitoramento em tempo real do Cluster de IA Local Antigravity (Dual-Node: RTX 3080 + Ryzen 7 via Tailscale).

---

## 1. Visão Geral e Objetivo
Este sistema permite monitorar, testar e orquestrar os nós de inteligência artificial locais da rede doméstica do Erick Finger:
- **Nó 1 (PC Casa i7):** NVIDIA RTX 3080 10GB + 64GB RAM dedicado a modelos de codificação pesada (`qwen2.5-coder:14b`, `deepseek-r1:14b`).
- **Nó 2 (PC Casa R7):** AMD Ryzen 7 3700X (8c/16t) + 24GB RAM dedicado a geração de embeddings (`nomic-embed-text`) e workers secundários.
- **Ambiente de Desenvolvimento (MacBook Air):** IDEs (Antigravity IDE, Cline, Gemini) consumindo os endpoints locais via Tailscale sem latência de nuvem e com privacidade total de dados.

---

## 2. Stack Tecnológica & Pré-requisitos
- **Runtime & Linguagem:** Node.js 18+ / ES Modules
- **Frontend:** HTML5, Tailwind CSS, Google Fonts (Plus Jakarta Sans & JetBrains Mono), SVG Sparklines
- **Backend / Serverless:** Vercel Edge Serverless Functions (`api/status.js`, `api/proxy.js`)
- **Rede Privada:** Tailscale WireGuard Mesh (`100.79.145.95` e `100.65.93.99`)
- **Motor de Inferência:** Ollama v0.21+ (CUDA 12 / ROCm)

---

## 3. Mapa da Arquitetura & Estrutura de Arquivos

```
ANTIGRAVITY-CLUSTER-DASHBOARD/
├── api/
│   ├── status.js              # Serverless Function: Status e topologia do cluster
│   └── proxy.js               # Serverless Function: Proxy CORS para endpoints Ollama
├── public/
│   └── index.html             # Interface visual completa em Tailwind Dark Cyberpunk
├── scripts/
│   └── tri-agent.cjs          # Orquestrador Tri-Agent Synergy (Antigravity / Cline / Gemini)
├── test/
│   └── dashboard.test.cjs     # Suíte de validação e integridade de build
├── ARCHITECTURE.md            # Diagramas e detalhes da infraestrutura
├── NIGHT_SHIFT_CONTEXT.md     # Contexto estruturado para continuação à noite no PC
├── package.json               # Configuração e scripts npm
├── vercel.json                # Roteamento e headers de segurança Vercel
├── .env.example               # Template de variáveis de ambiente
└── README.md                  # Documentação obrigatória do projeto
```

---

## 4. Como Rodar & Como Publicar (Comandos Práticos)

### Execução Local:
```bash
# Instalar dependências (se houver) e rodar localmente
npm start
# Abre em http://localhost:3000
```

### Testes & Validação:
```bash
npm test
# ou npm run tri:audit
```

### Publicar em Produção (Vercel):
```bash
npm run deploy
```

---

## 5. Configurações & Variáveis de Ambiente

Consulte o arquivo `.env.example`:
- `NODE1_OLLAMA_URL`: URL do Ollama no Nó 1 (Padrão: `http://100.79.145.95:11434`)
- `NODE2_OLLAMA_URL`: URL do Ollama no Nó 2 (Padrão: `http://100.65.93.99:11434`)
- `DEFAULT_MODEL`: Modelo padrão para inferência de código (`qwen2.5-coder:14b`)

---

## 6. Histórico de Evolução & Decisões Técnicas

- **v1.0.0 (2026-10-30):**
  - Integração do Mac com o PC 1 via Tailscale (`100.79.145.95`).
  - Criação do alias `pc-ia` em `~/.ssh/config`.
  - Configuração do Cline no Antigravity IDE apontando para o servidor Ollama com o modelo `qwen2.5-coder:14b`.
  - Medição empírica de taxa de geração: ~10 tokens/s contínuos (com 70% na VRAM da RTX 3080 e 30% offload em CPU).
  - Lançamento da Dashboard centralizada e preparação da arquitetura para a integração do Ryzen 7 no turno noturno.
