#!/usr/bin/env python3
"""Source-image registration gate for the repeated LP2 p53/p55 cicada."""
from __future__ import annotations

import hashlib
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    53: ("70.jpg", "4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548"),
    55: ("72.jpg", "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba"),
}


def load(page: int) -> np.ndarray:
    filename, expected = SOURCES[page]
    path = ROOT / "resources" / "liber-primus" / filename
    raw = path.read_bytes()
    actual = hashlib.sha256(raw).hexdigest()
    assert actual == expected, (filename, actual)
    result = np.asarray(Image.open(path).convert("L"))
    assert result.shape == (3600, 2400), (filename, result.shape)
    return result


def shifted_mae(source: np.ndarray, target: np.ndarray, dx: int, dy: int) -> float:
    x0, x1, y0, y1 = 650, 1750, 2740, 3050
    a = source[y0:y1, x0:x1].astype(np.int16)
    b = target[y0 + dy:y1 + dy, x0 + dx:x1 + dx].astype(np.int16)
    return float(np.abs(a - b).mean())


def main() -> None:
    p53, p55 = load(53), load(55)
    good = shifted_mae(p53, p55, 66, 67)
    wrong = {f"{dx},{dy}": shifted_mae(p53, p55, dx, dy)
             for dx, dy in ((0, 0), (65, 67), (67, 67), (66, 66), (66, 68))}
    a = p53[2740:3050, 650:1750] < 130
    b = p55[2807:3117, 716:1816] < 130
    agreement = float((a == b).mean())
    assert good < 1, good
    assert all(value > 5 for key, value in wrong.items() if key != "0,0"), wrong
    assert wrong["0,0"] > 70, wrong
    assert agreement > 0.998, agreement
    print(f"p53->p55 repeated cicada displacement: (+66,+67) source pixels")
    print(f"registered gray MAE: {good:.9f}; dark-mask agreement: {agreement:.9f}")
    print(f"negative displacement controls (dx,dy -> gray MAE): {wrong}")
    print("The translated artwork is source geometry; it is not a decipherment.")


if __name__ == "__main__":
    main()
