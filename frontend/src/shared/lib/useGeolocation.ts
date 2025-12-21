import { useState, useEffect, useCallback } from 'react';
import type { Coordinate } from '../types';

interface GeolocationState {
  position: Coordinate | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: false,
  });

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          error: null,
          isLoading: false,
        });
      },
      (err) => {
        setState({
          position: null,
          error: err.message,
          isLoading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    requestPosition();
  }, [requestPosition]);

  return {
    ...state,
    refresh: requestPosition,
  };
}






