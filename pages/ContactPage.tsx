
import React, { useState, useEffect } from 'react';
import { THEME_COLORS, INITIAL_CONTACT_INFO } from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { ContactInfo } from '../types';
import { getSetting, SETTING_KEYS } from '../database';

const ContactPage: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>(INITIAL_CONTACT_INFO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      setIsLoading(true);
      try {
        const dbContactInfo = await getSetting<ContactInfo>(SETTING_KEYS.CONTACT_INFO, INITIAL_CONTACT_INFO);
        setContactInfo(dbContactInfo);
      } catch (error) {
        console.error("Error fetching contact info:", error);
        setContactInfo(INITIAL_CONTACT_INFO); // Fallback to initial
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("شكراً لرسالتك! سنتواصل معك في أقرب وقت.\n ملاحظة: هذه مجرد رسالة تجريبية، لم يتم إرسال بيانات فعلية.");
    (e.target as HTMLFormElement).reset(); 
  };

  const socialLinks = [
    { name: 'فيسبوك', href: contactInfo.facebook, show: contactInfo.facebook && contactInfo.facebook !== '#' },
    { name: 'انستجرام', href: contactInfo.instagram, show: contactInfo.instagram && contactInfo.instagram !== '#' },
    { name: 'تيك توك', href: contactInfo.tiktok, show: contactInfo.tiktok && contactInfo.tiktok !== '#' },
  ].filter(link => link.show);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${THEME_COLORS.background} py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center`}>
        <p className={`${THEME_COLORS.textPrimary} text-xl`}>جاري تحميل معلومات الاتصال...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${THEME_COLORS.background} py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-950 via-purple-800 to-indigo-950`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${THEME_COLORS.cardBackground} p-8 sm:p-12 rounded-xl shadow-2xl border ${THEME_COLORS.borderColor}`}>
          <h1 className={`text-4xl font-bold text-center ${THEME_COLORS.accentGold} mb-4`}>تواصل معانا</h1>
          <p className={`${THEME_COLORS.textSecondary} text-center text-lg mb-10`}>
            عندك أي استفسار أو اقتراح؟ فريقنا جاهز لمساعدتك!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            <div className="space-y-4">
              <h3 className={`text-xl font-semibold ${THEME_COLORS.accentGoldDarker}`}>معلومات الاتصال:</h3>
              {contactInfo.email && <p className={`${THEME_COLORS.textSecondary}`}><strong>الإيميل:</strong> <a href={`mailto:${contactInfo.email}`} className={`hover:${THEME_COLORS.accentGold}`}>{contactInfo.email}</a></p>}
              {contactInfo.phone && <p className={`${THEME_COLORS.textSecondary}`}><strong>رقم التليفون:</strong> <a href={`tel:${contactInfo.phone}`} className={`hover:${THEME_COLORS.accentGold}`}>{contactInfo.phone}</a></p>}
              {contactInfo.workingHours && <p className={`${THEME_COLORS.textSecondary}`}><strong>ساعات العمل:</strong> {contactInfo.workingHours}</p>}
            </div>
            {socialLinks.length > 0 && (
              <div className="space-y-4">
                <h3 className={`text-xl font-semibold ${THEME_COLORS.accentGoldDarker}`}>تابعنا على:</h3>
                <div className="flex space-x-4 space-x-reverse">
                  {socialLinks.map(link => (
                    <a 
                      key={link.name} 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`${THEME_COLORS.textSecondary} hover:${THEME_COLORS.accentGold} transition-colors duration-200`}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="اسمك" type="text" name="name" id="contactName" required />
            <Input label="بريدك الإلكتروني" type="email" name="email" id="contactEmail" required />
            <Input label="الموضوع" type="text" name="subject" id="contactSubject" required />
            <Textarea label="رسالتك" name="message" id="contactMessage" rows={5} required />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              إرسال الرسالة
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
