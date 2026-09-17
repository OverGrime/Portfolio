from pathlib import Path

from PIL import Image


LOGO_DIRECTORY = Path("assets/logos")

for source in sorted(LOGO_DIRECTORY.iterdir()):
    if source.suffix.lower() not in {".png", ".webp"}:
        continue

    with Image.open(source) as raw:
        image = raw.convert("RGBA")
        bounds = image.getchannel("A").getbbox()
        if not bounds or bounds == (0, 0, *image.size):
            continue
        trimmed = image.crop(bounds)

    if source.suffix.lower() == ".webp":
        trimmed.save(source, "WEBP", lossless=True, method=6)
    else:
        trimmed.save(source, "PNG", optimize=True)
