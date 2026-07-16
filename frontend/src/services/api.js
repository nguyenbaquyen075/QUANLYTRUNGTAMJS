import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Interceptor to handle redirect responses from EJS-to-JSON middleware
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success && response.data.type === 'redirect') {
      const redirectUrl = response.data.url;
      // Handle login/logout redirects or standard flows
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
    return response;
  },
  (error) => {
    // Handle session expired or access denied errors
    if (error.response && error.response.status === 401) {
      window.location.href = '/Auth/Login';
    }
    return Promise.reject(error);
  }
);

export default api;
