import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fabric } from 'fabric';
import { Modal } from 'react-bootstrap';
import {
  Undo2, Redo2, Trash2, Eye, Upload, Brush, ChevronDown, ChevronUp,
  X, Minus, Plus, ShoppingBag, FlipHorizontal, Layers, ArrowLeft
} from 'lucide-react';
import { formatPrice } from '../../utils';
import { useCartStore } from '../../store/cartStore';
import { catalogoApi, disenosApi } from '../../api';
import { useAsync } from '../../api/hooks';

const CANVAS_SIZE = 500;
const MAX_IMAGES = 3;

const PRODUCT_LABELS: Record<string, string> = {
  polera: 'Polera', gorra: 'Gorra', pantalon: 'Pantalón',
  taza: 'Taza', termo: 'Termo', vaso: 'Vaso',
};

/* Simple SVG silhouettes */
function getProductSVG(key: string, color: string): string {
  const w = CANVAS_SIZE;
  const h = CANVAS_SIZE;
  const fill = color;
  const stroke = '#555';

  switch (key) {
    case 'polera':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        <path d="M150,80 L80,130 L120,145 L120,400 L380,400 L380,145 L420,130 L350,80 C330,100 310,110 250,110 C190,110 170,100 150,80Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M150,80 Q170,50 200,50 L220,80 Q230,65 250,60 Q270,65 280,80 L300,50 Q330,50 350,80" fill="none" stroke="${stroke}" stroke-width="2"/>
      </svg>`;
    case 'gorra':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        <path d="M100,250 Q100,150 250,150 Q400,150 400,250" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <rect x="90" y="248" width="180" height="20" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M200,150 L210,100 L250,95 L290,100 L300,150" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      </svg>`;
    case 'pantalon':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        <path d="M140,80 L120,420 L200,420 L250,250 L300,420 L380,420 L360,80Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <line x1="140" y1="80" x2="360" y2="80" stroke="${stroke}" stroke-width="2"/>
      </svg>`;
    case 'taza':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        <rect x="130" y="150" width="220" height="200" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M350,185 Q410,185 410,225 Q410,265 350,265" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="240" cy="150" rx="110" ry="15" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <ellipse cx="240" cy="350" rx="110" ry="15" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      </svg>`;
    case 'termo':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        <rect x="165" y="100" width="170" height="300" rx="20" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <rect x="175" y="80" width="150" height="30" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <rect x="185" y="60" width="130" height="25" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      </svg>`;
    case 'vaso':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        <path d="M170,100 L145,400 L355,400 L330,100Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <line x1="170" y1="100" x2="330" y2="100" stroke="${stroke}" stroke-width="2"/>
      </svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
        <rect x="100" y="100" width="300" height="300" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      </svg>`;
  }
}

type ActiveTool = 'color' | 'imagen' | 'dibujo' | null;

