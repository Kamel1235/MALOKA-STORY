
import { Product, ProductCategory } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'حلق ذهبي لامع',
    description: 'حلق أنيق من الستانلس ستيل المطلي بالذهب، تصميم فريد يناسب جميع المناسبات.',
    price: 150,
    images: ['https://picsum.photos/seed/p1img1/600/600', 'https://picsum.photos/seed/p1img2/600/600'],
    category: ProductCategory.Earrings,
  },
  {
    id: '2',
    name: 'خاتم فضي مرصع',
    description: 'خاتم من الستانلس ستيل الفضي مع فص كريستال لامع، يضيف لمسة من الرقي.',
    price: 220,
    images: ['https://picsum.photos/seed/p2img1/600/600'],
    category: ProductCategory.Rings,
  },
  {
    id: '3',
    name: 'قلادة الفراشة الذهبية',
    description: 'قلادة رقيقة بتصميم فراشة من الستانلس ستيل الذهبي، مثالية للإطلالات اليومية.',
    price: 180,
    images: ['https://picsum.photos/seed/p3img1/600/600', 'https://picsum.photos/seed/p3img2/600/600', 'https://picsum.photos/seed/p3img3/600/600'],
    category: ProductCategory.Necklaces,
  },
  {
    id: '4',
    name: 'طقم حلق وخاتم بنفسجي',
    description: 'طقم متناسق من حلق وخاتم ستانلس ستيل بلون بنفسجي غامق جذاب.',
    price: 350,
    images: ['https://picsum.photos/seed/p4img1/600/600'],
    category: ProductCategory.Earrings, // Or a new category "Sets"
  },
  {
    id: '5',
    name: 'قلادة القمر والنجوم',
    description: 'قلادة ساحرة بتصميم القمر والنجوم، مصنوعة من الستانلس ستيل عالي الجودة.',
    price: 200,
    images: ['https://picsum.photos/seed/p5img1/600/600'],
    category: ProductCategory.Necklaces,
  },
  {
    id: '6',
    name: 'خاتم رجالي أسود',
    description: 'خاتم رجالي أنيق من الستانلس ستيل الأسود، تصميم عصري وقوي.',
    price: 190,
    images: ['https://picsum.photos/seed/p6img1/600/600'],
    category: ProductCategory.Rings,
  },
];
