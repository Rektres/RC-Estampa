import { api } from './client';
import type {
  Producto, ProductoVajilla, FotoCliente, User,
  Categoria, Favorito, DireccionEnvio,
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
  comuna?: string;
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
  payment_method_id?: string;
  payment_type_id?: string;
  card_last_four?: string;
  card_first_six?: string;
  cardholder_name?: string;
  cardholder_identification?: string;
  authorization_code?: string;
  cuotas?: number;
  monto_neto?: number;
  comision_mp?: number;
  estado_detalle?: string;
  ip_cliente?: string;
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
  categorias: () =>
    api.get<Categoria[] | { results: Categoria[] }>('/categorias/').then((r) => {
      const data = r.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray((data as { results: Categoria[] }).results)) {
        return (data as { results: Categoria[] }).results;
      }
      return [];
    }),
  fotos: () => api.get<FotoCliente[]>('/fotos-clientes/').then((r) => r.data),
  editor: () => api.get<EditorConfig>('/editor/').then((r) => r.data),
  lineas: () =>
    api.get<LineaInfo[] | { results: LineaInfo[] }>('/lineas/').then((r) => {
      const data = r.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray((data as { results: LineaInfo[] }).results)) {
        return (data as { results: LineaInfo[] }).results;
      }
      return [];
    }),
};

export interface RegisterInput {
  email: string;
  nombre: string;
  password?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  comuna?: string;
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

export const direccionesApi = {
  listar: () => api.get<DireccionEnvio[]>('/auth/direcciones/').then((r) => r.data),
  crear: (data: Partial<DireccionEnvio>) => api.post<DireccionEnvio>('/auth/direcciones/', data).then((r) => r.data),
};

export const favoritosApi = {
  listar: () =>
    api.get<Favorito[] | { results: Favorito[] }>('/auth/favoritos/').then((r) => {
      const data = r.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray((data as { results: Favorito[] }).results)) {
        return (data as { results: Favorito[] }).results;
      }
      return [];
    }),
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
  misPedidos: () =>
    api.get<Pedido[] | { results: Pedido[] }>('/pedidos/').then((r) => {
      const data = r.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray((data as { results: Pedido[] }).results)) {
        return (data as { results: Pedido[] }).results;
      }
      return [];
    }),
  cambiarEstado: (numero: string, estado: string, nota?: string) =>
    api.patch<Pedido>(`/pedidos/${numero}/cambiar_estado/`, { estado, nota }).then((r) => r.data),
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

function crudPanel<T>(recurso: string) {
  return {
    list: () =>
      api.get<T[] | { results: T[] }>(`/panel/${recurso}/`).then((r) => {
        const data = r.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray((data as { results: T[] }).results)) {
          return (data as { results: T[] }).results;
        }
        return [];
      }),
    get: (id: number) => api.get<T>(`/panel/${recurso}/${id}/`).then((r) => r.data),
    create: (data: Partial<T>) => api.post<T>(`/panel/${recurso}/`, data).then((r) => r.data),
    update: (id: number, data: Partial<T>) =>
      api.put<T>(`/panel/${recurso}/${id}/`, data).then((r) => r.data),
    setActivo: (id: number, activo: boolean) =>
      api.patch<T>(`/panel/${recurso}/${id}/`, { activo }).then((r) => r.data),
    remove: (id: number) => api.delete(`/panel/${recurso}/${id}/`),
  };
}

export interface EstadisticasData {
  periodo: string;
  kpis: {
    total_ventas_bruto: number;
    total_ventas_neto: number;
    total_comision_mp: number;
    total_pedidos_pagados: number;
    total_pedidos_generados: number;
    ticket_promedio: number;
    tasa_conversion: number;
    conteo_estados: Record<string, number>;
  };
  top_productos: {
    nombre: string;
    tipo: string;
    imagen?: string;
    unidades_vendidas: number;
    ingresos_totales: number;
  }[];
  ventas_por_linea: {
    linea: string;
    unidades: number;
    ingresos: number;
  }[];
  medios_pago: {
    metodo: string;
    conteo: number;
    total: number;
  }[];
  ventas_por_region: {
    region: string;
    conteo: number;
    total: number;
  }[];
  ultimas_transacciones: {
    numero: string;
    nombre: string;
    email: string;
    telefono?: string;
    direccion?: string;
    comuna?: string;
    region?: string;
    total: number;
    monto_neto?: number | null;
    comision_mp?: number;
    estado: string;
    metodo_pago: string;
    payment_method_id?: string;
    card_last_four?: string;
    pagado_en?: string;
    creado_en: string;
    items?: any[];
    historial_estados?: any[];
    [key: string]: any;
  }[];
}

export interface LineaInfo {
  id?: number;
  linea: string;
  nombre: string;
  es_sin_categoria?: boolean;
  total_productos: number;
  total_ropa: number;
  total_drinkware: number;
  total_categorias: number;
}

export const panelApi = {
  productos: crudPanel<Producto>('productos'),
  drinkware: crudPanel<ProductoVajilla>('drinkware'),
  lineas: {
    list: () => api.get<LineaInfo[]>('/panel/lineas/').then((r) => r.data),
    save: (data: { old_linea?: string; new_linea: string; nombre?: string }) =>
      api.post<{ success: boolean; linea: string; nombre: string }>('/panel/lineas/', data).then((r) => r.data),
    remove: (linea: string, reassign_to: string = 'sin_categoria') =>
      api.delete('/panel/lineas/', { params: { linea, reassign_to } }).then((r) => r.data),
  },
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
  estadisticas: (periodo: string = 'todo') =>
    api.get<EstadisticasData>('/panel/estadisticas/', { params: { periodo } }).then((r) => r.data),
  exportarExcel: async (periodo: string = 'todo') => {
    const response = await api.get('/panel/exportar-excel/', {
      params: { periodo },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `RC_Estampa_Ventas_${periodo}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
  exportarProductosExcel: async (tipo: 'ropa' | 'drinkware') => {
    const response = await api.get('/panel/exportar-productos-excel/', {
      params: { tipo },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `RC_Estampa_Catalogo_${tipo === 'ropa' ? 'Ropa' : 'Drinkware'}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
