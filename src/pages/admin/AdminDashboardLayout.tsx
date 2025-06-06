import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { THEME_COLORS, NAVIGATION_LINKS } from '../../constants';
import Button from '../../components/ui/Button';
import { MenuIcon } from '../../components/icons/MenuIcon';
import { CloseIcon } from '../../components/icons/CloseIcon';
import { PublishIcon } from '../../components/icons/PublishIcon';
import { EarringIcon } from '../../components/icons/EarringIcon';
import { RingIcon } from '../../components/icons/RingIcon';
import { HomeIcon } from '../../components/icons/HomeIcon'; // For الطلبات
import { ContactIcon } from '../../components/icons/ContactIcon'; // For اعدادات التواصل
import { OfferIcon } from '../../components/icons/OfferIcon'; // For اعدادات المظهر (using as generic settings)
import { NecklaceIcon } from '../../components/icons/NecklaceIcon'; // For اضافة منتج

interface AdminDashboardLayoutProps {
  onLogout: () => void;
  children: React.ReactNode; 
}

// Simplified Icon Map for Admin
const AdminIconMap: { [key: string]: React.FC<{className?: string}> } = {
  HomeIcon, // الطلبات
  EarringIcon, // ادارة المنتجات (using Earring as a generic product icon)
  NecklaceIcon, // اضافة منتج
  ContactIcon, // اعدادات التواصل
  OfferIcon, // اعدادات المظهر
  PublishIcon, // نشر التغييرات
};


const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ onLogout, children }) => { 
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/admin');
  };

  const adminNavLinks = [
    { name: 'الطلبات المستلمة', path: '/admin/dashboard/orders', icon: "HomeIcon" },
    { name: 'إدارة المنتجات', path: '/admin/dashboard/products', icon: "EarringIcon" },
    { name: 'إضافة منتج جديد', path: '/admin/dashboard/add-product', icon: "NecklaceIcon" },
    { name: 'إعدادات التواصل', path: '/admin/dashboard/contact-settings', icon: "ContactIcon" },
    { name: 'إعدادات المظهر', path: '/admin/dashboard/appearance-settings', icon: "OfferIcon" },
    { name: 'نشر التغييرات', path: '/admin/dashboard/publish', icon: "PublishIcon"},
  ];

  const activeStyle = `${THEME_COLORS.buttonGold} ${THEME_COLORS.textPrimary}`;
  const inactiveStyle = `${THEME_COLORS.textSecondary} hover:${THEME_COLORS.accentGold} bg-purple-800 hover:bg-purple-700`;

  return (
    <div className={`min-h-screen ${THEME_COLORS.background}`}>
      <div className={`md:hidden flex items-center justify-between p-4 ${THEME_COLORS.cardBackground} border-b ${THEME_COLORS.borderColor} shadow-md sticky top-0 z-30`}>
        <h2 className={`text-xl font-bold ${THEME_COLORS.accentGold}`}>لوحة التحكم</h2>
        <button onClick={() => setIsMobileSidebarOpen(true)} aria-label="فتح القائمة">
          <MenuIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex flex-1">
          <aside 
              className={
                  `fixed inset-y-0 right-0 z-50 w-72 ${THEME_COLORS.cardBackground} p-6 space-y-4 flex flex-col transform transition-transform duration-300 ease-in-out shadow-lg 
                  ${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
                  md:relative md:translate-x-0 md:flex md:flex-shrink-0 md:shadow-none md:border-l ${THEME_COLORS.borderColor}`
              }
              aria-label="القائمة الجانبية للوحة التحكم"
          >
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-2xl font-bold ${THEME_COLORS.accentGold}`}>لوحة التحكم</h2>
                  <button className="md:hidden" onClick={() => setIsMobileSidebarOpen(false)} aria-label="إغلاق القائمة">
                      <CloseIcon className="w-6 h-6 text-white" />
                  </button>
              </div>
              <nav className="space-y-2 flex-grow">
                  {adminNavLinks.map(link => {
                    const IconComponent = AdminIconMap[link.icon];
                    return (
                      <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={() => isMobileSidebarOpen && setIsMobileSidebarOpen(false)}
                          className={({ isActive }) => 
                          `flex items-center space-x-3 space-x-reverse w-full text-right px-4 py-3 rounded-md transition-colors duration-200 font-medium ${isActive ? activeStyle : inactiveStyle}`
                          }
                      >
                          {IconComponent && <IconComponent className="w-5 h-5" />}
                          <span>{link.name}</span>
                      </NavLink>
                    );
                  })}
              </nav>
              <div className="mt-auto">
                  <Button onClick={handleLogout} variant="secondary" className="w-full">
                  تسجيل الخروج
                  </Button>
              </div>
          </aside>

          {isMobileSidebarOpen && (
              <div 
                  className="fixed inset-0 z-40 bg-black/60 md:hidden"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-hidden="true"
              ></div>
          )}

          <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
              {children} 
          </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
