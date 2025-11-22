import React, { useState, useCallback } from 'react';

const TableToolbar = React.memo(({
  selectedCount = 0,
  totalCount = 0,
  filters = {},
  onFilterChange,
  onSelectAll,
  allSelected = false,
  availableActions = [],
  onAction,
  searchPlaceholder = "جستجو در جدول..."
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setLocalSearch(value);
    onFilterChange?.({ ...filters, search: value });
  }, [filters, onFilterChange]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) delete newFilters[key];
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    setLocalSearch('');
    onFilterChange?.({});
  }, [onFilterChange]);

  const handleAction = useCallback((action) => {
    onAction?.(action, Array.from({ length: selectedCount }, (_, i) => i));
  }, [selectedCount, onAction]);

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="table-toolbar">
      <div className="toolbar-left">
        {/* انتخاب گروهی */}
        {selectedCount > 0 && (
          <div className="selection-info">
            <span className="selected-count">
              {selectedCount} مورد انتخاب شده
            </span>
            <div className="selection-actions">
              {availableActions.map(action => (
                <button
                  key={action.id}
                  className="action-btn"
                  onClick={() => handleAction(action.id)}
                  disabled={action.disabled}
                >
                  {action.icon && <span className="action-icon">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* اطلاعات کل */}
        {selectedCount === 0 && (
          <div className="total-info">
            <span className="total-count">
              کل: {totalCount} مورد
            </span>
          </div>
        )}
      </div>

      <div className="toolbar-right">
        {/* جستجو */}
        <div className="search-container">
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="search-input"
          />
          {localSearch && (
            <button
              className="clear-search"
              onClick={() => handleSearchChange({ target: { value: '' } })}
              aria-label="پاک کردن جستجو"
            >
              ✕
            </button>
          )}
        </div>

        {/* فیلترها */}
        <div className="filter-container">
          <button
            className={`filter-toggle ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-label="مدیریت فیلترها"
          >
            🎚️
            {hasActiveFilters && (
              <span className="filter-badge">
                {Object.keys(filters).length}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="filter-dropdown">
              <div className="filter-header">
                <h4>فیلترها</h4>
                {hasActiveFilters && (
                  <button
                    className="clear-filters-btn"
                    onClick={clearAllFilters}
                  >
                    پاک کردن همه
                  </button>
                )}
              </div>

              <div className="filter-options">
                <div className="filter-group">
                  <label>وضعیت</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">همه</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                    <option value="pending">در انتظار</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>تاریخ از</label>
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>تاریخ تا</label>
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* اکشن‌های اصلی */}
        <div className="actions-container">
          <button
            className="export-btn"
            onClick={() => handleAction('export')}
            title="خروجی گرفتن"
          >
            📥
          </button>

          <button
            className="refresh-btn"
            onClick={() => handleAction('refresh')}
            title="بروزرسانی"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
});

TableToolbar.displayName = 'TableToolbar';

export default TableToolbar;
