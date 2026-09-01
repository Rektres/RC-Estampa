import base64
import requests
from PIL import Image

mermaid_code = """%%{init: {'theme': 'base', 'themeVariables': {
    'primaryColor': '#f8fafc',
    'primaryTextColor': '#0f172a',
    'primaryBorderColor': '#3b82f6',
    'lineColor': '#c9a84c',
    'secondaryColor': '#f1f5f9',
    'tertiaryColor': '#ffffff'
}}}%%
erDiagram
    User ||--o{ DireccionEnvio : "1:N"
    User ||--o{ Favorito : "1:N"
    User ||--o| Carrito : "1:1"
    User ||--o{ Pedido : "1:N"
    User ||--o{ Diseno : "1:N"

    User {
        int id PK
        string email UK
        string password
        string nombre
        string rol
        string rut
        string telefono
        string direccion
        string comuna
        string ciudad
        string region
        string codigo_verificacion
        boolean email_verificado
    }

    DireccionEnvio {
        int id PK
        int user_id FK
        string nombre_destinatario
        string direccion
        string comuna
        string ciudad
        string region
        boolean es_principal
    }

    Favorito {
        int id PK
        int user_id FK
        int producto_id FK
        int drinkware_id FK
        datetime creado_en
    }

    Categoria ||--o{ Producto : "1:N"
    Categoria ||--o{ ProductoVajilla : "1:N"
    
    Producto ||--o{ VarianteProducto : "1:N"
    Producto ||--o{ ImagenProducto : "1:N"
    Producto ||--o{ Favorito : "1:N"

    ProductoVajilla ||--o{ VarianteVajilla : "1:N"
    ProductoVajilla ||--o{ ImagenVajilla : "1:N"
    ProductoVajilla ||--o{ Favorito : "1:N"

    Linea {
        int id PK
        string nombre
        string slug UK
        boolean es_sin_categoria
    }

    Categoria {
        int id PK
        string nombre
        string slug UK
        string linea
    }

    Producto {
        int id PK
        int categoria_id FK
        string nombre
        string slug UK
        text descripcion
        int precio
        int precio_oferta
        string linea
        boolean activo
        boolean destacado
    }

    VarianteProducto {
        int id PK
        int producto_id FK
        string talla
        string color
        string color_hex
        int stock
        string sku UK
    }

    ImagenProducto {
        int id PK
        int producto_id FK
        string imagen_url_r2
        boolean es_principal
        boolean es_frente
        boolean es_reverso
        int orden
    }

    ProductoVajilla {
        int id PK
        int categoria_id FK
        string nombre
        string slug UK
        int precio
        string material
        int capacidad_ml
        string linea
    }

    VarianteVajilla {
        int id PK
        int producto_id FK
        string color
        string color_hex
        int stock
        string sku UK
    }

    ImagenVajilla {
        int id PK
        int producto_id FK
        string imagen_url_r2
        boolean es_principal
        int orden
    }

    Pedido ||--|{ ItemPedido : "1:N"
    Carrito ||--o{ ItemCarrito : "1:N"

    Pedido {
        int id PK
        string numero UK
        int user_id FK
        string nombre
        string email
        string telefono
        string direccion
        string comuna
        string ciudad
        string region
        int total
        string estado
        string metodo_pago
        string transaccion_id
        string payment_method_id
        string card_last_four
        decimal monto_neto
        decimal comision_mp
        json historial_estados
        datetime pagado_en
    }

    ItemPedido {
        int id PK
        int pedido_id FK
        string tipo
        string nombre
        string imagen_r2
        string talla
        string color
        string prenda
        string linea
        int precio
        int cantidad
        int producto_id
        int variante_id
        int diseno_id
    }

    Carrito {
        int id PK
        int user_id FK
        datetime actualizado_en
    }

    ItemCarrito {
        int id PK
        int carrito_id FK
        string item_id
        string tipo
        string nombre
        int precio
        int cantidad
        int producto_id
    }

    Cotizacion {
        int id PK
        string numero UK
        string nombre
        string email
        string telefono
        string linea
        string tipo_prenda
        string talla
        text descripcion
        string presupuesto_estimado
        string estado
    }

    Diseno {
        int id PK
        int user_id FK
        string imagen_r2
        string prenda
        string color_base
        string talla
        datetime creado_en
    }

    ColorEditor {
        int id PK
        string nombre
        string hex UK
        int orden
    }

    PrecioEditor {
        int id PK
        string producto_key UK
        int precio
    }

    TallaStandard {
        int id PK
        string nombre UK
        int orden
    }

    Region {
        int id PK
        string nombre UK
        int orden
    }

    FotoCliente {
        int id PK
        string imagen_r2
        string tipo
        string nombre_cliente
    }
"""

encoded = base64.urlsafe_b64encode(mermaid_code.encode('utf-8')).decode('ascii')
url = f"https://mermaid.ink/img/{encoded}?type=png"
print("Descargando imagen Mermaid HD...")
res = requests.get(url, timeout=15)
if res.status_code == 200:
    with open("backend/er_diagram_hd.png", "wb") as f:
        f.write(res.content)
    im = Image.open("backend/er_diagram_hd.png")
    print(f"Imagen generada con éxito: {im.size[0]}x{im.size[1]} px, {len(res.content)} bytes")
else:
    print(f"Error {res.status_code}: {res.text}")
