import React, { useState } from 'react';
import { Product, ProductCategory } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { THEME_COLORS } from '../../constants';
import { useNavigate } from 'react-router-dom';
import { generateProductDescription, ImageInput } from '../../utils/geminiApi';
import { useData } from '../../contexts/DataContext'; // Import useData

const fileToImageInput = (file: File): Promise<ImageInput> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
      if (match && match[1] && match[2]) {
        resolve({ mimeType: match[1], data: match[2] });
      } else {
        resolve({ mimeType: file.type || 'application/octet-stream', data: dataUrl.split(',')[1] });
      }
    };
    reader.onerror = (error) => reject(error);
  });
};


const AdminAddProductPage: React.FC = () => {
  const { setProducts } = useData(); // Use setProducts from DataContext
  const navigate = useNavigate();

  const initialFormState: Omit<Product, 'id' | 'images'> = {
    name: '',
    description: '',
    price: 0,
    category: ProductCategory.Earrings, 
  };
  
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'images'>>(initialFormState);
  const [selectedImageFiles, setSelectedImageFiles] = useState<FileList | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [descGenerationError, setDescGenerationError] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
    if (name === 'description' && descGenerationError) {
      setDescGenerationError(null); 
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedImageFiles(e.target.files);
  };

  const handleSuggestDescription = async () => {
    if (!newProduct.name || !newProduct.category) {
      setDescGenerationError("يرجى إدخال اسم المنتج والفئة أولاً لاقتراح وصف.");
      return;
    }
    setIsGeneratingDesc(true);
    setDescGenerationError(null);

    let imageInput: ImageInput | null = null;
    if (selectedImageFiles && selectedImageFiles.length > 0) {
      try {
        imageInput = await fileToImageInput(selectedImageFiles[0]);
      } catch (error) {
        console.error("Error converting image for AI description:", error);
        setDescGenerationError("خطأ في معالجة الصورة. حاول مرة أخرى.");
        setIsGeneratingDesc(false);
        return;
      }
    }

    try {
      const description = await generateProductDescription(
        newProduct.name, 
        newProduct.category, 
        newProduct.description, 
        imageInput
      );
      setNewProduct(prev => ({ ...prev, description }));
    } catch (error: any) {
      setDescGenerationError(error.message || "حدث خطأ أثناء إنشاء الوصف.");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFeedback(null);

    if (!newProduct.name || newProduct.price <= 0 || !selectedImageFiles || selectedImageFiles.length === 0) {
        setFormError("يرجى ملء الاسم، السعر، واختيار صورة واحدة على الأقل للمنتج.");
        return;
    }

    try {
      const imagePromises = Array.from(selectedImageFiles).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      const base64Images = await Promise.all(imagePromises);

      const productToAdd: Product = {
        ...newProduct,
        id: new Date().toISOString() + Math.random().toString(36).substr(2, 9), 
        images: base64Images,
      };

      setProducts(prevProducts => [...prevProducts, productToAdd]);
      setNewProduct(initialFormState); 
      setSelectedImageFiles(null); 
      const fileInput = document.getElementById('imageFiles') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setFeedback(`تمت إضافة المنتج "${productToAdd.name}" بنجاح إلى جلسة العمل الحالية. لجعل المنتج دائماً ومرئياً للجميع، اذهب إلى صفحة 'نشر التغييرات' وقم بتحديث ملفات الموقع.`);
      setTimeout(() => setFeedback(null), 7000);
      // navigate('/admin/dashboard/products'); // Don't navigate immediately, let admin publish

    } catch (error) {
      console.error("Error processing images for saving:", error);
      setFormError("حدث خطأ أثناء معالجة الصور للحفظ. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <h1 className={`text-3xl font-bold ${THEME_COLORS.accentGold} mb-8`}>إضافة منتج جديد</h1>
      {formError && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4">{formError}</p>}
      {feedback && <p className="text-green-400 bg-green-900/30 p-3 rounded-md mb-4">{feedback}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="اسم المنتج" 
          name="name" 
          value={newProduct.name} 
          onChange={handleChange} 
          required 
          placeholder="مثال: حلق فضي أنيق"
        />
        
         <Input
          label="صور المنتج (يمكنك اختيار أكثر من صورة)"
          type="file"
          name="imageFiles"
          id="imageFiles" 
          multiple
          accept="image/*"
          onChange={handleImageFileChange}
          required
        />
         {selectedImageFiles && selectedImageFiles.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">
                {selectedImageFiles.length} صور تم اختيارها.
                 {selectedImageFiles[0] && <span className="block">الصورة الأولى ({selectedImageFiles[0].name}) ستستخدم لاقتراح الوصف.</span>}
            </div>
        )}

        <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className={`block text-sm font-medium ${THEME_COLORS.textSecondary}`}>
                    وصف المنتج (يمكن اقتراحه بناءً على الصورة والاسم)
                </label>
                <Button 
                    type="button" 
                    onClick={handleSuggestDescription} 
                    disabled={isGeneratingDesc || !newProduct.name || !newProduct.category}
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    aria-label="اقتراح وصف المنتج بالذكاء الاصطناعي"
                >
                    {isGeneratingDesc ? "✨ جاري الإنشاء..." : "✨ اقتراح وصف (AI)"}
                </Button>
            </div>
            <Textarea 
              id="description"
              name="description" 
              value={newProduct.description} 
              onChange={handleChange} 
              placeholder="وصف تفصيلي للمنتج ومميزاته..."
              rows={3}
            />
            {descGenerationError && <p className="mt-1 text-xs text-red-400">{descGenerationError}</p>}
        </div>

        <Input 
          label="سعر المنتج (بالجنيه)" 
          name="price" 
          type="number" 
          value={newProduct.price} 
          onChange={handleChange} 
          required 
          min="0.01" 
          step="0.01"
        />
        <div>
          <label htmlFor="category" className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>فئة المنتج</label>
          <select
            id="category"
            name="category"
            value={newProduct.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 ${THEME_COLORS.inputBackground} ${THEME_COLORS.textPrimary} border ${THEME_COLORS.borderColor} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:${THEME_COLORS.borderColorGold} sm:text-sm`}
          >
            {Object.values(ProductCategory).map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
       
        <Button type="submit" variant="primary" size="lg" className="w-full">
          إضافة المنتج للجلسة الحالية
        </Button>
      </form>
    </div>
  );
};

export default AdminAddProductPage;