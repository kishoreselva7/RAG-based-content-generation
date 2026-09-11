import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { AppShell } from './components/layout/AppShell';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CoursesList } from './pages/CoursesList';
import { CourseCreate } from './pages/CourseCreate';
import { CourseOverview } from './pages/CourseOverview';
import { CourseKnowledge } from './pages/CourseKnowledge';
import { CourseBuilder } from './pages/CourseBuilder';
import { CourseContentReview } from './pages/CourseContentReview';
import { CoursePublish } from './pages/CoursePublish';
import { CourseStudents } from './pages/CourseStudents';
import { CourseAnalytics } from './pages/CourseAnalytics';
import { CourseImprove } from './pages/CourseImprove';
import { SettingsPage } from './pages/Settings';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CourseProvider>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Teacher Workspace Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses"
                element={
                  <ProtectedLayout>
                    <CoursesList />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/create"
                element={
                  <ProtectedLayout>
                    <CourseCreate />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId"
                element={
                  <ProtectedLayout>
                    <CourseOverview />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/knowledge"
                element={
                  <ProtectedLayout>
                    <CourseKnowledge />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/knowledge/upload"
                element={
                  <ProtectedLayout>
                    <CourseKnowledge />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/builder"
                element={
                  <ProtectedLayout>
                    <CourseBuilder />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/content"
                element={
                  <ProtectedLayout>
                    <CourseContentReview />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/content/:contentId"
                element={
                  <ProtectedLayout>
                    <CourseContentReview />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/review"
                element={
                  <ProtectedLayout>
                    <CourseContentReview />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/publish"
                element={
                  <ProtectedLayout>
                    <CoursePublish />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/students"
                element={
                  <ProtectedLayout>
                    <CourseStudents />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/assignments"
                element={
                  <ProtectedLayout>
                    <CourseStudents />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/analytics"
                element={
                  <ProtectedLayout>
                    <CourseAnalytics />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/courses/:courseId/improve"
                element={
                  <ProtectedLayout>
                    <CourseImprove />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedLayout>
                    <SettingsPage />
                  </ProtectedLayout>
                }
              />

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </CourseProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
