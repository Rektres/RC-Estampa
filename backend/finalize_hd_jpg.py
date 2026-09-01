from PIL import Image, ImageChops
from pathlib import Path

project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
src_png = project_root / "RC_Estampa_Diagrama_ER_Puppeteer.png"
dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"

print("Abriendo PNG capturado por Puppeteer Chromium...")
im = Image.open(src_png).convert("RGB")
print(f"Dimensiones iniciales: {im.size[0]} x {im.size[1]} px")

# Auto-crop white borders cleanly
bg = Image.new("RGB", im.size, (255, 255, 255))
diff = ImageChops.difference(im, bg)
bbox = diff.getbbox()
print(f"Bounding box: {bbox}")

if bbox:
    margin = 50
    crop_box = (
        max(0, bbox[0] - margin),
        max(0, bbox[1] - margin),
        min(im.size[0], bbox[2] + margin),
        min(im.size[1], bbox[3] + margin)
    )
    cropped = im.crop(crop_box)
else:
    cropped = im

print(f"Dimensiones recortadas finales: {cropped.size[0]} x {cropped.size[1]} px")

# Guardar en JPEG calidad 100% y Chroma 4:4:4
cropped.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)

print(f"\n=======================================================")
print(f"DIAGRAMA ER ULTRA-HD (4K / 8K) GENERADO PERFECTAMENTE:")
print(f" - Resolución: {cropped.size[0]} x {cropped.size[1]} PÍXELES")
print(f" - Calidad: 100% Calidad Máxima JPEG (Chroma 4:4:4)")
print(f" - Destino: {dst_jpg}")
print(f" - Tamaño: {dst_jpg.stat().st_size / (1024*1024):.2f} MB")
print(f"=======================================================")
