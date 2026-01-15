import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import './VirtualizedGrid.css';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  itemWidth?: number;
  gap?: number;
  overscan?: number;
  className?: string;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemHeight = 200,
  itemWidth = 280,
  gap = 16,
  overscan = 5,
  className = '',
  loading = false,
  loadingComponent,
  emptyComponent,
  onLoadMore,
  hasNextPage = false
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const { isMobile, isTablet } = useResponsive();

  // Adjust item dimensions for mobile
  const adjustedItemWidth = useMemo(() => {
    if (isMobile) return Math.min(itemWidth, containerSize.width - gap * 2);
    if (isTablet) return Math.min(itemWidth * 0.9, containerSize.width / 2 - gap);
    return itemWidth;
  }, [itemWidth, containerSize.width, gap, isMobile, isTablet]);

  const adjustedItemHeight = useMemo(() => {
    if (isMobile) return itemHeight * 0.9;
    return itemHeight;
  }, [itemHeight, isMobile]);

  // Calculate grid dimensions
  const { columnsPerRow, totalRows, visibleRange } = useMemo(() => {
    if (containerSize.width === 0) {
      return { columnsPerRow: 1, totalRows: 0, visibleRange: { start: 0, end: 0 } };
    }

    const availableWidth = containerSize.width - gap;
    const columnsPerRow = Math.max(1, Math.floor(availableWidth / (adjustedItemWidth + gap)));
    const totalRows = Math.ceil(items.length / columnsPerRow);
    
    const rowHeight = adjustedItemHeight + gap;
    const visibleRows = Math.ceil(containerSize.height / rowHeight);
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(totalRows, startRow + visibleRows + overscan * 2);

    return {
      columnsPerRow,
      totalRows,
      visibleRange: {
        start: startRow * columnsPerRow,
        end: Math.min(items.length, endRow * columnsPerRow)
      }
    };
  }, [containerSize, adjustedItemWidth, adjustedItemHeight, gap, items.length, scrollTop, overscan]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);

    // Load more when near bottom
    if (onLoadMore && hasNextPage && !loading) {
      const { scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      if (scrollPercentage > 0.8) {
        onLoadMore();
      }
    }
  }, [onLoadMore, hasNextPage, loading]);

  // Generate visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      if (i >= items.length) break;
      
      const row = Math.floor(i / columnsPerRow);
      const col = i % columnsPerRow;
      const x = col * (adjustedItemWidth + gap) + gap;
      const y = row * (adjustedItemHeight + gap) + gap;
      
      items_to_render.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute' as const,
          left: x,
          top: y,
          width: adjustedItemWidth,
          height: adjustedItemHeight,
        }
      });
    }
    
    return items_to_render;
  }, [items, visibleRange, columnsPerRow, adjustedItemWidth, adjustedItemHeight, gap]);

  // Total height for scrolling
  const totalHeight = totalRows * (adjustedItemHeight + gap) + gap;

  if (items.length === 0 && !loading) {
    return (
      <div className={`virtualized-grid empty ${className}`}>
        {emptyComponent || (
          <div className="empty-state">
            <p>No items to display</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtualized-grid ${className}`}
      onScroll={handleScroll}
    >
      <div
        className="virtualized-grid-content"
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style} className="virtualized-grid-item">
            {renderItem(item, index)}
          </div>
        ))}
        
        {loading && (
          <div className="virtualized-grid-loading">
            {loadingComponent || <div className="loading-spinner">Loading...</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for infinite scrolling
export function useInfiniteScroll<T>(
  initialItems: T[],
  fetchMore: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
  pageSize: number = 20
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    try {
      const result = await fetchMore(page);
      setItems(prev => [...prev, ...result.items]);
      setHasNextPage(result.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, loading, hasNextPage]);

  const reset = useCallback((newItems: T[] = []) => {
    setItems(newItems);
    setPage(1);
    setHasNextPage(true);
    setLoading(false);
  }, []);

  return {
    items,
    loading,
    hasNextPage,
    loadMore,
    reset
  };
}