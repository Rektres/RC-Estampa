import { api } from './client';
import type {
  Producto, ProductoVajilla, FotoCliente, User,
  ProductoInput, Categoria, Favorito,
} from '../types';

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface EditorConfig {
  colores: { nombre: string; hex: string }[];
  precios: Record<string, number>;
  tallas: string[];
  regiones: string[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface PedidoItemInput {
  tipo: 'catalogo' | 'diseno';
  nombre: string;
  imagen?: string;
  talla?: string;
  color?: string;
  prenda?: string;
  color_base?: string;
  linea?: string;
  precio?: number | null;
  cantidad: number;
  producto_id?: number | null;
  variante_id?: number | null;
  diseno_id?: number | null;
}

export interface PedidoInput {
  nombre: string;
  email: string;
  telefono?: string;
  direccion: string;
  ciudad: string;
  region: string;
  notas?: string;
  total: number;
  metodo_pago?: 'mercadopago' | 'transferencia';
  items: PedidoItemInput[];
}

export interface Pedido extends PedidoInput {
  id: number;
  numero: string;
  estado: string;
  metodo_pago: 'mercadopago' | 'transferencia';
  payment_url?: string;
  url_pago?: string;
  transaccion_id?: string;
  pagado_en?: string;
  creado_en: string;
}

const PAGE_ALL = { page_size: 200 };

export const catalogoApi = {
  productos: (params: Record<string, unknown> = {}) =>
    api.get<Paginated<Producto>>('/productos/', { params }).then((r) => r.data),
  productosAll: () =>
    api.get<Paginated<Producto>>('/productos/', { params: PAGE_ALL }).then((r) => r.data.results),
  producto: (slug: string) =>
    api.get<Producto>(`/productos/${slug}/`).then((r) => r.data),
  drinkwareAll: () =>
    api.get<Paginated<ProductoVajilla>>('/drinkware/', { params: PAGE_ALL }).then((r) => r.data.results),
  drinkwareItem: (slug: string) =>
    api.get<ProductoVajilla>(`/drinkware/${slug}/`).then((r) => r.data),
  fotos: () => api.get<FotoCliente[]>('/fotos-clientes/').then((r) => r.data),
  editor: () => api.get<EditorConfig>('/editor/').then((r) => r.data),
};

export interface RegisterInput {
  email: string;
  nombre: string;
  password?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  ciudad?: string;
  region?: string;
}

export const authApi = {
  register: (data: RegisterInput) =>
    api.post<{ success: boolean; message: string; email: string }>('/auth/register/', data).then((r) => r.data),
  verificarCodigo: (data: { email: string; codigo: string }) =>
    api.post<AuthResponse>('/auth/verificar-codigo/', data).then((r) => r.data),
  reenviarCodigo: (data: { email: string }) =>
    api.post<{ success: boolean; message: string }>('/auth/reenviar-codigo/', data).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/token/', { email, password }).then((r) => r.data),
  me: () => api.get<User>('/auth/me/').then((r) => r.data),
  updateMe: (data: Partial<User>) => api.patch<User>('/auth/me/', data).then((r) => r.data),
};

export const favoritosApi = {
  listar: () => api.get<Favorito[]>('/auth/favoritos/').then((r) => r.data),
  agregar: (data: { producto?: number; drinkware?: number }) =>
    api.post<Favorito>('/auth/favoritos/', data).then((r) => r.data),
  eliminar: (id: number) => api.delete(`/auth/favoritos/${id}/`).then((r) => r.data),
};

export interface ProcesarPagoInput {
  token: string;
  payment_method_id: string;
  installments: number;
  issuer_id?: string;
  doc_type?: string;
  doc_number?: string;
  payer_email?: string;
  pedido_numero?: string;
  pedido_data?: PedidoInput;
  is_test_card?: boolean;
  card_last_digits?: string;
}

export interface ProcesarPagoResponse {
  success: boolean;
  status: string;
  status_detail?: string;
  payment_id?: number | string;
  message?: string;
  pedido?: Pedido;
}

export const pedidosApi = {
  crear: (data: PedidoInput) => api.post<Pedido>('/pedidos/', data).then((r) => r.data),
  obtener: (numero: string) => api.get<Pedido>(`/pedidos/${numero}/`).then((r) => r.data),
  misPedidos: () => api.get<Pedido[]>('/pedidos/').then((r) => r.data),
  procesarPago: (data: ProcesarPagoInput) =>
    api.post<ProcesarPagoResponse>('/pagos/procesar/', data).then((r) => r.data),
};

export const cotizacionesApi = {
  crear: (data: {
    nombre: string; email: string; telefono?: string; linea: string;
    tipo_prenda: string; talla?: string; descripcion: string; presupuesto_estimado?: string;
  }) => api.post('/cotizaciones/', data).then((r) => r.data),
};

export const disenosApi = {
  crear: (data: { imagen_base64: string; prenda: string; color_base?: string; talla?: string }) =>
    api.post<{ id: number; imagen: string }>('/disenos/', data).then((r) => r.data),
};

export const carritoApi = {
  get: () => api.get('/carrito/').then((r) => r.data),
  put: (items: unknown[]) => api.put('/carrito/', { items }).then((r) => r.data),
};

function crudPanel<T>(recurso: 'productos' | 'drinkware') {
  return {
    list: (params: Record<string, unknown> = {}) =>
      api.get<Paginated<T>>(`/panel/${recurso}/`, { params: { ...PAGE_ALL, ...params } })
        .then((r) => r.data.results),
    get: (id: number) => api.get<T>(`/panel/${recurso}/${id}/`).then((r) => r.data),
    create: (data: ProductoInput) => api.post<T>(`/panel/${recurso}/`, data).then((r) => r.data),
    update: (id: number, data: ProductoInput) =>
      api.put<T>(`/panel/${recurso}/${id}/`, data).then((r) => r.data),
    setActivo: (id: number, activo: boolean) =>
      api.patch<T>(`/panel/${recurso}/${id}/`, { activo }).then((r) => r.data),
    remove: (id: number) => api.delete(`/panel/${recurso}/${id}/`),
  };
}

export const panelApi = {
  productos: crudPanel<Producto>('productos'),
  drinkware: crudPanel<ProductoVajilla>('drinkware'),
  categorias: {
    list: () => api.get<Categoria[]>('/panel/categorias/').then((r) => r.data),
    create: (data: Omit<Categoria, 'id'>) =>
      api.post<Categoria>('/panel/categorias/', data).then((r) => r.data),
    update: (id: number, data: Omit<Categoria, 'id'>) =>
      api.put<Categoria>(`/panel/categorias/${id}/`, data).then((r) => r.data),
    remove: (id: number) => api.delete(`/panel/categorias/${id}/`),
  },
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ url: string }>('/panel/upload/', form).then((r) => r.data);
  },
};
