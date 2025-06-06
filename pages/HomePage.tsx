
import React from 'react';
import ProductCard from '../components/products/ProductCard';
import ImageSlider from '../components/products/ImageSlider';
import useLocalStorage from '../hooks/useLocalStorage';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { THEME_COLORS, ADMIN_SETTINGS_HERO_SLIDER_IMAGES_KEY } from '../constants';

const HomePage: React.FC = () => {
  const [products] = useLocalStorage<Product[]>('products', INITIAL_PRODUCTS);
  const [customHeroImages] = useLocalStorage<string[]>(ADMIN_SETTINGS_HERO_SLIDER_IMAGES_KEY, []);

  let heroImagesToDisplay: string[];

  if (customHeroImages && customHeroImages.length > 0) {
    heroImagesToDisplay = customHeroImages;
  } else {
    const productHeroImages = products.slice(0, 5).map(p => p.images[0]).filter(img => !!img);
    if (productHeroImages.length > 0) {
      heroImagesToDisplay = productHeroImages;
    } else {
      heroImagesToDisplay = ['https://picsum.photos/seed/hero1/1200/600', 'https://picsum.photos/seed/hero2/1200/600', 'https://picsum.photos/seed/hero3/1200/600'];
    }
  }
  
  return (
    <div className={`min-h-screen ${THEME_COLORS.background} pb-12 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950`}>
      <ImageSlider images={heroImagesToDisplay} altText="عروض مميزة" isHero={true} />
      
      <div className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className={`text-4xl font-bold text-center mb-2 ${THEME_COLORS.accentGold}`}>أحدث المنتجات</h2>
          <h3 className={`text-2xl font-bold text-center mb-8 ${THEME_COLORS.accentGoldDarker}`}>MALOKA STORY</h3>
          <p className={`${THEME_COLORS.textSecondary} text-center text-lg mb-10`}>تصفح أحدث الإكسسوارات اللي وصلتلنا مخصوص علشانك.</p>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.slice(0, 8).map((product) => ( // Show first 8 products
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
    </div>
  );
};

export default HomePage;