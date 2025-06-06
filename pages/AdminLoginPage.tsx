
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_PASSWORD, THEME_COLORS } from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      onLoginSuccess();
      navigate('/admin/dashboard/orders'); // Redirect to admin dashboard
    } else {
      setError('كلمة المرور غير صحيحة. حاول مرة أخرى.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${THEME_COLORS.background} p-4 bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950`}>
      <div className={`${THEME_COLORS.cardBackground} p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md border ${THEME_COLORS.borderColor}`}>
        <h1 className={`text-3xl font-bold text-center ${THEME_COLORS.accentGold} mb-8`}>دخول لوحة التحكم</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md">{error}</p>}
          <Input
            label="كلمة المرور"
            id="adminPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="أدخل كلمة المرور"
          />
          <Button type="submit" variant="primary" size="lg" className="w-full">
            دخول
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
