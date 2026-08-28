'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  GRADE_SCALE,
  LETTER_GRADES,
  PERCENTAGE_THRESHOLDS,
  getMaxGPA,
  validateCustomScale,
  validateCustomThresholds,
} from '@tenaciti/shared';

/* =========================================================================
   GPA Scale Context — Website (SSR-safe)
   
   Single source of truth for the active grade scale and percentage
   thresholds. All GPA calculator sub-components consume this context
   instead of calling independent hooks.
   
   Key design choice: localStorage reads are deferred to useEffect so
   the initial render matches between server and client (both start with
   the default HEC 4.0 scale), eliminating React hydration mismatches.
   ========================================================================= */

const CUSTOM_SCALE_KEY = 'tenaciti_custom_gpa_scale';
const CUSTOM_THRESHOLDS_KEY = 'tenaciti_custom_pct_thresholds';

interface GpaScaleContextValue {
  activeScale: Record<string, number>;
  activeThresholds: [number, string][];
  maxGPA: number;
  customScale: Record<string, number> | null;
  customThresholds: [number, string][] | null;
  isHydrated: boolean;
  setCustomScale: (scale: Record<string, number> | null) => void;
  setCustomThresholds: (thresholds: [number, string][] | null) => void;
}

const GpaScaleContext = createContext<GpaScaleContextValue | null>(null);

export function GpaScaleProvider({ children }: { children: ReactNode }) {
  // Start with defaults so SSR and first client render match
  const [customScale, setCustomScaleState] = useState<Record<string, number> | null>(null);
  const [customThresholds, setCustomThresholdsState] = useState<[number, string][] | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage ONLY after mount (client-side)
  useEffect(() => {
    try {
      const storedScale = localStorage.getItem(CUSTOM_SCALE_KEY);
      if (storedScale) {
        const parsed = JSON.parse(storedScale);
        const { valid } = validateCustomScale(parsed);
        if (valid) setCustomScaleState(parsed);
      }
    } catch { /* ignore malformed data */ }

    try {
      const storedThresholds = localStorage.getItem(CUSTOM_THRESHOLDS_KEY);
      if (storedThresholds) {
        const parsed = JSON.parse(storedThresholds);
        const { valid } = validateCustomThresholds(parsed);
        if (valid) setCustomThresholdsState(parsed);
      }
    } catch { /* ignore malformed data */ }

    setIsHydrated(true);
  }, []);

  const activeScale: Record<string, number> = customScale || GRADE_SCALE;
  const activeThresholds: [number, string][] = customThresholds || (PERCENTAGE_THRESHOLDS as [number, string][]);
  const maxGPA = getMaxGPA(activeScale);

  const setCustomScale = useCallback((scale: Record<string, number> | null) => {
    if (scale === null) {
      localStorage.removeItem(CUSTOM_SCALE_KEY);
      setCustomScaleState(null);
    } else {
      localStorage.setItem(CUSTOM_SCALE_KEY, JSON.stringify(scale));
      setCustomScaleState(scale);
    }
  }, []);

  const setCustomThresholds = useCallback((thresholds: [number, string][] | null) => {
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
export function useGpaScale(): GpaScaleContextValue {
  const ctx = useContext(GpaScaleContext);
  if (!ctx) {
    throw new Error('useGpaScale() must be used within a <GpaScaleProvider>');
  }
  return ctx;
}
