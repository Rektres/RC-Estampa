import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Droplets, Sparkles } from 'lucide-react';
import { productosVajilla } from '../../data/mockData';
import { formatPrice } from '../../utils';
import LineaBadge from '../../components/shared/LineaBadge';
import HoverSwapCard from '../../components/shared/HoverSwapCard';
import { useCartStore } from '../../store/cartStore';

export default function VajillaDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const producto = productosVajilla.find((p) => p.slug === slug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const { addItem, openCart } = useCartStore();

  if (!producto) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-montserrat text-muted">Producto no encontrado.</p>
        <Link to="/drinkware" className="btn-primary mt-4 inline-block">Volver a Drinkware</Link>
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

  const relacionados = productosVajilla
    .filter((p) => p.categoria.slug === producto.categoria.slug && p.id !== producto.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 font-montserrat text-xs text-muted mb-8">
        <Link to="/" className="hover:text-text">Inicio</Link>
        <span>/</span>
        <Link to="/drinkware" className="hover:text-text">Drinkware</Link>
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
                className={`w-20 h-24 overflow-hidden rounded-sm border-2 transition-colors ${
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
              <LineaBadge linea="drinkware" />
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

          {/* Specs */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-elevated px-3 py-2 rounded-sm">
              <Droplets size={14} className="text-drinkware" />
              <span className="font-montserrat text-sm text-text">{producto.material}</span>
            </div>
            {producto.capacidad_ml && (
              <div className="flex items-center gap-2 bg-elevated px-3 py-2 rounded-sm">
                <span className="font-montserrat text-sm text-text">{producto.capacidad_ml} ml</span>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-border" />

          {/* Color selector */}
          <div>
            <p className="font-montserrat font-600 text-sm text-text mb-3">
              Color: <span className="font-400 text-muted">{selectedColor || varianteSeleccionada?.color}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {producto.variantes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedColor(v.color)}
                  title={v.color}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    (selectedColor || varianteSeleccionada?.color) === v.color
                      ? 'border-primary scale-110'
                      : 'border-border hover:border-muted'
                  }`}
                  style={{ backgroundColor: v.color_hex }}
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-montserrat font-600 text-sm text-text mb-3">Cantidad</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-9 h-9 flex items-center justify-center border border-border rounded-sm hover:border-primary transition-colors">
                <Minus size={14} />
              </button>
              <span className="font-montserrat font-600 text-text w-8 text-center">{cantidad}</span>
              <button onClick={() => setCantidad(Math.min(varianteSeleccionada?.stock ?? 10, cantidad + 1))} className="w-9 h-9 flex items-center justify-center border border-border rounded-sm hover:border-primary transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button onClick={handleAddToCart} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-sm">
            <ShoppingBag size={18} />
            Agregar al carrito
          </button>

          {/* CTA diseñador */}
          <div className="bg-elevated border border-border rounded-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-montserrat font-600 text-sm text-text">¿Quieres tu propio diseño?</p>
              <p className="font-montserrat text-xs text-muted">Créalo en nuestro editor</p>
            </div>
            <Link to="/disenar" className="btn-secondary text-xs px-3 py-2">Diseñar</Link>
          </div>

          <div className="w-full h-px bg-border" />
          <div>
            <h3 className="font-montserrat font-600 text-sm text-text mb-2">Descripción</h3>
            <p className="font-montserrat text-sm text-muted leading-relaxed">{producto.descripcion}</p>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <div className="mt-20">
          <h2 className="font-italiana text-3xl text-text mb-8">Productos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relacionados.map((p) => <HoverSwapCard key={p.id} producto={p} prefixPath="/drinkware" />)}
          </div>
        </div>
      )}
    </div>
  );
}
