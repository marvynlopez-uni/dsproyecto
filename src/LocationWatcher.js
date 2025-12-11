// src/LocationWatcher.js
import React, { useEffect } from 'react';
import { useAppContext } from './AppContext';

export default function LocationWatcher() {
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocalización no disponible en este navegador');
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
console.log('POSICIÓN OBTENIDA', coords);
        dispatch({
          type: 'SET_USER_LOCATION',
          payload: coords,
        });
      },
      (error) => {
        console.error('Error de geolocalización', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, [dispatch]);

  if (!state.userLocation) {
    return <p>Obteniendo tu ubicación...</p>;
  }

  return (
    <p aria-live="polite">
      Ubicación actual: {state.userLocation.lat.toFixed(5)},{' '}
      {state.userLocation.lng.toFixed(5)}
    </p>
  );
}
