import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSignature,
  verifySignature,
  listTemplates,
  getTemplate,
  dispatchWebhook,
  WebhookServer,
} from '../src/index.js';

describe('Unit Tests: Signature Generation & Verification', () => {
  const secret = 'sk_test_1234567890abcdef12345678';

  it('handles object input identically to stringified JSON', () => {
    const obj = { event: 'charge.success', id: 100 };
    const sig1 = generateSignature(obj, secret);
    const sig2 = generateSignature(JSON.stringify(obj), secret);
    assert.equal(sig1, sig2);
  });

  it('rejects verification when signature is null, undefined, or empty', () => {
    assert.equal(verifySignature('{}', undefined, secret), false);
    assert.equal(verifySignature('{}', null as any, secret), false);
    assert.equal(verifySignature('{}', '', secret), false);
    assert.equal(verifySignature('{}', 'short', secret), false);
  });

  it('rejects verification when secretKey is empty', () => {
    const sig = generateSignature('{}', secret);
    assert.equal(verifySignature('{}', sig, ''), false);
  });

  it('correctly handles case-insensitivity of hex signature', () => {
    const sig = generateSignature('{}', secret);
    assert.equal(verifySignature('{}', sig.toUpperCase(), secret), true);
  });
});

describe('Unit Tests: Templates', () => {
  it('clones templates so mutations do not affect future calls', () => {
    const tpl1 = getTemplate('charge.success');
    tpl1.data.amount = 999999;
    const tpl2 = getTemplate('charge.success');
    assert.notEqual(tpl2.data.amount, 999999);
  });

  it('throws descriptive error on unknown template', () => {
    assert.throws(() => getTemplate('unknown.event'), /Template not found: unknown\.event/);
  });
});

describe('Unit Tests: Webhook Dispatcher', () => {
  it('handles unreachable targets gracefully without throwing', async () => {
    const result = await dispatchWebhook({
      targetUrl: 'http://127.0.0.1:54321/non-existent-endpoint',
      payload: { test: true },
      secretKey: 'sk_test_dummy',
      timeoutMs: 500,
    });
    assert.equal(result.statusCode, 0);
    assert.ok(result.error);
    assert.ok(result.responseBody.includes('Error:'));
  });
});

describe('Unit Tests: Webhook Server History & Max Cap', () => {
  it('caps history list at maxHistory limit and clears on command', async () => {
    const server = new WebhookServer({ port: 0, maxHistory: 3 });
    const port = await server.start();
    try {
      for (let i = 0; i < 5; i++) {
        await fetch(`http://127.0.0.1:${port}/api/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ index: i }),
        });
      }
      const history = server.getHistory();
      assert.equal(history.length, 3);
      assert.equal(history[0].payload.index, 4);

      server.clearHistory();
      assert.equal(server.getHistory().length, 0);
    } finally {
      await server.stop();
    }
  });
});
