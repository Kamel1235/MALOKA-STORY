
import { ContactInfo } from './types';

export const THEME_COLORS = {
  background: 'bg-indigo-950',
  cardBackground: 'bg-purple-900',
  accentGold: 'text-amber-400', // #f59e0b
  accentGoldDarker: 'text-amber-500', // #D4AF37 is closer to amber-500/600
  buttonGold: 'bg-amber-500', 
  buttonGoldHover: 'bg-amber-600',
  textPrimary: 'text-white',
  textSecondary: 'text-gray-300',
  borderColor: 'border-purple-700',
  borderColorGold: 'border-amber-500',
  inputBackground: 'bg-purple-800',
};

export const ADMIN_PASSWORD = 'Kamel01112024743'; 

export const SITE_NAME = "أناقة الستانلس"; 

export const DEFAULT_SITE_LOGO_URL = "https://i.ibb.co/tZPYk6G/Maloka-Story-Logo.png";
// Keys for settings are now managed in database.ts (SETTING_KEYS)


export const NAVIGATION_LINKS = [
  { name: "الرئيسية", path: "/", icon: "HomeIcon" },
  { name: "حلق", path: "/category/حلق", icon: "EarringIcon" },
  { name: "خاتم", path: "/category/خاتم", icon: "RingIcon" },
  { name: "قلادة", path: "/category/قلادة", icon: "NecklaceIcon" },
  { name: "عروض", path: "/offers", icon: "OfferIcon" },
  { name: "تواصل معانا", path: "/contact", icon: "ContactIcon" },
];

export const INITIAL_CONTACT_INFO: ContactInfo = {
  phone: '+20 123 456 7890',
  email: 'support@elegance-store.com',
  facebook: '#',
  instagram: '#',
  tiktok: '#',
  workingHours: 'السبت - الخميس، 9 صباحًا - 6 مساءً',
};
