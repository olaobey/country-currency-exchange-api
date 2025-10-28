// src/utils/axios.ts
import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';

/**
 * Keep-alive agent (helps on Windows / corporate networks).
 * Also plays nicely with proxies if HTTPS_PROXY/HTTP_PROXY is set.
 */
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
});

export const http = axios.create({
  timeout: 30000, // 30s
  httpsAgent,
  headers: {
    'User-Agent': 'CountryCurrencyExchange/1.0 (+https://example.com)',
    Accept: 'application/json',
  },
  maxRedirects: 3,
});

/** tiny sleep helper */
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Resilient GET with retries + exponential backoff.
 * - attempts: total tries (default 3)
 * - config: axios config override per call if needed
 */
export async function safeGet<T>(
  url: string,
  config?: AxiosRequestConfig,
  attempts = 3,
): Promise<T> {
  let lastErr: unknown;

  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await http.get<T>(url, config);
      return res.data;
    } catch (err) {
      lastErr = err;
      // Backoff: 500ms, 1s, 2s ...
      const backoff = 500 * Math.pow(2, i - 1);
      if (i < attempts) await sleep(backoff);
    }
  }

  const e = new Error(`FETCH_FAILED:${url}`);
  (e as any).cause = lastErr;
  throw e;
}
