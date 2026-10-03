import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';
import {
  Product,
  WHATSAPP_PHONE,
  formatNaira,
  calculateProgressivePricing,
} from '../data/products';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  product: Product | null;
  quantity: number;
  allProducts: Product[];
  onClose: () => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  product,
  quantity: initialQty,
  allProducts,
  onClose,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    product?.id || allProducts[0]?.id || ''
  );
  const [qty, setQty] = useState<number>(initialQty || 1);
  const [customerLocation, setCustomerLocation] = useState<string>('Lagos');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedProductId(product.id);
      setQty(initialQty || 1);
    }
  }, [product, initialQty]);

  if (!isOpen) return null;

  const activeProduct =
    allProducts.find((p) => p.id === selectedProductId) || product || allProducts[0];

  const pricing = activeProduct
    ? calculateProgressivePricing(activeProduct.currentPrice, qty)
    : null;

  const prefilledMessage =
    activeProduct && pricing
      ? `Hello GOODLUXE, I want to order ${activeProduct.name}.\n\n• Product: ${
          activeProduct.name
        }\n• Quantity: ${qty}\n• Progressive Discount Applied: -${formatNaira(
          pricing.progressiveDiscount
        )}\n• Total Payable (Pay on Delivery): ${formatNaira(
          pricing.finalTotal
        )}\n• Delivery Location: ${customerLocation}\n\nPlease send me the available options and delivery information.`
      : `Hello GOODLUXE, I want to order [PRODUCT NAME]. Please send me the available options and delivery information.`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(prefilledMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(prefilledMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white text-[#0A1C36] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#0070BA]/30">
        {/* Top Header */}
        <div className="bg-[#071A2F] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#FFE500] shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight text-white">
                GOODLUXE WhatsApp Direct Order
              </h3>
              <p className="text-[11px] text-[#FFE500] font-semibold">
                Instant Dispatch &amp; Order Support
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            aria-label="Close WhatsApp modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product to Order
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-[#F8FAFC] text-slate-900 text-xs font-medium focus:outline-none focus:border-[#E51A24]"
              >
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-slate-900">
                    {p.name} ({formatNaira(p.currentPrice)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-[#F8FAFC] text-slate-900 text-xs font-mono-num font-semibold focus:outline-none focus:border-[#E51A24]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your State / City in Nigeria
            </label>
            <input
              type="text"
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              placeholder="e.g. Lekki, Lagos or Wuse II, Abuja"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-[#F8FAFC] text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-[#E51A24]"
            />
          </div>

          {/* Pre-filled Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-600">
                Pre-Filled WhatsApp Message
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0070BA] hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Message'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {prefilledMessage}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-black transition-colors shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4 text-white fill-white" />
              <span>Continue to WhatsApp Chat</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
