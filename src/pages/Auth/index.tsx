import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

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
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  async function handleLogin(data: LoginData) {
    await new Promise((r) => setTimeout(r, 600));
    login({ id: 1, email: data.email, nombre: 'Cliente', rol: 'cliente' }, 'mock-token');
    navigate('/');
  }

  async function handleRegister(data: RegisterData) {
    await new Promise((r) => setTimeout(r, 600));
    login({ id: 1, email: data.email, nombre: data.nombre, rol: 'cliente' }, 'mock-token');
    navigate('/');
  }

  const isLogin = mode === 'login';

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src="/Logo_RCEstampa.png" alt="RC Estampa" className="h-16 w-16 rounded-full object-cover mx-auto mb-4" />
          <h1 className="font-italiana text-4xl text-text mb-2">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="font-montserrat text-sm text-muted">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => setMode(isLogin ? 'register' : 'login')}
              className="text-primary hover:text-primary-dark transition-colors font-600"
            >
              {isLogin ? 'Crear una' : 'Iniciar sesión'}
            </button>
          </p>
        </div>

        <div className="bg-card border border-border rounded-sm p-8 space-y-5">
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
              <div>
                <label className="font-montserrat font-600 text-sm text-text block mb-2">Email</label>
                <input
                  type="email"
                  {...loginForm.register('email')}
                  className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
                  placeholder="tu@email.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="font-montserrat text-xs text-red-400 mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="font-montserrat font-600 text-sm text-text block mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    {...loginForm.register('password')}
                    className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 pr-10 rounded-sm focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-muted">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="font-montserrat text-xs text-red-400 mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="btn-primary w-full py-3 text-sm"
              >
                {loginForm.formState.isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
              <div>
                <label className="font-montserrat font-600 text-sm text-text block mb-2">Nombre</label>
                <input
                  {...registerForm.register('nombre')}
                  className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
                  placeholder="Tu nombre completo"
                />
                {registerForm.formState.errors.nombre && (
                  <p className="font-montserrat text-xs text-red-400 mt-1">{registerForm.formState.errors.nombre.message}</p>
                )}
              </div>
              <div>
                <label className="font-montserrat font-600 text-sm text-text block mb-2">Email</label>
                <input
                  type="email"
                  {...registerForm.register('email')}
                  className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
                  placeholder="tu@email.com"
                />
                {registerForm.formState.errors.email && (
                  <p className="font-montserrat text-xs text-red-400 mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="font-montserrat font-600 text-sm text-text block mb-2">Contraseña</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  {...registerForm.register('password')}
                  className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
                  placeholder="Mínimo 6 caracteres"
                />
                {registerForm.formState.errors.password && (
                  <p className="font-montserrat text-xs text-red-400 mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <label className="font-montserrat font-600 text-sm text-text block mb-2">Confirmar contraseña</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  {...registerForm.register('confirm')}
                  className="w-full bg-elevated border border-border text-text font-montserrat text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-primary"
                  placeholder="Repite la contraseña"
                />
                {registerForm.formState.errors.confirm && (
                  <p className="font-montserrat text-xs text-red-400 mt-1">{registerForm.formState.errors.confirm.message}</p>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs font-montserrat text-muted cursor-pointer">
                <input type="checkbox" onChange={() => setShowPass(!showPass)} />
                Mostrar contraseña
              </label>
              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="btn-primary w-full py-3 text-sm"
              >
                {registerForm.formState.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          )}

          <div className="border-t border-border pt-4 text-center">
            <p className="font-montserrat text-xs text-ghost">
              ¿Prefieres comprar como invitado?{' '}
              <Link to="/checkout" className="text-primary hover:text-primary-dark">
                Ir al checkout
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
