import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, ContactInfo, Order, SiteSettings } from '../types'; // SiteSettings is used

// Default initial values for settings if API fails or DB is empty
const DEFAULT_SETTINGS: SiteSettings = {
  contactInfo: {
    phone: '+20 100 000 0000',
    email: 'default@example.com',
    facebook: '#',
    instagram: '#',
    tiktok: '#',
    workingHours: 'من 9 صباحًا إلى 5 مساءً',
  },
  siteLogoUrl: "https://i.ibb.co/tZPYk6G/Maloka-Story-Logo.png", // Default fallback logo
  heroSliderImages: [],
};

interface DataContextType {
  products: Product[];
  settings: SiteSettings | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<Product | undefined>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<Product | undefined>;
  deleteProduct: (productId: string) => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<SiteSettings | undefined>;
  fetchOrders: () => Promise<void>;
  addOrder: (orderData: Omit<Order, 'id' | 'orderDate' | 'status'>) => Promise<Order | undefined>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order | undefined>;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (value: boolean | ((val: boolean) => boolean)) => void;
  publishData: () => { productsJson: string; settingsJson: string; } | undefined; // Added publishData
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const item = window.localStorage.getItem('isAdminAuthenticated');
      return item ? JSON.parse(item) : false;
    } catch (error) {
      return false;
    }
  });
  useEffect(() => {
    window.localStorage.setItem('isAdminAuthenticated', JSON.stringify(isAdminAuthenticated));
  }, [isAdminAuthenticated]);


  const makeApiCall = async <T,>(url: string, method: string = 'GET', body?: any): Promise<T> => {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API call to ${url} failed with status ${response.status}`);
    }
    return response.json() as Promise<T>;
  };

  // Products
  const fetchProducts = useCallback(async () => {
    try {
      const data = await makeApiCall<Product[]>('/.netlify/functions/products');
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
      setProducts([]); 
    }
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'images'> & { images: string[] }) => {
    try {
      const newProduct = await makeApiCall<Product>('/.netlify/functions/products', 'POST', productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await makeApiCall<Product>(`/.netlify/functions/products/${productId}`, 'PUT', productData);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      return updatedProduct;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await makeApiCall<void>(`/.netlify/functions/products/${productId}`, 'DELETE');
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Settings
  const fetchSettings = useCallback(async () => {
    try {
      const data = await makeApiCall<SiteSettings>('/.netlify/functions/settings');
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
      setSettings(DEFAULT_SETTINGS); 
    }
  }, []);

  const updateSettings = async (newSettingsData: Partial<SiteSettings>) => {
    try {
      // Ensure that when updating settings, we merge with existing settings or default if somehow current settings are null.
      // However, `newSettingsData` is Partial<SiteSettings>, so it's expected to be merged with the full structure.
      // The backend should handle the merging logic or expect a full SiteSettings object.
      // For this client-side `updateSettings`, we pass the partial data, and the backend updates accordingly.
      // The state `settings` is updated with the response from the backend.
      const updatedSettings = await makeApiCall<SiteSettings>('/.netlify/functions/settings', 'PUT', newSettingsData);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Orders
  const fetchOrders = useCallback(async () => {
    if (!isAdminAuthenticated) {
        setOrders([]); 
        return;
    }
    try {
      const data = await makeApiCall<Order[]>('/.netlify/functions/orders');
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
      setOrders([]); 
    }
  }, [isAdminAuthenticated]);

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderDate' | 'status'>) => {
    try {
      const newOrder = await makeApiCall<Order>('/.netlify/functions/orders', 'POST', orderData);
      return newOrder;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updatedOrder = await makeApiCall<Order>(`/.netlify/functions/orders/${orderId}`, 'PUT', { status });
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      return updatedOrder;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Publish Data
  const publishData = useCallback((): { productsJson: string; settingsJson: string; } | undefined => {
    if (!settings) { // If settings are not loaded, publishing them would be problematic.
      console.warn("Settings not loaded. Cannot prepare data for publishing.");
      return undefined;
    }
    try {
      const productsJson = JSON.stringify(products, null, 2);
      const settingsJson = JSON.stringify(settings, null, 2);
      return { productsJson, settingsJson };
    } catch (e) {
      console.error("Error stringifying data for publish:", e);
      // Provide fallback JSON strings so the AdminPublishDataPage doesn't break trying to access properties on undefined.
      // Or return undefined and let AdminPublishDataPage handle it with a more generic error.
      // Returning undefined is consistent with the "settings not loaded" case.
      return undefined; 
    }
  }, [products, settings]);


  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);
      await Promise.all([fetchProducts(), fetchSettings(), fetchOrders()]);
      setIsLoading(false);
    };
    initializeData();
  }, [fetchProducts, fetchSettings, fetchOrders]);
  
  useEffect(() => {
    if (isAdminAuthenticated) {
        fetchOrders();
    } else {
        setOrders([]); 
    }
  }, [isAdminAuthenticated, fetchOrders]);


  return (
    <DataContext.Provider value={{ 
      products, settings, orders, isLoading, error,
      fetchProducts, addProduct, updateProduct, deleteProduct,
      fetchSettings, updateSettings,
      fetchOrders, addOrder, updateOrderStatus,
      isAdminAuthenticated, setIsAdminAuthenticated,
      publishData // Provide publishData through context
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
