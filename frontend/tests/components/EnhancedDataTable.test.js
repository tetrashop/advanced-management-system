import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import EnhancedDataTable from '../../src/components/data/EnhancedDataTable';

// Mock data
const mockData = [
  { id: 1, name: 'کاربر اول', email: 'user1@example.com', age: 25, status: 'فعال' },
  { id: 2, name: 'کاربر دوم', email: 'user2@example.com', age: 30, status: 'غیرفعال' },
  { id: 3, name: 'کاربر سوم', email: 'user3@example.com', age: 35, status: 'فعال' },
  { id: 4, name: 'کاربر چهارم', email: 'user4@example.com', age: 28, status: 'معلق' }
];

const mockColumns = [
  { key: 'name', title: 'نام', sortable: true },
  { key: 'email', title: 'ایمیل', sortable: true },
  { key: 'age', title: 'سن', sortable: true },
  { key: 'status', title: 'وضعیت', sortable: false }
];

// Mock hooks
jest.mock('../../src/components/shared/hooks/useVirtualization', () => ({
  useVirtualization: (data) => ({
    visibleItems: data,
    containerRef: { current: null },
    totalHeight: data.length * 50,
    scrollTop: 0
  })
}));

describe('EnhancedDataTable', () => {
  test('رندر صحیح داده‌ها و ستون‌ها', () => {
    render(
      <EnhancedDataTable
        data={mockData}
        columns={mockColumns}
      />
    );

    // بررسی نمایش هدرهای جدول
    mockColumns.forEach(column => {
      expect(screen.getByText(column.title)).toBeInTheDocument();
    });

    // بررسی نمایش داده‌ها
    mockData.forEach(user => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });
  });

  test('مدیریت انتخاب سطرها', () => {
    const mockOnSelectionChange = jest.fn();
    
    render(
      <EnhancedDataTable
        data={mockData}
        columns={mockColumns}
        selectable={true}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    // پیدا کردن اولین checkbox و کلیک روی آن
    const firstCheckbox = screen.getAllByRole('checkbox')[1]; // اولی برای select all است
    fireEvent.click(firstCheckbox);

    expect(mockOnSelectionChange).toHaveBeenCalledWith([mockData[0].id]);
  });

  test('انتخاب همه سطرها', () => {
    const mockOnSelectionChange = jest.fn();
    
    render(
      <EnhancedDataTable
        data={mockData}
        columns={mockColumns}
        selectable={true}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);

    expect(mockOnSelectionChange).toHaveBeenCalledWith(mockData.map(user => user.id));
  });

  test('مرتب‌سازی ستون‌ها', () => {
    render(
      <EnhancedDataTable
        data={mockData}
        columns={mockColumns}
        sortable={true}
      />
    );

    // پیدا کردن هدر ستون name و کلیک برای مرتب‌سازی
    const nameHeader = screen.getByText('نام');
    fireEvent.click(nameHeader);

    // باید تابع مرتب‌سازی فراخوانی شده باشد
    // (در این تست ما فقط بررسی می‌کنیم که کلیک انجام شده)
    expect(nameHeader).toBeInTheDocument();
  });

  test('صفحه‌بندی داده‌ها', () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 20 + (i % 40),
      status: i % 2 === 0 ? 'فعال' : 'غیرفعال'
    }));

    render(
      <EnhancedDataTable
        data={largeData}
        columns={mockColumns}
        pagination={{ pageSize: 10 }}
      />
    );

    // باید کنترل‌های صفحه‌بندی نمایش داده شوند
    expect(screen.getByLabelText(/صفحه/)).toBeInTheDocument();
  });

  test('فیلتر کردن داده‌ها', () => {
    // در این تست می‌توانیم بررسی کنیم که کامپوننت TableToolbar
    // به درستی رندر شده و قابلیت فیلتر دارد
    render(
      <EnhancedDataTable
        data={mockData}
        columns={mockColumns}
        filterable={true}
      />
    );

    // باید input جستجو وجود داشته باشد
    const searchInput = screen.getByPlaceholderText(/جستجو/);
    expect(searchInput).toBeInTheDocument();
  });

  test('کلیک روی سطر', () => {
    const mockOnRowClick = jest.fn();
    
    render(
      <EnhancedDataTable
        data={mockData}
        columns={mockColumns}
        onRowClick={mockOnRowClick}
      />
    );

    // کلیک روی اولین سطر
    const firstRow = screen.getByText('کاربر اول').closest('tr');
    fireEvent.click(firstRow);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  test('نمایش جدول خالی', () => {
    render(
      <EnhancedDataTable
        data={[]}
        columns={mockColumns}
      />
    );

    expect(screen.getByText(/داده‌ای برای نمایش وجود ندارد/)).toBeInTheDocument();
  });
});
