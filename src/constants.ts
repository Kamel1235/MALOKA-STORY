// import { ContactInfo } from './types'; // No longer needed here

export const THEME_COLORS = {
  background: 'bg-indigo-950',
  cardBackground: 'bg-purple-900',
  accentGold: 'text-amber-400', // #f59e0b
  accentGoldDarker: 'text-amber-500', // #D4AF37 is closer to amber-500/600
  buttonGold: 'bg-amber-500', // Using Tailwind's amber
  buttonGoldHover: 'bg-amber-600',
  textPrimary: 'text-white',
  textSecondary: 'text-gray-300',
  borderColor: 'border-purple-700',
  borderColorGold: 'border-amber-500',
  inputBackground: 'bg-purple-800',
};

export const ADMIN_PASSWORD = 'Kamel01112024743'; // كلمة مرور المدير

export const SITE_NAME = "أناقة الستانلس"; // Consistent Site Name

// Default values will now be handled by the backend or DataContext if API fails or DB is empty.
// export const DEFAULT_FALLBACK_SITE_LOGO_URL = "https://i.ibb.co/tZPYk6G/Maloka-Story-Logo.png"; // Removed

export const NAVIGATION_LINKS = [
  { name: "الرئيسية", path: "/", icon: "HomeIcon" },
  { name: "حلق", path: "/category/حلق", icon: "EarringIcon" },
  { name: "خاتم", path: "/category/خاتم", icon: "RingIcon" },
  { name: "قلادة", path: "/category/قلادة", icon: "NecklaceIcon" },
  { name: "عروض", path: "/offers", icon: "OfferIcon" },
  { name: "تواصل معانا", path: "/contact", icon: "ContactIcon" },
  // { name: "نشر التغييرات", path: "/admin/dashboard/publish", icon: "PublishIcon" }, // Removed
];
