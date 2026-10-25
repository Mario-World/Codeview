// AI-Generated Express / TypeScript Auth Middleware
export function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
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

  // DEFECT: Decodes JWT payload directly without checking HMAC signature or expiry
  const payload = decodeJwt(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  req.user = payload;
  next();
}
