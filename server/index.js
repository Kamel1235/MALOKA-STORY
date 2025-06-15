import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// استيراد المسارات
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';

// استيراد قاعدة البيانات والبوت
import './database/database.js';
import { initializeBot } from './bot/telegramBot.js';

// تحميل متغيرات البيئة
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// إعدادات الأمان
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// إعداد CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// تحديد معدل الطلبات
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // حد أقصى 100 طلب لكل IP
    message: {
        success: false,
        message: 'تم تجاوز الحد الأقصى للطلبات. حاول مرة أخرى لاحقاً.'
    }
});

app.use(limiter);

// معالجة البيانات
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// إنشاء مجلد الرفع إذا لم يكن موجوداً
import fs from 'fs';
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// تقديم الملفات الثابتة
app.use('/uploads', express.static(uploadDir));

// مسار الصحة
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'الخادم يعمل بشكل طبيعي',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// مسار الجذر
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'مرحباً بك في خادم متجر أناقة الستانلس',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            orders: '/api/orders',
            health: '/health'
        }
    });
});

// المسارات الرئيسية
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// مسار إضافة البيانات الأولية
app.post('/api/init-data', async (req, res) => {
    try {
        const { Product } = await import('./models/Product.js');
        
        // البيانات الأولية للمنتجات
        const initialProducts = [
            {
                name: 'حلق ذهبي لامع',
                description: 'حلق أنيق من الستانلس ستيل المطلي بالذهب، تصميم فريد يناسب جميع المناسبات.',
                price: 150,
                category: 'حلق',
                images: ['https://picsum.photos/seed/p1img1/600/600', 'https://picsum.photos/seed/p1img2/600/600']
            },
            {
                name: 'خاتم فضي مرصع',
                description: 'خاتم من الستانلس ستيل الفضي مع فص كريستال لامع، يضيف لمسة من الرقي.',
                price: 220,
                category: 'خاتم',
                images: ['https://picsum.photos/seed/p2img1/600/600']
            },
            {
                name: 'قلادة الفراشة الذهبية',
                description: 'قلادة رقيقة بتصميم فراشة من الستانلس ستيل الذهبي، مثالية للإطلالات اليومية.',
                price: 180,
                category: 'قلادة',
                images: ['https://picsum.photos/seed/p3img1/600/600', 'https://picsum.photos/seed/p3img2/600/600', 'https://picsum.photos/seed/p3img3/600/600']
            },
            {
                name: 'طقم حلق وخاتم بنفسجي',
                description: 'طقم متناسق من حلق وخاتم ستانلس ستيل بلون بنفسجي غامق جذاب.',
                price: 350,
                category: 'حلق',
                images: ['https://picsum.photos/seed/p4img1/600/600']
            },
            {
                name: 'قلادة القمر والنجوم',
                description: 'قلادة ساحرة بتصميم القمر والنجوم، مصنوعة من الستانلس ستيل عالي الجودة.',
                price: 200,
                category: 'قلادة',
                images: ['https://picsum.photos/seed/p5img1/600/600']
            },
            {
                name: 'خاتم رجالي أسود',
                description: 'خاتم رجالي أنيق من الستانلس ستيل الأسود، تصميم عصري وقوي.',
                price: 190,
                category: 'خاتم',
                images: ['https://picsum.photos/seed/p6img1/600/600']
            }
        ];

        // التحقق من وجود منتجات
        const existingProducts = await Product.getAll();
        if (existingProducts.length === 0) {
            for (const productData of initialProducts) {
                await Product.create(productData);
            }
            console.log('✅ تم إضافة البيانات الأولية للمنتجات');
        }

        res.json({
            success: true,
            message: 'تم تهيئة البيانات بنجاح',
            productsCount: (await Product.getAll()).length
        });
    } catch (error) {
        console.error('خطأ في تهيئة البيانات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تهيئة البيانات',
            error: error.message
        });
    }
});

// معالجة الأخطاء 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'المسار غير موجود',
        path: req.originalUrl
    });
});

// معالجة الأخطاء العامة
app.use((error, req, res, next) => {
    console.error('خطأ في الخادم:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'خطأ داخلي في الخادم',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
    console.log(`🌐 الرابط: http://localhost:${PORT}`);
    
    // تشغيل بوت تلجرام
    initializeBot();
    
    console.log('✅ تم تشغيل جميع الخدمات بنجاح');
});

// معالجة إغلاق التطبيق بشكل صحيح
process.on('SIGINT', async () => {
    console.log('\n🛑 جاري إيقاف الخادم...');
    
    try {
        const { dbHelpers } = await import('./database/database.js');
        await dbHelpers.close();
        console.log('✅ تم إغلاق قاعدة البيانات');
    } catch (error) {
        console.error('❌ خطأ في إغلاق قاعدة البيانات:', error);
    }
    
    process.exit(0);
});

export default app;
