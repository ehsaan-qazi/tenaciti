import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
   thresholds. All GPA calculator sub-components consume this context
   instead of calling independent hooks.
   
   The app is a client-side SPA so hydration isn't a concern, but we
   still defer localStorage reads to useEffect for consistency and to
   avoid issues if the app ever moves to SSR.
   ========================================================================= */

const CUSTOM_SCALE_KEY = 'tenaciti_custom_gpa_scale';
const CUSTOM_THRESHOLDS_KEY = 'tenaciti_custom_pct_thresholds';

const GpaScaleContext = createContext(null);

export function GpaScaleProvider({ children }) {
  const [customScale, setCustomScaleState] = useState(null);
  const [customThresholds, setCustomThresholdsState] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage after mount
  useEffect(() => {
    try {
      const storedScale = localStorage.getItem(CUSTOM_SCALE_KEY);
      if (storedScale) {
        const parsed = JSON.parse(storedScale);
        const { valid } = validateCustomScale(parsed);
        if (valid) setCustomScaleState(parsed);
      }
    } catch { /* ignore */ }

    try {
      const storedThresholds = localStorage.getItem(CUSTOM_THRESHOLDS_KEY);
      if (storedThresholds) {
        const parsed = JSON.parse(storedThresholds);
        const { valid } = validateCustomThresholds(parsed);
        if (valid) setCustomThresholdsState(parsed);
      }
    } catch { /* ignore */ }

    setIsHydrated(true);
  }, []);

  const activeScale = customScale || GRADE_SCALE;
  const activeThresholds = customThresholds || PERCENTAGE_THRESHOLDS;
  const maxGPA = getMaxGPA(activeScale);

  const setCustomScale = useCallback((scale) => {
    if (scale === null) {
      localStorage.removeItem(CUSTOM_SCALE_KEY);
      setCustomScaleState(null);
    } else {
      localStorage.setItem(CUSTOM_SCALE_KEY, JSON.stringify(scale));
      setCustomScaleState(scale);
    }
  }, []);

  const setCustomThresholds = useCallback((thresholds) => {
    if (thresholds === null) {
      localStorage.removeItem(CUSTOM_THRESHOLDS_KEY);
      setCustomThresholdsState(null);
    } else {
      localStorage.setItem(CUSTOM_THRESHOLDS_KEY, JSON.stringify(thresholds));
      setCustomThresholdsState(thresholds);
    }
  }, []);

  return (
    <GpaScaleContext.Provider
      value={{
        activeScale,
        activeThresholds,
        maxGPA,
        customScale,
        customThresholds,
        isHydrated,
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
