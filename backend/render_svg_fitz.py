import fitz
from PIL import Image
from pathlib import Path

project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
svg_file = project_root / "backend" / "er_diagram.svg"
dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"

print("Abriendo SVG con PyMuPDF (fitz)...")
doc = fitz.open(svg_file)
page = doc[0]

# Renderizamos a escala 3.0x (aprox. 5000-6000 px de ancho)
zoom = 3.0
mat = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat, alpha=False)

temp_png = project_root / "backend" / "er_diagram_ultra_raw.png"
pix.save(temp_png)
print(f"Pixmap renderizado: {pix.width} x {pix.height} px")

# Abrir con Pillow para optimizar y guardar en JPG con calidad máxima 100 y subsampling=0
im = Image.open(temp_png).convert("RGB")
im.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)

print(f"IMAGEN JPG ULTRA-HD GENERADA:")
print(f" - Dimensiones: {im.size[0]} x {im.size[1]} px")
print(f" - Archivo: {dst_jpg}")
print(f" - Peso: {dst_jpg.stat().st_size / (1024*1024):.2f} MB")
