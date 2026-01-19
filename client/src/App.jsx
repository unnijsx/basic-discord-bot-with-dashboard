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
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import TicketSystem from './pages/modules/TicketSystem';
import TicketHistory from './pages/modules/TicketHistory';



import Features from './pages/Features';

const App = () => {
  return (
    <AuthProvider>
      <AntdApp>
        <SocketProvider>
          <Router>
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
        </SocketProvider>
      </AntdApp>
    </AuthProvider>
  );
};

export default App;
