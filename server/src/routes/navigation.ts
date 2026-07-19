import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';

const router = Router();
router.use(authenticate);

// Stadium POI data (mock indoor positioning)
const stadiumPOIs = [
  { id: 'poi-001', type: 'gate', name: 'Gate A', lat: 40.7589, lng: -73.9851, accessible: true, crowdLevel: 'critical' },
  { id: 'poi-002', type: 'gate', name: 'Gate B', lat: 40.7591, lng: -73.9845, accessible: true, crowdLevel: 'moderate' },
  { id: 'poi-003', type: 'gate', name: 'Gate C', lat: 40.7587, lng: -73.9842, accessible: true, crowdLevel: 'low' },
  { id: 'poi-004', type: 'gate', name: 'Gate D', lat: 40.7584, lng: -73.9848, accessible: true, crowdLevel: 'high' },
  { id: 'poi-005', type: 'restroom', name: 'Restroom Block 1', lat: 40.7590, lng: -73.9849, accessible: false },
  { id: 'poi-006', type: 'accessible_restroom', name: 'Accessible Restroom A', lat: 40.7592, lng: -73.9847, accessible: true },
  { id: 'poi-007', type: 'food', name: 'Food Court North', lat: 40.7593, lng: -73.9850, accessible: true },
  { id: 'poi-008', type: 'food', name: 'Food Court South', lat: 40.7586, lng: -73.9845, accessible: true },
  { id: 'poi-009', type: 'first_aid', name: 'First Aid Room 1', lat: 40.7589, lng: -73.9843, accessible: true },
  { id: 'poi-010', type: 'first_aid', name: 'First Aid Room 2', lat: 40.7591, lng: -73.9852, accessible: true },
  { id: 'poi-011', type: 'security', name: 'Security Desk A', lat: 40.7588, lng: -73.9851, accessible: true },
  { id: 'poi-012', type: 'lost_found', name: 'Lost & Found Centre', lat: 40.7590, lng: -73.9846, accessible: true },
  { id: 'poi-013', type: 'merchandise', name: 'Official Merchandise Shop', lat: 40.7585, lng: -73.9843, accessible: true },
  { id: 'poi-014', type: 'elevator', name: 'Elevator Block E1', lat: 40.7592, lng: -73.9850, accessible: true },
  { id: 'poi-015', type: 'ramp', name: 'Accessible Ramp R1', lat: 40.7587, lng: -73.9847, accessible: true },
  { id: 'poi-016', type: 'quiet_room', name: 'Prayer & Quiet Room', lat: 40.7591, lng: -73.9844, accessible: true },
  { id: 'poi-017', type: 'transport', name: 'Public Transport Hub', lat: 40.7583, lng: -73.9850, accessible: true },
  { id: 'poi-018', type: 'emergency_exit', name: 'Emergency Exit E1', lat: 40.7594, lng: -73.9851, accessible: true },
  { id: 'poi-019', type: 'emergency_exit', name: 'Emergency Exit E2', lat: 40.7582, lng: -73.9844, accessible: true },
  { id: 'poi-020', type: 'water', name: 'Water Station W1', lat: 40.7589, lng: -73.9848, accessible: true },
];

router.get('/pois', (_req: AuthRequest, res: Response) => {
  sendSuccess(res, stadiumPOIs, 'POIs retrieved [DEMO DATA]');
});

router.post('/route', (req: AuthRequest, res: Response) => {
  const { from, to, accessibility, preference } = req.body;

  const mockRoute = {
    from: from || 'Gate A',
    to: to || 'Section B, Row 12',
    distance: '320m',
    estimatedTime: '4 minutes',
    accessibilityMode: accessibility || 'standard',
    preference: preference || 'shortest',
    steps: [
      { step: 1, instruction: 'Enter through Gate A and proceed straight ahead', distance: '50m' },
      { step: 2, instruction: 'Turn left at the main concourse', distance: '80m' },
      { step: 3, instruction: 'Continue past Food Court North on your right', distance: '100m' },
      { step: 4, instruction: 'Take the elevator or stairs up to Level 2', distance: '20m' },
      { step: 5, instruction: 'Turn right and proceed to Section B', distance: '70m' },
    ],
    crowdLevelAlongRoute: 'moderate',
    alternativeRoutes: [
      { label: 'Via Gate B (less crowded)', extraDistance: '80m', extraTime: '1 minute' },
    ],
    isDemoData: true,
  };

  sendSuccess(res, mockRoute, 'Route calculated [DEMO DATA]');
});

export default router;
