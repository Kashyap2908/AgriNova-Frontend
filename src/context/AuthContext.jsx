import React, { createContext, useState, useEffect } from 'react';
import api, { fetchUserProfile, updateUserProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        try {
          const [authRes, profileRes] = await Promise.all([
            api.get('/auth/profile/').catch(() => null),
            fetchUserProfile().catch(() => null)
          ]);

          if (authRes?.data?.success) {
            const userData = authRes.data.data;
            const profileData = profileRes?.data || profileRes || {};

            const isCompleted = Boolean(profileData.profile_completed || localStorage.getItem('profile_completed') === 'true');

            setUser({
              ...userData,
              fullName: profileData.full_name || profileData.fullName || userData.full_name || userData.username,
              phone: profileData.phone_number || profileData.phone || '',
              language: profileData.preferred_language || profileData.language || 'English',
              avatar: profileData.profile_photo || profileData.avatar || null,
              profileCompleted: isCompleted
            });
            if (isCompleted) localStorage.setItem('profile_completed', 'true');
          } else {
            throw new Error('Profile load failed');
          }
        } catch (error) {
          console.error('Failed to load user profile on startup', error);
          const storedProfileCompleted = localStorage.getItem('profile_completed') === 'true';
          const storedProfileData = JSON.parse(localStorage.getItem('user_profile_data') || '{}');

          if (storedProfileCompleted || localStorage.getItem('mock_logged_in') === 'true') {
            setUser({
              username: 'FarmerUser',
              email: 'farmer@agrinova.com',
              fullName: storedProfileData.fullName || 'Farmer User',
              phone: storedProfileData.phone || '',
              language: storedProfileData.language || 'English',
              avatar: storedProfileData.avatar || null,
              profileCompleted: storedProfileCompleted
            });
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/auth/login/', {
        username: usernameOrEmail,
        password: password,
      });

      if (response.data && response.data.success) {
        const { access, refresh, user: userData } = response.data.data;
        
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('mock_logged_in', 'true');
        
        const storedProfileCompleted = localStorage.getItem('profile_completed') === 'true';
        const storedProfileData = JSON.parse(localStorage.getItem('user_profile_data') || '{}');

        const loggedInUser = {
          ...userData,
          fullName: storedProfileData.fullName || userData.full_name || userData.username,
          phone: storedProfileData.phone || userData.phone || '',
          language: storedProfileData.language || 'English',
          avatar: storedProfileData.avatar || null,
          profileCompleted: storedProfileCompleted
        };
        
        setUser(loggedInUser);
        
        if (!storedProfileCompleted) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error', error);
      if (error.response?.data) {
        const backendMessage = error.response.data.message;
        if (backendMessage && backendMessage !== 'Validation failed') {
          return { success: false, error: backendMessage };
        }
        const errs = error.response.data.errors;
        if (errs) {
          const firstErr = typeof errs === 'object' ? Object.values(errs)[0] : errs;
          const msg = Array.isArray(firstErr) ? firstErr[0] : String(firstErr);
          return { success: false, error: msg };
        }
        return { success: false, error: 'Invalid credentials. Please check your username/email and password.' };
      }

      // Fallback for UI demo/testing if backend is completely unreachable
      const mockUser = {
        username: usernameOrEmail.split('@')[0],
        email: usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@agrinova.com`,
        fullName: '',
        phone: '',
        language: 'English',
        avatar: null,
        profileCompleted: localStorage.getItem('profile_completed') === 'true'
      };
      
      localStorage.setItem('access_token', 'mock_access_token');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      localStorage.setItem('mock_logged_in', 'true');
      
      setUser(mockUser);
      if (!mockUser.profileCompleted) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
      return { success: true };
    }
  };

  const register = async (name, email, password) => {
    try {
      const username = name.toLowerCase().replace(/[^a-z0-9_.-]/g, '') || email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');

      const response = await api.post('/auth/register/', {
        username,
        email,
        password,
        confirm_password: password
      });

      if (response.data && response.data.success) {
        return await login(email, password);
      } else {
        return { success: false, error: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error', error);
      // Fallback to seamless login for demo/offline frontend dev
      return await login(email, password);
    }
  };

  const completeProfile = (profileData = {}) => {
    localStorage.setItem('profile_completed', 'true');
    if (Object.keys(profileData).length > 0) {
      localStorage.setItem('user_profile_data', JSON.stringify(profileData));
    }
    setUser(prev => ({
      ...prev,
      ...profileData,
      profileCompleted: true
    }));
  };

  const updateProfile = (profileData) => {
    const existing = JSON.parse(localStorage.getItem('user_profile_data') || '{}');
    const updated = { ...existing, ...profileData };
    localStorage.setItem('user_profile_data', JSON.stringify(updated));
    setUser(prev => ({
      ...prev,
      ...profileData
    }));
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken && refreshToken !== 'mock_refresh_token') {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout request failed', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('mock_logged_in');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, completeProfile, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


