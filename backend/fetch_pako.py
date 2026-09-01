import json
import zlib
import base64
import requests
from PIL import Image
from pathlib import Path

with open("backend/fetch_mermaid_ink_png.py", "r", encoding="utf-8") as f:
    text = f.read()

mermaid_code = text.split('mermaid_code = """')[1].split('"""')[0]

payload = {
    "code": mermaid_code,
    "mermaid": {
        "theme": "default"
    }
}

json_bytes = json.dumps(payload).encode('utf-8')
compressed = zlib.compress(json_bytes, level=9)
encoded = base64.urlsafe_b64encode(compressed).decode('ascii')

url = f"https://mermaid.ink/img/pako:{encoded}"
print(f"URL generada con Pako (longitud {len(url)} chars): {url[:60]}...")

res = requests.get(url, timeout=25)
print("Status code:", res.status_code)

if res.status_code == 200:
    project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
    temp_png = project_root / "backend" / "mermaid_pako_clean.png"
    dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"
    
    with open(temp_png, "wb") as f:
        f.write(res.content)
        
    im = Image.open(temp_png)
    print(f"Dimensiones de imagen renderizada por Chromium: {im.size[0]} x {im.size[1]} px")
    
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3] if im.mode == "RGBA" else None)
        im_rgb = bg
    else:
        im_rgb = im.convert("RGB")
        
    im_rgb.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)
    print(f"JPG guardado exitosamente en: {dst_jpg}")
    print(f"Tamaño: {dst_jpg.stat().st_size / 1024:.1f} KB")
else:
    print("Error:", res.text[:200])
