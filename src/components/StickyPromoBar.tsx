import React, { useState, useEffect } from 'react';

interface StickyPromoBarProps {
  secondsLeft?: number;
  onOrderNowClick?: () => void;
  onShowToast?: (msg: string) => void;
}

// 7 days promo duration: 6 days, 23 hours, 52 mins, 26 secs
const PROMO_7DAY_TOTAL_SECONDS = 6 * 86400 + 23 * 3600 + 52 * 60 + 26;
const STORAGE_KEY = 'goodluxe_7day_promo_end_v2';

export const StickyPromoBar: React.FC<StickyPromoBarProps> = ({
  secondsLeft: externalSecondsLeft,
  onOrderNowClick,
}) => {
  // Internal robust countdown timer tied to real timestamp in localStorage
  const [internalSeconds, setInternalSeconds] = useState<number>(() => {
    try {
      const now = Date.now();
      const savedEnd = localStorage.getItem(STORAGE_KEY);
      if (savedEnd) {
        const diff = Math.floor((Number(savedEnd) - now) / 1000);
        if (diff > 0) return diff;
      }
      const newEnd = now + PROMO_7DAY_TOTAL_SECONDS * 1000;
      localStorage.setItem(STORAGE_KEY, String(newEnd));
      return PROMO_7DAY_TOTAL_SECONDS;
    } catch {
      return PROMO_7DAY_TOTAL_SECONDS;
    }
  });

  useEffect(() => {
    const tick = () => {
      try {
        const now = Date.now();
        let savedEnd = Number(localStorage.getItem(STORAGE_KEY));
        if (!savedEnd || isNaN(savedEnd)) {
          savedEnd = now + PROMO_7DAY_TOTAL_SECONDS * 1000;
          localStorage.setItem(STORAGE_KEY, String(savedEnd));
        }

        const remaining = Math.floor((savedEnd - now) / 1000);

        if (remaining <= 0) {
          // Gracefully reset expired promotion to a fresh cycle rather than showing negative/broken values
          const resetEnd = now + PROMO_7DAY_TOTAL_SECONDS * 1000;
          localStorage.setItem(STORAGE_KEY, String(resetEnd));
          setInternalSeconds(PROMO_7DAY_TOTAL_SECONDS);
        } else {
          setInternalSeconds(remaining);
        }
      } catch {
        setInternalSeconds((prev) => (prev <= 1 ? PROMO_7DAY_TOTAL_SECONDS : prev - 1));
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Use external seconds if provided and positive, otherwise use internal seconds
  const activeSeconds =
    typeof externalSecondsLeft === 'number' && externalSecondsLeft > 0
      ? externalSecondsLeft
      : internalSeconds;

  // Calculate days, hours, minutes, seconds safely
  const safeSeconds = Math.max(0, activeSeconds);
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const dStr = String(days).padStart(2, '0');
  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  return (
    <aside
      aria-label="Promotional announcement and countdown"
      className="w-full bg-[#071A2F] text-white border-b border-[#0070BA]/50 shadow-md relative z-50 select-none py-2 px-3 sm:px-6 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        {/* Top Text: Bold uppercase text + small flame/attention icon */}
        <div
          onClick={onOrderNowClick}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 text-center ${
            onOrderNowClick ? 'cursor-pointer' : ''
          }`}
        >
          <span className="text-sm sm:text-base leading-none shrink-0" role="img" aria-label="flame">
            🔥
          </span>
          <span className="text-[11px] sm:text-xs md:text-[13px] font-black uppercase tracking-wider text-white">
            <span className="text-[#FFE500] font-black mr-1">GOODLUXE</span>
            7-DAY PROMOTIONAL OFFER — FREE DELIVERY &amp; 12 MONTHS WARRANTY
          </span>
        </div>

        {/* Below it: Compact live countdown timer */}
        <div
          className="mt-1 flex items-center justify-center gap-1 sm:gap-1.5 font-mono-num font-black text-[11px] sm:text-xs tracking-wider"
          aria-label={`Offer ends in ${dStr} days, ${hStr} hours, ${mStr} minutes, ${sStr} seconds`}
        >
          <span className="text-[#FFE500] font-black uppercase tracking-widest text-[10px] sm:text-[11px] mr-0.5">
            ENDS IN:
          </span>
          <span className="bg-[#E51A24] text-white px-1.5 py-0.5 rounded font-black text-[10.5px] sm:text-xs shadow-xs font-mono">
            {dStr} d
          </span>
          <span className="text-[#FFE500] font-black text-xs">:</span>
          <span className="bg-[#E51A24] text-white px-1.5 py-0.5 rounded font-black text-[10.5px] sm:text-xs shadow-xs font-mono">
            {hStr} h
          </span>
          <span className="text-[#FFE500] font-black text-xs">:</span>
          <span className="bg-[#E51A24] text-white px-1.5 py-0.5 rounded font-black text-[10.5px] sm:text-xs shadow-xs font-mono">
            {mStr} m
          </span>
          <span className="text-[#FFE500] font-black text-xs">:</span>
          <span className="bg-[#FFE500] text-[#071A2F] px-1.5 py-0.5 rounded font-black text-[10.5px] sm:text-xs shadow-xs font-mono">
            {sStr} s
          </span>
        </div>
      </div>
    </aside>
  );
};
