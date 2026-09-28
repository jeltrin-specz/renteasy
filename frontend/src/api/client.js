import axios from 'axios';

// Automatically points to local Spring Boot API (via proxy or direct)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to extract clean backend error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected network or server error occurred.';
    
    if (error.response) {
      const data = error.response.data;
      if (data) {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = `${data.error}: ${data.status}`;
        }
        if (data.fieldErrors) {
          const fieldMsg = Object.entries(data.fieldErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          errorMessage += ` (${fieldMsg})`;
        }
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to Spring Boot server. Please ensure backend is running at http://localhost:8080.';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    return Promise.reject(enhancedError);
  }
);
