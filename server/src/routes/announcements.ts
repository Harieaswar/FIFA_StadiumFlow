import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { demoAnnouncements, addAnnouncement, updateAnnouncement, addAuditLog } from '../data/demoData';

const router = Router();
router.use(authenticate);

router.get('/', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, demoAnnouncements, 'Announcements retrieved');
});

router.post('/', authorize('staff', 'admin'), (req: AuthRequest, res: Response) => {
  const schema = z.object({
    purpose: z.string().min(3),
    location: z.string().min(2),
    tone: z.enum(['calm', 'urgent', 'informational', 'warning']),
    urgency: z.enum(['low', 'medium', 'high']),
    languages: z.array(z.string()).min(1),
    englishText: z.string().min(10),
    translations: z.record(z.string()).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.errors);

  const announcement = {
    id: uuidv4(),
    ...parsed.data,
    translations: parsed.data.translations || {},
    displayBoardVersion: parsed.data.englishText.slice(0, 80).toUpperCase(),
    audioVersion: `Attention. ${parsed.data.englishText}`,
    plainLanguageVersion: parsed.data.englishText,
    status: 'pending_review' as const,
    createdBy: req.user!.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addAnnouncement(announcement);
  addAuditLog({ action: 'ANNOUNCEMENT_CREATED', performedBy: req.user!.uid, targetId: announcement.id, details: { purpose: announcement.purpose } });
  sendSuccess(res, announcement, 'Announcement created', 201);
});

router.put('/:id/status', authorize('admin'), (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const ann = demoAnnouncements.find(a => a.id === id);
  if (!ann) return sendError(res, 'Announcement not found', 404);
  updateAnnouncement(id, { status, updatedAt: new Date().toISOString() });
  addAuditLog({ action: 'ANNOUNCEMENT_STATUS_CHANGED', performedBy: req.user!.uid, targetId: id, details: { status } });
  sendSuccess(res, { ...ann, status }, 'Status updated');
});

export default router;
