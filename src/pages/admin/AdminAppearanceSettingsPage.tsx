import React, { useState, useEffect } from 'react';
import { 
  THEME_COLORS, 
  DEFAULT_FALLBACK_SITE_LOGO_URL,
} from '../../constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useData } from '../../contexts/DataContext'; // Import useData

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const AdminAppearanceSettingsPage: React.FC = () => {
  const { settings, setSettings, isLoading } = useData();

  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);
  
  const [newHeroImageFiles, setNewHeroImageFiles] = useState<FileList | null>(null);
  const [newHeroImagePreviews, setNewHeroImagePreviews] = useState<string[]>([]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const siteLogoUrlToDisplay = settings?.siteLogoUrl || DEFAULT_FALLBACK_SITE_LOGO_URL;
  const heroImagesToDisplay = settings?.heroSliderImages || [];
  const defaultSettingsLogo = DEFAULT_FALLBACK_SITE_LOGO_URL; // Assuming this is the hardcoded default from initial settings.json

  useEffect(() => {
    if (newLogoFile) {
      const objectUrl = URL.createObjectURL(newLogoFile);
      setNewLogoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setNewLogoPreview(null);
  }, [newLogoFile]);

  useEffect(() => {
    if (newHeroImageFiles && newHeroImageFiles.length > 0) {
      const previewUrls = Array.from(newHeroImageFiles).map(file => URL.createObjectURL(file));
      setNewHeroImagePreviews(previewUrls);
      return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
    }
    setNewHeroImagePreviews([]);
  }, [newHeroImageFiles]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSaveLogo = async () => {
    if (!newLogoFile) {
      showFeedback('error', 'يرجى اختيار ملف شعار أولاً.');
      return;
    }
    if (!setSettings || !settings) {
      showFeedback('error', 'خطأ: لا يمكن تحديث الإعدادات حالياً.');
      return;
    }
    try {
      const base64Logo = await fileToBase64(newLogoFile);
      setSettings(prev => prev ? ({ ...prev, siteLogoUrl: base64Logo }) : null);
      setNewLogoFile(null); 
      showFeedback('success', 'تم تحديث الشعار في جلسة العمل الحالية. لا تنسَ "نشر التغييرات".');
    } catch (error) {
      console.error("Error saving logo:", error);
      showFeedback('error', 'حدث خطأ أثناء حفظ الشعار.');
    }
  };

  const handleSaveHeroImages = async () => {
    if (!newHeroImageFiles || newHeroImageFiles.length === 0) {
      showFeedback('error', 'يرجى اختيار ملف واحد على الأقل لصور السلايدر.');
      return;
    }
     if (!setSettings || !settings) {
      showFeedback('error', 'خطأ: لا يمكن تحديث الإعدادات حالياً.');
      return;
    }
    try {
      const base64Promises = Array.from(newHeroImageFiles).map(file => fileToBase64(file));
      const base64Images = await Promise.all(base64Promises);
      setSettings(prev => prev ? ({ ...prev, heroSliderImages: base64Images }) : null);
      setNewHeroImageFiles(null);
      showFeedback('success', 'تم تحديث صور السلايدر في جلسة العمل الحالية. لا تنسَ "نشر التغييرات".');
    } catch (error) {
      console.error("Error saving hero images:", error);
      showFeedback('error', 'حدث خطأ أثناء حفظ صور السلايدر.');
    }
  };
  
  const handleRevertToDefaultLogo = () => {
     if (!setSettings || !settings) {
      showFeedback('error', 'خطأ: لا يمكن تحديث الإعدادات حالياً.');
      return;
    }
    // The actual default value should ideally come from a pristine settings.json structure or a hardcoded constant
    // For simplicity, using DEFAULT_FALLBACK_SITE_LOGO_URL from constants.ts
    setSettings(prev => prev ? ({ ...prev, siteLogoUrl: defaultSettingsLogo }) : null);
    setNewLogoFile(null);
    showFeedback('success', 'تم استعادة الشعار الافتراضي لهذه الجلسة. لا تنسَ "نشر التغييرات".');
  };

  const handleRevertToDefaultHeroImages = () => {
     if (!setSettings || !settings) {
      showFeedback('error', 'خطأ: لا يمكن تحديث الإعدادات حالياً.');
      return;
    }
    setSettings(prev => prev ? ({ ...prev, heroSliderImages: [] }) : null);
    setNewHeroImageFiles(null);
    showFeedback('success', 'تم استعادة صور السلايدر الافتراضية لهذه الجلسة. لا تنسَ "نشر التغييرات".');
  };

  if (isLoading && !settings) {
    return <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
      <p className={`${THEME_COLORS.textSecondary}`}>جاري تحميل إعدادات المظهر...</p>
    </div>;
  }
   if (!settings) {
     return <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
      <p className={`${THEME_COLORS.textSecondary}`}>لم يتم تحميل إعدادات المظهر.</p>
    </div>;
  }

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl space-y-10`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-8`}>إعدادات المظهر</h1>

      {feedback && (
        <div className={`mb-6 p-3 rounded-md text-white text-center ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {feedback.message}
        </div>
      )}

      <section className={`p-6 border ${THEME_COLORS.borderColor} rounded-lg`}>
        <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker} mb-6`}>شعار الموقع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className={`${THEME_COLORS.textSecondary} mb-2`}>الشعار الحالي:</h3>
            <img 
                src={siteLogoUrlToDisplay} 
                alt="Current Site Logo" 
                className="h-20 w-auto object-contain bg-purple-800/50 p-2 rounded border border-purple-700"
                onError={(e) => (e.currentTarget.src = DEFAULT_FALLBACK_SITE_LOGO_URL)}
            />
          </div>
          <div>
            <Input
              label="اختر شعار جديد (يفضل PNG بخلفية شفافة):"
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              className="mb-3"
            />
            {newLogoPreview && (
              <div className="mb-4">
                <h3 className={`${THEME_COLORS.textSecondary} mb-2`}>معاينة الشعار الجديد:</h3>
                <img src={newLogoPreview} alt="New logo preview" className="h-20 w-auto object-contain bg-purple-800/50 p-2 rounded border border-purple-700" />
              </div>
            )}
            <div className="flex space-x-3 space-x-reverse">
                <Button onClick={handleSaveLogo} disabled={!newLogoFile}>حفظ الشعار الجديد للجلسة</Button>
                <Button onClick={handleRevertToDefaultLogo} variant="secondary">استعادة الافتراضي للجلسة</Button>
            </div>
          </div>
        </div>
      </section>

      <section className={`p-6 border ${THEME_COLORS.borderColor} rounded-lg`}>
        <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker} mb-6`}>صور السلايدر الرئيسي</h2>
        <div>
          <h3 className={`${THEME_COLORS.textSecondary} mb-2`}>الصور الحالية في السلايدر:</h3>
          {heroImagesToDisplay && heroImagesToDisplay.length > 0 ? (
            <div className="flex flex-wrap gap-3 mb-4">
              {heroImagesToDisplay.map((img, index) => (
                <img key={index} src={img} alt={`Current hero ${index + 1}`} className="h-24 w-auto object-cover rounded shadow-md border border-purple-700" />
              ))}
            </div>
          ) : (
            <p className={`${THEME_COLORS.textSecondary} mb-4 italic`}>يتم حاليًا استخدام صور المنتجات الافتراضية للسلايدر.</p>
          )}
        </div>
        <div>
          <Input
            label="اختر صور جديدة للسلايدر (يمكن اختيار عدة صور):"
            type="file"
            multiple
            accept="image/*"
            onChange={handleHeroFilesChange}
            className="mb-3"
          />
          {newHeroImagePreviews.length > 0 && (
            <div className="mb-4">
              <h3 className={`${THEME_COLORS.textSecondary} mb-2`}>معاينة الصور الجديدة:</h3>
              <div className="flex flex-wrap gap-3">
                {newHeroImagePreviews.map((preview, index) => (
                  <img key={index} src={preview} alt={`New hero preview ${index + 1}`} className="h-24 w-auto object-cover rounded shadow-md border border-purple-700" />
                ))}
              </div>
            </div>
          )}
          <div className="flex space-x-3 space-x-reverse">
            <Button onClick={handleSaveHeroImages} disabled={!newHeroImageFiles || newHeroImageFiles.length === 0}>حفظ صور السلايدر للجلسة</Button>
            <Button onClick={handleRevertToDefaultHeroImages} variant="secondary">استعادة الافتراضي للجلسة</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAppearanceSettingsPage;
