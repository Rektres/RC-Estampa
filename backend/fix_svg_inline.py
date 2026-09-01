import re
import fitz
from PIL import Image
from pathlib import Path
import xml.etree.ElementTree as ET

project_root = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa")
svg_file = project_root / "backend" / "er_diagram.svg"
dst_jpg = project_root / "RC_Estampa_Diagrama_ER.jpg"

with open(svg_file, "r", encoding="utf-8") as f:
    svg_raw = f.read()

# 1. Set explicit width and height on root svg to match viewBox
svg_raw = re.sub(r'<svg id="mermaid-svg" width="[^"]*"', '<svg id="mermaid-svg" width="5076px" height="2970px"', svg_raw)

# 2. Fix lines: replace relationship lines without fill="none"
# Any path inside edgePaths or with class relationshipLine
def fix_paths(match):
    tag = match.group(0)
    if 'relationshipLine' in tag or 'edgePaths' in tag:
        if 'fill=' not in tag:
            tag = tag.replace('class="', 'fill="none" stroke="#c9a84c" stroke-width="2.5" class="')
    if 'outer-path' in tag:
        tag = tag.replace('fill="none"', 'fill="#f8fafc"')
    return tag

# Ensure all paths with relationshipLine have fill="none" and stroke="#c9a84c"
svg_raw = re.sub(r'<path[^>]*class="[^"]*relationshipLine[^"]*"[^>]*>', lambda m: re.sub(r'fill="[^"]*"', 'fill="none"', m.group(0)) if 'fill=' in m.group(0) else m.group(0).replace('class="', 'fill="none" stroke="#c9a84c" stroke-width="2.5" class="'), svg_raw)

# Also fix any path without fill inside edgePaths
# Replace all style="undefined;;;undefined" on lines
svg_raw = svg_raw.replace('style="undefined;;;undefined"', 'style="fill:none;stroke:#c9a84c;stroke-width:2.5px;" fill="none" stroke="#c9a84c" stroke-width="2.5"')

# Fix row-rect fills and strokes
svg_raw = re.sub(r'<g[^>]*class="row-rect-[^"]*"[^>]*>\s*<path d="([^"]*)" stroke="none" stroke-width="0" fill="[^"]*"', r'<g class="row-rect">\n<path d="\1" stroke="#3b82f6" stroke-width="1.5" fill="#f8fafc"', svg_raw)
svg_raw = re.sub(r'<g[^>]*class="outer-path"[^>]*>\s*<path d="([^"]*)" stroke="none" stroke-width="0" fill="[^"]*"', r'<g class="outer-path">\n<path d="\1" stroke="#1d4ed8" stroke-width="2.5" fill="#f1f5f9"', svg_raw)

# Fix markers (crow feet / 1:N symbols)
svg_raw = re.sub(r'<marker id="([^"]*)" class="marker ([^"]*)"', r'<marker id="\1" class="marker \2" fill="none" stroke="#c9a84c" stroke-width="2"', svg_raw)
svg_raw = re.sub(r'<marker [^>]*>\s*<path d="([^"]*)"', r'<marker fill="none" stroke="#c9a84c" stroke-width="2"><path d="\1" fill="none" stroke="#c9a84c" stroke-width="2"', svg_raw)

# Fix text colors
svg_raw = svg_raw.replace('<text ', '<text fill="#0f172a" ')

svg_fixed_path = project_root / "backend" / "er_diagram_inlined.svg"
with open(svg_fixed_path, "w", encoding="utf-8") as f:
    f.write(svg_raw)

print("SVG inlined guardado exitosamente!")

# Render with PyMuPDF
doc = fitz.open(svg_fixed_path)
page = doc[0]
print(f"Dimensiones de página SVG: {page.rect.width} x {page.rect.height}")

zoom = 1.5
mat = fitz.Matrix(zoom, zoom)
pix = page.get_pixmap(matrix=mat, alpha=False)

temp_png = project_root / "backend" / "er_inlined.png"
pix.save(temp_png)
print(f"Pixmap generado: {pix.width} x {pix.height} px")

# Convert to JPG
im = Image.open(temp_png).convert("RGB")
im.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)

print(f"JPG FINAL GUARDADO: {dst_jpg} ({im.size[0]}x{im.size[1]} px, {dst_jpg.stat().st_size / (1024*1024):.2f} MB)")
