import { useState, useEffect } from 'react';
import api from '../services/api';

export function useFetchData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(url);
      if (res.data && res.data.success && res.data.type === 'render') {
        setData(res.data.data);
      } else if (res.data && res.data.success && res.data.type === 'redirect') {
        // Redirection handled by Axios interceptor, but we set loading just in case
        setLoading(true);
      } else {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching page data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
