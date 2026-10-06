/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  CreditCard,
  Star,
  Lock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  SlidersHorizontal,
  CheckCircle2,
  ShieldCheck,
  Check,
  Minus,
  Plus,
  Zap,
  PackageCheck,
  Banknote,
  Copy,
  Clock,
  AlertCircle,
  Flame,
  HelpCircle,
  Headphones,
} from 'lucide-react';
import {
  SINGLE_PRODUCT,
  TESTIMONIALS,
  FAQS,
  Product,
  NIGERIAN_STATES,
  WHATSAPP_PHONE,
  FORMSPREE_ENDPOINT,
  formatNaira,
  calculateProgressivePricing,
} from './data/products';
import { ProductVisual } from './components/ProductVisual';
import { CartCheckoutModal, CartItem, OrderRecord } from './components/CartCheckoutModal';
import { AdminProductModal } from './components/AdminProductModal';
import { QuickOrderPopupModal } from './components/QuickOrderPopupModal';
import { StickyPromoBar } from './components/StickyPromoBar';
import { FloatingOrderNotification } from './components/FloatingOrderNotification';
import { validateOrderForm, FormErrors } from './utils/validation';

const STORAGE_PRODUCT_KEY = 'goodluxe_single_product_v6';
const STORAGE_CART_KEY = 'goodluxe_single_cart_v1';
const STORAGE_ORDERS_KEY = 'goodluxe_single_orders_v1';

