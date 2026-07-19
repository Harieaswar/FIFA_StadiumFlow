import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { demoSustainabilityMetrics } from '../data/demoData';

const router = Router();
router.use(authenticate);

router.get('/metrics', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, { metrics: demoSustainabilityMetrics, isDemoData: true }, 'Sustainability metrics retrieved [DEMO DATA]');
});

router.get('/summary', (_req: AuthRequest, res: Response) => {
  const latest = demoSustainabilityMetrics[demoSustainabilityMetrics.length - 1];
  const targets = { energyKwh: 40000, waterLitres: 100000, wasteKg: 6000, recycledKg: 4500, carbonKg: 15000 };

  const recommendations = [
    { id: 'sr-001', message: 'Reduce lighting in unused service areas in Sections E-F', saving: '2,400 kWh', priority: 'high' },
    { id: 'sr-002', message: 'Redirect food surplus to approved collection point at Gate D', saving: '180 kg waste', priority: 'medium' },
    { id: 'sr-003', message: 'Add 3 more reusable cup return stations near Section B', saving: '500 cups', priority: 'medium' },
    { id: 'sr-004', message: 'Push fan notifications encouraging Metro Line 1 usage', saving: '1.2 tons CO₂', priority: 'high' },
  ];

  sendSuccess(res, { latest, targets, recommendations, isDemoData: true }, 'Sustainability summary [DEMO DATA]');
});

export default router;
