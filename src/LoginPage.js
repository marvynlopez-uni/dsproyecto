import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';
import { useAppContext } from './AppContext';


export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // correo o teléfono
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useAppContext();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const res = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Error al iniciar sesión');
      return;
    }

    // Guardar usuario en contexto
    dispatch({ type: 'SET_USER', payload: data.user });

    console.log('Login correcto, usuario en contexto:', data.user);

    // Ir a la app
    navigate('/app');
  } catch (err) {
    console.error(err);
    setError('No se pudo conectar con el servidor');
  }
};



  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">¡Hola, bienvenido de nuevo!</h1>
        <p className="auth-subtitle">Inicia sesión</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Correo electrónico o teléfono</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Introduce tu correo o teléfono"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <label className="auth-label">Contraseña</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Por favor ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="auth-row">
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />{' '}
              Recuérdame
            </label>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-primary-button" type="submit">
            Iniciar sesión
          </button>
        </form>

        <p className="auth-footer-text">
          ¿Aún no tienes una cuenta?{' '}
          <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
