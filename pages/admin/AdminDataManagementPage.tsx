
import React, { useState } from 'react';
import { THEME_COLORS, MANAGED_STORAGE_KEYS } from '../../constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminDataManagementPage: React.FC = () => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  const displayFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleExportData = () => {
    try {
      const dataToExport: { [key: string]: any } = {};
      MANAGED_STORAGE_KEYS.forEach(key => {
        const item = localStorage.getItem(key);
        if (item !== null) {
          try {
            dataToExport[key] = JSON.parse(item);
          } catch (e) {
            // If not JSON, store as is (e.g. plain string, though useLocalStorage usually stringifies)
            dataToExport[key] = item; 
            console.warn(`Item for key ${key} was not valid JSON, exporting as raw string. Value:`, item);
          }
        } else {
          dataToExport[key] = null; // Explicitly store null if item doesn't exist
        }
      });

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `MalokaStory-data-backup-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      displayFeedback('success', 'تم تصدير البيانات بنجاح!');
    } catch (error) {
      console.error("Error exporting data:", error);
      displayFeedback('error', 'حدث خطأ أثناء تصدير البيانات.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImportFile(event.target.files[0]);
      setFeedback(null); // Clear previous feedback
    } else {
      setImportFile(null);
    }
  };

  const handleImportData = () => {
    if (!importFile) {
      displayFeedback('error', 'يرجى اختيار ملف لاستيراده أولاً.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const importedData = JSON.parse(jsonString);

        if (typeof importedData !== 'object' || importedData === null) {
          throw new Error("الملف المستورد ليس بصيغة JSON صالحة أو فارغ.");
        }

        let importedKeysCount = 0;
        MANAGED_STORAGE_KEYS.forEach(key => {
          if (importedData.hasOwnProperty(key)) {
            // Ensure value is stringified before setting, as localStorage only stores strings
            // and useLocalStorage expects JSON.stringified values for objects/arrays.
            localStorage.setItem(key, JSON.stringify(importedData[key]));
            importedKeysCount++;
          } else {
            // If a managed key is missing from import file, remove it from localStorage
            // This ensures that if a setting was removed, it's reflected.
            // Or, you could choose to ignore missing keys. For now, let's clear it.
            localStorage.removeItem(key);
          }
        });
        
        if (importedKeysCount === 0) {
             displayFeedback('error', 'الملف المستورد لا يحتوي على أي بيانات مطابقة للمفاتيح المتوقعة.');
             return;
        }

        displayFeedback('success', `تم استيراد البيانات بنجاح من ${importedKeysCount} مفتاح/مفاتيح. يرجى تحديث الصفحة لتطبيق جميع التغييرات.`);
        // alert('تم استيراد البيانات بنجاح! يرجى تحديث الصفحة لتطبيق التغييرات.');
        // window.location.reload(); // Force reload to apply all changes
      } catch (error: any) {
        console.error("Error importing data:", error);
        displayFeedback('error', `حدث خطأ أثناء استيراد البيانات: ${error.message}`);
      } finally {
        // Reset file input
        const fileInput = document.getElementById('importFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setImportFile(null);
      }
    };
    reader.onerror = () => {
        displayFeedback('error', 'حدث خطأ أثناء قراءة الملف.');
        setImportFile(null);
    }
    reader.readAsText(importFile);
  };


  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl space-y-10`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-8`}>النسخ الاحتياطي والاستعادة للبيانات</h1>

      {feedback && (
        <div className={`mb-6 p-3 rounded-md text-white text-center ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {feedback.message}
        </div>
      )}

      {/* Export Data Section */}
      <section className={`p-6 border ${THEME_COLORS.borderColor} rounded-lg`}>
        <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker} mb-4`}>تصدير البيانات</h2>
        <p className={`${THEME_COLORS.textSecondary} text-sm mb-6`}>
          قم بتصدير جميع بيانات الموقع الهامة (المنتجات، الطلبات، الإعدادات، إلخ) كملف JSON. يمكنك استخدام هذا الملف كنسخة احتياطية أو لنقل البيانات.
        </p>
        <Button onClick={handleExportData} variant="primary" size="lg">
          تصدير البيانات الحالية
        </Button>
      </section>

      {/* Import Data Section */}
      <section className={`p-6 border ${THEME_COLORS.borderColor} rounded-lg`}>
        <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker} mb-4`}>استيراد البيانات</h2>
        <p className={`${THEME_COLORS.textSecondary} text-sm mb-3`}>
          قم باستيراد البيانات من ملف JSON تم تصديره مسبقًا. <strong className='text-amber-300'>تحذير:</strong> سيؤدي هذا إلى الكتابة فوق جميع البيانات الحالية بالبيانات الموجودة في الملف.
        </p>
        <p className={`${THEME_COLORS.textSecondary} text-sm mb-6`}>
            تأكد أن الملف هو ملف JSON صالح تم تصديره من هذا النظام. بعد الاستيراد، قد تحتاج إلى تحديث الصفحة.
        </p>
        <div className="space-y-4">
          <Input
            label="اختر ملف JSON للاستيراد:"
            type="file"
            id="importFile"
            accept=".json"
            onChange={handleFileChange}
          />
          <Button onClick={handleImportData} variant="danger" size="lg" disabled={!importFile}>
            استيراد البيانات من الملف
          </Button>
           {importFile && <p className={`${THEME_COLORS.textSecondary} text-xs mt-2`}>الملف المختار: {importFile.name}</p>}
        </div>
      </section>
       <p className={`${THEME_COLORS.textSecondary} text-xs mt-6`}>
        <strong>ملاحظة:</strong> قائمة المفاتيح التي تتم إدارتها: {MANAGED_STORAGE_KEYS.join(', ')}.
      </p>
    </div>
  );
};

export default AdminDataManagementPage;
