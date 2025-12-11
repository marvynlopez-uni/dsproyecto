// src/MapView.js
import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from 'react-leaflet';
import { useAppContext } from './AppContext';
import L from 'leaflet';

// Icono para el usuario
const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icono para el destino
const destinationIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'destination-marker',
});

// Validador de objetos { lat, lng }
const isLatLng = (p) =>
  p && typeof p.lat === 'number' && typeof p.lng === 'number';

// Componente para recentrar el mapa en el usuario
function RecenterOnUser({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (isLatLng(userLocation)) {
      map.setView(userLocation, 16);
    }
  }, [userLocation, map]);

  return null;
}

export default function MapView() {
  const { state } = useAppContext();

  // Centro por defecto si no hay ubicación del usuario
  const center = isLatLng(state.userLocation)
    ? state.userLocation
    : { lat: 3.013, lng: -76.485 };

  const origin = isLatLng(state.userLocation) ? state.userLocation : null;

  const destination = isLatLng(state.currentRoute?.destination)
    ? state.currentRoute.destination
    : null;

  // currentRoute.path viene como [lat, lng]; se convierte a { lat, lng }
  const linePositions = Array.isArray(state.currentRoute?.path)
    ? state.currentRoute.path
        .map((p) =>
          Array.isArray(p) && p.length === 2 ? { lat: p[0], lng: p[1] } : p
        )
        .filter(isLatLng)
    : null;

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterOnUser userLocation={origin} />

      {origin && (
        <Marker position={origin} icon={userIcon}>
          <Popup>Tu ubicación actual</Popup>
        </Marker>
      )}

      {destination && (
        <Marker position={destination} icon={destinationIcon}>
          <Popup>Destino: {destination.label}</Popup>
        </Marker>
      )}

      {linePositions && linePositions.length > 0 && (
        <Polyline positions={linePositions} color="blue" />
      )}
    </MapContainer>
  );
}
