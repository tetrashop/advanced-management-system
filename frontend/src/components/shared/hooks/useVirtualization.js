import { useState, useEffect, useRef, useMemo } from 'react';

export const useVirtualization = (items, itemHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    container.addEventListener('scroll', handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.unobserve(container);
    };
  }, []);

  const virtualizedItems = useMemo(() => {
    if (!containerHeight) return [];

    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length, visibleEnd + overscan);

    return items.slice(start, end).map((item, index) => ({
      ...item,
      virtualIndex: start + index,
      offsetTop: (start + index) * itemHeight
    }));
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems: virtualizedItems,
    containerRef,
    totalHeight,
    scrollTop
  };
};

export default useVirtualization;
