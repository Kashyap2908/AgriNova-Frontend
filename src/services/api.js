import axios from 'axios';

const api = axios.create({
  // this url is for wifi-hosting
  // baseURL: import.meta.env.VITE_API_BASE_URL

  // this url is for localhost
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach access token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
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
        const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        if (localStorage.getItem('refresh_token')) {
          localStorage.setItem('access_token', newAccessToken);
        } else {
          sessionStorage.setItem('access_token', newAccessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// API Service Helpers for Profile, Farm Management, and Dashboard
export const fetchUserProfile = async () => {
  const response = await api.get('/profile/');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  let config = {};
  if (profileData instanceof FormData) {
    config.headers = { 'Content-Type': 'multipart/form-data' };
  }
  const response = await api.put('/profile/', profileData, config);
  return response.data;
};

export const fetchFarms = async () => {
  const response = await api.get('/farms/');
  return response.data;
};

export const createFarmApi = async (farmData) => {
  const response = await api.post('/farms/', farmData);
  return response.data;
};

export const selectFarmApi = async (farmId) => {
  const response = await api.post(`/farms/select/${farmId}/`);
  return response.data;
};

export const deleteFarmApi = async (farmId) => {
  const response = await api.delete(`/farms/${farmId}/`);
  return response.data;
};

export const fetchDashboardApi = async () => {
  const response = await api.get('/dashboard/');
  return response.data;
};

// Password Reset API Calls
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password/', { email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp/', { email, otp });
  return response.data;
};

export const resetPassword = async (email, otp, password, confirmPassword) => {
  const response = await api.post('/auth/reset-password/', {
    email,
    otp,
    password,
    confirm_password: confirmPassword,
  });
  return response.data;
};


// Geocoding helper via OpenStreetMap Nominatim
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

// Recommendation API Service
export const predictCropApi = async (payload) => {
  // Accepts either farmId integer or full payload object
  const body = typeof payload === 'object' ? payload : { farm_id: payload };
  const response = await api.post('/recommendation/predict/', body);
  return response.data;
};

export const fetchAvailableCropsApi = async (farmId) => {
  const response = await api.get(`/recommendation/crops/${farmId}/`);
  return response.data;
};

export const fetchRecommendationHistoryApi = async () => {
  const response = await api.get('/recommendation/history/');
  return response.data;
};

export const fetchRecommendationDetailApi = async (id) => {
  const response = await api.get(`/recommendation/history/${id}/`);
  return response.data;
};

export default api;
