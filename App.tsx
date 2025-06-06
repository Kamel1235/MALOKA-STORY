
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
import AdminAppearanceSettingsPage from './pages/admin/AdminAppearanceSettingsPage'; // Import new page
import useLocalStorage from './hooks/useLocalStorage';
import { THEME_COLORS } from './constants';


const AdminRouteGuard: React.FC<{ isAuthenticated: boolean; onLogout: () => void }> = ({ isAuthenticated, onLogout }) => {
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  // Pass children to AdminDashboardLayout which will render Outlet
  return <AdminDashboardLayout onLogout={onLogout}><Outlet /></AdminDashboardLayout>;
};


const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useLocalStorage<boolean>('isAdminAuthenticated', false);
  
  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
  };


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
            
            {/* AdminRouteGuard now wraps specific admin routes */}
            <Route element={<AdminRouteGuard isAuthenticated={isAdminAuthenticated} onLogout={handleLogout}/>}>
                <Route path="/admin/dashboard/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/dashboard/products" element={<AdminProductsPage />} />
                <Route path="/admin/dashboard/add-product" element={<AdminAddProductPage />} />
                <Route path="/admin/dashboard/contact-settings" element={<AdminContactSettingsPage />} />
                <Route path="/admin/dashboard/appearance-settings" element={<AdminAppearanceSettingsPage />} /> {/* Add new route */}
                <Route path="/admin/dashboard" element={<Navigate to="/admin/dashboard/orders" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} /> {/* Fallback route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;