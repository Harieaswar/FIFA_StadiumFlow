import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { demoUsers, demoIncidents, demoTasks, demoCrowdReadings, demoTransportUpdates } from '../data/demoData';

const router = Router();
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/admin/overview — Admin dashboard stats
router.get('/overview', (_req: AuthRequest, res: Response) => {
  const totalAttendance = demoCrowdReadings.reduce((s, r) => s + r.count, 0);
  const activeIncidents = demoIncidents.filter(i => !['resolved', 'closed'].includes(i.status)).length;
  const openTasks = demoTasks.filter(t => t.status !== 'completed').length;
  const criticalZones = demoCrowdReadings.filter(r => r.level === 'critical').length;

  sendSuccess(res, {
    attendance: { current: totalAttendance, capacity: 80000, percentage: Math.round((totalAttendance / 80000) * 100) },
    incidents: { active: activeIncidents, total: demoIncidents.length, critical: demoIncidents.filter(i => i.severity === 'critical').length },
    tasks: { open: openTasks, total: demoTasks.length, inProgress: demoTasks.filter(t => t.status === 'in_progress').length },
    crowd: { criticalZones, readings: demoCrowdReadings },
    transport: { updates: demoTransportUpdates.length, delayed: demoTransportUpdates.filter(t => t.status === 'delayed').length },
    staff: { total: demoUsers.filter(u => u.role === 'staff').length, volunteers: demoUsers.filter(u => u.role === 'volunteer').length },
  }, 'Admin overview retrieved');
});

export default router;
