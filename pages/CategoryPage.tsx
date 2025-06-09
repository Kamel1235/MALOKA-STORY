
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
// import useLocalStorage from '../hooks/useLocalStorage'; // No longer needed for products
import { Product, ProductCategory } from '../types';
// import { INITIAL_PRODUCTS } from '../data/mockProducts'; // No longer needed
import { useData } from '../contexts/DataContext'; // Added
import { THEME_COLORS } from '../constants';

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { products, isLoading, error } = useData(); // Use DataContext
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentCategoryDisplayName, setCurrentCategoryDisplayName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (categoryName && products) { // Ensure products are loaded
      const categoryEnumKey = Object.keys(ProductCategory).find(
        key => ProductCategory[key as keyof typeof ProductCategory].toLowerCase() === categoryName.toLowerCase()
      );
      
      const targetCategoryValue = categoryEnumKey ? ProductCategory[categoryEnumKey as keyof typeof ProductCategory] : undefined;

      if (targetCategoryValue) {
        setCurrentCategoryDisplayName(targetCategoryValue); // Use the official enum value for display
        setFilteredProducts(products.filter(p => p.category === targetCategoryValue));
      } else {
        // If categoryName doesn't match any predefined ProductCategory,
        // treat it as a raw category name (maybe for future dynamic categories or just to show "not found")
        setCurrentCategoryDisplayName(categoryName);
        setFilteredProducts([]);
      }
    } else if (categoryName && !products && !isLoading) {
      // Products are not available, and not loading (e.g. error or empty initial load)
      setCurrentCategoryDisplayName(categoryName);
      setFilteredProducts([]);
    }
     window.scrollTo(0, 0);
  }, [categoryName, products, isLoading]); // Add isLoading to dependencies

  const getCategoryTitle = () => {
    if (!categoryName) return "الفئات";
    // Attempt to find a matching display name from ProductCategory enum keys if currentCategoryDisplayName is a value
    const foundKey = Object.keys(ProductCategory).find(key =>
        ProductCategory[key as keyof typeof ProductCategory] === currentCategoryDisplayName
    );
    return foundKey ? currentCategoryDisplayName : categoryName; // Fallback to categoryName if not found (e.g. "All")
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen ${THEME_COLORS.background} flex justify-center items-center pb-12 pt-8`}>
        <p className={`text-xl ${THEME_COLORS.textPrimary}`}>جاري تحميل المنتجات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${THEME_COLORS.background} flex flex-col justify-center items-center pb-12 pt-8 px-4`}>
        <p className={`text-xl text-red-400 bg-red-900/30 p-4 rounded-md`}>حدث خطأ أثناء تحميل المنتجات: {error}</p>
        <p className={`${THEME_COLORS.textSecondary} mt-2`}>يرجى المحاولة مرة أخرى لاحقاً.</p>
      </div>
    );
  }

  // Determine the display name for the category
  const displayCategoryName = currentCategoryDisplayName || categoryName || "الفئة";

  return (
    <div className={`min-h-screen ${THEME_COLORS.background} pb-12 pt-8 bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950`}>
      <div className="container mx-auto px-4">
        <section>
          <h2 className={`text-4xl font-bold text-center mb-2 ${THEME_COLORS.accentGold}`}>
            {getCategoryTitle()}
          </h2>
          <p className={`${THEME_COLORS.textSecondary} text-center text-lg mb-10`}>
            تصفح أحدث المنتجات في فئة {getCategoryTitle()}.
          </p>

          {!products || products.length === 0 ? (
            <p className={`text-center text-xl ${THEME_COLORS.textSecondary}`}>لا توجد منتجات متاحة لعرضها حالياً.</p>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className={`text-center text-xl ${THEME_COLORS.textSecondary}`}>
              لا توجد منتجات في فئة "{getCategoryTitle()}" حالياً.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryPage;
