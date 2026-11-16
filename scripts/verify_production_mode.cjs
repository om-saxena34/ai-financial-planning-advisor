/**
 * Production Mode Verification Script
 */
async function testEndpoints() {
  console.log('======================================================');
  console.log('       PRODUCTION MODE END-TO-END VERIFICATION       ');
  console.log('======================================================\n');
  const results = [];

  // ── 1. ML Service /health ─────────────────────────────
  console.log('[1] Checking ML Service /health (http://127.0.0.1:8000/health)...');
  const mlRes = await fetch('http://127.0.0.1:8000/health');
  const mlData = await mlRes.json();
  console.log('    Status Code:', mlRes.status);
  console.log('    Response:', JSON.stringify(mlData));
  const t1 = mlRes.status === 200 && mlData.status === 'healthy' && mlData.models_loaded === true;
  results.push({ name: 'ML Service /health probe (fast, models loaded)', pass: t1, details: mlData });

  // ── 2. Node API Root /health ──────────────────────────
  console.log('\n[2] Checking Node API Root /health (http://127.0.0.1:5000/health)...');
  const nodeRootRes = await fetch('http://127.0.0.1:5000/health');
  const nodeRootData = await nodeRootRes.json();
  console.log('    Status Code:', nodeRootRes.status);
  console.log('    Response:', JSON.stringify(nodeRootData));
  const t2a = nodeRootRes.status === 200 && nodeRootData.status === 'healthy';

  console.log('\n[3] Checking Node API /api/v1/health (http://127.0.0.1:5000/api/v1/health)...');
  const nodeV1Res = await fetch('http://127.0.0.1:5000/api/v1/health');
  const nodeV1Data = await nodeV1Res.json();
  console.log('    Status Code:', nodeV1Res.status);
  console.log('    Response:', JSON.stringify(nodeV1Data));
  const t2b = nodeV1Res.status === 200 && nodeV1Data.status === 'healthy';
  results.push({ name: 'Node API /health and /api/v1/health probes', pass: t2a && t2b, details: { root: nodeRootData, v1: nodeV1Data } });

  // ── 3. Register & Login + Cookie Check ────────────────
  console.log('\n[4] Testing Login & Production Cookie attributes (http://127.0.0.1:5000/api/v1/auth/login)...');
  const loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'saver.demo@finwise.com',
      password: 'Password@123',
    }),
  });
  const loginData = await loginRes.json();
  const setCookie = loginRes.headers.get('set-cookie') || '';
  console.log('    Login Status Code:', loginRes.status);
  console.log('    User returned:', loginData.data?.user?.email, `(Role: ${loginData.data?.user?.role || 'user'})`);
  console.log('    Set-Cookie Header:', setCookie);

  const hasSecure = /Secure/i.test(setCookie);
  const hasHttpOnly = /HttpOnly/i.test(setCookie);
  const hasSameSiteNone = /SameSite=None/i.test(setCookie);
  console.log(`    Cookie Flags: Secure=${hasSecure}, HttpOnly=${hasHttpOnly}, SameSite=None=${hasSameSiteNone}`);
  const t3 = loginRes.status === 200 && hasSecure && hasHttpOnly && hasSameSiteNone;
  results.push({
    name: 'Auth login sets production-grade cookies (Secure, HttpOnly, SameSite=None)',
    pass: t3,
    details: { hasSecure, hasHttpOnly, hasSameSiteNone, setCookie: setCookie.slice(0, 70) + '...' },
  });

  const accessToken = loginData.data?.accessToken;

  // ── 4. Live ML Classification ─────────────────────────
  console.log('\n[5] Testing Live ML Classification via Node API (http://127.0.0.1:5000/api/v1/predictions/classify)...');
  const liveRes = await fetch('http://127.0.0.1:5000/api/v1/predictions/classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });
  const liveData = await liveRes.json();
  const livePred = liveData.data;
  console.log('    Status Code:', liveRes.status);
  console.log('    Predicted Class:', livePred?.predicted_class);
  console.log('    is_fallback:', livePred?.is_fallback);
  console.log('    Source:', livePred?.source);
  console.log('    Latency (ms):', livePred?.latency_ms);
  const t4 = liveRes.status === 200 && livePred?.is_fallback === false && livePred?.source === 'ml_service';
  results.push({ name: 'Live ML Inference via Node API (source: ml_service, is_fallback: false)', pass: t4, details: livePred });

  console.log('\n======================================================');
  console.log('                    SUMMARY                           ');
  console.log('======================================================');
  results.forEach((r, idx) => {
    console.log(`${r.pass ? '✅ PASS' : '❌ FAIL'} [${idx + 1}] ${r.name}`);
  });
  console.log('======================================================');

  if (!results.every((r) => r.pass)) {
    process.exit(1);
  }
}

testEndpoints().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
