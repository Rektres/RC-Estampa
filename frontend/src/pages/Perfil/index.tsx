import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Package, Heart, User as UserIcon, LogOut, CheckCircle2,
  MessageCircle, ShoppingBag, Trash2, ShieldCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi, pedidosApi, favoritosApi, type Pedido } from '../../api';
import type { Favorito } from '../../types';
import { formatPrice } from '../../utils';
import { useSEO } from '../../hooks/useSEO';
import PedidoTimeline from '../../components/shared/PedidoTimeline';

export default function Perfil() {
  useSEO({ title: 'Mi Cuenta — Historial & Seguimiento | RC Estampa' });
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('tab') || 'pedidos';

  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null);

  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(true);

  // Formulario de edición de perfil
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    rut: user?.rut || '',
    direccion: user?.direccion || '',
    comuna: user?.comuna || '',
    ciudad: user?.ciudad || '',
    region: user?.region || 'Región Metropolitana',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Cargar pedidos
    pedidosApi.misPedidos()
      .then((data) => setPedidos(Array.isArray(data) ? data : []))
      .catch(() => setPedidos([]))
      .finally(() => setLoadingPedidos(false));

    // Cargar favoritos
    favoritosApi.listar()
      .then((data) => setFavoritos(Array.isArray(data) ? data : []))
      .catch(() => setFavoritos([]))
      .finally(() => setLoadingFavoritos(false));
  }, [user, navigate]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const updated = await authApi.updateMe(formData);
      setUser(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      setSaveError('No se pudieron guardar los cambios. Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveFavorito(id: number) {
    try {
      await favoritosApi.eliminar(id);
      setFavoritos((prev) => prev.filter((f) => f.id !== id));
    } catch {
      // Ignore
    }
  }

  function getTrackingStep(estado: string): number {
    const st = estado.toLowerCase();
    if (st === 'entregado') return 5;
    if (st === 'despachado' || st === 'en_camino') return 4;
    if (st === 'en_produccion' || st === 'estampando' || st === 'grabando') return 3;
    if (st === 'pagado' || st === 'aprobado') return 2;
    return 1;
  }

  const trackingSteps = [
    { title: 'Pedido Recibido', desc: 'Validación de orden y archivo' },
    { title: 'En Taller', desc: 'Grabado láser / DTF Textil' },
    { title: 'Control de Calidad', desc: 'Termo-fijado y empaque' },
    { title: 'Despachado', desc: 'En tránsito con courier' },
    { title: 'Entregado', desc: 'Recibido en destino' },
  ];

  return (
    <div className="container py-5" style={{ maxWidth: '64rem' }}>
      {/* Header del Perfil */}
      <div className="bg-card border border-border rounded-4 p-4 p-md-5 mb-4 shadow-sm position-relative overflow-hidden">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-drinkware-20 border border-primary d-flex align-items-center justify-content-center text-primary fs-3 fw-bold flex-shrink-0"
              style={{ width: '4rem', height: '4rem' }}
            >
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h1 className="font-italiana text-text mb-0 fs-3">
                  {user?.nombre || 'Cliente RC Estampa'}
                </h1>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill font-montserrat d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                  <ShieldCheck size={13} />
                  Cuenta Verificada
                </span>
              </div>
              <p className="font-montserrat text-muted mb-0 small">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="btn btn-outline-secondary font-montserrat small d-inline-flex align-items-center gap-2 align-self-start align-self-md-center"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>

        {/* Barra de Pestañas */}
        <div className="d-flex gap-2 border-top border-border pt-4 mt-4 overflow-x-auto font-montserrat">
          {[
            { id: 'pedidos', label: 'Mis Pedidos & Seguimiento', icon: Package, count: pedidos.length },
            { id: 'favoritos', label: 'Mis Favoritos', icon: Heart, count: favoritos.length },
            { id: 'datos', label: 'Datos Personales & Dirección', icon: UserIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setParams({ tab: tab.id })}
                className={`btn d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill text-nowrap fw-semibold small ${
                  isActive ? 'btn-primary' : 'btn-ghost text-muted'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`badge rounded-pill ${isActive ? 'bg-black text-primary' : 'bg-elevated text-muted'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}

      {/* PESTAÑA 1: PEDIDOS & SEGUIMIENTO */}
      {activeTab === 'pedidos' && (
        <div className="d-flex flex-column gap-3">
          {loadingPedidos ? (
            <div className="text-center py-5 font-montserrat text-muted">Cargando tus pedidos...</div>
          ) : pedidos.length === 0 ? (
            <div className="bg-card border border-border rounded-4 p-5 text-center shadow-sm">
              <Package size={48} className="text-muted mb-3 mx-auto" />
              <h2 className="font-italiana fs-4 text-text mb-2">Aún no tienes pedidos registrados</h2>
              <p className="font-montserrat text-muted small mb-4">
                Explora nuestras colecciones de ropa personalizada y drinkware para realizar tu primera compra.
              </p>
              <Link to="/catalogo" className="btn btn-primary font-montserrat fw-semibold px-4 py-2">
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            pedidos.map((pedido) => {
              const currentStep = getTrackingStep(pedido.estado);
              const isExpanded = expandedPedido === pedido.numero;
              const isPagado = pedido.estado.toLowerCase() === 'pagado';

              return (
                <div key={pedido.numero} className="bg-card border border-border rounded-4 p-4 shadow-sm">
                  {/* Encabezado del Pedido */}
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom border-border font-montserrat">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-text fw-bold fs-6">Orden {pedido.numero}</span>
                        <span className={`badge rounded-pill px-2 py-1 ${
                          isPagado ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning'
                        }`} style={{ fontSize: '0.72rem' }}>
                          {isPagado ? 'Pagado & En Producción' : pedido.estado}
                        </span>
                      </div>
                      <span className="text-muted small">
                        {new Date(pedido.creado_en).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="text-md-end">
                        <span className="text-muted small d-block">Total:</span>
                        <span className="text-primary fw-bold fs-5">{formatPrice(pedido.total)}</span>
                      </div>
                      <button
                        onClick={() => setExpandedPedido(isExpanded ? null : pedido.numero)}
                        className="btn btn-secondary btn-sm p-2 rounded-circle"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* LÍNEA DE SEGUIMIENTO EN VIVO */}
                  <div className="py-2 font-montserrat">
                    <PedidoTimeline
                      estado={pedido.estado}
                      fechaCreacion={pedido.creado_en}
                      fechaPago={pedido.pagado_en}
                    />
                  </div>

                  {/* DETALLE EXPANDIBLE */}
                  {isExpanded && (
                    <div className="pt-3 border-top border-border font-montserrat">
                      <h4 className="fs-6 fw-bold text-text mb-3">Productos en esta orden</h4>
                      <div className="d-flex flex-column gap-2 mb-3">
                        {pedido.items.map((item, idx) => (
                          <div key={idx} className="p-2 bg-elevated rounded-3 d-flex justify-content-between align-items-center small">
                            <div>
                              <strong className="text-text">{item.nombre}</strong>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {item.talla ? `Talla: ${item.talla}` : ''} {item.color ? `| Color: ${item.color}` : ''} &times; {item.cantidad}
                              </div>
                            </div>
                            <span className="text-primary fw-semibold">{item.precio ? formatPrice(item.precio * item.cantidad) : 'A cotizar'}</span>
                          </div>
                        ))}
                      </div>

                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 pt-2 text-muted small">
                        <div>
                          <strong>Despacho:</strong> {pedido.direccion}, {pedido.ciudad} ({pedido.region})
                        </div>
                        <a
                          href={`https://wa.me/56944830378?text=${encodeURIComponent(`Hola RC Estampa, consulto por el estado de mi pedido ${pedido.numero}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                        >
                          <MessageCircle size={14} /> Asistencia por WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PESTAÑA 2: FAVORITOS */}
      {activeTab === 'favoritos' && (
        <div>
          {loadingFavoritos ? (
            <div className="text-center py-5 font-montserrat text-muted">Cargando tus favoritos...</div>
          ) : favoritos.length === 0 ? (
            <div className="bg-card border border-border rounded-4 p-5 text-center shadow-sm">
              <Heart size={48} className="text-muted mb-3 mx-auto" />
              <h2 className="font-italiana fs-4 text-text mb-2">Tu lista de favoritos está vacía</h2>
              <p className="font-montserrat text-muted small mb-4">
                Guarda los productos que más te gusten haciendo clic en el icono de corazón en el catálogo.
              </p>
              <Link to="/catalogo" className="btn btn-primary font-montserrat fw-semibold px-4 py-2">
                Ver Ropa & Drinkware
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {favoritos.map((fav) => {
                const prod = fav.producto_detalle;
                const drink = fav.drinkware_detalle;
                const item = prod || drink;
                if (!item) return null;

                const link = prod ? `/catalogo/${prod.slug}` : `/drinkware/${drink?.slug}`;
                const imagen = prod ? prod.imagenes?.[0]?.imagen : drink?.imagenes?.[0]?.imagen;
                const precio = item.precio;

                return (
                  <div key={fav.id} className="col-12 col-sm-6 col-md-4">
                    <div className="bg-card border border-border rounded-4 p-3 d-flex flex-column h-100 shadow-sm">
                      <Link to={link} className="position-relative overflow-hidden rounded-3 mb-3 d-block bg-elevated" style={{ height: '12rem' }}>
                        {imagen ? (
                          <img src={imagen} alt={item.nombre} className="w-100 h-100 object-fit-cover" />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">RC Estampa</div>
                        )}
                      </Link>
                      <h3 className="font-montserrat fw-bold text-text fs-6 mb-1 text-truncate">{item.nombre}</h3>
                      <p className="font-montserrat text-primary fw-bold mb-3">{formatPrice(precio)}</p>

                      <div className="mt-auto d-flex gap-2">
                        <Link to={link} className="btn btn-primary btn-sm flex-grow-1 font-montserrat fw-semibold d-flex align-items-center justify-content-center gap-1">
                          <ShoppingBag size={14} /> Ver Producto
                        </Link>
                        <button
                          onClick={() => handleRemoveFavorito(fav.id)}
                          className="btn btn-outline-danger btn-sm"
                          title="Eliminar de favoritos"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: DATOS PERSONALES & DIRECCIÓN */}
      {activeTab === 'datos' && (
        <div className="bg-card border border-border rounded-4 p-4 p-md-5 shadow-sm">
          <h2 className="font-italiana fs-4 text-text mb-4">Información Personal & Dirección de Despacho</h2>

          {saveSuccess && (
            <div className="alert alert-success font-montserrat small py-2 mb-4 d-flex align-items-center gap-2">
              <CheckCircle2 size={16} /> ¡Tus datos han sido actualizados exitosamente!
            </div>
          )}
          {saveError && (
            <div className="alert alert-danger font-montserrat small py-2 mb-4">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="d-flex flex-column gap-3 font-montserrat">
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <label className="form-label fw-semibold text-text small">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="form-control bg-elevated"
                  required
                />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label fw-semibold text-text small">RUT / Identificación</label>
                <input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  className="form-control bg-elevated"
                  placeholder="12345678-9"
                />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label fw-semibold text-text small">Correo Electrónico (No modificable)</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="form-control bg-elevated opacity-75"
                />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label fw-semibold text-text small">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="form-control bg-elevated"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-text small">Dirección de Despacho Habitual</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="form-control bg-elevated"
                  placeholder="Calle, número, departamento o referencia"
                />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label fw-semibold text-text small">Comuna</label>
                <input
                  type="text"
                  value={formData.comuna}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                  className="form-control bg-elevated"
                  placeholder="Ej: Providencia / Las Condes"
                />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label fw-semibold text-text small">Ciudad</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="form-control bg-elevated"
                  placeholder="Ej: Santiago / Valparaíso"
                />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label fw-semibold text-text small">Región</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="form-select bg-elevated"
                >
                  <option value="Región Metropolitana">Región Metropolitana</option>
                  <option value="Valparaíso">Valparaíso</option>
                  <option value="Biobío">Biobío</option>
                  <option value="Antofagasta">Antofagasta</option>
                  <option value="Coquimbo">Coquimbo</option>
                  <option value="O'Higgins">O'Higgins</option>
                  <option value="Maule">Maule</option>
                  <option value="La Araucanía">La Araucanía</option>
                  <option value="Los Lagos">Los Lagos</option>
                  <option value="Tarapacá">Tarapacá</option>
                  <option value="Atacama">Atacama</option>
                  <option value="Los Ríos">Los Ríos</option>
                  <option value="Arica y Parinacota">Arica y Parinacota</option>
                  <option value="Ñuble">Ñuble</option>
                  <option value="Aysén">Aysén</option>
                  <option value="Magallanes">Magallanes</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary mt-3 py-2 px-4 fw-bold align-self-start"
            >
              {isSaving ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

