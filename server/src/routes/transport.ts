import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { demoTransportUpdates } from '../data/demoData';

const router = Router();
router.use(authenticate);

router.get('/', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, demoTransportUpdates, 'Transport updates retrieved');
});

router.post('/plan', (req: AuthRequest, res: Response) => {
  const { from, to, mode, accessibility, arrivalTime } = req.body;

  const plan = {
    from: from || 'Stadium - Gate A',
    to: to || 'City Centre Hotel District',
    recommendedMode: mode || 'metro',
    estimatedDuration: '28 minutes',
    walkingDistance: '350m',
    carbonSaving: '2.4kg CO₂ vs taxi',
    steps: [
      { step: 1, type: 'walk', instruction: 'Walk to Public Transport Hub (350m, ~4 min)', distance: '350m', duration: '4 min' },
      { step: 2, type: 'metro', instruction: 'Take Metro Line 1 (Stadium Express) from Platform 3', duration: '18 min', nextDeparture: '19:12' },
      { step: 3, type: 'walk', instruction: 'Walk to your destination from City Centre Station', distance: '400m', duration: '5 min' },
    ],
    possibleDelays: 'Metro Line 2 currently delayed 15 min — avoid Line 2.',
    sustainableAlternative: 'Metro Line 1 is the most eco-friendly option. Reduces carbon by 2.4kg vs taxi.',
    accessibleAlternative: accessibility
      ? 'Accessible shuttle bus departs from Bay 7 every 20 minutes. Level boarding available.'
      : undefined,
    arrivalTime: arrivalTime || '19:40',
    isDemoData: true,
  };

  sendSuccess(res, plan, 'Travel plan generated [DEMO DATA]');
});

export default router;
