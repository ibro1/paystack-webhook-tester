import { generateSignature } from './signature.js';

export interface DispatchOptions {
  targetUrl: string;
  payload: string | object;
  secretKey: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface DispatchResult {
  statusCode: number;
  statusText: string;
  latencyMs: number;
  headersSent: Record<string, string>;
  responseBody: string;
  error?: string;
}

/**
 * Dispatches a simulated Paystack webhook to the target URL.
 * Automatically attaches Content-Type and x-paystack-signature headers.
 */
export async function dispatchWebhook(options: DispatchOptions): Promise<DispatchResult> {
  const { targetUrl, payload, secretKey, headers = {}, timeoutMs = 15000 } = options;

  if (!targetUrl) {
    throw new Error('Target URL is required for webhook dispatch');
  }

  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signature = generateSignature(payloadString, secretKey);

  const requestHeaders: Record<string, string> = {
    'content-type': 'application/json',
    'x-paystack-signature': signature,
    'user-agent': 'Paystack-Webhook-Simulator/0.1.0',
    ...headers,
  };

  const startTime = Date.now();
  let statusCode = 0;
  let statusText = '';
  let responseBody = '';
  let errorMsg: string | undefined;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timer);
    statusCode = response.status;
    statusText = response.statusText;
    responseBody = await response.text();
  } catch (err: any) {
    errorMsg = err.message || String(err);
    statusCode = 0;
    statusText = 'Dispatch Failed';
    responseBody = `Error: ${errorMsg}`;
  }

  const latencyMs = Date.now() - startTime;

  return {
    statusCode,
    statusText,
    latencyMs,
    headersSent: requestHeaders,
    responseBody,
    ...(errorMsg ? { error: errorMsg } : {}),
  };
}
