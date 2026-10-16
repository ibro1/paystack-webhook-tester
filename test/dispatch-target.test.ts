import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WebhookServer, generateSignature, getTemplate } from '../src/index.js';

const secret = 'sk_test_demo1234567890abcdef';

async function dispatch(port: number, targetUrl: string) {
  const payload = JSON.stringify(getTemplate('charge.success'));
  const res = await fetch(`http://127.0.0.1:${port}/api/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUrl, payload, secretKey: secret }),
  });
  return { res, body: (await res.json()) as any, payload };
}

describe('Acceptance Criteria: Dispatch targets', () => {
  it('resolves a relative target such as /api/ingest to the server itself', async () => {
    const server = new WebhookServer({ port: 0, host: '127.0.0.1', secretKey: secret });
    const port = await server.start();
    try {
      const { res, body, payload } = await dispatch(port, '/api/ingest');
      assert.equal(res.status, 200);
      assert.equal(body.statusCode, 200);
      const history = server.getHistory();
      assert.equal(history.length, 1);
      assert.equal(history[0].rawBody, payload);
      assert.equal(history[0].signature, generateSignature(payload, secret));
      assert.equal(history[0].isValidSignature, true);
    } finally {
      await server.stop();
    }
  });

  it('refuses outside targets in self-only mode without sending anything', async () => {
    const server = new WebhookServer({ port: 0, host: '127.0.0.1', secretKey: secret, selfOnly: true });
    const port = await server.start();
    try {
      const { res, body } = await dispatch(port, 'http://169.254.169.254/latest/meta-data');
      assert.equal(res.status, 400);
      assert.match(body.error, /self-only/i);

      const ok = await dispatch(port, '/api/ingest');
      assert.equal(ok.body.statusCode, 200);
    } finally {
      await server.stop();
    }
  });

  it('rejects a dispatch without a target with HTTP 400', async () => {
    const server = new WebhookServer({ port: 0, host: '127.0.0.1', secretKey: secret });
    const port = await server.start();
    try {
      const { res } = await dispatch(port, '');
      assert.equal(res.status, 400);
    } finally {
      await server.stop();
    }
  });
});
