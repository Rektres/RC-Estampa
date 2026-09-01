import base64
import requests

with open("backend/fetch_er_img.py", "r", encoding="utf-8") as f:
    text = f.read()

# Get mermaid code
code = text.split('mermaid_code = """')[1].split('"""')[0]
encoded = base64.urlsafe_b64encode(code.encode('utf-8')).decode('ascii')

url_svg = f"https://mermaid.ink/svg/{encoded}"
print("Fetching SVG from:", url_svg[:60] + "...")

res = requests.get(url_svg, timeout=20)
print("Status:", res.status_code)
if res.status_code == 200:
    with open("backend/er_diagram.svg", "w", encoding="utf-8") as f:
        f.write(res.text)
    print("SVG saved successfully! Size:", len(res.text), "chars")
