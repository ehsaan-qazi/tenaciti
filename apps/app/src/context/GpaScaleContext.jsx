import React, { createContext, useContext, useSyncExternalStore, useMemo, useCallback } from 'react';
import {
  GRADE_SCALE,
  PERCENTAGE_THRESHOLDS,
  getMaxGPA,
  validateCustomScale,
  validateCustomThresholds,
} from '@tenaciti/shared';

/* =========================================================================
   GPA Scale Context — App
   
   Single source of truth for the active grade scale and percentage
   thresholds. Uses useSyncExternalStore for reactive localStorage updates.
   ========================================================================= */

const CUSTOM_SCALE_KEY = 'tenaciti_custom_gpa_scale';
const CUSTOM_THRESHOLDS_KEY = 'tenaciti_custom_pct_thresholds';

const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener);
    }
  };
}

function getCustomScaleSnapshot() {
  try {
    return localStorage.getItem(CUSTOM_SCALE_KEY);
  } catch {
    return null;
  }
}

function getCustomScaleServerSnapshot() {
  return null;
}

function getCustomThresholdsSnapshot() {
  try {
    return localStorage.getItem(CUSTOM_THRESHOLDS_KEY);
  } catch {
    return null;
  }
}

function getCustomThresholdsServerSnapshot() {
  return null;
}

const GpaScaleContext = createContext(null);

export function GpaScaleProvider({ children }) {
  const rawScale = useSyncExternalStore(
    subscribe,
    getCustomScaleSnapshot,
    getCustomScaleServerSnapshot
  );

  const rawThresholds = useSyncExternalStore(
    subscribe,
    getCustomThresholdsSnapshot,
    getCustomThresholdsServerSnapshot
  );

  const customScale = useMemo(() => {
    if (!rawScale) return null;
    try {
      const parsed = JSON.parse(rawScale);
      const { valid } = validateCustomScale(parsed);
      return valid ? parsed : null;
    } catch {
      return null;
    }
  }, [rawScale]);

  const customThresholds = useMemo(() => {
    if (!rawThresholds) return null;
    try {
      const parsed = JSON.parse(rawThresholds);
      const { valid } = validateCustomThresholds(parsed);
      return valid ? parsed : null;
    } catch {
      return null;
    }
  }, [rawThresholds]);

  const activeScale = customScale || GRADE_SCALE;
  const activeThresholds = customThresholds || PERCENTAGE_THRESHOLDS;
  const maxGPA = getMaxGPA(activeScale);

  const setCustomScale = useCallback((scale) => {
    if (scale === null) {
      localStorage.removeItem(CUSTOM_SCALE_KEY);
    } else {
      localStorage.setItem(CUSTOM_SCALE_KEY, JSON.stringify(scale));
    }
    emitChange();
  }, []);

  const setCustomThresholds = useCallback((thresholds) => {
    if (thresholds === null) {
      localStorage.removeItem(CUSTOM_THRESHOLDS_KEY);
    } else {
      localStorage.setItem(CUSTOM_THRESHOLDS_KEY, JSON.stringify(thresholds));
    }
    emitChange();
  }, []);

  return (
    <GpaScaleContext.Provider
      value={{
        activeScale,
        activeThresholds,
        maxGPA,
        customScale,
        customThresholds,
        isHydrated: true,
        setCustomScale,
        setCustomThresholds,
      }}
    >
      {children}
    </GpaScaleContext.Provider>
  );
}

/**
 * Consume the GPA scale context. Must be used within a <GpaScaleProvider>.
 */
export function useGpaScale() {
  const ctx = useContext(GpaScaleContext);
  if (!ctx) {
    throw new Error('useGpaScale() must be used within a <GpaScaleProvider>');
  }
  return ctx;
}

