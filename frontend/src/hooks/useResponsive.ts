import { useState, useEffect, useMemo } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type BreakpointKey = keyof BreakpointConfig;

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  currentBreakpoint: BreakpointKey;
  isPortrait: boolean;
  isLandscape: boolean;
  isTouchDevice: boolean;
}

export function useResponsive(breakpoints: Partial<BreakpointConfig> = {}): ResponsiveState {
  const config = useMemo(() => ({ ...defaultBreakpoints, ...breakpoints }), [breakpoints]);
  
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: false,
        currentBreakpoint: 'lg' as BreakpointKey,
        isPortrait: false,
        isLandscape: true,
        isTouchDevice: false,
      };
    }

    return getResponsiveState(window.innerWidth, window.innerHeight, config);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setState(getResponsiveState(window.innerWidth, window.innerHeight, config));
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [config]);

  return state;
}

function getResponsiveState(width: number, height: number, config: BreakpointConfig): ResponsiveState {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isPortrait = height > width;
  const isLandscape = width >= height;

  let currentBreakpoint: BreakpointKey = 'xs';
  if (width >= config['2xl']) currentBreakpoint = '2xl';
  else if (width >= config.xl) currentBreakpoint = 'xl';
  else if (width >= config.lg) currentBreakpoint = 'lg';
  else if (width >= config.md) currentBreakpoint = 'md';
  else if (width >= config.sm) currentBreakpoint = 'sm';

  return {
    width,
    height,
    isMobile: width < config.md,
    isTablet: width >= config.md && width < config.lg,
    isDesktop: width >= config.lg,
    isLargeDesktop: width >= config.xl,
    currentBreakpoint,
    isPortrait,
    isLandscape,
    isTouchDevice,
  };
}

// Hook for checking specific breakpoints
export function useBreakpoint(breakpoint: BreakpointKey, breakpoints?: Partial<BreakpointConfig>): boolean {
  const { currentBreakpoint } = useResponsive(breakpoints);
  
  const breakpointOrder: BreakpointKey[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const targetIndex = breakpointOrder.indexOf(breakpoint);
  
  return currentIndex >= targetIndex;
}

// Hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// Predefined media query hooks
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)');
}
