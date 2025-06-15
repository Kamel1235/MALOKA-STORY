import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { sendOrderNotification } from '../bot/telegramBot.js';

const router = express.Router();

// الحصول على جميع الطلبات (للمدير فقط)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json({
            success: true,
            data: orders.map(o => o.toJSON())
        });
    } catch (error) {
        console.error('خطأ في جلب الطلبات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الطلبات',
            error: error.message
        });
    }
});

// الحصول على طلب بالمعرف
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }
        res.json({
            success: true,
            data: order.toJSON()
        });
    } catch (error) {
        console.error('خطأ في جلب الطلب:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الطلب',
            error: error.message
        });
    }
});

// الحصول على الطلبات حسب الحالة
router.get('/status/:status', async (req, res) => {
    try {
        const orders = await Order.getByStatus(req.params.status);
        res.json({
            success: true,
            data: orders.map(o => o.toJSON())
        });
    } catch (error) {
        console.error('خطأ في جلب الطلبات حسب الحالة:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الطلبات حسب الحالة',
            error: error.message
        });
    }
});

// البحث في الطلبات
router.get('/search/:query', async (req, res) => {
    try {
        const orders = await Order.search(req.params.query);
        res.json({
            success: true,
            data: orders.map(o => o.toJSON())
        });
    } catch (error) {
        console.error('خطأ في البحث في الطلبات:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في البحث في الطلبات',
            error: error.message
        });
    }
});

// إنشاء طلب جديد
router.post('/', async (req, res) => {
    try {
        const { customerName, phoneNumber, address, productId, quantity, telegramChatId, notes } = req.body;
        
        if (!customerName || !phoneNumber || !address || !productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'جميع البيانات مطلوبة'
            });
        }

        // التحقق من وجود المنتج
        const product = await Product.getById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        // حساب المبلغ الإجمالي
        const totalAmount = product.price * quantity;

        // إنشاء الطلب
        const order = await Order.create({
            customer_name: customerName,
            phone_number: phoneNumber,
            address: address,
            total_amount: totalAmount,
            telegram_chat_id: telegramChatId,
            notes: notes,
            items: [{
                product_id: productId,
                product_name: product.name,
                product_image: product.images[0] || '',
                quantity: quantity,
                price: product.price
            }]
        });

        // إرسال إشعار تلجرام للمدير
        try {
            await sendOrderNotification(order);
        } catch (telegramError) {
            console.error('خطأ في إرسال إشعار تلجرام:', telegramError);
            // لا نوقف العملية إذا فشل إرسال الإشعار
        }

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الطلب بنجاح',
            data: order.toJSON()
        });
    } catch (error) {
        console.error('خطأ في إنشاء الطلب:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الطلب',
            error: error.message
        });
    }
});

// تحديث حالة الطلب (للمدير فقط)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        const validStatuses = ['Pending', 'Processed', 'Shipped', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'حالة الطلب غير صحيحة'
            });
        }

        const updated = await Order.updateStatus(req.params.id, status);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم تحديث حالة الطلب بنجاح'
        });
    } catch (error) {
        console.error('خطأ في تحديث حالة الطلب:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث حالة الطلب',
            error: error.message
        });
    }
});

// حذف طلب (للمدير فقط)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Order.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف الطلب بنجاح'
        });
    } catch (error) {
        console.error('خطأ في حذف الطلب:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الطلب',
            error: error.message
        });
    }
});

export default router;
