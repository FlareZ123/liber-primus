"""Exact LP2 p0 180-degree artwork and reverse-prime-difference original-input test.

Dependencies: Pillow, NumPy. Read-only. Works from any working directory.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHA256_JPEG17 = "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e"


def first_primes(n: int) -> list[int]:
    result: list[int] = []
    value = 2
    while len(result) < n:
        if all(value % p for p in result if p * p <= value):
            result.append(value)
        value += 1
    return result


def derive(cipher: list[int], primes: list[int]) -> list[int]:
    prior = 27  # imagined F shifted by prime 2, per dated 2015 witness
    output: list[int] = []
    for i, c in enumerate(cipher):
        shifted = (c - primes[i + 1]) % 29
        output.append((shifted - prior) % 29)
        prior = shifted
    return output


def invert(values: list[int], primes: list[int]) -> list[int]:
    prior = 27
    output: list[int] = []
    for i, d in enumerate(values):
        shifted = (prior + d) % 29
        output.append((shifted + primes[i + 1]) % 29)
        prior = shifted
    return output


def ioc(values: list[int]) -> float:
    frequencies = np.bincount(np.asarray(values), minlength=29)
    size = len(values)
    return int(np.sum(frequencies * (frequencies - 1))) / (size * (size - 1))


def base29_bytes(values: list[int]) -> bytes:
    integer = 0
    for digit in values:
        integer = 29 * integer + digit
    return integer.to_bytes(443, "big")


def main() -> None:
    image_path = ROOT / "resources" / "liber-primus" / "17.jpg"
    corpus_path = ROOT / "resources" / "liber-primus" / "lp2-corpus.json"
    raw = image_path.read_bytes()
    assert len(raw) == 695525
    assert hashlib.sha256(raw).hexdigest() == SHA256_JPEG17
    with Image.open(image_path) as original:
        gray = np.asarray(original.convert("L"), dtype=np.int16)
    assert gray.shape == (3600, 2400)

    # Exactly centrosymmetric bounding windows in the 2400x3600 original.
    left = gray[1684:2960, 57:547]
    right = gray[640:1916, 1853:2343]
    assert left.shape == right.shape == (1276, 490)
    views = [
        ("unaltered", right),
        ("horizontal", right[:, ::-1]),
        ("vertical", right[::-1, :]),
        ("rotated180", right[::-1, ::-1]),
    ]
    for name, candidate in views:
        coefficient = float(np.corrcoef(left.ravel(), candidate.ravel())[0, 1])
        error = float(np.mean(np.abs(left - candidate)))
        ink_mask = (left < 210) | (candidate < 210)
        ink_correlation = float(np.corrcoef(left[ink_mask], candidate[ink_mask])[0, 1])
        ink_error = float(np.mean(np.abs(left[ink_mask] - candidate[ink_mask])))
        print(f"{name}: full correlation={coefficient:.9f}; MAE={error:.6f}; "
              f"ink correlation={ink_correlation:.9f}; ink MAE={ink_error:.6f}")
        if name == "rotated180":
            assert coefficient > 0.996 and ink_correlation > 0.94 and error < 1.1
        else:
            assert coefficient < 0.50

    # The exact rotated template continues on both remaining first-chapter pages.
    previous_left = None
    for filename, expected_bytes, expected_sha in [
        ("18.jpg", 667228,
         "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f"),
        ("19.jpg", 595338,
         "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34"),
    ]:
        page_data = (image_path.parent / filename).read_bytes()
        assert len(page_data) == expected_bytes
        assert hashlib.sha256(page_data).hexdigest() == expected_sha
        with Image.open(image_path.parent / filename) as page_image:
            source = np.asarray(page_image.convert("L"), dtype=np.int16)
        assert source.shape == (3600, 2400)
        left_art = source[1684:2960, 57:547]
        right_art = source[640:1916, 1853:2343][::-1, ::-1]
        correlation = float(np.corrcoef(left_art.ravel(), right_art.ravel())[0, 1])
        print(f"{filename} cross central inversion correlation={correlation:.9f}")
        assert correlation > 0.9972
        if previous_left is not None:
            assert np.array_equal(previous_left, left_art)
        previous_left = left_art

    corpus = json.loads(corpus_path.read_text(encoding="utf-8"))
    assert [corpus["pages"][k]["runic_count"] for k in range(3)] == [262, 266, 201]
    chapter_pages = [page["indices"] for page in corpus["pages"][:3]]
    cipher = [r for page in chapter_pages for r in page]
    assert len(cipher) == 729
    pagewise_rotated = [r for page in chapter_pages for r in reversed(page)]
    primes = first_primes(730)
    trials = [
        ("original-order", cipher, 40,
         "16701bee70c4b19d90abf1d05127911a06105c711f6cd4623ca8cc1c2063ea0b"),
        ("180-reversed-order", cipher[::-1], 21,
         "0a498603cc1fff37bd8eb44cff86fd940f4824f547c7e25ef28de715777b6bd8"),
        ("each-page-180-rotated", pagewise_rotated, 28,
         "0a7210df7f7e7df1848426596b27dbcdd350ed6a0c922fa689bd18945fde8ed9"),
    ]
    for label, sequence, expected_doublets, expected_hex in trials:
        derived = derive(sequence, primes)
        assert invert(derived, primes) == sequence
        doublets = sum(a == b for a, b in zip(derived, derived[1:]))
        assert doublets == expected_doublets
        encoded = base29_bytes(derived)
        assert len(encoded) == 443 and encoded[:32].hex() == expected_hex
        print(f"{label}: 729 native ciphertext runes, doublets={doublets}, "
              f"IoC={ioc(derived):.12f}, first32={encoded[:32].hex()}")

    solved = corpus["pages"][57]["indices"]
    assert len(solved) == 95
    positive = (solved * 8)[:729]
    assert invert(derive(positive, primes), primes) == positive
    print("Solved p57 GP-native source control: exact 729/729 inverse.")


if __name__ == "__main__":
    main()
