export const API_URL = import.meta.env.PROD 
  ? 'https://sistema-gab-assesp.onrender.com' 
  : 'http://localhost:3001';

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    // Optionally handle token expiration by forcing logout
    // localStorage.removeItem('token');
    // window.location.reload();
  }

  return response;
};
