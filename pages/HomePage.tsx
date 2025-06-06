
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/products/ProductCard';
import ImageSlider from '../components/products/ImageSlider';
import { Product } from '../types';
import { THEME_COLORS, DEFAULT_SITE_LOGO_URL } from '../constants';
import GiftAssistantModal from '../components/GiftAssistantModal';
import Button from '../components/ui/Button';
import { getAllItems, getSetting, STORES, SETTING_KEYS } from '../database';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customHeroImages, setCustomHeroImages] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingHeroImages, setIsLoadingHeroImages] = useState(true);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingProducts(true);
      setIsLoadingHeroImages(true);
      try {
        const dbProducts = await getAllItems<Product>(STORES.PRODUCTS);
        setProducts(dbProducts);

        const dbHeroImages = await getSetting<string[]>(SETTING_KEYS.HERO_SLIDER_IMAGES, []);
        setCustomHeroImages(dbHeroImages);
      } catch (error) {
        console.error("Error fetching data for HomePage:", error);
        // Set to empty or default to prevent app crash
        setProducts([]);
        setCustomHeroImages([]);
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingHeroImages(false);
      }
    };
    fetchData();
  }, []);

  let heroImagesToDisplay: string[];
  if (!isLoadingHeroImages && customHeroImages && customHeroImages.length > 0) {
    heroImagesToDisplay = customHeroImages;
  } else if (!isLoadingProducts && products.length > 0) {
    const productHeroImages = products.slice(0, 5).map(p => p.images[0]).filter(img => !!img);
    heroImagesToDisplay = productHeroImages.length > 0 ? productHeroImages : ['https://picsum.photos/seed/hero1/1200/600', 'https://picsum.photos/seed/hero2/1200/600', 'https://picsum.photos/seed/hero3/1200/600'];
  } else {
    heroImagesToDisplay = ['https://picsum.photos/seed/hero1/1200/600', 'https://picsum.photos/seed/hero2/1200/600', 'https://picsum.photos/seed/hero3/1200/600'];
  }
  
  return (
    <div className={`min-h-screen ${THEME_COLORS.background} pb-12 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950`}>
      {isLoadingHeroImages || isLoadingProducts ? 
        <div className={`w-full h-[calc(100vh-200px)] max-h-[600px] ${THEME_COLORS.cardBackground} flex items-center justify-center ${THEME_COLORS.textSecondary}`}>
          جاري تحميل الصور...
        </div> 
        : <ImageSlider images={heroImagesToDisplay} altText="عروض مميزة" isHero={true} />
      }
      
      <div className="container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
            <h2 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-3`}>🎁 هل تبحث عن هدية مميزة؟</h2>
            <p className={`${THEME_COLORS.textSecondary} text-lg mb-6 max-w-xl mx-auto`}>
                دع "مساعد الهدايا من ملوكة" يساعدك في العثور على القطعة المثالية لتعبر بها عن مشاعرك!
            </p>
            <Button 
                variant="primary" 
                size="lg" 
                onClick={() => setIsGiftModalOpen(true)}
                className="shadow-lg hover:shadow-amber-500/50 transform hover:scale-105"
                aria-label="افتح مساعد الهدايا"
                disabled={isLoadingProducts} // Disable if products not loaded yet
            >
                {isLoadingProducts ? "جاري تحميل المنتجات..." : "جرب مساعد الهدايا الآن ✨"}
            </Button>
        </section>

        <section className="mb-16">
          <h2 className={`text-4xl font-bold text-center mb-2 ${THEME_COLORS.accentGold}`}>أحدث المنتجات</h2>
          <h3 className={`text-2xl font-bold text-center mb-8 ${THEME_COLORS.accentGoldDarker}`}>MALOKA STORY</h3>
          <p className={`${THEME_COLORS.textSecondary} text-center text-lg mb-10`}>تصفح أحدث الإكسسوارات اللي وصلتلنا مخصوص علشانك.</p>
          {isLoadingProducts ? (
             <p className="text-center text-xl text-gray-400">جاري تحميل المنتجات...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-xl text-gray-400">لا توجد منتجات لعرضها حالياً. حاول مرة أخرى لاحقاً.</p>
          )}
        </section>

        <section>
          <div className={`${THEME_COLORS.cardBackground} p-8 rounded-xl shadow-xl text-center border ${THEME_COLORS.borderColorGold}`}>
            <h3 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-4`}>ليه تختارنا؟</h3>
            <p className={`${THEME_COLORS.textSecondary} text-lg max-w-2xl mx-auto`}>
              في {`"أناقة الستانلس"`}، بنقدم لك إكسسوارات من أجود أنواع الستانلس ستيل المقاوم للصدأ، بتصميمات عصرية وفريدة تناسب كل الأذواق. جودة عالية بأسعار مناسبة، وتوصيل سريع لكل مكان في مصر.
            </p>
          </div>
        </section>
      </div>
      <GiftAssistantModal 
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        availableProducts={products}
      />
    </div>
  );
};

export default HomePage;
