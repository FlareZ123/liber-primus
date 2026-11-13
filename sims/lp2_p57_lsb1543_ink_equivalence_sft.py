"""Exact original-JPEG page57 LSB master-index obstruction.

Reproduces the published nexon33 October-2025 1543-index .npy checksum, then
shows the complete 1543-index set also follows from ink-versus-paper geometry.
Read-only, Python3, NumPy and Pillow.
"""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_74_SHA256 = "1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b"
SOURCE_17_SHA256 = "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e"
REPORTED_NPY_SHA256 = "385d25cfe1b1ea150f8dad2957ae14a3f579f1518b9d09d744441b120fffaee4"
REPORTED_NPY_MD5 = "d2f08f99aee906ce4fe1867d5d1e2c25"
WELCOME = np.asarray([62, 102, 115, 181, 217, 218, 333, 566, 596, 625, 689])


def source_gray(scan: str, expected_sha: str) -> np.ndarray:
    """Read an unchanged source scan and decode exact original grayscale pixels."""
    content = (ROOT / "resources" / "liber-primus" / scan).read_bytes()
    actual = hashlib.sha256(content).hexdigest()
    assert actual == expected_sha, (scan, actual)
    img = np.asarray(Image.open(io.BytesIO(content)).convert("L"), dtype=np.uint8)
    assert img.shape == (3600, 2400)
    return img[int(img.shape[0] * 0.4):, :]


def coordinate_inventory(mask: np.ndarray) -> np.ndarray:
    """Exactly the published union of X/Y positions of true pixels."""
    y, x = np.where(mask)
    return np.union1d(np.unique(y), np.unique(x))


def output(scan: str, digest: str) -> dict[str, object]:
    region = source_gray(scan, digest)
    original_zero = (region & 1) == 0
    original_indices = coordinate_inventory(original_zero)
    # Obliterate every original grayscale value while preserving binary ink.
    monochrome = np.where(region < 255, 0, 255).astype(np.uint8)
    binary_zero = (monochrome & 1) == 0
    binary_indices = coordinate_inventory(binary_zero)
    ink128_indices = coordinate_inventory(region < 128)
    bio = io.BytesIO()
    np.save(bio, original_indices)
    return {
        "scan": scan,
        "raw_indices": len(original_indices),
        "threshold255_indices": len(binary_indices),
        "raw_equals_monochrome": bool(np.array_equal(original_indices, binary_indices)),
        "raw_lsb_zero_pixels": int(np.count_nonzero(original_zero)),
        "monochrome_zero_pixels": int(np.count_nonzero(binary_zero)),
        "lsb_pixel_disagreements": int(np.count_nonzero(original_zero != binary_zero)),
        "ink128_indices": len(ink128_indices),
        "ink128_index_overlap": len(np.intersect1d(original_indices, ink128_indices)),
        "welcome_indices_direct": np.intersect1d(original_indices, WELCOME).tolist(),
        "npy_sha256": hashlib.sha256(bio.getvalue()).hexdigest(),
        "npy_md5": hashlib.md5(bio.getvalue()).hexdigest(),
        "index_last": int(original_indices[-1]),
    }


def main() -> None:
    claimed = output("74.jpg", SOURCE_74_SHA256)
    assert claimed["raw_indices"] == 1543
    assert claimed["raw_equals_monochrome"]
    assert claimed["raw_lsb_zero_pixels"] == 136346
    assert claimed["monochrome_zero_pixels"] == 181924
    assert claimed["lsb_pixel_disagreements"] == 45578
    assert claimed["npy_sha256"] == REPORTED_NPY_SHA256
    assert claimed["npy_md5"] == REPORTED_NPY_MD5
    assert claimed["welcome_indices_direct"] == [62, 102, 115, 181, 333, 596, 625, 689]
    assert claimed["ink128_indices"] == 1491
    # A hard independent known-plaintext test of the claimed shift key:
    # actual solved LP1 Welcome first seven runes = WELCOME.
    lp1 = (ROOT / "resources" / "transcriptions" / "lp1_wulfic_canonical.txt").read_text(encoding="utf8")
    gp = json.loads((ROOT / "resources" / "liber-primus" / "lp2-corpus.json").read_text(encoding="utf8"))
    lookup = {rune: i for i, rune in enumerate(gp["runes"])}
    welcome_cipher = [lookup[ch] for ch in lp1.split("%")[1] if ch in lookup][:7]
    assert welcome_cipher == [1, 28, 21, 15, 12, 0, 5]
    welcome_known_plain = [7, 18, 20, 5, 3, 19, 18]
    actual_historical_divinity_key = [23, 10, 1, 10, 9, 10, 16]
    recovered = [(c - k) % 29 for c, k in zip(welcome_cipher, actual_historical_divinity_key)]
    assert recovered == welcome_known_plain
    external_index_key = [62, 102, 115, 181, 217, 218, 333]
    external_recovered = [(c - (k % 29)) % 29 for c, k in zip(welcome_cipher, external_index_key)]
    assert external_recovered == [26, 13, 22, 8, 27, 14, 20]
    assert external_recovered != welcome_known_plain

    control = output("17.jpg", SOURCE_17_SHA256)
    assert control["raw_indices"] == 2077
    assert control["welcome_indices_direct"] == WELCOME.tolist()
    print(json.dumps({
        "external_claim": "exact 1543 LSB indices and .npy checksum reproduced",
        "original_p57": claimed,
        "unrelated_p0": control,
        "lp1_welcome_known_first7_GP": welcome_known_plain,
        "lp1_welcome_authentic_divinity_decrypted_first7": recovered,
        "lp1_welcome_published_indexkey_decrypted_first7": external_recovered,
        "decision": "all 1543 index memberships follow from binary ink geometry; no demonstrated LSB payload or selected GP29 key",
    }, indent=2))


if __name__ == "__main__":
    main()
