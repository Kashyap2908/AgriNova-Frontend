import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api' || 'http://10.104.108.192:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach access token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'mock_access_token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken || refreshToken === 'mock_refresh_token') {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// API Service Helpers for Profile, Farm Management, and Dashboard
export const fetchUserProfile = async () => {
  try {
    const response = await api.get('/profile/');
    return response.data;
  } catch (error) {
    console.warn('Backend API fetch profile failed, using local context:', error);
    return null;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/profile/', profileData);
    return response.data;
  } catch (error) {
    console.warn('Backend API update failed, continuing locally:', error);
    return { success: true, data: profileData };
  }
};

export const fetchFarms = async () => {
  try {
    const response = await api.get('/farms/');
    return response.data;
  } catch (error) {
    console.warn('Backend API fetch farms failed, using local context:', error);
    return { success: true, data: [] };
  }
};

export const createFarmApi = async (farmData) => {
  try {
    const response = await api.post('/farms/', farmData);
    return response.data;
  } catch (error) {
    console.warn('Backend API create farm failed, continuing locally:', error);
    return { success: true, data: farmData };
  }
};

export const selectFarmApi = async (farmId) => {
  try {
    const response = await api.post(`/farms/select/${farmId}/`);
    return response.data;
  } catch (error) {
    console.warn('Backend API select farm failed, continuing locally:', error);
    return { success: true };
  }
};

export const deleteFarmApi = async (farmId) => {
  try {
    const response = await api.delete(`/farms/${farmId}/`);
    return response.data;
  } catch (error) {
    console.warn('Backend API delete farm failed, continuing locally:', error);
    return { success: true };
  }
};

export const fetchDashboardApi = async () => {
  try {
    const response = await api.get('/dashboard/');
    return response.data;
  } catch (error) {
    console.warn('Backend API fetch dashboard failed, using local context:', error);
    return null;
  }
};

// Geocoding helper via OpenStreetMap Nominatim (Coordinates fetched asynchronously)
export const geocodeLocation = async ({ village, taluka, district, state }) => {
  try {
    const query = `${village || ''}, ${taluka || ''}, ${district || ''}, ${state || ''}, India`;
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1
      }
    });
    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
        displayName: response.data[0].display_name
      };
    }
  } catch (err) {
    console.warn('Geocoding lookup failed or rate limited:', err);
  }
  return null;
};

export default api;

