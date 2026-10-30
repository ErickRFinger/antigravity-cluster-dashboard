// Vercel Serverless Function & Local Proxy Helper - Real-Time Ollama Relay
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Target-Node');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetNode = req.query.url || req.headers['x-target-node'] || 'http://100.79.145.95:11434';
  const apiPath = req.query.path || '/api/ps';

  try {
    const cleanBase = targetNode.replace(/\/+$/, '');
    const cleanPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    const destinationUrl = `${cleanBase}${cleanPath}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const options = {
      method: req.method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (req.method === 'POST') {
      let bodyData = req.body;
      if (typeof bodyData === 'object') {
        bodyData = JSON.stringify(bodyData);
      }
      if (bodyData) {
        options.body = bodyData;
      }
    }

    const start = performance.now();
    const response = await fetch(destinationUrl, options);
    const latencyMs = Math.round(performance.now() - start);
    clearTimeout(timeout);

    const json = await response.json().catch(() => ({}));

    // Attach latency header & metadata
    res.setHeader('X-Ollama-Latency-Ms', latencyMs.toString());
    return res.status(response.status).json({
      ...json,
      _telemetry: {
        latencyMs,
        queriedAt: new Date().toISOString(),
        node: cleanBase
      }
    });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: "Ollama Node Unreachable via Proxy",
      details: err.message,
      target: targetNode,
      tip: "When running from Vercel cloud, the browser client makes direct Tailscale requests or uses the local node server."
    });
  }
}
