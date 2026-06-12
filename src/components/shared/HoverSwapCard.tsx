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
      className="group block bg-card border border-border rounded-sm overflow-hidden hover:border-border/80 transition-all duration-250"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchEnd={handleTouch}
    >
      {/* Image container — aspect 3/4 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-elevated">
        {/* Front image */}
        {frente && (
          <img
            src={frente.imagen}
            alt={producto.nombre}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: hovered && reverso ? 0 : 1, transition: 'opacity 300ms ease' }}
          />
        )}
        {/* Reverse image */}
        {reverso && (
          <img
            src={reverso.imagen}
            alt={`${producto.nombre} — reverso`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: hovered ? 1 : 0, transition: 'opacity 300ms ease' }}
          />
        )}

        {/* Hover overlay with price + quick add */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-250"
          style={{ opacity: hovered ? 1 : 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)' }}
        >
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-montserrat font-700 text-text text-sm">
                {formatPrice(producto.precio_oferta ?? producto.precio)}
              </p>
              {!isVajilla(producto) && (
                <p className="font-montserrat text-xs text-muted mt-0.5">
                  {[...new Set((producto as Producto).variantes.filter((v) => v.stock > 0).map((v) => v.talla))].join(' · ')}
                </p>
              )}
            </div>
            <button
              onClick={handleQuickAdd}
              className="bg-primary text-black rounded-sm p-2 hover:bg-primary-dark transition-colors flex-shrink-0"
              aria-label="Agregar al carrito"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <LineaBadge linea={producto.linea} size="xs" />
          {producto.nuevo && (
            <span className="text-[10px] font-montserrat font-700 uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full">
              Nuevo
            </span>
          )}
          {producto.precio_oferta && (
            <span className="text-[10px] font-montserrat font-700 uppercase tracking-wider bg-red-900/30 text-red-400 border border-red-800/30 px-1.5 py-0.5 rounded-full">
              Oferta
            </span>
          )}
        </div>

        {/* Scale on hover */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: hovered ? 'scale(1.01)' : 'scale(1)', transition: 'transform 250ms ease' }}
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-montserrat font-500 text-sm text-text truncate">{producto.nombre}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-montserrat font-700 text-sm text-primary">
            {formatPrice(producto.precio_oferta ?? producto.precio)}
          </span>
          {producto.precio_oferta && (
            <span className="font-montserrat text-xs text-ghost line-through">
              {formatPrice(producto.precio)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
