import React from 'react';

const TableHeader = React.memo(({
  columns = [],
  sortConfig = {},
  onSort,
  sortable = true,
  selectable = true,
  allSelected = false,
  onSelectAll
}) => {
  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;
    onSort?.(column.key);
  };

  const handleSelectAll = () => {
    onSelectAll?.();
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <thead className="table-header">
      <tr>
        {/* ستون انتخاب */}
        {selectable && (
          <th className="select-column">
            <div className="header-cell">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                aria-label="انتخاب همه سطرها"
              />
            </div>
          </th>
        )}

        {/* ستون‌های داده */}
        {columns.map((column) => (
          <th
            key={column.key}
            className={`
              data-column 
              ${column.sortable ? 'sortable' : ''}
              ${sortConfig.key === column.key ? 'sorted' : ''}
            `}
            style={{ 
              width: column.width,
              minWidth: column.minWidth
            }}
          >
            <div 
              className="header-cell"
              onClick={() => handleSort(column)}
            >
              <span className="column-title">
                {column.title}
              </span>
              
              {sortable && column.sortable && (
                <span className="sort-indicator">
                  {getSortIcon(column.key)}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
});

TableHeader.displayName = 'TableHeader';

export default TableHeader;
