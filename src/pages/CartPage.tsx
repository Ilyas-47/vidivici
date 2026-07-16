import { X, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

const colorMap: Record<string, string> = {
  'Noir': '#000000',
  'Blanc': '#FFFFFF',
  'Gris': '#808080',
  'Marine': '#000080',
  'Beige': '#F5F5DC',
  'Rouge': '#FF0000'
};

export function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <main className="pt-16 min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 lg:px-12 py-8 border-b border-black flex items-center justify-between">
        <button
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Continue Shopping
        </button>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6">
          <ShoppingBag size={64} strokeWidth={1} className="text-gray-200 mb-6" />
          <p className="text-lg text-gray-400 mb-2">Your cart is empty</p>
          <p className="text-sm text-gray-300 mb-8">Add some products to get started</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-12 py-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Items */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}-${idx}`}
                  className="flex gap-6 p-6 lg:px-12"
                >
                  {/* Image */}
                  <div
                    className="w-32 h-32 lg:w-40 lg:h-40 bg-[#f3f3f3] flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/product/${item.product.id}`)}
                  >
                    <img
                      src={(item.product as any).images?.colors?.[item.color] || (item.product as any).images?.default_primary || (item.product as any).imagePrimary || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3
                          className="text-lg lg:text-xl font-normal tracking-[-0.24px] cursor-pointer hover:opacity-60 transition-opacity"
                          onClick={() => navigate(`/product/${item.product.id}`)}
                        >
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.product.id, item.size, item.color)}
                          className="text-gray-400 hover:text-black transition-colors ml-4"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Size: {item.size} / Color:{' '}
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-gray-200 align-middle"
                          style={{ backgroundColor: colorMap[item.color] || item.color }}
                          title={item.color}
                        />
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                          }
                          className="w-9 h-9 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                          }
                          className="w-9 h-9 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-lg">{( (item.product.sale_price ? Number(item.product.sale_price) : Number(item.product.price)) * item.quantity).toLocaleString()} MAD</span>
                        {item.product.sale_price && (
                          <span className="text-xs text-gray-400 line-through">{(Number(item.product.price) * item.quantity).toLocaleString()} MAD</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-black">
            <div className="p-6 lg:p-12 sticky top-16">
              <h2 className="text-xs uppercase tracking-wider mb-8">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{totalPrice.toLocaleString()} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-black pt-4 mb-8">
                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString()} MAD</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Free shipping on orders over 1000 MAD
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
