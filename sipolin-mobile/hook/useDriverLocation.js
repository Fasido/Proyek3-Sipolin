/**
 * hooks/useDriverLocation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook for DRIVER mode.
 * • Requests foreground location permission
 * • Watches GPS with high accuracy via expo-location
 * • Throttles backend sync to once every SEND_INTERVAL_MS (default 5 s)
 * • Decoupled from UI — drop into any driver screen with a single line
 *
 * Usage:
 *   const { isTracking, isOnline, lastCoords, error } = useDriverLocation({ enabled: isActiveTrip });
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { AppState }  from 'react-native';
import { usersAPI }  from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const SEND_INTERVAL_MS  = 5_000;  // Sync to backend every 5 s
const WATCH_INTERVAL_MS = 2_000;  // Local GPS sample every 2 s
const DISTANCE_FILTER_M = 5;      // Only fire if moved > 5 m (battery saver)

const LOCATION_OPTIONS = {
  accuracy:         Location.Accuracy.High,
  timeInterval:     WATCH_INTERVAL_MS,
  distanceInterval: DISTANCE_FILTER_M,
  mayShowUserSettingsDialog: true,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * @param {{ enabled: boolean }} options
 *   enabled — set to true when driver has an active trip.
 *             Set to false to stop broadcasting (e.g. trip completed).
 */
export const useDriverLocation = ({ enabled = false } = {}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastCoords, setLastCoords] = useState(null); // { latitude, longitude, accuracy, heading }
  const [error, setError]           = useState(null);
  const [isOnline, setIsOnline]     = useState(false); // true = server confirmed last send

  const watchRef    = useRef(null); // Location.LocationSubscription
  const sendTimer   = useRef(null); // setInterval handle
  const latestCoord = useRef(null); // buffer: most recent GPS fix to send
  const appState    = useRef(AppState.currentState);

  // ── Send buffered coordinate to backend ───────────────────────────────────
  const flushLocation = useCallback(async () => {
    if (!latestCoord.current) return;
    const { latitude, longitude } = latestCoord.current;
    try {
      await usersAPI.updateLocation({ latitude, longitude });
      setIsOnline(true);
    } catch (err) {
      console.warn('[useDriverLocation] Sync failed:', err?.message);
      setIsOnline(false);
    }
  }, []);

  // ── Start watching GPS ────────────────────────────────────────────────────
  const startTracking = useCallback(async () => {
    setError(null);

    // 1. Permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Izin lokasi ditolak. Aktifkan di Pengaturan.');
      return;
    }

    // 2. Watch
    watchRef.current = await Location.watchPositionAsync(
      LOCATION_OPTIONS,
      (loc) => {
        const coords = {
          latitude:  loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy:  loc.coords.accuracy,
          heading:   loc.coords.heading,
          speed:     loc.coords.speed,
        };
        latestCoord.current = coords;
        setLastCoords(coords);
      }
    );

    // 3. Throttled send loop
    sendTimer.current = setInterval(flushLocation, SEND_INTERVAL_MS);

    setIsTracking(true);
  }, [flushLocation]);

  // ── Stop watching GPS ─────────────────────────────────────────────────────
  const stopTracking = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
    clearInterval(sendTimer.current);
    sendTimer.current  = null;
    latestCoord.current = null;
    setIsTracking(false);
    setIsOnline(false);
  }, []);

  // ── Main effect: start/stop based on `enabled` ────────────────────────────
  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }
    return stopTracking;
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pause when app is backgrounded, resume on foreground ─────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (!enabled) return;
      if (appState.current === 'active' && nextState.match(/inactive|background/)) {
        // App went to background — stop GPS (respect battery)
        stopTracking();
      } else if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // App returned to foreground — resume
        startTracking();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [enabled, startTracking, stopTracking]);

  return {
    isTracking,  // bool — GPS watch is active
    isOnline,    // bool — last backend sync succeeded
    lastCoords,  // { latitude, longitude, accuracy, heading, speed } | null
    error,       // string | null
  };
};