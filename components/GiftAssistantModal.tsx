
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { THEME_COLORS } from '../constants';
import { Product } from '../types';
import { suggestGifts, GiftSuggestionInput, GiftSuggestion } from '../utils/geminiApi';

interface GiftAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProducts: Product[]; // This will be populated by HomePage from IndexedDB
}

const GiftAssistantModal: React.FC<GiftAssistantModalProps> = ({ isOpen, onClose, availableProducts }) => {
  const [recipient, setRecipient] = useState('صديقة');
  const [occasion, setOccasion] = useState('');
  const [stylePreference, setStylePreference] = useState('');
  const [budget, setBudget] = useState('أقل من 200 جنيه');
  
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([]);
  const [noMatchMessage, setNoMatchMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetFormAndSuggestions = () => {
    setRecipient('صديقة');
    setOccasion('');
    setStylePreference('');
    setBudget('أقل من 200 جنيه');
    setSuggestions([]);
    setNoMatchMessage(null);
    setError(null);
    setIsLoading(false);
  };

  const handleCloseModal = () => {
    resetFormAndSuggestions();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setNoMatchMessage(null);

    if (availableProducts.length === 0) {
        setError("قائمة المنتجات غير متوفرة حالياً. يرجى المحاولة لاحقاً.");
        setIsLoading(false);
        return;
    }

    const productDataForApi = availableProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description
    }));

    const input: GiftSuggestionInput = {
      recipient,
      occasion,
      stylePreference,
      budget,
      availableProducts: productDataForApi,
    };

    try {
      const result = await suggestGifts(input);
      if (typeof result === 'string') {
        setNoMatchMessage(result);
      } else {
        setSuggestions(result);
         if (result.length === 0) {
          setNoMatchMessage("لم أتمكن من العثور على اقتراحات بناءً على اختياراتك. حاول تعديل البحث.");
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع أثناء البحث عن الهدايا.');
    } finally {
      setIsLoading(false);
    }
  };

  const recipientOptions = ["صديقة", "أخت", "أم", "زوجة", "لنفسي", "خطيبة", "أخرى"];
  const budgetOptions = ["أقل من 200 جنيه", "200 - 350 جنيه", "أكثر من 350 جنيه", "لا يهم"];

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="🎁 مساعد الهدايا من ملوكة">
      {suggestions.length === 0 && !noMatchMessage && !error && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className={`${THEME_COLORS.textSecondary} text-sm mb-4`}>أخبرني قليلاً عمن تبحث له عن هدية، وسأساعدك في إيجاد شيء مميز!</p>
          <div>
            <label htmlFor="recipient" className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>لمن الهدية؟</label>
            <select
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={`w-full px-3 py-2 ${THEME_COLORS.inputBackground} ${THEME_COLORS.textPrimary} border ${THEME_COLORS.borderColor} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:${THEME_COLORS.borderColorGold} sm:text-sm`}
            >
              {recipientOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <Input
            label="ما هي المناسبة؟ (اختياري)"
            id="occasion"
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="مثال: عيد ميلاد، نجاح، بدون مناسبة..."
          />
          <Input
            label="ما هو الستايل المفضل للشخص؟ (اختياري)"
            id="stylePreference"
            type="text"
            value={stylePreference}
            onChange={(e) => setStylePreference(e.target.value)}
            placeholder="مثال: بسيط وأنيق، عصري وجريء، تحب الفضة..."
          />
          <div>
            <label htmlFor="budget" className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>الميزانية التقريبية؟</label>
            <select
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`w-full px-3 py-2 ${THEME_COLORS.inputBackground} ${THEME_COLORS.textPrimary} border ${THEME_COLORS.borderColor} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:${THEME_COLORS.borderColorGold} sm:text-sm`}
            >
              {budgetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading || availableProducts.length === 0}>
            {isLoading ? "✨ جاري البحث..." : "ابحث عن الهدية المثالية ✨"}
          </Button>
           {availableProducts.length === 0 && !isLoading && <p className="text-xs text-amber-500 text-center mt-2">قائمة المنتجات لا تزال قيد التحميل، يرجى الانتظار قليلاً.</p>}
        </form>
      )}

      {isLoading && <p className={`${THEME_COLORS.textSecondary} text-center py-4`}>✨ جاري البحث عن اقتراحات هدايا...</p>}
      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md text-center">{error}</p>}
      {noMatchMessage && <p className={`${THEME_COLORS.textSecondary} text-center py-4`}>{noMatchMessage}</p>}

      {suggestions.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className={`text-xl font-semibold ${THEME_COLORS.accentGoldDarker} mb-3`}>اقتراحات الهدايا لك:</h3>
          {suggestions.map((suggestion, index) => (
            <div key={index} className={`p-4 rounded-md ${THEME_COLORS.inputBackground} border ${THEME_COLORS.borderColor}`}>
              {suggestion.productId ? (
                <Link to={`/product/${suggestion.productId}`} onClick={handleCloseModal} className={`font-semibold ${THEME_COLORS.accentGold} hover:underline`}>
                  {suggestion.productName}
                </Link>
              ) : (
                <p className={`font-semibold ${THEME_COLORS.accentGold}`}>{suggestion.productName}</p>
              )}
              <p className={`${THEME_COLORS.textSecondary} text-sm mt-1`}>{suggestion.reason}</p>
            </div>
          ))}
        </div>
      )}
      
      {(suggestions.length > 0 || noMatchMessage || error) && (
         <Button onClick={resetFormAndSuggestions} variant="secondary" size="md" className="w-full mt-6">
            بدء بحث جديد
        </Button>
      )}

    </Modal>
  );
};

export default GiftAssistantModal;
