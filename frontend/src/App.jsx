import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
              borderRadius: '0.75rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/submit" element={<SubmitComplaint />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
