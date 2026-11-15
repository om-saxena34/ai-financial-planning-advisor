import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Recommendations from './pages/Recommendations';
import SipCalculator from './pages/SipCalculator';
import CompoundCalculator from './pages/CompoundCalculator';
import HealthScore from './pages/HealthScore';
import Insights from './pages/Insights';
import ModelMetrics from './pages/ModelMetrics';
import WhatIfSimulator from './pages/WhatIfSimulator';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/model-metrics" element={<ModelMetrics />} />
          <Route path="/chat" element={<Chat />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/calculators/sip" element={<SipCalculator />} />
            <Route path="/calculators/compound" element={<CompoundCalculator />} />
            <Route path="/health-score" element={<HealthScore />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/what-if" element={<WhatIfSimulator />} />
          </Route>

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
