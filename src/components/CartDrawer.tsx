import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
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

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[70]"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[80] flex flex-col border-l border-black">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-black">
          <span className="text-xs uppercase tracking-wider">Cart</span>
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
              >
                Clear
              </button>
            )}
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-sm uppercase tracking-wider">Your cart is empty</p>
              <button
                onClick={() => { setIsOpen(false); navigate('/shop'); }}
                className="mt-4 px-8 py-3 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={`${item.product.id}-${item.size}-${item.color}-${idx}`} className="flex gap-4 p-6">
                  <div className="w-24 h-24 bg-[#f3f3f3] flex-shrink-0">
                    <img
                      src={(item.product as any).images?.colors?.[item.color] || (item.product as any).images?.default_primary || (item.product as any).imagePrimary || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-normal">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Taille: {item.size} / Couleur:{' '}
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-gray-200 align-middle"
                          style={{ backgroundColor: colorMap[item.color] || item.color }}
                          title={item.color}
                        />
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center border border-black hover:bg-black hover:text-white transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm">{( (item.product.sale_price ? Number(item.product.sale_price) : Number(item.product.price)) * item.quantity).toLocaleString()} MAD</span>
                        {item.product.sale_price && (
                          <span className="text-[10px] text-gray-400 line-through">{(Number(item.product.price) * item.quantity).toLocaleString()} MAD</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size, item.color)}
                    className="self-start text-gray-400 hover:text-black transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-black p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider">Subtotal</span>
              <span className="text-lg">{totalPrice.toLocaleString()} MAD</span>
            </div>
            <button
              onClick={() => { setIsOpen(false); navigate('/checkout'); }}
              className="w-full py-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate('/shop'); }}
              className="w-full py-3 text-xs uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
