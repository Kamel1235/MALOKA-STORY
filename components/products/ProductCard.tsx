
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { THEME_COLORS } from '../../constants';
import Button from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className={`${THEME_COLORS.cardBackground} rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-amber-500/30 group flex flex-col h-full border ${THEME_COLORS.borderColor} hover:${THEME_COLORS.borderColorGold}`}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="w-full h-64 overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className={`text-xl font-semibold ${THEME_COLORS.accentGold} mb-2 truncate group-hover:${THEME_COLORS.accentGoldDarker}`}>{product.name}</h3>
        </Link>
        <p className={`${THEME_COLORS.textSecondary} text-sm mb-3 h-10 overflow-hidden text-ellipsis`}>
          {product.description.substring(0, 70)}...
        </p>
        <p className={`text-2xl font-bold ${THEME_COLORS.textPrimary} mb-4`}>
          {product.price} جنيه
        </p>
        <div className="mt-auto">
          <Link to={`/product/${product.id}`} className="w-full block">
            <Button variant="primary" size="md" className="w-full">
              عرض التفاصيل
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
