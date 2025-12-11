import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [disabilityType, setDisabilityType] = useState('total');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          identifier,
          password,
          disabilityType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al crear la cuenta');
        return;
      }

      setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      if (remember) {
        localStorage.setItem('noveoUser', JSON.stringify(data.user));
      }
      // Opcional: redirigir directamente al login
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Crea una cuenta</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">Nombre completo</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Introduce tu nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label className="auth-label">Correo electrónico o teléfono</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Introduce tu correo electrónico o teléfono"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <label className="auth-label">Contraseña</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Por favor cree una contraseña"
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

          <div className="auth-toggle-group">
            <button
              type="button"
              className={
                disabilityType === 'total'
                  ? 'auth-toggle-button active'
                  : 'auth-toggle-button'
              }
              onClick={() => setDisabilityType('total')}
            >
              Discapacidad visual total
            </button>
            <button
              type="button"
              className={
                disabilityType === 'parcial'
                  ? 'auth-toggle-button active'
                  : 'auth-toggle-button'
              }
              onClick={() => setDisabilityType('parcial')}
            >
              Discapacidad visual parcial
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button className="auth-primary-button" type="submit">
            Crear cuenta
          </button>
        </form>

        <p className="auth-footer-text">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
