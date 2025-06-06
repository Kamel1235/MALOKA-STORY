import React, { useState } from 'react';
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
import AdminPublishDataPage from './pages/admin/AdminPublishDataPage'; // New page for publishing
import useLocalStorage from './hooks/useLocalStorage';
import { THEME_COLORS } from './constants';
import { useData } from './contexts/DataContext'; // Import useData

const AdminRouteGuard: React.FC<{ isAuthenticated: boolean; onLogout: () => void }> = ({ isAuthenticated, onLogout }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <AdminDashboardLayout onLogout={onLogout}><Outlet /></AdminDashboardLayout>;
};

const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useLocalStorage<boolean>('isAdminAuthenticated', false);
  const { isLoading, error: dataError, settings } = useData(); // Get isLoading and error from DataContext
  
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
  };

  if (isLoading && !settings) { // Show loading state only on initial load if settings are not yet available
    return (
      <div className={`fixed inset-0 ${THEME_COLORS.background} flex flex-col items-center justify-center z-[100]`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
        <p className={`${THEME_COLORS.textPrimary} mt-4 text-lg`}>جاري تحميل بيانات المتجر...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className={`flex flex-col min-h-screen ${THEME_COLORS.background}`}>
        <Header />
        <main className="flex-grow pt-4">
          {dataError && (
            <div className="container mx-auto px-4 py-2">
              <div className="bg-red-700 text-white p-4 rounded-md shadow-lg text-center" role="alert">
                <p className="font-semibold">خطأ في تحميل البيانات!</p>
                <p className="text-sm">{dataError}</p>
              </div>
            </div>
          )}
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
                <Route path="/admin/dashboard/publish" element={<AdminPublishDataPage />} /> {/* New Publish Route */}
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
