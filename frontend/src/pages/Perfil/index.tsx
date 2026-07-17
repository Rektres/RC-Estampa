import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Perfil() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="container py-5" style={{ maxWidth: '36rem' }}>
      <h1 className="font-italiana text-text mb-4" style={{ fontSize: '2.25rem' }}>Mi cuenta</h1>
      <div className="bg-card border border-border rounded p-4 d-flex flex-column gap-3">
        <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.875rem' }}>
          <span className="text-muted">Nombre</span><span className="text-text">{user?.nombre || '—'}</span>
        </div>
        <div className="d-flex justify-content-between font-montserrat" style={{ fontSize: '0.875rem' }}>
          <span className="text-muted">Email</span><span className="text-text">{user?.email || '—'}</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="btn btn-secondary d-inline-flex align-items-center justify-content-center gap-2 mt-2"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
