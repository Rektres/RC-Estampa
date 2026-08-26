import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Sparkles, Heart } from 'lucide-react';
import LineaBadge from './LineaBadge';
import { formatPrice } from '../../utils';
import type { Producto, ProductoVajilla, VarianteProducto } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { favoritosApi } from '../../api';

type Props = {
  producto: Producto | ProductoVajilla;
  prefixPath?: string;
  onOpenSpecs?: (producto: Producto | ProductoVajilla) => void;
};

function isVajilla(p: Producto | ProductoVajilla): p is ProductoVajilla {
  return p.linea === 'drinkware';
}

export default function HoverSwapCard({ producto, prefixPath, onOpenSpecs }: Props) {
  const [hovered, setHovered] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState<number | null>(null);
  const touchCount = useRef(0);
  const { openCart, addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
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

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      if (isFav && favId) {
        await favoritosApi.eliminar(favId);
        setIsFav(false);
        setFavId(null);
      } else {
        const payload = isVajilla(producto) ? { drinkware: producto.id } : { producto: producto.id };
        const res = await favoritosApi.agregar(payload);
        setIsFav(true);
        setFavId(res.id);
      }
    } catch {
      // Ignore
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

  function handleSpecs(e: React.MouseEvent) {
    if (onOpenSpecs) {
      e.preventDefault();
      e.stopPropagation();
      onOpenSpecs(producto);
    }
  }

  return (
    <div className="stage-card h-100 d-flex flex-column">
      <Link
        to={`${path}/${producto.slug}`}
        className="d-flex flex-column text-decoration-none h-100"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchEnd={handleTouch}
      >
        {/* Image container — aspect 3/4 */}
        <div className="position-relative overflow-hidden bg-elevated" style={{ aspectRatio: '3/4' }}>
          {/* Botón flotante de favoritos */}
          <button
            onClick={handleToggleFavorite}
            className="btn p-2 rounded-circle position-absolute top-0 end-0 m-2 border-0 d-flex align-items-center justify-content-center hover-lift"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(6px)',
              zIndex: 10,
              width: '2rem',
              height: '2rem',
            }}
            title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            aria-label="Favorito"
          >
            <Heart
              size={14}
              fill={isFav ? 'var(--brand-primary)' : 'none'}
              color={isFav ? 'var(--brand-primary)' : '#ffffff'}
            />
          </button>

          {/* Front image */}
          {frente && (
            <img
              src={frente.imagen}
              alt={producto.nombre}
              className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover stage-card-img"
              style={{ opacity: hovered && reverso ? 0 : 1, transition: 'opacity 350ms ease, transform 500ms ease' }}
            />
          )}
          {/* Reverse image */}
          {reverso && (
            <img
              src={reverso.imagen}
              alt={`${producto.nombre} — reverso`}
              className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover stage-card-img"
              style={{ opacity: hovered ? 1 : 0, transition: 'opacity 350ms ease, transform 500ms ease' }}
            />
          )}

          {/* Dynamic satin bottom overlay */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-3 stage-card-overlay"
            style={{
              opacity: hovered ? 1 : 0,
            }}
          >
            <div className="d-flex align-items-center justify-content-between gap-2">
              {onOpenSpecs && (
                <button
                  onClick={handleSpecs}
                  className="btn btn-secondary btn-sm py-1 px-2 d-flex align-items-center gap-1 font-montserrat"
                  style={{ fontSize: '0.7rem' }}
                >
                  <Eye size={13} />
                  <span>Especificaciones</span>
                </button>
              )}
              <button
                onClick={handleQuickAdd}
                className="btn btn-primary btn-sm p-2 d-flex align-items-center justify-content-center rounded-3 ms-auto"
                aria-label="Agregar al carrito"
                title="Agregar al carrito"
              >
                <ShoppingBag size={15} />
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="position-absolute d-flex flex-column gap-1" style={{ top: '0.65rem', left: '0.65rem' }}>
            <LineaBadge linea={producto.linea} size="xs" />
            {producto.nuevo && (
              <span
                className="font-montserrat fw-bold text-uppercase bg-primary-10 text-primary border border-primary-30 rounded-pill d-inline-flex align-items-center gap-1"
                style={{ fontSize: '9px', letterSpacing: '0.08em', padding: '0.15rem 0.45rem', backdropFilter: 'blur(6px)' }}
              >
                <Sparkles size={10} /> NUEVO
              </span>
            )}
            {producto.precio_oferta && (
              <span
                className="font-montserrat fw-bold text-uppercase text-white rounded-pill"
                style={{
                  fontSize: '9px',
                  letterSpacing: '0.08em',
                  padding: '0.15rem 0.45rem',
                  backgroundColor: 'rgba(220, 38, 38, 0.85)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                OFERTA
              </span>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
          <div>
            <p className="font-montserrat fw-semibold text-text small mb-1 text-truncate lh-sm">
              {producto.nombre}
            </p>
            {!isVajilla(producto) && (
              <span className="font-montserrat text-muted d-block text-truncate" style={{ fontSize: '0.72rem' }}>
                Tallas: {[...new Set((producto as Producto).variantes.filter((v) => v.stock > 0).map((v) => v.talla))].join(' · ') || 'Consultar'}
              </span>
            )}
          </div>

          <div className="d-flex align-items-baseline gap-2 mt-2 pt-2 border-top border-border">
            <span className="font-montserrat fw-bold text-primary" style={{ fontSize: '0.95rem' }}>
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
    </div>
  );
}

