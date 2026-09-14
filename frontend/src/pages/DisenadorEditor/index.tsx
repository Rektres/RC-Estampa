import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import {
  Upload, Trash2, FlipHorizontal, Eye,
  Minus, Plus, ShoppingBag, ArrowLeft, Type,
  Sparkles, Palette, Image as ImageIcon
} from 'lucide-react';
import { formatPrice } from '../../utils';
import { useCartStore } from '../../store/cartStore';
import { catalogoApi, disenosApi } from '../../api';
import { useAsync } from '../../api/hooks';
import { useSEO } from '../../hooks/useSEO';
import { Viewer3D, Viewer3DRef } from '../../components/common/Viewer3D';

const TEXTURE_CANVAS_SIZE = 1024;

const PRODUCT_LABELS: Record<string, string> = {
  polera: 'Polera',
  gorra: 'Gorra',
  pantalon: 'Pantalón',
  taza: 'Taza',
  termo: 'Termo',
  vaso: 'Vaso',
};

const FONT_OPTIONS = [
  { label: 'Elegante (Italiana)', value: 'Italiana, serif' },
  { label: 'Moderna (Montserrat)', value: 'Montserrat, sans-serif' },
  { label: 'Impacto (Bold)', value: 'Impact, sans-serif' },
  { label: 'Cursiva (Script)', value: 'cursive, Georgia, serif' },
];

type ActiveTab = 'logo' | 'texto' | 'color';

