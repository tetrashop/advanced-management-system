import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  const clearAll = useCallback(() => {
    try {
      window.localStorage.clear();
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    clearAll,
    isLoading
  };
};

export const useLocalStorageObject = (key, initialValue = {}) => {
  const { value, setValue, ...rest } = useLocalStorage(key, initialValue);

  const updateValue = useCallback((updates) => {
    setValue(prev => ({ ...prev, ...updates }));
  }, [setValue]);

  const setNestedValue = useCallback((nestedKey, nestedValue) => {
    setValue(prev => ({
      ...prev,
      [nestedKey]: nestedValue
    }));
  }, [setValue]);

  const removeNestedValue = useCallback((nestedKey) => {
    setValue(prev => {
      const newValue = { ...prev };
      delete newValue[nestedKey];
      return newValue;
    });
  }, [setValue]);

  return {
    value,
    setValue,
    updateValue,
    setNestedValue,
    removeNestedValue,
    ...rest
  };
};

export default useLocalStorage;
