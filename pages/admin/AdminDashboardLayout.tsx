
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { THEME_COLORS } from '../../constants';
import Button from '../../components/ui/Button';

interface AdminDashboardLayoutProps {
  onLogout: () => void;
  children: React.ReactNode; 
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ onLogout, children }) => { 
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/admin');
  };

  const adminNavLinks = [
    { name: 'الطلبات المستلمة', path: '/admin/dashboard/orders' },
    { name: 'إدارة المنتجات', path: '/admin/dashboard/products' },
    { name: 'إضافة منتج جديد', path: '/admin/dashboard/add-product' },
    { name: 'إعدادات التواصل', path: '/admin/dashboard/contact-settings' },
    { name: 'إعدادات المظهر', path: '/admin/dashboard/appearance-settings' }, // New Link
  ];

  const activeStyle = `${THEME_COLORS.buttonGold} ${THEME_COLORS.textPrimary}`;
  const inactiveStyle = `${THEME_COLORS.textSecondary} hover:${THEME_COLORS.accentGold} bg-purple-800 hover:bg-purple-700`;

  return (
    <div className={`min-h-screen flex ${THEME_COLORS.background}`}>
      <aside className={`w-64 ${THEME_COLORS.cardBackground} p-6 space-y-6 border-l ${THEME_COLORS.borderColor} shadow-lg flex flex-col`}>
        <div>
          <h2 className={`text-2xl font-bold ${THEME_COLORS.accentGold} mb-8`}>لوحة التحكم</h2>
          <nav className="space-y-3">
            {adminNavLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => 
                  `block w-full text-right px-4 py-3 rounded-md transition-colors duration-200 font-medium ${isActive ? activeStyle : inactiveStyle}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto">
            <Button onClick={handleLogout} variant="secondary" className="w-full">
            تسجيل الخروج
            </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-auto bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950">
        {children} 
      </main>
    </div>
  );
};

export default AdminDashboardLayout;