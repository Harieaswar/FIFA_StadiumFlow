import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { demoAuditLogs } from '../data/demoData';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', (req: AuthRequest, res: Response) => {
  const { action, page = '1', limit = '50' } = req.query;
  let logs = [...demoAuditLogs].reverse();
  if (action) logs = logs.filter(l => l.action === action);
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const paginated = logs.slice((pageNum - 1) * limitNum, pageNum * limitNum);
  sendSuccess(res, { logs: paginated, total: logs.length, page: pageNum, limit: limitNum }, 'Audit logs retrieved');
});

export default router;
