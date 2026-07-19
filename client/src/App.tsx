import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoadingScreen from './components/ui/LoadingScreen';
import './index.css';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const SmartNavigation = lazy(() => import('./pages/SmartNavigation'));
const CrowdIntelligence = lazy(() => import('./pages/CrowdIntelligence'));
const Transportation = lazy(() => import('./pages/Transportation'));
const AccessibilityCentre = lazy(() => import('./pages/AccessibilityCentre'));
const EmergencySupport = lazy(() => import('./pages/EmergencySupport'));
const IncidentManagement = lazy(() => import('./pages/IncidentManagement'));
const IncidentDetail = lazy(() => import('./pages/IncidentDetail'));
const Sustainability = lazy(() => import('./pages/Sustainability'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const HelpSupport = lazy(() => import('./pages/HelpSupport'));
const OperationsCentre = lazy(() => import('./pages/admin/OperationsCentre'));
const StaffVolunteers = lazy(() => import('./pages/admin/StaffVolunteers'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const Announcements = lazy(() => import('./pages/admin/Announcements'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected app routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/assistant" element={<AIAssistant />} />
                  <Route path="/navigation" element={<SmartNavigation />} />
                  <Route path="/crowd" element={<CrowdIntelligence />} />
                  <Route path="/transport" element={<Transportation />} />
                  <Route path="/accessibility" element={<AccessibilityCentre />} />
                  <Route path="/emergency" element={<EmergencySupport />} />
                  <Route path="/incidents" element={<IncidentManagement />} />
                  <Route path="/incidents/:id" element={<IncidentDetail />} />
                  <Route path="/sustainability" element={<Sustainability />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<HelpSupport />} />

                  {/* Admin-only routes */}
                  <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
                    <Route path="/operations" element={<OperationsCentre />} />
                    <Route path="/staff" element={<StaffVolunteers />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/announcements" element={<Announcements />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}
