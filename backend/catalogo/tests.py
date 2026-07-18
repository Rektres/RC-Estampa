import io

from django.core.management import call_command
from rest_framework.test import APITestCase

from cuentas.models import User


class PanelAdminTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('seed_catalogo', verbosity=0)
        cls.admin = User.objects.create_superuser(email='admin@rc.cl', password='admin123')
        cls.cliente = User.objects.create_user(email='cliente@rc.cl', password='cliente123')

    def login(self, email, password):
        r = self.client.post('/api/auth/token/', {'email': email, 'password': password}, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {r.data["access"]}')

    def _nuevo_producto(self, **overrides):
        data = {
            'nombre': 'Polera Test Panel',
            'slug': '',
            'descripcion': 'Producto creado desde el panel.',
            'precio': 19990,
            'precio_oferta': None,
            'activo': True, 'destacado': False, 'nuevo': True,
            'linea': 'urbana',
            'categoria': 1,
            'variantes': [
                {'talla': 'M', 'color': 'Negro', 'color_hex': '#111111', 'stock': 5, 'sku': 'TEST-PAN-M'},
            ],
            'imagenes': [
                {'imagen': '/media/productos/fake.png', 'es_principal': True, 'es_frente': True, 'orden': 0},
            ],
        }
        data.update(overrides)
        return data

    def test_permisos(self):
        r = self.client.get('/api/panel/productos/')
        self.assertEqual(r.status_code, 401)
        self.login('cliente@rc.cl', 'cliente123')
        r = self.client.get('/api/panel/productos/')
        self.assertEqual(r.status_code, 403)
        self.login('admin@rc.cl', 'admin123')
        r = self.client.get('/api/panel/productos/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['count'], 8)

    def test_crud_producto(self):
        self.login('admin@rc.cl', 'admin123')

        # Crear con slug autogenerado
        r = self.client.post('/api/panel/productos/', self._nuevo_producto(), format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data['slug'], 'polera-test-panel')
        pid = r.data['id']

        # SKU duplicado contra otro producto
        dup = self._nuevo_producto(nombre='Otra', variantes=[
            {'talla': 'S', 'color': 'X', 'color_hex': '#000', 'stock': 1, 'sku': 'POL-NEG-M'},
        ])
        r = self.client.post('/api/panel/productos/', dup, format='json')
        self.assertEqual(r.status_code, 400)

        # Editar con replace de nested
        editado = self._nuevo_producto(nombre='Polera Test Editada', precio=24990, variantes=[
            {'talla': 'XL', 'color': 'Blanco', 'color_hex': '#FFFFFF', 'stock': 9, 'sku': 'TEST-PAN-XL'},
        ])
        r = self.client.put(f'/api/panel/productos/{pid}/', editado, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.data['variantes']), 1)
        self.assertEqual(r.data['variantes'][0]['talla'], 'XL')

        # Deshabilitar: desaparece del público, sigue en el panel
        r = self.client.patch(f'/api/panel/productos/{pid}/', {'activo': False}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertFalse(r.data['activo'])
        r = self.client.get('/api/productos/', {'q': 'Test Editada'})
        self.assertEqual(r.data['count'], 0)
        r = self.client.get('/api/panel/productos/', {'q': 'Test Editada'})
        self.assertEqual(r.data['count'], 1)

        # Eliminar
        r = self.client.delete(f'/api/panel/productos/{pid}/')
        self.assertEqual(r.status_code, 204)

    def test_crud_drinkware(self):
        self.login('admin@rc.cl', 'admin123')
        vaj = {
            'nombre': 'Taza Test Panel', 'slug': '', 'descripcion': 'x', 'material': 'Cerámica',
            'capacidad_ml': 300, 'precio': 9990, 'precio_oferta': None,
            'activo': True, 'destacado': False, 'nuevo': False, 'categoria': 7,
            'variantes': [{'color': 'Blanco', 'color_hex': '#FFFFFF', 'stock': 4, 'sku': 'TEST-VAJ-BLA'}],
            'imagenes': [{'imagen': 'https://example.com/taza.jpg', 'es_principal': True, 'orden': 0}],
        }
        r = self.client.post('/api/panel/drinkware/', vaj, format='json')
        self.assertEqual(r.status_code, 201)
        r = self.client.delete(f'/api/panel/drinkware/{r.data["id"]}/')
        self.assertEqual(r.status_code, 204)

    def test_categorias(self):
        self.login('admin@rc.cl', 'admin123')
        r = self.client.post('/api/panel/categorias/', {'nombre': 'Gorras', 'slug': 'gorras', 'linea': 'urbana'}, format='json')
        self.assertEqual(r.status_code, 201)
        r = self.client.delete(f'/api/panel/categorias/{r.data["id"]}/')
        self.assertEqual(r.status_code, 204)
        # Con productos asociados (PROTECT) -> 400
        r = self.client.delete('/api/panel/categorias/1/')
        self.assertEqual(r.status_code, 400)

    def test_upload(self):
        self.login('admin@rc.cl', 'admin123')
        f = io.BytesIO(b'\x89PNG\r\n\x1a\n' + b'\x00' * 64)
        f.name = 'test.png'
        r = self.client.post('/api/panel/upload/', {'file': f}, format='multipart')
        self.assertEqual(r.status_code, 201)
        self.assertTrue(r.data['url'].startswith('/media/productos/'))

        f2 = io.BytesIO(b'x')
        f2.name = 'malo.exe'
        r = self.client.post('/api/panel/upload/', {'file': f2}, format='multipart')
        self.assertEqual(r.status_code, 400)
