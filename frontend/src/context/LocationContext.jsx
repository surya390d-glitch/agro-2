import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [userState, setUserState] = useState('');
  const [asked, setAsked] = useState(() => localStorage.getItem('agro_loc_asked') === 'true');

  const requestLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const loc = { lat: latitude, lon: longitude };
          setLocation(loc);
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await res.json();
            const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location';
            const state = data.address?.state || '';
            setLocationName(`${name}, ${state}`);
            setUserState(state);
            localStorage.setItem('agro_location', JSON.stringify({ lat: latitude, lon: longitude, name: `${name}, ${state}`, state }));
          } catch {}
          localStorage.setItem('agro_loc_asked', 'true');
          setAsked(true);
          resolve(loc);
        },
        () => { localStorage.setItem('agro_loc_asked', 'true'); setAsked(true); resolve(null); }
      );
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem('agro_location');
    if (stored) {
      const d = JSON.parse(stored);
      setLocation({ lat: d.lat, lon: d.lon });
      setLocationName(d.name || '');
      setUserState(d.state || '');
    }
  }, []);

  return (
    <LocationContext.Provider value={{ location, locationName, userState, asked, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
