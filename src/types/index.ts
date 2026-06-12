export type Linea = 'urbana' | 'formal' | 'drinkware';

export interface Talla {
  nombre: string;
  orden: number;
}

export interface VarianteProducto {
  id: number;
  talla: string;
  color: string;
  color_hex: string;
  stock: number;
  sku: string;
}

export interface ImagenProducto {
  id: number;
  imagen: string;
  es_principal: boolean;
  es_frente?: boolean;
  es_reverso?: boolean;
  orden: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  linea: Linea;
}

export interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  precio_oferta?: number;
  activo: boolean;
  destacado: boolean;
  nuevo: boolean;
  linea: Linea;
  categoria: Categoria;
  variantes: VarianteProducto[];
  imagenes: ImagenProducto[];
}

export interface VarianteVajilla {
  id: number;
  color: string;
  color_hex: string;
  stock: number;
  sku: string;
}

export interface ProductoVajilla {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  material: string;
  capacidad_ml?: number;
  precio: number;
  precio_oferta?: number;
  activo: boolean;
  destacado: boolean;
  nuevo: boolean;
  linea: 'drinkware';
  categoria: { id: number; nombre: string; slug: string };
  variantes: VarianteVajilla[];
  imagenes: ImagenProducto[];
}

export type ProductoUnion = Producto | ProductoVajilla;

export interface CartItemCatalogo {
  tipo: 'catalogo';
  id: string;
  productoId: number;
  varianteId: number;
  nombre: string;
  imagen: string;
  talla: string;
  color: string;
  precio: number;
  cantidad: number;
  linea: Linea;
}

export interface CartItemDiseno {
  tipo: 'diseno';
  id: string;
  disenoId?: number;
  nombre: string;
  imagen: string;
  prenda: string;
  color_base: string;
  talla: string;
  precio?: number;
  cantidad: number;
}

export type CartItem = CartItemCatalogo | CartItemDiseno;

export interface FotoCliente {
  id: number;
  imagen: string;
  tipo: 'ropa' | 'vajilla';
  texto_review?: string;
  nombre_cliente?: string;
  producto_ropa_slug?: string;
  producto_vajilla_slug?: string;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'admin' | 'cliente';
}

export interface DireccionEnvio {
  id?: number;
  nombre_destinatario: string;
  direccion: string;
  ciudad: string;
  region: string;
  codigo_postal?: string;
  es_principal?: boolean;
}
