import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/response';
import { addAuditLog } from '../data/demoData';
import rateLimit from 'express-rate-limit';

const router = Router();

// ─── JWT helpers ──────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = '8h';

export interface DemoTokenPayload {
  uid: string;
  email: string;
  role: 'fan' | 'volunteer' | 'staff' | 'admin';
  displayName: string;
  isDemo: true;
}

/** Sign a demo JWT — never includes a raw uid that maps to in-memory state */
export function signDemoToken(payload: Omit<DemoTokenPayload, 'isDemo'>): string {
  return jwt.sign({ ...payload, isDemo: true }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'stadiumflow-demo',
  });
}

/** Verify and decode any JWT we issued — returns null on failure */
export function verifyToken(token: string): DemoTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'stadiumflow-demo',
    }) as DemoTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

// ─── Static demo user definitions (stateless — no DB or memory needed) ────────

type DemoRole = 'fan' | 'volunteer' | 'staff' | 'admin';

const DEMO_USERS: Record<DemoRole, { uid: string; displayName: string; email: string }> = {
  fan:       { uid: 'demo-fan',       displayName: 'Demo Fan',           email: 'fan@stadiumflow.demo' },
  volunteer: { uid: 'demo-volunteer', displayName: 'Demo Volunteer',     email: 'volunteer@stadiumflow.demo' },
  staff:     { uid: 'demo-staff',     displayName: 'Demo Staff',         email: 'staff@stadiumflow.demo' },
  admin:     { uid: 'demo-admin',     displayName: 'Demo Administrator', email: 'admin@stadiumflow.demo' },
};

const ALLOWED_ROLES: DemoRole[] = ['fan', 'volunteer', 'staff', 'admin'];

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  displayName: z.string().min(2).max(50),
  role: z.enum(['fan', 'volunteer', 'staff', 'admin']).default('fan'),
});

const demoLoginSchema = z.object({
  role: z.enum(['fan', 'volunteer', 'staff', 'admin']),
});

// ─── Rate limiters ────────────────────────────────────────────────────────────

const demoLoginLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 20,               // generous for demo — 20 clicks per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Too many demo login attempts. Please wait a moment.' },
});

// ─── POST /api/auth/demo-login ────────────────────────────────────────────────
/**
 * Stateless demo login — no database or memory lookup.
 * Role is validated on the backend; the backend constructs the user.
 * Only available when DEMO_MODE=true.
 */
router.post('/demo-login', demoLoginLimiter, (req: Request, res: Response) => {
  if (process.env.DEMO_MODE !== 'true') {
    return sendError(res, 'Demo login is not available in production mode.', 403);
  }

  const parsed = demoLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 'Invalid role. Allowed: fan, volunteer, staff, admin.', 400, parsed.error.errors);
  }

  const { role } = parsed.data;
  const demoUser = DEMO_USERS[role];

  const payload: Omit<DemoTokenPayload, 'isDemo'> = {
    uid: demoUser.uid,
    email: demoUser.email,
    role,
    displayName: demoUser.displayName,
  };

  const token = signDemoToken(payload);

  addAuditLog({
    action: 'DEMO_LOGIN',
    performedBy: demoUser.uid,
    details: { role, mode: 'stateless-jwt' },
  });

  return sendSuccess(res, {
    token,
    user: {
      uid: demoUser.uid,
      email: demoUser.email,
      role,
      displayName: demoUser.displayName,
    },
  }, 'Demo login successful');
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
/**
 * Live email + password login via Firebase.
 * In demo mode returns a clear message directing users to the demo buttons.
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid request data', 400, parsed.error.errors);
    }

    if (process.env.DEMO_MODE === 'true') {
      // Clearly explain why normal login won't work
      return sendError(
        res,
        'Live account login requires Firebase. Use one of the Demo Mode buttons to explore the application.',
        503,
      );
    }

    // Live Firebase auth path (preserved for production)
    const { auth } = await import('../config/firebase');
    if (!auth) {
      return sendError(res, 'Authentication service unavailable', 503);
    }

    // NOTE: Firebase Admin SDK verifies ID tokens from the client, not email+password directly.
    // A real implementation would use the Firebase Client SDK on the frontend to sign in and
    // then send the ID token here for verification. This stub is kept for structural completeness.
    return sendError(res, 'Live login: use the Firebase Client SDK on the frontend to obtain an ID token.', 501);
  } catch {
    return sendError(res, 'Authentication failed', 500);
  }
});

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.errors);
    }

    if (process.env.DEMO_MODE === 'true') {
      return sendError(
        res,
        'Account creation is unavailable in Demo Mode. Use a demo account to explore the application.',
        503,
      );
    }

    // Live Firebase signup path (preserved for production)
    const { auth } = await import('../config/firebase');
    if (!auth) {
      return sendError(res, 'Firebase Auth required for live signup', 503);
    }

    return sendError(res, 'Live signup: implement Firebase Client SDK sign-up on the frontend.', 501);
  } catch {
    return sendError(res, 'Signup failed', 500);
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      addAuditLog({ action: 'USER_LOGOUT', performedBy: decoded.uid, details: {} });
    }
  }
  sendSuccess(res, null, 'Logged out successfully');
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !z.string().email().safeParse(email).success) {
    return sendError(res, 'Valid email required', 400);
  }
  // Always return success to avoid email enumeration
  return sendSuccess(res, null, 'If an account exists with this email, a reset link has been sent.');
});

// ─── POST /api/auth/verify-token ─────────────────────────────────────────────
/**
 * Stateless token verification using JWT.
 * Works across serverless function instances — no shared memory needed.
 */
router.post('/verify-token', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return sendError(res, 'Token required', 400);

  const decoded = verifyToken(token);
  if (!decoded) {
    return sendError(res, 'Invalid or expired token', 401);
  }

  return sendSuccess(res, {
    user: {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      displayName: decoded.displayName,
    },
  }, 'Token valid');
});

export default router;
