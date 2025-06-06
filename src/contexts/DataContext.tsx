import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ContactInfo, Order } from '../types';
import useLocalStorage from '../hooks/useLocalStorage'; // For orders

interface SiteSettings {
  contactInfo: ContactInfo;
  siteLogoUrl: string;
  heroSliderImages: string[];
}

interface DataContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  settings: SiteSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings | null>>;
  orders: Order[];
  setOrders: (value: Order[] | ((val: Order[]) => Order[])) => void;
  isLoading: boolean;
  error: string | null;
  publishData: () => { productsJson: string; settingsJson: string } | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Define default initial values matching the JSON structures
const defaultSettings: SiteSettings = {
  contactInfo: {
    phone: '+20 123 456 7890',
    email: 'support@elegance-store.com',
    facebook: '#',
    instagram: '#',
    tiktok: '#',
    workingHours: 'السبت - الخميس، 9 صباحًا - 6 مساءً',
  },
  siteLogoUrl: "https://i.ibb.co/tZPYk6G/Maloka-Story-Logo.png",
  heroSliderImages: [],
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []); // Orders remain in localStorage
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsResponse = await fetch('/data/products.json');
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products.json: ${productsResponse.statusText} (status: ${productsResponse.status})`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);

        const settingsResponse = await fetch('/data/settings.json');
        if (!settingsResponse.ok) {
          throw new Error(`Failed to fetch settings.json: ${settingsResponse.statusText} (status: ${settingsResponse.status})`);
        }
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);

      } catch (err: any) {
        console.error("Error loading site data:", err);
        setError(`فشل تحميل بيانات الموقع الأساسية: ${err.message}. قد لا تعمل بعض الميزات بشكل صحيح. تأكد من وجود ملفات 'products.json' و 'settings.json' في المجلد 'public/data'.`);
        // Fallback to defaults if fetch fails to allow app to run partially
        setProducts([]); // Or some predefined minimal product list
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const publishData = () => {
    if (!settings) { // Check if settings are loaded
        console.error("Settings not loaded, cannot publish.");
        alert("خطأ: بيانات الإعدادات لم يتم تحميلها بشكل كامل. لا يمكن تحضير البيانات للنشر.");
        return null;
    }
    try {
      const productsJson = JSON.stringify(products, null, 2);
      const settingsJson = JSON.stringify(settings, null, 2);
      return { productsJson, settingsJson };
    } catch (e) {
      console.error("Error stringifying data for publish:", e);
      alert("حدث خطأ أثناء تحضير البيانات للنشر.");
      return null;
    }
  };

  return (
    <DataContext.Provider value={{ products, setProducts, settings, setSettings, orders, setOrders, isLoading, error, publishData }}>
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
