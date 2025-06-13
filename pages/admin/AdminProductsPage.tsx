
import React, { useState, useEffect } from 'react'; // Added useEffect
import { useData } from '../../contexts/DataContext'; // Added
import { Product, ProductCategory } from '../../types';
// Removed INITIAL_PRODUCTS
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import { THEME_COLORS } from '../../constants';
import { generateProductDescription, ImageInput } from '../../utils/geminiApi';

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

const extractImageDataFromDataUrl = (dataUrl: string): ImageInput | null => {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (match && match[1] && match[2]) {
    return { mimeType: match[1], data: match[2] };
  }
  return null;
}

const AdminProductsPage: React.FC = () => {
  const { products, isLoading, error, updateProduct, deleteProduct: deleteProductFromContext } = useData();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingImageFiles, setEditingImageFiles] = useState<FileList | null>(null);
  
  const [isGeneratingDescInModal, setIsGeneratingDescInModal] = useState(false);
  const [descGenerationErrorInModal, setDescGenerationErrorInModal] = useState<string | null>(null);

  // State for local feedback messages after operations
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const openEditModal = (product: Product) => {
    setCurrentProduct(JSON.parse(JSON.stringify(product))); 
    setEditingImageFiles(null); 
    setDescGenerationErrorInModal(null); 
    setIsGeneratingDescInModal(false);
    setFeedbackMessage(null); // Clear feedback when opening modal
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentProduct(null);
    setEditingImageFiles(null);
    setDescGenerationErrorInModal(null);
    setIsGeneratingDescInModal(false);
    // feedbackMessage will be cleared by timer or when opening new modal
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
    if (!currentProduct || !currentProduct.id) {
        setFeedbackMessage({type: 'error', message: "بيانات المنتج غير كاملة أو مفقودة."});
        return;
    }

    let productToSave = { ...currentProduct };

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
      } catch (error) {
        console.error("Error converting images to Base64 for edit:", error);
        setFeedbackMessage({type: 'error', message: "حدث خطأ أثناء تحديث الصور. يرجى المحاولة مرة أخرى."});
        return; 
      }
    }

    try {
        await updateProduct(currentProduct.id, productToSave);
        setFeedbackMessage({type: 'success', message: "تم تحديث المنتج بنجاح!"});
        closeEditModal();
    } catch (err) {
        console.error("Error updating product:", err);
        setFeedbackMessage({type: 'error', message: "حدث خطأ أثناء تحديث المنتج."});
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await deleteProductFromContext(productId);
        setFeedbackMessage({type: 'success', message: "تم حذف المنتج بنجاح!"});
      } catch (err) {
        console.error("Error deleting product:", err);
        setFeedbackMessage({type: 'error', message: "حدث خطأ أثناء حذف المنتج."});
      }
    }
  };
  
  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`p-4 md:p-6 rounded-lg ${THEME_COLORS.cardBackground} shadow-xl`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        {/* Display total products from context, not filtered length */}
        <h1 className={`text-2xl sm:text-3xl font-bold ${THEME_COLORS.accentGold}`}>إدارة المنتجات ({(products || []).length})</h1>
        <Input 
            type="text" 
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
        />
      </div>

      {/* Feedback Message Display */}
      {feedbackMessage && (
        <div className={`p-3 mb-4 rounded-md text-sm ${feedbackMessage.type === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
          {feedbackMessage.message}
        </div>
      )}
      
      {/* Loading, Error, and Empty States */}
      {isLoading && <p className={`text-center py-4 ${THEME_COLORS.textSecondary}`}>جاري تحميل المنتجات...</p>}
      {!isLoading && error && <p className={`text-center py-4 text-red-400`}>خطأ في تحميل المنتجات: {error}</p>}
      {!isLoading && !error && (!products || products.length === 0) && (
        <p className={`text-center py-4 ${THEME_COLORS.textSecondary}`}>لم يتم إضافة منتجات بعد.</p>
      )}

      {/* Products Table and Filtered Results */}
      {!isLoading && !error && products && products.length > 0 && (
        <>
          {filteredProducts.length === 0 && searchTerm && (
            <p className={`text-center py-4 ${THEME_COLORS.textSecondary}`}>لا توجد منتجات تطابق بحثك.</p>
          )}
          {filteredProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-purple-700">
                <thead className="bg-purple-800">
                  <tr>
                    <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>صورة</th>
                    <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>اسم المنتج</th>
                    <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider hidden sm:table-cell`}>السعر</th>
                    <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider hidden md:table-cell`}>الفئة</th>
                    <th scope="col" className={`px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-3 text-right text-xs font-medium ${THEME_COLORS.accentGold} uppercase tracking-wider`}>إجراءات</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-purple-800 ${THEME_COLORS.textPrimary}`}>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap">
                        <img
                          src={product.images[0] || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover"
                          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/50')}
                        />
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm hidden sm:table-cell">{product.price} جنيه</td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm hidden md:table-cell">{product.category}</td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 whitespace-nowrap text-sm space-y-1 sm:space-y-0 sm:space-x-2 sm:space-x-reverse flex flex-col sm:flex-row items-start">
                        <Button size="sm" variant="secondary" onClick={() => openEditModal(product)} className="w-full sm:w-auto">تعديل</Button>
                        <Button
                            size="sm"
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
        </>
      )}

      {currentProduct && (
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="تعديل المنتج">
          <form onSubmit={(e) => {e.preventDefault(); handleSaveProduct();}} className="space-y-4">
            {/* Feedback message inside modal */}
            {feedbackMessage && !feedbackMessage.message.includes("بنجاح") && ( // Only show error/info messages inside modal after action
                <div className={`p-2 mb-3 rounded-md text-xs ${feedbackMessage.type === 'success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                    {feedbackMessage.message}
                </div>
            )}
            <Input label="اسم المنتج" name="name" value={currentProduct.name} onChange={handleEditChange} />
             <div>
                <label className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>الصور الحالية:</label>
                {currentProduct.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1 mb-3 p-2 border border-purple-700 rounded-md bg-purple-800/30">
                    {currentProduct.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Product image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded shadow"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    ))}
                    </div>
                ) : (
                    <p className={`${THEME_COLORS.textSecondary} text-xs`}>لا توجد صور حالية.</p>
                )}
            </div>

            <Input
                label="تحميل صور جديدة (سيتم استبدال الصور الحالية)"
                type="file"
                multiple
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingImageFiles(e.target.files)}
            />
            {editingImageFiles && editingImageFiles.length > 0 && (
                 <div className="mt-1 text-xs text-gray-400">
                    {editingImageFiles.length} صور جديدة تم اختيارها للاستبدال.
                    {editingImageFiles[0] && <span className="block">الصورة الأولى ({editingImageFiles[0].name}) ستستخدم لاقتراح الوصف.</span>}
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="modal_description" className={`block text-sm font-medium ${THEME_COLORS.textSecondary}`}>
                        الوصف (يمكن اقتراحه بناءً على الصورة والاسم)
                    </label>
                    <Button 
                        type="button"
                        onClick={handleSuggestDescriptionInModal}
                        disabled={isGeneratingDescInModal || !currentProduct.name || !currentProduct.category}
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        aria-label="اقتراح وصف المنتج بالذكاء الاصطناعي"
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
            <Input label="اسم المنتج" name="name" value={currentProduct.name} onChange={handleEditChange} />
             <div>
                <label className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>الصور الحالية:</label>
                {currentProduct.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1 mb-3 p-2 border border-purple-700 rounded-md bg-purple-800/30">
                    {currentProduct.images.map((img, index) => (
                        <img 
                          key={index} 
                          src={img} 
                          alt={`Product image ${index + 1}`} 
                          className="w-20 h-20 object-cover rounded shadow"
                          onError={(e) => (e.currentTarget.style.display = 'none')} 
                        />
                    ))}
                    </div>
                ) : (
                    <p className={`${THEME_COLORS.textSecondary} text-xs`}>لا توجد صور حالية.</p>
                )}
            </div>

            <Input 
                label="تحميل صور جديدة (سيتم استبدال الصور الحالية)" 
                type="file"
                multiple 
                accept="image/*" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingImageFiles(e.target.files)}
            />
            {editingImageFiles && editingImageFiles.length > 0 && (
                 <div className="mt-1 text-xs text-gray-400">
                    {editingImageFiles.length} صور جديدة تم اختيارها للاستبدال.
                    {editingImageFiles[0] && <span className="block">الصورة الأولى ({editingImageFiles[0].name}) ستستخدم لاقتراح الوصف.</span>}
                </div>
            )}
            
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="modal_description" className={`block text-sm font-medium ${THEME_COLORS.textSecondary}`}>
                        الوصف (يمكن اقتراحه بناءً على الصورة والاسم)
                    </label>
                    <Button 
                        type="button" 
                        onClick={handleSuggestDescriptionInModal} 
                        disabled={isGeneratingDescInModal || !currentProduct.name || !currentProduct.category}
                        size="sm"
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
                    rows={3} 
                />
                {descGenerationErrorInModal && <p className="mt-1 text-xs text-red-400">{descGenerationErrorInModal}</p>}
            </div>

            <Input label="السعر" name="price" type="number" value={currentProduct.price} onChange={handleEditChange} min="0.01" step="0.01"/>
            <div>
              <label htmlFor="category" className={`block text-sm font-medium ${THEME_COLORS.textSecondary} mb-1`}>الفئة</label>
              <select 
                id="category" 
                name="category" 
                value={currentProduct.category} 
                onChange={handleEditChange}
                className={`w-full px-3 py-2 ${THEME_COLORS.inputBackground} ${THEME_COLORS.textPrimary} border ${THEME_COLORS.borderColor} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:${THEME_COLORS.borderColorGold} sm:text-sm`}
              >
                {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 space-x-reverse pt-4">
              <Button type="button" variant="ghost" onClick={closeEditModal}>إلغاء</Button>
              <Button type="submit" variant="primary">حفظ التعديلات</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminProductsPage;
