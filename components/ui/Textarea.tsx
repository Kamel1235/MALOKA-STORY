
import React from 'react';
import { THEME_COLORS } from '../../constants';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>{label}</label>}
      <textarea
        id={id}
        className={`w-full px-3 py-2 ${THEME_COLORS.inputBackground} ${THEME_COLORS.textPrimary} border ${error ? 'border-red-500' : THEME_COLORS.borderColor} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:${THEME_COLORS.borderColorGold} sm:text-sm ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Textarea;
