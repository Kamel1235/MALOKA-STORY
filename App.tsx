
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import OffersPage from './pages/OffersPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminAddProductPage from './pages/admin/AdminAddProductPage';
import AdminContactSettingsPage from './pages/admin/AdminContactSettingsPage';
import AdminAppearanceSettingsPage from './pages/admin/AdminAppearanceSettingsPage';
import { THEME_COLORS } from './constants';
import { getSetting, setSetting, SETTING_KEYS, seedInitialData } from './database'; // Import DB functions

const AdminRouteGuard: React.FC<{ isAuthenticated: boolean; onLogout: () => void }> = ({ isAuthenticated, onLogout }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <AdminDashboardLayout onLogout={onLogout}><Outlet /></AdminDashboardLayout>;
};

const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Seed initial data when the app loads
    seedInitialData().catch(err => console.error("Error during initial data seeding:", err));

    const checkAuthStatus = async () => {
      setIsLoadingAuth(true);
      try {
        const authStatus = await getSetting<boolean>(SETTING_KEYS.IS_ADMIN_AUTHENTICATED, false);
        setIsAdminAuthenticated(authStatus);
      } catch (error) {
        console.error("Failed to fetch auth status from DB:", error);
        setIsAdminAuthenticated(false); 
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLoginSuccess = async () => {
    try {
      await setSetting(SETTING_KEYS.IS_ADMIN_AUTHENTICATED, true);
      setIsAdminAuthenticated(true);
    } catch (error) {
      console.error("Failed to set auth status in DB:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await setSetting(SETTING_KEYS.IS_ADMIN_AUTHENTICATED, false);
      setIsAdminAuthenticated(false);
    } catch (error) {
      console.error("Failed to set auth status in DB:", error);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className={`fixed inset-0 ${THEME_COLORS.background} flex flex-col items-center justify-center text-white text-xl z-[9999]`}>
        <div className="animate-pulse">
          <svg className="w-16 h-16 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="mt-4">جاري التحقق من صلاحية الدخول...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className={`flex flex-col min-h-screen ${THEME_COLORS.background}`}>
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            <Route path="/admin" element={isAdminAuthenticated ? <Navigate to="/admin/dashboard/orders" replace /> : <AdminLoginPage onLoginSuccess={handleLoginSuccess} />} />
            
            <Route element={<AdminRouteGuard isAuthenticated={isAdminAuthenticated} onLogout={handleLogout}/>}>
                <Route path="/admin/dashboard/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/dashboard/products" element={<AdminProductsPage />} />
                <Route path="/admin/dashboard/add-product" element={<AdminAddProductPage />} />
                <Route path="/admin/dashboard/contact-settings" element={<AdminContactSettingsPage />} />
                <Route path="/admin/dashboard/appearance-settings" element={<AdminAppearanceSettingsPage />} />
                <Route path="/admin/dashboard" element={<Navigate to="/admin/dashboard/orders" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
