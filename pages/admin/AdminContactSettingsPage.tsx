
import React, { useState, useEffect } from 'react';
import { ContactInfo } from '../../types';
import { INITIAL_CONTACT_INFO, THEME_COLORS } from '../../constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { getSetting, setSetting, SETTING_KEYS } from '../../database';

const AdminContactSettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactInfo>(INITIAL_CONTACT_INFO);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactSettings = async () => {
      setIsLoading(true);
      try {
        const dbContactInfo = await getSetting<ContactInfo>(SETTING_KEYS.CONTACT_INFO, INITIAL_CONTACT_INFO);
        setFormData(dbContactInfo);
      } catch (error) {
        console.error("Error fetching contact settings:", error);
        setFormData(INITIAL_CONTACT_INFO); // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await setSetting<ContactInfo>(SETTING_KEYS.CONTACT_INFO, formData);
      setFeedback('تم حفظ التغييرات بنجاح!');
    } catch (error) {
      console.error("Error saving contact settings:", error);
      setFeedback('فشل حفظ التغييرات. يرجى المحاولة مرة أخرى.');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  if (isLoading) {
    return <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl text-center ${THEME_COLORS.textSecondary}`}>
        جاري تحميل إعدادات التواصل...
    </div>;
  }

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-8`}>إعدادات التواصل</h1>
      
      {feedback && (
        <div className={`mb-4 p-3 rounded-md text-white text-center ${feedback.includes('فشل') ? 'bg-red-600' : 'bg-green-600'}`}>
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
          حفظ التغييرات
        </Button>
      </form>
    </div>
  );
};

export default AdminContactSettingsPage;
