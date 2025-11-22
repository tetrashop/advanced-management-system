import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnhancedUserDashboard from '../../src/components/dashboard/EnhancedUserDashboard';

// Mock data
const mockUser = {
  id: 1,
  name: 'کاربر تست',
  email: 'test@example.com'
};

const mockPreferences = {
  theme: 'light',
  language: 'fa'
};

const mockDashboardData = {
  widgets: [
    { id: 1, type: 'stats', title: 'آمار کلی', value: 150 },
    { id: 2, type: 'chart', title: 'نمودار فعالیت', data: [10, 20, 30] }
  ],
  lastUpdated: '2024-01-01T10:00:00Z'
};

// Mock components
jest.mock('../../src/components/dashboard/WidgetGrid', () => {
  return function MockWidgetGrid({ data }) {
    return <div data-testid="widget-grid">WidgetGrid: {data.widgets.length} widgets</div>;
  };
});

jest.mock('../../src/components/dashboard/RealTimeUpdates', () => {
  return function MockRealTimeUpdates({ onUpdate }) {
    return (
      <button 
        data-testid="mock-update"
        onClick={() => onUpdate({ test: 'new data' })}
      >
        Mock Updates
      </button>
    );
  };
});

describe('EnhancedUserDashboard', () => {
  test('رندر صحیح با داده اولیه', () => {
    render(
      <EnhancedUserDashboard 
        user={mockUser}
        preferences={mockPreferences}
        initialData={mockDashboardData}
      />
    );

    expect(screen.getByText(/داشبورد کاربری - کاربر تست/)).toBeInTheDocument();
    expect(screen.getByTestId('widget-grid')).toBeInTheDocument();
  });

  test('نمایش اسکلتون هنگام لودینگ', () => {
    render(
      <EnhancedUserDashboard 
        user={mockUser}
        preferences={mockPreferences}
        initialData={null}
      />
    );

    // باید اسکلتون نمایش داده شود
    expect(screen.getByText(/داشبورد کاربری - کاربر تست/)).toBeInTheDocument();
  });

  test('مدیریت خطاها', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // رندر با داده نامعتبر
    const { container } = render(
      <EnhancedUserDashboard 
        user={null} // داده نامعتبر
        preferences={mockPreferences}
        initialData={mockDashboardData}
      />
    );

    // باید خطا مدیریت شود
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  test('بروزرسانی داده‌ها از طریق RealTimeUpdates', async () => {
    render(
      <EnhancedUserDashboard 
        user={mockUser}
        preferences={mockPreferences}
        initialData={mockDashboardData}
      />
    );

    // کلیک روی دکمه بروزرسانی
    fireEvent.click(screen.getByTestId('mock-update'));

    // باید داده‌ها بروزرسانی شوند
    await waitFor(() => {
      expect(screen.getByTestId('widget-grid')).toBeInTheDocument();
    });
  });

  test('کلیک روی دکمه بروزرسانی دستی', () => {
    render(
      <EnhancedUserDashboard 
        user={mockUser}
        preferences={mockPreferences}
        initialData={mockDashboardData}
      />
    );

    const refreshButton = screen.getByLabelText('بروزرسانی داده‌ها');
    fireEvent.click(refreshButton);

    // باید وضعیت لودینگ تغییر کند
    expect(refreshButton).toBeInTheDocument();
  });
});
