
import React, { useState } from 'react';
import { THEME_COLORS } from '../../constants';

interface ImageSliderProps {
  images: string[];
  altText: string;
  isHero?: boolean;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, altText, isHero = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className={`w-full ${isHero ? 'h-[500px]' : 'h-96'} ${THEME_COLORS.cardBackground} flex items-center justify-center ${THEME_COLORS.textSecondary}`}>لا توجد صور متاحة</div>;
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className={`relative w-full ${isHero ? 'h-[calc(100vh-200px)] max-h-[600px]' : 'h-96 md:h-[500px]'} overflow-hidden rounded-lg shadow-xl group`}>
      <div
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
        className="w-full h-full bg-center bg-cover duration-700 ease-in-out transform group-hover:scale-105"
        aria-label={altText}
      ></div>
      {/* Left Arrow */}
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className={`absolute top-1/2 left-3 transform -translate-y-1/2 p-2 ${THEME_COLORS.buttonGold} ${THEME_COLORS.textPrimary} rounded-full shadow-md hover:${THEME_COLORS.buttonGoldHover} transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-10`}
          aria-label="الصورة السابقة"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      {/* Right Arrow */}
      {images.length > 1 && (
        <button
          onClick={goToNext}
          className={`absolute top-1/2 right-3 transform -translate-y-1/2 p-2 ${THEME_COLORS.buttonGold} ${THEME_COLORS.textPrimary} rounded-full shadow-md hover:${THEME_COLORS.buttonGoldHover} transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-10`}
          aria-label="الصورة التالية"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
      {/* Dots */}
      {images.length > 1 && (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === slideIndex ? THEME_COLORS.buttonGold : 'bg-gray-400 hover:bg-gray-300'}`}
            aria-label={`الذهاب إلى الصورة ${slideIndex + 1}`}
          ></button>
        ))}
      </div>
      )}
      {isHero && (
        <div className={`absolute inset-0 bg-gradient-to-t from-indigo-950/70 via-transparent to-transparent flex flex-col items-center justify-end p-8 text-center ${THEME_COLORS.textPrimary}`}>
            <h1 className={`text-4xl md:text-6xl font-bold ${THEME_COLORS.accentGold} mb-4 drop-shadow-lg`}>اكتشف أناقتك</h1>
            <p className="text-lg md:text-2xl mb-6 drop-shadow-md">أفخم تشكيلة من إكسسوارات الستانلس ستيل</p>
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
