import axios from 'axios';
import React from 'react';
import { Product, Order, OrderItem } from './types';

// إعداد axios
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// معالج الاستجابة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // الخادم رد بخطأ
      throw new Error(error.response.data?.message || 'حدث خطأ في الخادم');
    } else if (error.request) {
      // لا يوجد رد من الخادم
      throw new Error('لا يمكن الاتصال بالخادم. تحقق من اتصال الإنترنت.');
    } else {
      // خطأ في إعداد الطلب
      throw new Error('حدث خطأ غير متوقع');
    }
  }
);

// واجهة API للمنتجات
export const productsApi = {
  // الحصول على جميع المنتجات
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data.data;
  },

  // الحصول على منتج بالمعرف
  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // الحصول على المنتجات حسب الفئة
  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/products/category/${encodeURIComponent(category)}`);
    return response.data.data;
  },

  // البحث في المنتجات
  search: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/products/search/${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // الحصول على العروض
  getOffers: async (maxPrice?: number): Promise<Product[]> => {
    const response = await api.get('/products/offers/list', {
      params: maxPrice ? { maxPrice } : {}
    });
    return response.data.data;
  },

  // إنشاء منتج جديد (للمدير)
  create: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post('/products', productData);
    return response.data.data;
  },

  // تحديث منتج (للمدير)
  update: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data;
  },

  // حذف منتج (للمدير)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// واجهة API للطلبات
export const ordersApi = {
  // الحصول على جميع الطلبات (للمدير)
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data.data;
  },

  // الحصول على طلب بالمعرف
  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  // الحصول على الطلبات حسب الحالة
  getByStatus: async (status: Order['status']): Promise<Order[]> => {
    const response = await api.get(`/orders/status/${status}`);
    return response.data.data;
  },

  // البحث في الطلبات
  search: async (query: string): Promise<Order[]> => {
    const response = await api.get(`/orders/search/${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // إنشاء طلب جديد
  create: async (orderData: {
    customerName: string;
    phoneNumber: string;
    address: string;
    productId: string;
    quantity: number;
    telegramChatId?: string;
    notes?: string;
  }): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  // تحديث حالة الطلب (للمدير)
  updateStatus: async (id: string, status: Order['status']): Promise<void> => {
    await api.patch(`/orders/${id}/status`, { status });
  },

  // حذف طلب (للمدير)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};

// واجهة API عامة
export const generalApi = {
  // فحص حالة الخادم
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.data.success;
    } catch {
      return false;
    }
  },

  // تهيئة البيانات الأولية
  initData: async (): Promise<void> => {
    await api.post('/init-data');
  },
};

// خطاف للتحقق من حالة الاتصال
export const useApiConnection = () => {
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const connected = await generalApi.healthCheck();
        setIsConnected(connected);
      } catch {
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
    
    // فحص دوري كل 30 ثانية
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { isConnected, isLoading };
};

export default api;
