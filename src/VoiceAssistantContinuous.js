// src/VoiceAssistantContinuous.js
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from './AppContext';
import { parseVoiceCommand } from './voiceToRouteIntent';
import { buildSimpleRoute } from './routeService';
import { requestAccessibleTransport } from './transportService';

export default function VoiceAssistantContinuous() {
  const appContext = useAppContext();
  const { state } = appContext;

  const [listening, setListening] = useState(false);
  const listeningRef = useRef(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false); // para no escuchar la propia voz del sistema
  const [voiceActive, setVoiceActive] = useState(true); // para pausar/reanudar
  const lastRouteRef = useRef(null); // guarda la última ruta válida

  const setListeningSafe = (value) => {
    listeningRef.current = value;
    setListening(value);
  };

  // Tarifa estimada muy simple
  const estimateFareFromRoute = (route) => {
    if (!route || !route.path || route.path.length < 2) {
      return 15000; // fallback
    }
    const toRad = (value) => (value * Math.PI) / 180;
    const distanceBetween = (p1, p2) => {
      const R = 6371; // km
      const dLat = toRad(p2[0] - p1[0]);
      const dLng = toRad(p2[1] - p1[1]);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(p1[0])) *
          Math.cos(toRad(p2[0])) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    let totalKm = 0;
    for (let i = 1; i < route.path.length; i++) {
      const prev = route.path[i - 1]; // [lat, lng]
      const curr = route.path[i];
      totalKm += distanceBetween(prev, curr);
    }
    const baseFare = 6000; // pesos
    const perKm = 1800; // pesos por km
    const fare = baseFare + totalKm * perKm;
    return Math.round(fare / 100) * 100;
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.onstart = () => {
      isSpeakingRef.current = true;
    };
    utter.onend = () => {
      isSpeakingRef.current = false;
    };
    window.speechSynthesis.speak(utter);
  };

  // Inicializar SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API no disponible en este navegador');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';

    recognition.onresult = async (event) => {
      const currentState = appContext.state;
      const currentDispatch = appContext.dispatch;

      if (isSpeakingRef.current) {
        return;
      }

      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript.trim();
      const lower = transcript.toLowerCase();

      // Pausar / reanudar asistente
      if (lower.includes('pausar asistente')) {
        setVoiceActive(false);
        speak(
          'noveomovil en pausa. Di reanudar asistente para volver a activarlo.'
        );
        return;
      }
      if (lower.includes('reanudar asistente')) {
        setVoiceActive(true);
        speak('noveomovil de voz reanudado.');
        return;
      }
      if (!voiceActive) {
        return;
      }

      currentDispatch({ type: 'SET_VOICE_COMMAND', payload: transcript });

      // 1) Comando de navegación
      const { intent, destinationText } = parseVoiceCommand(transcript);
      if (intent === 'NAVIGATE' && destinationText) {
        speak(
          `Tu destino ${destinationText} está siendo confirmado. Buscaremos conductores disponibles.`
        );

        console.log('STATE EN onresult', currentState.userLocation);

        if (!currentState.userLocation) {
          speak(
            'Aún no tengo tu ubicación. Espera unos segundos e inténtalo de nuevo.'
          );
          return;
        }

        try {
          const route = await buildSimpleRoute(
            currentState.userLocation,
            destinationText
          );
          if (!route) {
            speak('No pude encontrar una ruta hacia ese destino.');
            currentDispatch({ type: 'SET_CURRENT_ROUTE', payload: null });
            return;
          }

          currentDispatch({ type: 'SET_CURRENT_ROUTE', payload: route });
          lastRouteRef.current = route;

          const estimated = estimateFareFromRoute(route);
          currentDispatch({ type: 'SET_ESTIMATED_FARE', payload: estimated });

          currentDispatch({
            type: 'SET_ASSISTANT_STATE',
            payload: 'confirming_trip',
          });

          speak(
            `Encontré una ruta hacia ${route.destination.label}. La tarifa estimada es de ${estimated} pesos. ¿Quieres confirmar el viaje?`
          );
        } catch (error) {
          console.error('Error calculando ruta desde el asistente:', error);
          speak('Ocurrió un error al calcular la ruta.');
        }
        return;
      }

      // 2) Confirmación sí/no del viaje
      if (
        currentState.assistantState === 'confirming_trip' ||
        lower.includes('confirmar') ||
        lower.includes('confírmalo') ||
        lower.includes('confirmalo')
      ) {
        console.log('En bloque de confirmación, transcript:', lower);

        const positive = ['sí', 'si', 'acepto', 'confirmo', 'confírmalo', 'dale'];
        const negative = ['no', 'cancelar', 'cancela', 'mejor no'];

        const isYes = positive.some((w) => lower.includes(w));
        const isNo = negative.some((w) => lower.includes(w));

        if (isYes) {
          console.log(
            'Detectado SÍ, lanzando transporte. currentRoute =',
            currentState.currentRoute
          );
          speak(
            'Tu viaje ha sido confirmado. Estamos buscando un conductor accesible.'
          );
          currentDispatch({
            type: 'SET_ASSISTANT_STATE',
            payload: 'searching_driver',
          });

          const routeToUse = currentState.currentRoute || lastRouteRef.current;
          if (routeToUse) {
            requestAccessibleTransport(routeToUse, currentDispatch);
          } else {
            console.warn('No hay ruta para confirmar el viaje');
            currentDispatch({
              type: 'SET_TRANSPORT_STATUS',
              payload: 'error',
            });
          }
          return;
        }

        if (isNo) {
          speak(
            'De acuerdo, se cancela la solicitud. Puedes decir otro destino cuando quieras.'
          );
          currentDispatch({ type: 'SET_CURRENT_ROUTE', payload: null });
          currentDispatch({
            type: 'SET_ASSISTANT_STATE',
            payload: 'awaiting_destination',
          });
          return;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Error en reconocimiento de voz:', event.error);
      if (event.error !== 'no-speech') {
        setListeningSafe(false);
      }
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [appContext, voiceActive]); // se recrea si cambia el contexto o el flag

  // Arrancar escucha al pasar a awaiting_destination
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (state.assistantState === 'awaiting_destination' && !listeningRef.current) {
      setListeningSafe(true);
      recognition.start();
      speak('Bienvenido a noveomovil. ¿A dónde quieres ir hoy?');
    }
  }, [state.assistantState]);

  // Anunciar cambios de estado del transporte
  useEffect(() => {
    if (!state.transportStatus) return;

    if (state.transportStatus === 'requesting') {
      speak('Estamos buscando un conductor accesible cerca de ti.');
    } else if (state.transportStatus === 'confirmed') {
      if (state.securityCode && state.driverEtaMinutes) {
        speak(
          `Hemos encontrado un conductor disponible. El código de seguridad es ${state.securityCode}. El tiempo estimado de llegada es de aproximadamente ${state.driverEtaMinutes} minutos.`
        );
      } else {
        speak('Hemos encontrado un conductor accesible para tu viaje.');
      }
    } else if (state.transportStatus === 'on_route') {
      speak('El conductor va en camino hacia tu ubicación.');
    } else if (state.transportStatus === 'completed') {
      speak(
        'Tu viaje ha finalizado. Gracias por usar el asistente de movilidad accesible.'
      );
    }
  }, [state.transportStatus, state.securityCode, state.driverEtaMinutes]);

  if (state.assistantState === 'idle') {
    return null;
  }

  return null;
}
