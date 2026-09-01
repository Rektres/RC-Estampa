import base64
import requests

mermaid_code = """erDiagram
    User ||--o{ DireccionEnvio : posee
    User ||--o{ Favorito : guarda
    User ||--o| Carrito : tiene
    User ||--o{ Pedido : realiza
    User ||--o{ Diseno : crea

    User {
        int id PK
        string email UK
        string password
        string nombre
        string rol
        string rut
    }

    DireccionEnvio {
        int id PK
        int user_id FK
        string direccion
        string ciudad
        string region
    }

    Favorito {
        int id PK
        int user_id FK
        int producto_id FK
        int drinkware_id FK
    }

    Categoria ||--o{ Producto : clasifica
    Categoria ||--o{ ProductoVajilla : clasifica
    Producto ||--o{ VarianteProducto : variantes
    Producto ||--o{ ImagenProducto : imagenes
    ProductoVajilla ||--o{ VarianteVajilla : variantes
    ProductoVajilla ||--o{ ImagenVajilla : imagenes

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
        int precio
        string linea
    }

    VarianteProducto {
        int id PK
        int producto_id FK
        string talla
        string color
        int stock
        string sku UK
    }

    ImagenProducto {
        int id PK
        int producto_id FK
        string imagen
        boolean es_principal
    }

    ProductoVajilla {
        int id PK
        int categoria_id FK
        string nombre
        string slug UK
        int precio
        string material
    }

    VarianteVajilla {
        int id PK
        int producto_id FK
        string color
        int stock
        string sku UK
    }

    ImagenVajilla {
        int id PK
        int producto_id FK
        string imagen
    }

    Pedido ||--|{ ItemPedido : contiene
    Carrito ||--o{ ItemCarrito : contiene

    Pedido {
        int id PK
        string numero UK
        int user_id FK
        int total
        string estado
        string metodo_pago
    }

    ItemPedido {
        int id PK
        int pedido_id FK
        string tipo
        string nombre
        int precio
        int cantidad
    }

    Carrito {
        int id PK
        int user_id FK
    }

    ItemCarrito {
        int id PK
        int carrito_id FK
        string nombre
        int precio
        int cantidad
    }

    Cotizacion {
        int id PK
        string numero UK
        string nombre
        string estado
    }

    Diseno {
        int id PK
        int user_id FK
        string prenda
        string color_base
    }
"""

encoded = base64.urlsafe_b64encode(mermaid_code.encode('utf-8')).decode('ascii')
url = f"https://mermaid.ink/img/{encoded}"
print("Testing URL:", url[:60] + "...")

try:
    res = requests.get(url, timeout=10)
    print("Status code:", res.status_code)
    if res.status_code == 200:
        with open("er_diagram.png", "wb") as f:
            f.write(res.content)
        print("Image downloaded successfully! Size:", len(res.content), "bytes")
except Exception as e:
    print("Error:", e)
