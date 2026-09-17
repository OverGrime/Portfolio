from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image


def clamp(value: float) -> int:
    return round(max(0, min(255, value)))


def make_transparent(mode: str, source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    for y in range(height):
        for x in range(width):
            red, green, blue, original_alpha = pixels[x, y]

            if mode == "white":
                factor = min(1.0, max(0.0, (255 - min(red, green, blue)) / 28))
                if factor > 0:
                    red = clamp((red - 255 * (1 - factor)) / factor)
                    green = clamp((green - 255 * (1 - factor)) / factor)
                    blue = clamp((blue - 255 * (1 - factor)) / factor)
            elif mode == "dark":
                factor = min(1.0, max(0.0, (max(red, green, blue) - 45) / 105))
                if factor > 0:
                    red = clamp(red / factor)
                    green = clamp(green / factor)
                    blue = clamp(blue / factor)
            else:
                dx = (x + 0.5 - width / 2) / (width / 2)
                dy = (y + 0.5 - height / 2) / (height / 2)
                factor = min(1.0, max(0.0, (1 - math.hypot(dx, dy)) * 80))

            alpha = clamp(original_alpha * factor)
            pixels[x, y] = (red, green, blue, alpha)

    image.save(destination, optimize=True)


parser = argparse.ArgumentParser()
parser.add_argument("mode", choices=("white", "dark", "circle"))
parser.add_argument("source", type=Path)
parser.add_argument("destination", type=Path)
args = parser.parse_args()
make_transparent(args.mode, args.source, args.destination)
