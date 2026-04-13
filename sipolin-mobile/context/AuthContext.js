import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenManager, usersAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignout, setIsSignout] = useState(false);

  // Cek status login saat aplikasi pertama kali dibuka
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await tokenManager.getToken();
        if (savedToken) {
          setToken(savedToken);
          const response = await usersAPI.getProfile();
          setUser(response.data);
        }
      } catch (e) {
        console.error('[Auth] Error checking token or fetching profile:', e);
        // Token mungkin expired — bersihkan state
        await tokenManager.removeToken();
        setToken(null);
        setUser(null);
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

    // ── LOGIN
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
          error: error.response?.data?.error || 'Login gagal. Periksa email & password.',
        };
      }
    },

    // ── REGISTER — mendukung Mahasiswa & Mitra Driver
    /**
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @param {string} nim
     * @param {string} phone
     * @param {string} role          - 'user' | 'driver'
     * @param {string} [plateNumber] - Wajib jika role === 'driver'
     * @param {string} [vehicleDetail] - Wajib jika role === 'driver'
     */
    signUp: async (
      email,
      password,
      name,
      nim,
      phone,
      role = 'user',
      plateNumber = null,
      vehicleDetail = null
    ) => {
      try {
        const response = await authAPI.register(
          email,
          password,
          name,
          nim,
          phone,
          role,
          plateNumber,
          vehicleDetail
        );
        const { token, user } = response.data;

        await tokenManager.setToken(token);
        setToken(token);
        setUser(user);
        setIsSignout(false);

        return { success: true, user };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || 'Pendaftaran gagal. Coba lagi.',
        };
      }
    },

    // ── LOGOUT
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

    // ── UPDATE LOCAL USER (setelah edit profil)
    updateUser: (updatedUser) => {
      setUser((prev) => ({ ...prev, ...updatedUser }));
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