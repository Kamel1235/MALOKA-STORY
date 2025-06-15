# متجر ملوكة ستوري - Maloka Story Store

متجر إلكتروني متكامل لبيع الإكسسوارات والمجوهرات مع لوحة تحكم إدارية شاملة.

## المميزات

### للعملاء:
- 🛍️ تصفح المنتجات بسهولة
- 🔍 البحث والتصفية حسب الفئات
- 📱 تصميم متجاوب لجميع الأجهزة
- 🛒 نظام طلبات سهل ومباشر
- 🎁 مساعد الهدايا بالذكاء الاصطناعي
- 📞 معلومات التواصل والشبكات الاجتماعية

### للإدارة:
- 📊 لوحة تحكم شاملة
- ➕ إضافة وتعديل المنتجات
- 🖼️ رفع ومعالجة الصور تلقائياً
- 📝 إنشاء أوصاف المنتجات بالذكاء الاصطناعي
- 📋 إدارة الطلبات
- ⚙️ إعدادات المتجر والمظهر
- 💾 تصدير واستيراد البيانات
- 🔐 نظام تسجيل دخول آمن

## التقنيات المستخدمة

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Storage**: localStorage (حفظ محلي دائم - لا يحتاج خادم خلفي)
- **AI Integration**: Google Gemini API (اختياري)
- **Build Tool**: Vite
- **Deployment**: Netlify / GitHub Pages (Static Site)

## 🚨 ملاحظة مهمة

هذا المشروع **لا يحتاج خادم خلفي** أو قاعدة بيانات. جميع البيانات تُحفظ محلياً في المتصفح باستخدام localStorage. إذا كان لديك ملفات Netlify Functions قديمة، احذفها.

## التشغيل محلياً

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
