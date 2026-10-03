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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pricing = calculateProgressivePricing(product.currentPrice, quantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError('Please enter your Full Name, Phone Number, and Delivery Address.');
      return;
    }
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
        className="relative w-full max-w-xl bg-white text-[#0A1C36] rounded-3xl shadow-2xl border-2 border-[#0070BA]/30 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pop-Up Header (Flyer Deep Royal Midnight Navy + Fire Red + Sunburst Yellow) */}
        <div className="bg-[#071A2F] text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0 shadow-md border-b-2 border-[#FFE500]">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#FFE500] text-[#071A2F] flex items-center justify-center shrink-0 shadow-sm font-black">
              <Zap className="w-4 h-4 fill-[#071A2F]" />
            </span>
            <div>
              <span className="inline-block bg-[#E51A24] text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-xs">
                PROMO FLASH ORDER
              </span>
              <h3 className="text-base sm:text-lg font-display font-bold leading-tight mt-0.5 text-white">
                Quick Pay-on-Delivery Order
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-white">
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

              <div className="space-y-2.5">
                <a
                  href={getWhatsAppReceiptUrl(confirmedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-bold transition-colors shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Order Receipt on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrder(null);
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form
              id="popup-quick-order-form"
              action={FORMSPREE_ENDPOINT}
              method="POST"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input type="hidden" name="productName" value={product.name} />
              <input type="hidden" name="quantity" value={quantity} />
              <input type="hidden" name="totalPayable" value={formatNaira(pricing.finalTotal)} />
              <input type="hidden" name="paymentMethod" value="Pay on Delivery" />

              {/* Product & Quantity Summary */}
              <div className="p-3.5 rounded-2xl bg-[#071A2F] text-white border border-[#0070BA]/50 space-y-3 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-base font-black font-mono-num text-[#FFE500]">
                          {formatNaira(pricing.finalTotal)}
                        </span>
                        <span className="text-[11px] font-mono-num font-semibold text-slate-300">
                          ({formatNaira(pricing.unitPrice)}/unit)
                        </span>
                        {pricing.progressiveDiscount > 0 && (
                          <span className="text-[10px] bg-[#FFE500] text-[#071A2F] font-mono-num font-black px-1.5 py-0.5 rounded">
                            SAVE {formatNaira(pricing.progressiveDiscount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="inline-flex items-center border border-white/30 rounded-lg bg-black/40 shrink-0">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                      className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono-num font-bold text-xs text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(Math.min(20, quantity + 1))}
                      className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Progressive Discount Bundle Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((tierQty) => {
                    const tierPricing = calculateProgressivePricing(product.currentPrice, tierQty);
                    const isSelected = quantity === tierQty;
                    return (
                      <button
                        key={tierQty}
                        type="button"
                        onClick={() => onQuantityChange(tierQty)}
                        className={`p-2 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#FFE500] bg-white/15 shadow-md ring-2 ring-[#FFE500]'
                            : 'border-white/20 bg-black/30 hover:border-[#0070BA]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-extrabold text-white">
                            {tierQty} {tierQty === 1 ? 'Unit' : 'Units'}
                          </span>
                          <span className="text-[9px] font-black bg-[#FFE500] text-[#071A2F] px-1 py-0.2 rounded font-mono-num">
                            {tierQty === 1
                              ? 'BASE'
                              : `-${formatNaira(tierPricing.discountPerUnit)}/ea`}
                          </span>
                        </div>
                        <p className="text-xs font-black font-mono-num text-[#FFE500] mt-0.5">
                          {formatNaira(tierPricing.unitPrice)}/unit
                        </p>
                        <p className="text-[10px] font-semibold font-mono-num text-slate-300">
                          Total: {formatNaira(tierPricing.finalTotal)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-xs text-red-700 font-medium">
                  {formError}
                </div>
              )}

              {/* Payment Mode — Pay on Delivery Only */}
              <div className="flex items-center justify-between p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50">
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="popupPayment"
                    checked
                    readOnly
                    className="accent-emerald-600"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Pay on Delivery (Inspect Before Paying)
                    </span>
                  </div>
                </div>
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>

              {/* Customer Delivery Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#0A1C36]">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E51A24] focus:ring-1 focus:ring-[#E51A24]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E51A24] focus:ring-1 focus:ring-[#E51A24]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E51A24] focus:ring-1 focus:ring-[#E51A24]"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 text-sm focus:outline-none focus:border-[#E51A24]"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-white text-slate-900">
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
                    placeholder="House No, Street, Landmark, City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E51A24] focus:ring-1 focus:ring-[#E51A24]"
                  />
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#E51A24] focus:ring-1 focus:ring-[#E51A24]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-[#E51A24] hover:bg-[#C9131C] disabled:opacity-60 text-white text-sm sm:text-base font-black tracking-wide transition-all duration-200 cursor-pointer shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting
                  ? 'SUBMITTING YOUR ORDER...'
                  : `PLACE ORDER — ${formatNaira(pricing.finalTotal)} (PAY ON DELIVERY)`}
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
