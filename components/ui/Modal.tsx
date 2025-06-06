
import React, { Fragment } from 'react';
import { THEME_COLORS } from '../../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out" aria-modal="true" role="dialog">
      <div className={`relative ${THEME_COLORS.cardBackground} p-6 rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${THEME_COLORS.accentGold}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`${THEME_COLORS.textSecondary} hover:text-white text-2xl`}
            aria-label="إغلاق"
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes modalShowAnimation {
          /* 'from' state is implicitly the element's current style (opacity:0, transform:scale(0.95) set by Tailwind classes) */
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalShow {
          /* This class applies the animation */
          animation-name: modalShowAnimation;
          animation-duration: 0.3s; /* Corresponds to Tailwind's duration-300 */
          animation-timing-function: ease-in-out; /* Corresponds to Tailwind's ease-in-out */
          animation-fill-mode: forwards; /* Crucial to keep the 'to' state after animation finishes */
        }
      `}</style>
    </div>
  );
};

export default Modal;
