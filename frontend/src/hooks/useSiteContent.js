import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const EMPTY_CONTENT = {
  settings: {},
  sections: {
    promo_slide: [],
    roadmap_slide: [],
    honor_student: [],
    testimonial: [],
    chat_proof: []
  }
};

export function useSiteContent() {
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(() => {
    api.get('/Home/SiteContent')
      .then((res) => {
        if (res.data && res.data.success) {
          setContent(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchContent();

    // Auto re-fetch when user switches back to this tab
    const handleFocus = () => fetchContent();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchContent]);

  return { ...content, loading, refetch: fetchContent };
}
