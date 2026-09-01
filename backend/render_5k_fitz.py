import fitz
from PIL import Image
from pathlib import Path

project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
svg_file = project_root / "backend" / "er_diagram.svg"
dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"

doc = fitz.open(svg_file)
page = doc[0]
rect = page.rect
print(f"Page rect: {rect.width} x {rect.height}")

# Target resolution: 5076 px width (Native 5K vector resolution)
target_width = 5076
zoom = target_width / rect.width
print(f"Calculated zoom factor: {zoom:.2f}x")

mat = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat, alpha=False)

temp_png = project_root / "backend" / "er_diagram_5k.png"
pix.save(temp_png)
print(f"Pixmap renderizado: {pix.width} x {pix.height} px")

# Save as highest quality JPEG (100% quality, 4:4:4 no subsampling)
im = Image.open(temp_png).convert("RGB")
im.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)

print(f"\n==========================================")
print(f"IMAGEN JPG ULTRA-HD GENERADA CON ÉXITO:")
print(f" - Resolución: {im.size[0]} x {im.size[1]} PÍXELES (5K Ultra-HD)")
print(f" - Destino: {dst_jpg}")
print(f" - Tamaño: {dst_jpg.stat().st_size / (1024*1024):.2f} MB")
print(f"==========================================")
