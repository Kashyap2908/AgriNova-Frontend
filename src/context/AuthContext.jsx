import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in by validating token or fetching profile
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/auth/profile/');
          if (response.data && response.data.success) {
            setUser({ ...response.data.data, profileCompleted: true });
          } else {
            throw new Error('Profile load failed');
          }
        } catch (error) {
          console.error('Failed to load user profile on startup', error);
          // Token is invalid/expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
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
        localStorage.setItem('profile_completed', 'true');
        
        const loggedInUser = { ...userData, profileCompleted: true };
        setUser(loggedInUser);
        navigate('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error', error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Auto-generate Django-compatible username from Full Name or email prefix
      const username = name.toLowerCase().replace(/[^a-z0-9_.-]/g, '') || email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');

      const response = await api.post('/auth/register/', {
        username,
        email,
        password,
        confirm_password: password
      });

      if (response.data && response.data.success) {
        // Automatically login user upon successful registration
        return await login(email, password);
      } else {
        return { success: false, error: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error', error);
      
      // Extract specific field errors if available
      let errorMessage = 'Registration failed. Please check inputs.';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstField = Object.keys(errors)[0];
        const firstErr = errors[firstField];
        errorMessage = Array.isArray(firstErr) ? firstErr[0] : firstErr;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const completeProfile = () => {
    localStorage.setItem('profile_completed', 'true');
    setUser(prev => ({ ...prev, profileCompleted: true }));
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout request failed', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('profile_completed');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, completeProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

