/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Menu,
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
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { AdminProductModal } from './components/AdminProductModal';
import { QuickOrderPopupModal } from './components/QuickOrderPopupModal';

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
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [confirmedInlineOrder, setConfirmedInlineOrder] = useState<OrderRecord | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // UI Modals & Menus
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartModalMode, setCartModalMode] = useState<'cart' | 'checkout'>('cart');
  const [quickOrderPopupOpen, setQuickOrderPopupOpen] = useState(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Top Promo Countdown Timer (4 hours 45 mins 00 secs)
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const savedEnd = localStorage.getItem('goodluxe_promo_timer_end');
    const now = Date.now();
    if (savedEnd) {
      const diff = Math.floor((Number(savedEnd) - now) / 1000);
      if (diff > 60) return diff;
    }
    const initialSeconds = 4 * 3600 + 47 * 60 + 52;
    localStorage.setItem('goodluxe_promo_timer_end', String(now + initialSeconds * 1000));
    return initialSeconds;
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
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const reset = 4 * 3600 + 47 * 60 + 52;
          localStorage.setItem('goodluxe_promo_timer_end', String(Date.now() + reset * 1000));
          return reset;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timerHours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const timerMinutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const timerSeconds = String(secondsLeft % 60).padStart(2, '0');

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
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError('Please enter your Full Name, Phone Number, and Delivery Address.');
      return;
    }
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
      {/* 1. TOP ANNOUNCEMENT & LIVE COUNTDOWN TIMER BAR (Deep Royal Navy + Sky Blue + Crimson Red + Promo Yellow) */}
      <div className="bg-[#071A2F] text-white text-xs py-2.5 px-4 border-b border-[#0070BA]/40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center justify-center gap-2.5 flex-wrap font-semibold tracking-wide">
            <span className="text-[#FFE500] font-extrabold flex items-center gap-1">
              <span>🚚 FREE DELIVERY NATIONWIDE</span>
            </span>
            <span aria-hidden="true" className="text-[#E51A24] font-black">
              |
            </span>
            <span className="text-slate-200">💳 PAY ON DELIVERY AVAILABLE</span>
            <span aria-hidden="true" className="hidden sm:inline text-[#E51A24] font-black">
              |
            </span>
            <span className="hidden sm:inline text-[#FFD700] font-semibold">
              ★ 100% ORIGINAL PRODUCTS
            </span>
          </div>

          {/* Top Actions: Call Direct Line + Live Promo Countdown Timer */}
          <div className="flex items-center gap-3">
            <a
              href="tel:09031585177"
              className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-[#0070BA]/30 hover:bg-[#0070BA]/50 text-white font-extrabold text-xs border border-[#0070BA]/70 shadow-xs transition-colors shrink-0"
              title="Call Customer Support"
            >
              <Phone className="w-3.5 h-3.5 text-[#FFE500]" />
              <span className="tracking-wide">Call Us</span>
            </a>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#FFE500]">
                <Clock className="w-3.5 h-3.5 text-[#E51A24]" />
                <span className="hidden sm:inline">PROMO ENDS:</span>
              </span>
              <div className="inline-flex items-center gap-1 font-mono-num font-extrabold text-xs">
                <span className="bg-[#E51A24] text-white px-2 py-0.5 rounded shadow-sm">{timerHours}h</span>
                <span className="text-[#FFE500] font-bold">:</span>
                <span className="bg-[#E51A24] text-white px-2 py-0.5 rounded shadow-sm">{timerMinutes}m</span>
                <span className="text-[#FFE500] font-bold">:</span>
                <span className="bg-[#FFE500] text-[#071A2F] px-2 py-0.5 rounded font-black shadow-sm">{timerSeconds}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STICKY HEADER (Flyer Style: Clean White Backdrop + Deep Royal Navy Wordmark with Red 'X') */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark matching Flyer (GOODLU + Red X + E with — BATHROOMS — & Tagline) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 -ml-2 text-[#0B2545] hover:text-[#0070BA] cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <a
              href="#product-top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col"
            >
              <span className="text-2xl sm:text-3xl font-extrabold tracking-wider text-[#0B2545] leading-none">
                GOODLU<span className="text-[#E51A24]">X</span>E
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.22em] text-[#0B2545] font-black mt-1">
                — BATHROOMS &amp; KITCHENS —
              </span>
              <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                PREMIUM LIVING, EVERYDAY
              </span>
            </a>
          </div>

          {/* Zone 2: Single-Product Section Jump Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => scrollToSection('product-top')}
              className="hover:text-[#0070BA] transition-colors whitespace-nowrap cursor-pointer"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('visual-features')}
              className="hover:text-[#0070BA] transition-colors whitespace-nowrap cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('product-specs')}
              className="hover:text-[#0070BA] transition-colors whitespace-nowrap cursor-pointer"
            >
              Specifications
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('quick-order-section')}
              className="hover:text-[#0070BA] transition-colors whitespace-nowrap cursor-pointer"
            >
              Pay on Delivery
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('customer-reviews')}
              className="hover:text-[#0070BA] transition-colors whitespace-nowrap cursor-pointer"
            >
              Reviews
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq-section')}
              className="hover:text-[#0070BA] transition-colors whitespace-nowrap cursor-pointer"
            >
              FAQs
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Call Icon Always on Top + Bag + Quick Order) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* CALL ICON ALWAYS VISIBLE ON TOP */}
            <a
              href="tel:09031585177"
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg border border-[#0070BA] bg-[#071A2F] hover:bg-[#0B2545] text-white text-xs font-bold transition-all shadow-sm shrink-0 hover:scale-[1.02]"
              aria-label="Call Customer Support"
              title="Call Customer Support"
            >
              <Phone className="w-4 h-4 text-[#FFE500]" />
              <span className="font-extrabold tracking-wide">Call Us</span>
            </a>

            <button
              type="button"
              onClick={() => {
                if (cart.length === 0) {
                  setCart([{ product, quantity }]);
                }
                setCartModalMode('cart');
                setCartModalOpen(true);
              }}
              className="relative inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-[#0B2545] bg-[#0B2545] text-white text-xs font-bold hover:bg-[#071A2F] transition-colors whitespace-nowrap cursor-pointer shadow-sm"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="w-4 h-4 text-[#FFE500]" />
              <span className="font-mono-num">{totalCartItems}</span>
            </button>

            <button
              type="button"
              onClick={() => handleBuyNow(quantity)}
              className="inline-flex items-center gap-1.5 py-2.5 px-3.5 sm:px-4 rounded-lg bg-[#E51A24] text-white text-xs font-extrabold hover:bg-[#C9121B] border border-[#FFE500]/40 transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-red-500/20"
            >
              <Zap className="w-3.5 h-3.5 text-[#FFE500] fill-[#FFE500]" />
              <span>QUICK ORDER</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-3 shadow-xl">
            <div className="grid grid-cols-1 gap-1 text-sm font-semibold text-slate-800">
              <button
                type="button"
                onClick={() => scrollToSection('product-top')}
                className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 hover:text-[#0070BA]"
              >
                Product Overview
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('visual-features')}
                className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 hover:text-[#0070BA]"
              >
                Key Features &amp; Gallery
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('product-specs')}
                className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 hover:text-[#0070BA]"
              >
                Product Details &amp; Box Contents
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('quick-order-section')}
                className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 hover:text-[#0070BA]"
              >
                Quick Order Form (Pay on Delivery)
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('customer-reviews')}
                className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 hover:text-[#0070BA]"
              >
                Customer Reviews (4.9/5)
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq-section')}
                className="text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 hover:text-[#0070BA]"
              >
                FAQs
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <a
                href="tel:09031585177"
                className="w-full py-3 px-4 rounded-xl bg-[#071A2F] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:bg-[#0B2545]"
              >
                <Phone className="w-4 h-4 text-[#FFE500]" />
                <span>Call Customer Care</span>
              </a>

              {/* WhatsApp Button only visible after someone fills the form */}
              {hasSubmittedForm && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setWhatsAppModalOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-[#1EBE5D]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* 3. ABOVE-THE-FOLD SINGLE PRODUCT PURCHASE MODULE (Flyer Color Scheme) */}
        <section id="product-top" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Sticky 5-Image Product Slideshow (7 cols) */}
            <div
              className="lg:col-span-7 lg:sticky lg:top-24 space-y-4"
              onMouseEnter={() => setIsSlideshowPaused(true)}
              onMouseLeave={() => setIsSlideshowPaused(false)}
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-xl">
                {/* Sliding Track - crisp white inner stage for maximum product clarity */}
                <div
                  className="flex w-full h-full transition-transform duration-500 ease-out bg-white"
                  style={{ transform: `translateX(-${selectedImageIdx * 100}%)` }}
                >
                  {galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 p-3">
                      <ProductVisual
                        visualType={product.visualType}
                        customImageUrl={imgUrl}
                        alt={`${product.name} - Slide ${idx + 1}`}
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>

                {/* GOODLUXE Red & Yellow Promo Tag matching Flyer */}
                <div className="absolute top-4 left-4 flex flex-col items-start shadow-xl">
                  <span className="bg-[#E51A24] text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-t border-t border-x border-[#FFE500]/40">
                    PROGRESSIVE DISCOUNT
                  </span>
                  <span className="bg-[#FFE500] text-[#0B2545] text-[11px] font-mono-num font-black px-3.5 py-0.5 rounded-b shadow-sm">
                    SAVE {formatNaira(totalSavings)} ({quantity} {quantity === 1 ? 'UNIT' : 'UNITS'})
                  </span>
                </div>

                {/* Slide Counter */}
                <span className="absolute top-4 right-4 bg-[#0B2545]/90 text-[#FFE500] text-xs font-mono-num font-semibold px-2.5 py-1 rounded border border-[#0B2545]">
                  {selectedImageIdx + 1} / {galleryImages.length}
                </span>

                {/* Prev / Next Image Controls */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIdx((prev) =>
                      prev === 0 ? galleryImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-300 flex items-center justify-center text-[#0B2545] shadow-lg hover:bg-[#E51A24] hover:text-white hover:border-[#E51A24] transition-colors cursor-pointer"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-slate-300 flex items-center justify-center text-[#0B2545] shadow-lg hover:bg-[#E51A24] hover:text-white hover:border-[#E51A24] transition-colors cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slideshow Dots Indicator */}
                <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-700">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        selectedImageIdx === idx
                          ? 'w-6 bg-[#FFE500]'
                          : 'w-2 bg-slate-400 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 5-Thumbnail Strip */}
              <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
                {galleryImages.map((imgUrl, idx) => {
                  const isActive = selectedImageIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white p-1 ${
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
                          className="w-full h-full"
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
                    className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-snug"
                    style={{ textWrap: 'balance' }}
                  >
                    {product.name}
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

                {/* Flyer Script Slogan */}
                <p className="font-script text-2xl sm:text-3xl text-[#0B2545] font-bold tracking-wide mt-2">
                  Upgrade Your Kitchen Experience
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

              {/* Primary Conversion CTA Buttons (Flyer Style) */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(quantity)}
                    className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl border-2 border-[#0B2545] bg-white text-sm font-bold text-[#0B2545] hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#0070BA]" />
                    <span>ADD TO CART</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBuyNow(quantity)}
                    className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#E51A24] hover:bg-[#C9121B] text-white text-sm font-black transition-colors whitespace-nowrap cursor-pointer shadow-xl shadow-red-500/20 border border-[#FFE500]/40"
                  >
                    <Zap className="w-4 h-4 text-[#FFE500] fill-[#FFE500]" />
                    <span>BUY NOW — PAY ON DELIVERY</span>
                  </button>
                </div>

                {/* Direct Call / WhatsApp Button (No visible phone number; WhatsApp only visible after form submission) */}
                {hasSubmittedForm ? (
                  <button
                    type="button"
                    onClick={() => setWhatsAppModalOpen(true)}
                    className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0B2545] hover:bg-[#071A2F] text-white shadow-xl transition-transform duration-150 hover:scale-[1.01] cursor-pointer border-2 border-[#25D366]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-md">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#FFE500] leading-none">
                          WHATSAPP ORDER SUPPORT
                        </p>
                        <p className="text-base sm:text-lg font-bold text-white leading-tight">
                          Chat With Us
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#25D366] text-white text-xs font-black uppercase px-4 py-2 rounded-xl shadow-md">
                      CHAT NOW ➔
                    </span>
                  </button>
                ) : (
                  <a
                    href="tel:09031585177"
                    className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0B2545] hover:bg-[#071A2F] text-white shadow-xl transition-transform duration-150 hover:scale-[1.01] cursor-pointer border-2 border-[#0070BA]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0070BA] flex items-center justify-center shrink-0 shadow-md">
                        <Phone className="w-5 h-5 text-[#FFE500]" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#FFE500] leading-none">
                          CUSTOMER SUPPORT
                        </p>
                        <p className="text-base sm:text-lg font-bold text-white leading-tight">
                          Click to Call Us
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#E51A24] text-white text-xs font-black uppercase px-4 py-2 rounded-xl shadow-md border border-[#FFE500]/30">
                      CALL NOW ➔
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. FLYER-STYLE DEEP NAVY TRUST & SPECIFICATIONS STRIP (Midnight Navy + Sky Blue + Gold Seal) */}
        <section className="py-10 bg-[#071A2F] text-white border-y-2 border-[#0070BA]/40 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-blue-900/40">
              <div className="flex items-center gap-4 pt-2 sm:pt-0">
                <div className="w-12 h-12 rounded-full border-2 border-[#DAA520] bg-[#0A2342] flex items-center justify-center shrink-0 text-[#FFD700] shadow-sm">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-white">
                    FREE DELIVERY
                  </h3>
                  <p className="text-xs sm:text-sm font-black text-[#FFE500] uppercase">
                    NATIONWIDE
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#0070BA] bg-[#0A2342] flex items-center justify-center shrink-0 text-[#00A3FF] shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-white">
                    PAY ON DELIVERY
                  </h3>
                  <p className="text-xs text-blue-200 uppercase font-bold">AVAILABLE NATIONWIDE</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#DAA520] bg-[#0A2342] flex items-center justify-center shrink-0 text-[#FFD700] shadow-sm">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-white">
                    100% ORIGINAL
                  </h3>
                  <p className="text-xs text-[#FFD700] uppercase font-bold">PREMIUM LIVING ★★★★★</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#0070BA] bg-[#0A2342] flex items-center justify-center shrink-0 text-[#00A3FF] shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-white">
                    12-MONTH WARRANTY
                  </h3>
                  <p className="text-xs text-slate-300 uppercase font-medium">COMPLETE SUPPORT</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. VISUAL FEATURE BREAKDOWN (With Flyer Color-Coded Feature Bottom Bars) */}
        <section id="visual-features" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block bg-[#E51A24] text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded mb-3 shadow-md border border-[#FFE500]/30">
              UPGRADE YOUR KITCHEN EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0B2545]">
              Every Detail Built for Speed, Safety &amp; Style
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Style • Durability • Functionality engineered for everyday Nigerian cooking
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
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

        {/* 6. STRUCTURED PRODUCT DESCRIPTION & SPECIFICATIONS (Clean Crisp White Panels) */}
        <section id="product-specs" className="py-14 sm:py-20 bg-[#F1F5F9] border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Why You'll Love It & What's Included (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
                <h2 className="text-2xl font-display font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#0070BA] rounded-sm"></span>
                  <span>Why You&apos;ll Love It</span>
                </h2>
                <ul className="space-y-3">
                  {product.whyYouLoveIt.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm sm:text-base text-slate-700"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0070BA] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
                <h2 className="text-2xl font-display font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#0070BA] rounded-sm"></span>
                  <span>What&apos;s Included in the Box</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.whatsIncluded.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800"
                    >
                      <Check className="w-4 h-4 text-[#0070BA] shrink-0" />
                      <span className="font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Specifications, Delivery Info, Payment Info (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
                <h2 className="text-2xl font-display font-bold text-[#0B2545] mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#0070BA] rounded-sm"></span>
                  <span>Technical Specifications</span>
                </h2>
                <dl className="divide-y divide-slate-100 text-sm">
                  {product.productDetails.map((spec, idx) => (
                    <div key={idx} className="py-3 flex justify-between gap-4">
                      <dt className="text-slate-500 font-medium">{spec.label}</dt>
                      <dd className="text-[#0B2545] font-bold text-right">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-md">
                <div>
                  <h3 className="text-lg font-display font-bold text-[#0B2545] mb-1.5 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#0070BA]" />
                    <span>Delivery Information</span>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{product.deliveryInfo}</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-lg font-display font-bold text-[#0B2545] mb-1.5 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-[#00A859]" />
                    <span>Payment Information</span>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{product.paymentInfo}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. EMBEDDED QUICK ORDER / CHECKOUT SECTION (Flyer Style: Deep Royal Navy + Crimson Red + Crisp White) */}
        <section id="quick-order-section" className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border-2 border-[#0B2545] shadow-2xl overflow-hidden">
            {/* Order Header */}
            <div className="bg-[#0B2545] text-white px-6 sm:px-10 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#E51A24]">
              <div>
                <span className="inline-block bg-[#E51A24] text-white text-xs uppercase tracking-widest font-black px-3.5 py-1 rounded shadow-sm">
                  PAY ON DELIVERY CHECKOUT
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1.5 text-white">
                  Fill In Your Delivery Details Below
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-[#FFE500] font-black uppercase">
                  Free Nationwide Delivery
                </p>
                <p className="text-2xl sm:text-3xl font-black font-mono-num text-[#FFE500]">
                  {formatNaira(totalPrice)}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-10 text-slate-900">
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
                    <a
                      href={getOrderWhatsAppUrl(confirmedInlineOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-bold transition-colors shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Order Receipt on WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setConfirmedInlineOrder(null)}
                      className="py-3.5 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:text-black hover:bg-slate-100 cursor-pointer"
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
                  className="space-y-6"
                >
                  <input type="hidden" name="productName" value={product.name} />
                  <input type="hidden" name="quantity" value={quantity} />
                  <input type="hidden" name="totalPayable" value={formatNaira(totalPrice)} />
                  <input type="hidden" name="paymentMethod" value="Pay on Delivery" />

                  {/* Selected Product Summary Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#0B2545]">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[#0070BA] font-extrabold">
                          Free Nationwide Delivery · Pay on Delivery
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="p-2 text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-mono-num font-bold text-sm text-[#0B2545]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                          className="p-2 text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-lg font-black font-mono-num text-[#0B2545]">
                        {formatNaira(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                      {formError}
                    </div>
                  )}

                  {/* Payment Mode — Pay on Delivery Only */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Payment Mode
                    </label>
                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[#0B2545] bg-blue-50/40">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="inlinePayment"
                          checked
                          readOnly
                          className="accent-[#0B2545]"
                        />
                        <div>
                          <span className="text-sm font-extrabold text-[#0B2545]">
                            Pay on Delivery
                          </span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Inspect your order upon delivery before making payment
                          </p>
                        </div>
                      </div>
                      <Banknote className="w-5 h-5 text-[#00A859] shrink-0" />
                    </div>
                  </div>

                  {/* Customer Delivery Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Chinedu Okafor"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0803 123 4567"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="e.g. 0803 123 4567"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State *
                      </label>
                      <select
                        name="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 text-sm focus:outline-none focus:border-[#0070BA]"
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Delivery Address *
                      </label>
                      <input
                        type="text"
                        name="deliveryAddress"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House No, Street, Estate / Landmark, City"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        name="orderNotes"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Preferred delivery day or landmark instructions..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0070BA] focus:ring-1 focus:ring-[#0070BA]"
                      />
                    </div>
                  </div>

                  {/* Large PLACE ORDER CTA (Crimson Red with Yellow Price) */}
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="w-full py-4 px-8 rounded-xl bg-[#E51A24] hover:bg-[#C9121B] disabled:opacity-60 text-white text-base font-black tracking-wide transition-colors cursor-pointer shadow-xl shadow-red-500/20 border border-[#FFE500]/40"
                  >
                    {isSubmittingOrder
                      ? 'SUBMITTING YOUR ORDER...'
                      : `PLACE ORDER — ${formatNaira(totalPrice)} (PAY ON DELIVERY)`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 8. CUSTOMER REVIEWS & SOCIAL PROOF (Flyer Palette: Clean White + Royal Navy + Gold Stars) */}
        <section
          id="customer-reviews"
          className="py-14 sm:py-20 bg-[#F8FAFC] border-t border-slate-200"
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
        <section id="faq-section" className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          {/* Customer Support & Get Yours Today Banner */}
          <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#0B2545] border border-[#0070BA]/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            {hasSubmittedForm ? (
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#071A2F] hover:bg-[#051324] border border-[#25D366]/60 text-white px-6 py-4 rounded-2xl shadow-xl transition-transform duration-150 hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-md">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#FFE500]">
                    WHATSAPP SUPPORT
                  </p>
                  <p className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Chat With Customer Care
                  </p>
                </div>
              </a>
            ) : (
              <a
                href="tel:09031585177"
                className="flex items-center gap-4 bg-[#071A2F] hover:bg-[#051324] border border-[#0070BA]/60 text-white px-6 py-4 rounded-2xl shadow-xl transition-transform duration-150 hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-full bg-[#0070BA] flex items-center justify-center shrink-0 shadow-md">
                  <Phone className="w-6 h-6 text-[#FFE500]" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#FFE500]">
                    CUSTOMER CARE HOTLINE
                  </p>
                  <p className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Click to Call Us
                  </p>
                </div>
              </a>
            )}

            <div className="text-center md:text-right space-y-2">
              <button
                type="button"
                onClick={() => handleBuyNow(quantity)}
                className="inline-block bg-[#E51A24] hover:bg-[#C9121B] text-white font-black text-lg sm:text-xl px-8 py-3.5 rounded-xl shadow-xl shadow-red-500/20 cursor-pointer transition-colors border border-[#FFE500]/40"
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
                    onClick={() => scrollToSection('visual-features')}
                    className="hover:text-white cursor-pointer"
                  >
                    Features &amp; Gallery
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('product-specs')}
                    className="hover:text-white cursor-pointer"
                  >
                    Technical Specifications
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('quick-order-section')}
                    className="hover:text-white cursor-pointer"
                  >
                    Place Order (Pay on Delivery)
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

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#FFE500] mb-4">
                Customer Support
              </h4>
              <ul className="space-y-3 text-sm text-slate-300">
                {hasSubmittedForm && (
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                    <button
                      type="button"
                      onClick={() => setWhatsAppModalOpen(true)}
                      className="hover:text-white cursor-pointer font-bold text-emerald-400"
                    >
                      WhatsApp Order Chat
                    </button>
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#E51A24] shrink-0" />
                  <a href="tel:09031585177" className="font-bold hover:text-white">
                    Call Customer Care
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E51A24] shrink-0" />
                  <span className="truncate">goodluxebathrooms@gmail.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E51A24] shrink-0 mt-0.5" />
                  <span>Nationwide Delivery Across Nigeria</span>
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

      {/* STICKY MOBILE BOTTOM BUY BAR */}
      <div className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t-2 border-[#0B2545] px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{product.name}</p>
          <p className="text-base font-black font-mono-num text-[#0B2545]">
            {formatNaira(totalPrice)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Call icon on mobile */}
          <a
            href="tel:09031585177"
            className="p-2.5 rounded-lg bg-[#071A2F] text-white border border-[#0070BA] shadow-md hover:bg-[#0B2545]"
            aria-label="Call Customer Care"
            title="Call Customer Care"
          >
            <Phone className="w-5 h-5 text-[#FFE500]" />
          </a>

          {/* WhatsApp icon only after form submission */}
          {hasSubmittedForm && (
            <button
              type="button"
              onClick={() => setWhatsAppModalOpen(true)}
              className="p-2.5 rounded-lg bg-[#25D366] text-white shadow-md hover:bg-[#1EBE5D]"
              aria-label="Order on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleBuyNow(quantity)}
            className="py-2.5 px-4 rounded-lg bg-[#E51A24] text-white text-xs font-black whitespace-nowrap shadow-md border border-[#FFE500]/40"
          >
            QUICK ORDER
          </button>
        </div>
      </div>

      {/* FLOATING QUICK ORDER & WHATSAPP BUTTONS */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3">
        <button
          type="button"
          onClick={() => handleBuyNow(quantity)}
          className="flex items-center gap-2 py-3 px-4 rounded-full bg-[#E51A24] hover:bg-[#C9121B] text-white shadow-2xl transition-transform duration-200 hover:scale-105 cursor-pointer border-2 border-[#FFE500]"
          aria-label="Open Quick Order Popup"
        >
          <Zap className="w-4 h-4 text-[#FFE500] fill-[#FFE500]" />
          <span className="text-xs font-black tracking-wide">Quick Order Form</span>
        </button>

        {/* WhatsApp button only visible after someone fills the form */}
        {hasSubmittedForm && (
          <button
            type="button"
            onClick={() => setWhatsAppModalOpen(true)}
            className="flex items-center gap-2 py-3 px-4 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-2xl transition-transform duration-200 hover:scale-105 cursor-pointer border-2 border-white animate-pulse"
            aria-label="Order via WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-white fill-white" />
            <span className="text-xs font-black tracking-wide">WhatsApp Order Chat</span>
          </button>
        )}
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

      {/* WHATSAPP ORDER MODAL */}
      <WhatsAppOrderModal
        isOpen={whatsAppModalOpen}
        product={product}
        quantity={quantity}
        allProducts={[product]}
        onClose={() => setWhatsAppModalOpen(false)}
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
