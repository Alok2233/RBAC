import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminOverview from './pages/AdminOverview';
import PendingApprovals from './pages/PendingApprovals';
import AllUsers from './pages/AllUsers';

export default function App() {
  const { refreshUser, token } = useAuthStore();

  // Validate token on app load
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '13px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* User protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminOverview />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pending"
          element={
            <AdminRoute>
              <PendingApprovals />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AllUsers />
            </AdminRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
