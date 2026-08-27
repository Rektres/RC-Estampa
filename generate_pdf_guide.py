import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#71717A"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "GUÍA MAESTRA DE IMPLEMENTACIÓN WEB & E-COMMERCE")
            self.drawRightString(558, 750, "ESTÁNDAR TÉCNICO & AUDITORÍA")
            self.setStrokeColor(colors.HexColor("#E4E4E7"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
        
        # Footer
        self.setStrokeColor(colors.HexColor("#E4E4E7"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Documento de Referencia Técnica · Blueprint de Desarrollo")
        self.drawRightString(558, 32, f"Página {self._pageNumber} de {page_count}")
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#18181B")
    accent_gold = colors.HexColor("#C8A96E")
    dark_gold = colors.HexColor("#9B7A3E")
    text_dark = colors.HexColor("#27272A")
    muted_text = colors.HexColor("#71717A")
    bg_light = colors.HexColor("#F4F4F5")
    border_color = colors.HexColor("#E4E4E7")
    
    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        alignment=TA_LEFT,
    )
    
    style_subtitle = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=dark_gold,
        alignment=TA_LEFT,
    )
    
    style_h1 = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
    )
    
    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=dark_gold,
        spaceBefore=8,
        spaceAfter=4,
    )
    
    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=text_dark,
        alignment=TA_JUSTIFY,
    )
    
    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=text_dark,
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=TA_LEFT,
    )
    
    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=text_dark,
    )

    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=primary_color,
    )

    story = []
    
    # --- HEADER / PORTADA ---
    story.append(Spacer(1, 10))
    story.append(Paragraph("GUÍA MAESTRA DE DESARROLLO & BLUEPRINT E-COMMERCE", style_title))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Checklist Técnico Completo, Estándar de Auditoría de Pagos, Seguridad y Cumplimiento Legal", style_subtitle))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_gold, spaceBefore=4, spaceAfter=12))
    
    story.append(Paragraph(
        "Esta guía técnica consolida todos los requerimientos esenciales, buenas prácticas y especificaciones de arquitectura "
        "para la construcción de tiendas online de alto rendimiento. Sirve como base inmutable y pauta de verificación para futuros proyectos.",
        style_body
    ))
    story.append(Spacer(1, 10))

    # --- SECCIÓN 1: CHECKLIST MAESTRO DE 15 PUNTOS ---
    story.append(Paragraph("1. CHECKLIST MAESTRO DE 15 PUNTOS (SEO, UX, LEGAL Y RENDIMIENTO)", style_h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=2, spaceAfter=8))
    
    items_15 = [
        ("1. Política de Privacidad", "Página dedicada que detalla la recolección de datos, finalidades de uso, medidas de seguridad y ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) conforme a la legislación local.", "Obligatorio (Legal)"),
        ("2. Compresión de Imágenes", "Optimización de assets gráficos (WebP / compresión dinámica en CDN / pipeline con Pillow en backend) para garantizar tiempos de carga inferiores a 2 segundos en móvil y desktop.", "Rendimiento & SEO"),
        ("3. Términos y Condiciones", "Reglas contractuales claras: proceso de compra, políticas de devolución, garantía legal, tiempos de despacho, limitaciones de responsabilidad y pasarelas de pago autorizadas.", "Obligatorio (Legal)"),
        ("4. Sitemap.xml", "Archivo XML indexable ubicado en la raíz (/sitemap.xml) que lista todas las URLs públicas, fechas de modificación y prioridades de rastreo para Google y otros motores de búsqueda.", "SEO Técnico"),
        ("5. Meta Título por Página", "Etiquetas &lt;title&gt; únicas y dinámicas para cada vista (Inicio, Catálogo, Fichas de producto, Checkout, etc.) bajo la estructura: '[Producto/Sección] | [Categoría] | [Marca]'.", "SEO & UX"),
        ("6. Estado de Error en Formularios", "Validación inmediata en frontend (React Hook Form + Zod) y backend. Mensajes de error específicos en español, bordes en rojo y bloqueo de envíos con datos inválidos.", "UX & Seguridad"),
        ("7. Información de Contacto Real", "Declaración transparente del modelo de negocio: venta 100% online con despacho a domicilio o dirección comercial física, junto a canales oficiales de soporte (WhatsApp y Correo).", "Confianza & Legal"),
        ("8. Banner de Consentimiento Cookies", "Aviso flotante no invasivo con botones de 'Aceptar Todo' y 'Solo Necesarias', enlace a la política de privacidad y almacenamiento de la preferencia en localStorage.", "Privacidad & UX"),
        ("9. Texto Alternativo en Imágenes (alt)", "Atributo 'alt' semántico y descriptivo en cada etiqueta &lt;img&gt; del sitio para garantizar accesibilidad web (WCAG) y posicionamiento orgánico en Google Imágenes.", "Accesibilidad & SEO"),
        ("10. Página 404 Personalizada", "Vista de error amigable con la identidad visual de la marca, mensaje explicativo y enlaces directos a las principales categorías para evitar que el usuario abandone el sitio.", "UX & Retención"),
        ("11. Página de 'Gracias' / Confirmación", "Pantalla posterior a la compra con número de pedido, resumen de productos, desglose monetario, tiempos estimados de entrega y acceso directo a tracking / soporte.", "UX & Posventa"),
        ("12. Breakpoints Responsivos para Móvil", "Diseño adaptable con navegación optimizada para pantallas táctiles (offcanvas, menús colapsables, botones de acción fijos en móvil y grillas fluidas).", "UX Mobile-First"),
        ("13. Analíticas & Medición", "Integración de herramientas de seguimiento (Google Analytics 4 / Meta Pixel) respetando las preferencias de consentimiento de cookies del usuario.", "Marketing & Datos"),
        ("14. Favicon Personalizado", "Isotipo oficial de la marca en formatos .ico y .png de alta resolución (32x32, 180x180 para Apple Touch) configurado en el head del HTML.", "Branding"),
        ("15. Imagen de Open Graph (og:image)", "Metadatos Open Graph y Twitter Cards dinámicos para generar tarjetas visuales atractivas cuando se comparte el enlace en WhatsApp, Instagram, LinkedIn o Twitter.", "Social Sharing & SEO"),
    ]

    table_data_15 = [
        [Paragraph("Punto / Requisito", style_table_header), Paragraph("Especificación Técnica & Justificación", style_table_header), Paragraph("Tipo / Área", style_table_header)]
    ]
    for name, desc, area in items_15:
        table_data_15.append([
            Paragraph(name, style_table_cell_bold),
            Paragraph(desc, style_table_cell),
            Paragraph(area, style_table_cell),
        ])

    t15 = Table(table_data_15, colWidths=[130, 290, 84])
    t15.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t15)
    story.append(Spacer(1, 14))

    # --- SECCIÓN 2: ESTÁNDAR DE PASARELA DE PAGOS Y AUDITORÍA ---
    story.append(PageBreak())
    story.append(Paragraph("2. ESTÁNDAR DE PAGOS, CONCILIACIÓN BANCARIA Y AUDITORÍA FISCAL", style_h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph(
        "Al integrar pasarelas de pago (Mercado Pago, Webpay Plus, Stripe), la base de datos debe capturar de forma inmutable "
        "los respaldos necesarios para responder ante auditorías tributarias (SII), reclamos bancarios (contracargos/chargebacks) y análisis de compras, "
        "cumpliendo rigurosamente la normativa PCI-DSS.",
        style_body
    ))
    story.append(Spacer(1, 8))

    audit_fields = [
        ("id / transaccion_id", "String / Int", "Identificador único de la transacción en la pasarela de pagos.", "Conciliación inmediata"),
        ("external_reference", "String", "Número de pedido interno (ej. RC-48291048) enviado a la pasarela.", "Vínculo bidireccional"),
        ("payment_method_id", "String(50)", "Franquicia o canal de pago (ej. visa, master, amex, webpay).", "Auditoría de medio"),
        ("payment_type_id", "String(50)", "Tipo de tarjeta/medio (credit_card, debit_card, account_money).", "Perfil de compra"),
        ("card_last_four", "String(4)", "Últimos 4 dígitos de la tarjeta (único dato de tarjeta permitido).", "Comprobante cliente/banco"),
        ("card_first_six (BIN)", "String(6)", "Primeros 6 dígitos para identificar banco emisor (Chile, Santander, etc.).", "Prevención de fraude"),
        ("cardholder_name", "String(150)", "Nombre del titular impreso en el plástico bancario.", "Verificación de identidad"),
        ("cardholder_identification", "String(30)", "RUT o número de documento del pagador.", "Validación legal"),
        ("authorization_code", "String(100)", "Código de autorización generado por el banco adquirente (Transbank/MP).", "Prueba clave en disputas"),
        ("cuotas / installments", "SmallInt", "Cantidad de cuotas elegidas en la transacción.", "Condición financiera"),
        ("total (Bruto)", "Decimal", "Monto total cargado y facturado al cliente final.", "Monto tributario"),
        ("comision_mp (Fee)", "Decimal", "Comisión de la pasarela + IVA de la comisión retenida en origen.", "Gasto financiero contable"),
        ("monto_neto (Net)", "Decimal", "Dinero líquido real que se transfiere a la cuenta de la empresa.", "Flujo de caja neto"),
        ("estado_detalle", "String(100)", "Código técnico de aprobación o rechazo (accredited, cc_rejected_...).", "Soporte y analítica"),
        ("ip_cliente & user_agent", "IP / Text", "Dirección IP pública y navegador del comprador al momento del pago.", "Evidencia de contracargos"),
        ("datos_pago_raw", "JSON", "Copia completa e inalterable de la respuesta JSON emitida por la API.", "Respaldo forense total"),
    ]

    table_data_audit = [
        [Paragraph("Campo en BD", style_table_header), Paragraph("Tipo", style_table_header), Paragraph("Descripción / Valor", style_table_header), Paragraph("Utilidad Principal", style_table_header)]
    ]
    for field, ftype, fdesc, fuse in audit_fields:
        table_data_audit.append([
            Paragraph(field, style_table_cell_bold),
            Paragraph(ftype, style_table_cell),
            Paragraph(fdesc, style_table_cell),
            Paragraph(fuse, style_table_cell),
        ])

    taudit = Table(table_data_audit, colWidths=[120, 55, 205, 124])
    taudit.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(taudit)
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "<b>Regla de Seguridad Crítica (PCI-DSS):</b> NUNCA almacenar el número completo de la tarjeta (PAN de 16 dígitos), "
        "el código de seguridad (CVV de 3 o 4 dígitos) ni la fecha de vencimiento. Solo la pasarela mediante token efímero puede manipularlos.",
        style_body
    ))
    story.append(Spacer(1, 14))

    # --- SECCIÓN 3: EXPERIENCIA DE USUARIO, LOGÍSTICA & 2FA ---
    story.append(Paragraph("3. REGISTRO DE USUARIOS, LOGÍSTICA Y VERIFICACIÓN EN DOS PASOS (2FA)", style_h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph("<b>A. Registro de Usuarios y Verificación por Código (2FA):</b>", style_h2))
    story.append(Paragraph("• <b>Formulario Completo:</b> Captura Nombre, Correo, Teléfono, RUT, Dirección, Comuna, Ciudad y Región.", style_bullet))
    story.append(Paragraph("• <b>Verificación OTP de 6 dígitos:</b> Al registrarse se envía un código temporal al correo. La cuenta queda inactiva hasta ingresar el código correcto.", style_bullet))
    story.append(Paragraph("• <b>Panel Mi Cuenta:</b> Incluye historial de órdenes, tracking en vivo, libreta de direcciones y sistema de Favoritos.", style_bullet))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>B. Logística y Despacho:</b>", style_h2))
    story.append(Paragraph("• <b>Dirección de Envío Flexible:</b> Permite elegir la dirección principal de la cuenta o ingresar una nueva en el checkout.", style_bullet))
    story.append(Paragraph("• <b>Guardado Opcional:</b> Casilla para agregar la nueva dirección como alternativa en el perfil del usuario.", style_bullet))
    story.append(Paragraph("• <b>Separación de Campos:</b> Comuna y Ciudad deben residir en columnas separadas para integración con couriers (Starken, Blue Express, Chilexpress).", style_bullet))
    story.append(Paragraph("• <b>Control de Inventario Automático:</b> Descuento en tiempo real del stock de la variante comprada tras confirmarse el pago.", style_bullet))
    story.append(Spacer(1, 14))

    # --- SECCIÓN 4: PANEL DE ADMINISTRACIÓN & ESTADÍSTICAS ---
    story.append(PageBreak())
    story.append(Paragraph("4. PANEL DE ADMINISTRACIÓN & DASHBOARD DE ESTADÍSTICAS (BI)", style_h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph(
        "El panel de administración debe contar con un módulo analítico en tiempo real que permita evaluar la rentabilidad, "
        "productos estrella y comportamiento transaccional con filtros por período (7 días, 30 días, mes actual, año actual o histórico):",
        style_body
    ))
    story.append(Spacer(1, 8))

    bi_sections = [
        ("Tarjetas KPI Principales", "Ventas Totales Brutas, Ingresos Netos Líquidos (descontando comisiones), Comisiones Retenidas de Pasarela, Total Pedidos Pagados, Ticket Promedio ($) y Tasa de Conversión (%)."),
        ("Top Productos Más Vendidos", "Ranking visual por unidades vendidas, imagen miniatura, barras proporcionales de volumen y recaudación total en CLP por producto."),
        ("Ventas por Línea de Negocio", "Desglose porcentual y monetario por líneas de catálogo (ej. Ropa Urbana, Línea Formal, Drinkware, Diseños Personalizados en vivo)."),
        ("Distribución de Medios de Pago", "Volumen de recaudación y cantidad de compras según franquicia (Visa, Mastercard, Webpay, Transferencia)."),
        ("Despachos por Región", "Geografía de ventas para identificar las comunas y regiones con mayor volumen de pedidos a nivel nacional."),
        ("Embudo Operativo de Pedidos", "Conteo en vivo por estado: Pagados, En Proceso de Producción, Enviados a Courier, Entregados, Pendientes y Cancelados."),
        ("Auditoría de Transacciones", "Tabla con las últimas compras: número de orden, cliente, medio de pago (4 dígitos), monto bruto, comisión retenida, neto recibido y estado."),
    ]

    for title, desc in bi_sections:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", style_bullet))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 14))

    # --- SECCIÓN 5: RESUMEN DE STACK TECNOLÓGICO RECOMENDADO ---
    story.append(Paragraph("5. STACK TECNOLÓGICO & INFRAESTRUCTURA DE REFERENCIA", style_h1))
    story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=2, spaceAfter=8))
    
    stack_data = [
        [Paragraph("Capa / Componente", style_table_header), Paragraph("Tecnología Recomendada", style_table_header), Paragraph("Rol en la Arquitectura", style_table_header)],
        [Paragraph("Frontend SPA", style_table_cell_bold), Paragraph("React 18 + TypeScript + Vite + Bootstrap 5", style_table_cell), Paragraph("Interfaz ultrarrápida, validación Zod y diseño responsivo.", style_table_cell)],
        [Paragraph("Backend API", style_table_cell_bold), Paragraph("Django 5 + Django REST Framework + SimpleJWT", style_table_cell), Paragraph("Lógica de negocio, autenticación segura y ORM robusto.", style_table_cell)],
        [Paragraph("Base de Datos", style_table_cell_bold), Paragraph("PostgreSQL 16", style_table_cell), Paragraph("Integridad transaccional ACID, JSONField y migraciones limpias.", style_table_cell)],
        [Paragraph("Pasarela de Pago", style_table_cell_bold), Paragraph("Mercado Pago Checkout API / Webhooks IPN", style_table_cell), Paragraph("Cobro directo con tarjeta, conciliación y eventos asíncronos.", style_table_cell)],
        [Paragraph("Notificaciones", style_table_cell_bold), Paragraph("Django Core Mail / SMTP (Gmail o Dominio Corporativo)", style_table_cell), Paragraph("Envío de códigos 2FA y comprobantes de compra con plantilla HTML.", style_table_cell)],
        [Paragraph("Contenedores & Proxy", style_table_cell_bold), Paragraph("Docker Compose + Nginx + Gunicorn + SSL", style_table_cell), Paragraph("Despliegue reproducible, aislamiento y seguridad en producción.", style_table_cell)],
    ]

    tstack = Table(stack_data, colWidths=[120, 190, 194])
    tstack.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(tstack)
    
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generado exitosamente en: {filename}")

if __name__ == '__main__':
    output_path = sys.argv[1] if len(sys.argv) > 1 else 'Guia_Maestra_ECommerce_Checklist_Estandar.pdf'
    build_pdf(output_path)
