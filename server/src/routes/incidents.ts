import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { demoIncidents, addIncident, updateIncident, addNotification, addAuditLog } from '../data/demoData';

const router = Router();
router.use(authenticate);

const createIncidentSchema = z.object({
  type: z.enum(['medical_emergency', 'fire_smoke', 'missing_person', 'security_threat', 'crowd_crush_risk', 'lost_child', 'accessibility_assistance', 'other']),
  location: z.string().min(2).max(200),
  description: z.string().min(5).max(1000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  immediateAssistanceNeeded: z.boolean().default(false),
});

// GET /api/incidents
router.get('/', (req: AuthRequest, res: Response) => {
  const { status, severity, page = '1', limit = '20' } = req.query;
  let filtered = [...demoIncidents];

  if (req.user?.role === 'fan') {
    filtered = filtered.filter(i => i.reportedBy === req.user?.uid);
  }
  if (status) filtered = filtered.filter(i => i.status === status);
  if (severity) filtered = filtered.filter(i => i.severity === severity);

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const start = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(start, start + limitNum);

  sendSuccess(res, { incidents: paginated, total: filtered.length, page: pageNum, limit: limitNum }, 'Incidents retrieved');
});

// GET /api/incidents/:id
router.get('/:id', (req: AuthRequest, res: Response) => {
  const incident = demoIncidents.find(i => i.id === req.params.id);
  if (!incident) return sendError(res, 'Incident not found', 404);
  if (req.user?.role === 'fan' && incident.reportedBy !== req.user.uid) {
    return sendError(res, 'Forbidden', 403);
  }
  sendSuccess(res, incident, 'Incident retrieved');
});

// POST /api/incidents
router.post('/', async (req: AuthRequest, res: Response) => {
  const parsed = createIncidentSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.errors);

  const reportNumber = `INC-2026-${String(demoIncidents.length + 1).padStart(4, '0')}`;
  const incident = {
    id: uuidv4(),
    ...parsed.data,
    reportNumber,
    reportedBy: req.user!.uid,
    status: 'submitted' as const,
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addIncident(incident);

  // Notify admins
  addNotification({
    id: uuidv4(),
    userId: 'demo-admin-001',
    title: `🚨 New Incident: ${incident.type.replace(/_/g, ' ')}`,
    message: `${incident.severity.toUpperCase()} incident reported at ${incident.location}. Report #${reportNumber}`,
    category: 'incident',
    read: false,
    createdAt: new Date().toISOString(),
  });

  addAuditLog({ action: 'INCIDENT_CREATED', performedBy: req.user!.uid, targetId: incident.id, details: { type: incident.type, severity: incident.severity } });

  sendSuccess(res, incident, 'Incident reported successfully', 201);
});

// PUT /api/incidents/:id
router.put('/:id', authorize('staff', 'admin'), (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const incident = demoIncidents.find(i => i.id === id);
  if (!incident) return sendError(res, 'Incident not found', 404);

  const { status, assignedTo, note } = req.body;
  const updates: Partial<typeof incident> = { updatedAt: new Date().toISOString() };

  if (status) updates.status = status;
  if (assignedTo) updates.assignedTo = assignedTo;
  if (note) updates.notes = [...incident.notes, `[${new Date().toLocaleTimeString()}] ${note}`];

  updateIncident(id, updates);
  addAuditLog({ action: 'INCIDENT_UPDATED', performedBy: req.user!.uid, targetId: id, details: { status, assignedTo } });

  sendSuccess(res, { ...incident, ...updates }, 'Incident updated');
});

export default router;
