
import React from 'react';
import { THEME_COLORS, SITE_NAME } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className={`${THEME_COLORS.cardBackground} text-center py-8 mt-12 border-t ${THEME_COLORS.borderColor}`}>
      <div className="container mx-auto px-4">
        <p className={`${THEME_COLORS.textSecondary} text-sm`}>
          &copy; {new Date().getFullYear()} {SITE_NAME}. جميع الحقوق محفوظة.
        </p>
        <p className={`mt-2 text-xs ${THEME_COLORS.textSecondary}`}>
          تصميم أنيق لإكسسوارات فريدة
        </p>
      </div>
    </footer>
  );
};

export default Footer;
