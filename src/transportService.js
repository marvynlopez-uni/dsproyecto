// src/transportService.js

function generateSecurityCode() {
  // Código de seguridad de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000);
}

// Simula una API de transporte accesible
export function requestAccessibleTransport(currentRoute, dispatch) {
  console.log('requestAccessibleTransport llamado con ruta:', currentRoute);
  if (!currentRoute) {
    dispatch({ type: 'SET_TRANSPORT_STATUS', payload: 'error' });
    return;
  }



  // Tiempo estimado de llegada del conductor (demo: entre 3 y 10 minutos)
  const etaMinutes = Math.floor(3 + Math.random() * 8);
  const securityCode = generateSecurityCode();

  // Guardar ETA y código en el estado global
  dispatch({ type: 'SET_DRIVER_ETA', payload: etaMinutes });
  dispatch({ type: 'SET_SECURITY_CODE', payload: securityCode });

  // 1) Estado: solicitando vehículo
  dispatch({ type: 'SET_TRANSPORT_STATUS', payload: 'requesting' });

  // 2) Después de 3 segundos: vehículo encontrado
  setTimeout(() => {
    dispatch({ type: 'SET_TRANSPORT_STATUS', payload: 'confirmed' });

    // 3) Después de 5 segundos más: conductor en camino
    setTimeout(() => {
      dispatch({ type: 'SET_TRANSPORT_STATUS', payload: 'on_route' });

      // 4) Después de 8 segundos más: viaje completado
      setTimeout(() => {
        dispatch({ type: 'SET_TRANSPORT_STATUS', payload: 'completed' });
      }, 8000);
    }, 5000);
  }, 3000);
}
