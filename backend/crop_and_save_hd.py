from PIL import Image, ImageChops
from pathlib import Path

project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
raw_png = project_root / "backend" / "er_diagram_4k_raw.png"
dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"

img = Image.open(raw_png).convert("RGB")

# Auto-crop white borders while leaving a clean 50px margin
bg = Image.new("RGB", img.size, (255, 255, 255))
diff = ImageChops.difference(img, bg)
bbox = diff.getbbox()

if bbox:
    margin = 40
    crop_box = (
        max(0, bbox[0] - margin),
        max(0, bbox[1] - margin),
        min(img.size[0], bbox[2] + margin),
        min(img.size[1], bbox[3] + margin)
    )
    cropped = img.crop(crop_box)
else:
    cropped = img

# Save with maximum quality (100) and no chroma subsampling (subsampling=0) for razor-sharp text
cropped.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)
print(f"Diagrama ER Ultra-HD generado con éxito:")
print(f" - Dimensiones: {cropped.size[0]} x {cropped.size[1]} px")
print(f" - Archivo: {dst_jpg}")
