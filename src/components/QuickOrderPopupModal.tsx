import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Banknote,
  Minus,
  Plus,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  AlertCircle,
} from 'lucide-react';
import {
  Product,
  NIGERIAN_STATES,
  WHATSAPP_PHONE,
  FORMSPREE_ENDPOINT,
  formatNaira,
  calculateProgressivePricing,
} from '../data/products';
import { OrderRecord } from './CartCheckoutModal';
import { validateOrderForm, FormErrors } from '../utils/validation';

interface QuickOrderPopupModalProps {
  isOpen: boolean;
  product: Product;
  quantity: number;
  onQuantityChange: (newQty: number) => void;
  onClose: () => void;
  onOrderComplete: (order: OrderRecord) => void;
}

export const QuickOrderPopupModal: React.FC<QuickOrderPopupModalProps> = ({
  isOpen,
  product,
  quantity,
  onQuantityChange,
  onClose,
  onOrderComplete,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [state, setState] = useState('Lagos');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError('');
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pricing = calculateProgressivePricing(product.currentPrice, quantity);

  const handleSubmit = async (e: React.FormEvent) => {
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
    setIsSubmitting(true);

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
      totalAmount: pricing.finalTotal,
    };

    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `New GOODLUXE Quick Popup Order ${generatedId} — ${newOrder.customerName} (${newOrder.state})`,
          orderId: generatedId,
          productName: product.name,
          quantity,
          progressiveDiscount: formatNaira(pricing.progressiveDiscount),
          totalPayable: formatNaira(pricing.finalTotal),
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
      // Proceed to confirmation screen even if network is offline
    } finally {
      setIsSubmitting(false);
    }

    setConfirmedOrder(newOrder);
    onOrderComplete(newOrder);
  };

  const getWhatsAppReceiptUrl = (order: OrderRecord) => {
    const text = `Hello GOODLUXE, I just placed Order *${order.orderId}*.\n\n*Product:* ${
      product.name
    }\n*Quantity:* ${quantity}\n*Total Payable (Pay on Delivery):* ${formatNaira(
      order.totalAmount
    )}\n*Customer:* ${order.customerName}\n*Phone:* ${
      order.phone
    }\n*Delivery Address:* ${order.address}, ${order.state} State\n${
      order.notes ? `*Notes:* ${order.notes}` : ''
    }\n\nPlease confirm my delivery schedule.`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white text-[#0A1C36] rounded-2xl shadow-2xl border border-[#0070BA]/30 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pop-Up Header (Compact) */}
        <div className="bg-[#071A2F] text-white px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0 shadow-sm border-b-2 border-[#FFE500]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FFE500] text-[#071A2F] flex items-center justify-center shrink-0 shadow-xs font-black">
              <Zap className="w-3.5 h-3.5 fill-[#071A2F]" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block bg-[#E51A24] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded">
                  FLASH SALE
                </span>
                <h3 className="text-xs sm:text-sm font-display font-bold leading-tight text-white">
                  Quick Pay-on-Delivery Order
                </h3>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 bg-white">
          {confirmedOrder ? (
            <div className="space-y-5 py-2">
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/50 text-center space-y-2">
                <CheckCircle2 className="w-11 h-11 text-emerald-600 mx-auto" />
                <p className="text-xs uppercase tracking-widest font-extrabold text-emerald-700">
                  Order Successfully Received!
                </p>
                <h4 className="text-xl font-display font-bold text-[#071A2F]">
                  Thank you, {confirmedOrder.customerName}!
                </h4>
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-emerald-300 text-xs font-mono-num font-bold text-slate-800 shadow-xs">
                  <span>Order ID: {confirmedOrder.orderId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedOrder.orderId);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="text-[#0070BA] hover:text-[#071A2F] cursor-pointer"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2.5 text-xs sm:text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Product</span>
                  <span className="font-bold text-[#071A2F]">
                    {quantity} × {product.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Pay on Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Address</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {confirmedOrder.address}, {confirmedOrder.state} State
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-slate-800">Total Payable on Delivery</span>
                  <span className="text-xl font-black font-mono-num text-[#E51A24]">
                    {formatNaira(confirmedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#071A2F] font-medium text-center space-y-1">
                  <p className="font-bold text-[#0070BA]">
                    📦 Dispatch Logistics Notification
                  </p>
                  <p>
                    Our delivery rider will call your phone number (<strong className="font-mono-num font-bold text-slate-900">{confirmedOrder.phone}</strong>) prior to arrival. Please keep your line available.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrder(null);
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#071A2F] text-white text-xs font-black uppercase tracking-wider hover:bg-[#0B2545] transition-colors cursor-pointer shadow-md"
                >
                  Done / Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            <form
              id="popup-quick-order-form"
              action={FORMSPREE_ENDPOINT}
              method="POST"
              onSubmit={handleSubmit}
              className="space-y-2"
            >
              <input type="hidden" name="productName" value={product.name} />
              <input type="hidden" name="quantity" value={quantity} />
              <input type="hidden" name="totalPayable" value={formatNaira(pricing.finalTotal)} />
              <input type="hidden" name="paymentMethod" value="Pay on Delivery" />

              {/* BIGGER UNIT & QUANTITY SELECTOR SECTION */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-[#0B2545] to-[#071A2F] text-white border-2 border-[#0070BA]/60 shadow-md space-y-2">
                {/* Product Name & Large Quantity Stepper */}
                <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-white/15">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FFE500] block">
                        Select Units
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                        {product.name}
                      </h4>
                    </div>
                  </div>

                  {/* Large Stepper */}
                  <div className="inline-flex items-center border-2 border-white/40 rounded-lg bg-black/50 shadow-inner shrink-0">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer rounded-l-md"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 sm:w-9 text-center font-mono-num font-black text-sm sm:text-base text-[#FFE500]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(Math.min(20, quantity + 1))}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer rounded-r-md"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Big Unit Selection Cards (1 Unit, 2 Units, 3 Units) */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[1, 2, 3].map((tierQty) => {
                    const tierPricing = calculateProgressivePricing(product.currentPrice, tierQty);
                    const isSelected = quantity === tierQty;
                    return (
                      <button
                        key={tierQty}
                        type="button"
                        onClick={() => onQuantityChange(tierQty)}
                        className={`p-1.5 sm:p-2 rounded-lg border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] sm:min-h-[62px] ${
                          isSelected
                            ? 'border-[#FFE500] bg-white text-[#071A2F] shadow-lg ring-2 ring-[#FFE500]'
                            : 'border-white/30 bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[11px] sm:text-xs font-black uppercase ${isSelected ? 'text-[#071A2F]' : 'text-white'}`}>
                            {tierQty} {tierQty === 1 ? 'Unit' : 'Units'}
                          </span>
                          <span className={`text-[8px] sm:text-[9px] font-black px-1 py-0.2 rounded font-mono-num ${
                            isSelected
                              ? 'bg-[#E51A24] text-white'
                              : 'bg-[#FFE500] text-[#071A2F]'
                          }`}>
                            {tierQty === 1 ? 'BASE' : tierQty === 2 ? '-₦10k' : '-₦30k'}
                          </span>
                        </div>
                        <div className="mt-0.5 sm:mt-1 text-right w-full">
                          <p className={`text-xs sm:text-sm font-black font-mono-num leading-tight ${
                            isSelected ? 'text-[#E51A24]' : 'text-[#FFE500]'
                          }`}>
                            {formatNaira(tierPricing.finalTotal)}
                          </p>
                          {tierQty > 1 && (
                            <p className={`text-[8px] sm:text-[9px] font-mono-num ${
                              isSelected ? 'text-slate-600' : 'text-slate-300'
                            }`}>
                              {formatNaira(tierPricing.unitPrice)}/ea
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <div className="p-2 rounded-md bg-red-50 border border-red-300 text-xs text-red-800 font-bold flex items-start gap-1.5 shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Payment Mode — Pay on Delivery (Moderate) */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-emerald-500 bg-emerald-50/80">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="popupPayment"
                    checked
                    readOnly
                    className="accent-emerald-600 w-3.5 h-3.5"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Pay on Delivery (Inspect before payment)
                  </span>
                </div>
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>

              {/* Customer Delivery Inputs — Moderate Balanced Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-[#0A1C36]">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
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
                    className={`w-full px-3 py-2 sm:py-2.5 rounded-lg border text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none transition-colors ${
                      fieldErrors.fullName
                        ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                        : 'border-slate-300 bg-[#F8FAFC] focus:border-[#E51A24]'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-[11px] text-red-600 font-bold flex items-center gap-1">
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
                    className={`w-full px-3 py-2 sm:py-2.5 rounded-lg border text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none transition-colors ${
                      fieldErrors.phone
                        ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                        : 'border-slate-300 bg-[#F8FAFC] focus:border-[#E51A24]'
                    }`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-[11px] text-red-600 font-bold flex items-center gap-1">
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
                    className={`w-full px-3 py-2 sm:py-2.5 rounded-lg border text-slate-900 text-sm focus:outline-none ${
                      fieldErrors.state
                        ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                        : 'border-slate-300 bg-[#F8FAFC] focus:border-[#E51A24]'
                    }`}
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-white text-slate-900">
                        {st}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.state && (
                    <p className="mt-1 text-[11px] text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.state}</span>
                    </p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Address *
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
                    placeholder="House No, Street, Bus-stop"
                    className={`w-full px-3 py-2 sm:py-2.5 rounded-lg border text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none transition-colors ${
                      fieldErrors.address
                        ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                        : 'border-slate-300 bg-[#F8FAFC] focus:border-[#E51A24]'
                    }`}
                  />
                  {fieldErrors.address && (
                    <p className="mt-1 text-[11px] text-red-600 font-bold flex items-center gap-1">
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
                    placeholder="Preferred delivery time or landmark..."
                    className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#E51A24]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-5 rounded-xl bg-[#E51A24] hover:bg-[#C9131C] disabled:opacity-60 text-white text-sm sm:text-base font-black tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/25 border-2 border-[#FFE500] animate-action-blink flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'SUBMITTING YOUR ORDER...'
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-[#FFE500] fill-[#FFE500] shrink-0" />
                    <span>PLACE ORDER — {formatNaira(pricing.finalTotal)} (PAY ON DELIVERY)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-semibold">
                  <Truck className="w-3.5 h-3.5 text-[#0070BA]" />
                  Free Nationwide Delivery
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  12-Month Warranty
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
