import express from 'express';
import { Product } from '../models/Product.js';

const router = express.Router();

// الحصول على جميع المنتجات
router.get('/', async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json({
            success: true,
            data: products.map(p => p.toJSON())
        });
    } catch (error) {
        console.error('خطأ في جلب المنتجات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتجات',
            error: error.message
        });
    }
});

// الحصول على منتج بالمعرف
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }
        res.json({
            success: true,
            data: product.toJSON()
        });
    } catch (error) {
        console.error('خطأ في جلب المنتج:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتج',
            error: error.message
        });
    }
});

// الحصول على المنتجات حسب الفئة
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.getByCategory(req.params.category);
        res.json({
            success: true,
            data: products.map(p => p.toJSON())
        });
    } catch (error) {
        console.error('خطأ في جلب منتجات الفئة:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب منتجات الفئة',
            error: error.message
        });
    }
});

// البحث في المنتجات
router.get('/search/:query', async (req, res) => {
    try {
        const products = await Product.search(req.params.query);
        res.json({
            success: true,
            data: products.map(p => p.toJSON())
        });
    } catch (error) {
        console.error('خطأ في البحث:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في البحث',
            error: error.message
        });
    }
});

// الحصول على العروض
router.get('/offers/list', async (req, res) => {
    try {
        const maxPrice = req.query.maxPrice || 200;
        const products = await Product.getOffers(maxPrice);
        res.json({
            success: true,
            data: products.map(p => p.toJSON())
        });
    } catch (error) {
        console.error('خطأ في جلب العروض:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب العروض',
            error: error.message
        });
    }
});

// إنشاء منتج جديد (للمدير فقط)
router.post('/', async (req, res) => {
    try {
        const { name, description, price, category, images } = req.body;
        
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'الاسم والسعر والفئة مطلوبة'
            });
        }

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            category,
            images: images || []
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المنتج بنجاح',
            data: product.toJSON()
        });
    } catch (error) {
        console.error('خطأ في إنشاء المنتج:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء المنتج',
            error: error.message
        });
    }
});

// تحديث منتج (للمدير فقط)
router.put('/:id', async (req, res) => {
    try {
        const { name, description, price, category, images } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = parseFloat(price);
        if (category) updateData.category = category;
        if (images) updateData.images = images;

        const product = await Product.update(req.params.id, updateData);
        
        res.json({
            success: true,
            message: 'تم تحديث المنتج بنجاح',
            data: product.toJSON()
        });
    } catch (error) {
        console.error('خطأ في تحديث المنتج:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث المنتج',
            error: error.message
        });
    }
});

// حذف منتج (للمدير فقط)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Product.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف المنتج بنجاح'
        });
    } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المنتج',
            error: error.message
        });
    }
});

export default router;
