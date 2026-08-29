import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { panelApi } from '../../api';
import { useAsync } from '../../api/hooks';
import type { Producto, ProductoVajilla, ProductoInput } from '../../types';

const varianteSchema = z.object({
  talla: z.string().optional(),
  color: z.string().min(1, 'Requerido'),
  color_hex: z.string().min(4, 'Requerido'),
  stock: z.string().regex(/^\d+$/, 'Número'),
  sku: z.string().min(1, 'Requerido'),
});

const imagenSchema = z.object({
  imagen: z.string().min(1, 'Sube un archivo o pega una URL'),
  es_principal: z.boolean(),
  es_frente: z.boolean(),
  es_reverso: z.boolean(),
});

const schema = z.object({
  nombre: z.string().min(2, 'Requerido'),
  slug: z.string().optional(),
  descripcion: z.string().min(1, 'Requerida'),
  precio: z.string().regex(/^\d+$/, 'Solo números (CLP)'),
  precio_oferta: z.string().regex(/^\d*$/, 'Solo números').optional(),
  linea: z.string().optional(),
  material: z.string().optional(),
  capacidad_ml: z.string().regex(/^\d*$/, 'Solo números').optional(),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  activo: z.boolean(),
  destacado: z.boolean(),
  nuevo: z.boolean(),
  variantes: z.array(varianteSchema).min(1, 'Agrega al menos una variante'),
  imagenes: z.array(imagenSchema).min(1, 'Agrega al menos una imagen'),
});

type FormData = z.infer<typeof schema>;

const VARIANTE_VACIA = { talla: '', color: '', color_hex: '#111111', stock: '0', sku: '' };
const IMAGEN_VACIA = { imagen: '', es_principal: false, es_frente: false, es_reverso: false };

const inputCls = 'form-control form-control-sm bg-elevated font-montserrat';
const labelCls = 'form-label font-montserrat fw-semibold text-text';
const labelStyle = { fontSize: '0.875rem' } as const;

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{msg}</p>;
}

