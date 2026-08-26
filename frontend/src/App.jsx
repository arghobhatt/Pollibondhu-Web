import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/layout/AppShell';

import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import TrackingPage from './pages/TrackingPage';
import AgriPage from './pages/AgriPage';
import WeatherPage from './pages/WeatherPage';
import ComplaintsPage from './pages/ComplaintsPage';
import UtilityPage from './pages/UtilityPage';
import TransportPage from './pages/TransportPage';
import EmergencyPage from './pages/EmergencyPage';
import CommunityPage from './pages/CommunityPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import NotificationsPage from './pages/NotificationsPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="agriculture" element={<AgriPage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="utility" element={<UtilityPage />} />
            <Route path="transport" element={<TransportPage />} />
            <Route path="emergency" element={<EmergencyPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="my-applications" element={<MyApplicationsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="officer" element={<OfficerDashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
