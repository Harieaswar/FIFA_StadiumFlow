// ─── Demo Data Store ───────────────────────────────────────────────────────
// All in-memory data used in DEMO_MODE. Structured to mirror Firestore.

import { v4 as uuidv4 } from 'uuid';

export interface DemoUser {
  uid: string;
  email: string;
  role: 'fan' | 'volunteer' | 'staff' | 'admin';
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Incident {
  id: string;
  type: string;
  location: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'acknowledged' | 'staff_assigned' | 'in_progress' | 'resolved' | 'closed';
  reportNumber: string;
  reportedBy: string;
  assignedTo?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'assigned' | 'in_progress' | 'blocked' | 'completed';
  assignedTo?: string;
  zone: string;
  deadline: string;
  estimatedDuration: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'crowd' | 'transport' | 'emergency' | 'task' | 'incident' | 'sustainability' | 'general';
  read: boolean;
  createdAt: string;
}

export interface CrowdReading {
  id: string;
  gate: string;
  zone: string;
  count: number;
  capacity: number;
  level: 'low' | 'moderate' | 'high' | 'critical';
  queueMinutes: number;
  timestamp: string;
}

export interface TransportUpdate {
  id: string;
  type: 'metro' | 'shuttle' | 'taxi' | 'parking' | 'walking';
  name: string;
  status: 'on_time' | 'delayed' | 'suspended' | 'available' | 'full';
  details: string;
  nextDeparture?: string;
  delay?: number;
  updatedAt: string;
}

export interface SustainabilityMetric {
  id: string;
  date: string;
  energyKwh: number;
  waterLitres: number;
  wasteKg: number;
  recycledKg: number;
  carbonKg: number;
  publicTransportUsers: number;
  reusableCups: number;
  foodWasteKg: number;
}

export interface Announcement {
  id: string;
  purpose: string;
  location: string;
  tone: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
  englishText: string;
  translations: Record<string, string>;
  displayBoardVersion: string;
  audioVersion: string;
  plainLanguageVersion: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Demo Users ────────────────────────────────────────────────────────────
export const demoUsers: DemoUser[] = [
  {
    uid: 'demo-fan-001',
    email: 'fan@stadiumflow.demo',
    role: 'fan',
    displayName: 'Alex Rivera',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    uid: 'demo-volunteer-001',
    email: 'volunteer@stadiumflow.demo',
    role: 'volunteer',
    displayName: 'Priya Sharma',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    uid: 'demo-staff-001',
    email: 'staff@stadiumflow.demo',
    role: 'staff',
    displayName: 'Carlos Mendez',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    uid: 'demo-admin-001',
    email: 'admin@stadiumflow.demo',
    role: 'admin',
    displayName: 'Sarah Johnson',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// ─── Demo Incidents ────────────────────────────────────────────────────────
export let demoIncidents: Incident[] = [
  {
    id: 'inc-001',
    type: 'medical_emergency',
    location: 'Section B, Row 12',
    description: 'Fan experiencing chest pain, needs immediate medical assistance',
    severity: 'high',
    status: 'in_progress',
    reportNumber: 'INC-2026-0001',
    reportedBy: 'demo-fan-001',
    assignedTo: 'demo-staff-001',
    notes: ['Medical team dispatched at 18:32', 'Patient stabilized'],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'inc-002',
    type: 'lost_child',
    location: 'Gate C Entrance',
    description: 'Child aged 7, wearing red jersey, separated from parents',
    severity: 'high',
    status: 'acknowledged',
    reportNumber: 'INC-2026-0002',
    reportedBy: 'demo-volunteer-001',
    notes: ['Announcement made over PA system'],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'inc-003',
    type: 'crowd_crush_risk',
    location: 'North Concourse',
    description: 'Extremely dense crowd near merchandise stall blocking emergency exit',
    severity: 'critical',
    status: 'submitted',
    reportNumber: 'INC-2026-0003',
    reportedBy: 'demo-staff-001',
    notes: [],
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'inc-004',
    type: 'security_threat',
    location: 'Parking Zone D',
    description: 'Unattended bag reported near vehicle entrance',
    severity: 'medium',
    status: 'resolved',
    reportNumber: 'INC-2026-0004',
    reportedBy: 'demo-staff-001',
    assignedTo: 'demo-admin-001',
    notes: ['Security swept area', 'Bag identified as harmless, owner found'],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ─── Demo Tasks ────────────────────────────────────────────────────────────
export let demoTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Monitor Gate A crowd levels',
    description: 'Observe and report crowd density every 15 minutes. Alert operations if level exceeds 80% capacity.',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'demo-volunteer-001',
    zone: 'Gate A',
    deadline: new Date(Date.now() + 3600000).toISOString(),
    estimatedDuration: 120,
    createdBy: 'demo-admin-001',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'task-002',
    title: 'Assist crowd redirection at Gate 3',
    description: 'Guide visitors toward Gate 4 and communicate estimated waiting time. Work with 2 other volunteers.',
    priority: 'high',
    status: 'assigned',
    assignedTo: 'demo-volunteer-001',
    zone: 'Gate 3',
    deadline: new Date(Date.now() + 1800000).toISOString(),
    estimatedDuration: 20,
    createdBy: 'demo-admin-001',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'task-003',
    title: 'Inspect emergency exits in West Wing',
    description: 'Verify all 8 emergency exits are clear, unlocked, and properly marked.',
    priority: 'medium',
    status: 'not_started',
    zone: 'West Wing',
    deadline: new Date(Date.now() + 7200000).toISOString(),
    estimatedDuration: 45,
    createdBy: 'demo-staff-001',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'task-004',
    title: 'Coordinate post-match shuttle buses',
    description: 'Manage departure of 12 shuttle buses. Ensure accessible vehicles available for wheelchair users.',
    priority: 'high',
    status: 'not_started',
    zone: 'Transport Hub',
    deadline: new Date(Date.now() + 10800000).toISOString(),
    estimatedDuration: 60,
    createdBy: 'demo-admin-001',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
  },
];

// ─── Demo Notifications ────────────────────────────────────────────────────
export let demoNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'demo-fan-001',
    title: '🚨 Gate Change',
    message: 'Your recommended entry gate has changed to Gate B due to congestion at Gate A.',
    category: 'general',
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'notif-002',
    userId: 'demo-fan-001',
    title: '🚌 Transport Alert',
    message: 'Metro Line 2 is experiencing 15-minute delays. Consider taking the shuttle bus instead.',
    category: 'transport',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-003',
    userId: 'demo-volunteer-001',
    title: '📋 New Task Assigned',
    message: 'You have been assigned to assist with crowd redirection at Gate 3.',
    category: 'task',
    read: true,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'notif-004',
    userId: 'demo-admin-001',
    title: '⚠️ Crowd Warning',
    message: 'North Concourse has reached 87% capacity. Diversion recommended.',
    category: 'crowd',
    read: false,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'notif-005',
    userId: 'demo-staff-001',
    title: '🏥 Incident Update',
    message: 'Incident INC-2026-0001 has been updated: Medical team on scene.',
    category: 'incident',
    read: false,
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
];

// ─── Demo Crowd Readings ───────────────────────────────────────────────────
export const demoCrowdReadings: CrowdReading[] = [
  { id: 'cr-001', gate: 'Gate A', zone: 'North Entrance', count: 2850, capacity: 3000, level: 'critical', queueMinutes: 25, timestamp: new Date().toISOString() },
  { id: 'cr-002', gate: 'Gate B', zone: 'South Entrance', count: 1200, capacity: 3000, level: 'moderate', queueMinutes: 8, timestamp: new Date().toISOString() },
  { id: 'cr-003', gate: 'Gate C', zone: 'East Entrance', count: 850, capacity: 2000, level: 'low', queueMinutes: 3, timestamp: new Date().toISOString() },
  { id: 'cr-004', gate: 'Gate D', zone: 'West Entrance', count: 1900, capacity: 2500, level: 'high', queueMinutes: 15, timestamp: new Date().toISOString() },
  { id: 'cr-005', gate: 'Gate E', zone: 'VIP Entrance', count: 420, capacity: 1000, level: 'low', queueMinutes: 2, timestamp: new Date().toISOString() },
  { id: 'cr-006', gate: 'Gate F', zone: 'Press Entrance', count: 180, capacity: 500, level: 'low', queueMinutes: 1, timestamp: new Date().toISOString() },
];

// ─── Demo Transport Updates ────────────────────────────────────────────────
export const demoTransportUpdates: TransportUpdate[] = [
  { id: 'tr-001', type: 'metro', name: 'Metro Line 1 (Stadium Express)', status: 'on_time', details: 'Running every 6 minutes. Platform 3.', nextDeparture: '18:45', updatedAt: new Date().toISOString() },
  { id: 'tr-002', type: 'metro', name: 'Metro Line 2 (City Centre)', status: 'delayed', details: 'Signal fault causing 15-minute delays.', nextDeparture: '18:52', delay: 15, updatedAt: new Date().toISOString() },
  { id: 'tr-003', type: 'shuttle', name: 'Shuttle Bus A (Airport)', status: 'on_time', details: 'Departures every 20 minutes. Bay 4.', nextDeparture: '19:00', updatedAt: new Date().toISOString() },
  { id: 'tr-004', type: 'shuttle', name: 'Shuttle Bus B (City Hotel Zone)', status: 'on_time', details: 'Accessible vehicles available. Bay 7.', nextDeparture: '18:50', updatedAt: new Date().toISOString() },
  { id: 'tr-005', type: 'parking', name: 'Parking Zone A', status: 'full', details: 'No spaces available. Use Zone C.', updatedAt: new Date().toISOString() },
  { id: 'tr-006', type: 'parking', name: 'Parking Zone C', status: 'available', details: '340 spaces remaining. 5-min walk to Gate B.', updatedAt: new Date().toISOString() },
  { id: 'tr-007', type: 'taxi', name: 'Taxi Zone T1', status: 'available', details: 'Average wait: 8 minutes. 45 vehicles queued.', updatedAt: new Date().toISOString() },
];

// ─── Demo Sustainability Metrics ───────────────────────────────────────────
export const demoSustainabilityMetrics: SustainabilityMetric[] = Array.from({ length: 7 }, (_, i) => ({
  id: `sm-${String(i + 1).padStart(3, '0')}`,
  date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
  energyKwh: 45000 + Math.floor(Math.random() * 10000),
  waterLitres: 120000 + Math.floor(Math.random() * 30000),
  wasteKg: 8000 + Math.floor(Math.random() * 2000),
  recycledKg: 4000 + Math.floor(Math.random() * 1500),
  carbonKg: 18000 + Math.floor(Math.random() * 4000),
  publicTransportUsers: 42000 + Math.floor(Math.random() * 8000),
  reusableCups: 12000 + Math.floor(Math.random() * 3000),
  foodWasteKg: 500 + Math.floor(Math.random() * 200),
}));

// ─── Demo Announcements ────────────────────────────────────────────────────
export let demoAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    purpose: 'Gate change notification',
    location: 'All Zones',
    tone: 'calm',
    urgency: 'medium',
    status: 'published',
    englishText: 'Attention all visitors: Due to high congestion at Gate A, please use Gate B or Gate C for entry. Gate B offers a 5-minute wait. We apologise for any inconvenience.',
    translations: {
      hindi: 'सभी आगंतुकों का ध्यान: गेट A पर भीड़ के कारण, कृपया प्रवेश के लिए गेट B या गेट C का उपयोग करें।',
      spanish: 'Atención visitantes: Debido a la congestión en la Puerta A, use la Puerta B o C para ingresar.',
      french: 'Attention à tous les visiteurs: En raison de la forte congestion à la Porte A, veuillez utiliser la Porte B ou C.',
      arabic: 'انتباه جميع الزوار: بسبب الازدحام في البوابة أ، يرجى استخدام البوابة ب أو ج للدخول.',
    },
    displayBoardVersion: 'HIGH CONGESTION AT GATE A → USE GATE B OR C',
    audioVersion: 'Attention visitors. Please use Gate B or Gate C. Gate A is currently congested. Thank you.',
    plainLanguageVersion: 'Gate A is very busy. Please go to Gate B or Gate C instead. Gate B has a short wait.',
    createdBy: 'demo-admin-001',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

// ─── Mutable store helpers ─────────────────────────────────────────────────
export const addIncident = (incident: Incident) => { demoIncidents.push(incident); };
export const updateIncident = (id: string, updates: Partial<Incident>) => {
  const idx = demoIncidents.findIndex(i => i.id === id);
  if (idx !== -1) demoIncidents[idx] = { ...demoIncidents[idx], ...updates };
};

export const addTask = (task: Task) => { demoTasks.push(task); };
export const updateTask = (id: string, updates: Partial<Task>) => {
  const idx = demoTasks.findIndex(t => t.id === id);
  if (idx !== -1) demoTasks[idx] = { ...demoTasks[idx], ...updates };
};

export const addNotification = (notif: Notification) => { demoNotifications.push(notif); };
export const markNotificationRead = (id: string) => {
  const notif = demoNotifications.find(n => n.id === id);
  if (notif) notif.read = true;
};

export const addAnnouncement = (ann: Announcement) => { demoAnnouncements.push(ann); };
export const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
  const idx = demoAnnouncements.findIndex(a => a.id === id);
  if (idx !== -1) demoAnnouncements[idx] = { ...demoAnnouncements[idx], ...updates };
};

// ─── Audit log ─────────────────────────────────────────────────────────────
interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetId?: string;
  details: Record<string, unknown>;
  timestamp: string;
}
export const demoAuditLogs: AuditLog[] = [];
export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  demoAuditLogs.push({ ...log, id: uuidv4(), timestamp: new Date().toISOString() });
};

// ─── AI Conversations ──────────────────────────────────────────────────────
interface AIConversation {
  id: string;
  userId: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
  language: string;
  createdAt: string;
  updatedAt: string;
}
export const demoConversations: AIConversation[] = [];
export const addConversation = (conv: Omit<AIConversation, 'id'>) => {
  const newConv = { ...conv, id: uuidv4() };
  demoConversations.push(newConv);
  return newConv;
};
export const updateConversation = (id: string, messages: AIConversation['messages']) => {
  const conv = demoConversations.find(c => c.id === id);
  if (conv) {
    conv.messages = messages;
    conv.updatedAt = new Date().toISOString();
  }
};

export { uuidv4 };
