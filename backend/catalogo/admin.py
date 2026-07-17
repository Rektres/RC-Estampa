from django.contrib import admin

from .models import (
    Categoria,
    ColorEditor,
    FotoCliente,
    ImagenProducto,
    ImagenVajilla,
    PrecioEditor,
    Producto,
    ProductoVajilla,
    Region,
    TallaStandard,
    VarianteProducto,
    VarianteVajilla,
)


class VarianteProductoInline(admin.TabularInline):
    model = VarianteProducto
    extra = 0


class ImagenProductoInline(admin.TabularInline):
    model = ImagenProducto
    extra = 0


class VarianteVajillaInline(admin.TabularInline):
    model = VarianteVajilla
    extra = 0


class ImagenVajillaInline(admin.TabularInline):
    model = ImagenVajilla
    extra = 0


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'linea', 'categoria', 'precio', 'activo', 'destacado', 'nuevo')
    list_filter = ('linea', 'activo', 'destacado', 'nuevo')
    search_fields = ('nombre', 'slug')
    prepopulated_fields = {'slug': ('nombre',)}
    inlines = [VarianteProductoInline, ImagenProductoInline]


@admin.register(ProductoVajilla)
class ProductoVajillaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'material', 'categoria', 'precio', 'activo', 'destacado', 'nuevo')
    list_filter = ('activo', 'destacado', 'nuevo', 'material')
    search_fields = ('nombre', 'slug')
    prepopulated_fields = {'slug': ('nombre',)}
    inlines = [VarianteVajillaInline, ImagenVajillaInline]


admin.site.register(Categoria)
admin.site.register(FotoCliente)
admin.site.register(ColorEditor)
admin.site.register(PrecioEditor)
admin.site.register(TallaStandard)
admin.site.register(Region)
