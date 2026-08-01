import React, { useState, useEffect } from 'react';
import api, { fetchUserProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Unified mapper function to create single user object
  const mapUserData = (profileData) => {
    if (!profileData) return null;
    const isCompleted = Boolean(profileData.profile_completed);
    return {
      id: profileData.user_id || profileData.id,
      username: profileData.username || '',
      email: profileData.email || '',
      full_name: profileData.full_name || profileData.fullName || '',
      phone_number: profileData.phone_number || profileData.phone || '',
      preferred_language: profileData.preferred_language || profileData.language || 'English',
      profile_photo: profileData.profile_photo || profileData.avatar || null,
      profile_completed: isCompleted,
      // Field aliases for compatibility with UI components
      fullName: profileData.full_name || profileData.fullName || '',
      phone: profileData.phone_number || profileData.phone || '',
      language: profileData.preferred_language || profileData.language || 'English',
      avatar: profileData.profile_photo || profileData.avatar || null,
      profileCompleted: isCompleted
    };
  };

  // Fetch and update user profile from SQLite backend
  const refreshUserProfile = async () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const res = await fetchUserProfile();
      const profileData = res?.data || res;
      if (profileData) {
        const mappedUser = mapUserData(profileData);
        setUser(mappedUser);
        return mappedUser;
      }
    } catch (error) {
      console.error('Failed to load user profile from backend', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      setUser(null);
    }
    return null;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (token) {
        await refreshUserProfile();
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail, password, rememberMe = true) => {
    try {
      const response = await api.post('/auth/login/', {
        username: usernameOrEmail,
        password: password,
      });

      if (response.data && response.data.success) {
        const { access, refresh } = response.data.data;
        
        if (rememberMe) {
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
        } else {
          sessionStorage.setItem('access_token', access);
          sessionStorage.setItem('refresh_token', refresh);
        }
        
        // Load clean profile from GET /api/profile/ (SQLite source of truth)
        const loggedInUser = await refreshUserProfile();

        if (loggedInUser) {
          if (!loggedInUser.profile_completed) {
            navigate('/complete-profile');
          } else {
            navigate('/dashboard');
          }
          return { success: true };
        } else {
          return { success: false, error: 'Failed to retrieve profile after login' };
        }
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
      }
      return { success: false, error: 'Invalid credentials. Please check your username/email and password.' };
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
      }
      return { success: false, error: 'Registration failed. Please check your input fields.' };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout request failed', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
