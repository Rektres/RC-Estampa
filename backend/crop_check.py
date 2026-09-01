from PIL import Image, ImageChops
from pathlib import Path

dst_jpg = Path(r"c:\Users\Matteo\Documents\Espacio de trabajo\RC Estampa\RC Estampa\RC_Estampa_Diagrama_ER.jpg")
im = Image.open(dst_jpg)
print("Image size:", im.size)

# Let's crop to content bounding box to remove excess white margins
bg = Image.new("RGB", im.size, (255, 255, 255))
diff = ImageChops.difference(im, bg)
bbox = diff.getbbox()
print("Bounding box of diagram content:", bbox)

if bbox:
    margin = 80
    crop_box = (
        max(0, bbox[0] - margin),
        max(0, bbox[1] - margin),
        min(im.size[0], bbox[2] + margin),
        min(im.size[1], bbox[3] + margin)
    )
    cropped = im.crop(crop_box)
    print("Cropped size:", cropped.size)
    cropped.save(dst_jpg, "JPEG", quality=100, subsampling=0, optimize=True)
    print("Final cropped 5K image saved!")
