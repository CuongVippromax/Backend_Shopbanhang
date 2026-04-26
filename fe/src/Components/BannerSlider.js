import React, { useState, useEffect, useCallback } from 'react';
import './BannerSlider.css';

const BannerSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    if (index === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 700);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="banner-slider">
      <div className="banner-slides">
        {images.map((image, index) => (
          <div
            key={index}
            className={`banner-slide ${
              index === currentIndex ? 'active' : 
              index === (currentIndex === 0 ? images.length - 1 : currentIndex - 1) ? 'prev' : ''
            }`}
          >
            <img src={image.src} alt={image.alt || `Banner ${index + 1}`} />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button className="slider-arrow prev" onClick={goToPrev}>
            ‹
          </button>
          <button className="slider-arrow next" onClick={goToNext}>
            ›
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="slider-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
