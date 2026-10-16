import http from 'node:http';
import { generateSignature, verifySignature } from './signature.js';
import { listTemplates, getTemplate } from './templates.js';
import { dispatchWebhook } from './dispatcher.js';
import { getDashboardHtml } from './ui.js';

export interface IngestRecord {
  id: string;
  timestamp: string;
  headers: Record<string, string | string[] | undefined>;
  payload: any;
  rawBody: string;
  signature?: string;
  isValidSignature?: boolean;
}

export interface ServerOptions {
  port?: number;
  host?: string;
  secretKey?: string;
  maxHistory?: number;
  /** Refuse dispatch targets outside this server (for public demos). */
  selfOnly?: boolean;
}

export class WebhookServer {
  private server: http.Server | null = null;
  private history: IngestRecord[] = [];
  public port: number = 0;
  public host: string;
  public secretKey: string;
  private maxHistory: number;
  private selfOnly: boolean;

  constructor(options: ServerOptions = {}) {
    this.port = options.port ?? 3000;
    this.host = options.host ?? '0.0.0.0';
    this.secretKey = options.secretKey ?? 'sk_test_demo1234567890abcdef';
    this.maxHistory = options.maxHistory ?? 100;
    this.selfOnly = options.selfOnly ?? false;
  }

  public getHistory(): IngestRecord[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
  }

  public async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        try {
          await this.handleRequest(req, res);
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
        }
      });

      this.server.on('error', reject);
      this.server.listen(this.port, this.host, () => {
        const addr = this.server?.address();
        if (typeof addr === 'object' && addr !== null) {
          this.port = addr.port;
        }
        resolve(this.port);
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
    const pathname = parsedUrl.pathname;
    const method = (req.method || 'GET').toUpperCase();

    // Enable CORS for development ease
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-paystack-signature');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Serve Dashboard
    if (method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      const html = getDashboardHtml();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Health check
    if (method === 'GET' && pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), version: '0.1.0' }));
      return;
    }

    // Templates list
    if (method === 'GET' && pathname === '/api/templates') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ templates: listTemplates() }));
      return;
    }

    // Template item
    if (method === 'GET' && pathname.startsWith('/api/templates/')) {
      const name = decodeURIComponent(pathname.slice('/api/templates/'.length));
      try {
        const template = getTemplate(name);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(template));
      } catch (err: any) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Sign payload
    if (method === 'POST' && pathname === '/api/sign') {
      const body = await this.readJsonBody(req);
      const secret = body.secretKey || this.secretKey;
      const signature = generateSignature(body.payload || '', secret);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ signature }));
      return;
    }

    // Verify signature
    if (method === 'POST' && pathname === '/api/verify') {
      const body = await this.readJsonBody(req);
      const secret = body.secretKey || this.secretKey;
      const valid = verifySignature(body.payload || '', body.signature, secret);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid }));
      return;
    }

    // Dispatch webhook
    if (method === 'POST' && pathname === '/api/dispatch') {
      const body = await this.readJsonBody(req);
      const target = this.resolveTarget(body.targetUrl);
      if ('error' in target) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: target.error }));
        return;
      }
      const result = await dispatchWebhook({
        targetUrl: target.url,
        payload: body.payload,
        secretKey: body.secretKey || this.secretKey,
        headers: body.headers,
        timeoutMs: body.timeoutMs,
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // History endpoints
    if (pathname === '/api/history') {
      if (method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ history: this.history }));
        return;
      }
      if (method === 'DELETE') {
        this.clearHistory();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ cleared: true }));
        return;
      }
    }

    // Ingest receiver endpoint
    if (method === 'POST' && pathname === '/api/ingest') {
      const rawBody = await this.readRawBody(req);
      const signatureHeader = req.headers['x-paystack-signature'] as string | undefined;

      let parsedPayload: any = null;
      try {
        parsedPayload = JSON.parse(rawBody);
      } catch {
        parsedPayload = { raw: rawBody };
      }

      const isValid = verifySignature(rawBody, signatureHeader, this.secretKey);

      const record: IngestRecord = {
        id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        headers: req.headers,
        payload: parsedPayload,
        rawBody,
        signature: signatureHeader,
        isValidSignature: isValid,
      };

      this.history.unshift(record);
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'received', recordId: record.id, isValidSignature: isValid }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }

  /**
   * Turns a dispatch target into an absolute URL. A path such as /api/ingest
   * points at this server; in self-only mode nothing else is allowed.
   */
  private resolveTarget(targetUrl: unknown): { url: string } | { error: string } {
    if (typeof targetUrl !== 'string' || !targetUrl.trim()) {
      return { error: 'targetUrl is required' };
    }
    const target = targetUrl.trim();
    if (target.startsWith('/') && !target.startsWith('//')) {
      return { url: `http://127.0.0.1:${this.port}${target}` };
    }
    if (this.selfOnly) {
      return { error: 'This server runs in self-only mode: dispatch to a path on this server, such as /api/ingest' };
    }
    try {
      const url = new URL(target);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { error: 'targetUrl must be an http or https URL' };
      }
      return { url: url.toString() };
    } catch {
      return { error: 'targetUrl is not a valid URL' };
    }
  }

  private readRawBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      req.on('error', reject);
    });
  }

  private async readJsonBody(req: http.IncomingMessage): Promise<any> {
    const raw = await this.readRawBody(req);
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  }
}
