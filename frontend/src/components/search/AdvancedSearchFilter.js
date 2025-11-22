import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from '../shared/hooks/useDebounce';
import SearchSuggestions from './SearchSuggestions';
import FilterPanel from './FilterPanel';

const AdvancedSearchFilter = React.memo(({
  onSearch,
  onFilterChange,
  placeholder = "جستجوی پیشرفته...",
  filters: availableFilters = [],
  initialQuery = '',
  searchDelay = 300,
  maxSuggestions = 5
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // استفاده از debounce برای جستجو
  const debouncedQuery = useDebounce(query, searchDelay);

  // جستجوی خودکار هنگام تغییر query
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, filters);
    }
  }, [debouncedQuery, filters]);

  // بارگذاری تاریخچه جستجو از localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const performSearch = useCallback(async (searchQuery, currentFilters) => {
    setIsLoading(true);
    
    try {
      // شبیه‌سازی جستجو
      const results = await mockSearchAPI(searchQuery, currentFilters);
      
      onSearch?.(results);
      
      // به‌روزرسانی تاریخچه جستجو
      if (searchQuery && !searchHistory.includes(searchQuery)) {
        const newHistory = [searchQuery, ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }
      
      // تولید پیشنهادات
      generateSuggestions(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      onSearch?.([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, searchHistory]);

  const generateSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    // شبیه‌سازی تولید پیشنهادات
    const mockSuggestions = [
      `${searchQuery} در کاربران`,
      `${searchQuery} در محصولات`,
      `${searchQuery} در مقالات`,
      `فیلتر ${searchQuery}`,
      `گزارش ${searchQuery}`
    ].slice(0, maxSuggestions);

    setSuggestions(mockSuggestions);
  }, [maxSuggestions]);

  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
      setSuggestions([]);
      onSearch?.([]);
    }
  }, [onSearch]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion);
    performSearch(suggestion, filters);
  }, [filters, performSearch]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
    
    if (query) {
      performSearch(query, newFilters);
    }
  }, [query, onFilterChange, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setSuggestions([]);
    onSearch?.([]);
  }, [onSearch]);

  // شبیه‌سازی API جستجو
  const mockSearchAPI = (searchQuery, currentFilters) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResults = Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          title: `نتیجه ${i + 1} برای "${searchQuery}"`,
          description: `این یک نتیجه نمونه برای جستجوی "${searchQuery}" است`,
          type: ['user', 'product', 'article'][i % 3],
          relevance: Math.random()
        })).sort((a, b) => b.relevance - a.relevance);
        
        resolve(mockResults);
      }, 500);
    });
  };

  return (
    <div className="advanced-search-filter">
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="search-input"
            aria-label="جستجوی پیشرفته"
          />
          
          {isLoading && (
            <div className="search-spinner" aria-label="در حال جستجو">
              🔄
            </div>
          )}
          
          {query && (
            <button
              className="clear-search-btn"
              onClick={clearSearch}
              aria-label="پاک کردن جستجو"
            >
              ✕
            </button>
          )}
        </div>

        <SearchSuggestions
          suggestions={suggestions}
          searchHistory={searchHistory}
          onSuggestionClick={handleSuggestionClick}
          onClearHistory={() => {
            setSearchHistory([]);
            localStorage.removeItem('searchHistory');
          }}
        />
      </div>

      {availableFilters.length > 0 && (
        <FilterPanel
          filters={availableFilters}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      <div className="search-stats">
        {query && (
          <span className="search-query-info">
            جستجو برای: "<strong>{query}</strong>"
          </span>
        )}
      </div>
    </div>
  );
});

AdvancedSearchFilter.displayName = 'AdvancedSearchFilter';

export default AdvancedSearchFilter;