export default function DisenadorEditor() {
  const { producto = 'polera' } = useParams<{ producto: string }>();
  const viewer3DRef = useRef<Viewer3DRef | null>(null);
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  // Design state
  const [activeTab, setActiveTab] = useState<ActiveTab>('logo');
  const [productColor, setProductColor] = useState('#F0EDE8');
  const [selectedTalla, setSelectedTalla] = useState('M');
  const [cantidad, setCantidad] = useState(1);

  // Logo state
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(60); // 20% to 150%
  const [logoPosX, setLogoPosX] = useState(0); // -100 to 100
  const [logoPosY, setLogoPosY] = useState(15); // -100 to 100
  const [logoRotation, setLogoRotation] = useState(0); // -180 to 180
  const [logoFlipX, setLogoFlipX] = useState(false);

  // Text state
  const [customText, setCustomText] = useState('');
  const [textFont, setTextFont] = useState(FONT_OPTIONS[0].value);
  const [textColor, setTextColor] = useState('#111111');
  const [textSize, setTextSize] = useState(40); // 16 to 80
  const [textPosX, setTextPosX] = useState(0); // -100 to 100
  const [textPosY, setTextPosY] = useState(-35); // -100 to 100

  // 3D & Preview state
  const [textureVersion, setTextureVersion] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [printUrl, setPrintUrl] = useState('');

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

  // Redraw the 2D texture canvas whenever logo, text, or positioning changes
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

    // 1. Draw Logo if loaded
    if (logoImageRef.current && logoSrc) {
      const img = logoImageRef.current;
      const baseMax = 420;
      const scaleFactor = (logoScale / 100);
      const aspect = (img.width || 1) / (img.height || 1);

      let drawW = baseMax * scaleFactor;
      let drawH = (baseMax / aspect) * scaleFactor;
      if (aspect < 1) {
        drawH = baseMax * scaleFactor;
        drawW = baseMax * aspect * scaleFactor;
      }

      // Convert -100..100 sliders to canvas coordinates
      const posX = centerW + (logoPosX * 3.2);
      const posY = centerH - (logoPosY * 3.2);

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate((logoRotation * Math.PI) / 180);
      if (logoFlipX) ctx.scale(-1, 1);

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // 2. Draw Custom Text if provided
    if (customText.trim()) {
      const posX = centerW + (textPosX * 3.2);
      const posY = centerH - (textPosY * 3.2);

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
    logoSrc, logoScale, logoPosX, logoPosY, logoRotation, logoFlipX,
    customText, textFont, textColor, textSize, textPosX, textPosY
  ]);

  // Trigger texture redraw on changes
  useEffect(() => {
    redrawTexture();
  }, [redrawTexture]);

  // Handle Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        logoImageRef.current = img;
        setLogoSrc(src);
        setActiveTab('logo');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeLogo = () => {
    logoImageRef.current = null;
    setLogoSrc(null);
  };

  const openPreview = () => {
    // 1. Snapshot from 3D Viewport
    const mockup3D = viewer3DRef.current?.getSnapshot() || '';
    setPreviewUrl(mockup3D);

    // 2. Clean 300 DPI Transparent Print File
    if (textureCanvasRef.current) {
      setPrintUrl(textureCanvasRef.current.toDataURL('image/png'));
    }
    setPreviewOpen(true);
  };

  const addToCart = async () => {
    let snapshot = previewUrl;
    if (!snapshot && viewer3DRef.current) {
      snapshot = viewer3DRef.current.getSnapshot();
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
      // Fallback local
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
          <span className="text-text fw-semibold">{label}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary-10 text-primary border border-primary-20 font-montserrat px-3 py-1 d-flex align-items-center gap-1">
            <Sparkles size={12} />
            Editor 3D Interactivo 360°
          </span>
        </div>
      </div>

      {/* Main 3D Customizer Layout (60% 3D Viewport / 40% Control Panel) */}
      <div className="row g-4 align-items-stretch">
        
        {/* Left Column: Direct 3D Canvas */}
        <div className="col-12 col-lg-7 d-flex flex-column">
          <div className="w-100 h-100 bg-elevated border border-border rounded-4 p-2 position-relative shadow-sm d-flex flex-column justify-content-center" style={{ minHeight: '540px' }}>
            <Viewer3D
              ref={viewer3DRef}
              producto={producto}
              productColor={productColor}
              canvasSource={textureCanvasRef.current}
              textureVersion={textureVersion}
            />
          </div>
        </div>

        {/* Right Column: Direct Customization Controls */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-3">
          
          {/* Tabs Selector: Logo / Texto / Color */}
          <div className="d-flex bg-elevated border border-border rounded-3 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('logo')}
              className={`flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
                activeTab === 'logo' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
              }`}
              style={{ fontSize: '0.8rem' }}
            >
              <ImageIcon size={14} />
              Logo / Imagen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('texto')}
              className={`flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
                activeTab === 'texto' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
              }`}
              style={{ fontSize: '0.8rem' }}
            >
              <Type size={14} />
              Texto
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('color')}
              className={`flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 rounded-2 border-0 font-montserrat fw-semibold transition-all ${
                activeTab === 'color' ? 'btn-primary shadow-sm' : 'bg-transparent text-muted'
              }`}
              style={{ fontSize: '0.8rem' }}
            >
              <Palette size={14} />
              Color & Talla
            </button>
          </div>

          {/* TAB 1: LOGO & IMAGEN */}
          {activeTab === 'logo' && (
            <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3">
              <div className="d-flex align-items-center justify-content-between">
                <span className="font-montserrat fw-semibold text-text" style={{ fontSize: '0.85rem' }}>
                  Subir y Ajustar Estampado
                </span>
                {logoSrc && (
                  <button onClick={removeLogo} className="btn btn-sm btn-link text-danger p-0 d-flex align-items-center gap-1 font-montserrat" style={{ fontSize: '0.72rem' }}>
                    <Trash2 size={12} />
                    Quitar logo
                  </button>
                )}
              </div>

              {!logoSrc ? (
                <div className="border border-dashed border-border rounded-3 p-4 text-center d-flex flex-column align-items-center gap-2">
                  <div className="rounded-circle bg-elevated d-flex align-items-center justify-content-center" style={{ width: '3rem', height: '3rem' }}>
                    <Upload size={20} className="text-primary" />
                  </div>
                  <p className="font-montserrat text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                    Sube tu logo o diseño en formato PNG, JPG o SVG (fondo transparente recomendado).
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 mt-1"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <Upload size={14} />
                    Seleccionar archivo
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3 bg-elevated p-2 rounded-3 border border-border">
                    <img src={logoSrc} alt="Logo" className="rounded object-fit-contain bg-card p-1" style={{ width: '48px', height: '48px' }} />
                    <div className="flex-grow-1">
                      <p className="font-montserrat fw-semibold text-text mb-0" style={{ fontSize: '0.75rem' }}>Logo Activo</p>
                      <span className="font-montserrat text-muted" style={{ fontSize: '0.7rem' }}>Ajusta el tamaño y posición en 3D</span>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="btn btn-sm btn-secondary py-1 px-2 font-montserrat" style={{ fontSize: '0.7rem' }}>
                      Cambiar
                    </button>
                  </div>

                  {/* Positioning Sliders */}
                  <div className="d-flex flex-column gap-2 pt-1">
                    <div>
                      <div className="d-flex justify-content-between font-montserrat text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                        <span>↕️ Posición Vertical</span>
                        <span className="text-text">{logoPosY > 0 ? `+${logoPosY}` : logoPosY}</span>
                      </div>
                      <input
                        type="range"
                        min="-80"
                        max="80"
                        value={logoPosY}
                        onChange={(e) => setLogoPosY(Number(e.target.value))}
                        className="form-range w-100"
                      />
                    </div>

                    <div>
                      <div className="d-flex justify-content-between font-montserrat text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                        <span>↔️ Posición Horizontal</span>
                        <span className="text-text">{logoPosX > 0 ? `+${logoPosX}` : logoPosX}</span>
                      </div>
                      <input
                        type="range"
                        min="-80"
                        max="80"
                        value={logoPosX}
                        onChange={(e) => setLogoPosX(Number(e.target.value))}
                        className="form-range w-100"
                      />
                    </div>

                    <div>
                      <div className="d-flex justify-content-between font-montserrat text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                        <span>🔍 Tamaño / Escala</span>
                        <span className="text-text">{logoScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="140"
                        value={logoScale}
                        onChange={(e) => setLogoScale(Number(e.target.value))}
                        className="form-range w-100"
                      />
                    </div>

                    <div>
                      <div className="d-flex justify-content-between font-montserrat text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                        <span>🔄 Rotación</span>
                        <span className="text-text">{logoRotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={logoRotation}
                        onChange={(e) => setLogoRotation(Number(e.target.value))}
                        className="form-range w-100"
                      />
                    </div>

                    <div className="d-flex gap-2 mt-1">
                      <button
                        onClick={() => setLogoFlipX(!logoFlipX)}
                        className={`btn btn-sm flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1 font-montserrat ${
                          logoFlipX ? 'btn-primary' : 'btn-secondary'
                        }`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        <FlipHorizontal size={13} />
                        Voltear
                      </button>
                      <button
                        onClick={() => { setLogoPosX(0); setLogoPosY(15); setLogoScale(60); setLogoRotation(0); setLogoFlipX(false); }}
                        className="btn btn-sm btn-secondary font-montserrat"
                        style={{ fontSize: '0.72rem' }}
                      >
                        Centrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="d-none" />
            </div>
          )}

          {/* TAB 2: TEXTO PERSONALIZADO */}
          {activeTab === 'texto' && (
            <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3">
              <span className="font-montserrat fw-semibold text-text" style={{ fontSize: '0.85rem' }}>
                Añadir Frase o Texto
              </span>

              <div>
                <label className="font-montserrat text-muted mb-1 d-block" style={{ fontSize: '0.72rem' }}>Escribe tu texto</label>
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
                    <label className="font-montserrat text-muted mb-1 d-block" style={{ fontSize: '0.72rem' }}>Tipografía</label>
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
                    <label className="font-montserrat text-muted mb-1 d-block" style={{ fontSize: '0.72rem' }}>Color del texto</label>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      {['#FFFFFF', '#111111', '#C9A84C', '#D4AF37', '#E53E3E', '#3182CE', '#38A169'].map((c) => (
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

                  {/* Text Sliders */}
                  <div className="d-flex flex-column gap-2 pt-1">
                    <div>
                      <div className="d-flex justify-content-between font-montserrat text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                        <span>↕️ Posición Vertical</span>
                        <span className="text-text">{textPosY > 0 ? `+${textPosY}` : textPosY}</span>
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

                    <div>
                      <div className="d-flex justify-content-between font-montserrat text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                        <span>↔️ Posición Horizontal</span>
                        <span className="text-text">{textPosX > 0 ? `+${textPosX}` : textPosX}</span>
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

                    <div>
                      <div className="d-flex justify-content-between font-montserrat text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                        <span>🔍 Tamaño de letra</span>
                        <span className="text-text">{textSize}px</span>
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
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COLOR DEL PRODUCTO & TALLA */}
          {activeTab === 'color' && (
            <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3">
              <span className="font-montserrat fw-semibold text-text" style={{ fontSize: '0.85rem' }}>
                Color Base y Especificaciones
              </span>

              <div>
                <label className="font-montserrat text-muted mb-2 d-block" style={{ fontSize: '0.72rem' }}>Color del producto</label>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  {coloresEditor.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setProductColor(c.hex)}
                      title={c.nombre}
                      className={`rounded-circle border border-2 ${productColor === c.hex ? 'border-primary' : 'border-border'}`}
                      style={{ width: '2rem', height: '2rem', backgroundColor: c.hex, transform: productColor === c.hex ? 'scale(1.15)' : undefined }}
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

          {/* Resumen del Pedido y Agregar */}
          <div className="bg-card border border-border rounded-3 p-3 d-flex flex-column gap-3 mt-auto">
            <div className="d-flex justify-content-between align-items-center font-montserrat">
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>{label} Personalizada</span>
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
                  <span className="text-muted">Producto</span>
                  <span className="text-text fw-semibold">{label}</span>
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
