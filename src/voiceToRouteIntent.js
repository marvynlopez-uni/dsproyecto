// src/voiceToRouteIntent.js

export function parseVoiceCommand(command) {
  if (!command) {
    return { intent: 'NONE', destinationText: '' };
  }

  const normalized = command.toLowerCase().trim();

  // Ejemplos de frases soportadas
  const patterns = [
    'llévame a',
    'llevarme a',
    'ir a',
    'quiero ir a',
  ];

  let destinationText = '';

  for (const pattern of patterns) {
    if (normalized.startsWith(pattern)) {
      destinationText = normalized.replace(pattern, '').trim();
      break;
    }
  }

  if (!destinationText) {
    // No se reconoció un patrón de navegación
    return { intent: 'UNKNOWN', destinationText: '' };
  }

  return {
    intent: 'NAVIGATE',
    destinationText,
  };
}
