// Verified Production Patch: Express / TypeScript Auth Middleware
const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || 'prod-master-secret-key-99';

export function verifyJwt(token: string, secret: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;

    // FIX: Verify cryptographic HMAC-SHA256 signature
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      return null; // Tampered or forged signature
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));

    // FIX: Enforce token expiration validation
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null; // Expired token
    }

    return payload;
  } catch {
    return null;
  }
}

export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers && req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];

  // FIX: Enforce cryptographic signature verification and expiration check
  const payload = verifyJwt(token, JWT_SECRET);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token signature or expired' });
  }

  req.user = payload;
  next();
}
