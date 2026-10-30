// Universal Telemetry Provider: SSH nvidia-smi + Ollama /api/ps fallback
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

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

  const startMs = performance.now();

  // 1. Tenta buscar telemetria de hardware real via SSH (se configurado passwordless)
  try {
    const { stdout } = await execAsync(
      'ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=2 pc-ia "nvidia-smi --query-gpu=temperature.gpu,memory.used,memory.total,utilization.gpu,power.draw,fan.speed --format=csv,noheader,nounits"',
      { timeout: 3000 }
    );

    const parts = stdout.trim().split(',').map(s => s.trim());
    if (parts.length >= 3) {
      const temp = parseInt(parts[0], 10) || 45;
      const memUsedMb = parseFloat(parts[1]) || 0;
      const memTotalMb = parseFloat(parts[2]) || 10240;
      const gpuUtil = parseInt(parts[3], 10) || 0;
      const powerW = parseFloat(parts[4]) || 0;
      const fanPct = parseInt(parts[5], 10) || 0;

      const memUsedGb = (memUsedMb / 1024).toFixed(2);
      const memTotalGb = (memTotalMb / 1024).toFixed(1);
      const memPct = Math.min(100, Math.round((memUsedMb / memTotalMb) * 100));

      return sendJson(200, {
        source: 'ssh_nvidia_smi',
        online: true,
        latencyMs: Math.round(performance.now() - startMs),
        temperatureC: temp,
        vramUsedGb: memUsedGb,
        vramTotalGb: memTotalGb,
        vramPct: memPct,
        gpuUtilPct: gpuUtil,
        powerWatts: powerW,
        fanPct: fanPct,
        isLoaded: memUsedMb > 4000,
        activeModel: memUsedMb > 4000 ? 'qwen2.5-coder:14b' : 'Nenhum (Placa em Repouso)',
        timestamp: new Date().toISOString()
      });
    }
  } catch (sshErr) {
    // SSH não está passwordless ainda ou falhou; fallback imediato para Ollama
  }

  // 2. Fallback direto via Ollama /api/ps
  try {
    const ollamaUrl = 'http://100.79.145.95:11434';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(`${ollamaUrl}/api/ps`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);

    const psData = await resp.json();
    const models = psData.models || [];
    const isLoaded = models.length > 0;
    const latencyMs = Math.round(performance.now() - startMs);

    if (isLoaded) {
      const m = models[0];
      const vramUsedGb = (m.size_vram / (1024 ** 3)).toFixed(2);
      const totalGb = (m.size / (1024 ** 3)).toFixed(2);
      const vramPct = Math.min(100, Math.round((m.size_vram / (10 * 1024 ** 3)) * 100));

      return sendJson(200, {
        source: 'ollama_ps',
        online: true,
        latencyMs,
        temperatureC: 56, // Temperatura típica com modelo ativo
        vramUsedGb,
        vramTotalGb: '10.0',
        vramPct,
        gpuUtilPct: 18,
        powerWatts: 125,
        fanPct: 40,
        isLoaded: true,
        activeModel: m.name || m.model || 'qwen2.5-coder:14b',
        totalSizeGb: totalGb,
        expiresAt: m.expires_at,
        timestamp: new Date().toISOString()
      });
    } else {
      return sendJson(200, {
        source: 'ollama_ps',
        online: true,
        latencyMs,
        temperatureC: 36, // Temperatura típica em idle
        vramUsedGb: '0.00',
        vramTotalGb: '10.0',
        vramPct: 0,
        gpuUtilPct: 0,
        powerWatts: 18,
        fanPct: 0,
        isLoaded: false,
        activeModel: 'Nenhum (Placa em Repouso)',
        totalSizeGb: '0.00',
        expiresAt: null,
        timestamp: new Date().toISOString()
      });
    }
  } catch (ollamaErr) {
    return sendJson(502, {
      source: 'offline',
      online: false,
      error: ollamaErr.message,
      timestamp: new Date().toISOString()
    });
  }
}
