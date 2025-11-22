import React from 'react';

const TableBody = React.memo(({
  data = [],
  columns = [],
  selectedRows = new Set(),
  onRowClick,
  onRowSelect,
  selectable = true,
  rowClassName,
  renderCell
}) => {
  const handleRowClick = (row, event) => {
    if (event.target.type === 'checkbox') return;
    onRowClick?.(row);
  };

  const handleRowSelect = (rowId, event) => {
    onRowSelect?.(rowId);
  };

  const getRowClassNames = (row, index) => {
    const baseClass = 'table-row';
    const selectedClass = selectedRows.has(row.id) ? 'selected' : '';
    const clickableClass = onRowClick ? 'clickable' : '';
    const customClass = rowClassName ? rowClassName(row, index) : '';
    
    return [baseClass, selectedClass, clickableClass, customClass]
      .filter(Boolean)
      .join(' ');
  };

  const renderCellContent = (row, column) => {
    if (renderCell) {
      const customContent = renderCell(row, column);
      if (customContent !== undefined) return customContent;
    }

    if (column.render) {
      return column.render(row[column.key], row, column);
    }

    return row[column.key] ?? '-';
  };

  if (data.length === 0) {
    return (
      <tbody>
        <tr>
          <td 
            colSpan={columns.length + (selectable ? 1 : 0)}
            className="empty-state"
          >
            <div className="empty-content">
              <span className="empty-icon">📭</span>
              <p className="empty-message">داده‌ای برای نمایش وجود ندارد</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="table-body">
      {data.map((row, index) => (
        <tr
          key={row.id || index}
          className={getRowClassNames(row, index)}
          onClick={(event) => handleRowClick(row, event)}
        >
          {/* سلول انتخاب */}
          {selectable && (
            <td className="select-cell">
              <div className="cell-content">
                <input
                  type="checkbox"
                  checked={selectedRows.has(row.id)}
                  onChange={(event) => handleRowSelect(row.id, event)}
                  aria-label={`انتخاب سطر ${index + 1}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </td>
          )}

          {/* سلول‌های داده */}
          {columns.map((column) => (
            <td
              key={column.key}
              className={`
                data-cell 
                ${column.align ? `align-${column.align}` : ''}
                ${column.className || ''}
              `}
              style={{ 
                width: column.width,
                minWidth: column.minWidth
              }}
            >
              <div className="cell-content">
                {renderCellContent(row, column)}
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
});

TableBody.displayName = 'TableBody';

export default TableBody;
