# دليل النشر - Deployment Guide

## 🚀 النشر على Netlify (الأسهل والأسرع)

### الطريقة الأولى: من GitHub
1. **ارفع المشروع إلى GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **اربط مع Netlify:**
   - اذهب إلى [netlify.com](https://netlify.com)
   - اضغط "New site from Git"
   - اختر GitHub واربط المستودع
   - استخدم الإعدادات:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - اضغط "Deploy site"

### الطريقة الثانية: رفع مباشر
1. **بناء المشروع:**
   ```bash
   npm run build
   ```

2. **رفع مجلد dist:**
   - اذهب إلى [netlify.com](https://netlify.com)
   - اسحب مجلد `dist` إلى المنطقة المخصصة
   - سيتم النشر تلقائياً

## 🐙 النشر على GitHub Pages

1. **ارفع المشروع إلى GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **فعّل GitHub Pages:**
   - اذهب إلى إعدادات المستودع
   - اختر "Pages" من القائمة الجانبية
   - اختر "GitHub Actions" كمصدر
   - سيتم النشر تلقائياً عند كل push

## 🔧 إعدادات إضافية

### متغيرات البيئة (اختياري):
إذا كنت تريد استخدام ميزة الذكاء الاصطناعي:
1. احصل على مفتاح API من [Google AI Studio](https://makersuite.google.com/app/apikey)
2. في Netlify: Site settings > Environment variables
3. أضف: `GEMINI_API_KEY` = مفتاحك

### النطاق المخصص:
- في Netlify: Site settings > Domain management
- أضف نطاقك المخصص

## ✅ التحقق من النشر

بعد النشر، تأكد من:
- [ ] الصفحة الرئيسية تعمل
- [ ] يمكن تصفح المنتجات
- [ ] لوحة الإدارة تعمل (`/admin`)
- [ ] يمكن إضافة منتجات جديدة
- [ ] تعمل ميزة تصدير/استيراد البيانات

## 🔐 كلمة مرور الإدارة الافتراضية

- **المسار:** `/admin`
- **كلمة المرور:** `admin123`
- **تغيير كلمة المرور:** من إعدادات الإدارة

## 📱 اختبار على الأجهزة المختلفة

تأكد من اختبار الموقع على:
- [ ] الكمبيوتر المكتبي
- [ ] الجهاز اللوحي
- [ ] الهاتف المحمول
- [ ] متصفحات مختلفة (Chrome, Firefox, Safari, Edge)

## 🆘 حل المشاكل الشائعة

### المشكلة: خطأ MongoDB في Netlify Functions
**الحل:**
1. احذف مجلد `netlify/functions` إذا كان موجوداً
2. تأكد من أن `netlify.toml` يحتوي على `ignore = "netlify/functions/"`
3. المشروع يعمل بدون خادم خلفي (localStorage فقط)

### المشكلة: الصفحات لا تعمل عند التحديث
**الحل:** تأكد من وجود ملف `_redirects` في مجلد `public`

### المشكلة: الصور لا تظهر
**الحل:** تأكد من أن مسارات الصور صحيحة ومتاحة

### المشكلة: البيانات تختفي
**الحل:** البيانات محفوظة محلياً، استخدم ميزة التصدير للنسخ الاحتياطي

### المشكلة: Build fails with "Could not resolve mongodb"
**الحل:**
1. احذف أي ملفات قديمة في `netlify/functions/`
2. تأكد من تحديث `netlify.toml`
3. المشروع الحالي لا يحتاج MongoDB

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، افتح issue في GitHub.
