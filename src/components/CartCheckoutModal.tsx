import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Building2,
  Banknote,
  Copy,
  Check,
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
import { ProductVisual } from './ProductVisual';
import { validateOrderForm, FormErrors } from '../utils/validation';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  state: string;
  notes: string;
  paymentMethod: 'Pay on Delivery' | 'Bank Transfer' | 'Online Payment';
  items: CartItem[];
  totalAmount: number;
}

interface CartCheckoutModalProps {
  isOpen: boolean;
  initialMode: 'cart' | 'checkout';
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderComplete: (order: OrderRecord) => void;
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  initialMode,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOrderComplete,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>(
    initialMode === 'checkout' ? 'checkout' : 'cart'
  );

  // Sync when modal opens in specific mode
  React.useEffect(() => {
    if (isOpen) {
      setStep(initialMode === 'checkout' && cart.length > 0 ? 'checkout' : 'cart');
      setFormError('');
      setFieldErrors({});
    }
  }, [isOpen, initialMode, cart.length]);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Lagos');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'Pay on Delivery' | 'Bank Transfer' | 'Online Payment'
  >('Pay on Delivery');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + calculateProgressivePricing(item.product.currentPrice, item.quantity).finalTotal,
    0
  );
  const totalSavings = cart.reduce(
    (sum, item) =>
      sum +
      calculateProgressivePricing(item.product.currentPrice, item.quantity).progressiveDiscount,
    0
  );
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
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
      items: [...cart],
      totalAmount: subtotal,
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
          customerName: newOrder.customerName,
          phone: newOrder.phone,
          whatsapp: newOrder.whatsapp,
          state: newOrder.state,
          deliveryAddress: newOrder.address,
          orderNotes: newOrder.notes || 'None',
          paymentMethod: 'Pay on Delivery',
          items: newOrder.items
            .map((i) => `${i.quantity}x ${i.product.name}`)
            .join(', '),
          progressiveDiscount: formatNaira(totalSavings),
          totalPayable: formatNaira(subtotal),
        }),
      });
    } catch {
      // Proceed to confirmation screen even if network is offline
    } finally {
      setIsSubmitting(false);
    }

    setConfirmedOrder(newOrder);
    onOrderComplete(newOrder);
    setStep('confirmed');
  };

  const getOrderWhatsAppUrl = (order: OrderRecord) => {
    const itemLines = order.items
      .map(
        (i) =>
          `• ${i.product.name} (Qty: ${i.quantity}) — ${formatNaira(
            i.product.currentPrice * i.quantity
          )}`
      )
      .join('\n');
    const text = `Hello GOODLUXE, I just placed Order *${order.orderId}* on your website.\n\n*Items:*\n${itemLines}\n\n*Total:* ${formatNaira(
      order.totalAmount
    )}\n*Payment Option:* ${order.paymentMethod}\n*Customer:* ${order.customerName}\n*Phone:* ${
      order.phone
    }\n*Delivery Address:* ${order.address}, ${order.state} State\n${
      order.notes ? `*Notes:* ${order.notes}` : ''
    }\n\nPlease confirm dispatch schedule.`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white text-[#0A1C36] h-full flex flex-col shadow-2xl overflow-hidden border-l-2 border-[#0070BA]/30">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b-2 border-[#FFE500] flex items-center justify-between bg-[#071A2F] text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#FFE500]" />
            <h2 className="text-xl font-display font-semibold text-white">
              {step === 'cart' && `Your Shopping Bag (${totalQuantity})`}
              {step === 'checkout' && 'Quick Order Checkout'}
              {step === 'confirmed' && 'Order Confirmed'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {step === 'confirmed' && confirmedOrder ? (
            <div className="space-y-6 py-2">
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500/50 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-xs uppercase tracking-widest font-extrabold text-emerald-700">
                  Order Successfully Received
                </p>
                <h3 className="text-2xl font-display font-bold text-[#071A2F]">
                  Thank you, {confirmedOrder.customerName}!
                </h3>
                <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-emerald-300 text-sm font-mono-num font-bold text-slate-800 shadow-xs">
                  <span>Order ID: {confirmedOrder.orderId}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedOrder.orderId);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="text-[#0070BA] hover:text-[#071A2F] cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Order Summary Receipt */}
              <div className="rounded-xl border border-slate-200 p-5 space-y-4 bg-[#F8FAFC]">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Payment Method
                  </span>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {confirmedOrder.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between gap-2">
                      <span className="text-slate-700 font-medium">
                        {item.quantity} × {item.product.name}
                      </span>
                      <span className="font-mono-num font-bold text-[#071A2F]">
                        {formatNaira(
                          calculateProgressivePricing(item.product.currentPrice, item.quantity).finalTotal
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-slate-800">
                    Total Payable (Free Delivery)
                  </span>
                  <span className="text-xl font-black font-mono-num text-[#E51A24]">
                    {formatNaira(confirmedOrder.totalAmount)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-900">Delivering To:</strong>{' '}
                    {confirmedOrder.address}, {confirmedOrder.state} State
                  </p>
                  <p>
                    <strong className="text-slate-900">Contact Phone:</strong>{' '}
                    {confirmedOrder.phone}
                  </p>
                </div>
              </div>

              {/* Dispatch Information & Continue Shopping */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#071A2F] font-medium text-center space-y-1">
                  <p className="font-bold text-[#0070BA]">
                    📦 Dispatch Logistics Notice
                  </p>
                  <p>
                    Our delivery rider will call your phone number (<strong className="font-mono-num font-bold text-slate-900">{confirmedOrder.phone}</strong>) prior to arrival. Please keep your line reachable!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#071A2F] text-white text-xs font-black uppercase tracking-wider hover:bg-[#0B2545] transition-colors cursor-pointer shadow-md"
                >
                  Done / Continue Shopping
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-xl font-display font-semibold text-slate-900">
                Your shopping bag is empty
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mt-1 mb-6">
                Discover the 2-BURNER SMART TIMER GAS COOKER with Digital Timer &amp; Blue Turbo Flame.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 rounded-lg bg-[#E51A24] text-white text-xs font-bold tracking-wide hover:bg-[#C9131C] transition-colors cursor-pointer shadow-md"
              >
                VIEW PRODUCT
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-5">
              {/* Free Nationwide Delivery Banner */}
              <div className="p-3.5 rounded-xl bg-[#071A2F] text-white border border-[#0070BA]/50 flex items-center gap-3 text-xs shadow-sm">
                <Truck className="w-4 h-4 text-[#FFE500] shrink-0" />
                <span>
                  Your order qualifies for <strong className="text-[#FFE500]">FREE Nationwide Delivery</strong> &amp;{' '}
                  <strong className="text-white">Pay on Delivery</strong>.
                </span>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-slate-200">
                {cart.map(({ product, quantity }) => (
                  <div key={product.id} className="py-4 flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white p-1">
                      <ProductVisual
                        visualType={product.visualType}
                        customImageUrl={product.images[0]}
                        alt={product.name}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-[#071A2F] truncate">
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          className="text-slate-400 hover:text-[#E51A24] p-1 cursor-pointer"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#0070BA] font-semibold">{product.category}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-slate-300 rounded-md bg-slate-50">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-mono-num font-semibold text-slate-800">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold font-mono-num text-[#E51A24]">
                          {formatNaira(
                            calculateProgressivePricing(product.currentPrice, quantity).finalTotal
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* STEP: QUICK CHECKOUT FORM */
            <form
              id="quick-checkout-form"
              action={FORMSPREE_ENDPOINT}
              method="POST"
              onSubmit={handlePlaceOrder}
              className="space-y-5"
            >
              {/* Compact Order Summary */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Order Summary ({totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'})
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="text-xs font-bold text-[#0070BA] hover:underline cursor-pointer"
                  >
                    Edit Bag
                  </button>
                </div>

                {cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-2 text-xs pt-1"
                  >
                    <span className="text-slate-800 font-medium truncate">
                      {product.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="sr-only">Quantity</label>
                      <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white shadow-xs">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer font-bold"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono-num font-black text-xs text-slate-900">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer font-bold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-mono-num font-bold text-[#E51A24] w-24 text-right">
                        {formatNaira(
                          calculateProgressivePricing(product.currentPrice, quantity).finalTotal
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border-2 border-red-300 text-xs text-red-800 font-bold flex items-start gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Payment Mode — Exclusively Pay on Delivery */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Payment Mode
                </label>
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked
                      readOnly
                      className="accent-emerald-600"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900">
                        Pay on Delivery
                      </span>
                      <p className="text-xs text-slate-600">
                        Inspect your package upon arrival before paying cash or transfer
                      </p>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              </div>

              {/* Customer Delivery Fields (Moderate, Comfortable Input Boxes) */}
              <div className="space-y-3 text-[#0A1C36]">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (First &amp; Last Name) *
                  </label>
                  <input
                    type="text"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (11 Digits) *
                  </label>
                  <input
                    type="tel"
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State *
                    </label>
                    <select
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
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Detailed Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (fieldErrors.address) setFieldErrors((p) => ({ ...p, address: undefined }));
                      }}
                      placeholder="House No, Street Name, Estate or Bus-stop"
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order Notes / Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Preferred delivery day, gate pass code, or color preference..."
                    className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#E51A24]"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && step !== 'confirmed' && (
          <div className="p-6 border-t border-slate-200 bg-[#F8FAFC] space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Delivery (Nationwide Express)</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Total Promotional Discount</span>
                  <span className="font-mono-num">-{formatNaira(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-base font-semibold text-slate-800">Total Payable</span>
                <span className="text-2xl font-black font-mono-num text-[#E51A24]">
                  {formatNaira(subtotal)}
                </span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-4 px-6 rounded-xl bg-[#E51A24] hover:bg-[#C9131C] text-white text-sm sm:text-base font-black tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-xl shadow-red-500/25 border-2 border-[#FFE500] animate-action-blink"
              >
                PROCEED TO QUICK CHECKOUT
              </button>
            ) : (
              <button
                type="submit"
                form="quick-checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-[#E51A24] hover:bg-[#C9131C] disabled:opacity-60 text-white text-sm sm:text-base font-black tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-xl shadow-red-500/25 border-2 border-[#FFE500] animate-action-blink"
              >
                {isSubmitting
                  ? 'SUBMITTING ORDER...'
                  : `PLACE ORDER — ${formatNaira(subtotal)} (PAY ON DELIVERY)`}
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pay on Delivery Available · 12-Month Warranty · Free Nationwide Shipping</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
