import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Package, Heart, User as UserIcon, LogOut, CheckCircle2,
  MessageCircle, ShoppingBag, Trash2, ShieldCheck, ChevronDown, ChevronUp,
  Calendar, X
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

  // Filtro de fechas en pedidos
  const [filtroFecha, setFiltroFecha] = useState<'todos' | '30d' | '90d' | 'este_ano' | 'personalizado'>('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

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

  // Filtrado reactivo de pedidos por fecha
  const pedidosFiltrados = useMemo(() => {
    if (!pedidos) return [];
    if (filtroFecha === 'todos') return pedidos;

    const ahora = new Date();
    return pedidos.filter((p) => {
      const fechaPedido = new Date(p.creado_en);
      if (filtroFecha === '30d') {
        const limite = new Date();
        limite.setDate(ahora.getDate() - 30);
        return fechaPedido >= limite;
      }
      if (filtroFecha === '90d') {
        const limite = new Date();
        limite.setDate(ahora.getDate() - 90);
        return fechaPedido >= limite;
      }
      if (filtroFecha === 'este_ano') {
        return fechaPedido.getFullYear() === ahora.getFullYear();
      }
      if (filtroFecha === 'personalizado') {
        let match = true;
        if (fechaDesde) {
          match = match && fechaPedido >= new Date(fechaDesde + 'T00:00:00');
        }
        if (fechaHasta) {
          match = match && fechaPedido <= new Date(fechaHasta + 'T23:59:59');
        }
        return match;
      }
      return true;
    });
  }, [pedidos, filtroFecha, fechaDesde, fechaHasta]);

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

  return (
    <div className="container py-5 animate-tab-fade" style={{ maxWidth: '64rem' }}>
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
                {user?.rol === 'admin' && (
                  <span className="badge bg-primary text-black fw-bold font-montserrat" style={{ fontSize: '0.7rem' }}>
                    ADMINISTRADOR
                  </span>
                )}
              </div>
              <p className="font-montserrat text-muted small mb-0 mt-1">
                {user?.email} {user?.telefono ? `| 📞 ${user.telefono}` : ''}
              </p>
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
        <div className="d-flex flex-column gap-3 animate-tab-fade">
          {/* Barra de Filtro de Fechas */}
          <div className="p-3 bg-card border border-border rounded-4 shadow-sm d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 font-montserrat">
            <div className="d-flex align-items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span className="fw-bold text-text small">Filtrar Pedidos por Fecha:</span>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              {/* Presets */}
              <div className="btn-group btn-group-sm bg-elevated rounded-3 p-1 border border-border">
                {[
                  { key: 'todos', label: 'Todo' },
                  { key: '30d', label: 'Últimos 30 días' },
                  { key: '90d', label: 'Últimos 3 meses' },
                  { key: 'este_ano', label: 'Este año' },
                  { key: 'personalizado', label: 'Personalizado' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setFiltroFecha(p.key as any)}
                    className={`btn btn-sm border-0 font-montserrat ${
                      filtroFecha === p.key ? 'btn-primary text-black fw-bold' : 'text-muted bg-transparent'
                    }`}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Controles de fecha personalizados */}
              {filtroFecha === 'personalizado' && (
                <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="form-control form-control-sm bg-elevated text-text border-border"
                    style={{ fontSize: '0.75rem', width: '130px' }}
                    title="Fecha Desde"
                  />
                  <span className="text-muted small">a</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="form-control form-control-sm bg-elevated text-text border-border"
                    style={{ fontSize: '0.75rem', width: '130px' }}
                    title="Fecha Hasta"
                  />
                  {(fechaDesde || fechaHasta) && (
                    <button
                      onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                      className="btn btn-sm btn-outline-secondary p-1"
                      title="Limpiar fechas"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Skeletons de Carga */}
          {loadingPedidos ? (
            <div className="d-flex flex-column gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-card border border-border rounded-4 p-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="skeleton-shimmer" style={{ width: '180px', height: '24px' }} />
                    <div className="skeleton-shimmer" style={{ width: '90px', height: '24px' }} />
                  </div>
                  <div className="skeleton-shimmer mb-3" style={{ width: '100%', height: '48px' }} />
                  <div className="skeleton-shimmer" style={{ width: '50%', height: '20px' }} />
                </div>
              ))}
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="bg-card border border-border rounded-4 p-5 text-center shadow-sm">
              <Package size={48} className="text-muted mb-3 mx-auto" />
              <h2 className="font-italiana fs-4 text-text mb-2">
                {pedidos.length === 0 ? 'Aún no tienes pedidos registrados' : 'No hay pedidos en el rango de fechas seleccionado'}
              </h2>
              <p className="font-montserrat text-muted small mb-4">
                {pedidos.length === 0
                  ? 'Explora nuestras colecciones de ropa personalizada y drinkware para realizar tu primera compra.'
                  : 'Prueba cambiando el filtro de fecha o selecciona "Todo" para ver tu historial completo.'}
              </p>
              {pedidos.length === 0 ? (
                <Link to="/catalogo" className="btn btn-primary font-montserrat fw-semibold px-4 py-2">
                  Explorar Catálogo
                </Link>
              ) : (
                <button onClick={() => setFiltroFecha('todos')} className="btn btn-primary font-montserrat fw-semibold px-4 py-2">
                  Ver Todo el Historial
                </button>
              )}
            </div>
          ) : (
            pedidosFiltrados.map((pedido) => {
              const isExpanded = expandedPedido === pedido.numero;
              const cleanEstado = (pedido.estado || 'pendiente').toLowerCase().replace('_', '-');

              return (
                <div key={pedido.numero} className="bg-card border border-border rounded-4 p-4 shadow-sm hover-lift">
                  {/* Encabezado del Pedido */}
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom border-border font-montserrat">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-text fw-bold fs-6">Orden {pedido.numero}</span>
                        <span className={`badge badge-status-${cleanEstado} text-uppercase px-2 py-1`} style={{ fontSize: '0.72rem' }}>
                          {pedido.estado}
                        </span>
                      </div>
                      <span className="text-muted small">
                        📅 {new Date(pedido.creado_en).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="text-md-end">
                        <span className="text-muted small d-block">Total de la Orden:</span>
                        <span className="text-primary fw-bold fs-5">{formatPrice(pedido.total)}</span>
                      </div>
                      <button
                        onClick={() => setExpandedPedido(isExpanded ? null : pedido.numero)}
                        className="btn btn-secondary btn-sm p-2 rounded-circle"
                        title={isExpanded ? 'Ocultar Detalle' : 'Ver Detalle'}
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
                    <div className="pt-3 border-top border-border font-montserrat animate-tab-fade">
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
                          <strong>📍 Dirección de Despacho:</strong> {pedido.direccion}, {pedido.comuna || ''} {pedido.ciudad} ({pedido.region})
                        </div>
                        <a
                          href={`https://wa.me/56944830378?text=${encodeURIComponent(`Hola RC Estampa, consulto por el estado de mi pedido ${pedido.numero}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                        >
                          <MessageCircle size={14} /> Asistencia WhatsApp
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
        <div className="animate-tab-fade">
          {loadingFavoritos ? (
            <div className="row g-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="col-12 col-sm-6 col-md-4">
                  <div className="bg-card border border-border rounded-4 p-3 shadow-sm">
                    <div className="skeleton-shimmer mb-3" style={{ width: '100%', height: '180px' }} />
                    <div className="skeleton-shimmer mb-2" style={{ width: '80%', height: '20px' }} />
                    <div className="skeleton-shimmer" style={{ width: '40%', height: '16px' }} />
                  </div>
                </div>
              ))}
            </div>
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
                    <div className="bg-card border border-border rounded-4 p-3 shadow-sm h-100 d-flex flex-column justify-content-between hover-lift position-relative">
                      <button
                        onClick={() => handleRemoveFavorito(fav.id)}
                        className="btn btn-sm btn-outline-danger p-1 position-absolute rounded-circle shadow-sm"
                        style={{ top: '16px', right: '16px', zIndex: 2 }}
                        title="Quitar de favoritos"
                      >
                        <Trash2 size={15} />
                      </button>

                      <Link to={link} className="text-decoration-none d-block">
                        <div className="bg-elevated rounded-3 mb-3 overflow-hidden d-flex align-items-center justify-content-center" style={{ height: '12rem' }}>
                          {imagen ? (
                            <img src={imagen} alt={item.nombre} className="w-100 h-100 object-fit-cover transition-all" />
                          ) : (
                            <ShoppingBag size={40} className="text-muted" />
                          )}
                        </div>

                        <span className="font-montserrat small text-primary fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.7rem' }}>
                          {prod ? 'Ropa Personalizada' : 'Drinkware Grabado'}
                        </span>
                        <h3 className="font-montserrat fw-semibold text-text fs-6 mb-1 text-truncate">{item.nombre}</h3>
                        <span className="font-montserrat text-primary fw-bold">{formatPrice(precio)}</span>
                      </Link>

                      <div className="pt-3 mt-3 border-top border-border">
                        <Link to={link} className="btn btn-primary btn-sm w-100 font-montserrat fw-semibold">
                          Ver Producto
                        </Link>
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
        <div className="bg-card border border-border rounded-4 p-4 p-md-5 shadow-sm font-montserrat animate-tab-fade">
          <div className="d-flex align-items-center gap-2 mb-4">
            <ShieldCheck size={20} className="text-primary" />
            <h2 className="fs-5 fw-bold text-text mb-0">Información Personal & Dirección de Envío</h2>
          </div>

          {saveSuccess && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-4" role="alert">
              <CheckCircle2 size={16} /> Tus datos se actualizaron correctamente.
            </div>
          )}
          {saveError && (
            <div className="alert alert-danger py-2 small mb-4" role="alert">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label text-muted small fw-semibold">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="form-control bg-elevated text-text border-border"
                  placeholder="Tu nombre y apellido"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-muted small fw-semibold">Correo Electrónico (No editable)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-control bg-elevated text-muted border-border opacity-75"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-muted small fw-semibold">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="form-control bg-elevated text-text border-border"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-muted small fw-semibold">RUT / Identificación</label>
                <input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  className="form-control bg-elevated text-text border-border"
                  placeholder="12.345.678-9"
                />
              </div>

              <div className="col-12">
                <label className="form-label text-muted small fw-semibold">Dirección de Entrega</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="form-control bg-elevated text-text border-border"
                  placeholder="Calle, número, departamento o casa"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-muted small fw-semibold">Comuna</label>
                <input
                  type="text"
                  value={formData.comuna}
                  onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                  className="form-control bg-elevated text-text border-border"
                  placeholder="Ej. Providencia"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-muted small fw-semibold">Ciudad</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="form-control bg-elevated text-text border-border"
                  placeholder="Ej. Santiago"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-muted small fw-semibold">Región</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="form-select bg-elevated text-text border-border"
                >
                  <option value="Arica y Parinacota">Arica y Parinacota</option>
                  <option value="Tarapacá">Tarapacá</option>
                  <option value="Antofagasta">Antofagasta</option>
                  <option value="Atacama">Atacama</option>
                  <option value="Coquimbo">Coquimbo</option>
                  <option value="Valparaíso">Valparaíso</option>
                  <option value="Región Metropolitana">Región Metropolitana</option>
                  <option value="O'Higgins">O'Higgins</option>
                  <option value="Maule">Maule</option>
                  <option value="Ñuble">Ñuble</option>
                  <option value="Biobío">Biobío</option>
                  <option value="La Araucanía">La Araucanía</option>
                  <option value="Los Ríos">Los Ríos</option>
                  <option value="Los Lagos">Los Lagos</option>
                  <option value="Aysén">Aysén</option>
                  <option value="Magallanes">Magallanes</option>
                </select>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top border-border d-flex justify-content-end">
              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary fw-bold px-4 py-2"
              >
                {isSaving ? 'Guardando cambios...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