interface StepProps {
  number: number;
  title: string;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function AccordionStep({ number, title, active, expanded, onClick, children }: StepProps) {
  return (
    <div className={`border rounded ${expanded ? 'border-primary-40 bg-elevated' : 'border-border'}`}>
      <button onClick={onClick} className="w-100 d-flex align-items-center justify-content-between p-3 text-start bg-transparent border-0">
        <div className="d-flex align-items-center gap-3">
          <span className={`rounded-circle d-flex align-items-center justify-content-center font-montserrat fw-bold flex-shrink-0 ${
            expanded ? 'bg-primary text-black' : active ? 'border border-primary text-primary' : 'border border-border text-ghost'
          }`} style={{ width: '1.5rem', height: '1.5rem', fontSize: '0.75rem' }}>
            {number}
          </span>
          <span className={`font-montserrat fw-semibold ${expanded ? 'text-text' : 'text-muted'}`} style={{ fontSize: '0.875rem' }}>{title}</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function DisenadorEditor() {
  const { producto = 'polera' } = useParams<{ producto: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const bgRef = useRef<fabric.Image | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productColor, setProductColor] = useState('#F0EDE8');
  const [activeTool, setActiveTool] = useState<ActiveTool>('color');
  const [drawColor, setDrawColor] = useState('#111111');
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState<'pencil' | 'spray'>('pencil');
  const [imageCount, setImageCount] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState('M');
  const [cantidad, setCantidad] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const { addItem, openCart } = useCartStore();
  const { data: editor } = useAsync(() => catalogoApi.editor(), []);
  const coloresEditor = editor?.colores ?? [];
  const tallasStandard = editor?.tallas ?? [];
  const precio = editor?.precios?.[producto] ?? 15000;
  const label = PRODUCT_LABELS[producto] ?? producto;

  const saveHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(['clipPath', 'selectable', 'evented']));
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const updateBg = useCallback((color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const svgString = getProductSVG(producto, color);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    fabric.Image.fromURL(url, (img: fabric.Image) => {
      img.set({ selectable: false, evented: false, left: 0, top: 0 });
      img.scaleToWidth(CANVAS_SIZE);
      if (bgRef.current) canvas.remove(bgRef.current);
      canvas.insertAt(img, 0, false);
      bgRef.current = img;
      canvas.renderAll();
      URL.revokeObjectURL(url);
    });
  }, [producto]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    canvas.on('object:added', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);

    updateBg(productColor);
    historyRef.current = [];
    historyIndexRef.current = -1;

    return () => { canvas.dispose(); };
  }, []);

  useEffect(() => {
    updateBg(productColor);
  }, [productColor, updateBg]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (activeTool === 'dibujo') {
      canvas.isDrawingMode = true;
      if (brushType === 'spray') {
        const brush = new (fabric as any).SprayBrush(canvas);
        brush.color = drawColor;
        brush.width = brushSize;
        canvas.freeDrawingBrush = brush;
      } else {
        const brush = new fabric.PencilBrush(canvas);
        brush.color = drawColor;
        brush.width = brushSize;
        canvas.freeDrawingBrush = brush;
      }
    } else {
      canvas.isDrawingMode = false;
    }
  }, [activeTool, drawColor, brushSize, brushType]);

  function undo() {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.loadFromJSON(JSON.parse(historyRef.current[historyIndexRef.current]), () => {
      canvas.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    });
  }

