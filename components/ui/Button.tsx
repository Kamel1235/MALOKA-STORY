
import React from 'react';
import { THEME_COLORS } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = 'font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-950';
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = `${THEME_COLORS.buttonGold} ${THEME_COLORS.textPrimary} hover:${THEME_COLORS.buttonGoldHover} focus:${THEME_COLORS.buttonGoldHover} focus:ring-amber-500`;
      break;
    case 'secondary':
      variantStyle = `bg-purple-700 text-white hover:bg-purple-600 focus:bg-purple-600 focus:ring-purple-500`;
      break;
    case 'danger':
      variantStyle = `bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 focus:ring-red-500`;
      break;
    case 'ghost':
      variantStyle = `${THEME_COLORS.accentGold} hover:${THEME_COLORS.accentGoldDarker} focus:ring-amber-500 underline`;
      break;
  }

  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'px-3 py-1.5 text-sm';
      break;
    case 'md':
      sizeStyle = 'px-4 py-2 text-base';
      break;
    case 'lg':
      sizeStyle = 'px-6 py-3 text-lg';
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
