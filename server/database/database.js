import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// إنشاء مجلد قاعدة البيانات إذا لم يكن موجوداً
const dbDir = dirname(process.env.DATABASE_PATH || './database/store.db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// إنشاء اتصال قاعدة البيانات
const db = new sqlite3.Database(process.env.DATABASE_PATH || './database/store.db', (err) => {
    if (err) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
    } else {
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    }
});

// تفعيل المفاتيح الخارجية
db.run('PRAGMA foreign_keys = ON');

// تشغيل ملف إنشاء الجداول
const schemaPath = join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('❌ خطأ في إنشاء الجداول:', err.message);
    } else {
        console.log('✅ تم إنشاء الجداول بنجاح');
    }
});

// وظائف مساعدة لقاعدة البيانات
export const dbHelpers = {
    // تشغيل استعلام مع معاملات
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    },

    // الحصول على صف واحد
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },

    // الحصول على عدة صفوف
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // إغلاق قاعدة البيانات
    close: () => {
        return new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ تم إغلاق قاعدة البيانات');
                    resolve();
                }
            });
        });
    }
};

export default db;
