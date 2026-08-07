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

const availableCropsCache = new Map();

export const fetchAvailableCropsApi = async (farmId, forceRefresh = false) => {
  if (!farmId) return { success: false, data: { crops: [] } };
  if (!forceRefresh && availableCropsCache.has(farmId)) {
    return availableCropsCache.get(farmId);
  }
  const promise = api.get(`/recommendation/crops/${farmId}/`)
    .then(res => res.data)
    .catch(err => {
      availableCropsCache.delete(farmId);
      throw err;
    });
  availableCropsCache.set(farmId, promise);
  return promise;
};


export const fetchRecommendationHistoryApi = async () => {
  const response = await api.get('/recommendation/history/');
  return response.data;
};

export const fetchRecommendationDetailApi = async (id) => {
  const response = await api.get(`/recommendation/history/${id}/`);
  return response.data;
};

export const fetchYieldSummaryApi = async (farmId = null, recId = null, crop = null) => {
  let url = '/recommendation/yield-summary/';
  const params = [];
  if (farmId) params.push(`farm_id=${farmId}`);
  if (recId) params.push(`rec_id=${recId}`);
  if (crop) params.push(`crop=${encodeURIComponent(crop)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  const response = await api.get(url);
  return response.data;
};

export const fetchProfitAnalysisApi = async (farmId, crop = null, customCosts = null) => {
  const payload = { farm_id: farmId };
  if (crop) payload.crop = crop;
  if (customCosts) payload.custom_costs = customCosts;
  const response = await api.post('/profit-analysis/', payload);
  return response.data;
};

// Market Forecast API Service
export const fetchMarketIntelligenceApi = async (farmId, crop = null) => {
  try {
    let url = `/market-forecast/intelligence/?farm_id=${farmId}`;
    if (crop) {
      url += `&crop=${encodeURIComponent(crop)}`;
    }
    const response = await api.get(url);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Market Intelligence error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch market intelligence' 
    };
  }
};

export const downloadMarketReportApi = async (farmId, crop = null) => {
  try {
    let url = `/market-forecast/report/?farm_id=${farmId}`;
    if (crop) {
      url += `&crop=${encodeURIComponent(crop)}`;
    }
    const response = await api.get(url, { responseType: 'blob' });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Market Report Download error:', error);
    return { 
      success: false, 
      message: 'Failed to generate market report. Please try again later.'
    };
  }
};

export const fetchCropMarketPriceApi = async (crop, farmId = null) => {
  try {
    let url = `/market-forecast/crop-price/?crop=${encodeURIComponent(crop)}`;
    if (farmId) {
      url += `&farm_id=${farmId}`;
    }
    const response = await api.get(url);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Crop Market Price error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch crop market price'
    };
  }
};


export const fetchMarketForecastHistoryApi = async () => {
  const response = await api.get('/market-forecast/history/');
  return response.data;
};

export const fetchMarketForecastDetailApi = async (id) => {
  const response = await api.get(`/market-forecast/history/${id}/`);
  return response.data;
};

// ==========================================
// NOTIFICATIONS API
// ==========================================

export const fetchNotificationsApi = async () => {
    try {
        const response = await api.get('/notifications/');
        return response.data; // should return { results: [...] } if paginated
    } catch (error) {
        throw error;
    }
};

export const markNotificationReadApi = async (id) => {
    try {
        const response = await api.patch(`/notifications/${id}/read/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const markAllNotificationsReadApi = async () => {
    try {
        const response = await api.post('/notifications/mark-all-read/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteNotificationApi = async (id) => {
    try {
        const response = await api.delete(`/notifications/${id}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const clearAllNotificationsApi = async () => {
    try {
        const response = await api.delete('/notifications/clear-all/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const generateSmartNotificationsApi = async () => {
    try {
        const response = await api.post('/notifications/generate/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const generateTestNotificationApi = async () => {
    try {
        const response = await api.post('/notifications/test-generate/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;
export const fetchHistoricalMarketDataApi = async (crop, state, district = "all", days = 30) => {
  try {
    const response = await api.get(`/market-forecast/explorer/?crop=${crop}&state=${state}&district=${district}&days=${days}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Historical Explorer error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to fetch historical market data." 
    };
  }
};

// Assistant API Service
export const chatWithAssistantApi = async (payload) => {
  const response = await api.post('/assistant/chat/', payload);
  return response.data;
};

export const fetchConversationsApi = async () => {
  const response = await api.get('/assistant/conversations/');
  return response.data;
};

export const fetchConversationDetailApi = async (id) => {
  const response = await api.get(`/assistant/conversations/${id}/`);
  return response.data;
};

export const renameConversationApi = async (id, title) => {
  const response = await api.patch(`/assistant/conversations/${id}/`, { title });
  return response.data;
};

export const deleteConversationApi = async (id) => {
  const response = await api.delete(`/assistant/conversations/${id}/`);
  return response.data;
};

// ==========================================
// FERTILIZER RECOMMENDATION API
// ==========================================

export const recommendFertilizerApi = async (dataOrFarmId, payloadExtra = {}) => {
  let payload = {};
  if (typeof dataOrFarmId === 'object' && dataOrFarmId !== null) {
    payload = { ...dataOrFarmId };
  } else if (typeof dataOrFarmId === 'number' || typeof dataOrFarmId === 'string') {
    payload = { farm_id: dataOrFarmId, ...payloadExtra };
  }
  const response = await api.post('/fertilizer/plan/', payload);
  return response.data;
};

export const fetchFertilizerPlanApi = recommendFertilizerApi;

export const fetchFertilizerHistoryApi = async (farmId = null) => {
  let url = '/fertilizer/history/';
  if (farmId) url += `?farm_id=${farmId}`;
  const response = await api.get(url);
  return response.data;
};

export const deleteFertilizerHistoryApi = async (id) => {
  const response = await api.delete(`/fertilizer/history/${id}/`);
  return response.data;
};

export const fetchFertilizerMasterApi = async () => {
  const response = await api.get('/fertilizer/master/');
  return response.data;
};

export const fetchCropsApi = async () => {
  const response = await api.get('/fertilizer/crops/');
  return response.data;
};


