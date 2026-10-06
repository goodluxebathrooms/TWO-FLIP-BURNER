import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Settings, Check } from 'lucide-react';
import { Product, formatNaira } from '../data/products';

interface AdminProductModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSaveProduct: (updated: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onResetCatalog: () => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  products,
  onClose,
  onSaveProduct,
  onResetCatalog,
}) => {
  const currentProduct = products[0];

  const [name, setName] = useState('');
  const [currentPrice, setCurrentPrice] = useState(160000);
  const [originalPrice, setOriginalPrice] = useState(250000);
  const [stockCount, setStockCount] = useState(14);
  const [shortDescription, setShortDescription] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentProduct && isOpen) {
      setName(currentProduct.name);
      setCurrentPrice(currentProduct.currentPrice);
      setOriginalPrice(currentProduct.originalPrice);
      setStockCount(currentProduct.stockCount || 14);
      setShortDescription(currentProduct.shortDescription || '');
      setSavedSuccess(false);
    }
  }, [currentProduct, isOpen]);

  if (!isOpen || !currentProduct) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Product = {
      ...currentProduct,
      name: name.trim() || currentProduct.name,
      currentPrice: Number(currentPrice) || currentProduct.currentPrice,
      originalPrice: Number(originalPrice) || currentProduct.originalPrice,
      stockCount: Number(stockCount) || currentProduct.stockCount,
      shortDescription: shortDescription.trim() || currentProduct.shortDescription,
    };
    onSaveProduct(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#071A2F] text-white p-5 flex items-center justify-between border-b border-[#0070BA]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0070BA] text-white flex items-center justify-center shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Product Admin Settings</h3>
              <p className="text-xs text-slate-300">Quickly adjust live pricing and stock</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Product Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0070BA]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Promo Price (₦)
              </label>
              <input
                type="number"
                required
                min={1000}
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0070BA]"
              />
              <p className="mt-1 text-[11px] text-slate-500">{formatNaira(currentPrice)}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Original Price (₦)
              </label>
              <input
                type="number"
                required
                min={1000}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0070BA]"
              />
              <p className="mt-1 text-[11px] text-slate-500">{formatNaira(originalPrice)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Remaining Stock Count
              </label>
              <input
                type="number"
                required
                min={1}
                value={stockCount}
                onChange={(e) => setStockCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0070BA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subheading
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief highlight..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0070BA]"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                onResetCatalog();
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset Default</span>
            </button>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-[#0070BA] hover:bg-[#005B97] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
