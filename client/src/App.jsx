import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp, Spin } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalAlert from './components/GlobalAlert';
import api from './api/axios';

// Lazy Load Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const About = lazy(() => import('./pages/About'));
const Support = lazy(() => import('./pages/Support'));
const Login = lazy(() => import('./pages/Login'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const ServerSelector = lazy(() => import('./pages/ServerSelector'));
const Moderation = lazy(() => import('./pages/modules/Moderation'));
const Leveling = lazy(() => import('./pages/modules/Leveling'));
const Music = lazy(() => import('./pages/modules/Music'));
const Logging = lazy(() => import('./pages/modules/Logging'));
const EmbedBuilder = lazy(() => import('./pages/modules/EmbedBuilder'));
const ServerManagement = lazy(() => import('./pages/modules/ServerManagement'));
const FormBuilder = lazy(() => import('./pages/modules/FormBuilder'));
const ScheduledMessages = lazy(() => import('./pages/modules/ScheduledMessages'));
const ServerAnalytics = lazy(() => import('./pages/ServerAnalytics'));
const AuditLogs = lazy(() => import('./pages/modules/AuditLogs'));
const DataPrivacy = lazy(() => import('./pages/DataPrivacy'));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const Settings = lazy(() => import('./pages/Settings'));
const TicketSystem = lazy(() => import('./pages/modules/TicketSystem'));
const TicketHistory = lazy(() => import('./pages/modules/TicketHistory'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Features = lazy(() => import('./pages/Features'));
const Leaderboard = lazy(() => import('./pages/public/Leaderboard'));
const MainLayout = lazy(() => import('./components/Layout/MainLayout'));
import Footer from './components/Layout/Footer';

const PublicLayout = ({ children }) => (
  <>
    {children}
    <Footer />
  </>
);

// Loading Fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}>
    <Spin size="large" />
  </div>
);

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

  if (loading) return <PageLoader />;

  // Maintenance Logic
  if (maintenance?.maintenanceMode) {
    const isSuperAdmin = user?.isSuperAdmin;
    const isLoginPage = window.location.pathname === '/login' || window.location.pathname.startsWith('/api/auth');

    if (!isSuperAdmin && !isLoginPage) {
      return (
        <Suspense fallback={<PageLoader />}>
          <Maintenance />
        </Suspense>
      );
    }
  }

  return (
    <Router>
      <GlobalAlert alertData={maintenance?.currentAlert} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/support" element={<PublicLayout><Support /></PublicLayout>} />
          <Route path="/leaderboard/:guildId" element={<PublicLayout><Leaderboard /></PublicLayout>} />

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
      </Suspense>
    </Router>
  );
};

export default App;
