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
    const token = localStorage.getItem('access_token');
    const profileCompleted = localStorage.getItem('profile_completed') === 'true';
    if (token) {
      setUser({ username: 'Farmer User', id: 1, profileCompleted });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Mock Data
      const access = 'mock_access_token';
      const refresh = 'mock_refresh_token';
      
      // Assume a fresh login has a completed profile for returning users, 
      // but let's default to whatever is in localStorage or false for demo purposes.
      const profileCompleted = localStorage.getItem('profile_completed') === 'true';
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser({ username, profileCompleted });
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login error', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (username, password) => {
    try {
      // New users definitely haven't completed their profile
      localStorage.setItem('profile_completed', 'false');
      return await login(username, password);
    } catch (error) {
      console.error('Registration error', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const completeProfile = () => {
    localStorage.setItem('profile_completed', 'true');
    setUser(prev => ({ ...prev, profileCompleted: true }));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, completeProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
