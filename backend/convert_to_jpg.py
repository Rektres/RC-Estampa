from PIL import Image
from pathlib import Path

project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
src_png = project_root / "backend" / "er_diagram_hd.png"
dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"

img = Image.open(src_png)

# Convert RGBA to RGB with clean white background
if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
    background = Image.new("RGB", img.size, (255, 255, 255))
    background.paste(img, mask=img.split()[3] if img.mode == "RGBA" else None)
    img = background
else:
    img = img.convert("RGB")

img.save(dst_jpg, "JPEG", quality=95, optimize=True)
print(f"Imagen JPG guardada exitosamente en: {dst_jpg} ({img.size[0]}x{img.size[1]} px)")
