import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ShieldCheck, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Ingresa un teléfono o WhatsApp válido'),
  rut: z.string().min(8, 'Ingresa un RUT válido (ej: 12345678-9)'),
  direccion: z.string().min(3, 'Ingresa tu dirección de despacho'),
  ciudad: z.string().min(2, 'Ingresa tu ciudad o comuna'),
  region: z.string().min(2, 'Selecciona o ingresa tu región'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string(),
  terminos: z.boolean().refine((v) => v === true, {
    message: 'Debes aceptar los términos y política de privacidad',
  }),
}).refine((d) => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { region: 'Región Metropolitana', terminos: true },
  });

  async function handleLogin(data: LoginData) {
    setError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      login(res.user, res.access, res.refresh);
      navigate('/mi-cuenta');
    } catch {
      setError('Email o contraseña incorrectos.');
    }
  }

  async function handleRegister(data: RegisterData) {
    setError(null);
    try {
      const res = await authApi.register({
        email: data.email,
        nombre: data.nombre,
        password: data.password,
        telefono: data.telefono,
        rut: data.rut,
        direccion: data.direccion,
        ciudad: data.ciudad,
        region: data.region,
      });
      setPendingEmail(data.email);
      setSuccessMsg(res.message || 'Código de verificación enviado a tu correo.');
      setMode('verify');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { email?: string[]; message?: string } } })?.response?.data;
      if (msg?.email) {
        setError('Este correo electrónico ya está registrado.');
      } else {
        setError(msg?.message || 'No se pudo crear la cuenta. Por favor verifica los datos.');
      }
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.length < 6) {
      setError('Ingresa el código de 6 dígitos enviado a tu correo.');
      return;
    }
    setError(null);
    setIsVerifying(true);
    try {
      const res = await authApi.verificarCodigo({
        email: pendingEmail,
        codigo: verificationCode.trim(),
      });
      login(res.user, res.access, res.refresh);
      navigate('/mi-cuenta');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Código incorrecto o expirado. Revisa tu correo o solicita uno nuevo.');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setIsResending(true);
    try {
      const res = await authApi.reenviarCodigo({ email: pendingEmail });
      setSuccessMsg(res.message || 'Nuevo código enviado.');
    } catch {
      setError('No se pudo reenviar el código. Intenta nuevamente.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center px-3 py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="w-100" style={{ maxWidth: mode === 'register' ? '36rem' : '28rem' }}>
        <div className="text-center mb-4">
          <img src="/Logo_RCEstampa.png" alt="RC Estampa" className="rounded-circle object-fit-cover mx-auto mb-3 d-block" style={{ height: '4rem', width: '4rem' }} />
          <h1 className="font-italiana text-text mb-2" style={{ fontSize: '2.25rem' }}>
            {mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Verificar tu correo'}
          </h1>
          {mode !== 'verify' && (
            <p className="font-montserrat text-muted" style={{ fontSize: '0.875rem' }}>
              {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode(mode === 'login' ? 'register' : 'login');
                }}
                className="btn btn-link p-0 align-baseline text-primary fw-semibold text-decoration-none"
              >
                {mode === 'login' ? 'Crear una' : 'Iniciar sesión'}
              </button>
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-4 p-4 p-sm-5 d-flex flex-column gap-4 shadow-sm">
          {error && (
            <div className="alert alert-danger py-2 mb-0 font-montserrat" style={{ fontSize: '0.875rem' }}>{error}</div>
          )}
          {successMsg && (
            <div className="alert alert-success py-2 mb-0 font-montserrat" style={{ fontSize: '0.875rem' }}>{successMsg}</div>
          )}

          {/* MODO 1: VERIFICAR CÓDIGO */}
          {mode === 'verify' ? (
            <form onSubmit={handleVerifyCode} className="d-flex flex-column gap-4 text-center">
              <div className="mx-auto rounded-circle bg-drinkware-20 d-flex align-items-center justify-content-center" style={{ width: '4rem', height: '4rem' }}>
                <Mail size={32} className="text-primary" />
              </div>
              <p className="font-montserrat text-muted small mb-0">
                Hemos enviado un código de seguridad de 6 dígitos a <span className="text-text fw-bold">{pendingEmail}</span>. Ingrésalo a continuación para activar tu cuenta:
              </p>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  className="form-control text-center font-monospace fs-2 fw-bold bg-elevated text-primary border border-primary-30"
                  style={{ letterSpacing: '0.5em' }}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="btn btn-primary w-100 py-3 font-montserrat fw-bold d-flex align-items-center justify-content-center gap-2"
              >
                {isVerifying ? 'Verificando...' : 'Verificar y Continuar'}
                <ArrowRight size={18} />
              </button>

              <div className="d-flex justify-content-between align-items-center font-montserrat small pt-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="btn btn-link text-primary text-decoration-none p-0 d-flex align-items-center gap-1"
                >
                  <RefreshCw size={14} className={isResending ? 'spin' : ''} />
                  {isResending ? 'Reenviando...' : 'Reenviar código'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="btn btn-link text-muted text-decoration-none p-0"
                >
                  Cambiar correo
                </button>
              </div>
            </form>
          ) : mode === 'login' ? (
            /* MODO 2: LOGIN */
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label font-montserrat fw-semibold text-text small">Email</label>
                <input
                  type="email"
                  {...loginForm.register('email')}
                  className="form-control bg-elevated font-montserrat"
                  placeholder="tu@email.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="font-montserrat text-danger mt-1 mb-0 small">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="form-label font-montserrat fw-semibold text-text small">Contraseña</label>
                <div className="position-relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    {...loginForm.register('password')}
                    className="form-control bg-elevated font-montserrat pe-5"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="position-absolute text-muted bg-transparent border-0" style={{ right: '0.75rem', top: '0.6rem' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="font-montserrat text-danger mt-1 mb-0 small">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="btn btn-primary w-100 py-2 mt-2 font-montserrat fw-bold"
              >
                {loginForm.formState.isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          ) : (
            /* MODO 3: REGISTRO AMPLIADO */
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="d-flex flex-column gap-3">
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label font-montserrat fw-semibold text-text small">Nombre Completo *</label>
                  <input
                    {...registerForm.register('nombre')}
                    className="form-control bg-elevated font-montserrat"
                    placeholder="Ej: Claudia Morales"
                  />
                  {registerForm.formState.errors.nombre && (
                    <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.nombre.message}</p>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label font-montserrat fw-semibold text-text small">RUT / Identificación *</label>
                  <input
                    {...registerForm.register('rut')}
                    className="form-control bg-elevated font-montserrat"
                    placeholder="Ej: 12345678-9"
                  />
                  {registerForm.formState.errors.rut && (
                    <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.rut.message}</p>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label font-montserrat fw-semibold text-text small">Email *</label>
                  <input
                    type="email"
                    {...registerForm.register('email')}
                    className="form-control bg-elevated font-montserrat"
                    placeholder="tu@email.com"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label font-montserrat fw-semibold text-text small">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    {...registerForm.register('telefono')}
                    className="form-control bg-elevated font-montserrat"
                    placeholder="+56 9 1234 5678"
                  />
                  {registerForm.formState.errors.telefono && (
                    <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.telefono.message}</p>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label font-montserrat fw-semibold text-text small">Dirección de Despacho *</label>
                  <input
                    {...registerForm.register('direccion')}
                    className="form-control bg-elevated font-montserrat"
                    placeholder="Calle, número, depto u oficina"
                  />
                  {registerForm.formState.errors.direccion && (
                    <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.direccion.message}</p>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label font-montserrat fw-semibold text-text small">Ciudad / Comuna *</label>
                  <input
                    {...registerForm.register('ciudad')}
                    className="form-control bg-elevated font-montserrat"
                    placeholder="Santiago / Providencia / Viña del Mar"
                  />
                  {registerForm.formState.errors.ciudad && (
                    <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.ciudad.message}</p>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label font-montserrat fw-semibold text-text small">Región *</label>
                  <select {...registerForm.register('region')} className="form-select bg-elevated font-montserrat">
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

                <div className="col-12 col-sm-6">
                  <label className="form-label font-montserrat fw-semibold text-text small">Contraseña *</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    {...registerForm.register('password')}
                    className="form-control bg-elevated font-montserrat"
                    placeholder="Mínimo 6 caracteres"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label font-montserrat fw-semibold text-text small">Confirmar Contraseña *</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    {...registerForm.register('confirm')}
                    className="form-control bg-elevated font-montserrat"
                    placeholder="Repite la contraseña"
                  />
                  {registerForm.formState.errors.confirm && (
                    <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.confirm.message}</p>
                  )}
                </div>
              </div>

              <div className="form-check pt-2">
                <input
                  type="checkbox"
                  {...registerForm.register('terminos')}
                  id="terminosCheck"
                  className="form-check-input"
                />
                <label htmlFor="terminosCheck" className="form-check-label font-montserrat text-muted small">
                  Acepto los{' '}
                  <Link to="/terminos-y-privacidad" target="_blank" className="text-primary text-decoration-none">
                    Términos, Condiciones y Política de Privacidad de Datos
                  </Link>{' '}
                  conforme a la ley chilena N° 21.719.
                </label>
                {registerForm.formState.errors.terminos && (
                  <p className="font-montserrat text-danger mt-1 mb-0 small">{registerForm.formState.errors.terminos.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="btn btn-primary w-100 py-3 mt-2 font-montserrat fw-bold d-flex align-items-center justify-content-center gap-2"
              >
                <ShieldCheck size={18} />
                {registerForm.formState.isSubmitting ? 'Registrando...' : 'Registrar y Recibir Código'}
              </button>
            </form>
          )}

          <div className="border-top border-border pt-3 text-center">
            <p className="font-montserrat text-ghost mb-0 small">
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

