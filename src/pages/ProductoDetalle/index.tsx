import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Ruler } from 'lucide-react';
import { productos } from '../../data/mockData';
import { formatPrice } from '../../utils';
import LineaBadge from '../../components/shared/LineaBadge';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { useCartStore } from '../../store/cartStore';

export default function ProductoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const producto = productos.find((p) => p.slug === slug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTalla, setSelectedTalla] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [tallaModalOpen, setTallaModalOpen] = useState(false);
  const { addItem, openCart } = useCartStore();

  if (!producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-montserrat text-muted">Producto no encontrado.</p>
        <Link to="/catalogo" className="btn-primary mt-4 inline-block">Volver al catálogo</Link>
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

  const relacionados = productos
    .filter((p) => p.categoria.slug === producto.categoria.slug && p.id !== producto.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-montserrat text-xs text-muted mb-8">
        <Link to="/" className="hover:text-text">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-text">Catálogo</Link>
        <span>/</span>
        <span className="text-text">{producto.nombre}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-[3/4] overflow-hidden rounded-sm bg-elevated">
            <img
              src={producto.imagenes[selectedImage]?.imagen}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            {producto.imagenes.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={`w-20 h-24 overflow-hidden rounded-sm border-2 transition-colors flex-shrink-0 ${
                  selectedImage === i ? 'border-primary' : 'border-border'
                }`}
              >
                <img src={img.imagen} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LineaBadge linea={producto.linea} />
              <span className="font-montserrat text-xs text-muted">{producto.categoria.nombre}</span>
              {producto.nuevo && (
                <span className="text-xs font-montserrat font-700 uppercase bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                  Nuevo
                </span>
              )}
            </div>
            <h1 className="font-italiana text-4xl text-text mb-4">{producto.nombre}</h1>
            <div className="flex items-baseline gap-3">
              <span className="font-montserrat font-700 text-2xl text-primary">
                {formatPrice(producto.precio_oferta ?? producto.precio)}
              </span>
              {producto.precio_oferta && (
                <span className="font-montserrat text-base text-ghost line-through">
                  {formatPrice(producto.precio)}
                </span>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-border" />

          {/* Color selector */}
          <div>
            <p className="font-montserrat font-600 text-sm text-text mb-3">
              Color: <span className="font-400 text-muted">{selectedColor || 'Selecciona'}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {coloresUnicos.map((v) => (
                <button
                  key={v.color}
                  onClick={() => { setSelectedColor(v.color); setSelectedTalla(''); }}
                  title={v.color}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === v.color ? 'border-primary scale-110' : 'border-border hover:border-muted'
                  }`}
                  style={{ backgroundColor: v.color_hex }}
                />
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-montserrat font-600 text-sm text-text">
                Talla: <span className="font-400 text-muted">{selectedTalla || 'Selecciona'}</span>
              </p>
              <button
                onClick={() => setTallaModalOpen(true)}
                className="flex items-center gap-1 font-montserrat text-xs text-primary hover:text-primary-dark transition-colors"
              >
                <Ruler size={12} />
                Guía de tallas
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((t) => {
                const available = tallasDisponibles.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => available && setSelectedTalla(t)}
                    disabled={!available}
                    className={`px-4 py-2 border rounded-sm font-montserrat text-sm font-600 transition-all ${
                      selectedTalla === t
                        ? 'border-primary bg-primary/10 text-primary'
                        : available
                        ? 'border-border text-muted hover:border-muted hover:text-text'
                        : 'border-border/30 text-ghost cursor-not-allowed opacity-40'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-montserrat font-600 text-sm text-text mb-3">Cantidad</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-9 h-9 flex items-center justify-center border border-border rounded-sm hover:border-primary hover:text-primary transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="font-montserrat font-600 text-text w-8 text-center">{cantidad}</span>
              <button
                onClick={() => setCantidad(Math.min(varianteSeleccionada?.stock ?? 10, cantidad + 1))}
                className="w-9 h-9 flex items-center justify-center border border-border rounded-sm hover:border-primary hover:text-primary transition-colors"
              >
                <Plus size={14} />
              </button>
              {varianteSeleccionada && (
                <span className="font-montserrat text-xs text-muted ml-2">
                  {varianteSeleccionada.stock} disponibles
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!stockOk || !selectedTalla}
            className={`btn-primary w-full flex items-center justify-center gap-2 py-4 text-sm ${
              (!stockOk || !selectedTalla) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ShoppingBag size={18} />
            {selectedTalla ? 'Agregar al carrito' : 'Selecciona una talla'}
          </button>

          <div className="w-full h-px bg-border" />

          <div>
            <h3 className="font-montserrat font-600 text-sm text-text mb-2">Descripción</h3>
            <p className="font-montserrat text-sm text-muted leading-relaxed">{producto.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relacionados.length > 0 && (
        <div className="mt-20">
          <h2 className="font-italiana text-3xl text-text mb-8">Productos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relacionados.map((p) => <HoverSwapCard key={p.id} producto={p} />)}
          </div>
        </div>
      )}

      {/* Talla guide modal */}
      {tallaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setTallaModalOpen(false)}>
          <div className="bg-card border border-border rounded-sm p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-italiana text-2xl text-text mb-6">Guía de Tallas</h3>
            <table className="w-full font-montserrat text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted py-2 font-600">Talla</th>
                  <th className="text-left text-muted py-2 font-600">Pecho (cm)</th>
                  <th className="text-left text-muted py-2 font-600">Largo (cm)</th>
                </tr>
              </thead>
              <tbody>
                {[['XS','84-88','65'],['S','88-92','67'],['M','92-96','69'],['L','96-100','71'],['XL','100-104','73'],['XXL','104-110','75']].map(([t, p, l]) => (
                  <tr key={t} className="border-b border-border/50">
                    <td className="py-2.5 text-text font-600">{t}</td>
                    <td className="py-2.5 text-muted">{p}</td>
                    <td className="py-2.5 text-muted">{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setTallaModalOpen(false)} className="btn-secondary w-full mt-6 text-sm">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
