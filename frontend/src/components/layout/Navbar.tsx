import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
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
  const count = itemCount();
  const isAdmin = user?.rol === 'admin';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Ropa' },
    { to: '/drinkware', label: 'Drinkware' },
    { to: '/disenar', label: 'Diseña el tuyo' },
    { to: '/personalizado', label: 'Personalizado' },
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
        className={`position-fixed top-0 start-0 end-0 border-bottom border-border bg-card ${
          scrolled ? 'shadow-lg' : ''
        }`}
        style={{ zIndex: 1030, transition: 'all 0.3s', ...(scrolled ? {} : { backdropFilter: 'blur(4px)' }) }}
      >
        <div className="container-xxl">
          <div className="d-flex align-items-center justify-content-between" style={{ height: '4rem' }}>
            {/* Logo */}
            <Link to="/" className="d-flex align-items-center gap-3 flex-shrink-0 text-decoration-none">
              <img
                src="/Logo_RCEstampa.png"
                alt="RC Estampa"
                className="rounded-circle object-fit-cover"
                style={{ width: '2.5rem', height: '2.5rem' }}
              />
              <span className="font-italiana fs-3 text-text" style={{ letterSpacing: '0.025em' }}>RC Estampa</span>
            </Link>

            {/* Desktop nav */}
            <nav className="d-none d-md-flex align-items-center" style={{ gap: '2rem' }}>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `font-montserrat small fw-medium text-decoration-none ${
                      isActive ? 'text-primary' : 'text-text'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="btn btn-link p-2 text-muted text-decoration-none"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>
              <Link
                to={isAuthenticated ? '/perfil' : '/auth'}
                className="p-2 text-muted text-decoration-none d-none d-sm-block"
                aria-label="Cuenta"
              >
                <User size={20} />
              </Link>
              <button
                onClick={toggleCart}
                className="btn btn-link position-relative p-2 text-muted text-decoration-none"
                aria-label="Carrito"
              >
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span
                    className="position-absolute bg-primary text-black font-montserrat fw-bold rounded-circle d-flex align-items-center justify-content-center"
                    style={{ top: '-0.125rem', right: '-0.125rem', width: '1rem', height: '1rem', fontSize: '0.75rem' }}
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="btn btn-link d-md-none p-2 text-muted text-decoration-none"
                aria-label="Menú"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center px-3"
          style={{ zIndex: 1060, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', paddingTop: '6rem' }}
        >
          <form onSubmit={handleSearch} className="w-100" style={{ maxWidth: '36rem' }}>
            <div className="d-flex align-items-center gap-3 bg-elevated border border-border rounded px-3 py-2">
              <Search size={20} className="text-muted flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-card d-flex flex-column" style={{ zIndex: 1060 }}>
          <div className="d-flex align-items-center justify-content-between px-3 border-bottom border-border" style={{ height: '4rem' }}>
            <span className="font-italiana fs-3 text-text">RC Estampa</span>
            <button onClick={() => setMobileOpen(false)} className="btn btn-link p-2 text-muted text-decoration-none">
              <X size={24} />
            </button>
          </div>
          <nav className="d-flex flex-column gap-1 p-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `font-montserrat fw-medium fs-5 py-2 px-3 rounded text-decoration-none ${
                    isActive ? 'text-primary bg-primary-10' : 'text-text'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: '4rem' }} />
    </>
  );
}
