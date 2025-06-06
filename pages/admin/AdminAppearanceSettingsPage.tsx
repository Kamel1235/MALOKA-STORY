
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { 
  THEME_COLORS, 
  DEFAULT_SITE_LOGO_URL, 
  ADMIN_SETTINGS_SITE_LOGO_KEY, 
  ADMIN_SETTINGS_HERO_SLIDER_IMAGES_KEY,
  STORAGE_GEMINI_API_KEY // Import the new key
} from '../../constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const AdminAppearanceSettingsPage: React.FC = () => {
  const [siteLogoUrl, setSiteLogoUrl] = useLocalStorage<string>(ADMIN_SETTINGS_SITE_LOGO_KEY, DEFAULT_SITE_LOGO_URL);
  const [heroImages, setHeroImages] = useLocalStorage<string[]>(ADMIN_SETTINGS_HERO_SLIDER_IMAGES_KEY, []);
  const [geminiApiKey, setGeminiApiKey] = useLocalStorage<string>(STORAGE_GEMINI_API_KEY, '');


  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);
  
  const [newHeroImageFiles, setNewHeroImageFiles] = useState<FileList | null>(null);
  const [newHeroImagePreviews, setNewHeroImagePreviews] = useState<string[]>([]);

  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  useEffect(() => {
    // Populate API key input from localStorage on load
    if (geminiApiKey) {
      setApiKeyInput(geminiApiKey);
    }
  }, [geminiApiKey]);

  const displayFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewLogoFile(e.target.files[0]);
    } else {
      setNewLogoFile(null);
    }
  };

  const handleHeroFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewHeroImageFiles(e.target.files);
    } else {
      setNewHeroImageFiles(null);
    }
  };

  const handleSaveLogo = async () => {
    if (!newLogoFile) {
      displayFeedback('error', 'يرجى اختيار ملف شعار أولاً.');
      return;
    }
    try {
      const base64Logo = await fileToBase64(newLogoFile);
      setSiteLogoUrl(base64Logo);
      setNewLogoFile(null); 
      displayFeedback('success', 'تم حفظ الشعار بنجاح!');
    } catch (error) {
      console.error("Error saving logo:", error);
      displayFeedback('error', 'حدث خطأ أثناء حفظ الشعار.');
    }
  };

  const handleSaveHeroImages = async () => {
    if (!newHeroImageFiles || newHeroImageFiles.length === 0) {
      displayFeedback('error', 'يرجى اختيار ملف واحد على الأقل لصور السلايدر.');
      return;
    }
    try {
      const base64Promises = Array.from(newHeroImageFiles).map(file => fileToBase64(file));
      const base64Images = await Promise.all(base64Promises);
      setHeroImages(base64Images);
      setNewHeroImageFiles(null); 
      displayFeedback('success', 'تم حفظ صور السلايدر بنجاح!');
    } catch (error) {
      console.error("Error saving hero images:", error);
      displayFeedback('error', 'حدث خطأ أثناء حفظ صور السلايدر.');
    }
  };
  
  const handleRevertToDefaultLogo = () => {
    setSiteLogoUrl(DEFAULT_SITE_LOGO_URL);
    setNewLogoFile(null);
    displayFeedback('success', 'تم استعادة الشعار الافتراضي.');
  };

  const handleRevertToDefaultHeroImages = () => {
    setHeroImages([]); 
    setNewHeroImageFiles(null);
    displayFeedback('success', 'تم استعادة صور السلايدر الافتراضية (المستمدة من المنتجات).');
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
        displayFeedback('error', 'يرجى إدخال مفتاح Gemini API.');
        return;
    }
    setGeminiApiKey(apiKeyInput.trim());
    displayFeedback('success', 'تم حفظ مفتاح Gemini API بنجاح! قد تحتاج إلى تحديث الصفحة لتفعيل التغييرات فوراً.');
    // Optionally, trigger a re-initialization of the AI service or inform the user to refresh
    // For simplicity, current AI util will pick up on next load or if re-imported.
  };

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl space-y-10`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-8`}>إعدادات المظهر</h1>

      {feedback && (
        <div className={`mb-6 p-3 rounded-md text-white text-center ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {feedback.message}
        </div>
      )}

      {/* Site Logo Section */}
      <section className={`p-6 border ${THEME_COLORS.borderColor} rounded-lg`}>
        <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker} mb-6`}>شعار الموقع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className={`${THEME_COLORS.textSecondary} mb-2`}>الشعار الحالي:</h3>
            <img 
                src={siteLogoUrl || DEFAULT_SITE_LOGO_URL} 
                alt="Current Site Logo" 
                className="h-20 w-auto object-contain bg-purple-800/50 p-2 rounded border border-purple-700"
                onError={(e) => (e.currentTarget.src = DEFAULT_SITE_LOGO_URL)}
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
                <Button onClick={handleSaveLogo} disabled={!newLogoFile}>حفظ الشعار الجديد</Button>
                <Button onClick={handleRevertToDefaultLogo} variant="secondary">استعادة الافتراضي</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Slider Images Section */}
      <section className={`p-6 border ${THEME_COLORS.borderColor} rounded-lg`}>
        <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker} mb-6`}>صور السلايدر الرئيسي</h2>
        <div>
          <h3 className={`${THEME_COLORS.textSecondary} mb-2`}>الصور الحالية في السلايدر:</h3>
          {heroImages && heroImages.length > 0 ? (
            <div className="flex flex-wrap gap-3 mb-4">
              {heroImages.map((img, index) => (
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
            <Button onClick={handleSaveHeroImages} disabled={!newHeroImageFiles || newHeroImageFiles.length === 0}>حفظ صور السلايدر</Button>
            <Button onClick={handleRevertToDefaultHeroImages} variant="secondary">استعادة الافتراضي</Button>
          </div>
        </div>
      </section>

       {/* Gemini API Key Section */}
      <section className={`p-6 border ${THEME_COLORS.borderColor} rounded-lg`}>
        <h2 className={`text-2xl font-semibold ${THEME_COLORS.accentGoldDarker} mb-4`}>إعدادات مفتاح Gemini API</h2>
        <p className={`${THEME_COLORS.textSecondary} text-sm mb-4`}>
            هذا المفتاح ضروري لتشغيل ميزات الذكاء الاصطناعي مثل اقتراح وصف المنتجات والنصائح. يمكنك الحصول عليه من Google AI Studio.
        </p>
        <div className="space-y-3">
            <div className="relative">
                <Input
                    label="مفتاح Gemini API"
                    id="geminiApiKeyInput"
                    type={showApiKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="أدخل مفتاح Gemini API هنا"
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className={`absolute left-2 top-9 p-1 ${THEME_COLORS.textSecondary} hover:${THEME_COLORS.accentGold}`}
                    aria-label={showApiKey ? "إخفاء المفتاح" : "إظهار المفتاح"}
                >
                    {showApiKey ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </button>
            </div>
            <Button onClick={handleSaveApiKey}>حفظ مفتاح API</Button>
        </div>
      </section>

    </div>
  );
};

export default AdminAppearanceSettingsPage;
