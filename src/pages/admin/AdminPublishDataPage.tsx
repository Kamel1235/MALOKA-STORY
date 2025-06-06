import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { THEME_COLORS } from '../../constants';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';

const AdminPublishDataPage: React.FC = () => {
  const { publishData, isLoading: dataLoading } = useData();
  const [productsJson, setProductsJson] = useState<string>('');
  const [settingsJson, setSettingsJson] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrepareData = () => {
    setIsLoading(true);
    setFeedback(null);
    const data = publishData();
    if (data) {
      setProductsJson(data.productsJson);
      setSettingsJson(data.settingsJson);
      setFeedback('تم تحضير بيانات الموقع للنشر. قم بنسخ المحتوى وتحديث الملفات في مستودعك.');
    } else {
      setFeedback('خطأ: لم يتم تحميل البيانات بشكل كامل أو حدث خطأ أثناء تحضيرها.');
      setProductsJson('');
      setSettingsJson('');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Automatically prepare data when page loads and data is not loading from context
    if (!dataLoading) {
        handlePrepareData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoading]); // Rerun if dataLoading state changes (e.g., initial load finishes)


  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`تم نسخ محتوى ${type} إلى الحافظة!`);
    }).catch(err => {
      alert(`فشل نسخ المحتوى. ${err}`);
    });
  };

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-6`}>نشر تغييرات الموقع</h1>
      <p className={`${THEME_COLORS.textSecondary} mb-6`}>
        هذه الصفحة تساعدك على تحديث ملفات البيانات الرئيسية لموقعك (<code>products.json</code> و <code>settings.json</code>).
        التغييرات التي أجريتها في لوحة التحكم (مثل إضافة منتجات أو تعديل الإعدادات) يتم حفظها مؤقتًا في جلسة عملك.
        لجعل هذه التغييرات دائمة ومرئية لجميع المستخدمين، اتبع الخطوات التالية:
      </p>
      <ol className={`list-decimal list-inside ${THEME_COLORS.textSecondary} space-y-2 mb-8 bg-purple-800/50 p-4 rounded-md border ${THEME_COLORS.borderColor}`}>
        <li>اضغط على زر "تحضير/تحديث بيانات النشر" أدناه. سيقوم هذا بتجميع أحدث البيانات من جلسة عملك.</li>
        <li>سيظهر محتوى ملفي <code>products.json</code> و <code>settings.json</code> في مربعات النص.</li>
        <li>
          لكل ملف:
          <ul className="list-disc list-inside ml-4 mt-1">
            <li>اضغط على زر "نسخ" لنسخ المحتوى بالكامل.</li>
            <li>اذهب إلى مشروعك (الكود المصدري للموقع).</li>
            <li>افتح الملف المقابل (<code>public/data/products.json</code> أو <code>public/data/settings.json</code>).</li>
            <li>احذف كل المحتوى القديم في الملف والصق المحتوى الجديد الذي نسخته.</li>
            <li>احفظ الملف.</li>
          </ul>
        </li>
        <li>بعد تحديث كلا الملفين، قم بعمل commit و push للتغييرات إلى مستودع GitHub الخاص بك.</li>
        <li>انتظر حتى يتم إعادة نشر موقعك (عادةً بضع دقائق على GitHub Pages). بعدها، ستكون التغييرات مباشرة للجميع.</li>
      </ol>

      <Button onClick={handlePrepareData} disabled={isLoading || dataLoading} size="lg" className="mb-8 w-full sm:w-auto">
        {isLoading || dataLoading ? 'جاري التحضير...' : '🔄 تحديث بيانات النشر'}
      </Button>

      {feedback && (
        <div className={`mb-6 p-3 rounded-md text-white text-center ${feedback.includes('خطأ') ? 'bg-red-600' : 'bg-green-600'}`}>
          {feedback}
        </div>
      )}

      {productsJson && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker}`}>
              محتوى ملف <code>public/data/products.json</code>
            </h2>
            <Button onClick={() => copyToClipboard(productsJson, 'products.json')} size="sm">نسخ محتوى المنتجات</Button>
          </div>
          <Textarea
            value={productsJson}
            readOnly
            rows={15}
            className="text-xs font-mono !bg-indigo-900"
            aria-label="محتوى JSON لملف المنتجات"
          />
        </div>
      )}

      {settingsJson && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker}`}>
              محتوى ملف <code>public/data/settings.json</code>
            </h2>
            <Button onClick={() => copyToClipboard(settingsJson, 'settings.json')} size="sm">نسخ محتوى الإعدادات</Button>
          </div>
          <Textarea
            value={settingsJson}
            readOnly
            rows={10}
            className="text-xs font-mono !bg-indigo-900"
            aria-label="محتوى JSON لملف الإعدادات"
          />
        </div>
      )}
    </div>
  );
};

export default AdminPublishDataPage;
