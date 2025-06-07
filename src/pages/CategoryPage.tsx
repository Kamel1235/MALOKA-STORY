import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { Product, ProductCategory } from '../types';
import { THEME_COLORS } from '../constants';
import { useData } from '../contexts/DataContext'; // Import useData

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { products, isLoading } = useData(); // Use products from DataContext
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (categoryName && !isLoading && products.length > 0) {
      const categoryEnumKey = Object.keys(ProductCategory).find(
        key => ProductCategory[key as keyof typeof ProductCategory].toLowerCase() === categoryName.toLowerCase()
      );
      
      const targetCategory = categoryEnumKey ? ProductCategory[categoryEnumKey as keyof typeof ProductCategory] : undefined;

      if (targetCategory) {
        setCurrentCategory(targetCategory);
        setFilteredProducts(products.filter(p => p.category === targetCategory));
      } else {
        setCurrentCategory(categoryName);
        setFilteredProducts([]); 
      }
    }
     window.scrollTo(0, 0);
  }, [categoryName, products, isLoading]);

  return (
    <div className={`min-h-screen ${THEME_COLORS.background} pb-12 pt-8 bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950`}>
      <div className="container mx-auto px-4">
        <section>
          <h2 className={`text-4xl font-bold text-center mb-2 ${THEME_COLORS.accentGold}`}>
            {currentCategory || categoryName || "الفئة"}
          </h2>
          <p className={`${THEME_COLORS.textSecondary} text-center text-lg mb-10`}>
            تصفح أحدث المنتجات في فئة {currentCategory || categoryName || "مختارة"}.
          </p>
          {isLoading && !filteredProducts.length ? (
            <p className="text-center text-xl text-gray-400">جاري تحميل المنتجات...</p>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-xl text-gray-400">لا توجد منتجات في هذه الفئة حالياً.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryPage;
