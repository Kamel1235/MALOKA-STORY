import { useState, useEffect } from 'react';
import { productsApi, ordersApi, generalApi } from '../utils/api';
import { Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';

// خطاف للمنتجات
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // التحقق من الاتصال بالخادم
      const connected = await generalApi.healthCheck();
      setIsOnline(connected);
      
      if (connected) {
        const data = await productsApi.getAll();
        setProducts(data);
      } else {
        // استخدام البيانات المحلية كبديل
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (err) {
      console.error('خطأ في جلب المنتجات:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      // استخدام البيانات المحلية كبديل
      setProducts(INITIAL_PRODUCTS);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      if (isOnline) {
        const newProduct = await productsApi.create(productData);
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      } else {
        // إضافة محلية
        const newProduct: Product = {
          ...productData,
          id: Date.now().toString(),
        };
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في إضافة المنتج');
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      if (isOnline) {
        const updatedProduct = await productsApi.update(id, productData);
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
        return updatedProduct;
      } else {
        // تحديث محلي
        setProducts(prev => prev.map(p => 
          p.id === id ? { ...p, ...productData } : p
        ));
        return { ...products.find(p => p.id === id)!, ...productData };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحديث المنتج');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      if (isOnline) {
        await productsApi.delete(id);
      }
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في حذف المنتج');
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    isOnline,
    refetch: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};

// خطاف للطلبات
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // التحقق من الاتصال بالخادم
      const connected = await generalApi.healthCheck();
      setIsOnline(connected);
      
      if (connected) {
        const data = await ordersApi.getAll();
        setOrders(data);
      } else {
        // استخدام البيانات المحلية
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        setOrders(localOrders);
      }
    } catch (err) {
      console.error('خطأ في جلب الطلبات:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
      // استخدام البيانات المحلية كبديل
      const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrders(localOrders);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const createOrder = async (orderData: {
    customerName: string;
    phoneNumber: string;
    address: string;
    productId: string;
    quantity: number;
    notes?: string;
  }) => {
    try {
      if (isOnline) {
        const newOrder = await ordersApi.create(orderData);
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      } else {
        // إنشاء طلب محلي
        const newOrder: Order = {
          id: Date.now().toString(),
          customerName: orderData.customerName,
          phoneNumber: orderData.phoneNumber,
          address: orderData.address,
          totalAmount: 0, // سيتم حسابه
          status: 'Pending',
          orderDate: new Date().toISOString(),
          items: [{
            productId: orderData.productId,
            productName: '',
            quantity: orderData.quantity,
            price: 0,
            productImage: '',
          }],
        };
        
        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
        return newOrder;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في إنشاء الطلب');
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      if (isOnline) {
        await ordersApi.updateStatus(id, status);
      }
      
      const updatedOrders = orders.map(order => 
        order.id === id ? { ...order, status } : order
      );
      setOrders(updatedOrders);
      
      if (!isOnline) {
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحديث حالة الطلب');
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      if (isOnline) {
        await ordersApi.delete(id);
      }
      
      const updatedOrders = orders.filter(order => order.id !== id);
      setOrders(updatedOrders);
      
      if (!isOnline) {
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في حذف الطلب');
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    isOnline,
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
  };
};

// خطاف لحالة الاتصال
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      const connected = await generalApi.healthCheck();
      setIsOnline(connected);
      setLastChecked(new Date());
      return connected;
    } catch {
      setIsOnline(false);
      setLastChecked(new Date());
      return false;
    }
  };

  useEffect(() => {
    checkConnection();
    
    // فحص دوري كل 30 ثانية
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    isOnline,
    lastChecked,
    checkConnection,
  };
};
