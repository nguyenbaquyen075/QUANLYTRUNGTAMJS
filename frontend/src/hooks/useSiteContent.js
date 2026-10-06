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

let cachedContent = null;
let activePromise = null;

export function useSiteContent() {
  const [content, setContent] = useState(cachedContent || EMPTY_CONTENT);
  const [loading, setLoading] = useState(!cachedContent);

  const fetchContent = useCallback((force = false) => {
    if (cachedContent && !force) {
      setContent(cachedContent);
      setLoading(false);
      return;
    }

    if (activePromise && !force) {
      activePromise.then((data) => {
        if (data) setContent(data);
      });
      return;
    }

    activePromise = api.get('/Home/SiteContent')
      .then((res) => {
        if (res.data && res.data.success) {
          cachedContent = res.data.data;
          setContent(res.data.data);
          return res.data.data;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        setLoading(false);
        activePromise = null;
      });
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { ...content, loading, refetch: () => fetchContent(true) };
}
