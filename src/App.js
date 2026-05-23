import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Billing   from "./pages/Billing";
import Inventory from "./pages/Inventory";
import Reports   from "./pages/Reports";
import Users     from "./pages/Users";
import Layout    from "./components/Layout";

const isAuthenticated = () => !!localStorage.getItem("token");

const ProtectedRoute = ({ children }) =>
  isAuthenticated() ? <Layout>{children}</Layout> : <Navigate to="/login" />;

export default function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/billing"   element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/reports"   element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/users"     element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