export default function App() {
  // Single Product State
  const [product, setProduct] = useState<Product>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch {
      // Fallback to default single product
    }
    return SINGLE_PRODUCT;
  });

  // Image Gallery Slideshow State
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [isSlideshowPaused, setIsSlideshowPaused] = useState<boolean>(false);

  // Quantity State
  const [quantity, setQuantity] = useState<number>(1);

  // Shopping Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Orders State
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // On-Page Quick Order Form State (Pay on Delivery Only)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Lagos');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [confirmedInlineOrder, setConfirmedInlineOrder] = useState<OrderRecord | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // UI Modals & Menus
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartModalMode, setCartModalMode] = useState<'cart' | 'checkout'>('cart');
  const [quickOrderPopupOpen, setQuickOrderPopupOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile Touch Gestures & Card Accordion state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [openAccordionCards, setOpenAccordionCards] = useState<Record<string, boolean>>({
    love: true,
    specs: true,
    included: false,
    delivery: false,
  });

  const toggleAccordionCard = (key: string) => {
    setOpenAccordionCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      setSelectedImageIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    } else if (diff < -45) {
      setSelectedImageIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    }
    setTouchStartX(null);
  };

  // Live Top Promo 7-Day Countdown Timer (06 d : 23 h : 52 m : 26 s)
  const PROMO_7DAY_SECONDS = 6 * 86400 + 23 * 3600 + 52 * 60 + 26;
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    try {
      const savedEnd = localStorage.getItem('goodluxe_7day_promo_end_v2');
      const now = Date.now();
      if (savedEnd) {
        const diff = Math.floor((Number(savedEnd) - now) / 1000);
        if (diff > 0) return diff;
      }
      const initialSeconds = PROMO_7DAY_SECONDS;
      localStorage.setItem('goodluxe_7day_promo_end_v2', String(now + initialSeconds * 1000));
      return initialSeconds;
    } catch {
      return PROMO_7DAY_SECONDS;
    }
  });

  // Track if user has submitted an order form so WhatsApp button only reveals after form submission
  const [hasSubmittedForm, setHasSubmittedForm] = useState<boolean>(() => {
    try {
      return localStorage.getItem('goodluxe_has_submitted_form') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(() => {
        try {
          const now = Date.now();
          const savedEnd = Number(localStorage.getItem('goodluxe_7day_promo_end_v2'));
          const remaining = savedEnd ? Math.floor((savedEnd - now) / 1000) : 0;
          if (remaining <= 0) {
            // Graceful reset
            const resetEnd = now + PROMO_7DAY_SECONDS * 1000;
            localStorage.setItem('goodluxe_7day_promo_end_v2', String(resetEnd));
            return PROMO_7DAY_SECONDS;
          }
          return remaining;
        } catch {
          return PROMO_7DAY_SECONDS;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [PROMO_7DAY_SECONDS]);

  // Automatically show Quick Order Pop-Up Form every 35 seconds
  useEffect(() => {
    if (quickOrderPopupOpen || cartModalOpen || whatsAppModalOpen || adminModalOpen || confirmedInlineOrder) {
      return;
    }
    const popupTimer = setTimeout(() => {
      setQuickOrderPopupOpen(true);
    }, 35000);
    return () => clearTimeout(popupTimer);
  }, [quickOrderPopupOpen, cartModalOpen, whatsAppModalOpen, adminModalOpen, confirmedInlineOrder]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRODUCT_KEY, JSON.stringify(product));
    } catch {
      // ignore
    }
  }, [product]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 110;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Cart & Buy Actions
  const trackPixelEvent = (eventName: string, params?: Record<string, unknown>) => {
    const win = window as unknown as { fbq?: (...args: unknown[]) => void };
    if (typeof win.fbq === 'function') {
      win.fbq('track', eventName, params);
    }
  };

  const handleAddToCart = (qty = quantity) => {
    setCart([{ product, quantity: qty }]);
    trackPixelEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: calculateProgressivePricing(product.currentPrice, qty).finalTotal,
      currency: 'NGN',
    });
    showToast(`Added ${qty} × ${product.name} to your bag`);
  };

  const handleBuyNow = (qty = quantity) => {
    setQuantity(qty);
    trackPixelEvent('InitiateCheckout', {
      content_name: product.name,
      content_ids: [product.id],
      num_items: qty,
      value: calculateProgressivePricing(product.currentPrice, qty).finalTotal,
      currency: 'NGN',
    });
    setQuickOrderPopupOpen(true);
  };

  const handleUpdateCartQuantity = (_productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart([]);
      return;
    }
    setQuantity(newQty);
    setCart([{ product, quantity: newQty }]);
  };

  const handleRemoveFromCart = () => {
    setCart([]);
  };

  const handleOrderComplete = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setHasSubmittedForm(true);
    try {
      localStorage.setItem('goodluxe_has_submitted_form', 'true');
    } catch {
      // ignore
    }
    trackPixelEvent('Purchase', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: newOrder.totalAmount,
      currency: 'NGN',
    });
    showToast(`Order ${newOrder.orderId} confirmed! Free nationwide dispatch initiated.`);
  };

  const handleInlineOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Phone Number & Delivery Detail Validation
    const validation = validateOrderForm({
      fullName,
      phone,
      whatsapp,
      address,
      state,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormError(
        validation.errors.phone ||
        validation.errors.fullName ||
        validation.errors.address ||
        validation.errors.state ||
        'Please correct the highlighted fields before submitting.'
      );
      return;
    }

    setFieldErrors({});
    setFormError('');
    setIsSubmittingOrder(true);

    const calc = calculateProgressivePricing(product.currentPrice, quantity);
    const generatedId = `GLX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: OrderRecord = {
      orderId: generatedId,
      createdAt: new Date().toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      customerName: fullName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      address: address.trim(),
      state,
      notes: notes.trim(),
      paymentMethod: 'Pay on Delivery',
      items: [{ product, quantity }],
      totalAmount: calc.finalTotal,
    };

    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `New GOODLUXE Order ${generatedId} — ${newOrder.customerName} (${newOrder.state})`,
          orderId: generatedId,
          productName: product.name,
          quantity,
          progressiveDiscount: formatNaira(calc.progressiveDiscount),
          totalPayable: formatNaira(calc.finalTotal),
          paymentMethod: 'Pay on Delivery',
          fullName: newOrder.customerName,
          phone: newOrder.phone,
          whatsapp: newOrder.whatsapp,
          state: newOrder.state,
          deliveryAddress: newOrder.address,
          orderNotes: newOrder.notes || 'None',
        }),
      });
    } catch {
      // Proceed to confirmation screen even if network fails
    } finally {
      setIsSubmittingOrder(false);
    }

    setConfirmedInlineOrder(newOrder);
    handleOrderComplete(newOrder);
  };

  const getOrderWhatsAppUrl = (order: OrderRecord) => {
    const text = `Hello GOODLUXE, I just placed Order *${order.orderId}*.\n\n*Product:* ${
      product.name
    }\n*Quantity:* ${quantity}\n*Total:* ${formatNaira(
      order.totalAmount
    )}\n*Payment Mode:* Pay on Delivery\n*Customer:* ${order.customerName}\n*Phone:* ${
      order.phone
    }\n*Delivery Address:* ${order.address}, ${order.state} State\n${
      order.notes ? `*Notes:* ${order.notes}` : ''
    }\n\nPlease confirm my delivery schedule.`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  };

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : SINGLE_PRODUCT.images;

  useEffect(() => {
    if (isSlideshowPaused || galleryImages.length <= 1) return;
    const timer = setInterval(() => {
      setSelectedImageIdx((prev) => (prev + 1) % galleryImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isSlideshowPaused, galleryImages.length]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pricing = calculateProgressivePricing(product.currentPrice, quantity);
  const totalPrice = pricing.finalTotal;
  const totalOriginalPrice = pricing.normalTotal;
  const totalSavings = pricing.progressiveDiscount;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0A1C36] pb-20 md:pb-0 selection:bg-[#E51A24] selection:text-white">
      {/* 1. STICKY TOP CONTAINER: STICKY PROMOTIONAL BAR AT VERY TOP + NAVIGATION HEADER */}
      <div className="sticky top-0 z-50 w-full shadow-sm">
        {/* Sticky Promotional Bar at the Very Top */}
        <StickyPromoBar
          secondsLeft={secondsLeft}
          onOrderNowClick={() => handleBuyNow(quantity)}
          onShowToast={showToast}
        />

        {/* 2. COMPACT STICKY NAVIGATION / HEADER (Immediately below promotional bar) */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Product/store logo or icon + Text: "2-BURNER \n SMART TIMER \n GAS COOKER" */}
            <a
              href="#product-top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer shrink-0"
              aria-label="2-BURNER SMART TIMER GAS COOKER"
            >
              {/* Product/store logo or icon */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#0B2545] to-[#123663] text-white flex items-center justify-center shadow-xs border border-[#0070BA]/40 shrink-0 group-hover:scale-105 transition-transform">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE500] fill-[#FFE500]" />
              </div>

              {/* Text:
                  "2-BURNER
                   SMART TIMER
                   GAS COOKER" */}
              <div className="flex flex-col leading-none">
                <span className="font-black text-[9.5px] sm:text-[11px] tracking-wider text-[#0B2545] uppercase">
                  2-BURNER
                </span>
                <span className="font-black text-[11px] sm:text-[13px] tracking-wide text-[#E51A24] uppercase my-0.5">
                  SMART TIMER
                </span>
                <span className="font-black text-[8.5px] sm:text-[10px] tracking-wider text-slate-700 uppercase">
                  GAS COOKER
                </span>
              </div>
            </a>

            {/* Center / Right: Bright Blue "ORDER NOW" button + FAQ + Support */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* FAQ */}
              <button
                type="button"
                onClick={() => scrollToSection('faq-section')}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700 hover:text-[#0070BA] hover:bg-slate-100 transition-colors py-1 px-1.5 sm:px-2 rounded cursor-pointer whitespace-nowrap"
                aria-label="Jump to FAQ section"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#0070BA] shrink-0" />
                <span className="hidden xs:inline">FAQ</span>
              </button>

              {/* Support */}
              <button
                type="button"
                onClick={() => scrollToSection('support-section')}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-700 hover:text-[#0070BA] hover:bg-slate-100 transition-colors py-1 px-1.5 sm:px-2 rounded cursor-pointer whitespace-nowrap"
                aria-label="Jump to Customer Support section"
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden xs:inline">Support</span>
              </button>

              {/* Bright blue "ORDER NOW" button */}
              <button
                type="button"
                onClick={() => handleBuyNow(quantity)}
                className="inline-flex items-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-3 sm:px-4.5 rounded-lg bg-[#0070BA] hover:bg-[#005a96] text-white text-[11px] sm:text-xs font-black uppercase tracking-wide shadow-md shadow-blue-500/25 border-2 border-sky-300 transition-all cursor-pointer whitespace-nowrap active:scale-95 animate-action-blink"
              >
                <Zap className="w-3.5 h-3.5 text-[#FFE500] fill-[#FFE500] shrink-0" />
                <span>ORDER NOW</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      <main className="flex-1 w-full max-w-full overflow-hidden pb-20 md:pb-0">
        {/* 3. ABOVE-THE-FOLD SINGLE PRODUCT PURCHASE MODULE (Flyer Color Scheme) */}
        <section id="product-top" className="scroll-mt-36 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-start">
            {/* Left Column: Sticky 5-Image Product Slideshow (7 cols) */}
            <div
              className="lg:col-span-7 lg:sticky lg:top-36 space-y-3 sm:space-y-4"
              onMouseEnter={() => setIsSlideshowPaused(true)}
              onMouseLeave={() => setIsSlideshowPaused(false)}
            >
              {/* Main Prominent Product Image Stage */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-square sm:aspect-4/3 md:aspect-square w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-xl select-none"
              >
                {/* Sliding Track - crisp white inner stage for maximum product clarity */}
                <div
                  className="flex w-full h-full transition-transform duration-500 ease-out bg-white"
                  style={{ transform: `translateX(-${selectedImageIdx * 100}%)` }}
                >
                  {galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 p-2 sm:p-4 flex items-center justify-center">
                      <ProductVisual
                        visualType={product.visualType}
                        customImageUrl={imgUrl}
                        alt={`${product.name} - View ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>

                {/* Mobile & Desktop Prominent Promo Tag */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col items-start shadow-xl z-10">
                  <span className="bg-[#E51A24] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 sm:px-3.5 py-1 rounded-t border-t border-x border-[#FFE500]/40">
                    ★ BESTSELLER • 50% OFF
                  </span>
                  <span className="bg-[#FFE500] text-[#0B2545] text-[10px] sm:text-[11px] font-mono-num font-black px-2.5 sm:px-3.5 py-0.5 rounded-b shadow-sm">
                    SAVE {formatNaira(totalSavings)} ({quantity} {quantity === 1 ? 'UNIT' : 'UNITS'})
                  </span>
                </div>

                {/* Slide Counter */}
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#0B2545]/90 backdrop-blur-xs text-[#FFE500] text-[11px] sm:text-xs font-mono-num font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded border border-[#0B2545] z-10">
                  {selectedImageIdx + 1} / {galleryImages.length}
                </span>

                {/* Pay on Delivery trust pill on product image */}
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-[#071A2F]/90 backdrop-blur-xs text-white text-[9.5px] sm:text-[11px] font-extrabold px-2.5 sm:px-3 py-1 rounded-full border border-blue-400/30 flex items-center gap-1.5 shadow-md z-10">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span>PAY ON DELIVERY NATIONWIDE</span>
                </div>

                {/* Prev / Next Image Controls */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIdx((prev) =>
                      prev === 0 ? galleryImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-300 flex items-center justify-center text-[#0B2545] shadow-lg hover:bg-[#E51A24] hover:text-white hover:border-[#E51A24] transition-colors cursor-pointer z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIdx((prev) =>
                      prev === galleryImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 border border-slate-300 flex items-center justify-center text-[#0B2545] shadow-lg hover:bg-[#E51A24] hover:text-white hover:border-[#E51A24] transition-colors cursor-pointer z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slideshow Dots Indicator */}
                <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-1.5 sm:gap-2 bg-slate-900/80 backdrop-blur-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-slate-700 z-10">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                        selectedImageIdx === idx
                          ? 'w-4 sm:w-6 bg-[#FFE500]'
                          : 'w-1.5 sm:w-2 bg-slate-400 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 5-Thumbnail Strip */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
                {galleryImages.map((imgUrl, idx) => {
                  const isActive = selectedImageIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white p-0.5 sm:p-1 ${
                        isActive
                          ? 'border-[#E51A24] ring-2 ring-[#0070BA]'
                          : 'border-slate-200 opacity-80 hover:opacity-100 hover:border-[#0070BA]'
                      }`}
                    >
                      <div className="aspect-square w-full">
                        <ProductVisual
                          visualType={product.visualType}
                          customImageUrl={imgUrl}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: High-Converting Purchase Box (Flyer Styling) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                {/* Flyer Ribbon Header: PREMIUM SPECIFICATION + Stock Tag */}
                <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span className="bg-[#E51A24] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded shadow-sm">
                    PREMIUM SPECIFICATION
                  </span>
                  <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {product.stockStatus} ({product.stockCount} Available Today)
                  </span>
                </div>

                {/* Flyer Deep Royal Navy Product Title Block */}
                <div className="rounded-2xl bg-[#0B2545] text-white p-5 sm:p-6 shadow-xl border-t-4 border-[#E51A24]">
                  <p className="text-[10px] uppercase tracking-widest font-extrabold text-blue-200 mb-1">
                    GOODLUXE LUXURY COLLECTION
                  </p>
                  <h1
                    className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white tracking-tight leading-snug"
                    style={{ textWrap: 'balance' }}
                  >
                    <span className="block text-white">2-BURNER</span>
                    <span className="block text-[#FFE500]">SMART TIMER</span>
                    <span className="block text-slate-100">GAS COOKER</span>
                  </h1>

                  {/* Flyer Sky-Blue Ribbon Strip: STYLE | DURABILITY | FUNCTIONALITY */}
                  <div className="mt-3.5 inline-flex items-center gap-2 bg-[#0070BA] text-white text-[11px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full shadow-inner">
                    <span>STYLE</span>
                    <span className="text-blue-200 font-normal">|</span>
                    <span>DURABILITY</span>
                    <span className="text-blue-200 font-normal">|</span>
                    <span>FUNCTIONALITY</span>
                  </div>
                </div>

                {/* Modern Punchy Slogan */}
                <p className="text-xl sm:text-2xl text-[#0B2545] font-extrabold uppercase tracking-wide mt-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E51A24] shrink-0"></span>
                  <span>Upgrade Your Kitchen Experience</span>
                </p>

                {/* Rating & Verified Reviews */}
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <div className="flex items-center gap-0.5 text-[#FFD700]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFD700]" />
                    ))}
                  </div>
                  <span className="font-bold font-mono-num text-[#0B2545]">
                    {product.rating.toFixed(1)}
                  </span>
                  <span aria-hidden="true" className="text-slate-400">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollToSection('customer-reviews')}
                    className="text-[#0070BA] hover:text-[#0B2545] underline font-semibold cursor-pointer"
                  >
                    {product.reviewCount} Verified Nigerian Reviews
                  </button>
                </div>
              </div>

              {/* GOODLUXE Flyer Promo Price Box (Exact Flyer Hierarchy) */}
              <div className="rounded-2xl overflow-hidden border-2 border-[#0B2545] shadow-xl bg-white">
                {/* Red Curved Promo Ribbon */}
                <div className="bg-[#E51A24] text-white px-5 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                    ★ PROMO PRICE ({quantity} {quantity === 1 ? 'UNIT' : 'UNITS'})
                  </span>
                  <span className="text-xs font-mono-num font-bold bg-[#0B2545] text-[#FFE500] px-3 py-0.5 rounded-full">
                    {formatNaira(pricing.unitPrice)} / unit
                  </span>
                </div>

                {/* Deep Royal Navy Section with Giant Sunburst Yellow Price */}
                <div className="bg-[#0B2545] p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-[#FFE500] font-mono-num tracking-tight drop-shadow-md">
                      {formatNaira(totalPrice)}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#071A2F] border border-blue-900/80 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300">
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider">NORMAL PRICE:</span>
                    <span className="line-through font-mono-num text-red-300 font-bold">{formatNaira(totalOriginalPrice)}</span>
                  </div>
                </div>

                {/* Sunburst Yellow Savings Strip */}
                <div className="bg-[#FFE500] text-[#0B2545] px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-black">
                  <span className="font-mono-num tracking-tight">
                    SAVE {formatNaira(totalSavings)}{' '}
                    {pricing.discountPerUnit > 0
                      ? `(${formatNaira(pricing.discountPerUnit)} OFF EACH)`
                      : `(NORMAL: ${formatNaira(totalOriginalPrice)})`}
                  </span>
                  <span className="uppercase tracking-wide bg-[#E51A24] text-white px-2.5 py-0.5 rounded text-[11px] font-black">
                    FREE DELIVERY NATIONWIDE
                  </span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Quick Feature Highlights (Crisp White Card with Royal Blue & Red Badges) */}
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>
                    <strong className="text-[#0B2545]">Smart Control Interface:</strong> Digital Timer &amp; Full Battery Level Display
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>
                    <strong className="text-[#0B2545]">Effortless Cleaning:</strong> Single-Wipe 8mm Tempered Black Glass
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>
                    <strong className="text-[#0B2545]">Direct Blue Turbo Flame:</strong> Cooks 40% Faster &amp; Saves Cooking Gas
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>
                    <strong className="text-[#0B2545]">Dual Installation:</strong> Use Tabletop OR Built-In on Kitchen Slab
                  </span>
                </li>
              </ul>

              {/* Quantity & Progressive Discount Selector */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[#0B2545]">
                      Select Quantity (Progressive Discounts Applied)
                    </span>
                  </div>
                  <div className="inline-flex items-center border-2 border-slate-300 rounded-lg bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-mono-num font-bold text-sm text-[#0B2545]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      className="p-2.5 text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Clickable Progressive Discount Bundle Pills */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[1, 2, 3].map((tierQty) => {
                    const tierPricing = calculateProgressivePricing(product.currentPrice, tierQty);
                    const isSelected = quantity === tierQty;
                    return (
                      <button
                        key={tierQty}
                        type="button"
                        onClick={() => setQuantity(tierQty)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#E51A24] bg-red-50/70 shadow-md ring-2 ring-[#0070BA]'
                            : 'border-slate-200 bg-white hover:border-[#0070BA]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold text-[#0B2545]">
                            {tierQty} {tierQty === 1 ? 'Unit' : 'Units'}
                          </span>
                          <span className="text-[10px] font-black bg-[#FFE500] text-[#0B2545] px-1.5 py-0.5 rounded font-mono-num">
                            {tierQty === 1
                              ? 'BASE'
                              : `-${formatNaira(tierPricing.discountPerUnit)}/ea`}
                          </span>
                        </div>
                        <p className="text-xs font-black font-mono-num text-[#0B2545] mt-1">
                          {formatNaira(tierPricing.unitPrice)}/unit
                        </p>
                        <p className="text-[11px] font-semibold font-mono-num text-slate-500">
                          Total: {formatNaira(tierPricing.finalTotal)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Conversion CTA Button (Large, Readable & Finger-Friendly) */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleBuyNow(quantity)}
                  className="w-full min-h-[56px] sm:min-h-[60px] py-4 px-6 rounded-2xl bg-[#E51A24] hover:bg-[#C9121B] active:scale-[0.99] text-white text-base sm:text-lg font-black tracking-wide uppercase transition-all cursor-pointer shadow-xl shadow-red-500/25 border-2 border-[#FFE500] flex items-center justify-center gap-2.5 animate-action-blink"
                >
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFE500] fill-[#FFE500] shrink-0" />
                  <span>BUY NOW — PAY ON DELIVERY</span>
                </button>

                {/* Trust & Guarantee Banner (Call/WhatsApp hidden) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-[#0B2545]">
                    <Truck className="w-4 h-4 text-[#0070BA] shrink-0" />
                    <span>Free Nationwide Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Inspect Before Paying</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#0B2545]">
                    <PackageCheck className="w-4 h-4 text-[#E51A24] shrink-0" />
                    <span>12-Month Official Warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FLYER-STYLE DEEP NAVY TRUST & SPECIFICATIONS STRIP */}
        <section className="py-6 sm:py-10 bg-[#071A2F] text-white border-y-2 border-[#0070BA]/40 shadow-inner">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B2545]/60 border border-blue-900/40">
                <div className="w-10 h-10 rounded-full border-2 border-[#DAA520] bg-[#0A2342] flex items-center justify-center shrink-0 text-[#FFD700] shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white">
                    FREE DELIVERY
                  </h3>
                  <p className="text-[11px] font-black text-[#FFE500] uppercase">
                    NATIONWIDE
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B2545]/60 border border-blue-900/40">
                <div className="w-10 h-10 rounded-full border-2 border-[#0070BA] bg-[#0A2342] flex items-center justify-center shrink-0 text-[#00A3FF] shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white">
                    PAY ON DELIVERY
                  </h3>
                  <p className="text-[11px] text-blue-200 uppercase font-bold">INSPECT FIRST</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B2545]/60 border border-blue-900/40">
                <div className="w-10 h-10 rounded-full border-2 border-[#DAA520] bg-[#0A2342] flex items-center justify-center shrink-0 text-[#FFD700] shadow-sm">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white">
                    100% ORIGINAL
                  </h3>
                  <p className="text-[11px] text-[#FFD700] uppercase font-bold">PREMIUM QUALITY</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0B2545]/60 border border-blue-900/40">
                <div className="w-10 h-10 rounded-full border-2 border-[#0070BA] bg-[#0A2342] flex items-center justify-center shrink-0 text-[#00A3FF] shadow-sm">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white">
                    1-YEAR WARRANTY
                  </h3>
                  <p className="text-[11px] text-slate-300 uppercase font-medium">FULL REPLACEMENT</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. VISUAL FEATURE BREAKDOWN (With Flyer Color-Coded Feature Bottom Bars) */}
        <section id="visual-features" className="scroll-mt-36 py-8 sm:py-16 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 bg-[#F8FAFC]">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="inline-block bg-[#E51A24] text-white text-[11px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded mb-2.5 shadow-md border border-[#FFE500]/30">
              UPGRADE YOUR KITCHEN EXPERIENCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B2545]">
              Every Detail Built for Speed, Safety &amp; Style
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5">
              Style • Durability • Functionality engineered for everyday Nigerian cooking
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
            {[
              {
                img: '/images/products/Hbe3f00ba76fa4641848c12908d0d7637q.jpg',
                title: 'BLUE TURBO FLAME',
                sub: 'Fast & Gas-Saving Heat',
                color: 'bg-[#0070BA]',
              },
              {
                img: '/images/products/H3dea04852f6f4c86947bc7f3919842b95.jpg',
                title: '99-MIN SMART TIMER',
                sub: 'Auto Timing & Battery Readout',
                color: 'bg-[#00A859]',
              },
              {
                img: '/images/products/H545e918a51a743ec84d9826c6a7387dfU.png',
                title: 'SMART INTERFACE',
                sub: 'Precise Digital Power Levels',
                color: 'bg-[#7D2181]',
              },
              {
                img: '/images/products/H2322db9fd53f4a01bd3216213a472dcfN.png',
                title: 'EFFORTLESS CLEANING',
                sub: 'Single-Wipe Tempered Glass',
                color: 'bg-[#F37021]',
              },
              {
                img: '/images/products/Hf86fe9d05ba94278b5abeb9daad2744dv.jpg',
                title: 'DETACHABLE BURNER',
                sub: 'Heavy-Duty & Easy Maintenance',
                color: 'bg-[#E51A24]',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedImageIdx(idx);
                  scrollToSection('product-top');
                }}
                className="group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md hover:border-[#0070BA] hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="aspect-square w-full bg-white p-3 overflow-hidden">
                  <img
                    src={feat.img}
                    alt={feat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className={`${feat.color} text-white px-3.5 py-3 text-center shadow-inner`}>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] text-white/90 font-bold mt-0.5">{feat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. COMPACT CARD ACCORDION SECTIONS (Mobile Optimized & Scannable) */}
        <section id="product-specs" className="scroll-mt-36 py-8 sm:py-16 bg-[#F1F5F9] border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-3.5">
            <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
              <span className="inline-block bg-[#0070BA] text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1.5 shadow-xs">
                PRODUCT SPECIFICATION &amp; DETAILS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
                Everything You Need to Know
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Tap each card below to explore features, technical specs, box contents, and delivery guarantee.
              </p>
            </div>

            {/* Accordion Card 1: Why You'll Love It */}
            <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordionCard('love')}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                aria-expanded={openAccordionCards.love}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0070BA] shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#0070BA]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0B2545] leading-snug">
                      Why You&apos;ll Love It
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {product.whyYouLoveIt.length} Premium Features &amp; Performance Highlights
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {openAccordionCards.love ? 'Collapse' : 'Expand'}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#0070BA] transition-transform duration-200 shrink-0 ${
                      openAccordionCards.love ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {openAccordionCards.love && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-100">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-2">
                    {product.whyYouLoveIt.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs sm:text-sm text-slate-700"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Check className="w-3 h-3" />
                        </span>
                        <span className="leading-snug">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion Card 2: Technical Specifications */}
            <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordionCard('specs')}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                aria-expanded={openAccordionCards.specs}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#DAA520] shrink-0">
                    <SlidersHorizontal className="w-5 h-5 text-[#0B2545]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0B2545] leading-snug">
                      Technical Specifications
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Dimensions, Dual-Burner Power, Heavy Cast Iron, Safety
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {openAccordionCards.specs ? 'Collapse' : 'Expand'}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#0070BA] transition-transform duration-200 shrink-0 ${
                      openAccordionCards.specs ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {openAccordionCards.specs && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-100">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 divide-y sm:divide-y-0 divide-slate-100 text-xs sm:text-sm mt-2">
                    {product.productDetails.map((spec, idx) => (
                      <div key={idx} className="py-2 sm:py-2.5 sm:px-3 sm:rounded-lg sm:bg-slate-50/70 sm:border sm:border-slate-200/60 flex items-center justify-between gap-3">
                        <dt className="text-slate-500 font-medium">{spec.label}</dt>
                        <dd className="text-[#0B2545] font-extrabold text-right">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* Accordion Card 3: What's Included in the Box */}
            <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordionCard('included')}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                aria-expanded={openAccordionCards.included}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-center text-purple-700 shrink-0">
                    <PackageCheck className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0B2545] leading-snug">
                      What&apos;s Included in the Box
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Complete Ready-to-Install Cooktop &amp; Accessories
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {openAccordionCards.included ? 'Collapse' : 'Expand'}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#0070BA] transition-transform duration-200 shrink-0 ${
                      openAccordionCards.included ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {openAccordionCards.included && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-2">
                    {product.whatsIncluded.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800"
                      >
                        <Check className="w-4 h-4 text-[#0070BA] shrink-0" />
                        <span className="font-bold">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Card 4: Delivery & Payment Guarantee */}
            <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => toggleAccordionCard('delivery')}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                aria-expanded={openAccordionCards.delivery}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#059669] shrink-0">
                    <Truck className="w-5 h-5 text-[#059669]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0B2545] leading-snug">
                      Delivery &amp; Payment Guarantee
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Zero Upfront Payment • Inspect Before Paying • 24-48hr Dispatch
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {openAccordionCards.delivery ? 'Collapse' : 'Expand'}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#0070BA] transition-transform duration-200 shrink-0 ${
                      openAccordionCards.delivery ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {openAccordionCards.delivery && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-100 space-y-3 mt-2">
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0B2545] flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-[#0070BA]" />
                      <span>Free Nationwide Shipping</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{product.deliveryInfo}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0B2545] flex items-center gap-2 mb-1">
                      <Banknote className="w-4 h-4 text-[#059669]" />
                      <span>Pay on Delivery Terms</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{product.paymentInfo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 7. EMBEDDED QUICK ORDER / CHECKOUT SECTION (Flyer Style: Deep Royal Navy + Crimson Red + Crisp White) */}
        <section id="quick-order-section" className="scroll-mt-36 py-8 sm:py-16 max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border-2 border-[#0B2545] shadow-2xl overflow-hidden">
            {/* Order Header */}
            <div className="bg-[#0B2545] text-white px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-[#E51A24]">
              <div>
                <span className="inline-block bg-[#E51A24] text-white text-[11px] sm:text-xs uppercase tracking-widest font-black px-3 py-0.5 rounded shadow-sm">
                  PAY ON DELIVERY CHECKOUT
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mt-1 text-white">
                  Fill In Your Delivery Details Below
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-[#FFE500] font-black uppercase">
                  Free Nationwide Delivery
                </p>
                <p className="text-xl sm:text-3xl font-black font-mono-num text-[#FFE500]">
                  {formatNaira(totalPrice)}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-8 text-slate-900">
              {confirmedInlineOrder ? (
                <div className="space-y-6 py-4">
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <p className="text-xs uppercase tracking-widest font-extrabold text-emerald-800">
                      Order Confirmed
                    </p>
                    <h3 className="text-2xl font-display font-bold text-[#0B2545]">
                      Thank you, {confirmedInlineOrder.customerName}!
                    </h3>
                    <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-emerald-300 text-sm font-mono-num font-bold text-[#0B2545]">
                      <span>Order ID: {confirmedInlineOrder.orderId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(confirmedInlineOrder.orderId);
                          setCopiedOrderId(true);
                          setTimeout(() => setCopiedOrderId(false), 2000);
                        }}
                        className="text-[#0070BA] hover:text-[#0B2545] cursor-pointer"
                      >
                        {copiedOrderId ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Product</span>
                      <span className="font-bold text-[#0B2545]">
                        {quantity} × {product.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Mode</span>
                      <span className="font-bold text-emerald-700">Pay on Delivery</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Address</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {confirmedInlineOrder.address}, {confirmedInlineOrder.state} State
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="font-semibold text-slate-800">Total Payable on Delivery</span>
                      <span className="text-xl font-black font-mono-num text-[#0B2545]">
                        {formatNaira(confirmedInlineOrder.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#0B2545] font-medium text-center space-y-1">
                      <p className="font-bold text-[#0070BA]">
                        📦 Dispatch Logistics Notice
                      </p>
                      <p>
                        Our delivery rider will call your phone (<strong className="font-mono-num font-bold text-slate-900">{confirmedInlineOrder.phone}</strong>) prior to arrival. Please keep your line reachable!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmedInlineOrder(null)}
                      className="py-3.5 px-6 rounded-xl bg-[#071A2F] text-white text-xs font-black uppercase tracking-wider hover:bg-[#0B2545] transition-colors cursor-pointer shadow-md self-center"
                    >
                      Place Another Order
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  action={FORMSPREE_ENDPOINT}
                  method="POST"
                  onSubmit={handleInlineOrderSubmit}
                  className="space-y-3.5"
                >
                  <input type="hidden" name="productName" value={product.name} />
                  <input type="hidden" name="quantity" value={quantity} />
                  <input type="hidden" name="totalPayable" value={formatNaira(totalPrice)} />
                  <input type="hidden" name="paymentMethod" value="Pay on Delivery" />

                  {/* BIGGER UNIT & QUANTITY SELECTION SECTION IN THE FORM */}
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/50 border-2 border-[#0B2545]/20 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-300 p-1 shrink-0 shadow-xs"
                        />
                        <div>
                          <span className="inline-block bg-[#0B2545] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                            Step 1: Choose Units
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-[#0B2545] mt-0.5">
                            {product.name}
                          </h3>
                        </div>
                      </div>

                      {/* Large Stepper */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs font-bold text-slate-600 hidden sm:inline">Units:</span>
                        <div className="inline-flex items-center border-2 border-[#0B2545] rounded-xl bg-white shadow-sm overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-mono-num font-black text-lg text-[#0B2545]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-lg sm:text-xl font-black font-mono-num text-[#E51A24]">
                          {formatNaira(totalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Big 3-Column Unit Cards */}
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wide text-[#0B2545] mb-2 flex items-center justify-between">
                        <span>Select Number of Units (Discounts Applied):</span>
                        {quantity > 1 && (
                          <span className="text-xs text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded">
                            Saving ₦{((product.currentPrice * quantity) - totalPrice).toLocaleString()}!
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[1, 2, 3].map((tierQty) => {
                          const tierPricing = calculateProgressivePricing(product.currentPrice, tierQty);
                          const isSelected = quantity === tierQty;
                          return (
                            <button
                              key={tierQty}
                              type="button"
                              onClick={() => setQuantity(tierQty)}
                              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'border-[#E51A24] bg-white shadow-md ring-2 ring-[#0070BA]'
                                  : 'border-slate-300 bg-white hover:border-[#0070BA] hover:shadow-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-sm font-black text-[#0B2545]">
                                  {tierQty} {tierQty === 1 ? 'Unit' : 'Units'}
                                </span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono-num ${
                                  tierQty === 1
                                    ? 'bg-slate-100 text-slate-700'
                                    : 'bg-[#FFE500] text-[#0B2545]'
                                }`}>
                                  {tierQty === 1 ? 'STANDARD' : tierQty === 2 ? 'SAVE ₦10,000' : 'SAVE ₦30,000'}
                                </span>
                              </div>
                              <p className="text-base sm:text-lg font-black font-mono-num text-[#E51A24] mt-1">
                                {formatNaira(tierPricing.finalTotal)}
                              </p>
                              <p className="text-xs font-semibold text-slate-500 font-mono-num">
                                {formatNaira(tierPricing.unitPrice)} per unit
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-300 text-xs text-red-800 font-bold flex items-start gap-2 shadow-xs">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Payment Mode — Pay on Delivery Only (Compact) */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#0B2545]/40 bg-blue-50/40">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="inlinePayment"
                        checked
                        readOnly
                        className="accent-[#0B2545] w-3.5 h-3.5"
                      />
                      <div>
                        <span className="text-xs sm:text-sm font-extrabold text-[#0B2545]">
                          Pay on Delivery (Inspect package upon arrival before paying)
                        </span>
                      </div>
                    </div>
                    <Banknote className="w-4 h-4 text-[#00A859] shrink-0" />
                  </div>

                  {/* Customer Delivery Details (Moderate, Comfortable Input Boxes) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name (First &amp; Last Name) *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: undefined }));
                        }}
                        placeholder="e.g. Emmanuel Collins"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none transition-colors ${
                          fieldErrors.fullName
                            ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                            : 'border-slate-300 bg-[#F8FAFC] focus:border-[#0070BA]'
                        }`}
                      />
                      {fieldErrors.fullName && (
                        <p className="mt-1 text-xs text-red-600 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number (11 Digits) *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
                        }}
                        placeholder="e.g. 0803 123 4567"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none transition-colors ${
                          fieldErrors.phone
                            ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                            : 'border-slate-300 bg-[#F8FAFC] focus:border-[#0070BA]'
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1 text-xs text-red-600 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State *
                      </label>
                      <select
                        name="state"
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);
                          if (fieldErrors.state) setFieldErrors((p) => ({ ...p, state: undefined }));
                        }}
                        className={`w-full px-3 py-2.5 rounded-lg border text-slate-900 text-sm focus:outline-none ${
                          fieldErrors.state
                            ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                            : 'border-slate-300 bg-[#F8FAFC] focus:border-[#0070BA]'
                        }`}
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.state && (
                        <p className="mt-1 text-xs text-red-600 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.state}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Detailed Delivery Address *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress"
                        required
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (fieldErrors.address) setFieldErrors((p) => ({ ...p, address: undefined }));
                        }}
                        placeholder="House No, Street Name, Bus-stop"
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none transition-colors ${
                          fieldErrors.address
                            ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                            : 'border-slate-300 bg-[#F8FAFC] focus:border-[#0070BA]'
                        }`}
                      />
                      {fieldErrors.address && (
                        <p className="mt-1 text-xs text-red-600 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.address}</span>
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Order Notes (Optional)
                      </label>
                      <input
                        type="text"
                        name="orderNotes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Preferred delivery day or landmark instructions..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#0070BA]"
                      />
                    </div>
                  </div>

                  {/* PLACE ORDER Action CTA with Action Blink */}
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#E51A24] hover:bg-[#C9121B] active:scale-[0.99] disabled:opacity-60 text-white text-base font-black tracking-wide uppercase transition-all cursor-pointer shadow-lg shadow-red-500/25 border-2 border-[#FFE500] flex items-center justify-center gap-2 animate-action-blink"
                  >
                    {isSubmittingOrder ? (
                      'SUBMITTING YOUR ORDER...'
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-[#FFE500] fill-[#FFE500] shrink-0" />
                        <span>PLACE ORDER — {formatNaira(totalPrice)} (PAY ON DELIVERY)</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 8. CUSTOMER REVIEWS & SOCIAL PROOF (Flyer Palette: Clean White + Royal Navy + Gold Stars) */}
        <section
          id="customer-reviews"
          className="scroll-mt-36 py-14 sm:py-20 bg-[#F8FAFC] border-t border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            {/* Testimonials */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="inline-block bg-[#FFE500] text-[#0B2545] text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded mb-2 shadow-sm">
                  4.9/5 CUSTOMER RATING ★★★★★
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0B2545]">
                  What Our Customers Say
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1.5">
                  Verified reviews from Nigerian families who upgraded their kitchen with GOODLUXE.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {TESTIMONIALS.map((review) => (
                  <article
                    key={review.id}
                    className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-4 shadow-sm hover:border-[#0070BA] transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-0.5 text-[#FFD700]">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FFD700]" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        &ldquo;{review.quote}&rdquo;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-sm font-bold text-[#0B2545]">{review.name}</p>
                      <p className="text-xs text-[#0070BA] font-semibold">
                        {review.role} · {review.location}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 9. FAQ SECTION (Clean White Accordion + Royal Navy Headings) */}
        <section id="faq-section" className="scroll-mt-36 py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0B2545]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1.5">
              Everything you need to know about our Free Nationwide Delivery &amp; Pay on Delivery.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-md">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="p-5 sm:p-6">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[#0B2545]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#0070BA] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 10. FLYER-INSPIRED DEEP ROYAL NAVY & CRIMSON RED FOOTER */}
      <footer className="bg-[#071A2F] text-slate-300 pt-14 border-t-2 border-[#0070BA]/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 100% Pay on Delivery Nationwide Banner */}
          <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#0B2545] border border-[#0070BA]/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4 bg-[#071A2F] border border-[#0070BA]/60 text-white px-6 py-4 rounded-2xl shadow-xl">
              <div className="w-12 h-12 rounded-full bg-[#0070BA] flex items-center justify-center shrink-0 shadow-md text-[#FFE500]">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#FFE500]">
                  100% RISK-FREE SHOPPING
                </p>
                <p className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Pay on Delivery Nationwide
                </p>
              </div>
            </div>

            <div className="text-center md:text-right space-y-2">
              <button
                type="button"
                onClick={() => handleBuyNow(quantity)}
                className="inline-block bg-[#E51A24] hover:bg-[#C9121B] text-white font-black text-lg sm:text-xl px-8 py-3.5 rounded-xl shadow-xl shadow-red-500/25 cursor-pointer transition-colors border-2 border-[#FFE500] animate-action-blink"
              >
                Get Yours Today!
              </button>
              <p className="text-xs font-bold tracking-[0.25em] text-[#FFE500] uppercase">
                STYLE • DURABILITY • FUNCTIONALITY
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-blue-900/40">
            <div className="space-y-3">
              <span className="text-2xl font-extrabold tracking-wider text-white">
                GOODLU<span className="text-[#E51A24]">X</span>E
              </span>
              <p className="text-xs font-bold tracking-[0.2em] text-blue-200 uppercase">
                — BATHROOMS &amp; KITCHENS —
              </p>
              <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
                Premium Living, Everyday. Free Nationwide Delivery &amp; Pay on Delivery across
                Nigeria.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg border border-blue-800 text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 bg-[#0A2342]"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFE500]" />
                  <span>Edit Product</span>
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#FFE500] mb-4">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('product-top')}
                    className="hover:text-white cursor-pointer"
                  >
                    Product Overview
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('features-section')}
                    className="hover:text-white cursor-pointer"
                  >
                    Features &amp; Gallery
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('order-form-section')}
                    className="hover:text-white cursor-pointer"
                  >
                    Place Order (Pay on Delivery)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('customer-reviews')}
                    className="hover:text-white cursor-pointer"
                  >
                    Reviews
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('faq-section')}
                    className="hover:text-white cursor-pointer"
                  >
                    FAQs
                  </button>
                </li>
              </ul>
            </div>

            <div id="support-section" className="scroll-mt-28">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#FFE500] mb-4">
                Customer Support
              </h4>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FFE500] shrink-0" />
                  <span className="truncate">goodluxebathrooms@gmail.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                  <span>Nationwide Express Delivery to all 36 States + FCT Abuja</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>100% Pay on Delivery Guarantee — Inspect Before Paying</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 GOODLUXE. All Rights Reserved.</p>
            <p className="text-[#FFE500] font-bold">
              FREE DELIVERY NATIONWIDE • PAY ON DELIVERY AVAILABLE
            </p>
          </div>
        </div>

        {/* FLYER BLUE & GOLD BOTTOM STRIP */}
        <div className="w-full bg-gradient-to-r from-[#071A2F] via-[#0070BA] to-[#071A2F] text-white font-black uppercase tracking-wider text-xs sm:text-sm py-3 text-center shadow-lg">
          QUALITY KITCHEN &amp; BATHROOM SOLUTIONS FOR A BETTER HOME
        </div>
      </footer>

      {/* STICKY MOBILE BOTTOM BUY BAR - ALWAYS VISIBLE, HIGHLY READABLE BLINKING CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/98 backdrop-blur-md border-t-2 border-[#0B2545] px-3.5 py-2.5 flex items-center gap-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.18)]">
        <div className="shrink-0 flex flex-col justify-center min-w-[90px]">
          <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-fit">
            PAY ON DELIVERY
          </span>
          <span className="text-base sm:text-lg font-black font-mono-num text-[#0B2545] leading-tight">
            {formatNaira(totalPrice)}
          </span>
        </div>

        {/* Large readable primary CTA with Blinking Animation */}
        <button
          type="button"
          onClick={() => handleBuyNow(quantity)}
          className="flex-1 min-h-[48px] py-3 px-3 rounded-xl bg-[#E51A24] active:scale-[0.98] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl shadow-red-500/30 border-2 border-[#FFE500] flex items-center justify-center gap-1.5 transition-transform cursor-pointer animate-action-blink"
        >
          <Zap className="w-4 h-4 text-[#FFE500] fill-[#FFE500] shrink-0" />
          <span className="truncate">ORDER NOW (PAY ON DELIVERY)</span>
        </button>
      </div>

      {/* FLOATING SOCIAL PROOF ORDER NOTIFICATION (Unobtrusive & Non-blocking) */}
      <FloatingOrderNotification
        isModalOpen={quickOrderPopupOpen || cartModalOpen || whatsAppModalOpen || adminModalOpen}
        productImage={galleryImages[0]}
        productName={product.name}
      />

      {/* FLOATING QUICK ORDER BUTTON (Call and WhatsApp hidden) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3">
        <button
          type="button"
          onClick={() => handleBuyNow(quantity)}
          className="flex items-center gap-2 py-3 px-5 rounded-full bg-[#E51A24] hover:bg-[#C9121B] text-white shadow-2xl transition-transform duration-200 hover:scale-105 cursor-pointer border-2 border-[#FFE500] animate-action-blink"
          aria-label="Open Quick Order Popup"
        >
          <Zap className="w-4 h-4 text-[#FFE500] fill-[#FFE500]" />
          <span className="text-xs font-black tracking-wide uppercase">Quick Order Form</span>
        </button>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0B2545] text-white px-5 py-3 rounded-xl shadow-2xl border-2 border-[#E51A24] flex items-center gap-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4 text-[#FFE500] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* QUICK ORDER POPUP MODAL */}
      <QuickOrderPopupModal
        isOpen={quickOrderPopupOpen}
        product={product}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onClose={() => setQuickOrderPopupOpen(false)}
        onOrderComplete={handleOrderComplete}
      />

      {/* CART & CHECKOUT DRAWER */}
      <CartCheckoutModal
        isOpen={cartModalOpen}
        initialMode={cartModalMode}
        cart={cart}
        onClose={() => setCartModalOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOrderComplete={handleOrderComplete}
      />

      {/* ADMIN EDIT PRODUCT MODAL */}
      <AdminProductModal
        isOpen={adminModalOpen}
        products={[product]}
        onClose={() => setAdminModalOpen(false)}
        onSaveProduct={(updated) => {
          setProduct(updated);
          showToast('Product details updated');
        }}
        onDeleteProduct={() => {}}
        onResetCatalog={() => {
          setProduct(SINGLE_PRODUCT);
          showToast('Product restored to default settings');
        }}
      />
    </div>
  );
}
