export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paystack Webhook Tester & Simulator</title>
  <style>
    :root {
      --bg-primary: #0b0f19;
      --bg-secondary: #111827;
      --bg-card: #1f2937;
      --bg-input: #111827;
      --border-color: #374151;
      --border-focus: #00c3f7;
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
      --paystack-cyan: #00c3f7;
      --paystack-blue: #0ba4db;
      --accent-green: #10b981;
      --accent-red: #ef4444;
      --accent-yellow: #f59e0b;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-primary);
      color: var(--text-main);
      font-family: var(--font-sans);
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #00c3f7 0%, #0ba4db 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #0b0f19;
      font-size: 1.2rem;
    }
    .brand h1 { font-size: 1.25rem; font-weight: 700; color: #fff; }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent-green);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-dot { width: 6px; height: 6px; background-color: var(--accent-green); border-radius: 50%; }
    .nav-tabs {
      display: flex;
      gap: 0.5rem;
    }
    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .tab-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.05); }
    .tab-btn.active {
      color: var(--paystack-cyan);
      background: rgba(0, 195, 247, 0.1);
      border-color: rgba(0, 195, 247, 0.3);
    }
    main {
      flex: 1;
      padding: 1.5rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 960px) {
      .grid-2 { grid-template-columns: 1fr; }
    }
    .card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }
    input[type="text"], input[type="password"], select, textarea {
      width: 100%;
      background-color: var(--bg-input);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.6rem 0.8rem;
      border-radius: 6px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="text"]:focus, input[type="password"]:focus, select:focus, textarea:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 2px rgba(0, 195, 247, 0.2);
    }
    textarea.code-editor {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      min-height: 280px;
      resize: vertical;
      line-height: 1.4;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #00c3f7 0%, #0ba4db 100%);
      color: #0b0f19;
    }
    .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-secondary {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-main);
    }
    .btn-secondary:hover { background: #2d3748; }
    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
    .signature-box {
      background-color: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.75rem;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      word-break: break-all;
      color: var(--paystack-cyan);
      user-select: all;
    }
    .btn-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }
    .status-pill {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      font-family: var(--font-mono);
    }
    .status-2xx { background: rgba(16, 185, 129, 0.2); color: var(--accent-green); }
    .status-4xx { background: rgba(245, 158, 11, 0.2); color: var(--accent-yellow); }
    .status-5xx, .status-err { background: rgba(239, 68, 68, 0.2); color: var(--accent-red); }
    .history-item {
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 0.8rem;
      margin-bottom: 0.75rem;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .history-item:hover { border-color: var(--paystack-cyan); }
    .history-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
    }
    footer {
      border-top: 1px solid var(--border-color);
      padding: 1rem 1.5rem;
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    footer a { color: var(--paystack-cyan); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-logo">P</div>
      <div>
        <h1>Paystack Webhook Tester</h1>
      </div>
      <span class="badge"><span class="badge-dot"></span> Ready</span>
    </div>
    <div class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('simulator')">Event Simulator</button>
      <button class="tab-btn" onclick="switchTab('ingest')">Incoming Webhook Feed</button>
      <button class="tab-btn" onclick="switchTab('verifier')">Signature Tool</button>
    </div>
  </header>

  <main>
    <!-- TAB 1: SIMULATOR -->
    <div id="tab-simulator" class="tab-panel active">
      <div class="grid-2">
        <div>
          <div class="card">
            <div class="card-title">
              <span>Event Configuration</span>
              <div class="btn-group">
                <button class="btn btn-secondary btn-sm" onclick="formatPayload()">Format JSON</button>
                <button class="btn btn-secondary btn-sm" onclick="resetTemplate()">Reset</button>
              </div>
            </div>

            <div class="form-group">
              <label for="templateSelect">Event Template</label>
              <select id="templateSelect" onchange="loadTemplate(this.value)">
                <option value="">Loading templates...</option>
              </select>
            </div>

            <div class="form-group">
              <label for="targetUrl">Target Webhook URL</label>
              <div style="display:flex; gap: 0.5rem;">
                <input type="text" id="targetUrl" value="/api/ingest" placeholder="http://localhost:8000/webhook">
                <button class="btn btn-secondary btn-sm" style="white-space:nowrap" onclick="useLocalIngest()">Use /api/ingest</button>
              </div>
            </div>

            <div class="form-group">
              <label for="secretKey">Paystack Secret Key</label>
              <input type="password" id="secretKey" value="sk_test_demo1234567890abcdef" placeholder="sk_test_..." oninput="updateLiveSignature()">
            </div>

            <div class="form-group">
              <label for="payloadEditor">JSON Event Payload</label>
              <textarea id="payloadEditor" class="code-editor" oninput="updateLiveSignature()"></textarea>
            </div>

            <div class="btn-group">
              <button class="btn btn-primary" onclick="dispatchWebhookEvent()" id="btnDispatch">
                🚀 Dispatch Webhook
              </button>
            </div>
          </div>
        </div>

        <div>
          <div class="card">
            <div class="card-title">
              <span>Live Header: x-paystack-signature</span>
              <button class="btn btn-secondary btn-sm" onclick="copySignature()">Copy Header</button>
            </div>
            <div id="liveSignature" class="signature-box">Calculating...</div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
              HMAC-SHA512 hex signature calculated automatically using secret key and payload.
            </p>
          </div>

          <div class="card">
            <div class="card-title">
              <span>Dispatch Result</span>
              <span id="resultMeta" style="font-size:0.8rem; color:var(--text-muted)"></span>
            </div>
            <div id="resultContent" style="color: var(--text-muted); font-size: 0.85rem;">
              No dispatch executed yet. Click "Dispatch Webhook" to send.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: INGEST FEED -->
    <div id="tab-ingest" class="tab-panel">
      <div class="card">
        <div class="card-title">
          <span>Incoming Webhook Receiver</span>
          <div class="btn-group">
            <button class="btn btn-secondary btn-sm" onclick="refreshHistory()">🔄 Refresh</button>
            <button class="btn btn-secondary btn-sm" onclick="clearHistory()">Clear Feed</button>
          </div>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Configure your local application or tunnel to POST to:
          <code id="ingestUrlDisplay" style="color:var(--paystack-cyan); background:var(--bg-input); padding: 0.2rem 0.4rem; border-radius:4px;"></code>
        </p>

        <div id="feedList">
          <div style="color: var(--text-muted); font-size: 0.85rem;">No webhooks received yet.</div>
        </div>
      </div>
    </div>

    <!-- TAB 3: SIGNATURE VERIFIER -->
    <div id="tab-verifier" class="tab-panel">
      <div class="card" style="max-width: 800px; margin: 0 auto;">
        <div class="card-title">Standalone Signature Verifier</div>
        <div class="form-group">
          <label>Secret Key</label>
          <input type="text" id="vSecret" value="sk_test_demo1234567890abcdef" placeholder="sk_test_...">
        </div>
        <div class="form-group">
          <label>Payload (String or JSON)</label>
          <textarea id="vPayload" class="code-editor" style="min-height: 150px;"></textarea>
        </div>
        <div class="form-group">
          <label>Signature (x-paystack-signature)</label>
          <input type="text" id="vSignature" placeholder="128-character hex HMAC SHA512">
        </div>
        <div class="btn-group" style="margin-bottom: 1rem;">
          <button class="btn btn-primary" onclick="verifyStandaloneSignature()">Verify Signature</button>
          <button class="btn btn-secondary" onclick="generateStandaloneSignature()">Generate Signature</button>
        </div>
        <div id="vResult" style="padding: 0.8rem; border-radius:6px; display:none;"></div>
      </div>
    </div>
  </main>

  <footer>
    Paystack Webhook Tester &bull; Open Source under MIT License &bull; <a href="https://github.com/ibro1/paystack-webhook-tester" target="_blank" rel="noopener">GitHub</a>
  </footer>

  <script>
    let templatesData = {};

    function switchTab(name) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('tab-' + name).classList.add('active');
      if (name === 'ingest') { refreshHistory(); }
    }

    async function init() {
      document.getElementById('ingestUrlDisplay').innerText = window.location.origin + '/api/ingest';
      try {
        const res = await fetch('/api/templates');
        const data = await res.json();
        const sel = document.getElementById('templateSelect');
        sel.innerHTML = '';
        data.templates.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t;
          opt.innerText = t;
          sel.appendChild(opt);
        });
        if (data.templates.length > 0) {
          loadTemplate(data.templates[0]);
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
      }
    }

    async function loadTemplate(name) {
      if (!name) return;
      try {
        const res = await fetch('/api/templates/' + encodeURIComponent(name));
        const payload = await res.json();
        templatesData[name] = payload;
        document.getElementById('payloadEditor').value = JSON.stringify(payload, null, 2);
        updateLiveSignature();
      } catch (err) {
        console.error('Failed to load template payload:', err);
      }
    }

    function resetTemplate() {
      const cur = document.getElementById('templateSelect').value;
      if (cur) loadTemplate(cur);
    }

    function useLocalIngest() {
      document.getElementById('targetUrl').value = '/api/ingest';
    }

    function formatPayload() {
      const ed = document.getElementById('payloadEditor');
      try {
        const parsed = JSON.parse(ed.value);
        ed.value = JSON.stringify(parsed, null, 2);
        updateLiveSignature();
      } catch (err) {
        alert('Invalid JSON: ' + err.message);
      }
    }

    async function updateLiveSignature() {
      const payload = document.getElementById('payloadEditor').value;
      const secret = document.getElementById('secretKey').value;
      if (!secret || !payload) {
        document.getElementById('liveSignature').innerText = 'Enter payload and secret key to generate signature';
        return;
      }
      try {
        const res = await fetch('/api/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload, secretKey: secret })
        });
        const data = await res.json();
        document.getElementById('liveSignature').innerText = data.signature || 'Error generating';
      } catch (err) {
        document.getElementById('liveSignature').innerText = 'Signature calculation error';
      }
    }

    function copySignature() {
      const sig = document.getElementById('liveSignature').innerText;
      navigator.clipboard.writeText(sig).then(() => alert('Copied x-paystack-signature header to clipboard!'));
    }

    async function dispatchWebhookEvent() {
      const btn = document.getElementById('btnDispatch');
      btn.disabled = true;
      btn.innerText = 'Dispatching...';

      const targetUrl = document.getElementById('targetUrl').value;
      const secretKey = document.getElementById('secretKey').value;
      const payload = document.getElementById('payloadEditor').value;

      try {
        const res = await fetch('/api/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUrl, secretKey, payload })
        });
        const result = await res.json();
        renderDispatchResult(result);
      } catch (err) {
        renderDispatchResult({
          statusCode: 0,
          statusText: 'Client Error',
          latencyMs: 0,
          responseBody: err.message,
          headersSent: {}
        });
      } finally {
        btn.disabled = false;
        btn.innerText = '🚀 Dispatch Webhook';
      }
    }

    function renderDispatchResult(result) {
      let statusClass = 'status-err';
      if (result.statusCode >= 200 && result.statusCode < 300) statusClass = 'status-2xx';
      else if (result.statusCode >= 400 && result.statusCode < 500) statusClass = 'status-4xx';
      else if (result.statusCode >= 500) statusClass = 'status-5xx';

      document.getElementById('resultMeta').innerText = result.latencyMs + ' ms latency';
      document.getElementById('resultContent').innerHTML = \`
        <div style="margin-bottom: 0.75rem;">
          <span class="status-pill \${statusClass}">\${result.statusCode || 'ERR'} \${result.statusText}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Headers Sent:</div>
        <pre class="signature-box" style="margin-bottom: 0.75rem;">\${JSON.stringify(result.headersSent, null, 2)}</pre>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">Response Body:</div>
        <pre class="signature-box" style="max-height: 200px; overflow-y: auto;">\${escapeHtml(result.responseBody)}</pre>
      \`;
    }

    async function refreshHistory() {
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        const feed = document.getElementById('feedList');
        if (!data.history || data.history.length === 0) {
          feed.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No webhooks received yet.</div>';
          return;
        }
        feed.innerHTML = data.history.map(item => \`
          <div class="history-item">
            <div class="history-meta">
              <span><strong>\${item.payload?.event || 'custom.event'}</strong> &bull; \${item.timestamp}</span>
              <span class="badge" style="\${item.isValidSignature ? '' : 'background: rgba(239, 68, 68, 0.15); color: var(--accent-red); border-color: rgba(239, 68, 68, 0.3);'}">
                \${item.isValidSignature ? '✓ Valid Signature' : (item.signature ? '✗ Invalid Signature' : 'No Signature')}
              </span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom: 0.3rem;">
              x-paystack-signature: <code style="color:var(--paystack-cyan)">\${item.signature || 'none'}</code>
            </div>
            <pre class="signature-box" style="max-height: 120px; overflow-y:auto;">\${escapeHtml(item.rawBody || JSON.stringify(item.payload, null, 2))}</pre>
          </div>
        \`).join('');
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    }

    async function clearHistory() {
      await fetch('/api/history', { method: 'DELETE' });
      refreshHistory();
    }

    async function verifyStandaloneSignature() {
      const secretKey = document.getElementById('vSecret').value;
      const payload = document.getElementById('vPayload').value;
      const signature = document.getElementById('vSignature').value;
      const resEl = document.getElementById('vResult');

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey, payload, signature })
      });
      const data = await res.json();
      resEl.style.display = 'block';
      if (data.valid) {
        resEl.style.background = 'rgba(16, 185, 129, 0.15)';
        resEl.style.color = 'var(--accent-green)';
        resEl.innerHTML = '✓ Signature is VALID. Matches HMAC-SHA512 calculation.';
      } else {
        resEl.style.background = 'rgba(239, 68, 68, 0.15)';
        resEl.style.color = 'var(--accent-red)';
        resEl.innerHTML = '✗ Signature is INVALID or payload has been modified.';
      }
    }

    async function generateStandaloneSignature() {
      const secretKey = document.getElementById('vSecret').value;
      const payload = document.getElementById('vPayload').value;
      const sigInput = document.getElementById('vSignature');
      const res = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey, payload })
      });
      const data = await res.json();
      sigInput.value = data.signature;
      verifyStandaloneSignature();
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    window.onload = init;
  </script>
</body>
</html>`;
}
