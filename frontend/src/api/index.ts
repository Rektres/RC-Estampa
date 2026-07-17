import { api } from './client';
import type { Producto, ProductoVajilla, FotoCliente, User } from '../types';

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
  items: PedidoItemInput[];
}

export interface Pedido extends PedidoInput {
  id: number;
  numero: string;
  estado: string;
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

export const authApi = {
  register: (data: { email: string; nombre: string; password: string }) =>
    api.post('/auth/register/', data).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/token/', { email, password }).then((r) => r.data),
  me: () => api.get<User>('/auth/me/').then((r) => r.data),
};

export const pedidosApi = {
  crear: (data: PedidoInput) => api.post<Pedido>('/pedidos/', data).then((r) => r.data),
  obtener: (numero: string) => api.get<Pedido>(`/pedidos/${numero}/`).then((r) => r.data),
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
