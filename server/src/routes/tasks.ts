import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { demoTasks, addTask, updateTask, addAuditLog } from '../data/demoData';

const router = Router();
router.use(authenticate);

const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(1000),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  zone: z.string().min(2),
  deadline: z.string().datetime(),
  estimatedDuration: z.number().min(1),
  assignedTo: z.string().optional(),
});

router.get('/', (req: AuthRequest, res: Response) => {
  // Fans don't have tasks — return empty
  if (req.user?.role === 'fan') {
    return sendSuccess(res, [], 'Tasks retrieved');
  }
  let filtered = [...demoTasks];
  if (req.user?.role === 'volunteer') {
    filtered = filtered.filter(t => t.assignedTo === req.user?.uid || !t.assignedTo);
  }
  if (req.user?.role === 'staff') {
    filtered = filtered.filter(t => t.assignedTo === req.user?.uid || t.zone.includes(req.user?.uid || ''));
  }
  sendSuccess(res, filtered, 'Tasks retrieved');
});

router.post('/', authorize('staff', 'admin'), (req: AuthRequest, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.errors);

  const task = {
    id: uuidv4(),
    ...parsed.data,
    status: 'not_started' as const,
    createdBy: req.user!.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  addTask(task);
  addAuditLog({ action: 'TASK_CREATED', performedBy: req.user!.uid, targetId: task.id, details: { title: task.title } });
  sendSuccess(res, task, 'Task created', 201);
});

router.put('/:id', authorize('volunteer', 'staff', 'admin'), (req: AuthRequest, res: Response) => {
  const task = demoTasks.find(t => t.id === req.params.id);
  if (!task) return sendError(res, 'Task not found', 404);

  const { status, assignedTo, description } = req.body;
  updateTask(req.params.id as string, {
    ...(status && { status }),
    ...(assignedTo && { assignedTo }),
    ...(description && { description }),
    updatedAt: new Date().toISOString(),
  });
  addAuditLog({ action: 'TASK_UPDATED', performedBy: req.user!.uid, targetId: req.params.id as string, details: { status } });
  sendSuccess(res, { ...task, status, assignedTo }, 'Task updated');
});

router.delete('/:id', authorize('admin'), (req: AuthRequest, res: Response) => {
  const idx = demoTasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return sendError(res, 'Task not found', 404);
  demoTasks.splice(idx, 1);
  addAuditLog({ action: 'TASK_DELETED', performedBy: req.user!.uid, targetId: req.params.id as string, details: {} });
  sendSuccess(res, null, 'Task deleted');
});

export default router;
