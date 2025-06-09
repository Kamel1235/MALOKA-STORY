
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage'; // Will be partially removed for orders later
import { Product, Order, OrderItem } from '../types';
import { useData } from '../contexts/DataContext'; // Added
import ImageSlider from '../components/products/ImageSlider';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import OrderForm from '../components/products/OrderForm';
import { THEME_COLORS } from '../constants';
import ProductCard from '../components/products/ProductCard';
import { getStylingTips } from '../utils/geminiApi'; // Import Gemini API util

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  // products state will come from useData
  const { products, isLoading: productsLoading, error: productsError, addOrder } = useData();
  // const [orders, setOrders] = useLocalStorage<Order[]>('orders', []); // Removed for orders
  
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [productFound, setProductFound] = useState<boolean>(true); // To track if product exists
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<{type: 'success' | 'error', message: string, image?: string} | null>(null);

  const [isFetchingTips, setIsFetchingTips] = useState(false);
  const [stylingTips, setStylingTips] = useState<string | null>(null);
  const [stylingTipsError, setStylingTipsError] = useState<string | null>(null);

  useEffect(() => {
    if (products && products.length > 0) { // Check if products are loaded
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        setProductFound(true);
        const related = products.filter(p => p.category === foundProduct.category && p.id !== foundProduct.id).slice(0, 3);
        setRelatedProducts(related);
        // Reset tips when product changes
        setStylingTips(null);
        setStylingTipsError(null);
        setIsFetchingTips(false);
      } else {
        setProduct(undefined);
        setProductFound(false);
      }
    } else if (!productsLoading && products && products.length === 0) { // Products loaded but empty
        setProduct(undefined);
        setProductFound(false);
    }
    window.scrollTo(0, 0);
  }, [productId, products, navigate, productsLoading]);

  const handleOrderSubmit = async (formData: Omit<Order, 'id' | 'orderDate' | 'status' | 'totalAmount' | 'items'> & { quantity: number }) => {
    setOrderFeedback(null);

    if (!product) {
      setOrderFeedback({ type: 'error', message: "خطأ في تحميل تفاصيل المنتج. يرجى تحديث الصفحة والمحاولة مرة أخرى." });
      return;
    }

    // Prepare order data for the addOrder function from DataContext
    // It should be Omit<Order, 'id' | 'orderDate' | 'status'>
    const newOrderData = {
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        items: [{
            productId: product.id,
            productName: product.name,
            quantity: formData.quantity,
            price: product.price,
            productImage: product.images[0] || 'https://via.placeholder.com/100?text=No+Image',
        }],
        totalAmount: product.price * formData.quantity,
        // id, orderDate, and status will be set by the backend
    };

    try {
      const submittedOrder = await addOrder(newOrderData);
      if (submittedOrder) {
        setIsOrderModalOpen(false);
        setOrderFeedback({
          type: 'success',
          message: 'تم استلام طلبك بنجاح! سنتواصل معك قريباً لتأكيد الطلب. رقم الطلب: ' + submittedOrder.id,
          image: product.images[0] || undefined
        });
        setTimeout(() => setOrderFeedback(null), 7000);
      } else {
        setOrderFeedback({ type: 'error', message: "فشل في إرسال الطلب. يرجى المحاولة مرة أخرى." });
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setOrderFeedback({ type: 'error', message: "حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى أو الاتصال بنا إذا تكررت المشكلة." });
    }
  };

  const handleFetchStylingTips = async () => {
    if (!product) return;
    setIsFetchingTips(true);
    setStylingTips(null);
    setStylingTipsError(null);
    try {
      const tips = await getStylingTips(product.name, product.category, product.description);
      setStylingTips(tips);
    } catch (error: any) {
      setStylingTipsError(error.message || "حدث خطأ أثناء جلب نصائح التنسيق.");
    } finally {
      setIsFetchingTips(false);
    }
  };

  if (productsLoading) {
    return <div className={`min-h-screen flex items-center justify-center ${THEME_COLORS.background} ${THEME_COLORS.textPrimary}`}>جاري تحميل المنتج...</div>;
  }

  if (productsError) {
    return <div className={`min-h-screen flex flex-col items-center justify-center ${THEME_COLORS.background} ${THEME_COLORS.textPrimary} p-4 text-center`}>
        <p className="text-xl text-red-400 bg-red-900/30 p-4 rounded-md">خطأ في تحميل بيانات المنتج: {productsError}</p>
        <p className="mt-2">يرجى المحاولة مرة أخرى لاحقاً.</p>
    </div>;
  }

  if (!product && !productsLoading && productFound === false) { // Explicitly check productFound
    return <div className={`min-h-screen flex items-center justify-center ${THEME_COLORS.background} ${THEME_COLORS.textPrimary}`}>المنتج غير موجود.</div>;
  }

  if (!product) { // Fallback for any other state where product is not set but not explicitly "not found" yet (e.g. initial render before useEffect runs)
    return <div className={`min-h-screen flex items-center justify-center ${THEME_COLORS.background} ${THEME_COLORS.textPrimary}`}>جاري تهيئة صفحة المنتج...</div>;
  }


  return (
    <div className={`min-h-screen ${THEME_COLORS.background} pb-12 pt-8 bg-gradient-to-bl from-indigo-950 via-purple-900 to-indigo-950`}>
      <div className="container mx-auto px-4">
        
        {orderFeedback && (
          <div className={`p-4 my-6 rounded-md text-center shadow-lg ${orderFeedback.type === 'success' ? 'bg-green-600 border border-green-500 text-white' : 'bg-red-600 border border-red-500 text-white'}`}
               role="alert">
            {orderFeedback.type === 'success' && orderFeedback.image && (
              <img 
                src={orderFeedback.image} 
                alt="المنتج المطلوب" 
                className="w-24 h-24 object-cover rounded-md mx-auto mb-3 border-2 border-white shadow-sm"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <p className="text-lg">{orderFeedback.message}</p>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start ${THEME_COLORS.cardBackground} p-6 md:p-10 rounded-xl shadow-2xl border ${THEME_COLORS.borderColor}`}>
          <div className="md:col-span-1">
            <ImageSlider images={product.images} altText={product.name} />
          </div>

          <div className="md:col-span-1 flex flex-col justify-between h-full">
            <div>
              <h1 className={`text-4xl font-bold ${THEME_COLORS.accentGold} mb-4`}>{product.name}</h1>
              <p className={`text-3xl font-semibold ${THEME_COLORS.textPrimary} mb-6`}>{product.price} جنيه</p>
              <div className={`prose prose-sm md:prose-base max-w-none ${THEME_COLORS.textSecondary} mb-8`}>
                <h4 className={`font-semibold ${THEME_COLORS.accentGoldDarker} mb-2`}>الوصف:</h4>
                <p>{product.description || "لا يوجد وصف متوفر حالياً."}</p>
              </div>
              <p className={`${THEME_COLORS.textSecondary} mb-2`}><span className="font-semibold">الفئة:</span> {product.category}</p>
            </div>
            
            <div className="mt-auto space-y-4">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => {
                  setOrderFeedback(null); 
                  setIsOrderModalOpen(true);
                }}
                className="w-full"
                aria-label={`اطلب الآن ${product.name}`}
              >
                اطلب دلوقتي
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleFetchStylingTips}
                disabled={isFetchingTips}
                className="w-full"
                aria-label="احصل على نصائح لتنسيق هذه القطعة"
              >
                {isFetchingTips ? "✨ جاري البحث عن نصائح..." : "✨ كيف أنسق هذه القطعة؟"}
              </Button>
            </div>
          </div>
        </div>

        {/* Styling Tips Section */}
        {stylingTipsError && (
          <div className="mt-6 p-4 rounded-md bg-red-700 text-white text-center shadow">
            {stylingTipsError}
          </div>
        )}
        {stylingTips && (
          <div className={`mt-8 p-6 rounded-xl shadow-lg ${THEME_COLORS.cardBackground} border ${THEME_COLORS.borderColorGold}`}>
            <h3 className={`text-2xl font-semibold ${THEME_COLORS.accentGold} mb-4`}>نصائح لتنسيق أناقتك:</h3>
            <div className={`${THEME_COLORS.textSecondary} whitespace-pre-line leading-relaxed`}>
              {stylingTips.split('\n').map((tip, index) => (
                <p key={index} className="mb-2">- {tip}</p>
              ))}
            </div>
          </div>
        )}


        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className={`text-3xl font-bold text-center mb-2 ${THEME_COLORS.accentGold}`}>منتجات مشابهة قد تعجبك</h2>
            <p className={`${THEME_COLORS.textSecondary} text-center text-lg mb-10`}>إكسسوارات تانية ممكن تكمل أناقتك.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Modal 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        title={`تقديم طلب شراء: ${product.name}`}
      >
        <OrderForm product={product} onSubmit={handleOrderSubmit} />
      </Modal>
    </div>
  );
};

export default ProductDetailPage;