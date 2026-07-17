import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  async function handleLogin(data: LoginData) {
    setError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      login(res.user, res.access, res.refresh);
      navigate('/');
    } catch {
      setError('Email o contraseña incorrectos.');
    }
  }

  async function handleRegister(data: RegisterData) {
    setError(null);
    try {
      await authApi.register({ email: data.email, nombre: data.nombre, password: data.password });
      const res = await authApi.login(data.email, data.password);
      login(res.user, res.access, res.refresh);
      navigate('/');
    } catch {
      setError('No se pudo crear la cuenta. ¿El email ya está registrado?');
    }
  }

  const isLogin = mode === 'login';

  return (
    <div className="d-flex align-items-center justify-content-center px-3 py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="w-100" style={{ maxWidth: '28rem' }}>
        <div className="text-center mb-5">
          <img src="/Logo_RCEstampa.png" alt="RC Estampa" className="rounded-circle object-fit-cover mx-auto mb-3 d-block" style={{ height: '4rem', width: '4rem' }} />
          <h1 className="font-italiana text-text mb-2" style={{ fontSize: '2.25rem' }}>
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="font-montserrat text-muted" style={{ fontSize: '0.875rem' }}>
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              type="button"
              onClick={() => setMode(isLogin ? 'register' : 'login')}
              className="btn btn-link p-0 align-baseline text-primary fw-semibold text-decoration-none"
            >
              {isLogin ? 'Crear una' : 'Iniciar sesión'}
            </button>
          </p>
        </div>

        <div className="bg-card border border-border rounded p-4 p-sm-5 d-flex flex-column gap-4">
          {error && (
            <div className="alert alert-danger py-2 mb-0 font-montserrat" style={{ fontSize: '0.875rem' }}>{error}</div>
          )}
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="d-flex flex-column gap-4">
              <div>
                <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Email</label>
                <input
                  type="email"
                  {...loginForm.register('email')}
                  className="form-control bg-elevated font-montserrat"
                  placeholder="tu@email.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Contraseña</label>
                <div className="position-relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    {...loginForm.register('password')}
                    className="form-control bg-elevated font-montserrat pe-5"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="position-absolute text-muted bg-transparent border-0" style={{ right: '0.75rem', top: '0.5rem' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="btn btn-primary w-100 py-2"
              >
                {loginForm.formState.isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="d-flex flex-column gap-4">
              <div>
                <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Nombre</label>
                <input
                  {...registerForm.register('nombre')}
                  className="form-control bg-elevated font-montserrat"
                  placeholder="Tu nombre completo"
                />
                {registerForm.formState.errors.nombre && (
                  <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{registerForm.formState.errors.nombre.message}</p>
                )}
              </div>
              <div>
                <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Email</label>
                <input
                  type="email"
                  {...registerForm.register('email')}
                  className="form-control bg-elevated font-montserrat"
                  placeholder="tu@email.com"
                />
                {registerForm.formState.errors.email && (
                  <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Contraseña</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  {...registerForm.register('password')}
                  className="form-control bg-elevated font-montserrat"
                  placeholder="Mínimo 6 caracteres"
                />
                {registerForm.formState.errors.password && (
                  <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="form-label font-montserrat fw-semibold text-text" style={{ fontSize: '0.875rem' }}>Confirmar contraseña</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  {...registerForm.register('confirm')}
                  className="form-control bg-elevated font-montserrat"
                  placeholder="Repite la contraseña"
                />
                {registerForm.formState.errors.confirm && (
                  <p className="font-montserrat text-danger mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{registerForm.formState.errors.confirm.message}</p>
                )}
              </div>
              <label className="d-flex align-items-center gap-2 font-montserrat text-muted" style={{ fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" className="form-check-input mt-0" onChange={() => setShowPass(!showPass)} />
                Mostrar contraseña
              </label>
              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="btn btn-primary w-100 py-2"
              >
                {registerForm.formState.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          )}

          <div className="border-top border-border pt-3 text-center">
            <p className="font-montserrat text-ghost mb-0" style={{ fontSize: '0.75rem' }}>
              ¿Prefieres comprar como invitado?{' '}
              <Link to="/checkout" className="text-primary text-decoration-none">
                Ir al checkout
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
