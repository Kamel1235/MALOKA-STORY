
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Product, ProductCategory } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import { THEME_COLORS } from '../../constants';
import { generateProductDescription, ImageInput } from '../../utils/geminiApi'; // Import Gemini API util and ImageInput

// Helper to convert file to base64 and get mimeType
const fileToImageInputOnEdit = (file: File): Promise<ImageInput> => {
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

// Helper to extract base64 and mimeType from existing Data URL
const extractImageDataFromDataUrl = (dataUrl: string): ImageInput | null => {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.*)$/); // Specifically for images
  if (match && match[1] && match[2]) {
    return { mimeType: match[1], data: match[2] };
  }
  return null;
}

const AdminProductsPage: React.FC = () => {
  const { products, fetchProducts, updateProduct, deleteProduct, isLoading, error } = useData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingImageFiles, setEditingImageFiles] = useState<FileList | null>(null);
  
  const [isGeneratingDescInModal, setIsGeneratingDescInModal] = useState(false);
  const [descGenerationErrorInModal, setDescGenerationErrorInModal] = useState<string | null>(null);
  const [editFormError, setEditFormError] = useState<string | null>(null); // For errors in edit modal

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openEditModal = (product: Product) => {
    setEditFormError(null); // Clear previous errors
    setCurrentProduct(JSON.parse(JSON.stringify(product))); // Deep copy
    setEditingImageFiles(null);
    setDescGenerationErrorInModal(null);
    setIsGeneratingDescInModal(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentProduct(null);
    setEditingImageFiles(null);
    setDescGenerationErrorInModal(null);
    setIsGeneratingDescInModal(false);
    setEditFormError(null); // Clear errors on close
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!currentProduct) return;
    const { name, value } = e.target;

    if (name === "images") return; 

    if (name === "price") {
        setCurrentProduct({ ...currentProduct, [name]: parseFloat(value) });
    } else {
        setCurrentProduct({ ...currentProduct, [name]: value });
    }
    if (name === 'description' && descGenerationErrorInModal) {
      setDescGenerationErrorInModal(null); 
    }
  };

  const handleSuggestDescriptionInModal = async () => {
    if (!currentProduct || !currentProduct.name || !currentProduct.category) {
      setDescGenerationErrorInModal("اسم المنتج والفئة مطلوبان لاقتراح وصف.");
      return;
    }
    setIsGeneratingDescInModal(true);
    setDescGenerationErrorInModal(null);

    let imageInput: ImageInput | null = null;

    if (editingImageFiles && editingImageFiles.length > 0) {
        try {
            imageInput = await fileToImageInputOnEdit(editingImageFiles[0]);
        } catch (error) {
            console.error("Error converting new image for AI (edit modal):", error);
            setDescGenerationErrorInModal("خطأ في معالجة الصورة الجديدة. حاول مرة أخرى.");
            setIsGeneratingDescInModal(false);
            return;
        }
    } else if (currentProduct.images && currentProduct.images.length > 0) {
        imageInput = extractImageDataFromDataUrl(currentProduct.images[0]);
        if (!imageInput) {
            console.warn("Could not extract base64 from existing image URL:", currentProduct.images[0]);
        }
    }

    try {
      const description = await generateProductDescription(
        currentProduct.name, 
        currentProduct.category, 
        currentProduct.description, 
        imageInput 
      );
      setCurrentProduct(prev => prev ? { ...prev, description } : null);
    } catch (error: any) {
      setDescGenerationErrorInModal(error.message || "حدث خطأ أثناء إنشاء الوصف.");
    } finally {
      setIsGeneratingDescInModal(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!currentProduct) return;
    setEditFormError(null);

    let productToSave: Partial<Product> = { ...currentProduct };
    delete productToSave.id; // ID should not be in the payload for updateProduct

    if (editingImageFiles && editingImageFiles.length > 0) {
      try {
        const imagePromises = Array.from(editingImageFiles).map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });
        const base64Images = await Promise.all(imagePromises);
        productToSave.images = base64Images;
      } catch (err) {
        console.error("Error converting images to Base64 for edit:", err);
        setEditFormError("حدث خطأ أثناء تحديث الصور. يرجى المحاولة مرة أخرى.");
        return;
      }
    }

    try {
      const success = await updateProduct(currentProduct.id, productToSave);
      if (success) {
        closeEditModal();
        // DataContext handles updating the products list, triggering re-render
      } else {
        setEditFormError("فشل تحديث المنتج. قد يكون هناك خطأ في الخادم أو البيانات.");
      }
    } catch (err: any) {
      console.error("Error saving product:", err);
      setEditFormError(err.message || "حدث خطأ غير متوقع أثناء حفظ المنتج.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const success = await deleteProduct(productId);
        if (!success) {
          alert("فشل حذف المنتج. قد يكون المنتج غير موجود أو حدث خطأ في الخادم.");
        }
        // DataContext handles updating the products list, triggering re-render
      } catch (err: any) {
        console.error("Error deleting product:", err);
        alert(err.message || "حدث خطأ غير متوقع أثناء حذف المنتج.");
      }
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div className={`p-6 ${THEME_COLORS.textPrimary}`}>جاري تحميل المنتجات...</div>;
  }

  if (error) {
    return <div className={`p-6 text-red-400 bg-red-900/30 rounded-md`}>خطأ في تحميل المنتجات: {error}</div>;
  }

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className={`text-2xl sm:text-3xl font-bold ${THEME_COLORS.accentGold}`}>إدارة المنتجات ({products ? products.length : 0})</h1>
        <Input 
            type="text" 
            placeholder="ابحث عن منتج بالاسم أو الفئة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72" // Increased width slightly
        />
      </div>
      
      {products.length === 0 && !searchTerm && (
         <p className={`${THEME_COLORS.textSecondary}`}>لم تتم إضافة أي منتجات حتى الآن. ابدأ بإضافة منتج جديد!</p>
      )}
      {products.length > 0 && filteredProducts.length === 0 && searchTerm && (
        <p className={`${THEME_COLORS.textSecondary}`}>لا توجد منتجات تطابق بحثك.</p>
      )}

      {filteredProducts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-700 table-fixed sm:table-auto">
            <thead className="bg-purple-800">
              <tr>
                <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider w-16 sm:w-20`}>صورة</th>
                <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>اسم المنتج</th>
                <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider hidden sm:table-cell w-24 lg:w-32`}>السعر</th>
                <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider hidden md:table-cell w-32 lg:w-40`}>الفئة</th>
                <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider w-28 sm:w-32 lg:w-36`}>إجراءات</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-purple-800 ${THEME_COLORS.textPrimary}`}>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-purple-700/20 transition-colors duration-150">
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/50'}
                      alt={product.name} 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/50';
                        target.onerror = null; // Prevent infinite loop if placeholder also fails
                      }}
                    />
                  </td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm font-medium truncate" title={product.name}>{product.name}</td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm hidden sm:table-cell">{product.price} جنيه</td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm hidden md:table-cell truncate" title={product.category}>{product.category}</td>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm space-y-1 sm:space-y-0 sm:space-x-1 sm:space-x-reverse flex flex-col sm:flex-row items-start">
                    <Button size="xs" variant="secondary" onClick={() => openEditModal(product)} className="w-full sm:w-auto">تعديل</Button>
                    <Button 
                        size="xs"
                        variant="danger" 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-full sm:w-auto"
                    >
                        حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentProduct && (
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="تعديل المنتج">
          <form onSubmit={(e) => {e.preventDefault(); handleSaveProduct();}} className="space-y-4">
            {editFormError && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-4">{editFormError}</p>}
            <Input label="اسم المنتج" name="name" value={currentProduct.name} onChange={handleEditChange} required />
             <div>
                <label className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>الصور الحالية:</label>
                {currentProduct.images && currentProduct.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1 mb-3 p-2 border border-purple-700 rounded-md bg-purple-800/30 max-h-32 overflow-y-auto">
                    {currentProduct.images.map((img, index) => (
                        <img 
                          key={index} 
                          src={img} 
                          alt={`Product image ${index + 1}`} 
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded shadow"
                          onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none'; // Hide broken image
                              // Optionally, display a placeholder for each broken image
                          }}
                        />
                    ))}
                    </div>
                ) : (
                    <p className={`${THEME_COLORS.textSecondary} text-xs`}>لا توجد صور حالية.</p>
                )}
            </div>

            <Input 
                label="تحميل صور جديدة (اختياري، سيتم استبدال الصور الحالية)"
                type="file"
                multiple 
                accept="image/*" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEditingImageFiles(e.target.files);
                    setEditFormError(null); // Clear error if user changes images
                }}
            />
            {editingImageFiles && editingImageFiles.length > 0 && (
                 <div className="mt-1 text-xs text-gray-400">
                    {editingImageFiles.length} صور جديدة تم اختيارها للاستبدال.
                    {editingImageFiles[0] && <span className="block">الصورة الأولى ({editingImageFiles[0].name}) ستستخدم لاقتراح الوصف (إذا تم طلبه).</span>}
                </div>
            )}
            
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="modal_description" className={`block text-sm font-medium ${THEME_COLORS.textSecondary}`}>
                        الوصف (يمكن اقتراحه بناءً على الاسم والفئة والصورة الأولى)
                    </label>
                    <Button 
                        type="button" 
                        onClick={handleSuggestDescriptionInModal} 
                        disabled={isGeneratingDescInModal || !currentProduct.name || !currentProduct.category}
                        size="xs" // Made button smaller
                        variant="ghost"
                        className="text-xs"
                        aria-label="اقتراح وصف المنتج بالذكاء الاصطناعي"
                    >
                        {isGeneratingDescInModal ? "✨ جاري الإنشاء..." : "✨ اقتراح وصف (AI)"}
                    </Button>
                </div>
                <Textarea 
                    id="modal_description"
                    name="description" 
                    value={currentProduct.description} 
                    onChange={handleEditChange}
                    rows={4} // Increased rows slightly
                    required
                />
                {descGenerationErrorInModal && <p className="mt-1 text-xs text-red-400">{descGenerationErrorInModal}</p>}
            </div>

            <Input label="السعر (بالجنيه)" name="price" type="number" value={currentProduct.price} onChange={handleEditChange} required min="0.01" step="0.01"/>
            <div>
              <label htmlFor="modal_category" className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>الفئة</label>
              <select 
                id="modal_category"
                name="category" 
                value={currentProduct.category} 
                onChange={handleEditChange}
                required
                className={`w-full px-3 py-2 ${THEME_COLORS.inputBackground} ${THEME_COLORS.textPrimary} border ${THEME_COLORS.borderColor} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:${THEME_COLORS.borderColorGold} sm:text-sm`}
              >
                {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-purple-700 mt-6">
              <Button type="button" variant="ghost" onClick={closeEditModal}>إلغاء</Button>
              <Button type="submit" variant="primary" disabled={isGeneratingDescInModal}>حفظ التعديلات</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminProductsPage;
