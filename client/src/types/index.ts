// ─── Shared TypeScript Types ───────────────────────────────────────────────

export type UserRole = 'fan' | 'volunteer' | 'staff' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type IncidentType =
  | 'medical_emergency'
  | 'fire_smoke'
  | 'missing_person'
  | 'security_threat'
  | 'crowd_crush_risk'
  | 'lost_child'
  | 'accessibility_assistance'
  | 'other';

export type IncidentStatus =
  | 'submitted'
  | 'acknowledged'
  | 'staff_assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: string;
  type: IncidentType;
  location: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  reportNumber: string;
  reportedBy: string;
  assignedTo?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'not_started' | 'assigned' | 'in_progress' | 'blocked' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  zone: string;
  deadline: string;
  estimatedDuration: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CrowdLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface CrowdReading {
  id: string;
  gate: string;
  zone: string;
  count: number;
  capacity: number;
  level: CrowdLevel;
  queueMinutes: number;
  timestamp: string;
}

export type TransportStatus = 'on_time' | 'delayed' | 'suspended' | 'available' | 'full';
export type TransportType = 'metro' | 'shuttle' | 'taxi' | 'parking' | 'walking';

export interface TransportUpdate {
  id: string;
  type: TransportType;
  name: string;
  status: TransportStatus;
  details: string;
  nextDeparture?: string;
  delay?: number;
  updatedAt: string;
}

export type NotificationCategory = 'crowd' | 'transport' | 'emergency' | 'task' | 'incident' | 'sustainability' | 'general';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  read: boolean;
  createdAt: string;
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

export type AnnouncementStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';
export type AnnouncementUrgency = 'low' | 'medium' | 'high';

export interface Announcement {
  id: string;
  purpose: string;
  location: string;
  tone: string;
  urgency: AnnouncementUrgency;
  status: AnnouncementStatus;
  englishText: string;
  translations: Record<string, string>;
  displayBoardVersion: string;
  audioVersion: string;
  plainLanguageVersion: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown[];
}

export interface StadiumPOI {
  id: string;
  type: string;
  name: string;
  lat: number;
  lng: number;
  accessible: boolean;
  crowdLevel?: CrowdLevel;
}

export interface RouteResult {
  from: string;
  to: string;
  distance: string;
  estimatedTime: string;
  steps: Array<{ step: number; instruction: string; distance?: string }>;
  crowdLevelAlongRoute: CrowdLevel;
  alternativeRoutes: Array<{ label: string; extraDistance: string; extraTime: string }>;
  isDemoData: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetId?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  darkMode: boolean;
}
