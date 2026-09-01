from PIL import Image

im = Image.open("backend/kroki_test.png")
print("Kroki Image dimensions:", im.size)
print("Kroki Image mode:", im.mode)
