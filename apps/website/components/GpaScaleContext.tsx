'use client';

import React, { createContext, useContext, useSyncExternalStore, useMemo, useCallback, type ReactNode } from 'react';
import {
  GRADE_SCALE,
  PERCENTAGE_THRESHOLDS,
  getMaxGPA,
  validateCustomScale,
  validateCustomThresholds,
} from '@tenaciti/shared';

/* =========================================================================
   GPA Scale Context — Website (SSR-safe)
   
   Single source of truth for the active grade scale and percentage
   thresholds. Uses useSyncExternalStore to synchronize localStorage
   without triggering SSR hydration mismatches or cascading render lint errors.
   ========================================================================= */

const CUSTOM_SCALE_KEY = 'tenaciti_custom_gpa_scale';
const CUSTOM_THRESHOLDS_KEY = 'tenaciti_custom_pct_thresholds';

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
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

function getCustomScaleSnapshot(): string | null {
  try {
    return localStorage.getItem(CUSTOM_SCALE_KEY);
  } catch {
    return null;
  }
}

function getCustomScaleServerSnapshot(): string | null {
  return null;
}

function getCustomThresholdsSnapshot(): string | null {
  try {
    return localStorage.getItem(CUSTOM_THRESHOLDS_KEY);
  } catch {
    return null;
  }
}

function getCustomThresholdsServerSnapshot(): string | null {
  return null;
}

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
      return valid ? (parsed as [number, string][]) : null;
    } catch {
      return null;
    }
  }, [rawThresholds]);

  const activeScale: Record<string, number> = customScale || GRADE_SCALE;
  const activeThresholds: [number, string][] = customThresholds || (PERCENTAGE_THRESHOLDS as [number, string][]);
  const maxGPA = getMaxGPA(activeScale);

  const setCustomScale = useCallback((scale: Record<string, number> | null) => {
    if (scale === null) {
      localStorage.removeItem(CUSTOM_SCALE_KEY);
    } else {
      localStorage.setItem(CUSTOM_SCALE_KEY, JSON.stringify(scale));
    }
    emitChange();
  }, []);

  const setCustomThresholds = useCallback((thresholds: [number, string][] | null) => {
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
export function useGpaScale(): GpaScaleContextValue {
  const ctx = useContext(GpaScaleContext);
  if (!ctx) {
    throw new Error('useGpaScale() must be used within a <GpaScaleProvider>');
  }
  return ctx;
}

