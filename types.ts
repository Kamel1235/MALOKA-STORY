
export enum ProductCategory {
  Earrings = "حلق",
  Rings = "خاتم",
  Necklaces = "قلادة",
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: ProductCategory;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  productImage: string; // Added productImage
}

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[]; // Updated to use OrderItem
  totalAmount: number;
  orderDate: string; // ISO string
  status: 'Pending' | 'Processed' | 'Shipped' | 'Delivered';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  workingHours: string;
}