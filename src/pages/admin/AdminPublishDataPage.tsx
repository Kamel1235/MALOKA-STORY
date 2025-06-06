import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { THEME_COLORS } from '../../constants';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';

const AdminPublishDataPage: React.FC = () => {
  const { publishData, isLoading: dataLoadingContext } = useData();
  const [productsJson, setProductsJson] = useState<string>('');
  const [settingsJson, setSettingsJson] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPreparingData, setIsPreparingData] = useState(false);

  const handlePrepareData = () => {
    setIsPreparingData(true);
    setFeedback(null);
    const data = publishData(); // This gets data currently in DataContext (your session)
    if (data) {
      setProductsJson(data.productsJson);
      setSettingsJson(data.settingsJson);
      setFeedback('تم تحضير بيانات الموقع الحالية من جلستك. الآن قم بنسخ المحتوى أدناه وتحديث الملفات في مستودع GitHub الخاص بك.');
    } else {
      setFeedback('خطأ: لم يتم تحميل البيانات بشكل كامل أو حدث خطأ أثناء تحضيرها. حاول تحديث الصفحة أو التأكد من أنك أجريت تغييرات.');
      setProductsJson('');
      setSettingsJson('');
    }
    setIsPreparingData(false);
  };

  useEffect(() => {
    // Automatically prepare data when page loads for the first time and context data is available
    if (!dataLoadingContext) { // Ensure context isn't initially loading
        handlePrepareData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoadingContext]); // Rerun if dataLoadingContext state changes (e.g., initial data load completes)


  const copyToClipboard = (text: string, fileName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`تم نسخ محتوى ${fileName} إلى الحافظة! يمكنك الآن لصقه في الملف المقابل في مشروعك.`);
    }).catch(err => {
      console.error(`Failed to copy ${fileName}:`, err);
      alert(`فشل نسخ محتوى ${fileName}. يرجى النسخ يدويًا.`);
    });
  };

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-6`}>نشر تغييرات الموقع لتصبح مرئية للجميع</h1>
      <p className={`${THEME_COLORS.textSecondary} mb-4`}>
        أنت على وشك تحديث البيانات الأساسية لموقعك. التغييرات التي أجريتها في لوحة التحكم (مثل إضافة منتجات، تعديل الأسعار، أو تغيير معلومات الاتصال والمظهر) يتم حفظها مؤقتًا في جلسة عملك الحالية.
        <strong className={`${THEME_COLORS.accentGoldDarker}`}> لجعل هذه التغييرات دائمة ومرئية لجميع زوار الموقع، يجب عليك اتباع الخطوات التالية بدقة:</strong>
      </p>
      <div className={`bg-purple-800/50 p-6 rounded-lg border ${THEME_COLORS.borderColorGold} mb-8`}>
        <h3 className={`text-xl font-semibold ${THEME_COLORS.accentGold} mb-3`}>خطوات النشر:</h3>
        <ol className={`list-decimal list-inside ${THEME_COLORS.textSecondary} space-y-3`}>
          <li>
            اضغط على زر <strong className="text-amber-300">"🔄 تحديث/إعادة تحضير بيانات النشر"</strong> أدناه. سيقوم هذا بتجميع أحدث البيانات (المنتجات والإعدادات) من جلسة عملك الحالية.
            { (dataLoadingContext || isPreparingData) && <span className="text-xs text-amber-400 ml-2">(جاري التحميل...)</span>}
          </li>
          <li>
            سيظهر محتوى ملفي <code>public/data/products.json</code> و <code>public/data/settings.json</code> في مربعات النص بالأسفل.
          </li>
          <li>
            <strong>بالنسبة لملف المنتجات (<code>products.json</code>):</strong>
            <ul className="list-disc list-inside ml-5 mt-1 text-sm space-y-1">
              <li>اضغط على زر "نسخ محتوى المنتجات" لنسخ المحتوى المعروض بالكامل.</li>
              <li>في كود مشروعك على جهازك، اذهب إلى الملف: <code>public/data/products.json</code>.</li>
              <li><strong className="text-red-400">هام:</strong> احذف كل المحتوى القديم الموجود في هذا الملف.</li>
              <li>الصق المحتوى الجديد الذي نسخته.</li>
              <li>احفظ التغييرات في ملف <code>products.json</code>.</li>
            </ul>
          </li>
          <li>
            <strong>بالنسبة لملف الإعدادات (<code>settings.json</code>):</strong>
            <ul className="list-disc list-inside ml-5 mt-1 text-sm space-y-1">
              <li>اضغط على زر "نسخ محتوى الإعدادات" لنسخ المحتوى المعروض بالكامل.</li>
              <li>في كود مشروعك على جهازك، اذهب إلى الملف: <code>public/data/settings.json</code>.</li>
              <li><strong className="text-red-400">هام:</strong> احذف كل المحتوى القديم الموجود في هذا الملف.</li>
              <li>الصق المحتوى الجديد الذي نسخته.</li>
              <li>احفظ التغييرات في ملف <code>settings.json</code>.</li>
            </ul>
          </li>
          <li>
            بعد تحديث كلا الملفين وحفظهما في كود مشروعك، قم بعمل <strong className="text-amber-300">commit</strong> لهذه التغييرات ثم <strong className="text-amber-300">push</strong> إلى مستودع GitHub الخاص بك.
          </li>
          <li>
            انتظر بضع دقائق حتى يتم إعادة نشر موقعك تلقائيًا (على سبيل المثال، بواسطة GitHub Pages). بعد ذلك، ستكون جميع التغييرات التي أجريتها مباشرة ومرئية لجميع المستخدمين.
          </li>
        </ol>
      </div>

      <Button onClick={handlePrepareData} disabled={isPreparingData || dataLoadingContext} size="lg" className="mb-8 w-full sm:w-auto">
        {isPreparingData || dataLoadingContext ? '⏳ جاري التحضير...' : '🔄 تحديث/إعادة تحضير بيانات النشر'}
      </Button>

      {feedback && (
        <div className={`my-6 p-3 rounded-md text-white text-center ${feedback.includes('خطأ') ? 'bg-red-600' : 'bg-green-600'}`}>
          {feedback}
        </div>
      )}

      {(productsJson || settingsJson) && !isPreparingData && !dataLoadingContext && (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker}`}>
                محتوى لملف <code>public/data/products.json</code>
              </h2>
              <Button onClick={() => copyToClipboard(productsJson, 'products.json')} size="sm" disabled={!productsJson}>نسخ محتوى المنتجات</Button>
            </div>
            <Textarea
              value={productsJson || "جاري تحميل بيانات المنتجات أو لا توجد بيانات لعرضها..."}
              readOnly
              rows={15}
              className="text-xs font-mono !bg-indigo-900 disabled:opacity-70"
              aria-label="محتوى JSON لملف المنتجات"
              disabled={!productsJson}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker}`}>
                محتوى لملف <code>public/data/settings.json</code>
              </h2>
              <Button onClick={() => copyToClipboard(settingsJson, 'settings.json')} size="sm" disabled={!settingsJson}>نسخ محتوى الإعدادات</Button>
            </div>
            <Textarea
              value={settingsJson || "جاري تحميل بيانات الإعدادات أو لا توجد بيانات لعرضها..."}
              readOnly
              rows={10}
              className="text-xs font-mono !bg-indigo-900 disabled:opacity-70"
              aria-label="محتوى JSON لملف الإعدادات"
              disabled={!settingsJson}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPublishDataPage;