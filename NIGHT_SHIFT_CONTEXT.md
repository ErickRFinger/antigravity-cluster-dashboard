# 🌙 Contexto para o Turno da Noite (Home PC Continuation)

> **Instrução Primária para o Antigravity / Agentes no PC de Casa:**  
> Leia este documento na íntegra ao abrir o repositório. Este arquivo resume 100% das decisões tomadas no turno diurno (no Mac) e o plano de ação cirúrgico para a integração do segundo nó com o processador **Ryzen 7 3700X**.

---

## 1. O que foi feito hoje no Mac (Turno Diurno)

1. **Validação da Conexão com o PC 1 (i7 + RTX 3080):**
   - IP Tailscale: `100.79.145.95` (`pc-casa-i7`).
   - Latência média: `42.6 ms`, 0% de perda de pacotes.
   - Endpoint Ollama (`http://100.79.145.95:11434/api/tags`) validado com os modelos:
     - `qwen2.5-coder:14b` (9 GB)
     - `deepseek-r1:14b` (9 GB)
     - `glm-4.7-flash-hybrid:latest` (19 GB)
     - `glm-4.7-flash:latest` (19 GB)
     - `llama3:latest` (4.6 GB)

2. **Configuração do SSH:**
   - Adicionado alias no `~/.ssh/config` do Mac:
     ```sshconfig
     Host pc-ia
         HostName 100.79.145.95
         User "Erick Finger"
         Port 22
     ```

3. **Configuração da Extensão Cline no Antigravity IDE (Mac):**
   - Configurados `~/.cline/data/settings/providers.json` e `~/.cline/data/globalState.json`.
   - Provedor ativo configurado para `ollama`, apontando para `http://100.79.145.95:11434` e modelo `qwen2.5-coder:14b`.

4. **Benchmark Real de Inferência na RTX 3080:**
   - **Time to First Token (TTFT):** `0.88s` (rápido).
   - **Velocidade de Geração:** `~10.0 tokens/segundo` contínuos.
   - **Alocação de Memória:** O modelo 14B + contexto de 4096 consome 10.3 GB. Na RTX 3080 (10 GB VRAM), o Ollama alocou 7.26 GB (~70%) na VRAM e 30% na RAM do sistema (CPU offload).

5. **Criação e Publicação da Dashboard:**
   - Repositório Git configurado e publicado no GitHub (`ErickRFinger/antigravity-cluster-dashboard`).
   - Deploy em produção realizado na Vercel.

---

## 2. Missão do Turno da Noite: Integrar o Nó 2 (Ryzen 7 3700X)

### Especificações do Nó 2:
- **Identificador Tailscale:** `pc-casa-r7` (IP: `100.65.93.99`).
- **CPU:** AMD Ryzen 7 3700X (8 Cores / 16 Threads).
- **RAM:** 24 GB DDR4 (2133 MHz).
- **GPU:** AMD Radeon RX 580 (8 GB GDDR5 - Polaris).

### Divisão de Papéis da Farm:
- **Nó 1 (RTX 3080):** Focado exclusivamente em **Codificação Pesada** (`qwen2.5-coder:14b`) e **Raciocínio Lógico** (`deepseek-r1:14b`).
- **Nó 2 (Ryzen 7 3700X):** Focado em **Embeddings Semânticos** (`nomic-embed-text`) para busca vetorial de código/projetos e modelos leves de triagem (`qwen2.5-coder:7b`). Isso impede que a RTX 3080 precise descarregar o modelo pesado toda vez que for indexar arquivos.

---

## 3. Checklist de Execução no Nó 2 (Ryzen 7):

Execute no terminal do PC Ryzen 7:

```bash
# 1. Instalar e iniciar o Ollama no Nó 2
# (se já estiver instalado, apenas certifique-se de que está ouvindo em 0.0.0.0:11434)
# Variável de ambiente recomendada: OLLAMA_HOST=0.0.0.0:11434

# 2. Baixar o modelo de Embeddings no Nó 2:
ollama pull nomic-embed-text

# 3. Baixar um modelo rápido de 7B no Nó 2 (cabe 100% na RAM/GPU sem gargalo):
ollama pull qwen2.5-coder:7b

# 4. Testar conexão local:
curl http://localhost:11434/api/tags

# 5. Testar conexão com o Nó 1 (RTX 3080):
curl http://100.79.145.95:11434/api/tags
```

---

## 4. Atualização da Dashboard:
Quando o Nó 2 estiver com o Ollama respondendo em `http://100.65.93.99:11434`, acesse a dashboard ou altere o status de `configured_standby` para `active` em `api/status.js`, execute `npm run build` e publique a nova versão com `npm run deploy`!
