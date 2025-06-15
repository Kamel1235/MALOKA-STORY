import React from 'react';
import { useConnectionStatus } from '../../hooks/useApi';
import { THEME_COLORS } from '../../constants';

const ConnectionStatus: React.FC = () => {
  const { isOnline, lastChecked, checkConnection } = useConnectionStatus();

  if (isOnline === null) {
    return (
      <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg ${THEME_COLORS.cardBackground} border ${THEME_COLORS.borderColor} shadow-lg`}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className={`text-sm ${THEME_COLORS.textSecondary}`}>جاري فحص الاتصال...</span>
        </div>
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg bg-green-900/80 border border-green-700 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-green-200">متصل بالخادم</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg bg-red-900/80 border border-red-700 shadow-lg backdrop-blur-sm`}>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
        <div className="flex flex-col">
          <span className="text-sm text-red-200">غير متصل - وضع محلي</span>
          <button 
            onClick={checkConnection}
            className="text-xs text-red-300 hover:text-red-100 underline mt-1"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
