import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Droplets, Sparkles, Heart, Check } from 'lucide-react';
import { catalogoApi, favoritosApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { formatPrice } from '../../utils';
import LineaBadge from '../../components/shared/LineaBadge';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function VajillaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: producto, loading } = useAsync(() => catalogoApi.drinkwareItem(slug!), [slug]);
  const { data: allVaj } = useAsync(() => catalogoApi.drinkwareAll(), []);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [favSaved, setFavSaved] = useState(false);
  const { addItem, openCart } = useCartStore();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <p className="font-montserrat text-muted">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container py-5 text-center">
        <p className="font-montserrat text-muted">Producto no encontrado.</p>
        <Link to="/drinkware" className="btn btn-primary mt-3 d-inline-block">Volver a Drinkware</Link>
      </div>
    );
  }

  const varianteSeleccionada = producto.variantes.find((v) =>
    selectedColor ? v.color === selectedColor : true
  ) ?? producto.variantes[0];

  function handleAddToCart() {
    if (!varianteSeleccionada) return;
    addItem({
      tipo: 'catalogo',
      id: `vajilla-${producto!.id}-${varianteSeleccionada.id}`,
      productoId: producto!.id,
      varianteId: varianteSeleccionada.id,
      nombre: producto!.nombre,
      imagen: producto!.imagenes[0]?.imagen ?? '',
      talla: '-',
      color: varianteSeleccionada.color,
      precio: producto!.precio_oferta ?? producto!.precio,
      cantidad,
      linea: 'drinkware',
    });
    openCart();
  }

  const relacionados = (allVaj ?? [])
    .filter((p) => p.categoria.slug === producto.categoria.slug && p.id !== producto.id)
    .slice(0, 4);

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center gap-2 font-montserrat text-muted mb-5" style={{ fontSize: '0.75rem' }}>
        <Link to="/" className="text-muted text-decoration-none">Inicio</Link>
        <span>/</span>
        <Link to="/drinkware" className="text-muted text-decoration-none">Drinkware</Link>
        <span>/</span>
        <span className="text-text">{producto.nombre}</span>
      </div>

      <div className="row g-5">
        {/* Gallery */}
        <div className="col-12 col-lg-6 d-flex flex-column gap-3">
          <div className="overflow-hidden rounded bg-elevated" style={{ aspectRatio: '3/4' }}>
            <img
              src={producto.imagenes[selectedImage]?.imagen}
              alt={producto.nombre}
              className="w-100 h-100 object-fit-cover"
            />
          </div>
          <div className="d-flex gap-2">
            {producto.imagenes.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={`overflow-hidden rounded border border-2 p-0 bg-transparent ${
                  selectedImage === i ? 'border-primary' : 'border-border'
                }`}
                style={{ width: '5rem', height: '6rem' }}
              >
                <img src={img.imagen} alt="" className="w-100 h-100 object-fit-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="col-12 col-lg-6 d-flex flex-column gap-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <LineaBadge linea="drinkware" />
              <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>{producto.categoria.nombre}</span>
              {producto.nuevo && (
                <span className="font-montserrat fw-bold text-uppercase bg-primary-20 text-primary border border-primary-30 px-2 rounded-pill" style={{ fontSize: '0.75rem', paddingTop: '0.125rem', paddingBottom: '0.125rem' }}>
                  Nuevo
                </span>
              )}
            </div>
            <h1 className="font-italiana fs-1 text-text mb-3">{producto.nombre}</h1>
            <div className="d-flex align-items-baseline gap-2">
              <span className="font-montserrat fw-bold fs-3 text-primary">
                {formatPrice(producto.precio_oferta ?? producto.precio)}
              </span>
              {producto.precio_oferta && (
                <span className="font-montserrat text-ghost text-decoration-line-through">
                  {formatPrice(producto.precio)}
                </span>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="d-flex flex-wrap gap-3">
            <div className="d-flex align-items-center gap-2 bg-elevated px-3 py-2 rounded">
              <Droplets size={14} className="text-drinkware" />
              <span className="font-montserrat small text-text">{producto.material}</span>
            </div>
            {producto.capacidad_ml && (
              <div className="d-flex align-items-center gap-2 bg-elevated px-3 py-2 rounded">
                <span className="font-montserrat small text-text">{producto.capacidad_ml} ml</span>
              </div>
            )}
          </div>

          <div className="w-100 bg-border" style={{ height: '1px' }} />

          {/* Color selector */}
          <div>
            <p className="font-montserrat fw-semibold small text-text mb-2">
              Color: <span className="fw-normal text-muted">{selectedColor || varianteSeleccionada?.color}</span>
            </p>
            <div className="d-flex gap-2 flex-wrap">
              {producto.variantes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedColor(v.color)}
                  title={v.color}
                  className={`rounded-circle border border-2 p-0 ${
                    (selectedColor || varianteSeleccionada?.color) === v.color
                      ? 'border-primary'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: v.color_hex, width: '2rem', height: '2rem', ...((selectedColor || varianteSeleccionada?.color) === v.color ? { transform: 'scale(1.1)' } : {}) }}
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-montserrat fw-semibold small text-text mb-2">Cantidad</p>
            <div className="d-flex align-items-center gap-2">
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="d-flex align-items-center justify-content-center border border-border rounded bg-transparent text-text" style={{ width: '2.25rem', height: '2.25rem' }}>
                <Minus size={14} />
              </button>
              <span className="font-montserrat fw-semibold text-text text-center" style={{ width: '2rem' }}>{cantidad}</span>
              <button onClick={() => setCantidad(Math.min(varianteSeleccionada?.stock ?? 10, cantidad + 1))} className="d-flex align-items-center justify-content-center border border-border rounded bg-transparent text-text" style={{ width: '2.25rem', height: '2.25rem' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button onClick={handleAddToCart} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3 small">
              <ShoppingBag size={18} />
              Agregar al carrito
            </button>

            <button
              onClick={async () => {
                if (!isAuthenticated) {
                  navigate('/auth');
                  return;
                }
                try {
                  await favoritosApi.agregar({ drinkware: producto.id });
                  setFavSaved(true);
                  setTimeout(() => setFavSaved(false), 3000);
                } catch {
                  // Ignore
                }
              }}
              className={`btn ${favSaved ? 'btn-success' : 'btn-outline-secondary'} px-3 d-flex align-items-center justify-content-center`}
              title="Guardar en favoritos"
            >
              {favSaved ? <Check size={18} /> : <Heart size={18} className="text-primary" />}
            </button>
          </div>

          {/* CTA diseñador */}
          <div className="bg-elevated border border-border rounded p-3 d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary-20 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem' }}>
              <Sparkles size={18} className="text-primary" />
            </div>
            <div className="flex-grow-1">
              <p className="font-montserrat fw-semibold small text-text mb-0">¿Quieres tu propio diseño?</p>
              <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>Créalo en nuestro editor</p>
            </div>
            <Link to="/disenar" className="btn btn-secondary px-3 py-2" style={{ fontSize: '0.75rem' }}>Diseñar</Link>
          </div>

          <div className="w-100 bg-border" style={{ height: '1px' }} />
          <div>
            <h3 className="font-montserrat fw-semibold small text-text mb-2">Descripción</h3>
            <p className="font-montserrat small text-muted lh-base mb-0">{producto.descripcion}</p>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <div style={{ marginTop: '5rem' }}>
          <h2 className="font-italiana fs-2 text-text mb-5">Productos relacionados</h2>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
            {relacionados.map((p) => (
              <div key={p.id} className="col">
                <HoverSwapCard producto={p} prefixPath="/drinkware" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