export default function PanelProductoForm() {
  const { tipo = 'ropa', id } = useParams<{ tipo: string; id?: string }>();
  const esRopa = tipo !== 'drinkware';
  const esEdicion = !!id;
  const navigate = useNavigate();
  const recurso = esRopa ? panelApi.productos : panelApi.drinkware;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState<number | null>(null);

  const { data: categorias } = useAsync(() => panelApi.categorias.list(), []);
  const { data: existente } = useAsync<Producto | ProductoVajilla | null>(
    () => (esEdicion ? recurso.get(Number(id)) : Promise.resolve(null)),
    [id, tipo]
  );

  const categoriasFiltradas = (categorias ?? []).filter((c) =>
    esRopa ? c.linea !== 'drinkware' : c.linea === 'drinkware'
  );

  const { register, control, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '', slug: '', descripcion: '', precio: '', precio_oferta: '',
      linea: 'urbana', material: '', capacidad_ml: '', categoria: '',
      activo: true, destacado: false, nuevo: false,
      variantes: [VARIANTE_VACIA],
      imagenes: [{ ...IMAGEN_VACIA, es_principal: true, es_frente: true }],
    },
  });

  const variantesArr = useFieldArray({ control, name: 'variantes' });
  const imagenesArr = useFieldArray({ control, name: 'imagenes' });
  const imagenesWatch = watch('imagenes');

  // Cargar valores al editar
  useEffect(() => {
    if (!existente) return;
    const catId = typeof existente.categoria === 'object' && existente.categoria
      ? (existente.categoria as any).id
      : existente.categoria;

    reset({
      nombre: existente.nombre || '',
      slug: existente.slug || '',
      descripcion: existente.descripcion || '',
      precio: String(existente.precio || ''),
      precio_oferta: existente.precio_oferta ? String(existente.precio_oferta) : '',
      linea: esRopa ? (existente as Producto).linea || 'urbana' : undefined,
      material: !esRopa ? (existente as ProductoVajilla).material || '' : '',
      capacidad_ml: !esRopa && (existente as ProductoVajilla).capacidad_ml
        ? String((existente as ProductoVajilla).capacidad_ml) : '',
      categoria: catId ? String(catId) : '',
      activo: existente.activo ?? true,
      destacado: existente.destacado ?? false,
      nuevo: existente.nuevo ?? false,
      variantes: (existente.variantes && existente.variantes.length > 0)
        ? existente.variantes.map((v) => ({
            talla: 'talla' in v ? v.talla : '',
            color: v.color, color_hex: v.color_hex, stock: String(v.stock), sku: v.sku,
          }))
        : [VARIANTE_VACIA],
      imagenes: (existente.imagenes && existente.imagenes.length > 0)
        ? existente.imagenes.map((img) => ({
            imagen: img.imagen,
            es_principal: img.es_principal,
            es_frente: img.es_frente ?? false,
            es_reverso: img.es_reverso ?? false,
          }))
        : [{ ...IMAGEN_VACIA, es_principal: true, es_frente: true }],
    });
  }, [existente, esRopa, reset]);

  async function handleFile(i: number, file: File | undefined) {
    if (!file) return;
    setSubiendo(i);
    setSubmitError(null);
    try {
      const { url } = await panelApi.upload(file);
      setValue(`imagenes.${i}.imagen`, url, { shouldValidate: true });
    } catch {
      setSubmitError('No se pudo subir la imagen (máx 5MB, solo imágenes).');
    } finally {
      setSubiendo(null);
    }
  }

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    const payload: ProductoInput = {
      nombre: data.nombre,
      slug: data.slug || '',
      descripcion: data.descripcion,
      precio: Number(data.precio),
      precio_oferta: data.precio_oferta ? Number(data.precio_oferta) : null,
      activo: data.activo,
      destacado: data.destacado,
      nuevo: data.nuevo,
      categoria: Number(data.categoria),
      ...(esRopa
        ? { linea: data.linea as 'urbana' | 'formal' }
        : { material: data.material || '', capacidad_ml: data.capacidad_ml ? Number(data.capacidad_ml) : null }),
      variantes: data.variantes.map((v) => ({
        ...(esRopa ? { talla: v.talla || '' } : {}),
        color: v.color, color_hex: v.color_hex, stock: Number(v.stock), sku: v.sku,
      })),
      imagenes: data.imagenes.map((img, i) => ({ ...img, orden: i })),
    };
    try {
      if (esEdicion) await recurso.update(Number(id), payload);
      else await recurso.create(payload);
      navigate('/panel');
    } catch (e) {
      const detail = (e as { response?: { data?: Record<string, unknown> } })?.response?.data;
      setSubmitError(detail ? JSON.stringify(detail) : 'No se pudo guardar el producto.');
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: '56rem' }}>
      <Link to="/panel" className="d-inline-flex align-items-center gap-1 font-montserrat text-muted text-decoration-none mb-3" style={{ fontSize: '0.75rem' }}>
        <ArrowLeft size={12} />
        Volver al panel
      </Link>
      <h1 className="font-italiana text-text mb-4" style={{ fontSize: '2.25rem' }}>
        {esEdicion ? 'Editar' : 'Nuevo'} producto {esRopa ? 'de ropa' : 'drinkware'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-4">
        {/* Datos generales */}
        <div className="bg-card border border-border rounded p-4 d-flex flex-column gap-3">
          <h2 className="font-montserrat fw-semibold text-text fs-6 mb-0">Datos generales</h2>
          <div className="row g-3">
            <div className="col-12 col-sm-8">
              <label className={labelCls} style={labelStyle}>Nombre *</label>
              <input {...register('nombre')} className={inputCls} placeholder="Polera Oversize Negra" />
              <ErrorMsg msg={errors.nombre?.message} />
            </div>
            <div className="col-12 col-sm-4">
              <label className={labelCls} style={labelStyle}>Slug</label>
              <input {...register('slug')} className={inputCls} placeholder="se genera solo" />
            </div>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Descripción *</label>
            <textarea {...register('descripcion')} rows={3} className={inputCls} style={{ resize: 'none' }} />
            <ErrorMsg msg={errors.descripcion?.message} />
          </div>
          <div className="row g-3">
            <div className="col-6 col-sm-3">
              <label className={labelCls} style={labelStyle}>Precio (CLP) *</label>
              <input {...register('precio')} className={inputCls} placeholder="19990" />
              <ErrorMsg msg={errors.precio?.message} />
            </div>
            <div className="col-6 col-sm-3">
              <label className={labelCls} style={labelStyle}>Precio oferta</label>
              <input {...register('precio_oferta')} className={inputCls} placeholder="opcional" />
              <ErrorMsg msg={errors.precio_oferta?.message} />
            </div>
            {esRopa ? (
              <div className="col-6 col-sm-3">
                <label className={labelCls} style={labelStyle}>Línea *</label>
                <select {...register('linea')} className="form-select form-select-sm bg-elevated font-montserrat">
                  <option value="urbana">Urbana</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
            ) : (
              <>
                <div className="col-6 col-sm-3">
                  <label className={labelCls} style={labelStyle}>Material *</label>
                  <input {...register('material')} className={inputCls} placeholder="Cerámica" />
                </div>
                <div className="col-6 col-sm-3">
                  <label className={labelCls} style={labelStyle}>Capacidad (ml)</label>
                  <input {...register('capacidad_ml')} className={inputCls} placeholder="350" />
                </div>
              </>
            )}
            <div className="col-6 col-sm-3">
              <label className={labelCls} style={labelStyle}>Categoría *</label>
              <select {...register('categoria')} className="form-select form-select-sm bg-elevated font-montserrat">
                <option value="">Selecciona...</option>
                {categoriasFiltradas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <ErrorMsg msg={errors.categoria?.message} />
            </div>
          </div>
          <div className="d-flex flex-wrap gap-4">
            {([['activo', 'Activo (visible en la tienda)'], ['destacado', 'Destacado'], ['nuevo', 'Nuevo']] as const).map(([campo, label]) => (
              <label key={campo} className="d-flex align-items-center gap-2 font-montserrat text-text mb-0" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" {...register(campo)} className="form-check-input mt-0" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Variantes */}
        <div className="bg-card border border-border rounded p-4 d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between">
            <h2 className="font-montserrat fw-semibold text-text fs-6 mb-0">Variantes</h2>
            <button type="button" onClick={() => variantesArr.append(VARIANTE_VACIA)} className="btn btn-secondary btn-sm d-inline-flex align-items-center gap-1">
              <Plus size={14} /> Agregar
            </button>
          </div>
          <ErrorMsg msg={errors.variantes?.message || errors.variantes?.root?.message} />
          {variantesArr.fields.map((field, i) => (
            <div key={field.id} className="row g-2 align-items-end border-bottom border-border pb-3">
              {esRopa && (
                <div className="col-4 col-sm-2">
                  <label className={labelCls} style={labelStyle}>Talla</label>
                  <select {...register(`variantes.${i}.talla`)} className="form-select form-select-sm bg-elevated font-montserrat">
                    <option value="">—</option>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
              <div className="col-8 col-sm-3">
                <label className={labelCls} style={labelStyle}>Color *</label>
                <input {...register(`variantes.${i}.color`)} className={inputCls} placeholder="Negro" />
                <ErrorMsg msg={errors.variantes?.[i]?.color?.message} />
              </div>
              <div className="col-4 col-sm-2">
                <label className={labelCls} style={labelStyle}>Hex</label>
                <input type="color" {...register(`variantes.${i}.color_hex`)} className="form-control form-control-sm form-control-color bg-elevated w-100" />
              </div>
              <div className="col-4 col-sm-2">
                <label className={labelCls} style={labelStyle}>Stock *</label>
                <input {...register(`variantes.${i}.stock`)} className={inputCls} />
                <ErrorMsg msg={errors.variantes?.[i]?.stock?.message} />
              </div>
              <div className="col-8 col-sm-2">
                <label className={labelCls} style={labelStyle}>SKU *</label>
                <input {...register(`variantes.${i}.sku`)} className={inputCls} placeholder="POL-NEG-M" />
                <ErrorMsg msg={errors.variantes?.[i]?.sku?.message} />
              </div>
              <div className="col-4 col-sm-1 text-end">
                <button type="button" onClick={() => variantesArr.remove(i)} disabled={variantesArr.fields.length === 1} className="btn btn-link p-1 text-danger" title="Quitar variante">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Imágenes */}
        <div className="bg-card border border-border rounded p-4 d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between">
            <h2 className="font-montserrat fw-semibold text-text fs-6 mb-0">Imágenes</h2>
            <button type="button" onClick={() => imagenesArr.append(IMAGEN_VACIA)} className="btn btn-secondary btn-sm d-inline-flex align-items-center gap-1">
              <Plus size={14} /> Agregar
            </button>
          </div>
          <ErrorMsg msg={errors.imagenes?.message || errors.imagenes?.root?.message} />
          {imagenesArr.fields.map((field, i) => (
            <div key={field.id} className="d-flex flex-wrap gap-3 align-items-start border-bottom border-border pb-3">
              <div className="bg-elevated rounded overflow-hidden flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '5rem', height: '5rem' }}>
                {imagenesWatch?.[i]?.imagen
                  ? <img src={imagenesWatch[i].imagen} alt="" className="w-100 h-100 object-fit-cover" />
                  : <span className="text-ghost font-montserrat" style={{ fontSize: '0.75rem' }}>Sin img</span>}
              </div>
              <div className="flex-grow-1 d-flex flex-column gap-2" style={{ minWidth: '14rem' }}>
                <div className="d-flex gap-2">
                  <input {...register(`imagenes.${i}.imagen`)} className={inputCls} placeholder="URL de la imagen o sube un archivo" />
                  <label className="btn btn-secondary btn-sm d-inline-flex align-items-center gap-1 flex-shrink-0 mb-0" style={{ cursor: 'pointer' }}>
                    <Upload size={14} />
                    {subiendo === i ? 'Subiendo...' : 'Subir'}
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      disabled={subiendo !== null}
                      onChange={(e) => handleFile(i, e.target.files?.[0])}
                    />
                  </label>
                </div>
                <ErrorMsg msg={errors.imagenes?.[i]?.imagen?.message} />
                <div className="d-flex flex-wrap gap-3">
                  {([['es_principal', 'Principal'], ['es_frente', 'Frente'], ['es_reverso', 'Reverso']] as const).map(([campo, label]) => (
                    <label key={campo} className="d-flex align-items-center gap-1 font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" {...register(`imagenes.${i}.${campo}`)} className="form-check-input mt-0" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => imagenesArr.remove(i)} disabled={imagenesArr.fields.length === 1} className="btn btn-link p-1 text-danger" title="Quitar imagen">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {submitError && (
          <div className="alert alert-danger py-2 font-montserrat mb-0" style={{ fontSize: '0.875rem', overflowWrap: 'anywhere' }}>{submitError}</div>
        )}

        <div className="d-flex gap-3">
          <button type="submit" disabled={isSubmitting || subiendo !== null} className="btn btn-primary flex-grow-1 py-2">
            {isSubmitting ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
          <Link to="/panel" className="btn btn-secondary flex-grow-1 py-2 text-center">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
