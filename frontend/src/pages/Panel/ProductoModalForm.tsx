import { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Check,
  Sparkles,
  Shirt,
  Coffee,
  Package,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Tag,
  AlertCircle,
  Star,
  Flame,
} from 'lucide-react';
import { panelApi } from '../../api';
import type { Producto, ProductoVajilla, ProductoInput, Categoria } from '../../types';

interface Props {
  show: boolean;
  tipo: 'ropa' | 'drinkware';
  productoId: number | null;
  onHide: () => void;
  onSuccess: () => void;
}

const VARIANTE_DEFAULT = { talla: 'M', color: 'Negro', color_hex: '#111111', stock: '10', sku: '' };
const IMAGEN_DEFAULT = { imagen: '', es_principal: true, es_frente: true, es_reverso: false };

export default function ProductoModalForm({ show, tipo, productoId, onHide, onSuccess }: Props) {
  const esRopa = tipo === 'ropa';
  const esEdicion = !!productoId;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [lineasDisponibles, setLineasDisponibles] = useState<{ linea: string; nombre: string; es_sin_categoria?: boolean }[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subiendoIdx, setSubiendoIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [precioOferta, setPrecioOferta] = useState('');
  const [linea, setLinea] = useState(esRopa ? 'urbana' : 'drinkware');
  const [categoriaId, setCategoriaId] = useState('');
  const [material, setMaterial] = useState('');
  const [capacidadMl, setCapacidadMl] = useState('');
  const [activo, setActivo] = useState(true);
  const [destacado, setDestacado] = useState(false);
  const [nuevo, setNuevo] = useState(false);

  const [variantes, setVariantes] = useState<any[]>([{ ...VARIANTE_DEFAULT }]);
  const [imagenes, setImagenes] = useState<any[]>([{ ...IMAGEN_DEFAULT }]);

  useEffect(() => {
    if (!show) return;
    panelApi.categorias.list().then((cats) => {
      setCategorias(Array.isArray(cats) ? cats : []);
    }).catch(() => setCategorias([]));

    panelApi.lineas.list().then((lins) => {
      if (Array.isArray(lins)) {
        setLineasDisponibles(lins);
        if (!productoId && lins.length > 0) {
          const primera = esRopa ? (lins.find((l) => l.linea === 'urbana') || lins[0]) : (lins.find((l) => l.linea === 'drinkware') || lins[0]);
          setLinea(primera.linea);
        }
      }
    }).catch(() => setLineasDisponibles([]));
  }, [show, esRopa, productoId]);

  useEffect(() => {
    if (!show) return;
    if (esEdicion && productoId) {
      setLoadingInitial(true);
      setError(null);
      const recurso = esRopa ? panelApi.productos : panelApi.drinkware;
      recurso.get(productoId)
        .then((prod: Producto | ProductoVajilla) => {
          setNombre(prod.nombre || '');
          setSlug(prod.slug || '');
          setDescripcion(prod.descripcion || '');
          setPrecio(String(prod.precio || ''));
          setPrecioOferta(prod.precio_oferta ? String(prod.precio_oferta) : '');
          setLinea(prod.linea || (esRopa ? 'urbana' : 'drinkware'));

          const catId = typeof prod.categoria === 'object' && prod.categoria ? prod.categoria.id : prod.categoria;
          setCategoriaId(catId ? String(catId) : '');

          if (!esRopa && 'material' in prod) {
            setMaterial(prod.material || '');
            setCapacidadMl(prod.capacidad_ml ? String(prod.capacidad_ml) : '');
          }

          setActivo(prod.activo ?? true);
          setDestacado(prod.destacado ?? false);
          setNuevo(prod.nuevo ?? false);

          if (prod.variantes && prod.variantes.length > 0) {
            setVariantes(prod.variantes.map((v) => ({
              talla: 'talla' in v ? (v as any).talla : '',
              color: v.color || '',
              color_hex: v.color_hex || '#111111',
              stock: String(v.stock || 0),
              sku: v.sku || '',
            })));
          } else {
            setVariantes([{ ...VARIANTE_DEFAULT }]);
          }

          if (prod.imagenes && prod.imagenes.length > 0) {
            setImagenes(prod.imagenes.map((img) => ({
              imagen: img.imagen || '',
              es_principal: img.es_principal ?? false,
              es_frente: img.es_frente ?? false,
              es_reverso: img.es_reverso ?? false,
            })));
          } else {
            setImagenes([{ ...IMAGEN_DEFAULT }]);
          }
        })
        .catch(() => setError('No se pudo cargar la información del producto.'))
        .finally(() => setLoadingInitial(false));
    } else {
      setNombre('');
      setSlug('');
      setDescripcion('');
      setPrecio('');
      setPrecioOferta('');
      setLinea(esRopa ? 'urbana' : 'drinkware');
      setIsCustomLinea(false);
      setCustomLineaName('');
      setCategoriaId('');
      setMaterial('');
      setCapacidadMl('');
      setActivo(true);
      setDestacado(false);
      setNuevo(false);
      setVariantes([{ ...VARIANTE_DEFAULT, sku: `SKU-${Date.now().toString().slice(-5)}` }]);
      setImagenes([{ ...IMAGEN_DEFAULT }]);
      setError(null);
    }
  }, [show, esEdicion, productoId, esRopa]);

  function handleNombreChange(val: string) {
    setNombre(val);
    if (!esEdicion) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  }

  function handleLineaChange(val: string) {
    if (val === 'custom') {
      setIsCustomLinea(true);
      setLinea('custom');
    } else {
      setIsCustomLinea(false);
      setLinea(val);
    }
  }

  async function handleFileUpload(idx: number, file: File | undefined) {
    if (!file) return;
    setSubiendoIdx(idx);
    setError(null);
    try {
      const { url } = await panelApi.upload(file);
      setImagenes((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], imagen: url };
        return next;
      });
    } catch {
      setError('Error al subir archivo (máx 5MB, solo formatos de imagen).');
    } finally {
      setSubiendoIdx(null);
    }
  }

  function addVariante() {
    setVariantes((prev) => [
      ...prev,
      { ...VARIANTE_DEFAULT, sku: `SKU-${Date.now().toString().slice(-5)}` },
    ]);
  }

  function removeVariante(idx: number) {
    if (variantes.length <= 1) return;
    setVariantes((prev) => prev.filter((_, i) => i !== idx));
  }

  function addImagen() {
    setImagenes((prev) => [
      ...prev,
      { imagen: '', es_principal: false, es_frente: false, es_reverso: false },
    ]);
  }

  function removeImagen(idx: number) {
    if (imagenes.length <= 1) return;
    setImagenes((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) { setError('El nombre del producto es obligatorio.'); return; }
    if (!descripcion.trim()) { setError('La descripción es obligatoria.'); return; }
    if (!precio || isNaN(Number(precio))) { setError('Ingresa un precio normal válido.'); return; }
    if (!categoriaId) { setError('Selecciona una categoría.'); return; }

    const payload: ProductoInput = {
      nombre: nombre.trim(),
      slug: slug.trim() || undefined,
      descripcion: descripcion.trim(),
      precio: Number(precio),
      precio_oferta: precioOferta ? Number(precioOferta) : null,
      activo,
      destacado,
      nuevo,
      linea: linea as any,
      categoria: Number(categoriaId),
      ...(esRopa ? {} : {
        material: material.trim() || undefined,
        capacidad_ml: capacidadMl ? Number(capacidadMl) : null,
      }),
      variantes: variantes.map((v, i) => ({
        ...(esRopa ? { talla: v.talla || 'M' } : {}),
        color: v.color || 'Color',
        color_hex: v.color_hex || '#111111',
        stock: Number(v.stock) || 0,
        sku: v.sku?.trim() || `SKU-${Date.now().toString().slice(-4)}-${i}`,
      })),
      imagenes: imagenes.filter((img) => img.imagen?.trim()).map((img, idx) => ({
        imagen: img.imagen.trim(),
        es_principal: idx === 0 ? true : img.es_principal,
        es_frente: img.es_frente ?? false,
        es_reverso: img.es_reverso ?? false,
        orden: idx,
      })),
    };

    if (payload.imagenes.length === 0) {
      setError('Debes agregar al menos una imagen para el producto.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const recurso = esRopa ? panelApi.productos : panelApi.drinkware;
      if (esEdicion && productoId) {
        await recurso.update(productoId, payload);
      } else {
        await recurso.create(payload);
      }
      onSuccess();
      onHide();
    } catch (err: any) {
      const detail = err?.response?.data;
      if (typeof detail === 'object') {
        setError(JSON.stringify(detail));
      } else {
        setError('No se pudo guardar el producto. Verifica los campos requeridos.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Body className="p-4 p-md-5 bg-surface border border-border rounded-4 font-montserrat text-text shadow-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom border-border mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle p-2 bg-primary bg-opacity-15 text-primary border border-primary">
              {esRopa ? <Shirt size={22} /> : <Coffee size={22} />}
            </div>
            <div>
              <h3 className="fs-5 fw-bold text-text mb-0">
                {esEdicion ? `Editar Producto #${productoId}` : `Crear Nuevo Producto (${esRopa ? 'Ropa Textil' : 'Drinkware'})`}
              </h3>
              <p className="text-muted small mb-0">
                Configura los datos del producto, stock de variantes y fotos oficiales.
              </p>
            </div>
          </div>
          <button onClick={onHide} className="btn btn-sm btn-outline-secondary p-1 rounded-circle">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-4 d-flex align-items-center gap-2" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loadingInitial ? (
          <div className="py-5 text-center text-muted small">Cargando datos del producto...</div>
        ) : (
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
            {/* SECCIÓN 1: DATOS GENERALES */}
            <div className="p-3 p-md-4 bg-card rounded-3 border border-border">
              <h4 className="fs-6 fw-bold text-text mb-3 d-flex align-items-center gap-2 pb-2 border-bottom border-border">
                <Tag size={16} className="text-primary" /> Datos Generales
              </h4>

              <div className="row g-3">
                <div className="col-12 col-md-7">
                  <label className="form-label small fw-semibold text-muted">Nombre del Producto *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => handleNombreChange(e.target.value)}
                    placeholder="Ej. Polerón Canguro Felpa Oversize"
                    className="form-control bg-elevated text-text border-border"
                    required
                  />
                </div>

                <div className="col-12 col-md-5">
                  <label className="form-label small fw-semibold text-muted">Slug URL (Identificador)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="poleron-canguro-felpa"
                    className="form-control bg-elevated text-text border-border"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">Descripción *</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={2}
                    placeholder="Detalle de materiales, confección y tipo de estampado..."
                    className="form-control bg-elevated text-text border-border"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Categoría *</label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="form-select bg-elevated text-text border-border"
                    required
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.linea})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de Línea Existente */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Línea de Producto / Colección *</label>
                  <select
                    value={linea}
                    onChange={(e) => setLinea(e.target.value)}
                    className="form-select bg-elevated text-text border-border"
                    required
                  >
                    {lineasDisponibles.map((l) => (
                      <option key={l.linea} value={l.linea}>
                        {l.nombre} {l.es_sin_categoria ? '(🔒 Sin categoría)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Precios y Atributos Específicos */}
                <div className="col-12 col-sm-6 col-md-3">
                  <label className="form-label small fw-semibold text-muted">Precio Normal (CLP) *</label>
                  <input
                    type="number"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="25990"
                    className="form-control bg-elevated text-text border-border"
                    required
                  />
                </div>

                <div className="col-12 col-sm-6 col-md-3">
                  <label className="form-label small fw-semibold text-muted">Precio Oferta (CLP)</label>
                  <input
                    type="number"
                    value={precioOferta}
                    onChange={(e) => setPrecioOferta(e.target.value)}
                    placeholder="19990"
                    className="form-control bg-elevated text-text border-border"
                  />
                </div>

                {!esRopa && (
                  <>
                    <div className="col-12 col-sm-6 col-md-3">
                      <label className="form-label small fw-semibold text-muted">Material</label>
                      <input
                        type="text"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Acero 304, Cerámica..."
                        className="form-control bg-elevated text-text border-border"
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                      <label className="form-label small fw-semibold text-muted">Capacidad (ml)</label>
                      <input
                        type="number"
                        value={capacidadMl}
                        onChange={(e) => setCapacidadMl(e.target.value)}
                        placeholder="500"
                        className="form-control bg-elevated text-text border-border"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Toggles de Estado Espaciados y Ordenados */}
              <div className="row g-2 mt-3 pt-3 border-top border-border">
                <div className="col-12 col-md-4">
                  <label className="p-2 bg-elevated rounded-3 border border-border d-flex align-items-center gap-2 user-select-none cursor-pointer h-100 mb-0">
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      className="form-check-input mt-0"
                    />
                    <div>
                      <span className="text-text fw-semibold small d-block">Producto Activo</span>
                      <span className="text-muted" style={{ fontSize: '0.68rem' }}>Visible en la tienda</span>
                    </div>
                  </label>
                </div>

                <div className="col-12 col-md-4">
                  <label className="p-2 bg-elevated rounded-3 border border-border d-flex align-items-center gap-2 user-select-none cursor-pointer h-100 mb-0">
                    <input
                      type="checkbox"
                      checked={destacado}
                      onChange={(e) => setDestacado(e.target.checked)}
                      className="form-check-input mt-0"
                    />
                    <div>
                      <span className="text-primary fw-semibold small d-block">★ Destacado</span>
                      <span className="text-muted" style={{ fontSize: '0.68rem' }}>Aparece en portada</span>
                    </div>
                  </label>
                </div>

                <div className="col-12 col-md-4">
                  <label className="p-2 bg-elevated rounded-3 border border-border d-flex align-items-center gap-2 user-select-none cursor-pointer h-100 mb-0">
                    <input
                      type="checkbox"
                      checked={nuevo}
                      onChange={(e) => setNuevo(e.target.checked)}
                      className="form-check-input mt-0"
                    />
                    <div>
                      <span className="text-info fw-semibold small d-block">✨ Nuevo Lanzamiento</span>
                      <span className="text-muted" style={{ fontSize: '0.68rem' }}>Badge de novedad</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: VARIANTES & STOCK */}
            <div className="p-3 p-md-4 bg-card rounded-3 border border-border">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-border">
                <h4 className="fs-6 fw-bold text-text mb-0 d-flex align-items-center gap-2">
                  <Package size={16} className="text-primary" /> Variantes de Stock & Color
                </h4>
                <button
                  type="button"
                  onClick={addVariante}
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                >
                  <Plus size={14} /> <span>Agregar Variante</span>
                </button>
              </div>

              <div className="d-flex flex-column gap-2">
                {variantes.map((v, idx) => (
                  <div key={idx} className="p-2 bg-elevated rounded-3 border border-border d-flex flex-wrap align-items-center gap-2">
                    {esRopa && (
                      <div style={{ width: '90px' }}>
                        <select
                          value={v.talla}
                          onChange={(e) => {
                            const next = [...variantes];
                            next[idx].talla = e.target.value;
                            setVariantes(next);
                          }}
                          className="form-select form-select-sm bg-surface text-text border-border"
                        >
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Oversize', 'Única'].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ width: '130px' }}>
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => {
                          const next = [...variantes];
                          next[idx].color = e.target.value;
                          setVariantes(next);
                        }}
                        placeholder="Color (ej. Negro)"
                        className="form-control form-control-sm bg-surface text-text border-border"
                        required
                      />
                    </div>

                    <div className="d-flex align-items-center gap-1" style={{ width: '75px' }}>
                      <input
                        type="color"
                        value={v.color_hex || '#111111'}
                        onChange={(e) => {
                          const next = [...variantes];
                          next[idx].color_hex = e.target.value;
                          setVariantes(next);
                        }}
                        className="form-control form-control-color form-control-sm p-0 border-0"
                        title="Seleccionar color"
                        style={{ width: '28px', height: '28px', cursor: 'pointer' }}
                      />
                      <span className="text-muted" style={{ fontSize: '0.65rem' }}>{v.color_hex}</span>
                    </div>

                    <div style={{ width: '90px' }}>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const next = [...variantes];
                          next[idx].stock = e.target.value;
                          setVariantes(next);
                        }}
                        placeholder="Stock"
                        className="form-control form-control-sm bg-surface text-text border-border"
                        title="Cantidad en stock"
                        min="0"
                        required
                      />
                    </div>

                    <div className="flex-grow-1" style={{ minWidth: '120px' }}>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const next = [...variantes];
                          next[idx].sku = e.target.value;
                          setVariantes(next);
                        }}
                        placeholder="SKU (código)"
                        className="form-control form-control-sm bg-surface text-text border-border"
                      />
                    </div>

                    {variantes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariante(idx)}
                        className="btn btn-sm btn-link text-danger p-1"
                        title="Eliminar variante"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 3: FOTOS DEL PRODUCTO */}
            <div className="p-3 p-md-4 bg-card rounded-3 border border-border">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-border">
                <h4 className="fs-6 fw-bold text-text mb-0 d-flex align-items-center gap-2">
                  <ImageIcon size={16} className="text-primary" /> Fotos & Vistas (Hover Swap)
                </h4>
                <button
                  type="button"
                  onClick={addImagen}
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                >
                  <Plus size={14} /> <span>Agregar Foto</span>
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                {imagenes.map((img, idx) => (
                  <div key={idx} className="p-3 bg-elevated rounded-3 border border-border d-flex flex-column flex-md-row align-items-md-center gap-3">
                    {/* Preview Thumbnail */}
                    <div
                      className="rounded-3 bg-surface border border-border overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '4.5rem', height: '4.5rem' }}
                    >
                      {img.imagen ? (
                        <img src={img.imagen} alt="" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <ImageIcon size={22} className="text-muted opacity-50" />
                      )}
                    </div>

                    {/* URL o File Upload */}
                    <div className="flex-grow-1">
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          value={img.imagen}
                          onChange={(e) => {
                            const next = [...imagenes];
                            next[idx].imagen = e.target.value;
                            setImagenes(next);
                          }}
                          placeholder="URL de la imagen o sube un archivo..."
                          className="form-control form-control-sm bg-surface text-text border-border"
                        />
                        <label className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 text-nowrap mb-0 cursor-pointer">
                          <Upload size={13} />
                          <span>{subiendoIdx === idx ? 'Subiendo...' : 'Subir'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(idx, e.target.files?.[0])}
                            className="d-none"
                            disabled={subiendoIdx === idx}
                          />
                        </label>
                      </div>

                      {/* Flags de imagen */}
                      <div className="d-flex flex-wrap gap-3">
                        <label className="d-flex align-items-center gap-1 small user-select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={img.es_principal}
                            onChange={(e) => {
                              const next = [...imagenes];
                              next[idx].es_principal = e.target.checked;
                              setImagenes(next);
                            }}
                            className="form-check-input mt-0"
                          />
                          <span className="text-muted">Foto Principal</span>
                        </label>

                        <label className="d-flex align-items-center gap-1 small user-select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={img.es_frente}
                            onChange={(e) => {
                              const next = [...imagenes];
                              next[idx].es_frente = e.target.checked;
                              setImagenes(next);
                            }}
                            className="form-check-input mt-0"
                          />
                          <span className="text-muted">Vista Frontal</span>
                        </label>

                        <label className="d-flex align-items-center gap-1 small user-select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={img.es_reverso}
                            onChange={(e) => {
                              const next = [...imagenes];
                              next[idx].es_reverso = e.target.checked;
                              setImagenes(next);
                            }}
                            className="form-check-input mt-0"
                          />
                          <span className="text-muted">Vista Reverso (Hover)</span>
                        </label>
                      </div>
                    </div>

                    {imagenes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImagen(idx)}
                        className="btn btn-sm btn-link text-danger p-1 align-self-start align-self-md-center"
                        title="Eliminar foto"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Botones */}
            <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top border-border">
              <button type="button" onClick={onHide} className="btn btn-secondary px-3 py-2">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2"
              >
                <Check size={16} />
                <span>{saving ? 'Guardando producto...' : esEdicion ? 'Guardar Cambios' : 'Crear Producto'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
}
