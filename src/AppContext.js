// src/AppContext.js
import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  userLocation: null,
  voiceCommand: '',
  currentRoute: null,
  transportStatus: 'idle', // 'idle' | 'requesting' | 'confirmed' | 'on_route' | 'completed' | 'error'
  driverEtaMinutes: null,
  securityCode: null,
  user: null,
  // Estados del asistente de voz continuo
  assistantState: 'idle', // 'idle' | 'awaiting_destination' | ...
  estimatedFare: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_DRIVER_ETA':
      return { ...state, driverEtaMinutes: action.payload };
    case 'SET_SECURITY_CODE':
      return { ...state, securityCode: action.payload };
    case 'SET_USER_LOCATION':
      return { ...state, userLocation: action.payload };
    case 'SET_VOICE_COMMAND':
      return { ...state, voiceCommand: action.payload };
    case 'SET_CURRENT_ROUTE':
      return { ...state, currentRoute: action.payload };
    case 'SET_TRANSPORT_STATUS':
      console.log('SET_TRANSPORT_STATUS ->', action.payload);
      return { ...state, transportStatus: action.payload };
    case 'SET_ASSISTANT_STATE':
      return { ...state, assistantState: action.payload };
    case 'SET_ESTIMATED_FARE':
      return { ...state, estimatedFare: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