  function redo() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.loadFromJSON(JSON.parse(historyRef.current[historyIndexRef.current]), () => {
      canvas.renderAll();
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  }

  function handleClear() {
    if (!clearConfirm) { setClearConfirm(true); return; }
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.getObjects().filter((o: fabric.Object) => o !== bgRef.current).forEach((o: fabric.Object) => canvas.remove(o));
    canvas.renderAll();
    setImageCount(0);
    setClearConfirm(false);
    saveHistory();
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || imageCount >= MAX_IMAGES) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const url = URL.createObjectURL(file);
    fabric.Image.fromURL(url, (img: fabric.Image) => {
      const maxSize = 200;
      if ((img.width ?? 0) > maxSize || (img.height ?? 0) > maxSize) {
        const scale = maxSize / Math.max(img.width ?? 1, img.height ?? 1);
        img.scale(scale);
      }
      img.set({ left: 150, top: 150, borderColor: '#C9A84C', cornerColor: '#C9A84C' });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setImageCount((c) => c + 1);
      URL.revokeObjectURL(url);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  }

  function deleteSelected() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    active.forEach((o: fabric.Object) => { if (o !== bgRef.current) canvas.remove(o); });
    canvas.discardActiveObject();
    canvas.renderAll();
    setImageCount((c) => Math.max(0, c - active.filter((o: fabric.Object) => o.type === 'image').length));
  }

  function flipHorizontal() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) { obj.set('flipX', !obj.flipX); canvas.renderAll(); }
  }

  function bringForward() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) { canvas.bringForward(obj); canvas.renderAll(); }
  }

  function openPreview() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL({ format: 'png', quality: 0.85, multiplier: 1 });
    setPreviewUrl(url);
    setPreviewOpen(true);
  }

  async function addToCart() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL({ format: 'png', quality: 0.85 });
    let imagen = url;
    let disenoId: number | undefined;
    try {
      const res = await disenosApi.crear({
        imagen_base64: url,
        prenda: label,
        color_base: productColor,
        talla: selectedTalla,
      });
      imagen = res.imagen;
      disenoId = res.id;
    } catch {
      // Si falla la subida, se conserva el data URL local como respaldo
    }
    addItem({
      tipo: 'diseno',
      id: `diseno-${Date.now()}`,
      disenoId,
      nombre: `${label} personalizada`,
      imagen,
      prenda: label,
      color_base: productColor,
      talla: selectedTalla,
      cantidad,
    });
    openCart();
    setPreviewOpen(false);
  }

  return (
    <div className="container-xxl py-4">
      {/* Breadcrumb */}
      <div className="d-flex align-items-center gap-2 font-montserrat text-muted mb-4" style={{ fontSize: '0.75rem' }}>
        <Link to="/disenar" className="d-flex align-items-center gap-1 text-muted text-decoration-none">
          <ArrowLeft size={12} />
          Cambiar producto
        </Link>
        <span>/</span>
        <span className="text-text">{label}</span>
      </div>

      {/* Toolbar */}
      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
        <button onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)" className={`d-inline-flex align-items-center gap-1 px-3 py-2 rounded border font-montserrat fw-semibold bg-transparent ${canUndo ? 'border-border text-muted' : 'border-border text-ghost'}`} style={{ fontSize: '0.75rem' }}>
          <Undo2 size={14} />
          Deshacer
        </button>
        <button onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl+Y)" className={`d-inline-flex align-items-center gap-1 px-3 py-2 rounded border font-montserrat fw-semibold bg-transparent ${canRedo ? 'border-border text-muted' : 'border-border text-ghost'}`} style={{ fontSize: '0.75rem' }}>
          <Redo2 size={14} />
          Rehacer
        </button>
        <button onClick={handleClear} className={`d-inline-flex align-items-center gap-1 px-3 py-2 rounded border font-montserrat fw-semibold bg-transparent ${clearConfirm ? 'border-danger text-danger' : 'border-border text-muted'}`} style={{ fontSize: '0.75rem' }}>
          <Trash2 size={14} />
          {clearConfirm ? '¿Confirmar?' : 'Limpiar'}
        </button>
        {clearConfirm && (
          <button onClick={() => setClearConfirm(false)} className="px-3 py-2 rounded border border-border text-muted font-montserrat bg-transparent" style={{ fontSize: '0.75rem' }}>
            Cancelar
          </button>
        )}
        <div className="flex-grow-1" />
        <button onClick={openPreview} className="btn btn-primary d-inline-flex align-items-center gap-1 px-4 py-2" style={{ fontSize: '0.75rem' }}>
          <Eye size={14} />
          Vista previa
        </button>
      </div>

      {/* Main layout 60/40 */}
      <div className="row g-4">
        {/* Canvas — 60% */}
        <div className="col-12 col-lg-7 d-flex justify-content-center">
          <div className="bg-elevated border border-border rounded p-3 d-inline-block">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Panel — 40% */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-2">
          {/* Step 1 — Upload image */}
          <AccordionStep number={1} title="Subir diseño" active expanded={activeTool === 'imagen'} onClick={() => setActiveTool(activeTool === 'imagen' ? null : 'imagen')}>
            <div className="d-flex flex-column gap-3">
              <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                PNG, JPG, SVG o WEBP. Máx 5MB. ({imageCount}/{MAX_IMAGES} imágenes)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageCount >= MAX_IMAGES}
                className="btn btn-secondary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                style={{ fontSize: '0.75rem' }}
              >
                <Upload size={14} />
                Subir imagen
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="d-none" />
              <div className="d-flex gap-2 flex-wrap">
                <button onClick={deleteSelected} className="d-inline-flex align-items-center gap-1 px-3 py-1 border border-border rounded font-montserrat text-muted bg-transparent" style={{ fontSize: '0.75rem' }}>
                  <X size={12} />
                  Eliminar sel.
                </button>
                <button onClick={flipHorizontal} className="d-inline-flex align-items-center gap-1 px-3 py-1 border border-border rounded font-montserrat text-muted bg-transparent" style={{ fontSize: '0.75rem' }}>
                  <FlipHorizontal size={12} />
                  Voltear
                </button>
                <button onClick={bringForward} className="d-inline-flex align-items-center gap-1 px-3 py-1 border border-border rounded font-montserrat text-muted bg-transparent" style={{ fontSize: '0.75rem' }}>
                  <Layers size={12} />
                  Al frente
                </button>
              </div>
            </div>
          </AccordionStep>

          {/* Step 2 — Product color */}
          <AccordionStep number={2} title="Color del producto" active expanded={activeTool === 'color'} onClick={() => setActiveTool(activeTool === 'color' ? null : 'color')}>
            <div className="d-flex flex-column gap-3">
              <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>Selecciona el color base de la prenda</p>
              <div className="d-flex flex-wrap gap-2">
                {coloresEditor.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setProductColor(c.hex)}
                    title={c.nombre}
                    className={`rounded-circle border border-2 ${productColor === c.hex ? 'border-primary' : 'border-border'}`}
                    style={{ width: '2rem', height: '2rem', backgroundColor: c.hex, transform: productColor === c.hex ? 'scale(1.1)' : undefined }}
                  />
                ))}
                <input
                  type="color"
                  value={productColor}
                  onChange={(e) => setProductColor(e.target.value)}
                  title="Color personalizado"
                  className="rounded-circle border border-2 border-border bg-transparent"
                  style={{ width: '2rem', height: '2rem', cursor: 'pointer', overflow: 'hidden' }}
                />
              </div>
              {['polera', 'gorra', 'pantalon'].includes(producto) && (
                <div>
                  <p className="font-montserrat fw-semibold text-text mb-2" style={{ fontSize: '0.75rem' }}>Talla</p>
                  <div className="d-flex flex-wrap gap-2">
                    {tallasStandard.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTalla(t)}
                        className={`px-3 py-1 rounded border font-montserrat fw-semibold bg-transparent ${selectedTalla === t ? 'border-primary bg-primary-10 text-primary' : 'border-border text-muted'}`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionStep>

          {/* Step 3 — Free drawing */}
          <AccordionStep number={3} title="Dibujo libre" active expanded={activeTool === 'dibujo'} onClick={() => setActiveTool(activeTool === 'dibujo' ? null : 'dibujo')}>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex gap-2">
                <button
                  onClick={() => setBrushType('pencil')}
                  className={`flex-grow-1 py-2 rounded border font-montserrat fw-semibold bg-transparent ${brushType === 'pencil' ? 'border-primary bg-primary-10 text-primary' : 'border-border text-muted'}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  Lápiz
                </button>
                <button
                  onClick={() => setBrushType('spray')}
                  className={`flex-grow-1 py-2 rounded border font-montserrat fw-semibold bg-transparent ${brushType === 'spray' ? 'border-primary bg-primary-10 text-primary' : 'border-border text-muted'}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  Spray
                </button>
              </div>
              <div>
                <p className="font-montserrat text-muted mb-2" style={{ fontSize: '0.75rem' }}>Color del trazo</p>
                <div className="d-flex flex-wrap gap-2">
                  {coloresEditor.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setDrawColor(c.hex)}
                      title={c.nombre}
                      className={`rounded-circle border border-2 ${drawColor === c.hex ? 'border-primary' : 'border-border'}`}
                      style={{ width: '1.75rem', height: '1.75rem', backgroundColor: c.hex, transform: drawColor === c.hex ? 'scale(1.1)' : undefined }}
                    />
                  ))}
                  <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="rounded-circle border border-2 border-border bg-transparent" style={{ width: '1.75rem', height: '1.75rem', cursor: 'pointer', overflow: 'hidden' }} />
                </div>
              </div>
              <div>
                <p className="font-montserrat text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                  Grosor: <span className="text-text">{brushSize}px</span>
                </p>
                <input type="range" min={1} max={30} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="form-range w-100" />
              </div>
              {activeTool === 'dibujo' && (
                <button onClick={() => setActiveTool(null)} className="btn btn-secondary w-100 py-2 d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '0.75rem' }}>
                  <Brush size={12} />
                  Desactivar dibujo
                </button>
              )}
            </div>
          </AccordionStep>

          {/* Order summary */}
          <div className="border border-border rounded p-3 d-flex flex-column gap-3">
            <p className="font-montserrat fw-semibold text-text mb-0" style={{ fontSize: '0.875rem' }}>Resumen del pedido</p>
            <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.875rem' }}>
              <span className="text-muted">{label}</span>
              <span className="text-primary fw-bold">{formatPrice(precio)}</span>
            </div>
            <div>
              <p className="font-montserrat text-muted mb-2" style={{ fontSize: '0.75rem' }}>Cantidad</p>
              <div className="d-flex align-items-center gap-3">
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="d-flex align-items-center justify-content-center border border-border rounded bg-transparent" style={{ width: '2rem', height: '2rem' }}>
                  <Minus size={12} />
                </button>
                <span className="font-montserrat fw-semibold text-text text-center" style={{ width: '1.5rem' }}>{cantidad}</span>
                <button onClick={() => setCantidad(cantidad + 1)} className="d-flex align-items-center justify-content-center border border-border rounded bg-transparent" style={{ width: '2rem', height: '2rem' }}>
                  <Plus size={12} />
                </button>
              </div>
            </div>
            <button onClick={openPreview} className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2">
              <Eye size={14} />
              Vista previa y agregar
            </button>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <Modal show={previewOpen} onHide={() => setPreviewOpen(false)} centered>
        <Modal.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h3 className="font-italiana text-text mb-0" style={{ fontSize: '1.5rem' }}>Vista previa</h3>
            <button onClick={() => setPreviewOpen(false)} className="btn btn-link p-0 text-muted"><X size={20} /></button>
          </div>
          <img src={previewUrl} alt="Vista previa" className="w-100 object-fit-contain bg-elevated rounded mb-3" style={{ maxHeight: '18rem' }} />
          <div className="d-flex flex-column gap-2">
            <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.875rem' }}>
              <span className="text-muted">Prenda</span><span className="text-text">{label}</span>
            </div>
            <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.875rem' }}>
              <span className="text-muted">Talla</span><span className="text-text">{selectedTalla}</span>
            </div>
            <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.875rem' }}>
              <span className="text-muted">Cantidad</span><span className="text-text">{cantidad}</span>
            </div>
            <div className="d-flex justify-content-between font-montserrat fw-bold" style={{ fontSize: '0.875rem' }}>
              <span className="text-muted">Precio base</span>
              <span className="text-primary">A cotizar</span>
            </div>
            <p className="font-montserrat text-muted bg-elevated p-2 rounded mb-0" style={{ fontSize: '0.75rem' }}>
              El precio final será confirmado por nuestro equipo.
            </p>
          </div>
          <div className="d-flex gap-3 mt-3">
            <button onClick={addToCart} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3">
              <ShoppingBag size={14} />
              Agregar al carrito
            </button>
            <button onClick={() => setPreviewOpen(false)} className="btn btn-secondary flex-grow-1 py-3">
              Seguir editando
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
