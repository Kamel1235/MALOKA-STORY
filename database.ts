
import { Product, Order, ContactInfo } from './types';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { INITIAL_CONTACT_INFO, DEFAULT_SITE_LOGO_URL } from './constants';

const DB_NAME = 'EleganceStoreDB';
const DB_VERSION = 2; // Incremented due to schema/seed changes

export const STORES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings',
};

export const SETTING_KEYS = {
  CONTACT_INFO: 'contactInformation',
  SITE_LOGO_URL: 'adminSiteLogoUrl',
  HERO_SLIDER_IMAGES: 'adminHeroSliderImages',
  IS_ADMIN_AUTHENTICATED: 'isAdminAuthenticated',
};

interface SettingItem<T = any> {
  key: string;
  value: T;
}

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(new Error('Error opening IndexedDB.'));
      dbPromise = null; 
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) { // Initial schema creation
        if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
          db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.ORDERS)) {
          db.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      }
      // Example for future upgrades:
      // if (oldVersion < 2) {
      //   // const productsStore = request.transaction.objectStore(STORES.PRODUCTS);
      //   // productsStore.createIndex('category', 'category', { unique: false });
      // }
    };
  });
  return dbPromise;
};

export const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = (event) => reject((event.target as IDBRequest).error || new Error(`Failed to get all items from ${storeName}`));
  });
};

export const getItemById = async <T>(storeName: string, id: string | number): Promise<T | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = (event) => reject((event.target as IDBRequest).error || new Error(`Failed to get item by ID from ${storeName}`));
  });
};

export const addItem = async <T>(storeName: string, item: T): Promise<IDBValidKey> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error || new Error(`Failed to add item to ${storeName}`));
  });
};

export const updateItem = async <T>(storeName: string, item: T): Promise<IDBValidKey> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error || new Error(`Failed to update item in ${storeName}`));
  });
};

export const deleteItemById = async (storeName: string, id: string | number): Promise<void> => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error || new Error(`Failed to delete item by ID from ${storeName}`));
  });
};

export const getSetting = async <T>(key: string, defaultValue: T): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve) => { // Removed reject to always resolve with a value
    const transaction = db.transaction(STORES.SETTINGS, 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result as SettingItem<T> | undefined;
      resolve(result ? result.value : defaultValue);
    };
    request.onerror = () => {
      console.warn(`Error getting setting "${key}", returning default:`, (request as IDBRequest).error);
      resolve(defaultValue);
    };
  });
};

export const setSetting = async <T>(key: string, value: T): Promise<void> => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    const item: SettingItem<T> = { key, value };
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject((event.target as IDBRequest).error || new Error(`Failed to set setting "${key}"`));
  });
};

export const seedInitialData = async () => {
  try {
    const db = await openDB();

    // Seed Products
    const productTx = db.transaction(STORES.PRODUCTS, 'readwrite');
    const productStore = productTx.objectStore(STORES.PRODUCTS);
    const productCountRequest = productStore.count();

    productCountRequest.onsuccess = () => {
      if (productCountRequest.result === 0) {
        INITIAL_PRODUCTS.forEach(product => {
          productStore.add(product).onerror = (e) => console.error("Error seeding product:", product.name, (e.target as IDBRequest).error);
        });
        console.log('Initial products seeded.');
      }
    };
    productCountRequest.onerror = (e) => console.error("Error counting products for seeding:", (e.target as IDBRequest).error);
    
    productTx.onerror = (e) => console.error("Product seeding transaction error:", (e.target as IDBTransaction).error);


    // Seed Settings (Contact Info, Logo, Hero Images, Auth)
    const settingsTx = db.transaction(STORES.SETTINGS, 'readwrite');
    const settingsStore = settingsTx.objectStore(STORES.SETTINGS);

    const settingsToSeed: SettingItem<any>[] = [
      { key: SETTING_KEYS.CONTACT_INFO, value: INITIAL_CONTACT_INFO },
      { key: SETTING_KEYS.SITE_LOGO_URL, value: DEFAULT_SITE_LOGO_URL },
      { key: SETTING_KEYS.HERO_SLIDER_IMAGES, value: [] },
      { key: SETTING_KEYS.IS_ADMIN_AUTHENTICATED, value: false },
    ];

    for (const setting of settingsToSeed) {
      const getRequest = settingsStore.get(setting.key);
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          settingsStore.add(setting).onerror = (e) => console.error("Error seeding setting:", setting.key, (e.target as IDBRequest).error);
          console.log(`Initial setting seeded: ${setting.key}`);
        }
      };
      getRequest.onerror = (e) => console.error("Error checking setting for seeding:", setting.key, (e.target as IDBRequest).error);
    }
    
    settingsTx.onerror = (e) => console.error("Settings seeding transaction error:", (e.target as IDBTransaction).error);

  } catch (error) {
    console.error("Failed to open DB for seeding:", error);
  }
};
