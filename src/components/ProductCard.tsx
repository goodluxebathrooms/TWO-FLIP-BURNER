import React from 'react';
import { Star, ShoppingBag, Zap } from 'lucide-react';
import { Product, formatNaira } from '../data/products';
import { ProductVisual } from './ProductVisual';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
}) => {
  const primaryImage = product.images[0];

  return (
    <article className="group bg-white border border-stone-200/80 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Clickable Product Image Container */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square w-full cursor-pointer overflow-hidden bg-white p-2"
      >
        <ProductVisual
          visualType={product.visualType}
          customImageUrl={primaryImage}
          alt={product.name}
          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
        />

        {/* Single subtle discount tag in top-left corner */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#111111] text-white text-xs font-mono-num font-medium px-2.5 py-1 rounded">
            -{product.discount}% OFF
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 border-t border-stone-100">
        <div>
          {/* Clean Unboxed Metadata Row */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="uppercase tracking-wider font-medium text-stone-500">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-stone-700 font-medium">
              <Star className="w-3.5 h-3.5 fill-[#B48A4E] text-[#B48A4E]" />
              <span className="font-mono-num">{product.rating.toFixed(1)}</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400 font-mono-num">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-base font-semibold text-[#111111] group-hover:text-[#B48A4E] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-100">
          {/* Price Block */}
          <div className="flex items-baseline gap-2.5 mb-3.5">
            <span className="text-lg font-bold text-[#111111] font-mono-num">
              {formatNaira(product.currentPrice)}
            </span>
            {product.originalPrice > product.currentPrice && (
              <span className="text-xs text-stone-400 line-through font-mono-num">
                {formatNaira(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Dual Conversion CTA Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAddToCart(product, 1)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-stone-300 text-xs font-semibold text-[#111111] hover:border-[#111111] hover:bg-stone-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>ADD TO CART</span>
            </button>
            <button
              type="button"
              onClick={() => onBuyNow(product, 1)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#B48A4E] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>BUY NOW</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
