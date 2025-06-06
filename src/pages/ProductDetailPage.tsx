import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Order, OrderItem } from '../types';
import ImageSlider from '../components/products/ImageSlider';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import OrderForm from '../components/products/OrderForm';
import { THEME_COLORS } from '../constants';
import ProductCard from '../components/products/ProductCard';
import { getStylingTips } from '../utils/geminiApi';
import { useData } from '../contexts/DataContext';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, isLoading, addOrder } = useData(); 
  
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<{type: 'success' | 'error', message: string, image?: string} | null>(null);

  const [isFetchingTips, setIsFetchingTips] = useState(false);
  const [stylingTips, setStylingTips] = useState<string | null>(null);
  const [stylingTipsError, setStylingTipsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && products.length > 0) {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
        const related = products.filter(p => p.category === foundProduct.category && p.id !== foundProduct.id).slice(0, 3);
        setRelatedProducts(related);
        setStylingTips(null);
        setStylingTipsError(null);
        setIsFetchingTips(false);
      } else {
        // console.log(`Product with ID ${productId} not found.`);
        // navigate('/404'); // Or handle appropriately
      }
    }
    window.scrollTo(0, 0);
  }, [productId, products, isLoading, navigate]);

  const handleOrderSubmit = async (orderDetails: Omit<Order, 'id' | 'orderDate' | 'status' | 'totalAmount' | 'items'> & { productId: string; quantity: number }) => {
    setOrderFeedback(null); 

    if (!product) {
      setOrderFeedback({ type: 'error', message: "خطأ في تحميل تفاصيل المنتج. يرجى تحديث الصفحة والمحاولة مرة أخرى." });
      return;
    }

    const orderItem: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantity: orderDetails.quantity,
      price: product.price,
      productImage: product.images[0] || 'https://via.placeholder.com/100?text=No+Image',
    };

    const orderDataForApi: Omit<Order, 'id' | 'orderDate' | 'status'> = {
        customerName: orderDetails.customerName,
        phoneNumber: orderDetails.phoneNumber,
        address: orderDetails.address,
        items: [orderItem],
        totalAmount: product.price * orderDetails.quantity,
    };

    try {
      await addOrder(orderDataForApi); // Call addOrder from DataContext
      setIsOrderModalOpen(false); 
      setOrderFeedback({ 
        type: 'success', 
        message: 'تم استلام طلبك بنجاح! سنتواصل معك قريباً لتأكيد الطلب.',
        image: product.images[0] || undefined
      });
      setTimeout(() => setOrderFeedback(null), 7000); 
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

  if (isLoading && !product) {
    return <div className={`min-h-screen flex items-center justify-center ${THEME_COLORS.background} ${THEME_COLORS.textPrimary}`}>جاري تحميل المنتج...</div>;
  }
  
  if (!product && !isLoading) { // Added !isLoading condition
     return <div className={`min-h-screen flex items-center justify-center ${THEME_COLORS.background} ${THEME_COLORS.textPrimary}`}>المنتج غير موجود أو لم يتم تحميله.</div>;
  }
  
  // Render nothing or a minimal placeholder if product is still undefined after loading.
  // This can happen if the product ID is invalid.
  if (!product) {
    return null; 
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
