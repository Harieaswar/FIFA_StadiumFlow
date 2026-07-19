import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { demoCrowdReadings } from '../data/demoData';

const router = Router();
router.use(authenticate);

const stadium = {
  id: 'stadium-001',
  name: 'MetroFlow Arena',
  city: 'New York',
  country: 'USA',
  capacity: 80000,
  currentAttendance: 72400,
  matchToday: {
    home: 'Brazil',
    away: 'Argentina',
    kickoff: '19:00 EDT',
    date: '2026-06-15',
  },
  gates: ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E', 'Gate F'],
  zones: ['North Stand', 'South Stand', 'East Stand', 'West Stand', 'VIP Box', 'Press Box'],
};

router.get('/', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, [stadium], 'Stadiums retrieved');
});

router.get('/current', (_req: AuthRequest, res: Response) => {
  const attendance = demoCrowdReadings.reduce((sum, r) => sum + r.count, 0);
  sendSuccess(res, { ...stadium, currentAttendance: attendance }, 'Current stadium retrieved');
});

router.get('/:id', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, stadium, 'Stadium retrieved');
});

export default router;
