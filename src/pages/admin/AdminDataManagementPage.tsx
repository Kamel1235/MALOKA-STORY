import React, { useState } from 'react';
import { THEME_COLORS } from '../../constants';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/ui/Button';

const AdminDataManagementPage: React.FC = () => {
  const { exportData, importData, clearAllData, products, orders, settings } = useData();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleExportData = () => {
    try {
      const data = exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maloka-store-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message: 'تم تصدير البيانات بنجاح!'
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'فشل في تصدير البيانات'
      });
    }
  };

  const handleImportData = async () => {
    if (!importFile) {
      setFeedback({
        type: 'error',
        message: 'يرجى اختيار ملف للاستيراد'
      });
      return;
    }

    setIsImporting(true);
    try {
      const fileContent = await importFile.text();
      const data = JSON.parse(fileContent);
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('تنسيق الملف غير صحيح');
      }

      importData(data);
      
      setFeedback({
        type: 'success',
        message: 'تم استيراد البيانات بنجاح!'
      });
      setImportFile(null);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'فشل في استيراد البيانات'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      try {
        clearAllData();
        setFeedback({
          type: 'success',
          message: 'تم حذف جميع البيانات بنجاح'
        });
      } catch (error) {
        setFeedback({
          type: 'error',
          message: 'فشل في حذف البيانات'
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setFeedback({
          type: 'error',
          message: 'يرجى اختيار ملف JSON فقط'
        });
        return;
      }
      setImportFile(file);
      setFeedback(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${THEME_COLORS.cardBackground} rounded-lg p-6 shadow-lg border ${THEME_COLORS.borderColor}`}>
        <h2 className={`text-2xl font-bold ${THEME_COLORS.textPrimary} mb-6`}>
          إدارة البيانات
        </h2>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`${THEME_COLORS.background} p-4 rounded-lg border ${THEME_COLORS.borderColor}`}>
            <h3 className={`text-lg font-semibold ${THEME_COLORS.accentGold} mb-2`}>المنتجات</h3>
            <p className={`text-2xl font-bold ${THEME_COLORS.textPrimary}`}>{products.length}</p>
          </div>
          <div className={`${THEME_COLORS.background} p-4 rounded-lg border ${THEME_COLORS.borderColor}`}>
            <h3 className={`text-lg font-semibold ${THEME_COLORS.accentGold} mb-2`}>الطلبات</h3>
            <p className={`text-2xl font-bold ${THEME_COLORS.textPrimary}`}>{orders.length}</p>
          </div>
          <div className={`${THEME_COLORS.background} p-4 rounded-lg border ${THEME_COLORS.borderColor}`}>
            <h3 className={`text-lg font-semibold ${THEME_COLORS.accentGold} mb-2`}>الإعدادات</h3>
            <p className={`text-2xl font-bold ${THEME_COLORS.textPrimary}`}>{settings ? '✓' : '✗'}</p>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`p-4 rounded-lg mb-6 ${
            feedback.type === 'success' 
              ? 'bg-green-700 text-green-100' 
              : 'bg-red-700 text-red-100'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Export Section */}
        <div className="mb-8">
          <h3 className={`text-xl font-semibold ${THEME_COLORS.textPrimary} mb-4`}>
            تصدير البيانات
          </h3>
          <p className={`${THEME_COLORS.textSecondary} mb-4`}>
            قم بتصدير جميع بيانات المتجر (المنتجات، الطلبات، الإعدادات) إلى ملف JSON
          </p>
          <Button
            onClick={handleExportData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            تصدير البيانات
          </Button>
        </div>

        {/* Import Section */}
        <div className="mb-8">
          <h3 className={`text-xl font-semibold ${THEME_COLORS.textPrimary} mb-4`}>
            استيراد البيانات
          </h3>
          <p className={`${THEME_COLORS.textSecondary} mb-4`}>
            قم باستيراد البيانات من ملف JSON. سيتم دمج البيانات الجديدة مع البيانات الموجودة.
          </p>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className={`block w-full text-sm ${THEME_COLORS.textPrimary}
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-amber-500 file:text-white
                  hover:file:bg-amber-600
                  file:cursor-pointer cursor-pointer
                  ${THEME_COLORS.background} border ${THEME_COLORS.borderColor} rounded-lg p-2`}
              />
            </div>
            {importFile && (
              <div className={`text-sm ${THEME_COLORS.textSecondary}`}>
                الملف المحدد: {importFile.name}
              </div>
            )}
            <Button
              onClick={handleImportData}
              disabled={!importFile || isImporting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
            >
              {isImporting ? 'جاري الاستيراد...' : 'استيراد البيانات'}
            </Button>
          </div>
        </div>

        {/* Clear Data Section */}
        <div className="border-t border-red-600 pt-6">
          <h3 className={`text-xl font-semibold text-red-400 mb-4`}>
            منطقة الخطر
          </h3>
          <p className={`${THEME_COLORS.textSecondary} mb-4`}>
            حذف جميع البيانات بشكل دائم. هذا الإجراء لا يمكن التراجع عنه!
          </p>
          <Button
            onClick={handleClearAllData}
            className="bg-red-600 hover:bg-red-700"
          >
            حذف جميع البيانات
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className={`${THEME_COLORS.cardBackground} rounded-lg p-6 shadow-lg border ${THEME_COLORS.borderColor}`}>
        <h3 className={`text-xl font-semibold ${THEME_COLORS.textPrimary} mb-4`}>
          تعليمات مهمة
        </h3>
        <div className={`${THEME_COLORS.textSecondary} space-y-2`}>
          <p>• يتم حفظ جميع البيانات محلياً في متصفحك</p>
          <p>• قم بتصدير البيانات بانتظام كنسخة احتياطية</p>
          <p>• عند تغيير المتصفح أو الجهاز، استخدم ميزة الاستيراد لنقل البيانات</p>
          <p>• تأكد من صحة ملف JSON قبل الاستيراد</p>
          <p>• يمكنك مشاركة ملف البيانات مع أشخاص آخرين لنسخ المتجر</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDataManagementPage;
