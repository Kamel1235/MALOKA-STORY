import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

let bot = null;

// تهيئة البوت
export function initializeBot() {
    if (!token) {
        console.log('⚠️  لم يتم تعيين TELEGRAM_BOT_TOKEN - البوت معطل');
        return null;
    }

    try {
        bot = new TelegramBot(token, { polling: true });
        console.log('🤖 تم تشغيل بوت تلجرام بنجاح');
        
        setupBotCommands();
        return bot;
    } catch (error) {
        console.error('❌ خطأ في تشغيل بوت تلجرام:', error);
        return null;
    }
}

// إعداد أوامر البوت
function setupBotCommands() {
    if (!bot) return;

    // أمر البداية
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const welcomeMessage = `
🌟 أهلاً وسهلاً بك في متجر أناقة الستانلس! 🌟

نحن متخصصون في إكسسوارات الستانلس ستيل عالية الجودة:
• حلق أنيقة ✨
• خواتم مميزة 💍  
• قلادات رائعة 📿

الأوامر المتاحة:
/products - عرض جميع المنتجات
/categories - عرض الفئات
/offers - العروض المميزة
/contact - معلومات التواصل
/help - المساعدة

كيف يمكنني مساعدتك اليوم؟ 😊
        `;
        
        bot.sendMessage(chatId, welcomeMessage);
    });

    // عرض المنتجات
    bot.onText(/\/products/, async (msg) => {
        const chatId = msg.chat.id;
        
        try {
            const products = await Product.getAll();
            
            if (products.length === 0) {
                bot.sendMessage(chatId, 'لا توجد منتجات متاحة حالياً 😔');
                return;
            }

            let message = '🛍️ منتجاتنا المتاحة:\n\n';
            
            products.slice(0, 10).forEach((product, index) => {
                message += `${index + 1}. ${product.name}\n`;
                message += `   💰 السعر: ${product.price} جنيه\n`;
                message += `   📝 ${product.description}\n\n`;
            });

            if (products.length > 10) {
                message += `... وأكثر من ${products.length - 10} منتج آخر\n`;
            }

            message += '\nلطلب أي منتج، اكتب: /order [رقم المنتج]';
            
            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('خطأ في جلب المنتجات:', error);
            bot.sendMessage(chatId, 'حدث خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.');
        }
    });

    // عرض الفئات
    bot.onText(/\/categories/, async (msg) => {
        const chatId = msg.chat.id;
        
        const categories = [
            { name: 'حلق', emoji: '✨', command: '/category_حلق' },
            { name: 'خاتم', emoji: '💍', command: '/category_خاتم' },
            { name: 'قلادة', emoji: '📿', command: '/category_قلادة' }
        ];

        let message = '📂 فئات المنتجات:\n\n';
        
        categories.forEach(cat => {
            message += `${cat.emoji} ${cat.name} - ${cat.command}\n`;
        });

        bot.sendMessage(chatId, message);
    });

    // عرض منتجات فئة معينة
    bot.onText(/\/category_(.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const category = match[1];
        
        try {
            const products = await Product.getByCategory(category);
            
            if (products.length === 0) {
                bot.sendMessage(chatId, `لا توجد منتجات في فئة "${category}" حالياً 😔`);
                return;
            }

            let message = `🏷️ منتجات فئة "${category}":\n\n`;
            
            products.forEach((product, index) => {
                message += `${index + 1}. ${product.name}\n`;
                message += `   💰 ${product.price} جنيه\n`;
                message += `   📝 ${product.description}\n\n`;
            });

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('خطأ في جلب منتجات الفئة:', error);
            bot.sendMessage(chatId, 'حدث خطأ في جلب المنتجات. حاول مرة أخرى لاحقاً.');
        }
    });

    // عرض العروض
    bot.onText(/\/offers/, async (msg) => {
        const chatId = msg.chat.id;
        
        try {
            const offers = await Product.getOffers(200);
            
            if (offers.length === 0) {
                bot.sendMessage(chatId, 'لا توجد عروض متاحة حالياً 😔');
                return;
            }

            let message = '🔥 العروض المميزة:\n\n';
            
            offers.forEach((product, index) => {
                message += `${index + 1}. ${product.name}\n`;
                message += `   💰 ${product.price} جنيه فقط!\n`;
                message += `   📝 ${product.description}\n\n`;
            });

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('خطأ في جلب العروض:', error);
            bot.sendMessage(chatId, 'حدث خطأ في جلب العروض. حاول مرة أخرى لاحقاً.');
        }
    });

    // معلومات التواصل
    bot.onText(/\/contact/, (msg) => {
        const chatId = msg.chat.id;
        const contactMessage = `
📞 معلومات التواصل:

🏪 متجر أناقة الستانلس
📱 الهاتف: +20 123 456 7890
📧 البريد: support@elegance-store.com
🕒 ساعات العمل: السبت - الخميس، 9 صباحاً - 6 مساءً

🌐 وسائل التواصل الاجتماعي:
• فيسبوك: [رابط الصفحة]
• إنستجرام: [رابط الحساب]
• تيك توك: [رابط الحساب]

نحن هنا لخدمتك! 😊
        `;
        
        bot.sendMessage(chatId, contactMessage);
    });

    // المساعدة
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        const helpMessage = `
🆘 المساعدة - أوامر البوت:

/start - رسالة الترحيب
/products - عرض جميع المنتجات
/categories - عرض فئات المنتجات
/category_[اسم الفئة] - منتجات فئة معينة
/offers - العروض المميزة
/contact - معلومات التواصل
/help - هذه الرسالة

💡 نصائح:
• يمكنك كتابة اسم المنتج للبحث عنه
• للطلب، تواصل معنا مباشرة أو زر موقعنا
• نحن نرد على جميع الاستفسارات بسرعة

أي سؤال آخر؟ 🤔
        `;
        
        bot.sendMessage(chatId, helpMessage);
    });

    // البحث في المنتجات (أي نص آخر)
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        // تجاهل الأوامر
        if (text.startsWith('/')) return;

        try {
            const products = await Product.search(text);
            
            if (products.length === 0) {
                bot.sendMessage(chatId, `لم أجد منتجات تحتوي على "${text}" 😔\n\nجرب البحث بكلمات أخرى أو استخدم /products لعرض جميع المنتجات.`);
                return;
            }

            let message = `🔍 نتائج البحث عن "${text}":\n\n`;
            
            products.slice(0, 5).forEach((product, index) => {
                message += `${index + 1}. ${product.name}\n`;
                message += `   💰 ${product.price} جنيه\n`;
                message += `   📝 ${product.description}\n\n`;
            });

            if (products.length > 5) {
                message += `... وجدت ${products.length - 5} منتجات أخرى\n`;
            }

            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error('خطأ في البحث:', error);
            bot.sendMessage(chatId, 'حدث خطأ في البحث. حاول مرة أخرى لاحقاً.');
        }
    });
}

// إرسال إشعار طلب جديد للمدير
export async function sendOrderNotification(order) {
    if (!bot || !adminChatId) {
        console.log('⚠️  لا يمكن إرسال إشعار الطلب - البوت أو معرف المدير غير متاح');
        return;
    }

    try {
        const message = `
🔔 طلب جديد!

👤 العميل: ${order.customer_name}
📱 الهاتف: ${order.phone_number}
📍 العنوان: ${order.address}
💰 المبلغ الإجمالي: ${order.total_amount} جنيه

📦 المنتجات:
${order.items.map(item => `• ${item.product_name} (${item.quantity}x)`).join('\n')}

📅 تاريخ الطلب: ${new Date(order.order_date).toLocaleString('ar-EG')}
🆔 رقم الطلب: ${order.id}

${order.notes ? `📝 ملاحظات: ${order.notes}` : ''}
        `;

        await bot.sendMessage(adminChatId, message);
        console.log('✅ تم إرسال إشعار الطلب للمدير');
    } catch (error) {
        console.error('❌ خطأ في إرسال إشعار الطلب:', error);
        throw error;
    }
}

// تصدير البوت
export { bot };

// تشغيل البوت إذا تم تشغيل هذا الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeBot();
}
