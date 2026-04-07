import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ProblemsManager from './components/Problems/ProblemsManager';
import PendingProblems from './components/Problems/PendingProblems';
import FindProblems from './components/Problems/FindProblems';
import CFAnalytics from './components/Analytics/CFAnalytics';
import SidebarLayout from './components/Layout/SidebarLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<SidebarLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/problems" element={<ProblemsManager />} />
            <Route path="/pending" element={<PendingProblems />} />
            <Route path="/find" element={<FindProblems />} />
            <Route path="/analytics" element={<CFAnalytics />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
