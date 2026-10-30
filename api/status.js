// Vercel Serverless Function - Cluster Status & Healthcheck
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const topology = {
    clusterName: "Antigravity AI Compute Farm",
    updatedAt: new Date().toISOString(),
    nodes: [
      {
        id: "node-1",
        name: "PC Casa i7 (Primary Inference Node)",
        ip: "100.79.145.95",
        tailscaleHostname: "pc-casa-i7",
        port: 11434,
        status: "active",
        hardware: {
          cpu: "Intel Core i7 (8c/16t)",
          ram: "64 GB DDR4",
          gpu: "NVIDIA GeForce RTX 3080",
          vram: "10 GB GDDR6X",
          bandwidth: "760 GB/s"
        },
        roles: ["Heavy Coding (qwen2.5-coder:14b)", "Deep Reasoning (deepseek-r1:14b)"],
        ollamaUrl: "http://100.79.145.95:11434"
      },
      {
        id: "node-2",
        name: "PC Casa R7 (Secondary / Worker Node)",
        ip: "100.65.93.99",
        tailscaleHostname: "pc-casa-r7",
        port: 11434,
        status: "configured_standby",
        hardware: {
          cpu: "AMD Ryzen 7 3700X (8c/16t)",
          ram: "24 GB DDR4 2133MHz",
          gpu: "AMD Radeon RX 580",
          vram: "8 GB GDDR5"
        },
        roles: ["Embeddings (nomic-embed-text)", "Semantic Search / RAG", "Fast Helper LLMs"],
        ollamaUrl: "http://100.65.93.99:11434"
      }
    ],
    totals: {
      totalNodes: 2,
      totalRam: "88 GB DDR4",
      totalVram: "18 GB",
      totalCoresThreads: "16 Cores / 32 Threads"
    }
  };

  return res.status(200).json({
    ok: true,
    message: "Antigravity Cluster Operational",
    cluster: topology
  });
}
