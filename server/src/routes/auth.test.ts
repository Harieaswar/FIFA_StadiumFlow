/**
 * Tests for POST /api/auth/demo-login
 *
 * Covers:
 *  - Fan, Volunteer, Staff, Admin demo logins succeed
 *  - Unsupported roles are rejected (400)
 *  - Demo login is rejected when DEMO_MODE is false (403)
 *  - Returned JWT contains the correct role and isDemo flag
 *  - /verify-token accepts a demo JWT and returns the right user
 *  - /verify-token rejects invalid and tampered tokens
 *  - Normal /login shows clear Firebase-unavailable message in demo mode
 *  - /signup shows clear demo-mode-disabled message
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';

const ROLES = ['fan', 'volunteer', 'staff', 'admin'] as const;
type DemoRole = (typeof ROLES)[number];

const EXPECTED: Record<DemoRole, { uid: string; email: string; displayName: string }> = {
  fan:       { uid: 'demo-fan',       email: 'fan@stadiumflow.demo',       displayName: 'Demo Fan'           },
  volunteer: { uid: 'demo-volunteer', email: 'volunteer@stadiumflow.demo', displayName: 'Demo Volunteer'     },
  staff:     { uid: 'demo-staff',     email: 'staff@stadiumflow.demo',     displayName: 'Demo Staff'         },
  admin:     { uid: 'demo-admin',     email: 'admin@stadiumflow.demo',     displayName: 'Demo Administrator' },
};

// Set env before importing the Express app
process.env.DEMO_MODE = 'true';
process.env.JWT_SECRET = 'vitest-test-secret-12345';
process.env.NODE_ENV = 'test';

let app: Express;

beforeAll(async () => {
  // Dynamic import so env vars are set first
  const mod = await import('../app');
  app = mod.default;
});

// ── /api/auth/demo-login ──────────────────────────────────────────────────────

describe('POST /api/auth/demo-login', () => {
  for (const role of ROLES) {
    it(`succeeds and returns signed JWT for role: ${role}`, async () => {
      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({ role })
        .expect(200);

      expect(res.body.success).toBe(true);
      const { token, user } = res.body.data;

      // Token is a three-part JWT
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      // User data matches the fixed demo mapping
      expect(user.uid).toBe(EXPECTED[role].uid);
      expect(user.email).toBe(EXPECTED[role].email);
      expect(user.role).toBe(role);
      expect(user.displayName).toBe(EXPECTED[role].displayName);
    });
  }

  it('JWT payload contains correct role, uid, and isDemo=true flag', async () => {
    const res = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'admin' })
      .expect(200);

    const token: string = res.body.data.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as Record<string, unknown>;

    expect(decoded.role).toBe('admin');
    expect(decoded.uid).toBe('demo-admin');
    expect(decoded.email).toBe('admin@stadiumflow.demo');
    expect(decoded.isDemo).toBe(true);
  });

  it('rejects an unsupported role with 400', async () => {
    const res = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'superuser' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('rejects an empty body with 400', async () => {
    const res = await request(app)
      .post('/api/auth/demo-login')
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('rejects when DEMO_MODE is not "true" with 403', async () => {
    const original = process.env.DEMO_MODE;
    process.env.DEMO_MODE = 'false';

    const res = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'fan' })
      .expect(403);

    expect(res.body.success).toBe(false);
    process.env.DEMO_MODE = original; // restore
  });
});

// ── /api/auth/verify-token ────────────────────────────────────────────────────

describe('POST /api/auth/verify-token', () => {
  it('verifies a valid demo JWT and returns the correct user', async () => {
    const loginRes = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'staff' })
      .expect(200);

    const token: string = loginRes.body.data.token;

    const verifyRes = await request(app)
      .post('/api/auth/verify-token')
      .send({ token })
      .expect(200);

    expect(verifyRes.body.success).toBe(true);
    const { user } = verifyRes.body.data;
    expect(user.uid).toBe('demo-staff');
    expect(user.role).toBe('staff');
    expect(user.email).toBe('staff@stadiumflow.demo');
  });

  it('rejects a random string as token', async () => {
    const res = await request(app)
      .post('/api/auth/verify-token')
      .send({ token: 'not-a-real-token' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('rejects a tampered JWT (signature mismatch)', async () => {
    const loginRes = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'fan' })
      .expect(200);

    const parts = (loginRes.body.data.token as string).split('.');
    // Replace payload with a forged admin claim
    const forgedPayload = Buffer.from(
      JSON.stringify({ uid: 'demo-admin', role: 'admin', isDemo: true, iss: 'stadiumflow-demo' })
    ).toString('base64url');
    const tamperedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`;

    const res = await request(app)
      .post('/api/auth/verify-token')
      .send({ token: tamperedToken })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('rejects a missing token body with 400', async () => {
    const res = await request(app)
      .post('/api/auth/verify-token')
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

// ── /api/auth/login (normal login) in demo mode ───────────────────────────────

describe('POST /api/auth/login (in demo mode)', () => {
  it('returns 503 with a message directing users to demo buttons', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fan@stadiumflow.demo', password: 'anything' })
      .expect(503);

    expect(res.body.success).toBe(false);
    // Message must mention Firebase and Demo Mode
    expect(res.body.message).toMatch(/Firebase/i);
    expect(res.body.message).toMatch(/Demo Mode/i);
  });
});

// ── /api/auth/signup in demo mode ─────────────────────────────────────────────

describe('POST /api/auth/signup (in demo mode)', () => {
  it('returns 503 with a clear demo-mode message', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'newuser@test.com',
        password: 'ValidPass1!XYZ',
        displayName: 'New User',
        role: 'fan',
      })
      .expect(503);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Demo Mode/i);
  });
});
