#!/usr/bin/env node

import { WebhookServer } from './server.js';
import { generateSignature, verifySignature } from './signature.js';
import { listTemplates, getTemplate } from './templates.js';
import { dispatchWebhook } from './dispatcher.js';

function parseArgs(args: string[]): { command: string; options: Record<string, string> } {
  const command = args[0] || 'help';
  const options: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        options[key] = next;
        i++;
      } else {
        options[key] = 'true';
      }
    }
  }

  return { command, options };
}

function showHelp() {
  console.log(`
Paystack Webhook Tester & Simulator (v0.1.0)

Usage:
  paystack-webhook-tester <command> [options]

Commands:
  serve                      Start the web dashboard & webhook receiver
    --port <port>            Port to listen on (default: 3000)
    --host <host>            Host to bind to (default: 0.0.0.0)
    --secret <secretKey>     Default secret key for verification
    --self-only              Only dispatch to paths on this server (for public demos)

  sign                       Compute HMAC-SHA512 x-paystack-signature
    --payload <json>         Payload string or JSON
    --secret <secretKey>     Paystack secret key

  verify                     Verify a webhook signature
    --payload <json>         Payload string or JSON
    --signature <hex>        x-paystack-signature header value
    --secret <secretKey>     Paystack secret key

  dispatch                   Send a simulated Paystack webhook
    --event <name>           Template event name (e.g. charge.success)
    --payload <json>         Custom payload JSON (overrides --event)
    --target <url>           Target webhook URL
    --secret <secretKey>     Paystack secret key

  templates                  List all available event templates

Examples:
  paystack-webhook-tester serve --port 3000
  paystack-webhook-tester sign --payload '{"event":"charge.success"}' --secret sk_test_123
  paystack-webhook-tester dispatch --event charge.success --target http://localhost:8000/webhook --secret sk_test_123
`);
}

async function main() {
  const args = process.argv.slice(2);
  const { command, options } = parseArgs(args);

  switch (command) {
    case 'serve': {
      const port = parseInt(options.port || process.env.PORT || '3000', 10);
      const host = options.host || '0.0.0.0';
      const secretKey = options.secret || process.env.PAYSTACK_SECRET_KEY || 'sk_test_demo1234567890abcdef';
      const selfOnly = options['self-only'] === 'true' || process.env.DISPATCH_SELF_ONLY === '1';
      const server = new WebhookServer({ port, host, secretKey, selfOnly });
      const runningPort = await server.start();
      console.log(`Paystack Webhook Tester running at http://${host === '0.0.0.0' ? 'localhost' : host}:${runningPort}`);
      console.log(`Webhook Ingest Endpoint: http://${host === '0.0.0.0' ? 'localhost' : host}:${runningPort}/api/ingest`);
      if (selfOnly) console.log('Self-only mode: dispatches go only to paths on this server.');
      break;
    }

    case 'sign': {
      const payload = options.payload;
      const secret = options.secret || process.env.PAYSTACK_SECRET_KEY;
      if (!payload || !secret) {
        console.error('Error: Both --payload and --secret are required for signing.');
        process.exit(1);
      }
      const signature = generateSignature(payload, secret);
      console.log(signature);
      break;
    }

    case 'verify': {
      const payload = options.payload;
      const signature = options.signature;
      const secret = options.secret || process.env.PAYSTACK_SECRET_KEY;
      if (!payload || !signature || !secret) {
        console.error('Error: --payload, --signature, and --secret are required for verification.');
        process.exit(1);
      }
      const isValid = verifySignature(payload, signature, secret);
      if (isValid) {
        console.log('✓ Signature is VALID');
        process.exit(0);
      } else {
        console.error('✗ Signature is INVALID');
        process.exit(1);
      }
    }

    case 'dispatch': {
      const targetUrl = options.target;
      const secretKey = options.secret || process.env.PAYSTACK_SECRET_KEY || 'sk_test_demo1234567890abcdef';
      let payload = options.payload;

      if (!payload && options.event) {
        payload = JSON.stringify(getTemplate(options.event));
      }

      if (!targetUrl || !payload) {
        console.error('Error: --target and either --event or --payload are required.');
        process.exit(1);
      }

      console.log(`Dispatching webhook to ${targetUrl}...`);
      const result = await dispatchWebhook({ targetUrl, payload, secretKey });
      console.log(`Status: ${result.statusCode} ${result.statusText} (${result.latencyMs}ms)`);
      console.log(`Headers sent:\n${JSON.stringify(result.headersSent, null, 2)}`);
      console.log(`Response body:\n${result.responseBody}`);
      break;
    }

    case 'templates': {
      console.log('Available Paystack Webhook Templates:');
      listTemplates().forEach((t) => console.log(`  - ${t}`));
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
