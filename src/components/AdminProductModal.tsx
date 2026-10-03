import React, { useState } from 'react';
import { X, Plus, Edit3, Trash2, RotateCcw, Check } from 'lucide-react';
import { Product, ProductCategory, formatNaira } from '../data/products';

interface AdminProductModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetCatalog: () => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  products,
  onClose,
  onSaveProduct,
  onDeleteProduct,
  onResetCatalog,
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  if (!isOpen) return null;

  const startNewProduct = () => {
    const newProd: Product = {
      id: `glx-custom-${Date.now()}`,
      name: '',
      category: 'Kitchen',
      shortDescription: '',
      description: '',
      visualType: 'smart-sink',
      images: ['studio-front'],
      currentPrice: 65000,
      originalPrice: 90000,
      discount: 28,
      stockStatus: 'In Stock',
      stockCount: 15,
      rating: 4.9,
      reviewCount: 12,
      isBestSeller: false,
      isFeatured: true,
      whyYouLoveIt: [
        'Premium corrosion-resistant build quality for modern Nigerian homes',
        'Includes complete installation accessories in the box',
      ],
      productDetails: [
        { label: 'Material', value: '304 Grade Stainless Steel & Solid Brass' },
        { label: 'Warranty', value: '12 Months GOODLUXE Warranty' },
      ],
      whatsIncluded: ['Main Product Unit', 'Complete Mounting Hardware & Fittings'],
      deliveryInfo: 'Free Nationwide Delivery across Nigeria (1–3 Working Days).',
      paymentInfo: 'Pay on Delivery, Bank Transfer, or Online Payment.',
      reviews: [],
    };
    setEditingProduct(newProd);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;
    const computedDiscount =
      editingProduct.originalPrice > editingProduct.currentPrice
        ? Math.round(
            ((editingProduct.originalPrice - editingProduct.currentPrice) /
              editingProduct.originalPrice) *
              100
          )
        : 0;
    onSaveProduct({
      ...editingProduct,
      discount: computedDiscount,
    });
    setEditingProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FBFBF9]">
          <div>
            <h2 className="text-xl font-display font-semibold text-[#111111]">
              GOODLUXE Product Catalog Manager
            </h2>
            <p className="text-xs text-stone-500">
              Add, edit, or update Naira (₦) pricing, stock status, and product specifications
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-500 hover:text-[#111111] hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {editingProduct ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-semibold text-[#111111]">
                  {products.some((p) => p.id === editingProduct.id)
                    ? `Editing: ${editingProduct.name}`
                    : 'Add New GOODLUXE Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs font-medium text-stone-500 hover:text-[#111111] cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    placeholder="e.g. Smart Touchless Kitchen Faucet"
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value as ProductCategory,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                    >
                      <option value="Kitchen">Kitchen</option>
                      <option value="Bathroom">Bathroom</option>
                      <option value="Smart Home">Smart Home</option>
                      <option value="Home Essentials">Home Essentials</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      3D Studio Model Preset
                    </label>
                    <select
                      value={editingProduct.visualType}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          visualType: e.target.value as Product['visualType'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                    >
                      <option value="smart-sink">Smart Kitchen Sink</option>
                      <option value="piano-shower">Piano Shower</option>
                      <option value="smart-lock">Smart Door Lock</option>
                      <option value="modern-faucet">Modern Faucet</option>
                      <option value="led-mirror">LED Bathroom Mirror</option>
                      <option value="uv-sterilizer">UV Knife Sterilizer</option>
                      <option value="sensor-bin">Smart Sensor Bin</option>
                      <option value="filtered-showerhead">Filtered Showerhead</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Current Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={editingProduct.currentPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        currentPrice: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Original Old Price (₦)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    value={editingProduct.originalPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={editingProduct.stockStatus}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stockStatus: e.target.value as Product['stockStatus'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Pre-Order">Pre-Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Optional Custom Image URL (Leave blank to use Studio Architectural Render)
                </label>
                <input
                  type="url"
                  value={
                    editingProduct.images[0]?.startsWith('http')
                      ? editingProduct.images[0]
                      : ''
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      images: e.target.value.trim()
                        ? [e.target.value.trim(), 'isometric-flow', 'dimensions-spec', 'lifestyle-context']
                        : ['studio-front', 'isometric-flow', 'dimensions-spec', 'lifestyle-context'],
                    })
                  }
                  placeholder="https://example.com/product-photo.jpg"
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Short Card Description *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.shortDescription}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="1-2 sentence conversion summary for product card"
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Product Description
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Why You&apos;ll Love It (One feature bullet per line)
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.whyYouLoveIt.join('\n')}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      whyYouLoveIt: e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })
                    }
                    className="accent-[#111111]"
                  />
                  <span>Show in Featured Products</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isBestSeller}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isBestSeller: e.target.checked,
                      })
                    }
                    className="accent-[#111111]"
                  />
                  <span>Show in Best Sellers Carousel</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#B48A4E] cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Active Catalog ({products.length} Products)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onResetCatalog}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-600 hover:text-[#111111] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default Catalog</span>
                  </button>
                  <button
                    type="button"
                    onClick={startNewProduct}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#B48A4E] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden">
                {products.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white flex items-center justify-between gap-4 hover:bg-stone-50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="font-semibold text-[#B48A4E] uppercase">
                          {item.category}
                        </span>
                        <span>·</span>
                        <span>{item.stockStatus}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#111111] truncate">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono-num text-[#111111]">
                          {formatNaira(item.currentPrice)}
                        </p>
                        <p className="text-[11px] text-stone-400 line-through font-mono-num">
                          {formatNaira(item.originalPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(item)}
                          className="p-2 rounded-lg text-stone-600 hover:text-[#111111] hover:bg-stone-200/60 cursor-pointer"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(item.id)}
                            className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
