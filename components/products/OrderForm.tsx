import React, { useState } from 'react';
import { Product, Order } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { THEME_COLORS } from '../../constants';

interface OrderFormProps {
  product: Product;
  onSubmit: (orderDetails: Omit<Order, 'id' | 'orderDate' | 'status' | 'totalAmount' | 'items'> & { productId: string; quantity: number }) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ product, onSubmit }) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (phone: string): boolean => {
    const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;
    return egyptianPhoneRegex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPhoneError('');

    if (!customerName || !phoneNumber || !address || quantity < 1) {
      setError('يرجى ملء جميع الحقول والتأكد من أن الكمية صحيحة.');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010, 011, 012, أو 015 وأن يتكون من 11 رقمًا.');
      return;
    }

    onSubmit({
      customerName,
      phoneNumber,
      address,
      productId: product.id,
      quantity,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md">{error}</p>}
      
      <div>
        <h4 className={`text-lg font-semibold ${THEME_COLORS.accentGold}`}>{product.name}</h4>
        <p className={`${THEME_COLORS.textSecondary}`}>{product.price * quantity} جنيه (الكمية: {quantity})</p>
      </div>

      <Input
        label="اسمك الكريم"
        id="customerName"
        type="text"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        required
        placeholder="مثال: محمد أحمد"
      />
      <Input
        label="رقم تليفونك"
        id="phoneNumber"
        type="tel"
        value={phoneNumber}
        onChange={(e) => {
            setPhoneNumber(e.target.value);
            if (phoneError) setPhoneError(''); // Clear error on change
        }}
        required
        placeholder="مثال: 01001234567"
        error={phoneError} // Display phone-specific error here
      />
      <Input
        label="عنوانك بالتفصيل"
        id="address"
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        placeholder="مثال: ١٢ شارع النصر، مدينة نصر، القاهرة"
      />
       <div>
          <label htmlFor="quantity" className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>الكمية</label>
          <div className="flex items-center">
            <button 
              type="button" 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className={`p-2 ${THEME_COLORS.buttonGold} rounded-r-md`}
              aria-label="تقليل الكمية"
            >-</button>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value,10) || 1))}
              min="1"
              className="w-16 text-center rounded-none !ring-0"
              aria-label="الكمية"
            />
            <button 
              type="button" 
              onClick={() => setQuantity(q => q + 1)}
              className={`p-2 ${THEME_COLORS.buttonGold} rounded-l-md`}
              aria-label="زيادة الكمية"
            >+</button>
          </div>
        </div>
      <p className={`${THEME_COLORS.textSecondary} text-sm`}>
        سيب بياناتك واحنا هنتواصل معاك لتأكيد الطلب وتفاصيل الشحن.
      </p>
      <Button type="submit" variant="primary" size="lg" className="w-full">
        قدّم طلبك الآن
      </Button>
    </form>
  );
};

export default OrderForm;