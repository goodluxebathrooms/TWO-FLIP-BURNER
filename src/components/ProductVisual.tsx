import React, { useState } from 'react';
import { Flame, Sparkles, Package, Zap } from 'lucide-react';

export interface ProductVisualProps {
  visualType?: string;
  customImageUrl?: string;
  alt?: string;
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  visualType,
  customImageUrl,
  alt = 'GOODLUXE Luxury Cooktop',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  if (customImageUrl && !hasError) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-white ${className}`}>
        <img
          src={customImageUrl}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain transition-transform duration-300"
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful fallback visual if image fails to load or customImageUrl is not provided
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-[#071A2F] to-slate-800 text-white p-4 ${className}`}
    >
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FFE500_1px,transparent_1px)] [background-size:12px_12px]" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#E51A24] to-[#FFE500] p-0.5 flex items-center justify-center shadow-lg mb-2">
          <div className="w-full h-full bg-[#071A2F] rounded-[10px] flex items-center justify-center">
            {visualType?.includes('sink') ? (
              <Sparkles className="w-6 h-6 text-[#FFE500]" />
            ) : visualType?.includes('lock') ? (
              <Zap className="w-6 h-6 text-[#FFE500]" />
            ) : (
              <Flame className="w-6 h-6 text-[#FFE500]" />
            )}
          </div>
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">
          GOODLUXE
        </span>
        <span className="text-[9px] font-bold text-[#FFE500] uppercase tracking-widest mt-0.5">
          Premium Cooktop
        </span>
      </div>
    </div>
  );
};
