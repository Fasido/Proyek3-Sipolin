import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, tokenManager, usersAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignout, setIsSignout] = useState(false);

  // ── Bootstrap: cek token & load profil saat app dibuka ──────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedToken = await tokenManager.getToken();
        if (savedToken) {
          setToken(savedToken);
          const response = await usersAPI.getProfile();
          setUser(response.data);
        }
      } catch (e) {
        console.error('[Auth] Bootstrap error:', e);
        await tokenManager.removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  // ─── LOGIN ────────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    try {
      const response         = await authAPI.login(email, password);
      const { token, user }  = response.data;

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
  }, []);

  // ─── REGISTER ─────────────────────────────────────────────────────────────────
  /**
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @param {string} nim
   * @param {string} phone
   * @param {'user'|'driver'} role
   * @param {string|null} plateNumber
   * @param {string|null} vehicleDetail
   */
  const signUp = useCallback(async (
    email, password, name, nim, phone,
    role = 'user', plateNumber = null, vehicleDetail = null
  ) => {
    try {
      const response        = await authAPI.register(email, password, name, nim, phone, role, plateNumber, vehicleDetail);
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
  }, []);

  // ─── LOGOUT ───────────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await tokenManager.removeToken();
    } catch (_) {}
    setToken(null);
    setUser(null);
    setIsSignout(true);
  }, []);

  // ─── UPDATE BASIC PROFILE (name, phone, nim) ──────────────────────────────────
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => prev ? { ...prev, ...updatedFields } : prev);
  }, []);

  // ─── UPDATE PROFILE PICTURE — Optimistic UI ───────────────────────────────────
  /**
   * 1. Immediately reflects the new image in the UI (optimistic update).
   * 2. Sends the image to the backend.
   * 3. On success → confirms with the server's canonical value.
   * 4. On failure  → rolls back to the previous picture.
   *
   * @param {string} imageData — base64 data URI or HTTPS URL
   * @returns {{ success: boolean, profilePicture?: string, error?: string }}
   */
  const updateProfilePicture = useCallback(async (imageData) => {
    // Capture previous state for rollback
    const previousPicture = user?.profilePicture ?? null;

    // ── Optimistic update ──
    setUser((prev) => prev ? { ...prev, profilePicture: imageData } : prev);

    try {
      const response          = await usersAPI.updateProfilePicture(imageData);
      const { profilePicture: confirmed } = response.data;

      // Confirm with server's canonical value (they may differ if CDN re-hosts)
      setUser((prev) => prev ? { ...prev, profilePicture: confirmed } : prev);

      return { success: true, profilePicture: confirmed };
    } catch (error) {
      // ── Rollback ──
      setUser((prev) => prev ? { ...prev, profilePicture: previousPicture } : prev);

      return {
        success: false,
        error: error.response?.data?.error || 'Gagal mengupload foto. Coba lagi.',
      };
    }
  }, [user?.profilePicture]);

  // ─── REMOVE PROFILE PICTURE ───────────────────────────────────────────────────
  const removeProfilePicture = useCallback(async () => {
    const previous = user?.profilePicture ?? null;
    setUser((prev) => prev ? { ...prev, profilePicture: null } : prev);

    try {
      await usersAPI.removeProfilePicture();
      return { success: true };
    } catch (error) {
      setUser((prev) => prev ? { ...prev, profilePicture: previous } : prev);
      return { success: false, error: error.response?.data?.error || 'Gagal menghapus foto.' };
    }
  }, [user?.profilePicture]);

  // ─── Context Value ────────────────────────────────────────────────────────────
  const value = {
    user,
    token,
    isLoading,
    isSignout,
    signIn,
    signUp,
    signOut,
    updateUser,
    updateProfilePicture,
    removeProfilePicture,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};