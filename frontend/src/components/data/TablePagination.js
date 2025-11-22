import React, { useMemo } from 'react';

const TablePagination = React.memo(({
  currentPage = 1,
  totalItems = 0,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageInfo = true,
  showPageSize = true
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onPageChange?.(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    const newPageSize = parseInt(newSize, 10);
    onPageSizeChange?.(newPageSize);
    
    // محاسبه مجدد صفحه فعلی پس از تغییر سایز
    const newTotalPages = Math.ceil(totalItems / newPageSize);
    if (currentPage > newTotalPages) {
      onPageChange?.(newTotalPages);
    }
  };

  const getDisplayInfo = () => {
    if (totalItems === 0) return 'هیچ موردی یافت نشد';
    
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return `نمایش ${startItem} تا ${endItem} از ${totalItems} مورد`;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="table-pagination">
      {/* اطلاعات صفحه */}
      {showPageInfo && (
        <div className="pagination-info">
          <span className="page-info-text">
            {getDisplayInfo()}
          </span>
        </div>
      )}

      {/* کنترل‌های صفحه‌بندی */}
      <div className="pagination-controls">
        {/* انتخاب سایز صفحه */}
        {showPageSize && (
          <div className="page-size-selector">
            <label htmlFor="page-size-select" className="page-size-label">
              در هر صفحه:
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              className="page-size-select"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* دکمه‌های ناوبری */}
        <nav className="page-navigation" aria-label="ناوبری صفحه">
          <ul className="pagination-list">
            {/* دکمه اولین صفحه */}
            <li className="page-item">
              <button
                className="page-link first-page"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                aria-label="اولین صفحه"
              >
                ⏮️
              </button>
            </li>

            {/* دکمه صفحه قبلی */}
            <li className="page-item">
              <button
                className="page-link prev-page"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="صفحه قبلی"
              >
                ◀️
              </button>
            </li>

            {/* شماره صفحات */}
            {pageNumbers.map((page, index) => (
              <li key={index} className="page-item">
                {page === '...' ? (
                  <span className="page-ellipsis">...</span>
                ) : (
                  <button
                    className={`page-link ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    aria-label={`صفحه ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}

            {/* دکمه صفحه بعدی */}
            <li className="page-item">
              <button
                className="page-link next-page"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="صفحه بعدی"
              >
                ▶️
              </button>
            </li>

            {/* دکمه آخرین صفحه */}
            <li className="page-item">
              <button
                className="page-link last-page"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="آخرین صفحه"
              >
                ⏭️
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
});

TablePagination.displayName = 'TablePagination';

export default TablePagination;
