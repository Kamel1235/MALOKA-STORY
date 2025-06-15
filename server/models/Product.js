import { dbHelpers } from '../database/database.js';
import { v4 as uuidv4 } from 'uuid';

export class Product {
    constructor(data) {
        this.id = data.id || uuidv4();
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.category = data.category;
        this.images = Array.isArray(data.images) ? data.images : JSON.parse(data.images || '[]');
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // إنشاء منتج جديد
    static async create(productData) {
        const product = new Product(productData);
        const sql = `
            INSERT INTO products (id, name, description, price, category, images)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            product.id,
            product.name,
            product.description,
            product.price,
            product.category,
            JSON.stringify(product.images)
        ];

        await dbHelpers.run(sql, params);
        return product;
    }

    // الحصول على جميع المنتجات
    static async getAll() {
        const sql = 'SELECT * FROM products ORDER BY created_at DESC';
        const rows = await dbHelpers.all(sql);
        return rows.map(row => new Product(row));
    }

    // الحصول على منتج بالمعرف
    static async getById(id) {
        const sql = 'SELECT * FROM products WHERE id = ?';
        const row = await dbHelpers.get(sql, [id]);
        return row ? new Product(row) : null;
    }

    // الحصول على المنتجات حسب الفئة
    static async getByCategory(category) {
        const sql = 'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC';
        const rows = await dbHelpers.all(sql, [category]);
        return rows.map(row => new Product(row));
    }

    // البحث في المنتجات
    static async search(query) {
        const sql = `
            SELECT * FROM products 
            WHERE name LIKE ? OR description LIKE ? 
            ORDER BY created_at DESC
        `;
        const searchTerm = `%${query}%`;
        const rows = await dbHelpers.all(sql, [searchTerm, searchTerm]);
        return rows.map(row => new Product(row));
    }

    // تحديث منتج
    static async update(id, updateData) {
        const existingProduct = await Product.getById(id);
        if (!existingProduct) {
            throw new Error('المنتج غير موجود');
        }

        const updatedProduct = new Product({ ...existingProduct, ...updateData });
        const sql = `
            UPDATE products 
            SET name = ?, description = ?, price = ?, category = ?, images = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const params = [
            updatedProduct.name,
            updatedProduct.description,
            updatedProduct.price,
            updatedProduct.category,
            JSON.stringify(updatedProduct.images),
            id
        ];

        await dbHelpers.run(sql, params);
        return updatedProduct;
    }

    // حذف منتج
    static async delete(id) {
        const sql = 'DELETE FROM products WHERE id = ?';
        const result = await dbHelpers.run(sql, [id]);
        return result.changes > 0;
    }

    // الحصول على المنتجات بسعر أقل من قيمة معينة (للعروض)
    static async getOffers(maxPrice = 200) {
        const sql = 'SELECT * FROM products WHERE price < ? ORDER BY price ASC';
        const rows = await dbHelpers.all(sql, [maxPrice]);
        return rows.map(row => new Product(row));
    }

    // تحويل إلى JSON
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            category: this.category,
            images: this.images,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}
