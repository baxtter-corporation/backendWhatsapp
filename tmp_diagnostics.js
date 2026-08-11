const http = require('http');
const https = require('https');
const { URL } = require('url');

function request({ method, url, headers, body }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      method,
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      headers,
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  const base = 'http://127.0.0.1:8080';
  const headers = { apikey: 'advanceSec2025', 'Content-Type': 'application/json' };

  try {
    const state = await request({ method: 'GET', url: `${base}/instance/connectionState/Advance-Security`, headers });
    console.log('connectionState', state.statusCode, state.body);

    const connect = await request({ method: 'GET', url: `${base}/instance/connect/Advance-Security`, headers });
    console.log('connect', connect.statusCode, connect.body);

    const send = await request({
      method: 'POST',
      url: `${base}/message/sendText/Advance-Security`,
      headers,
      body: JSON.stringify({ number: '5511999999999@s.whatsapp.net', text: 'Hello' }),
    });
    console.log('sendText', send.statusCode, send.body);
  } catch (err) {
    console.error('ERR', err);
  }
})();