// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './AppContext';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MainAppLayout from './MainAppLayout';

function App() {
  const { state } = useAppContext();
  const isLoggedIn = !!state.user || !!localStorage.getItem('noveoUser');

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/app"
        element={isLoggedIn ? <MainAppLayout /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/app" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/app" /> : <RegisterPage />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
