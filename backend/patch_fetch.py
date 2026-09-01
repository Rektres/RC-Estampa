import base64
import requests
from PIL import Image

with open("backend/fetch_er_img.py", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("?scale=2", "?type=png")
with open("backend/fetch_er_img.py", "w", encoding="utf-8") as f:
    f.write(text)
