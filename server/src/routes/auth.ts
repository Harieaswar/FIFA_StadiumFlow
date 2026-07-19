import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';
import { demoUsers, addAuditLog } from '../data/demoData';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captchaAnswer: z.number().optional(),
  captchaExpected: z.number().optional(),
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

// Track failed login attempts (in-memory for demo)
const failedAttempts = new Map<string, { count: number; lockedUntil?: number }>();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid request data', 400, parsed.error.errors);
    }

    const { email } = parsed.data;

    // Check account lockout (skip in demo mode)
    const attempts = failedAttempts.get(email);
    if (process.env.DEMO_MODE !== 'true' && attempts?.lockedUntil && Date.now() < attempts.lockedUntil) {
      const waitMin = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      return sendError(res, `Account temporarily locked. Please wait ${waitMin} minute(s).`, 429);
    }

    if (process.env.DEMO_MODE === 'true') {
      const user = demoUsers.find(u => u.email === email);
      // Generic error - don't reveal if email exists
      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }
      // Demo mode: any password works
      failedAttempts.delete(email);
      addAuditLog({ action: 'USER_LOGIN', performedBy: user.uid, details: { email, mode: 'demo' } });
      return sendSuccess(res, { token: user.uid, user: { uid: user.uid, email: user.email, role: user.role, displayName: user.displayName } }, 'Login successful');
    }

    // Track failed attempt
    const current = failedAttempts.get(email) || { count: 0 };
    current.count++;
    if (current.count >= 5) {
      current.lockedUntil = Date.now() + 15 * 60 * 1000;
    }
    failedAttempts.set(email, current);
    return sendError(res, 'Invalid email or password', 401);
  } catch {
    return sendError(res, 'Authentication failed', 500);
  }
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Validation failed', 400, parsed.error.errors);
    }

    if (process.env.DEMO_MODE === 'true') {
      const { email, displayName, role } = parsed.data;
      const exists = demoUsers.find(u => u.email === email);
      if (exists) {
        // Generic error
        return sendError(res, 'Unable to create account. Please try again.', 400);
      }
      const newUser = {
        uid: `demo-${role}-${Date.now()}`,
        email,
        role: role as 'fan' | 'volunteer' | 'staff' | 'admin',
        displayName,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };
      demoUsers.push(newUser);
      addAuditLog({ action: 'USER_SIGNUP', performedBy: newUser.uid, details: { email, role } });
      return sendSuccess(res, { token: newUser.uid, user: newUser }, 'Account created successfully', 201);
    }

    return sendError(res, 'Firebase Auth required for live signup', 503);
  } catch {
    return sendError(res, 'Signup failed', 500);
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    addAuditLog({ action: 'USER_LOGOUT', performedBy: token, details: {} });
  }
  sendSuccess(res, null, 'Logged out successfully');
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !z.string().email().safeParse(email).success) {
    return sendError(res, 'Valid email required', 400);
  }
  // Always return success to avoid email enumeration
  return sendSuccess(res, null, 'If an account exists with this email, a reset link has been sent.');
});

// POST /api/auth/verify-token
router.post('/verify-token', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return sendError(res, 'Token required', 400);

  if (process.env.DEMO_MODE === 'true') {
    const user = demoUsers.find(u => u.uid === token);
    if (!user) return sendError(res, 'Invalid token', 401);
    return sendSuccess(res, { user: { uid: user.uid, email: user.email, role: user.role, displayName: user.displayName } }, 'Token valid');
  }
  return sendError(res, 'Token verification requires Firebase', 503);
});

export default router;
