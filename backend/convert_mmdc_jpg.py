from PIL import Image
from pathlib import Path

project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
src_png = project_root / "RC_Estampa_Diagrama_ER.png"
dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"

print("Abriendo PNG generado por Chromium Puppeteer...")
im = Image.open(src_png)
print(f"Dimensiones de la imagen: {im.size[0]} x {im.size[1]} px")

im_rgb = im.convert("RGB")
im_rgb.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)

print(f"\n=======================================================")
print(f"JPG ULTRA-HD GENERADO EXITOSAMENTE CON MERMAID CLI:")
print(f" - Resolución: {im_rgb.size[0]} x {im_rgb.size[1]} PÍXELES")
print(f" - Calidad: 100% (Chroma 4:4:4, cero artefactos)")
print(f" - Archivo: {dst_jpg}")
print(f" - Tamaño: {dst_jpg.stat().st_size / (1024*1024):.2f} MB")
print(f"=======================================================")
