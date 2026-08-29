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
  producto?: Producto | ProductoVajilla;
  item?: Producto | ProductoVajilla;
  prefixPath?: string;
  onOpenSpecs?: (producto: Producto | ProductoVajilla) => void;
};

function isVajilla(p: Producto | ProductoVajilla): p is ProductoVajilla {
  return p.linea === 'drinkware' || (p as any).tipoItem === 'drinkware';
}

export default function HoverSwapCard({ producto, item, prefixPath, onOpenSpecs }: Props) {
  const [hovered, setHovered] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState<number | null>(null);
  const touchCount = useRef(0);
  const { openCart, addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const prod = producto ?? item;
  if (!prod) return null;

  const path = prefixPath ?? (isVajilla(prod) ? '/drinkware' : '/catalogo');

  const imagenes = prod.imagenes || [];
  const frente = imagenes.find((i) => i.es_frente) ?? imagenes[0];
  const reverso = imagenes.find((i) => i.es_reverso) ?? imagenes[1] ?? frente;

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
        const payload = isVajilla(prod) ? { drinkware: prod.id } : { producto: prod.id };
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
    const variantes = prod.variantes || [];
    const variante = variantes[0];
    if (!variante || variante.stock === 0) return;
    const imagen = frente?.imagen ?? '';
    if (isVajilla(prod)) {
      addItem({
        tipo: 'catalogo',
        id: `vajilla-${prod.id}-${variante.id}`,
        productoId: prod.id,
        varianteId: variante.id,
        nombre: prod.nombre,
        imagen,
        talla: '-',
        color: variante.color,
        precio: prod.precio_oferta ?? prod.precio,
        cantidad: 1,
        linea: 'drinkware',
      });
    } else {
      const p = prod as Producto;
      const v = variante as VarianteProducto;
      addItem({
        tipo: 'catalogo',
        id: `prod-${p.id}-${v.id}`,
        productoId: p.id,
        varianteId: v.id,
        nombre: p.nombre,
        imagen,
        talla: v.talla || '-',
        color: v.color,
        precio: p.precio_oferta ?? p.precio,
        cantidad: 1,
        linea: p.linea || 'urbana',
      });
    }
    openCart();
  }

  function handleSpecs(e: React.MouseEvent) {
    if (onOpenSpecs) {
      e.preventDefault();
      e.stopPropagation();
      onOpenSpecs(prod);
    }
  }

  const variantes = prod.variantes || [];
  const hayStock = variantes.some((v) => v.stock > 0);

  return (
    <div className="stage-card h-100 d-flex flex-column">
      <Link
        to={`${path}/${prod.slug}`}
        className="d-flex flex-column text-decoration-none h-100"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchEnd={handleTouch}
      >
        {/* Contenedor de Imagen con Efecto Swap */}
        <div className="position-relative overflow-hidden stage-card-image-wrap bg-elevated rounded-top-3">
          {/* Badges superiores */}
          <div
            className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1"
            style={{ zIndex: 3 }}
          >
            <LineaBadge linea={prod.linea} size="xs" />
            {prod.precio_oferta && (
              <span
                className="badge bg-danger text-white fw-bold font-montserrat"
                style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}
              >
                OFERTA
              </span>
            )}
            {prod.nuevo && (
              <span
                className="badge bg-primary text-black fw-bold font-montserrat"
                style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}
              >
                NUEVO
              </span>
            )}
          </div>

          {/* Botón Favorito */}
          <button
            onClick={handleToggleFavorite}
            className={`position-absolute top-0 end-0 m-2 btn btn-sm rounded-circle p-2 transition-all ${
              isFav
                ? 'bg-danger text-white border-0'
                : 'bg-black bg-opacity-50 text-white border-0 hover-lift'
            }`}
            style={{ zIndex: 3, width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            aria-label="Favorito"
          >
            <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
          </button>

          {/* Imagen Frente */}
          <div
            className="w-100 h-100 position-absolute top-0 start-0 transition-all"
            style={{
              opacity: hovered && reverso && reverso.imagen !== frente?.imagen ? 0 : 1,
              transition: 'opacity 0.35s ease-in-out',
            }}
          >
            {frente?.imagen ? (
              <img
                src={frente.imagen}
                alt={prod.nombre}
                className="w-100 h-100 object-fit-cover transition-all"
                style={{
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.4s ease-out',
                }}
                loading="lazy"
              />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted font-montserrat small">
                <ShoppingBag size={32} className="opacity-50" />
              </div>
            )}
          </div>

          {/* Imagen Reverso (Hover Swap) */}
          {reverso && reverso.imagen !== frente?.imagen && (
            <div
              className="w-100 h-100 position-absolute top-0 start-0 transition-all"
              style={{
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.35s ease-in-out',
              }}
            >
              <img
                src={reverso.imagen}
                alt={`${prod.nombre} - vista secundaria`}
                className="w-100 h-100 object-fit-cover transition-all"
                style={{
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.4s ease-out',
                }}
                loading="lazy"
              />
            </div>
          )}

          {/* Overlay de Acciones Rápidas en Hover */}
          <div
            className="position-absolute bottom-0 start-0 end-0 p-2 d-flex gap-1 justify-content-center transition-all"
            style={{
              zIndex: 3,
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
              opacity: hovered ? 1 : 0,
              transition: 'all 0.25s ease-in-out',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
            }}
          >
            {onOpenSpecs && (
              <button
                onClick={handleSpecs}
                className="btn btn-sm btn-dark bg-opacity-90 font-montserrat d-inline-flex align-items-center gap-1 border-border"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                title="Ver ficha técnica"
              >
                <Eye size={12} />
                <span>Specs</span>
              </button>
            )}

            {hayStock && (
              <button
                onClick={handleQuickAdd}
                className="btn btn-sm btn-primary font-montserrat fw-bold d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                title="Añadir directo al carrito"
              >
                <ShoppingBag size={12} />
                <span>Añadir</span>
              </button>
            )}
          </div>
        </div>

        {/* Información del Producto */}
        <div className="p-3 bg-surface rounded-bottom-3 d-flex flex-column justify-content-between flex-grow-1 border border-top-0 border-border">
          <div>
            <span
              className="font-montserrat text-muted text-uppercase d-block mb-1 text-truncate"
              style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}
            >
              {prod.categoria?.nombre || (isVajilla(prod) ? 'Drinkware' : 'Textil')}
            </span>
            <h3
              className="font-montserrat fw-semibold text-text fs-6 mb-2 text-truncate"
              title={prod.nombre}
            >
              {prod.nombre}
            </h3>
          </div>

          <div className="pt-2 border-top border-border d-flex align-items-center justify-content-between font-montserrat">
            <div>
              <span className="text-primary fw-bold fs-6">
                {formatPrice(prod.precio_oferta ?? prod.precio)}
              </span>
              {prod.precio_oferta && (
                <span
                  className="text-muted text-decoration-line-through small ms-2"
                  style={{ fontSize: '0.72rem' }}
                >
                  {formatPrice(prod.precio)}
                </span>
              )}
            </div>

            {/* Muestras de Color */}
            <div className="d-flex gap-1">
              {variantes.slice(0, 4).map((v) => (
                <span
                  key={v.id}
                  className="rounded-circle border border-secondary"
                  style={{
                    width: '0.75rem',
                    height: '0.75rem',
                    backgroundColor: v.color_hex,
                  }}
                  title={v.color}
                />
              ))}
              {variantes.length > 4 && (
                <span className="text-muted small" style={{ fontSize: '0.65rem' }}>
                  +{variantes.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
