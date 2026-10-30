# 🏛️ Arquitetura do Cluster Antigravity AI Farm

## 1. Visão Geral da Topologia

O cluster unifica múltiplos computadores físicos locais via malha segura **Tailscale (WireGuard Mesh)**, expondo serviços locais de inferência com baixa latência (~40ms) e sem necessidade de abrir portas para a internet pública.

```mermaid
graph TD
    subgraph Clients["Clientes & IDEs"]
        Mac["MacBook Air M-Series (Ambiente Principal de Dev)"]
        Cline["Cline Extension (Antigravity IDE)"]
        Dashboard["Dashboard Vercel Edge / Local"]
    end

    subgraph Mesh["Malha Tailscale Privada (100.x.y.z)"]
        VPN["Túnel Seguro P2P / DERP sao"]
    end

    subgraph Node1["Nó 1: PC Casa i7 (100.79.145.95)"]
        RTX["NVIDIA RTX 3080 10GB (760 GB/s GDDR6X)"]
        RAM1["64 GB RAM DDR4"]
        Ollama1["Ollama Service (:11434)"]
        M1["qwen2.5-coder:14b (Deep Code)"]
        M2["deepseek-r1:14b (Reasoning)"]
    end

    subgraph Node2["Nó 2: PC Casa R7 (100.65.93.99)"]
        CPU2["AMD Ryzen 7 3700X (8c/16t)"]
        RAM2["24 GB RAM DDR4 + RX 580 (8GB)"]
        Ollama2["Ollama Service (:11434)"]
        M3["nomic-embed-text (RAG Embeddings)"]
        M4["qwen2.5-coder:7b (Worker Leve)"]
    end

    Clients --> Mesh
    Mesh --> Node1
    Mesh --> Node2
    Ollama1 --> RTX
    Ollama1 --> RAM1
    Ollama2 --> CPU2
    Ollama2 --> RAM2
```

---

## 2. Métricas de Capacidade Combinada

- **Memória RAM de Sistema:** 88 GB (64 GB Nó 1 + 24 GB Nó 2).
- **Memória de Vídeo (VRAM):** 18 GB (10 GB RTX 3080 + 8 GB RX 580).
- **Processamento:** 16 Núcleos Físicos / 32 Threads (Intel i7 + AMD Ryzen 7 3700X).

---

## 3. Roteamento Inteligente de Tarefas (Task Specialization)

1. **Geração de Código Complexo & Refatoração:**
   - Destinado exclusivamente ao **Nó 1 (RTX 3080)**.
   - O modelo `qwen2.5-coder:14b` aloca ~7.26 GB na VRAM e 3 GB na RAM do sistema, mantendo geração estável em ~10 tokens por segundo.
2. **Geração de Embeddings & Busca Vetorial de Arquivos:**
   - Destinado ao **Nó 2 (Ryzen 7 3700X)**.
   - O modelo `nomic-embed-text` roda leve na CPU/RAM do Ryzen 7, permitindo indexar repositórios inteiros em milissegundos sem forçar a troca de modelo na GPU da RTX 3080.
