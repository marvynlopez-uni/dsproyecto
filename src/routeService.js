// src/routeService.js
import { normalizeDestinationText } from './normalizeDestination';

// Geocodificación usando Nominatim (como antes)
export async function geocodeDestination(destinationText) {
  if (!destinationText) return null;

  const cleaned = normalizeDestinationText
    ? normalizeDestinationText(destinationText)
    : destinationText.toLowerCase().trim();

  if (!cleaned) return null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', cleaned);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept-Language': 'es',
      'User-Agent': 'asistente-movilidad-demo/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Error en geocodificación');
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    return null;
  }

  const item = data[0];

  return {
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    displayName: item.display_name,
  };
}

// Pide a OSRM una ruta en carro entre origen y destino
async function fetchRouteOSRM(origin, destination) {
  // OSRM usa el formato lng,lat
  const from = `${origin.lng},${origin.lat}`;
  const to = `${destination.lng},${destination.lat}`;

  const url = `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Error al obtener ruta OSRM');
  }

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    return []; // sin ruta
  }

  const coords = data.routes[0].geometry.coordinates; // [ [lng,lat], ... ]

  // Convertimos a [lat,lng] para Leaflet
  const path = coords.map(([lng, lat]) => [lat, lng]);

  return path;
}

// Construcción de ruta simple: origen + destino + path
export async function buildSimpleRoute(userLocation, destinationText) {
  if (!userLocation) {
    throw new Error('Ubicación del usuario no disponible');
  }

  // 1) Geocodificar destino
  const destination = await geocodeDestination(destinationText);
  if (!destination) {
    return null;
  }

  // 2) Pedir ruta OSRM entre origen y destino
  const path = await fetchRouteOSRM(
    { lat: userLocation.lat, lng: userLocation.lng },
    { lat: destination.lat, lng: destination.lng }
  );

  // 3) Devolver currentRoute con path lleno
  return {
    origin: {
      lat: userLocation.lat,
      lng: userLocation.lng,
    },
    destination: {
      lat: destination.lat,
      lng: destination.lng,
      label: destination.displayName,
    },
    path, // aquí van TODOS los puntos de la carretera
  };
}
