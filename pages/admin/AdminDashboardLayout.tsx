
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { THEME_COLORS } from '../../constants';
import Button from '../../components/ui/Button';
import { MenuIcon } from '../../components/icons/MenuIcon';
import { CloseIcon } from '../../components/icons/CloseIcon';

interface AdminDashboardLayoutProps {
  onLogout: () => void;
  children: React.ReactNode; 
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ onLogout, children }) => { 
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/admin');
  };

  const adminNavLinks = [
    { name: 'الطلبات المستلمة', path: '/admin/dashboard/orders' },
    { name: 'إدارة المنتجات', path: '/admin/dashboard/products' },
    { name: 'إضافة منتج جديد', path: '/admin/dashboard/add-product' },
    { name: 'إعدادات التواصل', path: '/admin/dashboard/contact-settings' },
    { name: 'إعدادات المظهر', path: '/admin/dashboard/appearance-settings' },
  ];

  const activeStyle = `${THEME_COLORS.buttonGold} ${THEME_COLORS.textPrimary}`;
  const inactiveStyle = `${THEME_COLORS.textSecondary} hover:${THEME_COLORS.accentGold} bg-purple-800 hover:bg-purple-700`;

  return (
    <div className={`min-h-screen ${THEME_COLORS.background}`}>
      {/* Mobile Top Bar */}
      <div className={`md:hidden flex items-center justify-between p-4 ${THEME_COLORS.cardBackground} border-b ${THEME_COLORS.borderColor} shadow-md sticky top-0 z-30`}>
        <h2 className={`text-xl font-bold ${THEME_COLORS.accentGold}`}>لوحة التحكم</h2>
        <button onClick={() => setIsMobileSidebarOpen(true)} aria-label="فتح القائمة">
          <MenuIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex flex-1"> {/* This div will handle the sidebar and main content side-by-side on desktop */}
          {/* Sidebar */}
          <aside 
              className={
                  `fixed inset-y-0 right-0 z-50 w-64 ${THEME_COLORS.cardBackground} p-6 space-y-4 flex flex-col transform transition-transform duration-300 ease-in-out shadow-lg 
                  ${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
                  md:relative md:translate-x-0 md:flex md:flex-shrink-0 md:shadow-none md:border-l ${THEME_COLORS.borderColor}` // RTL: border-l (left in LTR) for desktop
              }
              aria-label="القائمة الجانبية للوحة التحكم"
          >
                <div className="flex justify-between items-center">
                  <h2 className={`text-2xl font-bold ${THEME_COLORS.accentGold} mb-0 md:mb-6`}>لوحة التحكم</h2>
                  <button className="md:hidden" onClick={() => setIsMobileSidebarOpen(false)} aria-label="إغلاق القائمة">
                      <CloseIcon className="w-6 h-6 text-white" />
                  </button>
              </div>
              <nav className="space-y-3 flex-grow">
                  {adminNavLinks.map(link => (
                  <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => isMobileSidebarOpen && setIsMobileSidebarOpen(false)} // Close on mobile nav click
                      className={({ isActive }) => 
                      `block w-full text-right px-4 py-3 rounded-md transition-colors duration-200 font-medium ${isActive ? activeStyle : inactiveStyle}`
                      }
                  >
                      {link.name}
                  </NavLink>
                  ))}
              </nav>
              <div className="mt-auto">
                  <Button onClick={handleLogout} variant="secondary" className="w-full">
                  تسجيل الخروج
                  </Button>
              </div>
          </aside>

          {/* Overlay for mobile */}
          {isMobileSidebarOpen && (
              <div 
                  className="fixed inset-0 z-40 bg-black/60 md:hidden"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-hidden="true"
              ></div>
          )}

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
              {children} 
          </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
