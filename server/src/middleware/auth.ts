import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { demoUsers } from '../data/demoData';

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

    if (process.env.DEMO_MODE === 'true') {
      // In demo mode, token IS the demo user uid
      const demoUser = demoUsers.find(u => u.uid === token || u.email === token);
      if (!demoUser) {
        return res.status(401).json({ success: false, message: 'Invalid demo token' });
      }
      req.user = { uid: demoUser.uid, email: demoUser.email, role: demoUser.role, displayName: demoUser.displayName };
      return next();
    }

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
