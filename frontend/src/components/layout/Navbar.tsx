import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount, toggleCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const count = itemCount();
  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Cerrar menú mobile automáticamente al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Ropa' },
    { to: '/drinkware', label: 'Drinkware' },
    { to: '/disenar', label: 'Diseña el tuyo', highlight: true },
    { to: '/personalizado', label: 'Cotización' },
    ...(isAdmin ? [{ to: '/panel', label: 'Panel' }] : []),
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  return (
    <>
      <nav
        className={`position-fixed top-0 start-0 end-0 navbar-escenico ${
          scrolled ? 'scrolled' : ''
        }`}
        style={{ zIndex: 1030 }}
      >
        <div className="container-xxl">
          <div className="d-flex align-items-center justify-content-between" style={{ height: '4.5rem' }}>
            {/* Logo */}
            <Link to="/" className="d-flex align-items-center gap-3 flex-shrink-0 text-decoration-none">
              <div className="position-relative">
                <img
                  src="/Logo_RCEstampa.png"
                  alt="RC Estampa"
                  className="rounded-circle object-fit-cover border border-primary-30"
                  style={{ width: '2.6rem', height: '2.6rem' }}
                />
                <span
                  className="position-absolute bottom-0 end-0 live-dot live-dot-gold"
                  style={{ width: '6px', height: '6px' }}
                />
              </div>
              <div className="d-flex flex-column">
                <span className="font-italiana fs-3 text-text lh-1" style={{ letterSpacing: '0.04em' }}>
                  RC Estampa
                </span>
                <span
                  className="font-montserrat text-muted text-uppercase"
                  style={{ fontSize: '0.58rem', letterSpacing: '0.18em' }}
                >
                  Atelier & Estampados
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="d-none d-md-flex align-items-center" style={{ gap: '2.25rem' }}>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `position-relative py-2 font-montserrat small fw-medium text-decoration-none transition-all ${
                      isActive ? 'text-primary' : 'text-text opacity-75'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="d-flex align-items-center gap-1">
                        {link.highlight && <Sparkles size={12} className="text-primary" />}
                        {link.label}
                      </span>
                      {isActive && (
                        <span
                          className="position-absolute bottom-0 start-0 w-100"
                          style={{
                            height: '2px',
                            background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent))',
                            borderRadius: '1px',
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="btn btn-link p-2 text-muted text-decoration-none hover-lift"
                aria-label="Buscar"
              >
                <Search size={19} />
              </button>
              <Link
                to={isAuthenticated ? '/perfil' : '/auth'}
                className="p-2 text-muted text-decoration-none d-none d-sm-flex align-items-center justify-content-center hover-lift"
                aria-label="Cuenta"
              >
                <User size={19} />
              </Link>
              <button
                onClick={toggleCart}
                className="btn btn-link position-relative p-2 text-muted text-decoration-none hover-lift"
                aria-label="Carrito"
              >
                <ShoppingBag size={19} />
                {count > 0 && (
                  <span
                    className="position-absolute bg-primary text-black font-montserrat fw-bold rounded-circle d-flex align-items-center justify-content-center"
                    style={{ top: '0.1rem', right: '0.1rem', width: '1.05rem', height: '1.05rem', fontSize: '0.7rem' }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn btn-link d-md-none p-2 text-muted text-decoration-none"
                aria-label="Menú"
              >
                {mobileOpen ? <X size={22} className="text-primary" /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center px-3"
          style={{ zIndex: 1060, backgroundColor: 'rgba(7,8,20,0.88)', backdropFilter: 'blur(8px)', paddingTop: '6.5rem' }}
        >
          <form onSubmit={handleSearch} className="w-100" style={{ maxWidth: '38rem' }}>
            <div className="d-flex align-items-center gap-3 bg-card border border-primary-30 rounded-3 px-3 py-2 shadow-lg">
              <Search size={20} className="text-primary flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar poleras, polerones, drinkware..."
                className="flex-grow-1 bg-transparent text-text font-montserrat border-0"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="btn btn-link p-0 text-muted text-decoration-none"
              >
                <X size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile menu (Glassmorphism & Satin Card) */}
      {mobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column d-md-none"
          style={{
            zIndex: 1029,
            backgroundColor: 'rgba(7, 8, 20, 0.96)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            paddingTop: '5rem',
          }}
        >
          <div className="d-flex flex-column p-4 gap-2">
            <div className="eyebrow-badge mb-3 align-self-start">
              <span className="glyph">★</span> MENÚ DE NAVEGACIÓN
            </div>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `font-montserrat fw-medium fs-5 py-3 px-3 rounded-3 text-decoration-none d-flex align-items-center justify-content-between ${
                    isActive ? 'text-primary bg-primary-10 border border-primary-20' : 'text-text'
                  }`
                }
              >
                <span>{link.label}</span>
                {link.highlight && <Sparkles size={16} className="text-primary" />}
              </NavLink>
            ))}
            <div className="border-top border-border pt-4 mt-3 d-flex gap-3">
              <Link
                to={isAuthenticated ? '/perfil' : '/auth'}
                onClick={() => setMobileOpen(false)}
                className="btn btn-secondary flex-fill text-center"
              >
                {isAuthenticated ? 'Mi Perfil' : 'Iniciar Sesión'}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: '4.5rem' }} />
    </>
  );
}

