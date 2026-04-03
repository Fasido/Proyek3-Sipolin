import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenManager, usersAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignout, setIsSignout] = useState(false);

  // Cek status login saat aplikasi pertama kali dibuka
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await tokenManager.getToken();
        if (savedToken) {
          setToken(savedToken);
          // AMBIL PROFIL: Biar pas buka aplikasi, nama user langsung muncul
          const response = await usersAPI.getProfile();
          setUser(response.data);
        }
      } catch (e) {
        console.error('[Auth] Error checking token or fetching profile:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    user,
    token,
    isLoading,
    isSignout,
    
    // FUNGSI LOGIN
    signIn: async (email, password) => {
      try {
        const response = await authAPI.login(email, password);
        const { token, user } = response.data;

        await tokenManager.setToken(token);
        setToken(token);
        setUser(user);
        setIsSignout(false);

        return { success: true, user };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Login failed',
        };
      }
    },

    // FUNGSI REGISTER (Versi Lengkap dengan NIM & ROLE)
    signUp: async (email, password, name, nim, phone, role = 'user') => {
      try {
        const response = await authAPI.register(email, password, name, nim, phone, role);
        const { token, user } = response.data;

        await tokenManager.setToken(token);
        setToken(token);
        setUser(user);
        setIsSignout(false);

        return { success: true, user };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Registration failed',
        };
      }
    },

    // FUNGSI LOGOUT
    signOut: async () => {
      try {
        await tokenManager.removeToken();
        setToken(null);
        setUser(null);
        setIsSignout(true);
      } catch (error) {
        console.error('[Auth] Error signing out:', error);
      }
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};