import logging
from django.db import models
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Carrito, Cotizacion, Pedido
from .serializers import CarritoSerializer, CotizacionSerializer, PedidoSerializer
from .services.mercadopago import obtener_info_pago_mercadopago

logger = logging.getLogger(__name__)


class PedidoViewSet(mixins.CreateModelMixin, mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'numero'

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if getattr(user, 'rol', '') == 'admin' or user.is_staff:
                return Pedido.objects.all().order_by('-creado_en')
            return Pedido.objects.filter(models.Q(user=user) | models.Q(email__iexact=user.email)).order_by('-creado_en')
        email = self.request.query_params.get('email')
        if email:
            return Pedido.objects.filter(email__iexact=email).order_by('-creado_en')
        return Pedido.objects.none()



class CotizacionViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = CotizacionSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Cotizacion.objects.all()


class CarritoView(generics.GenericAPIView):
    serializer_class = CarritoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_carrito(self):
        carrito, _ = Carrito.objects.get_or_create(user=self.request.user)
        return carrito

    def get(self, request):
        return Response(self.get_serializer(self.get_carrito()).data)

    def put(self, request):
        serializer = self.get_serializer(self.get_carrito(), data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([permissions.AllowAny])
def mercadopago_webhook(request):
    """
    Webhook / Notificación IPN para Mercado Pago.
    Recibe notificaciones de eventos de pago y actualiza el pedido correspondiente.
    """
    try:
        data = request.data if request.method == 'POST' else {}
        topic = request.GET.get('topic') or data.get('type')
        payment_id = request.GET.get('id') or data.get('data', {}).get('id') or request.GET.get('data.id')

        logger.info(f"Webhook Mercado Pago recibido: topic={topic}, payment_id={payment_id}")

        if (topic in ('payment', 'merchant_order') or data.get('action') == 'payment.created' or data.get('action') == 'payment.updated') and payment_id:
            payment_info = obtener_info_pago_mercadopago(payment_id)
            if payment_info:
                payment_status = payment_info.get("status")
                external_ref = payment_info.get("external_reference")

                logger.info(f"Estado de pago MP {payment_id} para ref {external_ref}: {payment_status}")

                if external_ref:
                    pedido = Pedido.objects.filter(numero=external_ref).first()
                    if pedido:
                        from .services.mercadopago_api import descontar_stock_y_notificar, poblar_datos_auditoria_pedido

                        pedido.transaccion_id = str(payment_id)
                        pedido.datos_pago_raw = payment_info

                        poblar_datos_auditoria_pedido(pedido, res=payment_info)

                        if payment_status == 'approved':
                            pedido.estado = 'pagado'
                            if not pedido.pagado_en:
                                pedido.pagado_en = timezone.now()
                            descontar_stock_y_notificar(pedido)
                        elif payment_status in ('rejected', 'cancelled'):
                            if pedido.estado == 'pendiente':
                                pedido.estado = 'cancelado'

                        pedido.save()
                        logger.info(f"Pedido {pedido.numero} actualizado exitosamente a estado={pedido.estado}")

        return Response({"status": "received"}, status=status.HTTP_200_OK)

    except Exception as exc:
        logger.error(f"Error procesando webhook de Mercado Pago: {exc}")
        return Response({"status": "error", "message": str(exc)}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def procesar_pago_tarjeta(request):
    """
    Endpoint para procesar pagos con tarjeta directamente en el sitio (Checkout API).
    Crea el pedido si no existe y procesa el token de tarjeta con Mercado Pago.
    """
    try:
        from .services.mercadopago_api import procesar_pago_directo_mercadopago

        data = request.data
        token = data.get('token')
        payment_method_id = data.get('payment_method_id')
        installments = data.get('installments', 1)
        issuer_id = data.get('issuer_id')
        doc_type = data.get('doc_type', 'RUT')
        doc_number = data.get('doc_number', '')
        payer_email = data.get('payer_email')
        pedido_numero = data.get('pedido_numero')
        pedido_input = data.get('pedido_data')

        if not token or not payment_method_id:
            return Response(
                {"success": False, "message": "Faltan datos de la tarjeta (token o método de pago)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extraer IP y User Agent del comprador
        ip_cliente = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # 1. Obtener o crear el pedido
        pedido = None
        if pedido_numero:
            pedido = Pedido.objects.filter(numero=pedido_numero).first()

        if not pedido and pedido_input:
            serializer = PedidoSerializer(data=pedido_input, context={'request': request})
            serializer.is_valid(raise_exception=True)
            pedido = serializer.save()

        if not pedido:
            return Response(
                {"success": False, "message": "No se pudo identificar el pedido para el cobro."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_test_card = data.get('is_test_card', False)
        card_last_digits = data.get('card_last_digits', '')

        # 2. Procesar el cobro directo en Mercado Pago API
        resultado = procesar_pago_directo_mercadopago(
            pedido=pedido,
            token=token,
            payment_method_id=payment_method_id,
            installments=installments,
            issuer_id=issuer_id,
            payer_email=payer_email,
            doc_type=doc_type,
            doc_number=doc_number,
            is_test_card=is_test_card,
            card_last_digits=card_last_digits,
            ip_cliente=ip_cliente,
            user_agent=user_agent,
        )

        resultado['pedido'] = PedidoSerializer(pedido).data
        http_code = status.HTTP_200_OK if resultado.get('success') else status.HTTP_400_BAD_REQUEST
        return Response(resultado, status=http_code)

    except Exception as exc:
        logger.error(f"Error en procesar_pago_tarjeta: {exc}")
        return Response(
            {"success": False, "message": f"Error al procesar el pago: {str(exc)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class PanelEstadisticasView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from datetime import timedelta
        from .models import ItemPedido

        user = request.user
        if getattr(user, 'rol', '') != 'admin' and not user.is_staff and not user.is_superuser:
            return Response(
                {"detail": "No tienes permisos de administrador para consultar estadísticas."},
                status=status.HTTP_403_FORBIDDEN,
            )

        periodo = request.query_params.get('periodo', 'todo')
        ahora = timezone.now()
        qs = Pedido.objects.all()

        if periodo == '7d':
            qs = qs.filter(creado_en__gte=ahora - timedelta(days=7))
        elif periodo == '30d':
            qs = qs.filter(creado_en__gte=ahora - timedelta(days=30))
        elif periodo == 'este_mes':
            qs = qs.filter(creado_en__year=ahora.year, creado_en__month=ahora.month)
        elif periodo == 'este_ano':
            qs = qs.filter(creado_en__year=ahora.year)

        # 1. KPIs Globales
        pedidos_pagados = qs.filter(estado__in=['pagado', 'en_proceso', 'enviado', 'entregado'])

        total_ventas_bruto = pedidos_pagados.aggregate(total=models.Sum('total'))['total'] or 0
        total_ventas_neto = pedidos_pagados.aggregate(neto=models.Sum('monto_neto'))['neto']
        if total_ventas_neto is None:
            total_comision = pedidos_pagados.aggregate(fee=models.Sum('comision_mp'))['fee'] or 0
            total_ventas_neto = max(0, total_ventas_bruto - float(total_comision))
        else:
            total_ventas_neto = float(total_ventas_neto)

        total_comision_mp = float(pedidos_pagados.aggregate(fee=models.Sum('comision_mp'))['fee'] or 0)
        total_pedidos_pagados_count = pedidos_pagados.count()
        total_pedidos_total_count = qs.count()

        ticket_promedio = round(total_ventas_bruto / total_pedidos_pagados_count) if total_pedidos_pagados_count > 0 else 0
        tasa_conversion = round((total_pedidos_pagados_count / total_pedidos_total_count) * 100, 1) if total_pedidos_total_count > 0 else 0

        conteo_estados = {
            'pagado': qs.filter(estado='pagado').count(),
            'en_proceso': qs.filter(estado='en_proceso').count(),
            'enviado': qs.filter(estado='enviado').count(),
            'entregado': qs.filter(estado='entregado').count(),
            'pendiente': qs.filter(estado='pendiente').count(),
            'cancelado': qs.filter(estado='cancelado').count(),
        }

        # 2. Top Productos Más Vendidos
        items_pagados = ItemPedido.objects.filter(pedido__in=pedidos_pagados)
        top_prods_raw = (
            items_pagados.values('nombre', 'tipo', 'imagen')
            .annotate(
                unidades_vendidas=models.Sum('cantidad'),
                ingresos_totales=models.Sum(models.F('precio') * models.F('cantidad')),
            )
            .order_by('-unidades_vendidas')[:10]
        )

        top_productos = []
        for p in top_prods_raw:
            top_productos.append({
                'nombre': p['nombre'],
                'tipo': p['tipo'],
                'imagen': p['imagen'],
                'unidades_vendidas': p['unidades_vendidas'] or 0,
                'ingresos_totales': p['ingresos_totales'] or 0,
            })

        # 3. Ventas por Línea / Tipo de Producto
        lineas_raw = (
            items_pagados.values('linea')
            .annotate(
                unidades=models.Sum('cantidad'),
                ingresos=models.Sum(models.F('precio') * models.F('cantidad')),
            )
            .order_by('-ingresos')
        )
        ventas_por_linea = [
            {
                'linea': l['linea'] or 'Sin Línea / Personalizado',
                'unidades': l['unidades'] or 0,
                'ingresos': l['ingresos'] or 0,
            }
            for l in lineas_raw
        ]

        # 4. Distribución por Medio de Pago
        metodos_raw = (
            pedidos_pagados.values('metodo_pago', 'payment_method_id')
            .annotate(
                conteo=models.Count('id'),
                total=models.Sum('total'),
            )
            .order_by('-total')
        )
        medios_pago = [
            {
                'metodo': (m['payment_method_id'] or m['metodo_pago'] or 'mercadopago').upper(),
                'conteo': m['conteo'],
                'total': m['total'] or 0,
            }
            for m in metodos_raw
        ]

        # 5. Geografía / Regiones con Más Ventas
        regiones_raw = (
            pedidos_pagados.values('region')
            .annotate(
                conteo=models.Count('id'),
                total=models.Sum('total'),
            )
            .order_by('-total')[:6]
        )
        ventas_por_region = [
            {
                'region': r['region'] or 'Región Metropolitana',
                'conteo': r['conteo'],
                'total': r['total'] or 0,
            }
            for r in regiones_raw
        ]

        # 6. Últimas 10 Transacciones
        ultimas_transacciones = []
        for ped in pedidos_pagados.order_by('-creado_en')[:10]:
            ultimas_transacciones.append({
                'numero': ped.numero,
                'nombre': ped.nombre,
                'email': ped.email,
                'total': ped.total,
                'monto_neto': float(ped.monto_neto) if ped.monto_neto is not None else None,
                'comision_mp': float(ped.comision_mp) if ped.comision_mp else 0,
                'estado': ped.estado,
                'metodo_pago': ped.metodo_pago,
                'payment_method_id': ped.payment_method_id,
                'card_last_four': ped.card_last_four,
                'pagado_en': ped.pagado_en,
                'creado_en': ped.creado_en,
            })

        return Response({
            'periodo': periodo,
            'kpis': {
                'total_ventas_bruto': total_ventas_bruto,
                'total_ventas_neto': total_ventas_neto,
                'total_comision_mp': total_comision_mp,
                'total_pedidos_pagados': total_pedidos_pagados_count,
                'total_pedidos_generados': total_pedidos_total_count,
                'ticket_promedio': ticket_promedio,
                'tasa_conversion': tasa_conversion,
                'conteo_estados': conteo_estados,
            },
            'top_productos': top_productos,
            'ventas_por_linea': ventas_por_linea,
            'medios_pago': medios_pago,
            'ventas_por_region': ventas_por_region,
            'ultimas_transacciones': ultimas_transacciones,
        }, status=status.HTTP_200_OK)


