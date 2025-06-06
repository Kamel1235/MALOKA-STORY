
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { ContactInfo } from '../../types';
import { INITIAL_CONTACT_INFO, THEME_COLORS } from '../../constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';

const AdminContactSettingsPage: React.FC = () => {
  const [contactInfo, setContactInfo] = useLocalStorage<ContactInfo>('contactInformation', INITIAL_CONTACT_INFO);
  const [formData, setFormData] = useState<ContactInfo>(contactInfo);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Update form data if local storage changes (e.g., from another tab or initial load)
    setFormData(contactInfo);
  }, [contactInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactInfo(formData);
    setFeedback('تم حفظ التغييرات بنجاح!');
    setTimeout(() => setFeedback(null), 3000);
  };

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
          حفظ التغييرات
        </Button>
      </form>
    </div>
  );
};

export default AdminContactSettingsPage;
