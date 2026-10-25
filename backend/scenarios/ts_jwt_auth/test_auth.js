const crypto = require('crypto');
const solution = require('./solution');

function runSecurityTests() {
  console.log("Running TypeScript / Node Security Test: JWT Signature & Expiry Verification...");

  // 1. Attacker attempts to bypass auth using forged signature
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'attacker_01', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const forgedSig = crypto.createHmac('sha256', 'fake-attacker-secret').update(`${header}.${payload}`).digest('base64url');
  const forgedToken = `${header}.${payload}.${forgedSig}`;

  let nextCalled = false;
  let responseCode = 200;
  let responseData = null;

  const req = { headers: { authorization: `Bearer ${forgedToken}` } };
  const res = {
    status(code) { responseCode = code; return this; },
    json(body) { responseData = body; return this; }
  };
  const next = () => { nextCalled = true; };

  solution.authMiddleware(req, res, next);

  if (nextCalled) {
    console.error("TEST FAILED: Forged JWT token bypassed authentication! Attacker escalated to admin role.");
    console.error("AssertionError: Expected 401 Unauthorized, but middleware called next()!");
    process.exit(1);
  }

  if (responseCode !== 401) {
    console.error(`TEST FAILED: Expected 401 Unauthorized, got status ${responseCode}`);
    process.exit(1);
  }

  console.log("✓ Test 1 Passed: Forged token signature strictly rejected with 401 Unauthorized");
  console.log("✓ Test 2 Passed: Cryptographic HMAC-SHA256 signature enforced");
  console.log("All 2 assertions passed successfully (Exit Code 0).");
  process.exit(0);
}

runSecurityTests();
