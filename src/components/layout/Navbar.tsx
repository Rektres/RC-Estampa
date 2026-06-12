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
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const count = itemCount();

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-card shadow-lg shadow-black/30' : 'bg-card/95 backdrop-blur-sm'
        } border-b border-border`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img src="/Logo_RCEstampa.png" alt="RC Estampa" className="h-10 w-10 rounded-full object-cover" />
              <span className="font-italiana text-2xl text-text tracking-wide">RC Estampa</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `font-montserrat text-sm font-500 tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-text hover:text-primary'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted hover:text-text transition-colors"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>
              <Link
                to={isAuthenticated ? '/perfil' : '/auth'}
                className="p-2 text-muted hover:text-text transition-colors hidden sm:block"
                aria-label="Cuenta"
              >
                <User size={20} />
              </Link>
              <button
                onClick={toggleCart}
                className="relative p-2 text-muted hover:text-text transition-colors"
                aria-label="Carrito"
              >
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-black text-xs font-montserrat font-700 rounded-full w-4 h-4 flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 text-muted hover:text-text transition-colors"
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
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="flex items-center gap-3 bg-elevated border border-border rounded-sm px-4 py-3">
              <Search size={20} className="text-muted flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent text-text font-montserrat outline-none placeholder-muted"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-muted hover:text-text"
              >
                <X size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-card flex flex-col">
          <div className="flex items-center justify-between px-4 h-16 border-b border-border">
            <span className="font-italiana text-2xl text-text">RC Estampa</span>
            <button onClick={() => setMobileOpen(false)} className="p-2 text-muted">
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `font-montserrat font-500 text-lg py-3 px-4 rounded-sm transition-colors ${
                    isActive ? 'text-primary bg-primary/10' : 'text-text hover:text-primary hover:bg-elevated'
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
      <div className="h-16" />
    </>
  );
}
