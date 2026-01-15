import React, { useState, useRef, useEffect, useCallback } from 'react';
import './OptimizedImage.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
  lazy?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  style,
  fallbackSrc,
  placeholder,
  lazy = true,
  quality = 85,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Start loading 50px before the image comes into view
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate optimized src with quality parameter if supported
  const optimizedSrc = useMemo(() => {
    if (!isInView) return '';
    
    // For external images, we can't optimize them, so return as-is
    if (src.startsWith('http')) {
      return src;
    }
    
    // For internal images, we could add quality parameters if the backend supports it
    // This is a placeholder for future optimization
    return src;
  }, [src, isInView]);

  const currentSrc = hasError && fallbackSrc ? fallbackSrc : optimizedSrc;

  return (
    <div 
      className={`optimized-image ${className} ${isLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''}`}
      style={{ width, height }}
    >
      {!isInView && placeholder && (
        <div className="image-placeholder">
          {placeholder}
        </div>
      )}
      
      {isInView && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`image ${isLoaded ? 'visible' : 'hidden'}`}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
      
      {!isLoaded && isInView && !hasError && (
        <div className="image-loading">
          <div className="loading-skeleton" />
        </div>
      )}
      
      {hasError && !fallbackSrc && (
        <div className="image-error">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          <span>Failed to load</span>
        </div>
      )}
    </div>
  );
}

// Hook for preloading images
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(url));
          resolve();
        };
        
        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(url));
          resolve();
        };
        
        img.src = url;
      });
    };

    // Preload all images
    Promise.all(urls.map(preloadImage));
  }, [urls]);

  return {
    loadedImages,
    failedImages,
    isLoaded: (url: string) => loadedImages.has(url),
    hasFailed: (url: string) => failedImages.has(url)
  };
}

// Progressive image component with blur-up effect
interface ProgressiveImageProps extends OptimizedImageProps {
  lowQualitySrc?: string;
  blurAmount?: number;
}

export function ProgressiveImage({
  lowQualitySrc,
  blurAmount = 10,
  ...props
}: ProgressiveImageProps) {
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);

  return (
    <div className="progressive-image">
      {lowQualitySrc && (
        <OptimizedImage
          {...props}
          src={lowQualitySrc}
          className={`low-quality ${props.className || ''}`}
          style={{
            filter: `blur(${blurAmount}px)`,
            transform: 'scale(1.1)', // Slightly scale to hide blur edges
          }}
          onLoad={() => setLowQualityLoaded(true)}
          lazy={false} // Load low quality immediately
        />
      )}
      
      <OptimizedImage
        {...props}
        className={`high-quality ${props.className || ''} ${lowQualityLoaded ? 'fade-in' : ''}`}
      />
    </div>
  );
}

function useMemo<T>(factory: () => T, deps: React.DependencyList | undefined): T {
  const ref = useRef<{ deps: React.DependencyList | undefined; value: T } | undefined>(undefined);
  
  if (!ref.current || !depsEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }
  
  return ref.current.value;
}

function depsEqual(a: React.DependencyList | undefined, b: React.DependencyList | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}