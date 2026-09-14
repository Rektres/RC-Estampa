import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fabric } from 'fabric';
import { Modal } from 'react-bootstrap';
import {
  Undo2, Redo2, Trash2, Eye, Upload, Brush, ChevronDown, ChevronUp,
  X, Minus, Plus, ShoppingBag, FlipHorizontal, Layers, ArrowLeft,
  Box, Edit3, Sparkles
} from 'lucide-react';
import { formatPrice } from '../../utils';
import { useCartStore } from '../../store/cartStore';
import { catalogoApi, disenosApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { useSEO } from '../../hooks/useSEO';
import { Viewer3D, Viewer3DRef } from '../../components/common/Viewer3D';

const CANVAS_SIZE = 500;
const TEXTURE_CANVAS_SIZE = 1024;
const MAX_IMAGES = 3;

const PRODUCT_LABELS: Record<string, string> = {
  polera: 'Polera',
  gorra: 'Gorra',
  pantalon: 'Pantalón',
  taza: 'Taza',
  termo: 'Termo',
  vaso: 'Vaso',
};

/* Simple SVG silhouettes for 2D drafting */
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
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewer3DRef = useRef<Viewer3DRef | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const bgRef = useRef<fabric.Image | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [productColor, setProductColor] = useState('#F0EDE8');
  const [activeTool, setActiveTool] = useState<ActiveTool>('color');
  const [drawColor, setDrawColor] = useState('#111111');
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState<'pencil' | 'spray'>('pencil');
  const [imageCount, setImageCount] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [printUrl, setPrintUrl] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState('M');
  const [cantidad, setCantidad] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [textureVersion, setTextureVersion] = useState(0);

  const { addItem, openCart } = useCartStore();
  const { data: editor } = useAsync(() => catalogoApi.editor(), []);
  const coloresEditor = editor?.colores ?? [];
  const tallasStandard = editor?.tallas ?? [];
  const precio = editor?.precios?.[producto] ?? 15000;
  const label = PRODUCT_LABELS[producto] ?? producto;

  useSEO({
    title: `Diseñar ${label} Personalizada en 3D · RC Estampa`,
    description: `Crea y personaliza tu ${label} en 3D interactivo 360° con estampado DTF textil o grabado láser. Despacho a todo Chile.`,
  });

  // Sync fabric objects to texture canvas for 3D mapping
  const sync3DTexture = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (!textureCanvasRef.current) {
      const offscreen = document.createElement('canvas');
      offscreen.width = TEXTURE_CANVAS_SIZE;
      offscreen.height = TEXTURE_CANVAS_SIZE;
      textureCanvasRef.current = offscreen;
    }

    const offscreen = textureCanvasRef.current;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, offscreen.width, offscreen.height);

    // Hide background silhouette so 3D material retains pure PBR shading
    const bg = bgRef.current;
    const originalBgVisible = bg?.visible ?? true;
    if (bg) {
      bg.visible = false;
      canvas.renderAll();
    }

    const fabricDom = canvas.getElement();
    ctx.drawImage(fabricDom, 0, 0, offscreen.width, offscreen.height);

    if (bg) {
      bg.visible = originalBgVisible;
      canvas.renderAll();
    }

    setTextureVersion((v) => v + 1);
  }, []);

  const saveHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(['clipPath', 'selectable', 'evented']));
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
    sync3DTexture();
  }, [sync3DTexture]);

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
      sync3DTexture();
    });
  }, [producto, sync3DTexture]);

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
    canvas.on('path:created', saveHistory);

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
      sync3DTexture();
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
      sync3DTexture();
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
      sync3DTexture();
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
    sync3DTexture();
  }

  function flipHorizontal() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) { obj.set('flipX', !obj.flipX); canvas.renderAll(); sync3DTexture(); }
  }

  function bringForward() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) { canvas.bringForward(obj); canvas.renderAll(); sync3DTexture(); }
  }

  function openPreview() {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // 1. Snapshot from 3D Viewport
    let mockup3D = viewer3DRef.current?.getSnapshot() || '';
    if (!mockup3D) {
      mockup3D = canvas.toDataURL({ format: 'png', quality: 0.9, multiplier: 1 });
    }
    setPreviewUrl(mockup3D);

    // 2. High-res 300 DPI transparent print file for DTF / Laser (without silhouette)
    const bg = bgRef.current;
    if (bg) bg.visible = false;
    canvas.renderAll();
    const highResPrint = canvas.toDataURL({ format: 'png', quality: 1.0, multiplier: 3 });
    setPrintUrl(highResPrint);
    if (bg) bg.visible = true;
    canvas.renderAll();

    setPreviewOpen(true);
  }

  async function addToCart() {
    const canvas = fabricRef.current;
    if (!canvas) return;

    let snapshot = previewUrl;
    if (!snapshot) {
      snapshot = viewer3DRef.current?.getSnapshot() || canvas.toDataURL({ format: 'png', quality: 0.9 });
    }

    let imagen = snapshot;
    let disenoId: number | undefined;
    try {
      const res = await disenosApi.crear({
        imagen_base64: snapshot,
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
      nombre: `${label} personalizada (3D)`,
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
      {/* Breadcrumb & Mode Switcher */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-2 font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>
          <Link to="/disenar" className="d-flex align-items-center gap-1 text-muted text-decoration-none">
            <ArrowLeft size={12} />
            Cambiar producto
          </Link>
          <span>/</span>
          <span className="text-text fw-semibold">{label}</span>
        </div>

        {/* View Mode Pills (3D / 2D) */}
        <div className="d-inline-flex bg-elevated border border-border p-1 rounded-3">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`d-flex align-items-center gap-2 px-3 py-1 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
              viewMode === '3d' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
            }`}
            style={{ fontSize: '0.8rem' }}
          >
            <Box size={15} />
            Visualizador 3D (360°)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`d-flex align-items-center gap-2 px-3 py-1 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
              viewMode === '2d' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
            }`}
            style={{ fontSize: '0.8rem' }}
          >
            <Edit3 size={15} />
            Mesa de Diseño 2D
          </button>
        </div>
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
        <button onClick={openPreview} className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2" style={{ fontSize: '0.75rem' }}>
          <Eye size={14} />
          Vista previa 3D
        </button>
      </div>

      {/* Main layout 60/40 */}
      <div className="row g-4">
        {/* Viewport Area — 60% */}
        <div className="col-12 col-lg-7 d-flex flex-column align-items-center">
          <div className="position-relative w-100 bg-elevated border border-border rounded p-2 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '520px' }}>
            
            {/* 3D Viewport */}
            <div className={`w-100 h-100 ${viewMode === '3d' ? 'd-block' : 'd-none'}`} style={{ minHeight: '500px' }}>
              <Viewer3D
                ref={viewer3DRef}
                producto={producto}
                productColor={productColor}
                canvasSource={textureCanvasRef.current}
                textureVersion={textureVersion}
              />
            </div>

            {/* 2D Canvas Viewport */}
            <div className={`position-relative ${viewMode === '2d' ? 'd-block' : 'd-none'}`}>
              <canvas ref={canvasRef} />
              <div className="text-center mt-2">
                <span className="font-montserrat text-muted" style={{ fontSize: '0.72rem' }}>
                  Área de estampado · Los cambios se actualizan automáticamente en el modelo 3D
                </span>
              </div>
            </div>

            {/* Floating Picture-in-Picture Mini 3D preview when in 2D mode */}
            {viewMode === '2d' && (
              <div
                onClick={() => setViewMode('3d')}
                title="Haz clic para ver en 3D completo"
                className="position-absolute bottom-0 end-0 m-3 bg-card border border-primary rounded-3 p-2 shadow-lg cursor-pointer d-flex flex-column align-items-center gap-1 z-3"
                style={{ width: '130px', cursor: 'pointer', opacity: 0.95 }}
              >
                <div className="d-flex align-items-center gap-1 text-primary font-montserrat fw-semibold" style={{ fontSize: '0.68rem' }}>
                  <Sparkles size={11} />
                  Vista 3D en Vivo
                </div>
                <div style={{ width: '110px', height: '110px', pointerEvents: 'none' }}>
                  <Viewer3D
                    producto={producto}
                    productColor={productColor}
                    canvasSource={textureCanvasRef.current}
                    textureVersion={textureVersion}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editing Tools Panel — 40% */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-2">
          {/* Step 1 — Upload image */}
          <AccordionStep
            number={1}
            title="Subir diseño / Logo"
            active
            expanded={activeTool === 'imagen'}
            onClick={() => {
              setActiveTool(activeTool === 'imagen' ? null : 'imagen');
              if (viewMode === '3d') setViewMode('2d');
            }}
          >
            <div className="d-flex flex-column gap-3">
              <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                PNG, JPG, SVG o WEBP en alta definición. ({imageCount}/{MAX_IMAGES} imágenes)
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
              <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>Selecciona el color base y acabado 3D del producto</p>
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
          <AccordionStep
            number={3}
            title="Dibujo libre y trazos"
            active
            expanded={activeTool === 'dibujo'}
            onClick={() => {
              setActiveTool(activeTool === 'dibujo' ? null : 'dibujo');
              if (viewMode === '3d') setViewMode('2d');
            }}
          >
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
              Vista previa 3D y agregar
            </button>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <Modal show={previewOpen} onHide={() => setPreviewOpen(false)} centered size="lg">
        <Modal.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h3 className="font-italiana text-text mb-0" style={{ fontSize: '1.5rem' }}>Vista previa del Mockup 3D</h3>
            </div>
            <button onClick={() => setPreviewOpen(false)} className="btn btn-link p-0 text-muted"><X size={20} /></button>
          </div>

          <div className="row g-3 mb-3">
            {/* 3D Render Snapshot */}
            <div className="col-12 col-md-8">
              <div className="bg-elevated border border-border rounded p-3 text-center">
                <img src={previewUrl} alt="Mockup 3D" className="w-100 object-fit-contain rounded" style={{ maxHeight: '20rem' }} />
                <div className="mt-2 text-muted font-montserrat" style={{ fontSize: '0.72rem' }}>
                  ✓ Mockup 3D fotorrealista para confirmación del cliente y taller
                </div>
              </div>
            </div>

            {/* High-res DTF Print File Preview */}
            <div className="col-12 col-md-4 d-flex flex-column gap-2">
              <div className="bg-elevated border border-border rounded p-3 text-center flex-grow-1 d-flex flex-column justify-content-center">
                <p className="font-montserrat fw-semibold text-text mb-1" style={{ fontSize: '0.75rem' }}>Base de Impresión (300 DPI)</p>
                {printUrl ? (
                  <img src={printUrl} alt="Base DTF" className="w-100 object-fit-contain rounded my-2" style={{ maxHeight: '7rem' }} />
                ) : (
                  <div className="text-muted font-montserrat my-2" style={{ fontSize: '0.72rem' }}>Sin elementos adicionales</div>
                )}
                <span className="badge bg-primary-10 text-primary border border-primary-20 font-montserrat fw-normal" style={{ fontSize: '0.68rem' }}>
                  ✓ Listo para DTF Textil / Láser
                </span>
              </div>

              {/* Order specifications */}
              <div className="bg-elevated border border-border rounded p-3 d-flex flex-column gap-2">
                <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.8rem' }}>
                  <span className="text-muted">Producto</span><span className="text-text fw-semibold">{label}</span>
                </div>
                {['polera', 'gorra', 'pantalon'].includes(producto) && (
                  <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.8rem' }}>
                    <span className="text-muted">Talla</span><span className="text-text">{selectedTalla}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.8rem' }}>
                  <span className="text-muted">Color</span>
                  <div className="d-flex align-items-center gap-1">
                    <span className="rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: productColor }} />
                    <span className="text-text" style={{ fontSize: '0.75rem' }}>{productColor}</span>
                  </div>
                </div>
                <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.8rem' }}>
                  <span className="text-muted">Cantidad</span><span className="text-text">{cantidad}</span>
                </div>
                <div className="d-flex justify-content-between font-montserrat fw-bold pt-2 border-top border-border" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted">Precio base</span>
                  <span className="text-primary">{formatPrice(precio * cantidad)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 mt-3">
            <button onClick={addToCart} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3">
              <ShoppingBag size={15} />
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
