
import { useState, useEffect } from 'react';

function useLocalStorage<T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key “" + key + "”:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      // Check if storedValue is a function, if so, call it to get the actual value to store
      // This handles cases where the state setter function form is used: setStoredValue(prev => ...)
      // However, for direct storage, we ensure we are storing the actual value.
      // The hook's setStoredValue already handles function updates correctly by design of useState.
      // So, just stringify storedValue directly.
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error setting localStorage key “" + key + "”:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;