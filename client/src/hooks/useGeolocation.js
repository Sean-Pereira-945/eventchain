import { useEffect, useState } from 'react';

const defaultOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 5_000
};

const useGeolocation = (options = defaultOptions) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is unavailable');
      return;
    }

    const successHandler = (pos) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      });
      setError(null);
    };

    const errorHandler = (err) => {
      setError(err.message);
    };

    const watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      ...defaultOptions,
      ...options
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  return { position, error };
};

export default useGeolocation;
