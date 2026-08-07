import { useState, useEffect } from 'react';
import api from '../services/api';

const EMPTY_CONTENT = { settings: {}, sections: { promo_slide: [], honor_student: [], testimonial: [] } };

export function useSiteContent() {
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.get('/Home/SiteContent')
      .then((res) => {
        if (isMounted && res.data && res.data.success) {
          setContent(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return { ...content, loading };
}
