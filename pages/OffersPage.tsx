
import React, { useState, useEffect } from 'react';
import { THEME_COLORS } from '../constants';
import ProductCard from '../components/products/ProductCard';
import { Product } from '../types';
import { getAllItems, STORES } from '../database';

const OffersPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const dbProducts = await getAllItems<Product>(STORES.PRODUCTS);
        setProducts(dbProducts);
      } catch (error) {
        console.error("Error fetching products for OffersPage:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
  const offerProducts = products.filter(p => p.price < 200).slice(0, 4);

  return (
    <div className={`min-h-screen ${THEME_COLORS.background} flex flex-col items-center justify-center p-8 pt-16 bg-gradient-to-tr from-indigo-950 via-purple-900 to-indigo-950`}>
      <div className={`${THEME_COLORS.cardBackground} p-10 rounded-xl shadow-2xl text-center border ${THEME_COLORS.borderColorGold} w-full max-w-4xl`}>
        <h1 className={`text-5xl font-bold ${THEME_COLORS.accentGold} mb-6`}>عروض خاصة!</h1>
        <p className={`${THEME_COLORS.textSecondary} text-xl mb-8`}>
          اكتشف أقوى العروض والتخفيضات على إكسسوارات مختارة. قريباً...
        </p>
        {isLoading ? (
          <p className={`${THEME_COLORS.textSecondary} text-lg`}>جاري تحميل العروض...</p>
        ) : offerProducts.length > 0 ? (
          <>
            <h2 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mt-12 mb-6`}>عروض حالية لا تفوتها:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {offerProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <p className={`${THEME_COLORS.textSecondary} text-lg mt-12`}>لا توجد عروض خاصة متاحة حالياً.</p>
        )}
        <img 
            src="https://picsum.photos/seed/offerbg/800/400" 
            alt="خلفية عروض" 
            className="mt-10 rounded-lg shadow-lg opacity-70 w-full object-cover h-64"
        />
      </div>
    </div>
  );
};

export default OffersPage;
