import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/noveologo.png" alt="Noveo Móvil" />
        </div>
        <h1 className="auth-title">Bienvenido/a a NOVEO MÓVIL</h1>
        <p className="auth-subtitle">
          Muévete sin barreras, viaja con confianza.
        </p>

        <div className="auth-buttons">
          <button
            className="auth-secondary-button"
            onClick={() => navigate('/register')}
          >
            Registrarse
          </button>
          <button
            className="auth-primary-button"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}