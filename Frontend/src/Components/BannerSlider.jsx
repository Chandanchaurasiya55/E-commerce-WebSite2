import React, { useEffect, useRef, useState } from 'react';

const BannerSlider = ({ images = [], interval = 4000, width = 1200, height = 320 }) => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [images.length, interval]);

  const go = (i) => {
    clearInterval(timerRef.current);
    setIndex(i);
  };

  const next = () => go((index + 1) % images.length);
  const prev = () => go((index - 1 + images.length) % images.length);

  return (
    <div className="slider-outer" style={{ maxWidth: width }}>
      <div className="slider" style={{ height: height }}>
        <div
          className="slider-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <div className="slide" key={i} style={{ width: '100%', height: '100%' }}>
              <img src={src} alt={`slide-${i}`} />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button className="slider-arrow left" onClick={prev} aria-label="Previous">‹</button>
            <button className="slider-arrow right" onClick={next} aria-label="Next">›</button>
            <div className="slider-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`dot ${i === index ? 'active' : ''}`}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BannerSlider;
