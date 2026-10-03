import React, { useState } from 'react';
import { Product } from '../data/products';

interface ProductVisualProps {
  visualType: Product['visualType'];
  angle?: string;
  customImageUrl?: string;
  alt: string;
  className?: string;
  interactive?: boolean;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  angle = 'studio-front',
  customImageUrl,
  alt,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const isUrlOrPath = (val?: string) =>
    Boolean(
      val &&
        (val.startsWith('/') ||
          val.startsWith('http://') ||
          val.startsWith('https://') ||
          val.startsWith('data:'))
    );

  const resolvedSrc = isUrlOrPath(customImageUrl)
    ? customImageUrl
    : isUrlOrPath(angle)
    ? angle
    : '/images/products/Hbe3f00ba76fa4641848c12908d0d7637q.jpg';

  if (resolvedSrc && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-white flex items-center justify-center ${className}`}>
        <img
          src={resolvedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-white flex items-center justify-center ${className}`}
      role="img"
      aria-label={alt}
    >
      <img
        src="/images/products/Hbe3f00ba76fa4641848c12908d0d7637q.jpg"
        alt={alt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
    </div>
  );
};
