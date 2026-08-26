import { useState, useEffect } from 'react';

export function useLocation() {
  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem('pollibondhu_user_coords');
    return saved ? JSON.parse(saved) : null;
  });

  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem('pollibondhu_user_location_name') || 'ঢাকা';
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');

  const estimateDistrictFromCoords = (lat, lon) => {
    if (lat >= 24.5 && lon >= 91.5) return 'সিলেট';
    if (lat >= 24.0 && lon >= 88.5 && lon <= 89.5) return 'রাজশাহী';
    if (lat >= 25.5) return 'রংপুর';
    if (lat <= 22.8 && lon >= 91.5) return 'চট্টগ্রাম';
    if (lat <= 23.0 && lon <= 90.5) return 'বরিশাল';
    if (lat >= 22.5 && lat <= 23.8 && lon >= 89.0 && lon <= 90.0) return 'খুলনা';
    if (lat >= 24.5 && lon >= 90.0 && lon <= 90.8) return 'ময়মনসিংহ';
    return 'ঢাকা';
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('আপনার ব্রাউজারে Geolocation সমর্থিত নয়।');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const newCoords = { latitude, longitude };

        const detectedName = estimateDistrictFromCoords(latitude, longitude);

        setCoords(newCoords);
        setLocationName(detectedName);
        setPermissionState('granted');
        setLoading(false);

        localStorage.setItem('pollibondhu_user_coords', JSON.stringify(newCoords));
        localStorage.setItem('pollibondhu_user_location_name', detectedName);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState('denied');
          setError('অবস্থান অনুমতি প্রত্যাখ্যান করা হয়েছে। ম্যানুয়ালি জেলা নির্বাচন করুন।');
        } else {
          setError('অবস্থান নির্ণয় করা সম্ভব হয়নি।');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!coords && permissionState === 'prompt') {
      requestLocation();
    }
  }, []);

  const setManualLocation = (city) => {
    setLocationName(city);
    localStorage.setItem('pollibondhu_user_location_name', city);
  };

  return {
    coords,
    locationName,
    loading,
    error,
    permissionState,
    requestLocation,
    setManualLocation
  };
}
