import React, { useState, useCallback } from 'react';

const FilterPanel = React.memo(({
  filters = [],
  activeFilters = {},
  onFilterChange,
  className = ''
}) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = useCallback((groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, []);

  const handleFilterChange = useCallback((filterId, value) => {
    const newFilters = { ...activeFilters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }
    
    onFilterChange?.(newFilters);
  }, [activeFilters, onFilterChange]);

  const clearFilter = useCallback((filterId) => {
    handleFilterChange(filterId, '');
  }, [handleFilterChange]);

  const clearAllFilters = useCallback(() => {
    onFilterChange?.({});
  }, [onFilterChange]);

  const renderFilterInput = (filter) => {
    const value = activeFilters[filter.id] || '';
    
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-input select-input"
          >
            <option value="">همه {filter.label}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-input date-input"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={`عدد ${filter.label}`}
            className="filter-input number-input"
            min={filter.min}
            max={filter.max}
          />
        );
      
      case 'boolean':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="filter-input boolean-input"
          >
            <option value="">همه</option>
            <option value="true">بله</option>
            <option value="false">خیر</option>
          </select>
        );
      
      case 'text':
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={`جستجو در ${filter.label}`}
            className="filter-input text-input"
          />
        );
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  // گروه‌بندی فیلترها
  const groupedFilters = filters.reduce((groups, filter) => {
    const group = filter.group || 'general';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(filter);
    return groups;
  }, {});

  return (
    <div className={`filter-panel ${className}`}>
      <div className="filter-panel-header">
        <h3 className="filter-panel-title">فیلترها</h3>
        
        {hasActiveFilters && (
          <button
            className="clear-all-filters"
            onClick={clearAllFilters}
            type="button"
          >
            پاک کردن همه
          </button>
        )}
      </div>

      <div className="filter-groups">
        {Object.entries(groupedFilters).map(([groupId, groupFilters]) => {
          const groupConfig = groupFilters[0]?.groupConfig || {};
          const isExpanded = expandedGroups[groupId] !== false;
          
          return (
            <div key={groupId} className="filter-group">
              {groupConfig.title && (
                <div 
                  className="filter-group-header"
                  onClick={() => toggleGroup(groupId)}
                >
                  <h4 className="filter-group-title">
                    {groupConfig.title}
                  </h4>
                  <span className="expand-icon">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>
              )}
              
              {isExpanded && (
                <div className="filter-group-content">
                  {groupFilters.map(filter => (
                    <div key={filter.id} className="filter-item">
                      <div className="filter-header">
                        <label 
                          htmlFor={`filter-${filter.id}`}
                          className="filter-label"
                        >
                          {filter.label}
                        </label>
                        
                        {activeFilters[filter.id] && (
                          <button
                            className="clear-filter"
                            onClick={() => clearFilter(filter.id)}
                            type="button"
                            aria-label={`پاک کردن فیلتر ${filter.label}`}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      <div className="filter-control">
                        {renderFilterInput(filter)}
                      </div>
                      
                      {filter.description && (
                        <div className="filter-description">
                          {filter.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* خلاصه فیلترهای فعال */}
      {hasActiveFilters && (
        <div className="active-filters-summary">
          <div className="summary-title">فیلترهای فعال:</div>
          <div className="active-filters-list">
            {filters
              .filter(filter => activeFilters[filter.id])
              .map(filter => (
                <span key={filter.id} className="active-filter-tag">
                  <span className="filter-tag-label">{filter.label}:</span>
                  <span className="filter-tag-value">
                    {activeFilters[filter.id]}
                  </span>
                  <button
                    className="remove-filter-tag"
                    onClick={() => clearFilter(filter.id)}
                    aria-label={`حذف فیلتر ${filter.label}`}
                  >
                    ✕
                  </button>
                </span>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;
