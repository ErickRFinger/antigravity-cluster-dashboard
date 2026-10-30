// Vercel Serverless Function - Telemetry Status (PC Principal: RTX 3080)
export default async function handler(req, res) {
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).end();
    res.writeHead(200);
    return res.end();
  }

  const sendJson = (code, obj) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(code).json(obj);
    }
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };

  const payload = {
    clusterName: "Antigravity AI Compute Farm",
    updatedAt: new Date().toISOString(),
    primaryNode: {
      name: "PC Casa i7 (RTX 3080 10GB)",
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
      roles: ["Deep Coding (qwen2.5-coder:14b)", "Deep Reasoning (deepseek-r1:14b)"],
      ollamaUrl: "http://100.79.145.95:11434"
    }
  };

  return sendJson(200, {
    ok: true,
    message: "PC Principal Telemetry Operational",
    data: payload
  });
}
