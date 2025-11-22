import React, { useEffect, useRef } from 'react';

const SearchSuggestions = React.memo(({
  suggestions = [],
  searchHistory = [],
  onSuggestionClick,
  onClearHistory,
  maxHistory = 5,
  maxSuggestions = 5,
  isLoading = false
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        // اگر نیاز به بستن suggestions در کلیک خارج بود، اینجا مدیریت شود
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick?.(suggestion);
  };

  const handleClearHistory = () => {
    onClearHistory?.();
  };

  const hasSuggestions = suggestions.length > 0;
  const hasHistory = searchHistory.length > 0;
  const showSuggestions = hasSuggestions || hasHistory;

  if (!showSuggestions && !isLoading) {
    return null;
  }

  return (
    <div className="search-suggestions" ref={containerRef}>
      <div className="suggestions-container">
        {/* پیشنهادات جستجو */}
        {hasSuggestions && (
          <div className="suggestions-section">
            <div className="section-header">
              <span className="section-title">پیشنهادات جستجو</span>
            </div>
            <ul className="suggestions-list">
              {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                <li key={index} className="suggestion-item">
                  <button
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    type="button"
                  >
                    <span className="suggestion-icon">🔍</span>
                    <span className="suggestion-text">{suggestion}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* تاریخچه جستجو */}
        {hasHistory && (
          <div className="suggestions-section">
            <div className="section-header">
              <span className="section-title">تاریخچه جستجو</span>
              <button
                className="clear-history-button"
                onClick={handleClearHistory}
                type="button"
                aria-label="پاک کردن تاریخچه"
              >
                پاک کردن
              </button>
            </div>
            <ul className="suggestions-list">
              {searchHistory.slice(0, maxHistory).map((historyItem, index) => (
                <li key={index} className="suggestion-item">
                  <button
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(historyItem)}
                    type="button"
                  >
                    <span className="suggestion-icon">🕒</span>
                    <span className="suggestion-text">{historyItem}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* حالت لودینگ */}
        {isLoading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <span className="loading-text">در حال جستجو...</span>
          </div>
        )}

        {/* پیام عدم یافتن */}
        {!hasSuggestions && !hasHistory && !isLoading && (
          <div className="no-results-section">
            <span className="no-results-text">پیشنهادی یافت نشد</span>
          </div>
        )}
      </div>
    </div>
  );
});

SearchSuggestions.displayName = 'SearchSuggestions';

export default SearchSuggestions;
