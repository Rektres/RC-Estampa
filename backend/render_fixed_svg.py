import re
import fitz
from PIL import Image
from pathlib import Path

project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
svg_file = project_root / "backend" / "er_diagram.svg"
dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"

# Read SVG content
with open(svg_file, "r", encoding="utf-8") as f:
    svg_content = f.read()

# Replace width="100%" with width="5076px" height="2970px"
svg_content = re.sub(r'<svg id="mermaid-svg" width="[^"]*"', '<svg id="mermaid-svg" width="5076px" height="2970px"', svg_content)

svg_fixed = project_root / "backend" / "er_diagram_fixed.svg"
with open(svg_fixed, "w", encoding="utf-8") as f:
    f.write(svg_content)

# Open with PyMuPDF
doc = fitz.open(svg_fixed)
page = doc[0]
print(f"Native Page rect: {page.rect.width} x {page.rect.height} px")

# Render at 1.5x for crystal-clear 7614 x 4455 px Ultra-HD output
scale = 1.5
mat = fitz.Matrix(scale, scale)
pix = page.get_pixmap(matrix=mat, alpha=False)

temp_png = project_root / "backend" / "er_diagram_7k.png"
pix.save(temp_png)
print(f"Pixmap renderizado: {pix.width} x {pix.height} px")

im = Image.open(temp_png).convert("RGB")
im.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)

print(f"\n=======================================================")
print(f"IMAGEN JPG ULTRA-HD (7.6K) GENERADA EXITOSAMENTE:")
print(f" - Resolución: {im.size[0]} x {im.size[1]} PÍXELES (Full Ultra-HD)")
print(f" - Calidad: 100% Sin compresión cromática (Chroma 4:4:4)")
print(f" - Archivo: {dst_jpg}")
print(f" - Tamaño: {dst_jpg.stat().st_size / (1024*1024):.2f} MB")
print(f"=======================================================")
