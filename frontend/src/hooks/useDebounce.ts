import { useState, useEffect, useRef, useCallback } from 'react';

// Basic debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps?: React.DependencyList
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);
  const depsList = deps ?? [];

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...depsList]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Throttle hook
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps?: React.DependencyList
): T {
  const lastRan = useRef<number>(0);
  const callbackRef = useRef(callback);
  const depsList = deps ?? [];

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...depsList]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRan.current >= limit) {
        callbackRef.current(...args);
        lastRan.current = now;
      }
    },
    [limit]
  ) as T;

  return throttledCallback;
}

// Advanced debounced search hook with loading state
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 300,
  minLength: number = 2
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, delay);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minLength) {
      setResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const result = await searchFn(searchQuery);
      
      // Only update if this request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setResults(result);
        setLoading(false);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setLoading(false);
      }
    }
  }, [searchFn, minLength]);

  // Trigger search when debounced query changes
  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setLoading(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults,
    hasQuery: query.length >= minLength
  };
}
