
import React, { useState, useMemo } from 'react';
import { useOrders } from '../../hooks/useApi';
import { Order } from '../../types';
import { THEME_COLORS } from '../../constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConnectionStatus from '../../components/ui/ConnectionStatus';

const AdminOrdersPage: React.FC = () => {
  const { orders, loading, error, isOnline, updateOrderStatus, deleteOrder } = useOrders();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Order['status'] | ''>('');

  const toggleOrderStatus = async (orderId: string, currentStatus: Order['status']) => {
    let nextStatus: Order['status'] = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'Processed';
    else if (currentStatus === 'Processed') nextStatus = 'Shipped';
    else if (currentStatus === 'Shipped') nextStatus = 'Delivered';

    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (error) {
      console.error('خطأ في تحديث حالة الطلب:', error);
      alert('حدث خطأ في تحديث حالة الطلب');
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

  const statusTranslations: Record<Order['status'], string> = {
    Pending: 'قيد الانتظار',
    Processed: 'قيد التجهيز',
    Shipped: 'تم الشحن',
    Delivered: 'تم التسليم',
  };

  const filteredAndSortedOrders = useMemo(() => {
    let currentOrders = [...orders];

    if (searchTerm) {
      currentOrders = currentOrders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phoneNumber.includes(searchTerm)
      );
    }

    if (filterStatus) {
      currentOrders = currentOrders.filter(order => order.status === filterStatus);
    }

    return currentOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, searchTerm, filterStatus]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
        <ConnectionStatus />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
        <p className={`${THEME_COLORS.textSecondary} text-lg`}>جاري تحميل الطلبات...</p>
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (error && orders.length === 0) {
    return (
      <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
        <ConnectionStatus />
        <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-6`}>إدارة الطلبات</h1>
        <p className="text-red-400 text-lg mb-4">⚠️ {error}</p>
        <p className={`${THEME_COLORS.textSecondary}`}>
          {isOnline ? 'حدث خطأ في تحميل البيانات' : 'يتم العمل في الوضع المحلي'}
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
        <ConnectionStatus />
        <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-6`}>الطلبات المستلمة</h1>
        <p className={`${THEME_COLORS.textSecondary}`}>لا توجد طلبات مستلمة حتى الآن.</p>
        {!isOnline && (
          <p className="text-yellow-400 text-sm mt-2">⚠️ وضع محلي</p>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <ConnectionStatus />
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold}`}>الطلبات المستلمة ({filteredAndSortedOrders.length})</h1>
        {!isOnline && (
          <span className="text-yellow-400 text-sm">⚠️ وضع محلي</span>
        )}
      </div>
      
      {/* Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center p-4 bg-purple-800/50 rounded-lg border border-purple-700">
        <Input 
          type="text"
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/3"
          aria-label="البحث في الطلبات"
        />
        <div className="w-full sm:w-1/3">
          <label htmlFor="statusFilter" className="sr-only">فلترة حسب الحالة</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Order['status'] | '')}
            className={`w-full px-3 py-2 ${THEME_COLORS.inputBackground} ${THEME_COLORS.textPrimary} border ${THEME_COLORS.borderColor} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:${THEME_COLORS.borderColorGold} sm:text-sm`}
          >
            <option value="">كل الحالات</option>
            {(Object.keys(statusTranslations) as Array<Order['status']>).map(statusKey => (
              <option key={statusKey} value={statusKey}>{statusTranslations[statusKey]}</option>
            ))}
          </select>
        </div>
        <Button onClick={handleClearFilters} variant="secondary" size="md" className="w-full sm:w-auto">
          مسح الفلاتر
        </Button>
      </div>

      {filteredAndSortedOrders.length === 0 ? (
        <p className={`${THEME_COLORS.textSecondary} text-center py-4`}>لا توجد طلبات تطابق معايير البحث الحالية.</p>
      ) : (
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
              {filteredAndSortedOrders.map((order) => (
                <React.Fragment key={order.id}>
                <tr>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{new Date(order.orderDate).toLocaleDateString('ar-EG')}</td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{order.customerName}</td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{order.phoneNumber}</td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">{order.totalAmount} جنيه</td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} text-white`}>
                      {statusTranslations[order.status]}
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
      )}
    </div>
  );
};

export default AdminOrdersPage;
