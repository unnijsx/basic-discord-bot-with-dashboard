import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp } from 'antd';
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
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <AntdApp>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><ServerSelector /></ProtectedRoute>} />

              <Route
                path="/dashboard/:guildId"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="moderation" element={<Moderation />} />
                <Route path="leveling" element={<Leveling />} />
                <Route path="music" element={<Music />} />
                <Route path="logging" element={<Logging />} />
                <Route path="messages" element={<EmbedBuilder />} />
                <Route path="management" element={<ServerManagement />} />
                {/* Reusing Moderation or creating a generic Settings page? For now, let's point to a placeholder or reuse one */}
                <Route path="settings" element={<Moderation />} />
              </Route>
            </Routes>
          </Router>
        </SocketProvider>
      </AntdApp>
    </AuthProvider>
  );
};

export default App;
