import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import LineaBadge from './LineaBadge';
import { formatPrice } from '../../utils';
import type { Producto, ProductoVajilla, VarianteProducto } from '../../types';
import { useCartStore } from '../../store/cartStore';

type Props = {
  producto: Producto | ProductoVajilla;
  prefixPath?: string;
};

function isVajilla(p: Producto | ProductoVajilla): p is ProductoVajilla {
  return p.linea === 'drinkware';
}

export default function HoverSwapCard({ producto, prefixPath }: Props) {
  const [hovered, setHovered] = useState(false);
  const touchCount = useRef(0);
  const { openCart, addItem } = useCartStore();
  const path = prefixPath ?? (isVajilla(producto) ? '/drinkware' : '/catalogo');

  const frente = producto.imagenes.find((i) => i.es_frente) ?? producto.imagenes[0];
  const reverso = producto.imagenes.find((i) => i.es_reverso) ?? producto.imagenes[1];

  function handleTouch() {
    touchCount.current += 1;
    if (touchCount.current >= 2) {
      touchCount.current = 0;
      setHovered((h) => !h);
    }
  }

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const variante = producto.variantes[0];
    if (!variante || variante.stock === 0) return;
    const imagen = frente?.imagen ?? '';
    if (isVajilla(producto)) {
      addItem({
        tipo: 'catalogo',
        id: `vajilla-${producto.id}-${variante.id}`,
        productoId: producto.id,
        varianteId: variante.id,
        nombre: producto.nombre,
        imagen,
        talla: '-',
        color: variante.color,
        precio: producto.precio_oferta ?? producto.precio,
        cantidad: 1,
        linea: 'drinkware',
      });
    } else {
      const p = producto as Producto;
      const v = variante as VarianteProducto;
      addItem({
        tipo: 'catalogo',
        id: `prod-${p.id}-${v.id}`,
        productoId: p.id,
        varianteId: v.id,
        nombre: p.nombre,
        imagen,
        talla: v.talla,
        color: v.color,
        precio: p.precio_oferta ?? p.precio,
        cantidad: 1,
        linea: p.linea,
      });
    }
    openCart();
  }

  return (
    <Link
      to={`${path}/${producto.slug}`}
      className="d-block bg-card border border-border rounded overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchEnd={handleTouch}
    >
      {/* Image container — aspect 3/4 */}
      <div className="position-relative overflow-hidden bg-elevated" style={{ aspectRatio: '3/4' }}>
        {/* Front image */}
        {frente && (
          <img
            src={frente.imagen}
            alt={producto.nombre}
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            style={{ opacity: hovered && reverso ? 0 : 1, transition: 'opacity 300ms ease' }}
          />
        )}
        {/* Reverse image */}
        {reverso && (
          <img
            src={reverso.imagen}
            alt={`${producto.nombre} — reverso`}
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            style={{ opacity: hovered ? 1 : 0, transition: 'opacity 300ms ease' }}
          />
        )}

        {/* Hover overlay with price + quick add */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-2"
          style={{ opacity: hovered ? 1 : 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)', transition: 'opacity 0.25s ease' }}
        >
          <div className="d-flex align-items-end justify-content-between gap-2">
            <div>
              <p className="font-montserrat fw-bold text-text small">
                {formatPrice(producto.precio_oferta ?? producto.precio)}
              </p>
              {!isVajilla(producto) && (
                <p className="font-montserrat text-muted" style={{ fontSize: '0.75rem', marginTop: '0.125rem' }}>
                  {[...new Set((producto as Producto).variantes.filter((v) => v.stock > 0).map((v) => v.talla))].join(' · ')}
                </p>
              )}
            </div>
            <button
              onClick={handleQuickAdd}
              className="bg-primary text-black rounded p-2 flex-shrink-0"
              aria-label="Agregar al carrito"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="position-absolute d-flex flex-column gap-1" style={{ top: '0.5rem', left: '0.5rem' }}>
          <LineaBadge linea={producto.linea} size="xs" />
          {producto.nuevo && (
            <span className="font-montserrat fw-bold text-uppercase bg-primary-20 text-primary border border-primary-30 rounded-pill" style={{ fontSize: '10px', letterSpacing: '0.05em', padding: '0.125rem 0.375rem' }}>
              Nuevo
            </span>
          )}
          {producto.precio_oferta && (
            <span className="font-montserrat fw-bold text-uppercase text-danger border rounded-pill" style={{ fontSize: '10px', letterSpacing: '0.05em', padding: '0.125rem 0.375rem', backgroundColor: 'rgba(127,29,29,0.3)', borderColor: 'rgba(153,27,27,0.3)' }}>
              Oferta
            </span>
          )}
        </div>

        {/* Scale on hover */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 pe-none"
          style={{ transform: hovered ? 'scale(1.01)' : 'scale(1)', transition: 'transform 250ms ease' }}
        />
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="font-montserrat fw-medium text-text small text-truncate">{producto.nombre}</p>
        <div className="d-flex align-items-center gap-2 mt-1">
          <span className="font-montserrat fw-bold small text-primary">
            {formatPrice(producto.precio_oferta ?? producto.precio)}
          </span>
          {producto.precio_oferta && (
            <span className="font-montserrat text-ghost text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
              {formatPrice(producto.precio)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
