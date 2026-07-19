import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { demoNotifications, markNotificationRead, addNotification } from '../data/demoData';

const router = Router();
router.use(authenticate);

router.get('/', (req: AuthRequest, res: Response) => {
  const { category, unread } = req.query;
  let filtered = demoNotifications.filter(n => n.userId === req.user?.uid || n.userId === 'all');
  if (category) filtered = filtered.filter(n => n.category === category);
  if (unread === 'true') filtered = filtered.filter(n => !n.read);
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  sendSuccess(res, { notifications: filtered, unreadCount: filtered.filter(n => !n.read).length }, 'Notifications retrieved');
});

router.put('/:id/read', (req: AuthRequest, res: Response) => {
  markNotificationRead(req.params.id as string);
  sendSuccess(res, null, 'Marked as read');
});

router.put('/read-all', (req: AuthRequest, res: Response) => {
  demoNotifications.filter(n => n.userId === req.user?.uid).forEach(n => { n.read = true; });
  sendSuccess(res, null, 'All marked as read');
});

router.delete('/:id', (req: AuthRequest, res: Response) => {
  const idx = demoNotifications.findIndex(n => n.id === (req.params.id as string) && n.userId === req.user?.uid);
  if (idx !== -1) demoNotifications.splice(idx, 1);
  sendSuccess(res, null, 'Notification deleted');
});

router.post('/test', (req: AuthRequest, res: Response) => {
  addNotification({ id: uuidv4(), userId: req.user!.uid, title: 'Test Notification', message: 'This is a test notification.', category: 'general', read: false, createdAt: new Date().toISOString() });
  sendSuccess(res, null, 'Test notification created');
});

export default router;
