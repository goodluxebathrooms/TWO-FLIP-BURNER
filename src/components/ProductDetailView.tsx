import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Check,
  Truck,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Zap,
  Minus,
  Plus,
  PackageCheck,
} from 'lucide-react';
import { Product, formatNaira } from '../data/products';
import { ProductVisual } from './ProductVisual';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onWhatsAppOrder: (product: Product, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
  onBack,
  onAddToCart,
  onBuyNow,
  onWhatsAppOrder,
  onSelectProduct,
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setSelectedImageIdx(0);
  }, [product.id]);

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : ['/images/products/Hbe3f00ba76fa4641848c12908d0d7637q.jpg'];

  const activeImage = galleryImages[selectedImageIdx] || galleryImages[0];
  const savings = Math.max(0, (product.originalPrice - product.currentPrice) * quantity);

  return (
    <div className="bg-[#FBFBF9] min-h-screen pb-24 md:pb-16">
      {/* Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-stone-200/70">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#111111] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collection</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
            <span>GOODLUXE Nigeria</span>
            <span aria-hidden="true">/</span>
            <span>{product.category}</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#111111] font-medium truncate max-w-[220px]">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Contiguous Purchase Module */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Sticky Image Gallery (7 cols) */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm p-2">
              <ProductVisual
                visualType={product.visualType}
                customImageUrl={activeImage}
                alt={`${product.name} - Image ${selectedImageIdx + 1}`}
                className="w-full h-full"
              />
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-[#111111] text-white text-xs font-mono-num font-semibold px-3 py-1.5 rounded">
                  SAVE {product.discount}% ({formatNaira(product.originalPrice - product.currentPrice)})
                </span>
              )}
            </div>

            {/* Thumbnail Strip showing all uploaded product images */}
            <div className="grid grid-cols-5 gap-3">
              {galleryImages.map((imgUrl, idx) => {
                const isActive = selectedImageIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`group rounded-xl overflow-hidden border transition-all cursor-pointer bg-white p-1 ${
                      isActive
                        ? 'border-[#111111] ring-2 ring-[#111111]/15'
                        : 'border-stone-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-square w-full">
                      <ProductVisual
                        visualType={product.visualType}
                        customImageUrl={imgUrl}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Purchase & Conversion Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Clean Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-wider font-semibold text-[#B48A4E]">
                  {product.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">
                  {product.stockStatus} ({product.stockCount} units ready in Lagos &amp; Abuja)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[#111111] tracking-tight">
                {product.name}
              </h1>

              {/* Rating Row */}
              <div className="flex items-center gap-2 mt-3 text-sm">
                <div className="flex items-center gap-0.5 text-[#B48A4E]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#B48A4E]" />
                  ))}
                </div>
                <span className="font-semibold font-mono-num text-[#111111]">
                  {product.rating.toFixed(1)}
                </span>
                <span aria-hidden="true" className="text-stone-300">
                  ·
                </span>
                <span className="text-stone-600">{product.reviewCount} Verified Nigerian Buyers</span>
              </div>
            </div>

            {/* Pricing Block */}
            <div className="p-5 rounded-xl bg-white border border-stone-200/90 space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#111111] font-mono-num">
                  {formatNaira(product.currentPrice * quantity)}
                </span>
                {product.originalPrice > product.currentPrice && (
                  <span className="text-base text-stone-400 line-through font-mono-num">
                    {formatNaira(product.originalPrice * quantity)}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800 font-medium">
                You save {formatNaira(savings)} ({product.discount}% Off) · Free Nationwide Delivery Included
              </p>
            </div>

            {/* Lead Description */}
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-[#111111]">Select Quantity</span>
              <div className="inline-flex items-center border border-stone-300 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-stone-600 hover:text-[#111111] cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-mono-num font-semibold text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  className="p-2.5 text-stone-600 hover:text-[#111111] cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Primary Conversion CTA Stack */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => onBuyNow(product, quantity)}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#E51A24] text-white text-base font-black uppercase hover:bg-[#C9121B] transition-colors whitespace-nowrap cursor-pointer shadow-lg shadow-red-500/25 border-2 border-[#FFE500] animate-action-blink"
              >
                <Zap className="w-5 h-5 text-[#FFE500] fill-[#FFE500]" />
                <span>BUY NOW — PAY ON DELIVERY</span>
              </button>
            </div>

            {/* Nigerian Buyer Trust Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200 text-xs text-stone-600">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#B48A4E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#111111]">Free Nationwide Delivery</p>
                  <p>Same-day Lagos/Abuja, 2–4 days nationwide</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-[#B48A4E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#111111]">Pay on Delivery</p>
                  <p>Inspect item before paying via POS or Transfer</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B48A4E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#111111]">12-Month Warranty</p>
                  <p>Full replacement against factory defects</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <PackageCheck className="w-4 h-4 text-[#B48A4E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#111111]">Complete Installation Kit</p>
                  <p>All fittings &amp; accessories included in box</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 9: Structured 5-Part Product Information Architecture */}
        <div className="mt-16 pt-12 border-t border-stone-200 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* 1. Why You'll Love It & 3. What's Included (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80">
              <h2 className="text-2xl font-display font-semibold text-[#111111] mb-4">
                Why You&apos;ll Love It
              </h2>
              <ul className="space-y-3">
                {product.whyYouLoveIt.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-stone-700">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80">
              <h2 className="text-2xl font-display font-semibold text-[#111111] mb-4">
                What&apos;s Included in the Box
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.whatsIncluded.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FBFBF9] border border-stone-200/60 text-sm text-stone-800"
                  >
                    <Check className="w-4 h-4 text-[#B48A4E] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 2. Product Details, 4. Delivery Info, 5. Payment Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80">
              <h2 className="text-2xl font-display font-semibold text-[#111111] mb-4">
                Product Details
              </h2>
              <dl className="divide-y divide-stone-200/70 text-sm">
                {product.productDetails.map((spec, idx) => (
                  <div key={idx} className="py-3 flex justify-between gap-4">
                    <dt className="text-stone-500 font-medium">{spec.label}</dt>
                    <dd className="text-[#111111] font-semibold text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-[#111111] mb-1.5">
                  Delivery Information
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">{product.deliveryInfo}</p>
              </div>
              <div className="pt-4 border-t border-stone-200/70">
                <h3 className="text-lg font-display font-semibold text-[#111111] mb-1.5">
                  Payment Information
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">{product.paymentInfo}</p>
              </div>
            </section>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#111111] mb-6">
              Complete Your Home Upgrade
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProduct(item);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-white border border-stone-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-white">
                    <ProductVisual
                      visualType={item.visualType}
                      customImageUrl={item.images[0]}
                      alt={item.name}
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs text-stone-500 uppercase">{item.category}</p>
                  <h4 className="text-sm font-semibold text-[#111111] group-hover:text-[#B48A4E] truncate mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-sm font-bold font-mono-num text-[#111111] mt-1">
                    {formatNaira(item.currentPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/98 backdrop-blur-md border-t-2 border-[#0B2545] px-3.5 py-2.5 flex items-center justify-between gap-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.18)]">
        <div>
          <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">Pay on Delivery</p>
          <p className="text-base font-black font-mono-num text-[#0B2545]">
            {formatNaira(product.currentPrice * quantity)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            type="button"
            onClick={() => onBuyNow(product, quantity)}
            className="w-full py-3 px-4 rounded-xl bg-[#E51A24] hover:bg-[#C9121B] text-white text-xs sm:text-sm font-black uppercase tracking-wide whitespace-nowrap shadow-lg shadow-red-500/25 border-2 border-[#FFE500] animate-action-blink"
          >
            ORDER NOW (PAY ON DELIVERY)
          </button>
        </div>
      </div>
    </div>
  );
};
