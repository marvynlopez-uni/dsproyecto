// src/VoiceAssistant.js
import React, { useState, useEffect } from 'react';
import { useAppContext } from './AppContext';

export default function VoiceAssistant() {
  const { state, dispatch } = useAppContext();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API no disponible en este navegador');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      dispatch({
        type: 'SET_VOICE_COMMAND',
        payload: transcript,
      });
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.abort();
    };
  }, [isListening, dispatch]);

  const handleClick = () => {
    setIsListening((prev) => !prev);
  };

  return (
    <div aria-label="Módulo de asistente por voz">
      <button
        onClick={handleClick}
        aria-pressed={isListening}
        aria-label={
          isListening ? 'Detener reconocimiento de voz' : 'Iniciar reconocimiento de voz'
        }
      >
        {isListening ? 'Detener voz' : 'Hablar'}
      </button>

      {state.voiceCommand && (
        <p aria-live="polite">
          Último comando: {state.voiceCommand}
        </p>
      )}
    </div>
  );
}
