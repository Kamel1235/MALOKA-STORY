// Image service for handling image uploads and conversions

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

class ImageService {
  // Convert file to base64 data URL
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('فشل في تحويل الصورة'));
        }
      };
      reader.onerror = () => reject(new Error('فشل في قراءة الصورة'));
      reader.readAsDataURL(file);
    });
  }

  // Validate image file
  validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'نوع الصورة غير مدعوم. يرجى استخدام JPG, PNG, أو WebP'
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت'
      };
    }

    return { valid: true };
  }

  // Resize image if needed
  resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('فشل في معالجة الصورة'));
      
      // Convert file to data URL for the image element
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // Upload single image
  async uploadImage(file: File): Promise<ImageUploadResult> {
    try {
      // Validate image
      const validation = this.validateImage(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Resize and compress image
      const imageUrl = await this.resizeImage(file);

      return {
        success: true,
        imageUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل في رفع الصورة'
      };
    }
  }

  // Upload multiple images
  async uploadImages(files: FileList): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadImage(files[i]);
      results.push(result);
    }

    return results;
  }

  // Upload images from URLs (for external images)
  async uploadFromUrl(url: string): Promise<ImageUploadResult> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('فشل في تحميل الصورة من الرابط');
      }

      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      
      return await this.uploadImage(file);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'فشل في تحميل الصورة من الرابط'
      };
    }
  }

  // Create thumbnail
  async createThumbnail(imageUrl: string, size: number = 150): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size;
        canvas.height = size;

        // Calculate crop dimensions for square thumbnail
        const minDimension = Math.min(img.width, img.height);
        const x = (img.width - minDimension) / 2;
        const y = (img.height - minDimension) / 2;

        ctx?.drawImage(img, x, y, minDimension, minDimension, 0, 0, size, size);
        
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnailUrl);
      };

      img.onerror = () => reject(new Error('فشل في إنشاء الصورة المصغرة'));
      img.src = imageUrl;
    });
  }

  // Get image dimensions
  getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('فشل في قراءة أبعاد الصورة'));
      img.src = imageUrl;
    });
  }

  // Convert base64 to blob
  base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  }

  // Download image
  downloadImage(imageUrl: string, filename: string = 'image.jpg'): void {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const imageService = new ImageService();
