// src/normalizeDestination.js

export function normalizeDestinationText(rawText) {
  if (!rawText) return '';

  let text = rawText.toLowerCase();

  // Quitar frases de comando
  text = text
    .replace(/^ll[eé]vame a /, '')
    .replace(/^llevarme a /, '')
    .replace(/^quiero ir a /, '')
    .replace(/^ir a /, '');

  // Normalizar abreviaturas de vía
  const viaPatterns = [
    ['kra ', 'carrera '],
    ['kr ', 'carrera '],
    ['kr. ', 'carrera '],
    ['cra ', 'carrera '],
    ['cll ', 'calle '],
    ['cl ', 'calle '],
    ['av ', 'avenida '],
    ['av. ', 'avenida '],
    ['tv ', 'transversal '],
    ['tv. ', 'transversal '],
  ];

  viaPatterns.forEach(([from, to]) => {
    text = text.replace(from, to);
  });

  // Palabras de relleno típicas
  const stopWords = [
    'barrio ',
    'urbanizacion ',
    'urbanización ',
    'conjunto ',
    'unidad ',
    'cerca de ',
    'al lado de ',
    'frente a ',
    'en ',
  ];

  stopWords.forEach(word => {
    text = text.replace(word, '');
  });

  // Casos específicos útiles (puedes ir agregando)
  text = text
    .replace('santander de quilichao', 'santander de quilichao cauca colombia')
    .replace('cali, valle del cauca', 'cali valle del cauca colombia');

  // Limpiar signos y espacios extra
  text = text
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}
