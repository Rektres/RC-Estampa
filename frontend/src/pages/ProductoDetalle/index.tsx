import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Ruler, Heart } from 'lucide-react';
import { Modal } from 'react-bootstrap';
import { catalogoApi, favoritosApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { formatPrice } from '../../utils';
import LineaBadge from '../../components/shared/LineaBadge';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useSEO } from '../../hooks/useSEO';

export default function ProductoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: producto, loading } = useAsync(() => catalogoApi.producto(slug!), [slug]);
  const { data: allProd } = useAsync(() => catalogoApi.productosAll(), []);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useSEO({
    title: producto ? `${producto.nombre} | Ropa Urbana` : 'Detalle de Producto',
    description: producto ? producto.descripcion : 'Descubre nuestra colección de ropa urbana personalizada con estampado DTF de alta fidelidad en Santiago de Chile.',
    image: producto?.imagenes?.[0]?.imagen,
    type: 'product',
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTalla, setSelectedTalla] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [tallaModalOpen, setTallaModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favId, setFavId] = useState<number | null>(null);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated && producto) {
      favoritosApi.listar().then((favs) => {
        const found = favs.find((f) => f.producto === producto.id || f.producto_detalle?.id === producto.id);
        if (found) {
          setIsFavorite(true);
          setFavId(found.id);
        } else {
          setIsFavorite(false);
          setFavId(null);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated, producto]);

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
        <Link to="/catalogo" className="btn btn-primary mt-3 d-inline-block">Volver al catálogo</Link>
      </div>
    );
  }

  const coloresUnicos = [...new Map(producto.variantes.map((v) => [v.color, v])).values()];
  const tallasDisponibles = producto.variantes
    .filter((v) => (!selectedColor || v.color === selectedColor) && v.stock > 0)
    .map((v) => v.talla);

  const varianteSeleccionada = producto.variantes.find(
    (v) => v.talla === selectedTalla && (!selectedColor || v.color === selectedColor)
  );

  const stockOk = varianteSeleccionada && varianteSeleccionada.stock > 0;

  function handleAddToCart() {
    if (!varianteSeleccionada) return;
    addItem({
      tipo: 'catalogo',
      id: `prod-${producto!.id}-${varianteSeleccionada.id}`,
      productoId: producto!.id,
      varianteId: varianteSeleccionada.id,
      nombre: producto!.nombre,
      imagen: producto!.imagenes[0]?.imagen ?? '',
      talla: selectedTalla,
      color: selectedColor || varianteSeleccionada.color,
      precio: producto!.precio_oferta ?? producto!.precio,
      cantidad,
      linea: producto!.linea,
    });
    openCart();
  }

  const relacionados = (allProd ?? [])
    .filter((p) => p.categoria.slug === producto.categoria.slug && p.id !== producto.id)
    .slice(0, 4);

  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <div className="d-flex align-items-center gap-2 font-montserrat text-muted mb-5" style={{ fontSize: '0.75rem' }}>
        <Link to="/" className="text-muted text-decoration-none">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="text-muted text-decoration-none">Catálogo</Link>
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
                className={`overflow-hidden rounded border border-2 flex-shrink-0 p-0 bg-transparent ${
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
              <LineaBadge linea={producto.linea} />
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

          <div className="w-100 bg-border" style={{ height: '1px' }} />

          {/* Color selector */}
          <div>
            <p className="font-montserrat fw-semibold small text-text mb-2">
              Color: <span className="fw-normal text-muted">{selectedColor || 'Selecciona'}</span>
            </p>
            <div className="d-flex gap-2 flex-wrap">
              {coloresUnicos.map((v) => (
                <button
                  key={v.color}
                  onClick={() => { setSelectedColor(v.color); setSelectedTalla(''); }}
                  title={v.color}
                  className={`rounded-circle border border-2 p-0 ${
                    selectedColor === v.color ? 'border-primary' : 'border-border'
                  }`}
                  style={{ backgroundColor: v.color_hex, width: '2rem', height: '2rem', ...(selectedColor === v.color ? { transform: 'scale(1.1)' } : {}) }}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <p className="font-montserrat fw-semibold small text-text mb-0">
                Talla: <span className="fw-normal text-muted">{selectedTalla || 'Selecciona'}</span>
              </p>
              <button
                onClick={() => setTallaModalOpen(true)}
                className="d-inline-flex align-items-center gap-1 font-montserrat text-primary bg-transparent border-0 p-0"
                style={{ fontSize: '0.75rem' }}
              >
                <Ruler size={12} />
                Guía de tallas
              </button>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((t) => {
                const available = tallasDisponibles.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => available && setSelectedTalla(t)}
                    disabled={!available}
                    className={`px-3 py-2 border rounded font-montserrat small fw-semibold ${
                      selectedTalla === t
                        ? 'border-primary bg-primary-10 text-primary'
                        : available
                        ? 'border-border text-muted bg-transparent'
                        : 'border-border text-ghost bg-transparent'
                    }`}
                    style={!available ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-montserrat fw-semibold small text-text mb-2">Cantidad</p>
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="d-flex align-items-center justify-content-center border border-border rounded bg-transparent text-text"
                style={{ width: '2.25rem', height: '2.25rem' }}
              >
                <Minus size={14} />
              </button>
              <span className="font-montserrat fw-semibold text-text text-center" style={{ width: '2rem' }}>{cantidad}</span>
              <button
                onClick={() => setCantidad(Math.min(varianteSeleccionada?.stock ?? 10, cantidad + 1))}
                className="d-flex align-items-center justify-content-center border border-border rounded bg-transparent text-text"
                style={{ width: '2.25rem', height: '2.25rem' }}
              >
                <Plus size={14} />
              </button>
              {varianteSeleccionada && (
                <span className="font-montserrat text-muted ms-2" style={{ fontSize: '0.75rem' }}>
                  {varianteSeleccionada.stock} disponibles
                </span>
              )}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!stockOk || !selectedTalla}
              className={`btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3 small ${
                (!stockOk || !selectedTalla) ? 'opacity-50' : ''
              }`}
            >
              <ShoppingBag size={18} />
              {selectedTalla ? 'Agregar al carrito' : 'Selecciona una talla'}
            </button>

            <button
              onClick={async () => {
                if (!isAuthenticated) {
                  navigate('/auth');
                  return;
                }
                if (!producto) return;
                setIsFavLoading(true);
                try {
                  if (isFavorite && favId) {
                    await favoritosApi.eliminar(favId);
                    setIsFavorite(false);
                    setFavId(null);
                  } else {
                    const created = await favoritosApi.agregar({ producto: producto.id });
                    setIsFavorite(true);
                    setFavId(created.id);
                  }
                } catch {
                  // Ignore
                } finally {
                  setIsFavLoading(false);
                }
              }}
              disabled={isFavLoading}
              className={`btn ${isFavorite ? 'btn-primary text-black' : 'btn-outline-secondary'} px-3 d-flex align-items-center justify-content-center`}
              title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <Heart
                size={18}
                fill={isFavorite ? 'currentColor' : 'none'}
                className={isFavorite ? 'text-black' : 'text-primary'}
              />
            </button>
          </div>

          <div className="w-100 bg-border" style={{ height: '1px' }} />

          <div>
            <h3 className="font-montserrat fw-semibold small text-text mb-2">Descripción</h3>
            <p className="font-montserrat small text-muted lh-base mb-0">{producto.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relacionados.length > 0 && (
        <div style={{ marginTop: '5rem' }}>
          <h2 className="font-italiana fs-2 text-text mb-5">Productos relacionados</h2>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
            {relacionados.map((p) => (
              <div key={p.id} className="col">
                <HoverSwapCard producto={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talla guide modal */}
      <Modal show={tallaModalOpen} onHide={() => setTallaModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="font-italiana fs-3">Guía de Tallas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="w-100 font-montserrat" style={{ fontSize: '0.875rem' }}>
            <thead>
              <tr className="border-bottom border-border">
                <th className="text-start text-muted py-2 fw-semibold">Talla</th>
                <th className="text-start text-muted py-2 fw-semibold">Pecho (cm)</th>
                <th className="text-start text-muted py-2 fw-semibold">Largo (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[['XS','84-88','65'],['S','88-92','67'],['M','92-96','69'],['L','96-100','71'],['XL','100-104','73'],['XXL','104-110','75']].map(([t, p, l]) => (
                <tr key={t} className="border-bottom border-border">
                  <td className="py-2 text-text fw-semibold">{t}</td>
                  <td className="py-2 text-muted">{p}</td>
                  <td className="py-2 text-muted">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={() => setTallaModalOpen(false)} className="btn btn-secondary w-100">Cerrar</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
