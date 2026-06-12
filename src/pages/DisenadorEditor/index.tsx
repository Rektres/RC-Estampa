import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fabric } from 'fabric';
import {
  Undo2, Redo2, Trash2, Eye, Upload, Brush, ChevronDown, ChevronUp,
  X, Minus, Plus, ShoppingBag, FlipHorizontal, Layers, ArrowLeft
} from 'lucide-react';
import { coloresEditor, preciosEditor, tallasStandard } from '../../data/mockData';
import { formatPrice } from '../../utils';
import { useCartStore } from '../../store/cartStore';

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
    <div className={`border rounded-sm transition-colors ${expanded ? 'border-primary/40 bg-elevated' : 'border-border'}`}>
      <button onClick={onClick} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-montserrat font-700 flex-shrink-0 ${
            expanded ? 'bg-primary text-black' : active ? 'border border-primary text-primary' : 'border border-border text-ghost'
          }`}>
            {number}
          </span>
          <span className={`font-montserrat font-600 text-sm ${expanded ? 'text-text' : 'text-muted'}`}>{title}</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
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
  const precio = preciosEditor[producto as keyof typeof preciosEditor] ?? 15000;
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

  function addToCart() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL({ format: 'png', quality: 0.85 });
    addItem({
      tipo: 'diseno',
      id: `diseno-${Date.now()}`,
      nombre: `${label} personalizada`,
      imagen: url,
      prenda: label,
      color_base: productColor,
      talla: selectedTalla,
      cantidad,
    });
    openCart();
    setPreviewOpen(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-montserrat text-xs text-muted mb-6">
        <Link to="/disenar" className="flex items-center gap-1 hover:text-text transition-colors">
          <ArrowLeft size={12} />
          Cambiar producto
        </Link>
        <span>/</span>
        <span className="text-text">{label}</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={undo} disabled={!canUndo} title="Deshacer (Ctrl+Z)" className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border font-montserrat text-xs font-600 transition-colors ${canUndo ? 'border-border text-muted hover:border-muted hover:text-text' : 'border-border/30 text-ghost cursor-not-allowed'}`}>
          <Undo2 size={14} />
          Deshacer
        </button>
        <button onClick={redo} disabled={!canRedo} title="Rehacer (Ctrl+Y)" className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border font-montserrat text-xs font-600 transition-colors ${canRedo ? 'border-border text-muted hover:border-muted hover:text-text' : 'border-border/30 text-ghost cursor-not-allowed'}`}>
          <Redo2 size={14} />
          Rehacer
        </button>
        <button onClick={handleClear} className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border font-montserrat text-xs font-600 transition-colors ${clearConfirm ? 'border-red-600 text-red-400' : 'border-border text-muted hover:border-muted hover:text-text'}`}>
          <Trash2 size={14} />
          {clearConfirm ? '¿Confirmar?' : 'Limpiar'}
        </button>
        {clearConfirm && (
          <button onClick={() => setClearConfirm(false)} className="px-3 py-2 rounded-sm border border-border text-muted font-montserrat text-xs">
            Cancelar
          </button>
        )}
        <div className="flex-1" />
        <button onClick={openPreview} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs">
          <Eye size={14} />
          Vista previa
        </button>
      </div>

      {/* Main layout 60/40 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Canvas — 60% */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="bg-elevated border border-border rounded-sm p-4 inline-block">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Panel — 40% */}
        <div className="lg:col-span-2 space-y-3">
          {/* Step 1 — Upload image */}
          <AccordionStep number={1} title="Subir diseño" active expanded={activeTool === 'imagen'} onClick={() => setActiveTool(activeTool === 'imagen' ? null : 'imagen')}>
            <div className="space-y-3">
              <p className="font-montserrat text-xs text-muted">
                PNG, JPG, SVG o WEBP. Máx 5MB. ({imageCount}/{MAX_IMAGES} imágenes)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={imageCount >= MAX_IMAGES}
                className={`btn-secondary w-full flex items-center justify-center gap-2 py-2.5 text-xs ${imageCount >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload size={14} />
                Subir imagen
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div className="flex gap-2 flex-wrap">
                <button onClick={deleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-sm font-montserrat text-xs text-muted hover:border-muted hover:text-text transition-colors">
                  <X size={12} />
                  Eliminar sel.
                </button>
                <button onClick={flipHorizontal} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-sm font-montserrat text-xs text-muted hover:border-muted hover:text-text transition-colors">
                  <FlipHorizontal size={12} />
                  Voltear
                </button>
                <button onClick={bringForward} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-sm font-montserrat text-xs text-muted hover:border-muted hover:text-text transition-colors">
                  <Layers size={12} />
                  Al frente
                </button>
              </div>
            </div>
          </AccordionStep>

          {/* Step 2 — Product color */}
          <AccordionStep number={2} title="Color del producto" active expanded={activeTool === 'color'} onClick={() => setActiveTool(activeTool === 'color' ? null : 'color')}>
            <div className="space-y-3">
              <p className="font-montserrat text-xs text-muted">Selecciona el color base de la prenda</p>
              <div className="flex flex-wrap gap-2">
                {coloresEditor.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setProductColor(c.hex)}
                    title={c.nombre}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${productColor === c.hex ? 'border-primary scale-110' : 'border-border hover:border-muted'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <input
                  type="color"
                  value={productColor}
                  onChange={(e) => setProductColor(e.target.value)}
                  title="Color personalizado"
                  className="w-8 h-8 rounded-full border-2 border-border cursor-pointer overflow-hidden bg-transparent"
                />
              </div>
              {['polera', 'gorra', 'pantalon'].includes(producto) && (
                <div>
                  <p className="font-montserrat font-600 text-xs text-text mb-2">Talla</p>
                  <div className="flex flex-wrap gap-2">
                    {tallasStandard.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTalla(t)}
                        className={`px-3 py-1.5 rounded-sm border font-montserrat text-xs font-600 transition-colors ${selectedTalla === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:border-muted hover:text-text'}`}
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
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setBrushType('pencil')}
                  className={`flex-1 py-2 rounded-sm border font-montserrat text-xs font-600 transition-colors ${brushType === 'pencil' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:border-muted'}`}
                >
                  Lápiz
                </button>
                <button
                  onClick={() => setBrushType('spray')}
                  className={`flex-1 py-2 rounded-sm border font-montserrat text-xs font-600 transition-colors ${brushType === 'spray' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:border-muted'}`}
                >
                  Spray
                </button>
              </div>
              <div>
                <p className="font-montserrat text-xs text-muted mb-2">Color del trazo</p>
                <div className="flex flex-wrap gap-2">
                  {coloresEditor.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setDrawColor(c.hex)}
                      title={c.nombre}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${drawColor === c.hex ? 'border-primary scale-110' : 'border-border hover:border-muted'}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                  <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="w-7 h-7 rounded-full border-2 border-border cursor-pointer overflow-hidden bg-transparent" />
                </div>
              </div>
              <div>
                <p className="font-montserrat text-xs text-muted mb-1">
                  Grosor: <span className="text-text">{brushSize}px</span>
                </p>
                <input type="range" min={1} max={30} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full" />
              </div>
              {activeTool === 'dibujo' && (
                <button onClick={() => setActiveTool(null)} className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5">
                  <Brush size={12} />
                  Desactivar dibujo
                </button>
              )}
            </div>
          </AccordionStep>

          {/* Paso 3 — Order summary */}
          <div className="border border-border rounded-sm p-4 space-y-3">
            <p className="font-montserrat font-600 text-sm text-text">Resumen del pedido</p>
            <div className="flex justify-between font-montserrat text-sm">
              <span className="text-muted">{label}</span>
              <span className="text-primary font-700">{formatPrice(precio)}</span>
            </div>
            <div>
              <p className="font-montserrat text-xs text-muted mb-2">Cantidad</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-8 h-8 flex items-center justify-center border border-border rounded-sm hover:border-primary transition-colors">
                  <Minus size={12} />
                </button>
                <span className="font-montserrat font-600 text-text w-6 text-center">{cantidad}</span>
                <button onClick={() => setCantidad(cantidad + 1)} className="w-8 h-8 flex items-center justify-center border border-border rounded-sm hover:border-primary transition-colors">
                  <Plus size={12} />
                </button>
              </div>
            </div>
            <button onClick={openPreview} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              <Eye size={14} />
              Vista previa y agregar
            </button>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
          <div className="bg-card border border-border rounded-sm p-6 max-w-lg w-full space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-italiana text-2xl text-text">Vista previa</h3>
              <button onClick={() => setPreviewOpen(false)} className="text-muted hover:text-text"><X size={20} /></button>
            </div>
            <img src={previewUrl} alt="Vista previa" className="w-full max-h-72 object-contain bg-elevated rounded-sm" />
            <div className="space-y-2">
              <div className="flex justify-between font-montserrat text-sm">
                <span className="text-muted">Prenda</span><span className="text-text">{label}</span>
              </div>
              <div className="flex justify-between font-montserrat text-sm">
                <span className="text-muted">Talla</span><span className="text-text">{selectedTalla}</span>
              </div>
              <div className="flex justify-between font-montserrat text-sm">
                <span className="text-muted">Cantidad</span><span className="text-text">{cantidad}</span>
              </div>
              <div className="flex justify-between font-montserrat text-sm font-700">
                <span className="text-muted">Precio base</span>
                <span className="text-primary">A cotizar</span>
              </div>
              <p className="font-montserrat text-xs text-muted bg-elevated p-2 rounded-sm">
                El precio final será confirmado por nuestro equipo.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={addToCart} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm">
                <ShoppingBag size={14} />
                Agregar al carrito
              </button>
              <button onClick={() => setPreviewOpen(false)} className="btn-secondary flex-1 text-sm py-3">
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
