import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ShieldCheck, X, MapPin, Truck } from 'lucide-react';

interface FloatingOrderNotificationProps {
  isModalOpen?: boolean;
  productImage?: string;
  productName?: string;
}

interface OrderNotificationItem {
  id: string;
  name: string;
  location: string;
  units: string;
  item: string;
  timeAgo: string;
  deliveryMethod: string;
}

const NOTIFICATIONS: OrderNotificationItem[] = [
  {
    id: 'ord-1',
    name: 'EMMANUEL COLLINS',
    location: 'Lekki Phase 1, Lagos',
    units: '2 UNITS',
    item: '2 BURNER COOKTOP',
    timeAgo: '4 mins ago',
    deliveryMethod: 'Pay on Delivery',
  },
  {
    id: 'ord-2',
    name: 'MRS. CHIDINMA OKEKE',
    location: 'Maitama, Abuja FCT',
    units: '1 UNIT',
    item: '2 BURNER COOKTOP',
    timeAgo: '12 mins ago',
    deliveryMethod: 'Free Express Dispatch',
  },
  {
    id: 'ord-3',
    name: 'ENGR. TUNDE BAKARE',
    location: 'GRA Phase 2, Port Harcourt',
    units: '2 UNITS',
    item: '2 BURNER COOKTOP',
    timeAgo: '21 mins ago',
    deliveryMethod: 'Pay on Delivery',
  },
  {
    id: 'ord-4',
    name: 'HAJIYA AISHA BELLO',
    location: 'Nassarawa GRA, Kano',
    units: '1 UNIT',
    item: '2 BURNER COOKTOP',
    timeAgo: '28 mins ago',
    deliveryMethod: 'Pay on Delivery',
  },
  {
    id: 'ord-5',
    name: 'DR. OLUWASEUN ADEYEMI',
    location: 'Ikeja GRA, Lagos',
    units: '3 UNITS',
    item: '2 BURNER COOKTOP',
    timeAgo: '39 mins ago',
    deliveryMethod: 'Free Express Dispatch',
  },
  {
    id: 'ord-6',
    name: 'PASTOR EMMANUEL EZE',
    location: 'Independence Layout, Enugu',
    units: '2 UNITS',
    item: '2 BURNER COOKTOP',
    timeAgo: '47 mins ago',
    deliveryMethod: 'Pay on Delivery',
  },
];

export const FloatingOrderNotification: React.FC<FloatingOrderNotificationProps> = ({
  isModalOpen = false,
  productImage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissedPermanently, setIsDismissedPermanently] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const displayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial delay before first notification (10s), then 24s gap between notifications
  useEffect(() => {
    if (isDismissedPermanently || isModalOpen) {
      setIsVisible(false);
      return;
    }

    // Schedule the first appearance after 10 seconds
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(initialDelay);
  }, [isDismissedPermanently, isModalOpen]);

  // Handle visibility duration (stay visible for 5s, then hide for 22s)
  useEffect(() => {
    if (!isVisible || isDismissedPermanently || isModalOpen) {
      if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
      return;
    }

    if (isHovered) {
      // Pause hide countdown if user is hovering
      return;
    }

    // Automatically hide after 5 seconds
    displayTimerRef.current = setTimeout(() => {
      setIsVisible(false);

      // Wait 22 seconds before showing next notification (gentle, unobtrusive pacing)
      cycleTimerRef.current = setTimeout(() => {
        if (!isDismissedPermanently && !isModalOpen) {
          setCurrentIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
          setIsVisible(true);
        }
      }, 22000);
    }, 5000);

    return () => {
      if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    };
  }, [isVisible, isHovered, isDismissedPermanently, isModalOpen]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    // Snooze for 4 minutes so it never annoys the user
    setIsDismissedPermanently(true);
    setTimeout(() => {
      setIsDismissedPermanently(false);
    }, 240000);
  };

  if (!isVisible || isModalOpen) {
    return null;
  }

  const notification = NOTIFICATIONS[currentIndex];

  return (
    <aside
      aria-label="Recent verified purchase notification"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed z-30 pointer-events-auto transition-all duration-500 ease-out 
        /* Desktop: docked at bottom-left, safely clear of WhatsApp on bottom-right and sticky CTA */
        left-4 sm:left-6 
        /* Mobile: floats safely above the sticky bottom buy bar (h-16 + margin = ~78px) */
        bottom-20 sm:bottom-6
        max-w-[340px] sm:max-w-[360px] w-full
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'}
      `}
    >
      <div className="relative bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 shadow-lg shadow-black/10 border-l-4 border-l-[#10B981] flex items-start gap-2.5">
        
        {/* Product Thumbnail or Fallback Icon */}
        <div className="relative w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
          {productImage ? (
            <img
              src={productImage}
              alt="Cooktop"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-[#071A2F] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            </div>
          )}
          {/* Green verified check badge on image */}
          <span
            className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#10B981] text-white rounded-full flex items-center justify-center shadow-xs"
            title="Verified Order"
          >
            <CheckCircle2 className="w-2.5 h-2.5" />
          </span>
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 pr-4">
          {/* Header pill: VERIFIED ORDER PLACED */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-[#059669] text-[9.5px] font-black uppercase tracking-wider border border-emerald-200/70">
              <ShieldCheck className="w-3 h-3 text-[#10B981]" />
              <span>VERIFIED ORDER PLACED</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono-num">
              {notification.timeAgo}
            </span>
          </div>

          {/* Customer Name & Units Item */}
          <p className="text-[12px] font-extrabold text-[#071A2F] uppercase tracking-tight mt-1 leading-snug truncate">
            {notification.name}
          </p>

          <p className="text-[11px] font-bold text-[#E51A24] leading-tight truncate">
            {notification.units} OF {notification.item}
          </p>

          {/* Location & Delivery method */}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium truncate">
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{notification.location}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-0.5 text-[#0070BA] font-semibold shrink-0">
              <Truck className="w-3 h-3 shrink-0" />
              <span>{notification.deliveryMethod}</span>
            </span>
          </div>
        </div>

        {/* Unobtrusive Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          aria-label="Dismiss order notification"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Subtle timer line indicating remaining duration */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 rounded-b-xl overflow-hidden">
          <div
            className={`h-full bg-[#10B981] ${
              isVisible && !isHovered ? 'w-0 transition-all duration-[5000ms] ease-linear' : 'w-full'
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
