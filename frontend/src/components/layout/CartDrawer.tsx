import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();
  const totalAmount = total();

  return (
    <Offcanvas
      show={isOpen}
      onHide={closeCart}
      placement="end"
      style={{ maxWidth: '24rem', width: '100%' }}
    >
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-border flex-shrink-0">
          <div className="d-flex align-items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            <h2 className="font-montserrat fw-semibold text-text mb-0 fs-6">
              Carrito {items.length > 0 && `(${items.length})`}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="btn btn-link p-1 text-muted text-decoration-none rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-grow-1 overflow-y-auto py-3">
          {items.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 gap-3 px-4">
              <ShoppingBag size={48} className="text-ghost" />
              <p className="font-montserrat text-muted text-center">
                Tu carrito está vacío
              </p>
              <button
                onClick={closeCart}
                className="btn btn-secondary btn-sm px-3"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <ul className="list-unstyled mb-0">
              {items.map((item) => (
                <li key={item.id} className="d-flex gap-3 px-4 py-3 border-bottom border-border">
                  <div
                    className="position-relative flex-shrink-0 overflow-hidden rounded bg-elevated"
                    style={{ width: '4rem', height: '5rem' }}
                  >
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-100 h-100 object-fit-cover"
                    />
                    {item.tipo === 'diseno' && (
                      <span
                        className="position-absolute bg-primary text-black font-montserrat fw-bold px-1 rounded"
                        style={{ top: '0.25rem', left: '0.25rem', fontSize: '9px' }}
                      >
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="font-montserrat fw-medium small text-text text-truncate">
                      {item.nombre}
                    </p>
                    {item.tipo === 'catalogo' && (
                      <p className="font-montserrat text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        {item.talla} · {item.color}
                      </p>
                    )}
                    {item.tipo === 'diseno' && (
                      <p className="font-montserrat text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                        {item.prenda} · T{item.talla}
                      </p>
                    )}
                    <p className="font-montserrat fw-bold small text-primary mt-1">
                      {item.precio ? formatPrice(item.precio * item.cantidad) : 'A cotizar'}
                    </p>
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="d-flex align-items-center justify-content-center border border-border rounded bg-transparent text-text p-0"
                        style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-montserrat small text-text text-center" style={{ width: '1.5rem' }}>
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="d-flex align-items-center justify-content-center border border-border rounded bg-transparent text-text p-0"
                        style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ms-auto text-ghost bg-transparent border-0 p-0"
                        style={{ cursor: 'pointer' }}
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
          <div className="border-top border-border px-4 py-3 flex-shrink-0 d-flex flex-column gap-2">
            <div className="d-flex justify-content-between align-items-center">
              <span className="font-montserrat small text-muted">Subtotal</span>
              <span className="font-montserrat fw-bold text-text">
                {totalAmount > 0 ? formatPrice(totalAmount) : 'A cotizar'}
              </span>
            </div>
            {items.some((i) => i.tipo === 'diseno') && (
              <p className="font-montserrat text-muted bg-elevated rounded p-2" style={{ fontSize: '0.75rem' }}>
                Los diseños personalizados serán cotizados antes del cobro.
              </p>
            )}
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn btn-primary btn-sm w-100 text-center d-block"
            >
              Ir al checkout
            </Link>
            <button
              onClick={closeCart}
              className="btn btn-secondary btn-sm w-100"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </Offcanvas>
  );
}
