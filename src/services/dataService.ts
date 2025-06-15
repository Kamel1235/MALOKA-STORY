import { Product, Order, SiteSettings, ContactInfo } from '../types';

// Default settings
const DEFAULT_SETTINGS: SiteSettings = {
  contactInfo: {
    phone: '+20 100 000 0000',
    email: 'info@maloka-story.com',
    facebook: 'https://facebook.com/malokastory',
    instagram: 'https://instagram.com/malokastory',
    tiktok: 'https://tiktok.com/@malokastory',
    workingHours: 'من 9 صباحًا إلى 5 مساءً',
  },
  siteLogoUrl: "https://i.ibb.co/tZPYk6G/Maloka-Story-Logo.png",
  heroSliderImages: [],
};

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'maloka_products',
  ORDERS: 'maloka_orders',
  SETTINGS: 'maloka_settings',
  ADMIN_AUTH: 'maloka_admin_auth',
};

class DataService {
  // Utility methods for localStorage
  private getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
      throw new Error('فشل في حفظ البيانات');
    }
  }

  // Products methods
  async getProducts(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = this.getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
        resolve(products);
      }, 100); // Simulate API delay
    });
  }

  async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const products = this.getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
          const newProduct: Product = {
            ...productData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          };
          products.push(newProduct);
          this.saveToStorage(STORAGE_KEYS.PRODUCTS, products);
          resolve(newProduct);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const products = this.getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
          const index = products.findIndex(p => p.id === productId);
          if (index === -1) {
            throw new Error('المنتج غير موجود');
          }
          products[index] = { ...products[index], ...productData };
          this.saveToStorage(STORAGE_KEYS.PRODUCTS, products);
          resolve(products[index]);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const products = this.getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
          const filteredProducts = products.filter(p => p.id !== productId);
          this.saveToStorage(STORAGE_KEYS.PRODUCTS, filteredProducts);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  // Orders methods
  async getOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = this.getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
        resolve(orders);
      }, 100);
    });
  }

  async addOrder(orderData: Omit<Order, 'id' | 'orderDate' | 'status'>): Promise<Order> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const orders = this.getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
          const newOrder: Order = {
            ...orderData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            orderDate: new Date().toISOString(),
            status: 'Pending',
          };
          orders.push(newOrder);
          this.saveToStorage(STORAGE_KEYS.ORDERS, orders);
          resolve(newOrder);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const orders = this.getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
          const index = orders.findIndex(o => o.id === orderId);
          if (index === -1) {
            throw new Error('الطلب غير موجود');
          }
          orders[index].status = status;
          this.saveToStorage(STORAGE_KEYS.ORDERS, orders);
          resolve(orders[index]);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  // Settings methods
  async getSettings(): Promise<SiteSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const settings = this.getFromStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
        resolve(settings);
      }, 100);
    });
  }

  async updateSettings(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const currentSettings = this.getFromStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
          const updatedSettings = { ...currentSettings, ...newSettings };
          this.saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
          resolve(updatedSettings);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  // Data export/import methods
  exportData(): { products: Product[], orders: Order[], settings: SiteSettings } {
    return {
      products: this.getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []),
      orders: this.getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []),
      settings: this.getFromStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    };
  }

  importData(data: { products?: Product[], orders?: Order[], settings?: SiteSettings }): void {
    if (data.products) {
      this.saveToStorage(STORAGE_KEYS.PRODUCTS, data.products);
    }
    if (data.orders) {
      this.saveToStorage(STORAGE_KEYS.ORDERS, data.orders);
    }
    if (data.settings) {
      this.saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
    }
  }

  // Initialize with default data if empty
  async initializeDefaultData(): Promise<void> {
    const products = this.getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    if (products.length === 0) {
      // Load initial products from public/data/products.json
      try {
        const response = await fetch('/data/products.json');
        const initialProducts = await response.json();
        this.saveToStorage(STORAGE_KEYS.PRODUCTS, initialProducts);
      } catch (error) {
        console.error('Failed to load initial products:', error);
      }
    }

    const settings = this.getFromStorage<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    if (!settings.contactInfo) {
      // Load initial settings from public/data/settings.json
      try {
        const response = await fetch('/data/settings.json');
        const initialSettings = await response.json();
        this.saveToStorage(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...initialSettings });
      } catch (error) {
        console.error('Failed to load initial settings:', error);
        this.saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}

export const dataService = new DataService();
