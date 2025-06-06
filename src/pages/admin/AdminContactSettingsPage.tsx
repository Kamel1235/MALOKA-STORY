import React, { useState, useEffect } from 'react';
import { ContactInfo } from '../../types';
import { THEME_COLORS } from '../../constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { useData } from '../../contexts/DataContext'; // Import useData

const AdminContactSettingsPage: React.FC = () => {
  const { settings, setSettings, isLoading } = useData(); // Use settings from DataContext
  
  // Initialize formData with default structure if settings are null/loading
  const initialFormData: ContactInfo = {
    phone: '', email: '', facebook: '', instagram: '', tiktok: '', workingHours: ''
  };
  const [formData, setFormData] = useState<ContactInfo>(settings?.contactInfo || initialFormData);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Update form data if settings in context change (e.g., initial load completes)
    if (settings?.contactInfo) {
      setFormData(settings.contactInfo);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setSettings && settings) {
      setSettings(prevSettings => {
        if (!prevSettings) return null; // Should not happen if settings are loaded
        return { ...prevSettings, contactInfo: formData };
      });
      setFeedback('تم تحديث معلومات التواصل في جلسة العمل الحالية. لجعل التغييرات دائمة ومرئية للجميع، اذهب إلى صفحة \'نشر التغييرات\' وقم بتحديث ملفات الموقع.');
    } else {
      setFeedback('خطأ: لا يمكن حفظ الإعدادات حالياً.');
    }
    setTimeout(() => setFeedback(null), 7000);
  };

  if (isLoading && !settings) {
    return <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
      <p className={`${THEME_COLORS.textSecondary}`}>جاري تحميل إعدادات التواصل...</p>
    </div>;
  }
  
  if (!settings) {
     return <div className={`p-6 rounded-lg ${THEME_COLORS.cardBackground} text-center`}>
      <p className={`${THEME_COLORS.textSecondary}`}>لم يتم تحميل إعدادات التواصل.</p>
    </div>;
  }

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-8`}>إعدادات التواصل</h1>
      
      {feedback && (
        <div className="mb-4 p-3 rounded-md bg-green-600 text-white text-center">
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="رقم التليفون"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="مثال: +201001234567"
        />
        <Input
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="مثال: info@example.com"
        />
        <Input
          label="رابط فيسبوك"
          name="facebook"
          type="url"
          value={formData.facebook}
          onChange={handleChange}
          placeholder="https://facebook.com/yourpage"
        />
        <Input
          label="رابط انستجرام"
          name="instagram"
          type="url"
          value={formData.instagram}
          onChange={handleChange}
          placeholder="https://instagram.com/yourprofile"
        />
        <Input
          label="رابط تيك توك"
          name="tiktok"
          type="url"
          value={formData.tiktok}
          onChange={handleChange}
          placeholder="https://tiktok.com/@yourprofile"
        />
        <Textarea
            label="ساعات العمل"
            name="workingHours"
            value={formData.workingHours}
            onChange={handleChange}
            rows={3}
            placeholder="مثال: السبت - الخميس، 9 صباحًا - 6 مساءً"
        />
        <Button type="submit" variant="primary" size="lg" className="w-full">
          حفظ التغييرات للجلسة الحالية
        </Button>
      </form>
    </div>
  );
};

export default AdminContactSettingsPage;