import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { verifyToken } from '../routes/auth';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
    displayName?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authentication token provided' });
    }

    const token = authHeader.split(' ')[1];

    // ── Demo mode: verify our signed JWT (stateless, works across all instances) ──
    if (process.env.DEMO_MODE === 'true') {
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid or expired demo token' });
      }
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role,
        displayName: decoded.displayName,
      };
      return next();
    }

    // ── Live mode: verify Firebase ID token ────────────────────────────────────
    if (!auth) {
      return res.status(503).json({ success: false, message: 'Authentication service unavailable' });
    }

    const decoded = await auth.verifyIdToken(token);
    const userRecord = await auth.getUser(decoded.uid);
    const role = (decoded.role as string) || 'fan';

    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      role,
      displayName: userRecord.displayName,
    };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};
