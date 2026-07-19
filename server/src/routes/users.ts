import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { demoUsers, addAuditLog } from '../data/demoData';

const router = Router();
router.use(authenticate);

// GET /api/users/me
router.get('/me', (req: AuthRequest, res: Response) => {
  sendSuccess(res, req.user, 'User profile retrieved');
});

// GET /api/users — Admin only
router.get('/', authorize('admin'), (_req: AuthRequest, res: Response) => {
  const users = demoUsers.map(u => ({ uid: u.uid, email: u.email, role: u.role, displayName: u.displayName, emailVerified: u.emailVerified, createdAt: u.createdAt }));
  sendSuccess(res, users, 'Users retrieved');
});

// PUT /api/users/:uid/role — Admin only
router.put('/:uid/role', authorize('admin'), (req: AuthRequest, res: Response) => {
  const uid = req.params.uid as string;
  const { role } = req.body;
  if (!['fan', 'volunteer', 'staff', 'admin'].includes(role)) {
    return sendError(res, 'Invalid role', 400);
  }
  const user = demoUsers.find(u => u.uid === uid);
  if (!user) return sendError(res, 'User not found', 404);
  user.role = role;
  addAuditLog({ action: 'ROLE_UPDATED', performedBy: req.user!.uid, targetId: uid, details: { newRole: role } });
  sendSuccess(res, user, 'Role updated');
});

// DELETE /api/users/:uid — Admin only
router.delete('/:uid', authorize('admin'), (req: AuthRequest, res: Response) => {
  const uid = req.params.uid as string;
  const idx = demoUsers.findIndex(u => u.uid === uid);
  if (idx === -1) return sendError(res, 'User not found', 404);
  addAuditLog({ action: 'USER_DELETED', performedBy: req.user!.uid, targetId: uid, details: {} });
  demoUsers.splice(idx, 1);
  sendSuccess(res, null, 'User deleted');
});

export default router;
