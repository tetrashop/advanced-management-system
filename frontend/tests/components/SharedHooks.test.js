import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../src/components/shared/hooks/useDebounce';
import { useLocalStorage } from '../../src/components/shared/hooks/useLocalStorage';

// Mock برای localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useDebounce', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('مقدار را پس از تاخیر برمی‌گرداند', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'test', delay: 300 }
      }
    );

    expect(result.current).toBe('test');

    // تغییر مقدار
    rerender({ value: 'updated', delay: 300 });

    // قبل از تاخیر، مقدار قدیمی باید باقی بماند
    expect(result.current).toBe('test');

    // پس از تاخیر، مقدار جدید باید اعمال شود
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  test('با تاخیر پیش‌فرض کار می‌کند', () => {
    const { result } = renderHook(
      ({ value }) => useDebounce(value),
      {
        initialProps: { value: 'test' }
      }
    );

    expect(result.current).toBe('test');
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('مقدار پیش‌فرض را برمی‌گرداند', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'defaultValue')
    );

    expect(result.current.value).toBe('defaultValue');
    expect(result.current.isLoading).toBe(false);
  });

  test('مقدار ذخیره شده را می‌خواند', () => {
    localStorageMock.setItem('testKey', JSON.stringify('storedValue'));

    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'defaultValue')
    );

    expect(result.current.value).toBe('storedValue');
  });

  test('مقدار جدید را ذخیره می‌کند', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'defaultValue')
    );

    act(() => {
      result.current.setValue('newValue');
    });

    expect(result.current.value).toBe('newValue');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'testKey',
      JSON.stringify('newValue')
    );
  });

  test('مقدار را حذف می‌کند', () => {
    localStorageMock.setItem('testKey', JSON.stringify('storedValue'));

    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'defaultValue')
    );

    act(() => {
      result.current.removeValue();
    });

    expect(result.current.value).toBe('defaultValue');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('testKey');
  });

  test('همه مقادیر را پاک می‌کند', () => {
    localStorageMock.setItem('testKey1', JSON.stringify('value1'));
    localStorageMock.setItem('testKey2', JSON.stringify('value2'));

    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'defaultValue')
    );

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.value).toBe('defaultValue');
    expect(localStorageMock.clear).toHaveBeenCalled();
  });

  test('با مقدار تابع کار می‌کند', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testKey', 0)
    );

    act(() => {
      result.current.setValue(prev => prev + 1);
    });

    expect(result.current.value).toBe(1);
  });

  test('خطا را مدیریت می‌کند', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => 
      useLocalStorage('testKey', 'defaultValue')
    );

    act(() => {
      result.current.setValue('newValue');
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('useLocalStorageObject', () => {
  test('مقدار آبجکت را مدیریت می‌کند', () => {
    const { result } = renderHook(() => 
      useLocalStorage('testObject', { name: 'John', age: 25 })
    );

    expect(result.current.value).toEqual({ name: 'John', age: 25 });

    act(() => {
      result.current.setValue({ name: 'Jane', age: 30 });
    });

    expect(result.current.value).toEqual({ name: 'Jane', age: 30 });
  });
});
