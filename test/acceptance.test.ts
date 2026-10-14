import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  generateSignature,
  verifySignature,
  listTemplates,
  getTemplate,
  dispatchWebhook,
  WebhookServer,
} from '../src/index.js';

describe('Acceptance Criteria: Paystack Webhook Tester', () => {
  const sampleSecret = 'sk_test_99a88b77c66d55e44f33';
  const samplePayload = JSON.stringify({
    event: 'charge.success',
    data: {
      id: 3029281,
      domain: 'test',
      status: 'success',
      reference: 'ref_123456789',
      amount: 500000,
      gateway_response: 'Successful',
      channel: 'card',
      currency: 'NGN',
      customer: {
        id: 84920,
        email: 'customer@example.com',
        customer_code: 'CUS_mockcode123',
      },
    },
  });

  it('generates an accurate HMAC-SHA512 hex signature', () => {
    const signature = generateSignature(samplePayload, sampleSecret);
    assert.equal(typeof signature, 'string');
    assert.equal(signature.length, 128); // SHA-512 hex is 128 characters
  });

  it('verifies valid signatures and rejects invalid or tampered signatures', () => {
    const signature = generateSignature(samplePayload, sampleSecret);
    assert.equal(verifySignature(samplePayload, signature, sampleSecret), true);

    // Tampered payload
    const tampered = samplePayload.replace('500000', '999999');
    assert.equal(verifySignature(tampered, signature, sampleSecret), false);

    // Wrong secret
    assert.equal(verifySignature(samplePayload, signature, 'sk_test_wrong_secret'), false);

    // Invalid signature string
    assert.equal(verifySignature(samplePayload, 'invalid_hex_string', sampleSecret), false);
  });

  it('provides realistic templates for standard Paystack webhook events', () => {
    const templates = listTemplates();
    assert.ok(templates.includes('charge.success'));
    assert.ok(templates.includes('transfer.success'));
    assert.ok(templates.includes('transfer.failed'));
    assert.ok(templates.includes('invoice.payment_failed'));

    const chargeSuccess = getTemplate('charge.success');
    assert.equal(chargeSuccess.event, 'charge.success');
    assert.equal(chargeSuccess.data.currency, 'NGN');
    assert.ok(chargeSuccess.data.amount > 0);
    assert.ok(chargeSuccess.data.customer.email);
  });

  it('dispatches webhook requests with correct x-paystack-signature header', async () => {
    let receivedHeader: string | undefined;
    let receivedBody = '';

    const receiver = http.createServer((req, res) => {
      receivedHeader = req.headers['x-paystack-signature'] as string;
      const chunks: Buffer[] = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        receivedBody = Buffer.concat(chunks).toString('utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));
      });
    });

    await new Promise<void>((resolve) => receiver.listen(0, '127.0.0.1', () => resolve()));
    const port = (receiver.address() as any).port;
    const targetUrl = `http://127.0.0.1:${port}/webhook`;

    try {
      const result = await dispatchWebhook({
        targetUrl,
        payload: samplePayload,
        secretKey: sampleSecret,
      });

      assert.equal(result.statusCode, 200);
      assert.ok(result.latencyMs >= 0);
      assert.equal(receivedHeader, generateSignature(samplePayload, sampleSecret));
      assert.equal(receivedBody, samplePayload);
    } finally {
      await new Promise<void>((resolve) => receiver.close(() => resolve()));
    }
  });

  it('starts server and responds to REST and ingest endpoints', async () => {
    const server = new WebhookServer({ port: 0, secretKey: sampleSecret });
    const port = await server.start();
    try {
      // Health check
      const healthRes = await fetch(`http://127.0.0.1:${port}/api/health`);
      assert.equal(healthRes.status, 200);
      const healthData = await healthRes.json();
      assert.equal((healthData as any).status, 'ok');

      // Templates API
      const tplRes = await fetch(`http://127.0.0.1:${port}/api/templates`);
      assert.equal(tplRes.status, 200);
      const tplList = (await tplRes.json()) as any;
      assert.ok(Array.isArray(tplList.templates));

      // Ingest endpoint
      const sig = generateSignature(samplePayload, sampleSecret);
      const ingestRes = await fetch(`http://127.0.0.1:${port}/api/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paystack-signature': sig,
        },
        body: samplePayload,
      });
      assert.equal(ingestRes.status, 200);
      const ingestResult = (await ingestRes.json()) as any;
      assert.equal(ingestResult.isValidSignature, true);
    } finally {
      await server.stop();
    }
  });
});
