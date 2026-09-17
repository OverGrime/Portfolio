from pathlib import Path

from PIL import Image, ImageOps


SOURCE = Path("works")
DESTINATION = Path("assets/works")
LARGE = DESTINATION / "large"
THUMB = DESTINATION / "thumb"

LARGE.mkdir(parents=True, exist_ok=True)
THUMB.mkdir(parents=True, exist_ok=True)

for source in sorted(SOURCE.glob("project-*-cover.jpg")):
    project_id = source.stem.removesuffix("-cover")

    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert("RGB")

        large = image.copy()
        large.thumbnail((2200, 2200), Image.Resampling.LANCZOS)
        large.save(
            LARGE / f"{project_id}.webp",
            "WEBP",
            quality=82,
            method=6,
        )

        thumb = image.copy()
        thumb.thumbnail((720, 720), Image.Resampling.LANCZOS)
        thumb.save(
            THUMB / f"{project_id}.webp",
            "WEBP",
            quality=76,
            method=6,
        )

favicon_source = Path("assets/favicon-source.png")
if favicon_source.exists():
    with Image.open(favicon_source) as raw:
        favicon = ImageOps.exif_transpose(raw).convert("RGBA")
        favicon.thumbnail((512, 512), Image.Resampling.LANCZOS)
        favicon.save("assets/favicon.png", "PNG", optimize=True)
