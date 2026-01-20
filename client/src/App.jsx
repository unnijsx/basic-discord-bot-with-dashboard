import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Support from './pages/Support';
import Login from './pages/Login';
import MainLayout from './components/Layout/MainLayout';
import DashboardHome from './pages/DashboardHome';
import ServerSelector from './pages/ServerSelector';
import Moderation from './pages/modules/Moderation';
import Leveling from './pages/modules/Leveling';
import Music from './pages/modules/Music';
import Logging from './pages/modules/Logging';
import EmbedBuilder from './pages/modules/EmbedBuilder';
import ServerManagement from './pages/modules/ServerManagement';
import FormBuilder from './pages/modules/FormBuilder';
import ScheduledMessages from './pages/modules/ScheduledMessages';
import ServerAnalytics from './pages/ServerAnalytics';
import AuditLogs from './pages/modules/AuditLogs';
import DataPrivacy from './pages/DataPrivacy';
import SuperAdmin from './pages/SuperAdmin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalAlert from './components/GlobalAlert';
import TicketSystem from './pages/modules/TicketSystem';
import TicketHistory from './pages/modules/TicketHistory';
import Maintenance from './pages/Maintenance';
import api from './api/axios';

import Features from './pages/Features';

const App = () => {
  const [maintenance, setMaintenance] = React.useState(null);

  React.useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data } = await api.get('/maintenance');
        setMaintenance(data);
      } catch (e) {
        console.error(e);
      }
    };
    checkMaintenance();
    const interval = setInterval(checkMaintenance, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <AppContent maintenance={maintenance} setMaintenance={setMaintenance} />
    </AuthProvider>
  );
};

const AppContent = ({ maintenance, setMaintenance }) => {
  const { user, loading } = useAuth(); // Access context directly since we are inside Provider
  // Need to import AuthContext to use useContext, or export useAuth outside
  // But getting context from useAuth inside the same file where AuthProvider is rendered is tricky if App is parent.
  // Correct pattern: Move AuthProvider separate or use child component.
  // Let's refactor App structure slightly

  return (
    <AntdApp>
      <SocketProvider>
        <RouterWrapper maintenance={maintenance} setMaintenance={setMaintenance} />
      </SocketProvider>
    </AntdApp>
  );
};

const RouterWrapper = ({ maintenance, setMaintenance }) => {
  const { user, loading } = useAuth();
  const socket = useSocket();

  // Listen for real-time system alerts
  React.useEffect(() => {
    if (!socket) return;
    socket.on('systemAlert', (alert) => {
      setMaintenance(prev => ({ ...prev, currentAlert: alert }));
    });
    return () => socket.off('systemAlert');
  }, [socket, setMaintenance]);

  if (loading) return null;

  // Maintenance Logic
  if (maintenance?.maintenanceMode) {
    const isSuperAdmin = user?.isSuperAdmin;
    const isLoginPage = window.location.pathname === '/login' || window.location.pathname.startsWith('/api/auth');

    if (!isSuperAdmin && !isLoginPage) {
      return <Maintenance />;
    }
  }

  return (
    <Router>
      <GlobalAlert alertData={maintenance?.currentAlert} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><ServerSelector /></ProtectedRoute>} />
        <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />

        <Route
          path="/dashboard/:guildId"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="analytics" element={<ServerAnalytics />} />
          <Route path="logs" element={<AuditLogs />} />
          <Route path="privacy" element={<DataPrivacy />} />
          <Route path="moderation" element={<Moderation />} />
          <Route path="leveling" element={<Leveling />} />
          <Route path="music" element={<Music />} />
          <Route path="tickets" element={<TicketSystem />} />
          <Route path="tickets/history" element={<TicketHistory />} />
          <Route path="moderation/*" element={<Moderation />} />
          <Route path="logging" element={<Logging />} />
          <Route path="messages" element={<EmbedBuilder />} />
          <Route path="management" element={<ServerManagement />} />
          <Route path="forms" element={<FormBuilder />} />
          <Route path="scheduled-messages" element={<ScheduledMessages />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
