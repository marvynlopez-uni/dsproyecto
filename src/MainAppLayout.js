import React, { useState } from 'react';
import './App.css';
import LocationWatcher from './LocationWatcher';
import MapView from './MapView';
import RouteController from './RouteController';
import VoiceAssistantContinuous from './VoiceAssistantContinuous';
import { useAppContext } from './AppContext';

function App() {
  const { state, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'notifications'

  const getTransportStatusLabel = () => {
    switch (state.transportStatus) {
      case 'idle':
        return 'Sin solicitud activa';
      case 'requesting':
        return 'Solicitando vehículo accesible…';
      case 'confirmed':
        return 'Vehículo confirmado';
      case 'on_route':
        return 'Vehículo en camino';
      case 'completed':
        return 'Viaje completado';
      case 'error':
        return 'Error en la solicitud';
      default:
        return 'Sin solicitud activa';
    }
  };

  const showWelcomeOverlay = state.assistantState === 'idle';

  return (
    <div className="App app-shell">
      {/* Mapa de fondo */}
      <div className="map-layer">
        <MapView />
      </div>

      {/* Overlay de bienvenida del asistente */}
      {showWelcomeOverlay && (
        <div className="welcome-overlay" aria-label="Bienvenida del asistente">
          <div className="welcome-card white">
            <img
              src="/noveologo.png"
              alt="Noveo Móvil"
              className="welcome-logo"
            />
            <h1 className="welcome-title">Bienvenido/a a NOVEO MÓVIL</h1>
            <p className="welcome-subtitle">
              ¡Muévete sin barreras, viaja con confianza!
            </p>
            <button
              className="welcome-button"
              onClick={() =>
                dispatch({
                  type: 'SET_ASSISTANT_STATE',
                  payload: 'awaiting_destination',
                })
              }
            >
              Activar asistente
            </button>
          </div>
        </div>
      )}

      {/* Navbar superior */}
      <header className="top-bar" aria-label="Navegación principal">
        <div className="top-toggle" role="tablist" aria-label="Modo de vista">
          <button
            className={`top-toggle-btn ${activeTab === 'map' ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === 'map'}
            onClick={() => setActiveTab('map')}
          >
            Mapa
          </button>
        </div>
      </header>

      {/* Panel central */}
      <main className="overlay-center">
        <section className="info-panel" aria-live="polite">
          {activeTab === 'map' && (
            <>
              {/* Actualiza ubicación y escucha comandos */}
              <LocationWatcher />
              <VoiceAssistantContinuous />

 


              <p>Asistente de voz: escuchando…</p>

             <p>
  Último comando reconocido:{" "}
  {state.voiceCommand || "Aún no hay comandos."}
</p>


              {state.driverEtaMinutes && (
                <p>
                  Tiempo estimado de llegada del conductor:{' '}
                  <strong>{state.driverEtaMinutes} minutos</strong>
                </p>
              )}

              {state.securityCode && (
                <p>
                  Código de seguridad para este viaje:{' '}
                  <strong>{state.securityCode}</strong>
                </p>
              )}
            </>
          )}
        </section>
      </main>

      {/* Notificación flotante de estado */}
      <div className="floating-notification" aria-live="polite">
        <p>
          Estado del transporte:
          <br />
          <strong>{getTransportStatusLabel()}</strong>
        </p>

        {state.currentRoute && (
          <p>
            Destino:
            <br />
            <strong>{state.currentRoute.destination.label}</strong>
          </p>
        )}

        {state.estimatedFare && (
          <p>
            Tarifa estimada:
            <br />
            <strong>{state.estimatedFare} pesos</strong>
          </p>
        )}
      </div>

      {/* Barra inferior */}
      <footer className="bottom-bar" aria-label="Controles principales">
        <div className="voice-banner">
          <span className="voice-text">Di tu destino</span>
        </div>
      </footer>

      {/* Botón de Ruta flotante */}
      <div className="route-button-wrapper" aria-label="Control de ruta">
        <RouteController />
      </div>
    </div>
  );
}

export default App;
