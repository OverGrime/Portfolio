from pathlib import Path

from PIL import Image, ImageOps


SOURCE = Path("works")
DESTINATION = Path("assets/works")
DESTINATION.mkdir(parents=True, exist_ok=True)

for source in sorted(SOURCE.glob("*.jpeg")):
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")
        image.thumbnail((2200, 2200), Image.Resampling.LANCZOS)
        image.save(
            DESTINATION / f"{source.stem}.webp",
            "WEBP",
            quality=84,
            method=6,
        )
