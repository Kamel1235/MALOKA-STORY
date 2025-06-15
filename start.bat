@echo off
echo ========================================
echo    متجر أناقة الستانلس - تشغيل النظام
echo ========================================
echo.

echo جاري التحقق من Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت!
    echo يرجى تحميل وتثبيت Node.js من: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js مثبت بنجاح
echo.

echo جاري تثبيت التبعيات...
echo.

echo 📦 تثبيت تبعيات الواجهة الأمامية...
call npm install
if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت تبعيات الواجهة الأمامية
    pause
    exit /b 1
)

echo 📦 تثبيت تبعيات الخادم الخلفي...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت تبعيات الخادم الخلفي
    pause
    exit /b 1
)

cd ..
echo.
echo ✅ تم تثبيت جميع التبعيات بنجاح
echo.

echo 🚀 جاري تشغيل النظام...
echo.
echo سيتم فتح:
echo - الواجهة الأمامية: http://localhost:5173
echo - الخادم الخلفي: http://localhost:3001
echo - لوحة التحكم: http://localhost:5173/#/admin
echo.
echo كلمة مرور لوحة التحكم: Kamel01112024743
echo.

echo اضغط أي مفتاح لبدء التشغيل...
pause >nul

start "Maloka Store Frontend" cmd /k "npm run dev"
start "Maloka Store Backend" cmd /k "cd server && npm run dev"

echo.
echo ✅ تم تشغيل النظام بنجاح!
echo.
echo للإيقاف: اضغط Ctrl+C في كل نافذة
echo.
pause
