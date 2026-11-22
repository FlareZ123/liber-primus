"""
One source-selected p32 decoding trial: map its row and column GP prime sums
modulo the exact 563x569 signed-2016 original image dimensions to 121 pixels.
No image shift, optimized position, morphology or key phase is permitted.

Requires: Pillow and the canonical Git checkout.
This test is distinct from the previously failed 11x11 tile-center/mean pads.
"""
from collections import Counter
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "resources/liber-primus/lp2-corpus.json"
IMAGE = ROOT / "resources/historical/cicada2016-4gq25.jpg"
PRIMES = (
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
    31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101, 103, 107, 109,
)


def coincidence(values: list[int]) -> float:
    n = len(values)
    counts = Counter(values)
    return sum(c * (c - 1) for c in counts.values()) / (n * (n - 1))


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    cipher = source["pages"][32]["indices"]
    assert len(cipher) == 121
    rows = [sum(PRIMES[c] for c in cipher[i*11:(i+1)*11]) for i in range(11)]
    columns = [sum(PRIMES[cipher[i*11+j]] for i in range(11))
               for j in range(11)]
    assert (rows[0], columns[0]) == (563, 569), (rows, columns)
    with Image.open(IMAGE) as original:
        assert original.size == (563, 569), original.size
        rgb = original.convert("RGB")
        coords = [(rows[i] % 563, columns[j] % 569)
                  for i in range(11) for j in range(11)]
        pixels = [rgb.getpixel(point) for point in coords]
    assert len(coords) == len(cipher) == 121
    print("INPUT", json.dumps({
        "originalImageSha256": hashlib.sha256(IMAGE.read_bytes()).hexdigest(),
        "dimensions": [563, 569],
        "p32Runes": len(cipher),
        "rowPrimeSums": rows,
        "columnPrimeSums": columns,
        "uniqueSampledPositions": len(set(coords)),
        "coordinatesPrefix": coords[:13],
        "rgbPrefix": pixels[:13],
    }))

    # Two standard direct projections from 8-bit image grayscale to GP29.
    # Apply both additive directions once; no fitted key state.
    gray = [round(sum(p) / 3) for p in pixels]
    for name, residues in (
        ("residue", [value % 29 for value in gray]),
        ("scaled", [(29 * value) // 256 for value in gray]),
    ):
        for sign in (-1, 1):
            decoded = [(c + sign * k) % 29 for c, k in zip(cipher, residues)]
            reencoded = [(p - sign * k) % 29 for p, k in zip(decoded, residues)]
            assert reencoded == cipher
            text = "".join(source["translit"][i] for i in decoded)
            print("ORIGINAL_INVERSE", json.dumps({
                "name": name,
                "sign": sign,
                "IoC": coincidence(decoded),
                "distinctKeyResidues": len(set(residues)),
                "first80Runes": "".join(
                    source["translit"][i] + " " for i in decoded[:80]),
                "first80Compact": text[:170],
            }))

    clear = source["pages"][57]["indices"]
    assert len(clear) == 95
    print("CLEAR_CONTROL", json.dumps({
        "page": 57,
        "runes": len(clear),
        "IoC": coincidence(clear),
        "first60Compact": "".join(source["translit"][i] for i in clear[:60]),
    }))
    print("DECISION: No unknown-page plaintext can be claimed unless an "
          "unchanged original inverse is independently readable and "
          "exactly reencrypts the source.")


if __name__ == "__main__":
    main()
