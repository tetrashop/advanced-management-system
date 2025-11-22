import React, { useState, useMemo, useCallback } from 'react';
import { useVirtualization } from '../shared/hooks/useVirtualization';
import TableToolbar from './TableToolbar';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TablePagination from './TablePagination';

const EnhancedDataTable = React.memo(({
  data = [],
  columns = [],
  pagination = { pageSize: 50 },
  sortable = true,
  selectable = true,
  filterable = true,
  onRowClick,
  onSelectionChange
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // فیلتر کردن داده‌ها
  const filteredData = useMemo(() => {
    if (!Object.keys(filters).length) return data;
    
    return data.filter(row => 
      columns.every(col => {
        const filterValue = filters[col.key];
        if (!filterValue) return true;
        
        const cellValue = row[col.key];
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
      })
    );
  }, [data, filters, columns]);

  // مرتب‌سازی داده‌ها
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [filteredData, sortConfig]);

  // صفحه‌بندی داده‌ها
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pagination.pageSize;
    return sortedData.slice(startIndex, startIndex + pagination.pageSize);
  }, [sortedData, currentPage, pagination.pageSize]);

  // Virtualization برای عملکرد بهتر
  const { visibleItems, containerRef } = useVirtualization(paginatedData, 50);

  // مدیریت انتخاب سطرها
  const toggleRowSelection = useCallback((rowId) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(rowId)) {
        newSelection.delete(rowId);
      } else {
        newSelection.add(rowId);
      }
      
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [onSelectionChange]);

  const selectAllRows = useCallback(() => {
    const allIds = paginatedData.map(row => row.id);
    setSelectedRows(prev => {
      const newSelection = new Set(prev.size === allIds.length ? [] : allIds);
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [paginatedData, onSelectionChange]);

  // مدیریت مرتب‌سازی
  const handleSort = useCallback((columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  return (
    <div className="enhanced-data-table">
      <TableToolbar
        selectedCount={selectedRows.size}
        totalCount={sortedData.length}
        filters={filters}
        onFilterChange={setFilters}
        onSelectAll={selectAllRows}
        allSelected={selectedRows.size === paginatedData.length}
      />

      <div className="table-container" ref={containerRef}>
        <table className="data-table">
          <TableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            sortable={sortable}
            selectable={selectable}
            allSelected={selectedRows.size === paginatedData.length}
            onSelectAll={selectAllRows}
          />
          
          <TableBody
            data={visibleItems}
            columns={columns}
            selectedRows={selectedRows}
            onRowClick={onRowClick}
            onRowSelect={toggleRowSelection}
            selectable={selectable}
          />
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalItems={sortedData.length}
        pageSize={pagination.pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
});

EnhancedDataTable.displayName = 'EnhancedDataTable';

export default EnhancedDataTable;
