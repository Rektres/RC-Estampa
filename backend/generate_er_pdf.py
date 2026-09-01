import sys
import os
from pathlib import Path
from PIL import Image as PILImage

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        if self._pageNumber > 1:
            self.setFillColor(colors.HexColor('#141732'))
            self.rect(0, 752, 612, 40, fill=True, stroke=False)
            self.setStrokeColor(colors.HexColor('#c9a84c'))
            self.setLineWidth(1.5)
            self.line(0, 752, 612, 752)
            
            self.setFillColor(colors.HexColor('#FFFFFF'))
            self.setFont('Helvetica-Bold', 9)
            self.drawString(36, 765, "RC ESTAMPA — DIAGRAMA Y DICCIONARIO DE BASE DE DATOS")
            
            self.setFillColor(colors.HexColor('#c9a84c'))
            self.setFont('Helvetica', 9)
            self.drawRightString(576, 765, "POSTGRESQL 16 + R2")

        self.setStrokeColor(colors.HexColor('#c9a84c'))
        self.setLineWidth(0.75)
        self.line(36, 38, 576, 38)
        
        self.setFont('Helvetica', 8)
        self.setFillColor(colors.HexColor('#64748b'))
        self.drawString(36, 26, "Documento Confidencial • RC Estampa E-Commerce & Personalización")
        self.drawRightString(576, 26, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()

def create_er_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    c_primary = colors.HexColor('#070814')
    c_card = colors.HexColor('#141732')
    c_gold = colors.HexColor('#c9a84c')
    c_text = colors.HexColor('#1e293b')
    c_muted = colors.HexColor('#64748b')

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#141732'),
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#c9a84c'),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=c_text
    )

    badge_pk = ParagraphStyle(
        'BadgePK',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#854d0e')
    )

    badge_fk = ParagraphStyle(
        'BadgeFK',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1d4ed8')
    )

    col_header = ParagraphStyle(
        'ColHeader',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    col_text = ParagraphStyle(
        'ColText',
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=c_text
    )

    col_code = ParagraphStyle(
        'ColCode',
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0f172a')
    )

    story = []

    # COVER BANNER
    banner_data = [
        [
            Paragraph("<b>RC ESTAMPA</b> — ARQUITECTURA DE DATOS", ParagraphStyle('BTitle', fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=colors.white)),
        ],
        [
            Paragraph("Diagrama Entidad-Relación Visual y Diccionario de Base de Datos PostgreSQL 16 & Cloudflare R2", ParagraphStyle('BSub', fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#e6c66e'))),
        ]
    ]
    banner_table = Table(banner_data, colWidths=[540])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#141732')),
        ('PADDING', (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,0), (-1,0), 3),
        ('TOPPADDING', (0,1), (-1,1), 2),
        ('LINEBELOW', (0,1), (-1,1), 3, colors.HexColor('#c9a84c')),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    meta_info = [
        [
            Paragraph("<b>Motor de BD:</b> PostgreSQL 16 (Alpine Container)", col_text),
            Paragraph("<b>Object Storage:</b> Cloudflare R2 (S3 Protocol)", col_text),
        ],
        [
            Paragraph("<b>Framework Backend:</b> Django 5.1.5 + DRF 3.15", col_text),
            Paragraph("<b>Autenticación:</b> SimpleJWT + Custom User", col_text),
        ],
        [
            Paragraph("<b>Pasarela de Pago:</b> Mercado Pago Checkout Pro", col_text),
            Paragraph("<b>Fecha de Generación:</b> Agosto 2026", col_text),
        ]
    ]
    t_meta = Table(meta_info, colWidths=[270, 270])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # SECCIÓN DIAGRAMA ER VISUAL
    story.append(Paragraph("Diagrama Entidad-Relación Visual (ERD)", h1_style))
    story.append(Paragraph("A continuación se muestra el esquema topológico de entidades y sus relaciones (Ultra-HD 7.6K):", body_style))
    story.append(Spacer(1, 6))

    img_path = r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa\RC_Estampa_Diagrama_ER.jpg"
    if os.path.exists(img_path):
        pil_im = PILImage.open(img_path)
        img_w, img_h = pil_im.size
        target_w = 540
        target_h = target_w * (img_h / img_w)
        
        img_flowable = Image(img_path, width=target_w, height=target_h)
        t_img = Table([[img_flowable]], colWidths=[540])
        t_img.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ffffff')),
            ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#c9a84c')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ]))
        story.append(t_img)
        story.append(Spacer(1, 4))
        story.append(Paragraph("<i>Figura 1: Mapeo de relaciones (1:N, 1:1, PK/FK) entre Usuarios, Catálogo Textil/Drinkware, Pedidos, Auditoría y Diseños.</i>", ParagraphStyle('Cap', fontName='Helvetica-Oblique', fontSize=7.5, textColor=c_muted, alignment=1)))
    
    story.append(PageBreak())

    def make_table(headers, rows, widths):
        formatted_rows = []
        h_row = [Paragraph(f"<b>{h}</b>", col_header) for h in headers]
        formatted_rows.append(h_row)
        
        for r in rows:
            formatted_r = []
            for item in r:
                if isinstance(item, str):
                    formatted_r.append(Paragraph(item, col_text))
                else:
                    formatted_r.append(item)
            formatted_rows.append(formatted_r)

        t = Table(formatted_rows, colWidths=widths)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#141732')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 3.5),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('LINEBELOW', (0,0), (-1,0), 1.5, colors.HexColor('#c9a84c')),
        ]))
        return t

    # MÓDULO 1
    story.append(Paragraph("1. Módulo de Cuentas y Usuarios (cuentas)", h1_style))
    story.append(Paragraph("Tabla: <b>cuentas_user</b> (Entidad Principal de Usuarios)", h2_style))
    user_rows = [
        [Paragraph("<b>id</b>", col_code), Paragraph("<b>PK</b>", badge_pk), "BigIntegerField", "Identificador único autoincremental."],
        [Paragraph("<b>email</b>", col_code), Paragraph("UNIQUE", col_text), "EmailField(254)", "Email de inicio de sesión (USERNAME_FIELD)."],
        [Paragraph("<b>password</b>", col_code), "-", "CharField(128)", "Hash de contraseña (PBKDF2/SHA256)."],
        [Paragraph("<b>nombre</b>", col_code), "-", "CharField(150)", "Nombre y apellido del usuario."],
        [Paragraph("<b>rol</b>", col_code), "-", "CharField(10)", "Rol en la plataforma: 'admin' o 'cliente'."],
        [Paragraph("<b>telefono</b>", col_code), "-", "CharField(30)", "Teléfono de contacto para despacho."],
        [Paragraph("<b>rut</b>", col_code), "-", "CharField(20)", "Identificación tributaria chilena (RUT)."],
        [Paragraph("<b>direccion / comuna / ciudad / region</b>", col_code), "-", "CharField(100-255)", "Ubicación geográfica por defecto del cliente."],
        [Paragraph("<b>codigo_verificacion / codigo_expiracion</b>", col_code), "-", "CharField / DateTime", "Token de 6 dígitos y expiración para 2FA/Reset."],
        [Paragraph("<b>email_verificado</b>", col_code), "-", "BooleanField", "Estado de validación de correo."],
        [Paragraph("<b>is_staff / is_superuser / is_active</b>", col_code), "-", "BooleanField", "Flags de control de acceso al panel Django."],
    ]
    story.append(make_table(["Campo", "Clave", "Tipo de Dato", "Descripción"], user_rows, [130, 45, 110, 255]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Tablas Secundarias: <b>cuentas_direccionenvio</b> y <b>cuentas_favorito</b>", h2_style))
    dir_fav_rows = [
        [Paragraph("<b>DireccionEnvio.user_id</b>", col_code), Paragraph("<b>FK</b>", badge_fk), "cuentas_user (CASCADE)", "Relación 1:N con direcciones de entrega."],
        [Paragraph("<b>DireccionEnvio.es_principal</b>", col_code), "-", "BooleanField", "Dirección marcada por defecto en checkout."],
        [Paragraph("<b>Favorito.user_id</b>", col_code), Paragraph("<b>FK</b>", badge_fk), "cuentas_user (CASCADE)", "Usuario propietario del favorito."],
        [Paragraph("<b>Favorito.producto_id</b>", col_code), Paragraph("<b>FK</b>", badge_fk), "catalogo_producto (NULL)", "Referencia a producto textil favorito."],
        [Paragraph("<b>Favorito.drinkware_id</b>", col_code), Paragraph("<b>FK</b>", badge_fk), "catalogo_productovajilla (NULL)", "Referencia a producto drinkware favorito."],
    ]
    story.append(make_table(["Entidad.Campo", "Clave", "Referencia", "Descripción"], dir_fav_rows, [145, 40, 140, 215]))
    story.append(Spacer(1, 12))

    # MÓDULO 2
    story.append(Paragraph("2. Módulo de Catálogo, Líneas y Drinkware (catalogo)", h1_style))
    story.append(Paragraph("Tablas: <b>catalogo_linea</b> y <b>catalogo_categoria</b>", h2_style))
    cat_rows = [
        [Paragraph("<b>catalogo_linea</b>", col_code), Paragraph("PK: id, UK: slug", badge_pk), "Líneas de negocio: Urbana, Formal, Drinkware, Sin Categoría."],
        [Paragraph("<b>catalogo_categoria</b>", col_code), Paragraph("PK: id, UK: slug", badge_pk), "Categorías: Poleras, Hoodies, Camisas, Termos, Tazas, etc."],
    ]
    story.append(make_table(["Tabla", "Claves", "Descripción"], cat_rows, [130, 110, 300]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Tablas: <b>catalogo_producto</b> y <b>catalogo_productovajilla</b>", h2_style))
    prod_rows = [
        [Paragraph("<b>id / nombre / slug</b>", col_code), Paragraph("<b>PK / UK</b>", badge_pk), "Identificador y URL semántica única."],
        [Paragraph("<b>categoria_id</b>", col_code), Paragraph("<b>FK</b>", badge_fk), "catalogo_categoria (PROTECT) — Bloquea borrado accidental."],
        [Paragraph("<b>precio / precio_oferta</b>", col_code), "-", "PositiveIntegerField (CLP) con soporte de descuento."],
        [Paragraph("<b>linea</b>", col_code), "-", "CharField — 'urbana', 'formal', 'deportiva' o 'drinkware'."],
        [Paragraph("<b>material / capacidad_ml</b>", col_code), "-", "Exclusivo Drinkware: Acero inox, cerámica, vidrio / Capacidad en ml."],
        [Paragraph("<b>activo / destacado / nuevo</b>", col_code), "-", "Flags de visibilidad en frontend, cover flow y catálogo."],
    ]
    story.append(make_table(["Campo", "Clave", "Descripción"], prod_rows, [140, 50, 350]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Tablas: <b>Variantes</b> e <b>Imágenes</b> (Cloudflare R2)", h2_style))
    var_rows = [
        [Paragraph("<b>catalogo_varianteproducto</b>", col_code), Paragraph("<b>FK</b> producto_id", badge_fk), "Talla, Color, ColorHex, Stock y SKU único."],
        [Paragraph("<b>catalogo_imagenproducto</b>", col_code), Paragraph("<b>FK</b> producto_id", badge_fk), "URL Cloudflare R2, flags es_frente/es_reverso y orden."],
        [Paragraph("<b>catalogo_variantevajilla</b>", col_code), Paragraph("<b>FK</b> producto_id", badge_fk), "Color, ColorHex, Stock y SKU único para drinkware."],
        [Paragraph("<b>catalogo_imagenvajilla</b>", col_code), Paragraph("<b>FK</b> producto_id", badge_fk), "URL Cloudflare R2, flags es_principal y orden."],
    ]
    story.append(make_table(["Tabla", "Relación", "Descripción y Atributos"], var_rows, [160, 100, 280]))
    story.append(Spacer(1, 12))

    # MÓDULO 3
    story.append(Paragraph("3. Módulo de Pedidos, Checkout y Auditoría (pedidos)", h1_style))
    story.append(Paragraph("Tabla: <b>pedidos_pedido</b> (Auditoría Financiera & PCI-DSS)", h2_style))
    ped_rows = [
        [Paragraph("<b>numero</b>", col_code), Paragraph("<b>UK</b>", badge_pk), "Código público del pedido (ej. 'RC-49201847')."],
        [Paragraph("<b>user_id</b>", col_code), Paragraph("<b>FK</b>", badge_fk), "cuentas_user (SET_NULL) — Permite compras como invitado."],
        [Paragraph("<b>total / estado</b>", col_code), "-", "Monto CLP / Estados: pendiente, pagado, en_proceso, enviado, entregado."],
        [Paragraph("<b>metodo_pago / transaccion_id</b>", col_code), "-", "'mercadopago' o 'transferencia' / ID oficial de pasarela."],
        [Paragraph("<b>monto_neto / comision_mp</b>", col_code), "-", "DecimalField — Desglose para contabilidad y SII."],
        [Paragraph("<b>card_last_four / cardholder_name</b>", col_code), "-", "Datos seguros de tarjeta para auditoría antifraude."],
        [Paragraph("<b>ip_cliente / user_agent</b>", col_code), "-", "Registro de red y navegador del comprador."],
        [Paragraph("<b>historial_estados / datos_pago_raw</b>", col_code), "-", "JSONField — Trazabilidad temporal y payload de Webhooks."],
    ]
    story.append(make_table(["Campo", "Clave", "Descripción"], ped_rows, [155, 45, 340]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Tablas: <b>pedidos_itempedido</b>, <b>pedidos_carrito</b> y <b>pedidos_cotizacion</b>", h2_style))
    item_rows = [
        [Paragraph("<b>pedidos_itempedido</b>", col_code), Paragraph("<b>FK</b> pedido_id", badge_fk), "Snapshot inmutable: nombre, imagen, talla, color, precio unitario y cantidad."],
        [Paragraph("<b>pedidos_carrito</b>", col_code), Paragraph("<b>1:1</b> user_id", badge_fk), "Carro persistente sincronizado por usuario autenticado."],
        [Paragraph("<b>pedidos_itemcarrito</b>", col_code), Paragraph("<b>FK</b> carrito_id", badge_fk), "Líneas temporales de compra antes de checkout."],
        [Paragraph("<b>pedidos_cotizacion</b>", col_code), Paragraph("<b>UK</b> numero", badge_pk), "Solicitudes B2B / personalización masiva con presupuesto estimado."],
    ]
    story.append(make_table(["Tabla", "Relación", "Propósito"], item_rows, [145, 95, 300]))
    story.append(Spacer(1, 12))

    # MÓDULO 4
    story.append(Paragraph("4. Módulo de Diseños, Personalizador y Configuración", h1_style))
    dis_rows = [
        [Paragraph("<b>disenos_diseno</b>", col_code), Paragraph("<b>FK</b> user_id", badge_fk), "Lienzo generado por el cliente (Canvas PNG en R2), prenda, color y talla."],
        [Paragraph("<b>catalogo_coloreditor</b>", col_code), Paragraph("<b>UK</b> hex", badge_pk), "Paleta de colores disponibles para personalización en el editor."],
        [Paragraph("<b>catalogo_precioeditor</b>", col_code), Paragraph("<b>UK</b> producto_key", badge_pk), "Matriz de precios base para productos en el personalizador."],
        [Paragraph("<b>catalogo_tallastandard</b>", col_code), Paragraph("<b>UK</b> nombre", badge_pk), "Tallas estándar normalizadas (XS, S, M, L, XL, XXL)."],
        [Paragraph("<b>catalogo_region</b>", col_code), Paragraph("<b>UK</b> nombre", badge_pk), "División político-administrativa de Chile para envíos."],
        [Paragraph("<b>catalogo_fotocliente</b>", col_code), "-", "Galería comunitaria de fotos reales de clientes con reviews."],
    ]
    story.append(make_table(["Tabla", "Clave", "Descripción"], dis_rows, [145, 95, 300]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF actualizado con imagen Ultra-HD en: {output_path}")

if __name__ == '__main__':
    project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
    pdf_filename = project_root / "RC_Estampa_Diagrama_ER_Base_de_Datos.pdf"
    create_er_pdf(str(pdf_filename))
