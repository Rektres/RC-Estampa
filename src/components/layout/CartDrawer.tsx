import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();
  const totalAmount = total();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-border z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            <h2 className="font-montserrat font-600 text-text">
              Carrito {items.length > 0 && `(${items.length})`}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-muted hover:text-text transition-colors rounded-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
              <ShoppingBag size={48} className="text-ghost" />
              <p className="font-montserrat text-muted text-center">
                Tu carrito está vacío
              </p>
              <button
                onClick={closeCart}
                className="btn-secondary text-sm px-4 py-2"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <ul className="space-y-0">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-4 border-b border-border/50">
                  <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden rounded-sm bg-elevated">
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                    {item.tipo === 'diseno' && (
                      <span className="absolute top-1 left-1 bg-primary text-black text-[9px] font-montserrat font-700 px-1 rounded-sm">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat font-500 text-sm text-text truncate">
                      {item.nombre}
                    </p>
                    {item.tipo === 'catalogo' && (
                      <p className="font-montserrat text-xs text-muted mt-0.5">
                        {item.talla} · {item.color}
                      </p>
                    )}
                    {item.tipo === 'diseno' && (
                      <p className="font-montserrat text-xs text-muted mt-0.5">
                        {item.prenda} · T{item.talla}
                      </p>
                    )}
                    <p className="font-montserrat font-700 text-sm text-primary mt-1">
                      {item.precio ? formatPrice(item.precio * item.cantidad) : 'A cotizar'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="w-6 h-6 flex items-center justify-center border border-border rounded-sm hover:border-primary hover:text-primary transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-montserrat text-sm text-text w-6 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="w-6 h-6 flex items-center justify-center border border-border rounded-sm hover:border-primary hover:text-primary transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-ghost hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4 flex-shrink-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-montserrat text-sm text-muted">Subtotal</span>
              <span className="font-montserrat font-700 text-text">
                {totalAmount > 0 ? formatPrice(totalAmount) : 'A cotizar'}
              </span>
            </div>
            {items.some((i) => i.tipo === 'diseno') && (
              <p className="font-montserrat text-xs text-muted bg-elevated rounded-sm p-3">
                Los diseños personalizados serán cotizados antes del cobro.
              </p>
            )}
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center block text-sm"
            >
              Ir al checkout
            </Link>
            <button
              onClick={closeCart}
              className="btn-secondary w-full text-sm"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
