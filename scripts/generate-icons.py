#!/usr/bin/env python3
"""Write simple PNG app icons without third-party image libraries."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / "public"

BG = (31, 107, 86, 255)  # #1f6b56
FG = (243, 239, 230, 255)  # cream paper
DOT = (232, 168, 108, 255)  # warm accent


def chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def write_png(path: Path, size: int, rgba: list[tuple[int, int, int, int]]) -> None:
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            raw.extend(rgba[y * size + x])
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def inside_round_rect(x: float, y: float, size: int, pad: float, radius: float) -> bool:
    n = size - 1
    px = pad
    py = pad
    w = n - pad
    h = n - pad
    if x < px or x > w or y < py or y > h:
        return False
    # corner circle tests
    corners = [
        (px + radius, py + radius, x < px + radius and y < py + radius),
        (w - radius, py + radius, x > w - radius and y > py + radius),
        (px + radius, h - radius, x < px + radius and y > h - radius),
        (w - radius, h - radius, x > w - radius and y > h - radius),
    ]
    for cx, cy, active in corners:
        if active:
            return (x - cx) ** 2 + (y - cy) ** 2 <= radius**2
    return True


def on_z(x: float, y: float, size: int) -> bool:
    """Thick geometric Z in the middle third."""
    s = size
    left = s * 0.28
    right = s * 0.72
    top = s * 0.30
    bot = s * 0.70
    thick = s * 0.09

    def in_bar(x0, y0, x1, y1, t) -> bool:
        # distance to segment
        vx, vy = x1 - x0, y1 - y0
        lx = x - x0
        ly = y - y0
        den = vx * vx + vy * vy
        if den == 0:
            return False
        u = max(0.0, min(1.0, (lx * vx + ly * vy) / den))
        px, py = x0 + u * vx, y0 + u * vy
        return (x - px) ** 2 + (y - py) ** 2 <= (t / 2) ** 2

    return (
        in_bar(left, top, right, top, thick)
        or in_bar(right, top, left, bot, thick * 0.92)
        or in_bar(left, bot, right, bot, thick)
    )


def on_dot(x: float, y: float, size: int) -> bool:
    cx, cy, r = size * 0.78, size * 0.24, size * 0.055
    return (x - cx) ** 2 + (y - cy) ** 2 <= r**2


def raster(size: int) -> list[tuple[int, int, int, int]]:
    pad = size * 0.08
    radius = size * 0.18
    pixels: list[tuple[int, int, int, int]] = []
    for y in range(size):
        for x in range(size):
            if not inside_round_rect(x, y, size, pad, radius):
                pixels.append((0, 0, 0, 0))
            elif on_dot(x, y, size):
                pixels.append(DOT)
            elif on_z(x, y, size):
                pixels.append(FG)
            else:
                pixels.append(BG)
    return pixels


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    for name, size in (("pwa-192.png", 192), ("pwa-512.png", 512), ("apple-touch-icon.png", 180)):
        write_png(PUBLIC / name, size, raster(size))
        print(f"wrote {name}")


if __name__ == "__main__":
    main()
