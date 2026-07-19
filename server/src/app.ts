import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import stadiumRoutes from './routes/stadiums';
import crowdRoutes from './routes/crowd';
import navigationRoutes from './routes/navigation';
import transportRoutes from './routes/transport';
import incidentRoutes from './routes/incidents';
import taskRoutes from './routes/tasks';
import notificationRoutes from './routes/notifications';
import sustainabilityRoutes from './routes/sustainability';
import announcementRoutes from './routes/announcements';
import aiRoutes from './routes/ai';
import adminRoutes from './routes/admin';
import auditRoutes from './routes/auditLogs';

const app = express();

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://fifa-stadium-flow-client.vercel.app'
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global rate limit — generous for demo/hackathon
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '2000', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.DEMO_MODE === 'true', // Skip rate limiting in demo mode entirely
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// Auth rate limit disabled for demo/hackathon
const authLimiter = (req: any, res: any, next: any) => next();

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'StadiumFlow AI API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit-logs', auditRoutes);

// 404 + Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
