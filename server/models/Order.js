import { dbHelpers } from '../database/database.js';
import { v4 as uuidv4 } from 'uuid';

export class Order {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.customer_name = data.customer_name;
        this.phone_number = data.phone_number;
        this.address = data.address;
        this.total_amount = data.total_amount;
        this.status = data.status || 'Pending';
        this.order_date = data.order_date;
        this.telegram_chat_id = data.telegram_chat_id;
        this.notes = data.notes;
        this.items = data.items || [];
    }

    // إنشاء طلب جديد
    static async create(orderData) {
        const order = new Order(orderData);
        
        // بدء معاملة قاعدة البيانات
        const orderSql = `
            INSERT INTO orders (id, customer_name, phone_number, address, total_amount, status, telegram_chat_id, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const orderParams = [
            order.id,
            order.customer_name,
            order.phone_number,
            order.address,
            order.total_amount,
            order.status,
            order.telegram_chat_id,
            order.notes
        ];

        await dbHelpers.run(orderSql, orderParams);

        // إضافة عناصر الطلب
        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                await OrderItem.create({
                    order_id: order.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_image: item.product_image,
                    quantity: item.quantity,
                    price: item.price
                });
            }
        }

        return order;
    }

    // الحصول على جميع الطلبات
    static async getAll() {
        const sql = 'SELECT * FROM orders ORDER BY order_date DESC';
        const rows = await dbHelpers.all(sql);
        const orders = [];
        
        for (const row of rows) {
            const order = new Order(row);
            order.items = await OrderItem.getByOrderId(order.id);
            orders.push(order);
        }
        
        return orders;
    }

    // الحصول على طلب بالمعرف
    static async getById(id) {
        const sql = 'SELECT * FROM orders WHERE id = ?';
        const row = await dbHelpers.get(sql, [id]);
        if (!row) return null;
        
        const order = new Order(row);
        order.items = await OrderItem.getByOrderId(order.id);
        return order;
    }

    // الحصول على الطلبات حسب الحالة
    static async getByStatus(status) {
        const sql = 'SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC';
        const rows = await dbHelpers.all(sql, [status]);
        const orders = [];
        
        for (const row of rows) {
            const order = new Order(row);
            order.items = await OrderItem.getByOrderId(order.id);
            orders.push(order);
        }
        
        return orders;
    }

    // تحديث حالة الطلب
    static async updateStatus(id, status) {
        const sql = 'UPDATE orders SET status = ? WHERE id = ?';
        const result = await dbHelpers.run(sql, [status, id]);
        return result.changes > 0;
    }

    // البحث في الطلبات
    static async search(query) {
        const sql = `
            SELECT * FROM orders 
            WHERE customer_name LIKE ? OR phone_number LIKE ? 
            ORDER BY order_date DESC
        `;
        const searchTerm = `%${query}%`;
        const rows = await dbHelpers.all(sql, [searchTerm, searchTerm]);
        const orders = [];
        
        for (const row of rows) {
            const order = new Order(row);
            order.items = await OrderItem.getByOrderId(order.id);
            orders.push(order);
        }
        
        return orders;
    }

    // حذف طلب
    static async delete(id) {
        // حذف عناصر الطلب أولاً
        await OrderItem.deleteByOrderId(id);
        
        // ثم حذف الطلب
        const sql = 'DELETE FROM orders WHERE id = ?';
        const result = await dbHelpers.run(sql, [id]);
        return result.changes > 0;
    }

    // تحويل إلى JSON
    toJSON() {
        return {
            id: this.id,
            customerName: this.customer_name,
            phoneNumber: this.phone_number,
            address: this.address,
            totalAmount: this.total_amount,
            status: this.status,
            orderDate: this.order_date,
            telegramChatId: this.telegram_chat_id,
            notes: this.notes,
            items: this.items.map(item => item.toJSON ? item.toJSON() : item)
        };
    }
}

// فئة عناصر الطلب
export class OrderItem {
    constructor(data) {
        this.id = data.id;
        this.order_id = data.order_id;
        this.product_id = data.product_id;
        this.product_name = data.product_name;
        this.product_image = data.product_image;
        this.quantity = data.quantity;
        this.price = data.price;
    }

    // إنشاء عنصر طلب جديد
    static async create(itemData) {
        const sql = `
            INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            itemData.order_id,
            itemData.product_id,
            itemData.product_name,
            itemData.product_image,
            itemData.quantity,
            itemData.price
        ];

        const result = await dbHelpers.run(sql, params);
        return new OrderItem({ ...itemData, id: result.id });
    }

    // الحصول على عناصر الطلب بمعرف الطلب
    static async getByOrderId(orderId) {
        const sql = 'SELECT * FROM order_items WHERE order_id = ?';
        const rows = await dbHelpers.all(sql, [orderId]);
        return rows.map(row => new OrderItem(row));
    }

    // حذف عناصر الطلب بمعرف الطلب
    static async deleteByOrderId(orderId) {
        const sql = 'DELETE FROM order_items WHERE order_id = ?';
        return await dbHelpers.run(sql, [orderId]);
    }

    // تحويل إلى JSON
    toJSON() {
        return {
            id: this.id,
            productId: this.product_id,
            productName: this.product_name,
            productImage: this.product_image,
            quantity: this.quantity,
            price: this.price
        };
    }
}
