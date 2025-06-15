import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, ContactInfo, Order, SiteSettings } from '../types';
import { dataService } from '../services/dataService';

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
  exportData: () => { products: Product[], orders: Order[], settings: SiteSettings };
  importData: (data: { products?: Product[], orders?: Order[], settings?: SiteSettings }) => void;
  clearAllData: () => void;
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


  // Products
  const fetchProducts = useCallback(async () => {
    try {
      const data = await dataService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setProducts([]);
    }
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await dataService.addProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      setError(null);
      return newProduct;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      const updatedProduct = await dataService.updateProduct(productId, productData);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      setError(null);
      return updatedProduct;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await dataService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Settings
  const fetchSettings = useCallback(async () => {
    try {
      const data = await dataService.getSettings();
      setSettings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const updateSettings = async (newSettingsData: Partial<SiteSettings>) => {
    try {
      const updatedSettings = await dataService.updateSettings(newSettingsData);
      setSettings(updatedSettings);
      setError(null);
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
      const data = await dataService.getOrders();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setOrders([]);
    }
  }, [isAdminAuthenticated]);

  const addOrder = async (orderData: Omit<Order, 'id' | 'orderDate' | 'status'>) => {
    try {
      const newOrder = await dataService.addOrder(orderData);
      setError(null);
      return newOrder;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updatedOrder = await dataService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      setError(null);
      return updatedOrder;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Data management functions
  const exportData = useCallback(() => {
    return dataService.exportData();
  }, []);

  const importData = useCallback((data: { products?: Product[], orders?: Order[], settings?: SiteSettings }) => {
    dataService.importData(data);
    // Refresh the state after import
    fetchProducts();
    fetchSettings();
    fetchOrders();
  }, [fetchProducts, fetchSettings, fetchOrders]);

  const clearAllData = useCallback(() => {
    dataService.clearAllData();
    setProducts([]);
    setOrders([]);
    setSettings(null);
    setError(null);
  }, []);


  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);

      // Initialize default data first
      await dataService.initializeDefaultData();

      // Then fetch all data
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
      exportData, importData, clearAllData
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
