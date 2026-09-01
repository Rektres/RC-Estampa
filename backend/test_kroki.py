import requests

with open("backend/fetch_er_img.py", "r", encoding="utf-8") as f:
    text = f.read()

mermaid_code = text.split('mermaid_code = """')[1].split('"""')[0]

print("Enviando POST a Kroki...")
res = requests.post(
    "https://kroki.io/mermaid/png",
    json={"diagram_source": mermaid_code},
    timeout=20
)

print("Kroki status code:", res.status_code)
if res.status_code == 200:
    with open("backend/kroki_test.png", "wb") as f:
        f.write(res.content)
    print(f"Imagen Kroki descargada con éxito! Tamaño: {len(res.content)} bytes")
else:
    print("Error:", res.text[:200])
