import base64
import requests
from PIL import Image
from pathlib import Path

mermaid_code = """%%{init: {
    "theme": "default",
    "themeVariables": {
        "fontSize": "22px",
        "fontFamily": "Segoe UI, Helvetica, Arial, sans-serif",
        "primaryColor": "#ffffff",
        "primaryTextColor": "#0f172a",
        "primaryBorderColor": "#2563eb",
        "lineColor": "#b45309",
        "secondaryColor": "#f8fafc",
        "tertiaryColor": "#ffffff"
    }
}}%%
erDiagram
    User ||--o{ DireccionEnvio : "posee (1:N)"
    User ||--o{ Favorito : "guarda (1:N)"
    User ||--o| Carrito : "sincroniza (1:1)"
    User ||--o{ Pedido : "realiza (1:N)"
    User ||--o{ Diseno : "crea (1:N)"

    User {
        bigint id PK
        varchar email UK
        varchar password
        varchar nombre
        varchar rol
        varchar rut
        varchar telefono
        varchar direccion
        varchar comuna
        varchar ciudad
        varchar region
        varchar codigo_verificacion
        datetime codigo_expiracion
        boolean email_verificado
        boolean is_staff
        boolean is_superuser
    }

    DireccionEnvio {
        bigint id PK
        bigint user_id FK
        varchar nombre_destinatario
        varchar direccion
        varchar comuna
        varchar ciudad
        varchar region
        varchar codigo_postal
        boolean es_principal
    }

    Favorito {
        bigint id PK
        bigint user_id FK
        bigint producto_id FK
        bigint drinkware_id FK
        datetime creado_en
    }

    Categoria ||--o{ Producto : "clasifica (1:N)"
    Categoria ||--o{ ProductoVajilla : "clasifica (1:N)"
    
    Producto ||--o{ VarianteProducto : "tiene (1:N)"
    Producto ||--o{ ImagenProducto : "galeria (1:N)"
    Producto ||--o{ Favorito : "favoritos (1:N)"

    ProductoVajilla ||--o{ VarianteVajilla : "tiene (1:N)"
    ProductoVajilla ||--o{ ImagenVajilla : "galeria (1:N)"
    ProductoVajilla ||--o{ Favorito : "favoritos (1:N)"

    Linea {
        bigint id PK
        varchar nombre
        varchar slug UK
        boolean es_sin_categoria
        datetime creado_en
    }

    Categoria {
        bigint id PK
        varchar nombre
        varchar slug UK
        varchar linea
    }

    Producto {
        bigint id PK
        bigint categoria_id FK
        varchar nombre
        varchar slug UK
        text descripcion
        integer precio
        integer precio_oferta
        varchar linea
        boolean activo
        boolean destacado
        boolean nuevo
        datetime creado_en
    }

    VarianteProducto {
        bigint id PK
        bigint producto_id FK
        varchar talla
        varchar color
        varchar color_hex
        integer stock
        varchar sku UK
    }

    ImagenProducto {
        bigint id PK
        bigint producto_id FK
        varchar imagen
        boolean es_principal
        boolean es_frente
        boolean es_reverso
        integer orden
    }

    ProductoVajilla {
        bigint id PK
        bigint categoria_id FK
        varchar nombre
        varchar slug UK
        text descripcion
        integer precio
        integer precio_oferta
        varchar material
        integer capacidad_ml
        varchar linea
        boolean activo
        boolean destacado
        boolean nuevo
        datetime creado_en
    }

    VarianteVajilla {
        bigint id PK
        bigint producto_id FK
        varchar color
        varchar color_hex
        integer stock
        varchar sku UK
    }

    ImagenVajilla {
        bigint id PK
        bigint producto_id FK
        varchar imagen
        boolean es_principal
        integer orden
    }

    Pedido ||--|{ ItemPedido : "contiene (1:N)"
    Carrito ||--o{ ItemCarrito : "contiene (1:N)"

    Pedido {
        bigint id PK
        varchar numero UK
        bigint user_id FK
        varchar nombre
        varchar email
        varchar telefono
        varchar direccion
        varchar comuna
        varchar ciudad
        varchar region
        text notas
        integer total
        varchar estado
        varchar metodo_pago
        varchar transaccion_id
        text url_pago
        datetime pagado_en
        varchar payment_method_id
        varchar payment_type_id
        varchar card_last_four
        varchar card_first_six
        varchar cardholder_name
        varchar cardholder_identification
        varchar authorization_code
        smallint cuotas
        decimal monto_neto
        decimal comision_mp
        varchar estado_detalle
        inet ip_cliente
        text user_agent
        jsonb historial_estados
        jsonb datos_pago_raw
        datetime creado_en
    }

    ItemPedido {
        bigint id PK
        bigint pedido_id FK
        varchar tipo
        varchar nombre
        text imagen
        varchar talla
        varchar color
        varchar prenda
        varchar color_base
        varchar linea
        integer precio
        integer cantidad
        integer producto_id
        integer variante_id
        integer diseno_id
    }

    Carrito {
        bigint id PK
        bigint user_id FK
        datetime actualizado_en
    }

    ItemCarrito {
        bigint id PK
        bigint carrito_id FK
        varchar item_id
        varchar tipo
        varchar nombre
        text imagen
        varchar talla
        varchar color
        varchar prenda
        varchar color_base
        varchar linea
        integer precio
        integer cantidad
        integer producto_id
        integer variante_id
        integer diseno_id
    }

    Cotizacion {
        bigint id PK
        varchar numero UK
        varchar nombre
        varchar email
        varchar telefono
        varchar linea
        varchar tipo_prenda
        varchar talla
        text descripcion
        varchar presupuesto_estimado
        varchar estado
        datetime creado_en
    }

    Diseno {
        bigint id PK
        bigint user_id FK
        varchar imagen
        varchar prenda
        varchar color_base
        varchar talla
        datetime creado_en
    }

    ColorEditor {
        bigint id PK
        varchar nombre
        varchar hex UK
        integer orden
    }

    PrecioEditor {
        bigint id PK
        varchar producto_key UK
        integer precio
    }

    TallaStandard {
        bigint id PK
        varchar nombre UK
        integer orden
    }

    Region {
        bigint id PK
        varchar nombre UK
        integer orden
    }

    FotoCliente {
        bigint id PK
        varchar imagen
        varchar tipo
        text texto_review
        varchar nombre_cliente
        varchar producto_ropa_slug
        varchar producto_vajilla_slug
    }
"""

encoded = base64.urlsafe_b64encode(mermaid_code.encode('utf-8')).decode('ascii')
url = f"https://mermaid.ink/img/{encoded}"

print("Descargando imagen desde Mermaid.ink...")
res = requests.get(url, timeout=25)
print("Status code:", res.status_code)

if res.status_code == 200:
    project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
    temp_png = project_root / "backend" / "mermaid_clean.png"
    dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"
    
    with open(temp_png, "wb") as f:
        f.write(res.content)
        
    im = Image.open(temp_png)
    print(f"Dimensiones de imagen original: {im.size[0]} x {im.size[1]} px")
    
    # Convert RGBA to clean crisp RGB white background
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3] if im.mode == "RGBA" else None)
        im_rgb = bg
    else:
        im_rgb = im.convert("RGB")
        
    # Guardar en calidad máxima 100 y Chroma 4:4:4
    im_rgb.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)
    print(f"JPG guardado exitosamente en: {dst_jpg}")
    print(f"Tamaño: {dst_jpg.stat().st_size / 1024:.1f} KB")
else:
    print("Error:", res.text)
