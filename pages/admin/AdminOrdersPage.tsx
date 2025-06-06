
import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { THEME_COLORS } from '../../constants';
import Button from '../../components/ui/Button';
import { getAllItems, updateItem, STORES } from '../../database';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const dbOrders = await getAllItems<Order>(STORES.ORDERS);
        setOrders(dbOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrderStatus = async (orderId: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'] = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'Processed';
    else if (currentStatus === 'Processed') nextStatus = 'Shipped';
    else if (currentStatus === 'Shipped') nextStatus = 'Delivered';
    
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (orderToUpdate) {
      const updatedOrder = { ...orderToUpdate, status: nextStatus };
      try {
        await updateItem<Order>(STORES.ORDERS, updatedOrder);
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? updatedOrder : order
          )
        );
      } catch (error) {
        console.error("Error updating order status:", error);
        // Optionally show an error message to the user
      }
    }
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-600';
      case 'Processed': return 'bg-blue-600';
      case 'Shipped': return 'bg-green-600';
      case 'Delivered': return 'bg-purple-600';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-6`}>الطلبات المستلمة</h1>
      <p className={`${THEME_COLORS.textSecondary}`}>جاري تحميل الطلبات...</p>
    </div>;
  }

  if (orders.length === 0) {
    return <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-6`}>الطلبات المستلمة</h1>
      <p className={`${THEME_COLORS.textSecondary}`}>لا توجد طلبات مستلمة حتى الآن.</p>
    </div>;
  }

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-8`}>الطلبات المستلمة ({orders.length})</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-purple-700">
          <thead className="bg-purple-800">
            <tr>
              <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>تاريخ الطلب</th>
              <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>اسم العميل</th>
              <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>رقم التليفون</th>
              <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>الإجمالي</th>
              <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>الحالة</th>
              <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>إجراءات</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-purple-800 ${THEME_COLORS.textPrimary}`}>
            {orders.map((order) => (
              <React.Fragment key={order.id}>
              <tr>
                <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{new Date(order.orderDate).toLocaleDateString('ar-EG')}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{order.customerName}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{order.phoneNumber}</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{order.totalAmount} جنيه</td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} text-white`}>
                    {order.status === 'Pending' ? 'قيد الانتظار' : order.status === 'Processed' ? 'قيد التجهيز' : order.status === 'Shipped' ? 'تم الشحن' : 'تم التسليم'}
                  </span>
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm space-y-1 md:space-y-0 md:space-x-2 md:space-x-reverse flex flex-col md:flex-row items-start">
                  <Button size="sm" variant="secondary" onClick={() => toggleOrderStatus(order.id, order.status)} className="w-full md:w-auto">تغيير الحالة</Button>
                  <Button size="sm" variant="ghost" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className="w-full md:w-auto">
                    {expandedOrderId === order.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                  </Button>
                </td>
              </tr>
              {expandedOrderId === order.id && (
                 <tr>
                    <td colSpan={6} className={`p-4 bg-purple-800 border-t-2 ${THEME_COLORS.borderColorGold}`}>
                        <h4 className={`text-md font-semibold ${THEME_COLORS.accentGold} mb-3`}>تفاصيل الطلب:</h4>
                        <p className="mb-1"><strong>العنوان:</strong> {order.address}</p>
                        <h5 className={`text-sm font-semibold ${THEME_COLORS.accentGold} mt-3 mb-2`}>المنتجات:</h5>
                        <ul className="space-y-2">
                            {order.items.map(item => (
                                <li key={item.productId} className="flex items-center space-x-3 space-x-reverse p-2 bg-purple-900 rounded-md">
                                    <img 
                                        src={item.productImage} 
                                        alt={item.productName} 
                                        className="w-14 h-14 object-cover rounded shadow-sm border border-purple-700" 
                                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/50?text=NoImg')}
                                    />
                                    <div>
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-xs text-gray-300">الكمية: {item.quantity}</p>
                                        <p className="text-xs text-gray-300">السعر الإجمالي: {item.price * item.quantity} جنيه</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </td>
                 </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
