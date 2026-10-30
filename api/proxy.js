// Vercel Serverless Function - Ollama Proxy / Relay with CORS
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Target-Node');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url || req.headers['x-target-node'] || 'http://100.79.145.95:11434';
  const path = req.query.path || '/api/tags';

  try {
    const fetchUrl = `${targetUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : '/' + path}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const fetchOptions = {
      method: req.method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(fetchUrl, fetchOptions);
    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: "Ollama Proxy Unreachable",
      details: err.message,
      tip: "If accessing through Vercel cloud, ensure your browser device is connected to Tailscale and using Direct Client Mode."
    });
  }
}
