import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { demoCrowdReadings } from '../data/demoData';

const router = Router();
router.use(authenticate);

const aiRecommendations = [
  { id: 'rec-001', action: 'Open an additional entry lane at Gate B', priority: 'high', zone: 'Gate B', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'rec-002', action: 'Redirect Section C visitors through Gate D', priority: 'high', zone: 'Section C', status: 'accepted', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'rec-003', action: 'Send two volunteers to the east concourse', priority: 'medium', zone: 'East Concourse', status: 'pending', createdAt: new Date(Date.now() - 900000).toISOString() },
  { id: 'rec-004', action: 'Delay non-essential cleaning in congested zones', priority: 'low', zone: 'North Concourse', status: 'pending', createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'rec-005', action: 'Display multilingual diversion announcement at Gate A', priority: 'high', zone: 'Gate A', status: 'accepted', createdAt: new Date(Date.now() - 300000).toISOString() },
];

// GET /api/crowd/readings
router.get('/readings', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, demoCrowdReadings, 'Crowd readings retrieved');
});

// GET /api/crowd/heatmap
router.get('/heatmap', (_req: AuthRequest, res: Response) => {
  const heatmapData = demoCrowdReadings.map(r => ({
    zone: r.zone,
    gate: r.gate,
    density: Math.round((r.count / r.capacity) * 100),
    level: r.level,
    count: r.count,
    capacity: r.capacity,
  }));
  sendSuccess(res, heatmapData, 'Heatmap data retrieved');
});

// GET /api/crowd/recommendations
router.get('/recommendations', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, aiRecommendations, 'AI recommendations retrieved');
});

// PUT /api/crowd/recommendations/:id
router.put('/recommendations/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const rec = aiRecommendations.find(r => r.id === id);
  if (!rec) return sendSuccess(res, null, 'Recommendation not found');
  Object.assign(rec, { status, notes, updatedBy: req.user?.uid, updatedAt: new Date().toISOString() });
  sendSuccess(res, rec, 'Recommendation updated');
});

export default router;
