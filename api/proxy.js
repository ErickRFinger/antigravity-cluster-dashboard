// Vercel Serverless Function & Local Proxy Helper - Universal Node & Cloud
export default async function handler(req, res) {
  // Safe CORS Headers
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Target-Node');
  }

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(200).end();
    res.writeHead(200);
    return res.end();
  }

  // Universal query parser
  let query = req.query;
  if (!query && req.url) {
    try {
      const u = new URL(req.url, 'http://localhost');
      query = Object.fromEntries(u.searchParams.entries());
    } catch {
      query = {};
    }
  }
  query = query || {};

  const targetNode = query.url || req.headers?.['x-target-node'] || 'http://100.79.145.95:11434';
  const apiPath = query.path || '/api/ps';

  const sendJson = (code, obj) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(code).json(obj);
    }
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };

  try {
    const cleanBase = targetNode.replace(/\/+$/, '');
    const cleanPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    const destinationUrl = `${cleanBase}${cleanPath}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const options = {
      method: req.method || 'GET',
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

    return sendJson(response.status, {
      ...json,
      _telemetry: {
        latencyMs,
        queriedAt: new Date().toISOString(),
        node: cleanBase
      }
    });
  } catch (err) {
    return sendJson(502, {
      ok: false,
      models: [],
      error: "Ollama Node Unreachable via Proxy",
      details: err.message,
      target: targetNode
    });
  }
}
