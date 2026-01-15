import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    renderCount.current += 1;

    // Log slow renders (> 16ms for 60fps)
    if (renderTime > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    // Store metrics for analysis
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now()
    };

    // Store in session storage for debugging
    if (process.env.NODE_ENV === 'development') {
      const existingMetrics = JSON.parse(
        sessionStorage.getItem('performance_metrics') || '[]'
      );
      existingMetrics.push(metrics);
      
      // Keep only last 100 entries
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      sessionStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
    }

    // Reset for next render
    renderStartTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current
  };
}

// Hook for measuring function execution time
export function useExecutionTime() {
  const measureExecution = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    label?: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${label || 'Function'} execution time: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  }, []);

  const measureAsyncExecution = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    label?: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${label || 'Async function'} execution time: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  }, []);

  return {
    measureExecution,
    measureAsyncExecution
  };
}

// Hook for monitoring memory usage
export function useMemoryMonitor() {
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const memoryInfo = checkMemoryUsage();
      if (memoryInfo && memoryInfo.usagePercentage > 80) {
        console.warn('High memory usage detected:', memoryInfo);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkMemoryUsage]);

  return { checkMemoryUsage };
}

// Hook for monitoring network performance
export function useNetworkMonitor() {
  const measureNetworkRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    label?: string
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await requestFn();
      const end = performance.now();
      const duration = end - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${label || 'Network request'} completed in ${duration.toFixed(2)}ms`);
      }
      
      // Log slow requests (> 1 second)
      if (duration > 1000) {
        console.warn(`Slow network request detected: ${label || 'Unknown'} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;
      
      console.error(`${label || 'Network request'} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }, []);

  return { measureNetworkRequest };
}

// Hook for FPS monitoring
export function useFPSMonitor() {
  const fpsRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        
        // Log low FPS
        if (fpsRef.current < 30) {
          console.warn(`Low FPS detected: ${fpsRef.current} fps`);
        }
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    if (process.env.NODE_ENV === 'development') {
      animationId = requestAnimationFrame(measureFPS);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return {
    fps: fpsRef.current
  };
}

// Utility function to get performance metrics
export function getPerformanceMetrics() {
  if (typeof window === 'undefined') return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Page load metrics
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // Paint metrics
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    
    // Connection info
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    
    // Memory info (if available)
    memory: 'memory' in performance ? (performance as any).memory : null
  };
}

// Performance budget checker
export function checkPerformanceBudget() {
  const metrics = getPerformanceMetrics();
  if (!metrics) return null;

  const budgets = {
    firstContentfulPaint: 1500, // 1.5s
    domContentLoaded: 2000,     // 2s
    loadComplete: 3000          // 3s
  };

  const violations = [];

  if (metrics.firstContentfulPaint > budgets.firstContentfulPaint) {
    violations.push(`First Contentful Paint: ${metrics.firstContentfulPaint}ms (budget: ${budgets.firstContentfulPaint}ms)`);
  }

  if (metrics.domContentLoaded > budgets.domContentLoaded) {
    violations.push(`DOM Content Loaded: ${metrics.domContentLoaded}ms (budget: ${budgets.domContentLoaded}ms)`);
  }

  if (metrics.loadComplete > budgets.loadComplete) {
    violations.push(`Load Complete: ${metrics.loadComplete}ms (budget: ${budgets.loadComplete}ms)`);
  }

  return {
    passed: violations.length === 0,
    violations,
    metrics
  };
}