// src/RouteController.js
import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import { parseVoiceCommand } from './voiceToRouteIntent';
import { buildSimpleRoute } from './routeService';
import { requestAccessibleTransport } from './transportService';

export default function RouteController() {
  const { state, dispatch } = useAppContext();
  const [parsedDestination, setParsedDestination] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const { intent, destinationText } = parseVoiceCommand(state.voiceCommand);

    if (!state.voiceCommand) {
      setMessage(
        'Primero di un comando de voz, por ejemplo: "Llévame a la Carrera 15 número 1063 en Santander de Quilichao".'
      );
      setParsedDestination('');
      return;
    }

    if (intent !== 'NAVIGATE' || !destinationText) {
      setMessage('No se reconoció un destino. Intenta decir: "Llévame a <lugar>".');
      setParsedDestination('');
      return;
    }

    if (!state.userLocation) {
      setMessage('Aún no se obtuvo tu ubicación. Espera unos segundos e inténtalo de nuevo.');
      setParsedDestination('');
      return;
    }

    setLoading(true);
    setMessage('');
    setParsedDestination(destinationText);

    try {
      const route = await buildSimpleRoute(state.userLocation, destinationText);

      if (!route) {
        setMessage('No se encontró una ubicación para ese destino.');
        dispatch({ type: 'SET_CURRENT_ROUTE', payload: null });
        setLoading(false);
        return;
      }

      // Guardar ruta en el estado global
      dispatch({ type: 'SET_CURRENT_ROUTE', payload: route });
      setMessage('Ruta calculada. Iniciando solicitud de transporte accesible.');

      // Feedback por voz de la ruta
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(
          `Ruta encontrada hacia ${route.destination.label}.`
        );
        utter.lang = 'es-ES';
        window.speechSynthesis.speak(utter);
      }

      // Simular petición de transporte accesible
      requestAccessibleTransport(route, dispatch);
    } catch (error) {
      console.error(error);
      setMessage('Ocurrió un error al calcular la ruta.');
      dispatch({ type: 'SET_CURRENT_ROUTE', payload: null });
    } finally {
      setLoading(false);
    }
  };
// Función auxiliar dentro del componente (antes del return)
const getStatusColor = () => {
  switch (state.transportStatus) {
    case 'requesting':
      return '#f4b024'; // amarillo
    case 'confirmed':
    case 'on_route':
      return '#4caf50'; // verde
    case 'completed':
      return '#2196f3'; // azul
    case 'error':
      return '#f44336'; // rojo
    default:
      return '#ffffff'; // blanco
  }
};

}
