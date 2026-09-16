import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import {
  Upload, Trash2, FlipHorizontal, Eye,
  Minus, Plus, ShoppingBag, ArrowLeft, Type,
  Sparkles, Palette, Image as ImageIcon, Shirt, Coffee, GlassWater,
  PlusCircle, Maximize2, Minimize2, Grid,
  AlignCenter, Sliders, Layers, X
} from 'lucide-react';
import { formatPrice } from '../../utils';
import { useCartStore } from '../../store/cartStore';
import { catalogoApi, disenosApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { useSEO } from '../../hooks/useSEO';
import { Viewer3D, Viewer3DRef } from '../../components/common/Viewer3D';

const TEXTURE_CANVAS_SIZE = 1024;
const MAX_IMAGES = 6;

const PRODUCT_LABELS: Record<string, string> = {
  polera: 'Polera',
  gorra: 'Gorra',
  pantalon: 'Pantalón',
  taza: 'Taza',
  termo: 'Termo',
  vaso: 'Vaso',
};

const PRODUCT_SUBTYPES: Record<string, { id: string; label: string; desc: string }[]> = {
  polera: [
    { id: 'cuello-redondo', label: 'Cuello Redondo', desc: 'Algodón clásico 100%' },
    { id: 'polo', label: 'Polo Piqué', desc: 'Cuello camisero y 3 botones' },
    { id: 'cuello-v', label: 'Cuello V', desc: 'Corte V acanalado' },
    { id: 'poleron', label: 'Polerón / Hoodie', desc: 'Capucha y bolsillo canguro' },
  ],
  pantalon: [
    { id: 'jogger', label: 'Jogger Urbano', desc: 'Corte slim con puños elásticos y cordón' },
    { id: 'recto', label: 'Pantalón Recto', desc: 'Corte clásico recto con bolsillos' },
  ],
  vaso: [
    { id: 'clasico', label: 'Vaso Clásico', desc: 'Vidrio / Tumbler cónico' },
    { id: 'shopero', label: 'Shopero Cervecero', desc: 'Asa robusta y base gruesa' },
    { id: 'jarra', label: 'Jarra con Pico', desc: 'Pico vertedor y asa' },
    { id: 'termico', label: 'Vaso Térmico', desc: 'Acero con tapa hermética' },
  ],
  taza: [
    { id: 'clasica', label: 'Mug Clásico 320ml', desc: 'Cerámica esmaltada' },
    { id: 'conica', label: 'Taza Cónica Latte', desc: 'Diseño cónico moderno' },
  ],
  termo: [
    { id: 'clasico', label: 'Termo Acero Clásico', desc: 'Doble pared aislante' },
    { id: 'deportivo', label: 'Botella Deportiva', desc: 'Con tapa ergonómica' },
  ],
  gorra: [
    { id: 'curva', label: 'Jockey Curvo', desc: 'Visera curva 6 paneles' },
    { id: 'plana', label: 'Visera Plana', desc: 'Estilo snapback urbano' },
  ],
};

const FONT_OPTIONS = [
  { label: 'Elegante (Italiana)', value: 'Italiana, serif' },
  { label: 'Moderna (Montserrat)', value: 'Montserrat, sans-serif' },
  { label: 'Impacto (Bold)', value: 'Impact, sans-serif' },
  { label: 'Cursiva (Script)', value: 'cursive, Georgia, serif' },
];

const COLOR_PALETTE = [
  { nombre: 'Blanco Puro', hex: '#FFFFFF' },
  { nombre: 'Negro Azabache', hex: '#111111' },
  { nombre: 'Gris Jaspe', hex: '#6B7280' },
  { nombre: 'Azul Marino', hex: '#1E3A8A' },
  { nombre: 'Rojo Carmesí', hex: '#DC2626' },
  { nombre: 'Verde Bosque', hex: '#15803D' },
  { nombre: 'Mostaza Gold', hex: '#D97706' },
  { nombre: 'Dorado Premium', hex: '#C9A84C' },
  { nombre: 'Rosa Pastel', hex: '#F472B6' },
  { nombre: 'Beige Arena', hex: '#E5E0D8' },
];

export type FitMode = 'ajustar' | 'calzar' | 'expandir' | 'repetir' | 'manual';

export interface CustomImage {
  id: string;
  src: string;
  name: string;
  imgElement: HTMLImageElement;
  x: number; // -80 to 80
  y: number; // -80 to 80
  scale: number; // 20 to 160
  rotation: number; // -180 to 180
  flipX: boolean;
  fitMode: FitMode;
  repeatScale: number; // 2 to 8
}

// Especificaciones geométricas calibradas por producto para centrado y calce 100% perfecto
export interface ProductPrintSpec {
  aspectCorrection: number; // Factor de corrección ancho / alto de la superficie 3D
  defaultScale: number; // Escala inicial idónea (ocupa 65-75% del área imprimible)
  presets: { id: string; label: string; x: number; y: number; scale: number }[];
}

export const PRODUCT_PRINT_SPECS: Record<string, ProductPrintSpec> = {
  polera: {
    aspectCorrection: 0.87,
    defaultScale: 70,
    presets: [
      { id: 'pecho-centro', label: 'Pecho Centro', x: 0, y: 0, scale: 70 },
      { id: 'bolsillo-izq', label: 'Bolsillo / Escudo', x: -30, y: 22, scale: 32 },
      { id: 'pecho-der', label: 'Pecho Der.', x: 30, y: 22, scale: 32 },
      { id: 'abdomen', label: 'Abdomen', x: 0, y: -30, scale: 65 },
      { id: 'grande', label: 'Grande Frontal', x: 0, y: 0, scale: 95 },
    ],
  },
  poleron: {
    aspectCorrection: 0.89,
    defaultScale: 68,
    presets: [
      { id: 'pecho-centro', label: 'Pecho Centro', x: 0, y: 0, scale: 68 },
      { id: 'bolsillo-izq', label: 'Bolsillo / Escudo', x: -28, y: 20, scale: 30 },
      { id: 'pecho-der', label: 'Pecho Der.', x: 28, y: 20, scale: 30 },
      { id: 'canguro', label: 'Bolsillo Canguro', x: 0, y: -35, scale: 60 },
      { id: 'grande', label: 'Grande Frontal', x: 0, y: 0, scale: 90 },
    ],
  },
  taza: {
    aspectCorrection: 1.88,
    defaultScale: 75,
    presets: [
      { id: 'frente-centro', label: 'Frente Centro', x: 0, y: 0, scale: 75 },
      { id: 'lado-izq', label: 'Lado Izquierdo', x: -35, y: 0, scale: 65 },
      { id: 'lado-der', label: 'Lado Derecho', x: 35, y: 0, scale: 65 },
      { id: 'panoramica', label: 'Panorámica 360°', x: 0, y: 0, scale: 120 },
    ],
  },
  termo: {
    aspectCorrection: 1.28,
    defaultScale: 75,
    presets: [
      { id: 'frente-centro', label: 'Frente Centro', x: 0, y: 0, scale: 75 },
      { id: 'superior', label: 'Superior', x: 0, y: 35, scale: 55 },
      { id: 'inferior', label: 'Inferior', x: 0, y: -35, scale: 55 },
      { id: 'completo', label: 'Vertical Completo', x: 0, y: 0, scale: 110 },
    ],
  },
  vaso: {
    aspectCorrection: 1.58,
    defaultScale: 70,
    presets: [
      { id: 'frente-centro', label: 'Frente Centro', x: 0, y: 0, scale: 70 },
      { id: 'superior', label: 'Superior', x: 0, y: 25, scale: 55 },
      { id: 'inferior', label: 'Inferior', x: 0, y: -25, scale: 55 },
      { id: 'completo', label: 'Completo', x: 0, y: 0, scale: 95 },
    ],
  },
  gorra: {
    aspectCorrection: 1.44,
    defaultScale: 75,
    presets: [
      { id: 'frente-centro', label: 'Frente Centro', x: 0, y: 0, scale: 75 },
      { id: 'frontal-izq', label: 'Frontal Izq.', x: -25, y: 0, scale: 50 },
      { id: 'frontal-der', label: 'Frontal Der.', x: 25, y: 0, scale: 50 },
      { id: 'panel-completo', label: 'Panel Completo', x: 0, y: 0, scale: 95 },
    ],
  },
  pantalon: {
    aspectCorrection: 0.71,
    defaultScale: 70,
    presets: [
      { id: 'muslo-medio', label: 'Muslo Medio', x: 0, y: 0, scale: 70 },
      { id: 'muslo-superior', label: 'Muslo Superior', x: 0, y: 28, scale: 55 },
      { id: 'cerca-bolsillo', label: 'Cerca de Bolsillo', x: 20, y: 35, scale: 45 },
      { id: 'pierna-completa', label: 'Pierna Completa', x: 0, y: 0, scale: 95 },
    ],
  },
};

export const getProductPrintSpec = (prod: string, sub: string): ProductPrintSpec => {
  if (sub === 'poleron' || prod === 'poleron') return PRODUCT_PRINT_SPECS.poleron;
  return PRODUCT_PRINT_SPECS[prod] || PRODUCT_PRINT_SPECS.polera;
};

type ActiveTab = 'imagenes' | 'color' | 'estilo' | 'texto';

export default function DisenadorEditor() {
  const { producto = 'polera' } = useParams<{ producto: string }>();
  const viewer3DRef = useRef<Viewer3DRef | null>(null);
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sub-type selection
  const subtypesList = PRODUCT_SUBTYPES[producto] || [];
  const [subTipo, setSubTipo] = useState<string>(subtypesList[0]?.id || 'default');

  // External Design state (Outside 3D)
  const [activeTab, setActiveTab] = useState<ActiveTab>('imagenes');
  const [productColor, setProductColor] = useState('#FFFFFF');
  const [selectedTalla, setSelectedTalla] = useState('M');
  const [cantidad, setCantidad] = useState(1);

  // Multiple Images State
  const [images, setImages] = useState<CustomImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Mobile Bottom-Sheet Controls Modal State
  const [showMobileControls, setShowMobileControls] = useState(false);

  // Text state
  const [customText, setCustomText] = useState('');
  const [textFont, setTextFont] = useState(FONT_OPTIONS[0].value);
  const [textColor, setTextColor] = useState('#111111');
  const [textSize, setTextSize] = useState(40); // 16 to 80
  const [textPosX, setTextPosX] = useState(0); // -100 to 100
  const [textPosY, setTextPosY] = useState(0); // -100 to 100 (centrado)

  // 3D & Preview state
  const [textureVersion, setTextureVersion] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [printUrl, setPrintUrl] = useState('');

  const { addItem, openCart } = useCartStore();
  const { data: editor } = useAsync(() => catalogoApi.editor(), []);
  const tallasStandard = editor?.tallas ?? [];
  const precio = editor?.precios?.[producto] ?? 15000;
  const label = PRODUCT_LABELS[producto] ?? producto;

  const currentSubtypeName = subtypesList.find(s => s.id === subTipo)?.label || label;
  const currentImage = images.find(img => img.id === selectedImageId) || images[0] || null;
  const currentSpec = getProductPrintSpec(producto, subTipo);

  useSEO({
    title: `Diseñar ${currentSubtypeName} en 3D · RC Estampa`,
    description: `Crea y personaliza tu ${currentSubtypeName} en 3D interactivo 360° con estampado DTF textil o grabado láser. Despacho a todo Chile.`,
  });

  // Redraw the 2D texture canvas with all uploaded images & text based on fit modes and 3D surface geometry
  const redrawTexture = useCallback(() => {
    if (!textureCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = TEXTURE_CANVAS_SIZE;
      c.height = TEXTURE_CANVAS_SIZE;
      textureCanvasRef.current = c;
    }

    const canvas = textureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Transparent clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerW = canvas.width / 2;
    const centerH = canvas.height / 2;

    const activeSpec = getProductPrintSpec(producto, subTipo);
    const aspectCorrection = activeSpec.aspectCorrection;

    // 1. Draw all images according to their fit modes and calibrated 3D surface geometry
    images.forEach((imgItem) => {
      const img = imgItem.imgElement;
      if (!img) return;

      const imgW = img.width || 1;
      const imgH = img.height || 1;
      const rawAspect = imgW / imgH;

      // Compensate for 3D model surface aspect ratio so images never stretch or squash
      const effectiveAspect = rawAspect / aspectCorrection;

      ctx.save();

      if (imgItem.fitMode === 'repetir') {
        // --- MODO REPETIR / PATRÓN MOSAICO (ALL-OVER) ---
        const repeatCols = Math.max(2, imgItem.repeatScale || 4);
        const tileSize = canvas.width / repeatCols;
        const tileH = tileSize;

        ctx.globalAlpha = 0.95;
        for (let row = 0; row < repeatCols; row++) {
          for (let col = 0; col < repeatCols; col++) {
            const tx = col * tileSize + tileSize / 2;
            const ty = row * tileH + tileH / 2;

            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate((imgItem.rotation * Math.PI) / 180);
            if (imgItem.flipX) ctx.scale(-1, 1);

            let dw = tileSize * 0.85;
            let dh = (tileSize / effectiveAspect) * 0.85;
            if (effectiveAspect < 1) {
              dh = tileSize * 0.85;
              dw = tileSize * effectiveAspect * 0.85;
            }
            ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
            ctx.restore();
          }
        }
      } else if (imgItem.fitMode === 'expandir') {
        // --- MODO EXPANDIR (Full Stretch) ---
        const posX = centerW + (imgItem.x * 4.2);
        const posY = centerH - (imgItem.y * 4.2);
        const scaleMul = (imgItem.scale / 100);

        ctx.translate(posX, posY);
        ctx.rotate((imgItem.rotation * Math.PI) / 180);
        if (imgItem.flipX) ctx.scale(-1, 1);
        ctx.drawImage(img, (-centerW * scaleMul), (-centerH * scaleMul), canvas.width * scaleMul, canvas.height * scaleMul);

      } else if (imgItem.fitMode === 'calzar') {
        // --- MODO CALZAR TODO (Full Cover Proporcional) ---
        const posX = centerW + (imgItem.x * 4.2);
        const posY = centerH - (imgItem.y * 4.2);
        const scaleMul = (imgItem.scale / 100);

        ctx.translate(posX, posY);
        ctx.rotate((imgItem.rotation * Math.PI) / 180);
        if (imgItem.flipX) ctx.scale(-1, 1);

        const baseCover = Math.max(canvas.width, canvas.height * effectiveAspect) * scaleMul;
        let drawW = baseCover;
        let drawH = baseCover / effectiveAspect;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      } else {
        // --- MODO AJUSTAR / MANUAL (Contain Proporcional Centrado y Ajustado a Dimensiones) ---
        const baseSize = 720 * (imgItem.scale / 100);
        let drawW = baseSize;
        let drawH = baseSize / effectiveAspect;
        if (effectiveAspect < 1) {
          drawH = baseSize;
          drawW = baseSize * effectiveAspect;
        }

        const posX = centerW + (imgItem.x * 4.2);
        const posY = centerH - (imgItem.y * 4.2);

        ctx.translate(posX, posY);
        ctx.rotate((imgItem.rotation * Math.PI) / 180);
        if (imgItem.flipX) ctx.scale(-1, 1);

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      }

      ctx.restore();
    });

    // 2. Draw Custom Text if provided (Centrado y calibrado)
    if (customText.trim()) {
      const posX = centerW + (textPosX * 4.2);
      const posY = centerH - (textPosY * 4.2);

      ctx.save();
      ctx.translate(posX, posY);
      ctx.font = `bold ${textSize * 1.8}px ${textFont}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Multi-line support
      const lines = customText.split('\n');
      const lineHeight = textSize * 2.1;
      const startY = -((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, 0, startY + (index * lineHeight));
      });

      ctx.restore();
    }

    setTextureVersion((v) => v + 1);
  }, [
    images,
    producto,
    subTipo,
    customText,
    textFont,
    textColor,
    textSize,
    textPosX,
    textPosY,
  ]);

  // Trigger texture redraw on changes and ensure initial canvas
  useEffect(() => {
    if (!textureCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = TEXTURE_CANVAS_SIZE;
      c.height = TEXTURE_CANVAS_SIZE;
      textureCanvasRef.current = c;
    }
    redrawTexture();
  }, [redrawTexture]);

  // Handle Multi-Image file upload (Centrado y ajustado al 100% de inicio)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || images.length >= MAX_IMAGES) return;

    const activeSpec = getProductPrintSpec(producto, subTipo);

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newImg: CustomImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          src,
          name: file.name,
          imgElement: img,
          x: 0, // Inicia 100% centrado horizontalmente
          y: 0, // Inicia 100% centrado verticalmente
          scale: activeSpec.defaultScale, // Ajustado a la proporción ideal del modelo
          rotation: 0,
          flipX: false,
          fitMode: 'ajustar',
          repeatScale: 4,
        };
        setImages((prev) => [...prev, newImg]);
        setSelectedImageId(newImg.id);
        setActiveTab('imagenes');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Update selected image attributes
  const updateCurrentImage = (partial: Partial<CustomImage>) => {
    if (!currentImage) return;
    setImages((prev) =>
      prev.map((item) => (item.id === currentImage.id ? { ...item, ...partial } : item))
    );
  };

  const removeCurrentImage = () => {
    if (!currentImage) return;
    setImages((prev) => {
      const filtered = prev.filter((item) => item.id !== currentImage.id);
      setSelectedImageId(filtered[0]?.id || null);
      return filtered;
    });
  };

  // Quick Position Presets con datos calibrados por producto
  const applyPreset = (preset: { x: number; y: number; scale: number }) => {
    if (!currentImage) return;
    updateCurrentImage({
      x: preset.x,
      y: preset.y,
      scale: preset.scale,
      fitMode: 'manual',
    });
  };

  // Capture final print file & open Confirmation Modal
  const openPreview = () => {
    if (!viewer3DRef.current) return;
    const snap = viewer3DRef.current.getSnapshot();
    setPreviewUrl(snap);

    if (textureCanvasRef.current) {
      setPrintUrl(textureCanvasRef.current.toDataURL('image/png', 1.0));
    }
    setPreviewOpen(true);
  };

  // Add to cart with snapshot
  const addToCart = async () => {
    let imagen = previewUrl;
    let disenoId: number | undefined;

    try {
      const res = await disenosApi.crear({
        imagen_base64: printUrl || previewUrl,
        prenda: currentSubtypeName,
        color_base: productColor,
        talla: selectedTalla,
      });
      imagen = res.imagen;
      disenoId = res.id;
    } catch {
      // Fallback local
    }

    addItem({
      tipo: 'diseno',
      id: `diseno-${Date.now()}`,
      disenoId,
      nombre: `${currentSubtypeName} personalizada (3D)`,
      imagen,
      prenda: currentSubtypeName,
      color_base: productColor,
      talla: selectedTalla,
      precio,
      cantidad,
    });
    openCart();
    setPreviewOpen(false);
  };

  // Reusable Image Controls Panel (Used outside 3D in Desktop/Tablet sidebar, and in Mobile Drawer)
  const renderImageControls = () => {
    if (!currentImage) return null;

    return (
      <div className="d-flex flex-column gap-3 p-3 bg-card border border-border rounded-3 font-montserrat shadow-sm">
        {/* Active Image Indicator */}
        <div className="d-flex align-items-center justify-content-between pb-2 border-bottom border-border">
          <div className="d-flex align-items-center gap-2">
            <img src={currentImage.src} alt={currentImage.name} className="rounded object-fit-contain bg-elevated p-1 border" style={{ width: '36px', height: '36px' }} />
            <div>
              <span className="fw-semibold text-text d-block text-truncate" style={{ fontSize: '0.8rem', maxWidth: '160px' }}>
                {currentImage.name}
              </span>
              <span className="text-muted" style={{ fontSize: '0.68rem' }}>Ajuste milimétrico 100% libre</span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeCurrentImage}
            className="btn btn-sm btn-outline-danger p-1 d-inline-flex align-items-center gap-1"
            style={{ fontSize: '0.7rem' }}
          >
            <Trash2 size={13} />
            Eliminar
          </button>
        </div>

        {/* 1. Modos de Calce */}
        <div>
          <span className="text-muted d-block mb-1 fw-semibold" style={{ fontSize: '0.7rem' }}>MODO DE CALCE:</span>
          <div className="d-grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <button
              type="button"
              onClick={() => updateCurrentImage({ fitMode: 'ajustar' })}
              title="Ajustar proporcional centrado"
              className={`btn btn-sm p-1 d-flex flex-column align-items-center justify-content-center rounded-2 border ${
                currentImage.fitMode === 'ajustar' ? 'btn-primary text-black fw-bold' : 'bg-elevated text-muted border-border'
              }`}
              style={{ fontSize: '0.65rem' }}
            >
              <Minimize2 size={13} className="mb-1" />
              Ajustar
            </button>

            <button
              type="button"
              onClick={() => updateCurrentImage({ fitMode: 'calzar' })}
              title="Calzar todo el diseño"
              className={`btn btn-sm p-1 d-flex flex-column align-items-center justify-content-center rounded-2 border ${
                currentImage.fitMode === 'calzar' ? 'btn-primary text-black fw-bold' : 'bg-elevated text-muted border-border'
              }`}
              style={{ fontSize: '0.65rem' }}
            >
              <Maximize2 size={13} className="mb-1" />
              Calzar
            </button>

            <button
              type="button"
              onClick={() => updateCurrentImage({ fitMode: 'expandir' })}
              title="Expandir en toda el área"
              className={`btn btn-sm p-1 d-flex flex-column align-items-center justify-content-center rounded-2 border ${
                currentImage.fitMode === 'expandir' ? 'btn-primary text-black fw-bold' : 'bg-elevated text-muted border-border'
              }`}
              style={{ fontSize: '0.65rem' }}
            >
              <Layers size={13} className="mb-1" />
              Expandir
            </button>

            <button
              type="button"
              onClick={() => updateCurrentImage({ fitMode: 'repetir' })}
              title="Repetir en patrón / mosaico"
              className={`btn btn-sm p-1 d-flex flex-column align-items-center justify-content-center rounded-2 border ${
                currentImage.fitMode === 'repetir' ? 'btn-primary text-black fw-bold' : 'bg-elevated text-muted border-border'
              }`}
              style={{ fontSize: '0.65rem' }}
            >
              <Grid size={13} className="mb-1" />
              Mosaico
            </button>

            <button
              type="button"
              onClick={() => updateCurrentImage({ fitMode: 'manual' })}
              title="Ajuste manual milimétrico"
              className={`btn btn-sm p-1 d-flex flex-column align-items-center justify-content-center rounded-2 border ${
                currentImage.fitMode === 'manual' ? 'btn-primary text-black fw-bold' : 'bg-elevated text-muted border-border'
              }`}
              style={{ fontSize: '0.65rem' }}
            >
              <Sliders size={13} className="mb-1" />
              Manual
            </button>
          </div>
        </div>

        {/* 2. Presets de Posición Rápida Calibrados por Producto */}
        <div>
          <span className="text-muted d-block mb-1 fw-semibold" style={{ fontSize: '0.7rem' }}>POSICIONES RÁPIDAS ({currentSpec.presets.length}):</span>
          <div className="d-flex flex-wrap gap-1">
            {currentSpec.presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="btn btn-sm py-1 px-2 bg-elevated text-text rounded-2 border border-border"
                style={{ fontSize: '0.7rem' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Sliders de Ajuste Fino */}
        {currentImage.fitMode === 'repetir' ? (
          <div>
            <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.72rem' }}>
              <span>🔁 Densidad del Patrón (Mosaico)</span>
              <span className="text-primary fw-bold">{currentImage.repeatScale}x{currentImage.repeatScale}</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={currentImage.repeatScale || 4}
              onChange={(e) => updateCurrentImage({ repeatScale: Number(e.target.value) })}
              className="form-range w-100"
            />
          </div>
        ) : (
          <div className="row g-3 pt-1">
            <div className="col-6">
              <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                <span>↕️ Vertical</span>
                <span className="text-text fw-semibold">{currentImage.y}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={currentImage.y}
                onChange={(e) => updateCurrentImage({ y: Number(e.target.value) })}
                className="form-range w-100"
              />
            </div>

            <div className="col-6">
              <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                <span>↔️ Horizontal</span>
                <span className="text-text fw-semibold">{currentImage.x}</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                value={currentImage.x}
                onChange={(e) => updateCurrentImage({ x: Number(e.target.value) })}
                className="form-range w-100"
              />
            </div>

            <div className="col-6">
              <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                <span>🔍 Tamaño</span>
                <span className="text-text fw-semibold">{currentImage.scale}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="160"
                value={currentImage.scale}
                onChange={(e) => updateCurrentImage({ scale: Number(e.target.value) })}
                className="form-range w-100"
              />
            </div>

            <div className="col-6">
              <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                <span>🔄 Rotación</span>
                <span className="text-text fw-semibold">{currentImage.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={currentImage.rotation}
                onChange={(e) => updateCurrentImage({ rotation: Number(e.target.value) })}
                className="form-range w-100"
              />
            </div>
          </div>
        )}

        {/* Acciones de Espejo y Centrado */}
        <div className="d-flex gap-2 pt-1 border-top border-border">
          <button
            type="button"
            onClick={() => updateCurrentImage({ flipX: !currentImage.flipX })}
            className={`btn btn-sm flex-grow-1 py-1 d-inline-flex align-items-center justify-content-center gap-1 rounded-2 border ${
              currentImage.flipX ? 'btn-primary text-black fw-semibold' : 'bg-elevated text-text border-border'
            }`}
            style={{ fontSize: '0.72rem' }}
          >
            <FlipHorizontal size={13} />
            Efecto Espejo
          </button>

          <button
            type="button"
            onClick={() => updateCurrentImage({ x: 0, y: 0, scale: currentSpec.defaultScale, rotation: 0, flipX: false, fitMode: 'ajustar' })}
            className="btn btn-sm py-1 px-3 bg-elevated text-text rounded-2 border border-border d-inline-flex align-items-center gap-1"
            style={{ fontSize: '0.72rem' }}
          >
            <AlignCenter size={13} />
            Centrar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container-xxl py-4">
      {/* Header Breadcrumb */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2 font-montserrat text-muted" style={{ fontSize: '0.8rem' }}>
          <Link to="/disenar" className="d-flex align-items-center gap-1 text-muted text-decoration-none">
            <ArrowLeft size={14} />
            Cambiar producto
          </Link>
          <span>/</span>
          <span className="text-text fw-semibold">{currentSubtypeName}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary-10 text-primary border border-primary-20 font-montserrat px-3 py-1 d-flex align-items-center gap-1">
            <Sparkles size={12} />
            Visualizador 3D Interactivo 360°
          </span>
        </div>
      </div>

      {/* Main 3D Customizer Layout */}
      <div className="row g-4 align-items-stretch">
        
        {/* Left Column: 3D Canvas Viewport (100% LIMPIO EN PC Y TABLET) */}
        <div className="col-12 col-lg-7 d-flex flex-column">
          <div className="w-100 h-100 bg-elevated border border-border rounded-4 p-2 position-relative shadow-sm d-flex flex-column justify-content-center overflow-hidden" style={{ minHeight: '560px' }}>
            <Viewer3D
              ref={viewer3DRef}
              producto={producto}
              subTipo={subTipo}
              productColor={productColor}
              canvasSource={textureCanvasRef.current}
              textureVersion={textureVersion}
            />

            {/* Mobile Only Floating Action Bubble (Burbuja Flotante tipo Dropdown para Celulares) */}
            {(images.length > 0 || customText.trim()) && (
              <div className="d-block d-md-none position-absolute bottom-0 end-0 m-3 z-3">
                <button
                  type="button"
                  onClick={() => setShowMobileControls(true)}
                  className="btn btn-primary rounded-pill shadow-lg py-2 px-3 d-flex align-items-center gap-2 font-montserrat fw-semibold"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Sliders size={16} />
                  Ajustar Diseño ({images.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Exterior Design Controls (Imágenes, Color, Estilo, Texto, Pedido) */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-3">
          
          {/* Main Exterior Tabs */}
          <div className="d-flex bg-elevated border border-border rounded-3 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('imagenes')}
              className={`flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
                activeTab === 'imagenes' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              <ImageIcon size={13} />
              Imágenes ({images.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('color')}
              className={`flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
                activeTab === 'color' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              <Palette size={13} />
              Colores & Talla
            </button>

            {subtypesList.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveTab('estilo')}
                className={`flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
                  activeTab === 'estilo' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
                }`}
                style={{ fontSize: '0.75rem' }}
              >
                {producto === 'polera' ? <Shirt size={13} /> : producto === 'vaso' ? <GlassWater size={13} /> : <Coffee size={13} />}
                Estilo
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('texto')}
              className={`flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-2 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
                activeTab === 'texto' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
              }`}
              style={{ fontSize: '0.75rem' }}
            >
              <Type size={13} />
              Texto
            </button>
          </div>

          {/* TAB 1: GESTIÓN DE IMÁGENES Y CONTROLES MILIMÉTRICOS (OUTSIDE 3D EN PC/TABLET) */}
          {activeTab === 'imagenes' && (
            <div className="d-flex flex-column gap-3">
              <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between">
                  <span className="font-montserrat fw-semibold text-text" style={{ fontSize: '0.85rem' }}>
                    Subir Logos y Diseños ({images.length}/{MAX_IMAGES})
                  </span>
                  {images.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 font-montserrat"
                      style={{ fontSize: '0.72rem' }}
                    >
                      <PlusCircle size={13} />
                      Añadir imagen
                    </button>
                  )}
                </div>

                {/* Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-primary border-opacity-50 bg-primary-10 rounded-3 p-3 text-center d-flex flex-column align-items-center gap-1 cursor-pointer transition-all hover-opacity"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="rounded-circle bg-card d-flex align-items-center justify-content-center shadow-sm" style={{ width: '2.8rem', height: '2.8rem' }}>
                    <Upload size={18} className="text-primary" />
                  </div>
                  <p className="font-montserrat fw-semibold text-text mb-0" style={{ fontSize: '0.8rem' }}>
                    Haz clic para subir un logo o ilustración
                  </p>
                  <span className="font-montserrat text-muted" style={{ fontSize: '0.68rem' }}>
                    PNG, JPG o SVG transparente
                  </span>
                </div>

                {/* Uploaded Images Pills Selector */}
                {images.length > 0 && (
                  <div className="d-flex flex-column gap-2 pt-1">
                    <span className="font-montserrat text-muted" style={{ fontSize: '0.72rem' }}>Imágenes añadidas al modelo:</span>
                    <div className="d-flex flex-wrap gap-2">
                      {images.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedImageId(item.id)}
                          className={`btn btn-sm py-1 px-2 rounded-2 font-montserrat d-flex align-items-center gap-2 transition-all ${
                            (selectedImageId === item.id || (!selectedImageId && idx === 0))
                              ? 'btn-primary text-black fw-bold'
                              : 'bg-elevated text-text border border-border'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          <img src={item.src} alt={item.name} className="rounded object-fit-contain bg-card" style={{ width: '18px', height: '18px' }} />
                          <span className="text-truncate" style={{ maxWidth: '100px' }}>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="d-none" />
              </div>

              {/* Dedicated Image Configuration Controls (Position, Scale, Rotation, Fit Mode) */}
              {images.length > 0 && currentImage && renderImageControls()}
            </div>
          )}

          {/* TAB 2: PALETA DE COLORES Y TALLAS */}
          {activeTab === 'color' && (
            <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3">
              <span className="font-montserrat fw-semibold text-text" style={{ fontSize: '0.85rem' }}>
                Color Base y Especificaciones
              </span>

              <div>
                <label className="font-montserrat text-muted mb-2 d-block" style={{ fontSize: '0.72rem' }}>Color del producto (100% Personalizable)</label>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setProductColor(c.hex)}
                      title={c.nombre}
                      className={`rounded-circle border border-2 ${productColor === c.hex ? 'border-primary' : 'border-border'}`}
                      style={{ width: '2.1rem', height: '2.1rem', backgroundColor: c.hex, transform: productColor === c.hex ? 'scale(1.15)' : undefined }}
                    />
                  ))}
                  <div className="d-flex align-items-center gap-2 ms-1">
                    <input
                      type="color"
                      value={productColor}
                      onChange={(e) => setProductColor(e.target.value)}
                      title="Color personalizado libre"
                      className="rounded-circle border border-2 border-border bg-transparent"
                      style={{ width: '2.2rem', height: '2.2rem', cursor: 'pointer', overflow: 'hidden' }}
                    />
                    <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>{productColor}</span>
                  </div>
                </div>
              </div>

              {['polera', 'gorra', 'pantalon'].includes(producto) && (
                <div>
                  <label className="font-montserrat text-muted mb-2 d-block" style={{ fontSize: '0.72rem' }}>Talla</label>
                  <div className="d-flex flex-wrap gap-2">
                    {tallasStandard.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTalla(t)}
                        className={`px-3 py-1 rounded border font-montserrat fw-semibold bg-transparent ${
                          selectedTalla === t ? 'border-primary bg-primary-10 text-primary' : 'border-border text-muted'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ESTILOS / SUB-TIPOS */}
          {activeTab === 'estilo' && subtypesList.length > 0 && (
            <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3">
              <div>
                <span className="font-montserrat fw-semibold text-text" style={{ fontSize: '0.85rem' }}>
                  Selecciona el estilo de {label}
                </span>
                <p className="font-montserrat text-muted mb-0 mt-1" style={{ fontSize: '0.72rem' }}>
                  El modelo 3D cambiará su silueta y acabados en tiempo real.
                </p>
              </div>

              <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {subtypesList.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSubTipo(item.id)}
                    className={`btn text-start p-3 border rounded-3 d-flex flex-column justify-content-between transition-all ${
                      subTipo === item.id ? 'btn-primary shadow-sm' : 'bg-elevated border-border text-muted'
                    }`}
                  >
                    <span className="font-montserrat fw-bold d-block" style={{ fontSize: '0.8rem' }}>
                      {item.label}
                    </span>
                    <span className="font-montserrat mt-1 d-block opacity-75" style={{ fontSize: '0.68rem' }}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TEXTO PERSONALIZADO */}
          {activeTab === 'texto' && (
            <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3 font-montserrat">
              <span className="fw-semibold text-text" style={{ fontSize: '0.85rem' }}>
                Añadir Frase o Texto
              </span>

              <div>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.72rem' }}>Escribe tu texto</label>
                <textarea
                  rows={2}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ej: RC Estampa · 2026"
                  className="form-control bg-elevated border-border text-text font-montserrat"
                  style={{ fontSize: '0.8rem', resize: 'none' }}
                />
              </div>

              {customText.trim() && (
                <div className="d-flex flex-column gap-3">
                  <div>
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.72rem' }}>Tipografía</label>
                    <div className="d-grid gap-1" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      {FONT_OPTIONS.map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setTextFont(f.value)}
                          className={`btn btn-sm text-start py-1 px-2 border font-montserrat ${
                            textFont === f.value ? 'btn-primary' : 'border-border text-muted bg-transparent'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.72rem' }}>Color del texto</label>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      {['#FFFFFF', '#111111', '#C9A84C', '#D4AF37', '#DC2626', '#1E3A8A', '#15803D'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTextColor(c)}
                          className={`rounded-circle border border-2 ${textColor === c ? 'border-primary' : 'border-border'}`}
                          style={{ width: '1.6rem', height: '1.6rem', backgroundColor: c, transform: textColor === c ? 'scale(1.15)' : undefined }}
                        />
                      ))}
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="rounded-circle border border-2 border-border bg-transparent"
                        style={{ width: '1.6rem', height: '1.6rem', cursor: 'pointer', overflow: 'hidden' }}
                      />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.68rem' }}>
                        <span>↕️ Posición V</span>
                        <span className="text-text fw-semibold">{textPosY}</span>
                      </div>
                      <input
                        type="range"
                        min="-80"
                        max="80"
                        value={textPosY}
                        onChange={(e) => setTextPosY(Number(e.target.value))}
                        className="form-range w-100"
                      />
                    </div>

                    <div className="col-6">
                      <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.68rem' }}>
                        <span>↔️ Posición H</span>
                        <span className="text-text fw-semibold">{textPosX}</span>
                      </div>
                      <input
                        type="range"
                        min="-80"
                        max="80"
                        value={textPosX}
                        onChange={(e) => setTextPosX(Number(e.target.value))}
                        className="form-range w-100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: '0.68rem' }}>
                      <span>🔍 Tamaño de letra</span>
                      <span className="text-text fw-semibold">{textSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="70"
                      value={textSize}
                      onChange={(e) => setTextSize(Number(e.target.value))}
                      className="form-range w-100"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resumen del Pedido y Agregar */}
          <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3 mt-auto">
            <div className="d-flex justify-content-between align-items-center font-montserrat">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>{currentSubtypeName}</span>
              <span className="text-primary fw-bold" style={{ fontSize: '1rem' }}>{formatPrice(precio * cantidad)}</span>
            </div>

            <div className="d-flex align-items-center justify-content-between pt-1">
              <span className="font-montserrat text-muted" style={{ fontSize: '0.75rem' }}>Cantidad:</span>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="btn btn-sm btn-secondary p-1 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px' }}
                >
                  <Minus size={12} />
                </button>
                <span className="font-montserrat fw-semibold text-text text-center" style={{ width: '24px', fontSize: '0.85rem' }}>
                  {cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => setCantidad(cantidad + 1)}
                  className="btn btn-sm btn-secondary p-1 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px' }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={openPreview}
              className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2 font-montserrat fw-semibold shadow-sm"
              style={{ fontSize: '0.85rem' }}
            >
              <Eye size={15} />
              Vista Previa 3D y Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Modal for Controls (Burbuja Dropmenu en Teléfono) */}
      <Modal show={showMobileControls} onHide={() => setShowMobileControls(false)} centered className="d-block d-md-none">
        <Modal.Body className="p-3 bg-card border border-border rounded-4">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-border">
            <div className="d-flex align-items-center gap-2 font-montserrat">
              <Sliders size={16} className="text-primary" />
              <span className="fw-bold text-text" style={{ fontSize: '0.9rem' }}>Ajustes del Diseño</span>
            </div>
            <button type="button" onClick={() => setShowMobileControls(false)} className="btn btn-sm btn-link text-muted p-0">
              <X size={18} />
            </button>
          </div>
          {renderImageControls()}
          <div className="mt-3">
            <button type="button" onClick={() => setShowMobileControls(false)} className="btn btn-primary w-100 py-2 font-montserrat fw-semibold" style={{ fontSize: '0.8rem' }}>
              Cerrar y Ver en 3D
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Preview & Confirmation Modal */}
      <Modal show={previewOpen} onHide={() => setPreviewOpen(false)} centered size="lg">
        <Modal.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h3 className="font-italiana text-text mb-0" style={{ fontSize: '1.4rem' }}>
                Confirmación de Diseño 3D
              </h3>
            </div>
            <button onClick={() => setPreviewOpen(false)} className="btn btn-link p-0 text-muted">✕</button>
          </div>

          <div className="row g-3 mb-3">
            {/* 3D Snapshot */}
            <div className="col-12 col-md-8">
              <div className="bg-elevated border border-border rounded-3 p-3 text-center">
                <img src={previewUrl} alt="Mockup 3D" className="w-100 object-fit-contain rounded" style={{ maxHeight: '20rem' }} />
                <div className="mt-2 text-muted font-montserrat" style={{ fontSize: '0.72rem' }}>
                  ✓ Mockup 3D fotorrealista generado en tiempo real
                </div>
              </div>
            </div>

            {/* Print File & Specifications */}
            <div className="col-12 col-md-4 d-flex flex-column gap-2">
              <div className="bg-elevated border border-border rounded-3 p-3 text-center flex-grow-1 d-flex flex-column justify-content-center">
                <p className="font-montserrat fw-semibold text-text mb-1" style={{ fontSize: '0.75rem' }}>
                  Base de Estampado (300 DPI)
                </p>
                {printUrl ? (
                  <img src={printUrl} alt="Base Estampado" className="w-100 object-fit-contain rounded my-2" style={{ maxHeight: '7rem' }} />
                ) : (
                  <div className="text-muted font-montserrat my-2" style={{ fontSize: '0.72rem' }}>Sin estampados adicionales</div>
                )}
                <span className="badge bg-primary-10 text-primary border border-primary-20 font-montserrat fw-normal" style={{ fontSize: '0.68rem' }}>
                  ✓ Listo para Taller DTF / Grabado Láser
                </span>
              </div>

              <div className="bg-elevated border border-border rounded-3 p-3 d-flex flex-column gap-2">
                <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.78rem' }}>
                  <span className="text-muted">Modelo</span>
                  <span className="text-text fw-semibold">{currentSubtypeName}</span>
                </div>
                {['polera', 'gorra', 'pantalon'].includes(producto) && (
                  <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.78rem' }}>
                    <span className="text-muted">Talla</span>
                    <span className="text-text">{selectedTalla}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.78rem' }}>
                  <span className="text-muted">Color Base</span>
                  <div className="d-flex align-items-center gap-1">
                    <span className="rounded-circle border" style={{ width: '12px', height: '12px', backgroundColor: productColor }} />
                    <span className="text-text" style={{ fontSize: '0.72rem' }}>{productColor}</span>
                  </div>
                </div>
                <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.78rem' }}>
                  <span className="text-muted">Cantidad</span>
                  <span className="text-text">{cantidad}</span>
                </div>
                <div className="d-flex justify-content-between font-montserrat fw-bold pt-2 border-top border-border" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted">Total</span>
                  <span className="text-primary">{formatPrice(precio * cantidad)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 mt-3">
            <button onClick={addToCart} className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-3 font-montserrat fw-semibold">
              <ShoppingBag size={15} />
              Agregar al Carrito
            </button>
            <button onClick={() => setPreviewOpen(false)} className="btn btn-secondary flex-grow-1 py-3 font-montserrat">
              Seguir Editando
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
