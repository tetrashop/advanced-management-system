import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TableToolbar from '../../src/components/data/TableToolbar';
import TableHeader from '../../src/components/data/TableHeader';
import TableBody from '../../src/components/data/TableBody';
import TablePagination from '../../src/components/data/TablePagination';

// Mock data برای تست‌ها
const mockColumns = [
  { key: 'name', title: 'نام', sortable: true },
  { key: 'age', title: 'سن', sortable: true },
  { key: 'status', title: 'وضعیت', sortable: false }
];

const mockData = [
  { id: 1, name: 'کاربر اول', age: 25, status: 'فعال' },
  { id: 2, name: 'کاربر دوم', age: 30, status: 'غیرفعال' },
  { id: 3, name: 'کاربر سوم', age: 35, status: 'فعال' }
];

describe('TableToolbar', () => {
  test('رندر صحیح با انتخاب‌ها', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <TableToolbar
        selectedCount={2}
        totalCount={10}
        onFilterChange={mockOnFilterChange}
      />
    );

    expect(screen.getByText('2 مورد انتخاب شده')).toBeInTheDocument();
  });

  test('رندر صحیح بدون انتخاب', () => {
    render(
      <TableToolbar
        selectedCount={0}
        totalCount={10}
      />
    );

    expect(screen.getByText('کل: 10 مورد')).toBeInTheDocument();
  });

  test('جستجو کار می‌کند', () => {
    const mockOnFilterChange = jest.fn();
    
    render(
      <TableToolbar
        onFilterChange={mockOnFilterChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('جستجو در جدول...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'test' });
  });
});

describe('TableHeader', () => {
  test('رندر صحیح ستون‌ها', () => {
    const mockOnSort = jest.fn();
    
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          onSort={mockOnSort}
        />
      </table>
    );

    expect(screen.getByText('نام')).toBeInTheDocument();
    expect(screen.getByText('سن')).toBeInTheDocument();
    expect(screen.getByText('وضعیت')).toBeInTheDocument();
  });

  test('مرتب‌سازی کار می‌کند', () => {
    const mockOnSort = jest.fn();
    
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          onSort={mockOnSort}
          sortable={true}
        />
      </table>
    );

    const nameHeader = screen.getByText('نام');
    fireEvent.click(nameHeader);

    expect(mockOnSort).toHaveBeenCalledWith('name');
  });

  test('انتخاب همه کار می‌کند', () => {
    const mockOnSelectAll = jest.fn();
    
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          selectable={true}
          onSelectAll={mockOnSelectAll}
        />
      </table>
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    expect(mockOnSelectAll).toHaveBeenCalled();
  });
});

describe('TableBody', () => {
  test('رندر صحیح داده‌ها', () => {
    render(
      <table>
        <TableBody
          data={mockData}
          columns={mockColumns}
        />
      </table>
    );

    expect(screen.getByText('کاربر اول')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('فعال')).toBeInTheDocument();
  });

  test('نمایش حالت خالی', () => {
    render(
      <table>
        <TableBody
          data={[]}
          columns={mockColumns}
        />
      </table>
    );

    expect(screen.getByText('داده‌ای برای نمایش وجود ندارد')).toBeInTheDocument();
  });

  test('کلیک روی سطر کار می‌کند', () => {
    const mockOnRowClick = jest.fn();
    
    render(
      <table>
        <TableBody
          data={mockData}
          columns={mockColumns}
          onRowClick={mockOnRowClick}
        />
      </table>
    );

    const firstRow = screen.getByText('کاربر اول');
    fireEvent.click(firstRow);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  test('انتخاب سطر کار می‌کند', () => {
    const mockOnRowSelect = jest.fn();
    
    render(
      <table>
        <TableBody
          data={mockData}
          columns={mockColumns}
          selectable={true}
          onRowSelect={mockOnRowSelect}
        />
      </table>
    );

    const firstCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(firstCheckbox);

    expect(mockOnRowSelect).toHaveBeenCalledWith(mockData[0].id);
  });
});

describe('TablePagination', () => {
  test('رندر صحیح اطلاعات صفحه', () => {
    render(
      <TablePagination
        currentPage={1}
        totalItems={100}
        pageSize={25}
      />
    );

    expect(screen.getByText('نمایش 1 تا 25 از 100 مورد')).toBeInTheDocument();
  });

  test('تغییر صفحه کار می‌کند', () => {
    const mockOnPageChange = jest.fn();
    
    render(
      <TablePagination
        currentPage={1}
        totalItems={100}
        pageSize={25}
        onPageChange={mockOnPageChange}
      />
    );

    const nextPageButton = screen.getByLabelText('صفحه بعدی');
    fireEvent.click(nextPageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  test('تغییر سایز صفحه کار می‌کند', () => {
    const mockOnPageSizeChange = jest.fn();
    
    render(
      <TablePagination
        currentPage={1}
        totalItems={100}
        pageSize={25}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const pageSizeSelect = screen.getByLabelText('در هر صفحه:');
    fireEvent.change(pageSizeSelect, { target: { value: '50' } });

    expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
  });

  test('عدم نمایش برای داده خالی', () => {
    const { container } = render(
      <TablePagination
        currentPage={1}
        totalItems={0}
        pageSize={25}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('نمایش صحیح صفحات', () => {
    render(
      <TablePagination
        currentPage={3}
        totalItems={100}
        pageSize={10}
      />
    );

    // باید صفحه فعال نمایش داده شود
    expect(screen.getByText('3')).toHaveClass('active');
  });
});
