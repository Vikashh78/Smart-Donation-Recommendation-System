/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/src/components/Navbar';
import LandingPage from '@/src/pages/LandingPage';
import LoginPage from '@/src/pages/LoginPage';
import RegisterPage from '@/src/pages/RegisterPage';
import DonorDashboard from '@/src/pages/DonorDashboard';
import HospitalDashboard from '@/src/pages/HospitalDashboard';
import MatchPage from '@/src/pages/MatchPage';
import ProfilePage from '@/src/pages/ProfilePage';
import NotFoundPage from '@/src/pages/NotFoundPage';
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              <Route path="/donor-dashboard" element={
                <ProtectedRoute role="donor">
                  <DonorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/hospital-dashboard" element={
                <ProtectedRoute role="hospital">
                  <HospitalDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/match" element={
                <ProtectedRoute>
                  <MatchPage />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}
