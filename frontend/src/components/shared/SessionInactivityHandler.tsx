import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, X } from 'lucide-react';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos en milisegundos
const CHECK_INTERVAL_MS = 5000; // Verificar cada 5 segundos

export default function SessionInactivityHandler() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) {
      setShowExpiredModal(false);
      return;
    }

    // Inicializar timestamp de actividad
    const stored = localStorage.getItem('rc_last_activity');
    const initialTime = stored ? Math.max(Number(stored), Date.now()) : Date.now();
    lastActivityRef.current = initialTime;
    localStorage.setItem('rc_last_activity', String(initialTime));

    let lastWrite = Date.now();

    const handleUserActivity = () => {
      const now = Date.now();
      lastActivityRef.current = now;
      // Throttling de escritura a localStorage para máximo rendimiento (cada 5s)
      if (now - lastWrite > 5000) {
        lastWrite = now;
        localStorage.setItem('rc_last_activity', String(now));
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    const intervalId = setInterval(() => {
      const storedActivity = Number(localStorage.getItem('rc_last_activity')) || lastActivityRef.current;
      const elapsed = Date.now() - storedActivity;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        logout();
        setShowExpiredModal(true);
        localStorage.removeItem('rc_last_activity');
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [isAuthenticated, logout]);

  if (!showExpiredModal) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="bg-surface border border-border rounded-4 p-4 p-md-5 shadow-lg text-center animate-tab-fade position-relative"
        style={{ maxWidth: '28rem', width: '100%' }}
      >
        <button
          onClick={() => setShowExpiredModal(false)}
          className="btn btn-sm btn-outline-secondary p-1 rounded-circle position-absolute"
          style={{ top: '16px', right: '16px' }}
        >
          <X size={18} />
        </button>

        <div
          className="rounded-circle bg-danger bg-opacity-10 border border-danger border-opacity-25 d-inline-flex align-items-center justify-content-center p-3 mb-3 text-danger"
        >
          <ShieldAlert size={36} />
        </div>

        <h3 className="font-italiana fs-4 text-text mb-2">Sesión Expirada</h3>
        <p className="font-montserrat text-muted small mb-4">
          Por tu seguridad y protección de datos, la sesión se ha cerrado automáticamente tras <strong>15 minutos de inactividad</strong>.
        </p>

        <div className="d-flex flex-column gap-2 font-montserrat">
          <button
            onClick={() => {
              setShowExpiredModal(false);
              navigate('/auth');
            }}
            className="btn btn-primary fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
          >
            <LogIn size={16} />
            <span>Iniciar Sesión Nuevamente</span>
          </button>
          <button
            onClick={() => setShowExpiredModal(false)}
            className="btn btn-outline-secondary py-2 small"
          >
            Continuar como Invitado
          </button>
        </div>
      </div>
    </div>
  );
}
