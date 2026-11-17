"""Original LP2 pp0–2 crossed-border geometry and one frozen 180-degree inverse.
Requires Pillow and NumPy. Run from any working directory with Python 3.
Authentic resources: resources/liber-primus/{17,18,19}.jpg, lp2-corpus.json.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA = {
    17: "197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e",
    18: "f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f",
    19: "74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34",
}
# Coordinates from original 2400x3600 scans, (y0,y1,x0,x1).
BOXES = {
    "left": (1684, 2960, 57, 547),
    "right": (640, 1916, 1853, 2343),
}


def overlap(left: np.ndarray, right: np.ndarray) -> float:
    both = np.count_nonzero(left & right)
    either = np.count_nonzero(left | right)
    return both / either


def prime_totient_keys(n: int) -> list[int]:
    out = []
    p = 2
    while len(out) < n:
        if all(p % d for d in range(2, int(p**0.5) + 1)):
            out.append((p - 1) % 29)
        p += 1
    return out


def legal_f_transparent_prefix(cipher: list[int], keys: list[int]) -> tuple[bool, int, int]:
    """Exact reachable-key-clock DP for authentic p56 plaintext-F bypass.
    F bypass emits cipher F (index 0), consumes no prime.
    A non-F plaintext emits (plain + phi(prime[k])) mod 29 and advances k.
    """
    states = {0}
    for i, c in enumerate(cipher):
        next_states: set[int] = set()
        for k in states:
            if c == 0:
                next_states.add(k)
            if (c - keys[k]) % 29 != 0:
                next_states.add(k + 1)
        states = next_states
        if not states:
            return False, i + 1, 0
    return True, len(cipher), len(states)


def main() -> None:
    images = {}
    for scan, sha in SOURCE_SHA.items():
        path = ROOT / "resources/liber-primus" / f"{scan:02}.jpg"
        raw = path.read_bytes()
        assert hashlib.sha256(raw).hexdigest() == sha, f"Unexpected scan {scan}"
        image = np.asarray(Image.open(path).convert("L"))
        assert image.shape == (3600, 2400)
        images[scan] = {
            name: image[y0:y1, x0:x1] < 125
            for name, (y0, y1, x0, x1) in BOXES.items()
        }

    geometry = {
        "left_p0_p1_iou": overlap(images[17]["left"], images[18]["left"]),
        "right_p0_p1_iou": overlap(images[17]["right"], images[18]["right"]),
        "left_p1_p2_identical": bool(np.array_equal(images[18]["left"], images[19]["left"])),
        "right_p1_p2_identical": bool(np.array_equal(images[18]["right"], images[19]["right"])),
        "p0_left_rot180_right_iou": overlap(
            np.rot90(images[17]["left"], 2), images[17]["right"]
        ),
    }
    assert geometry["left_p1_p2_identical"] and geometry["right_p1_p2_identical"]
    assert geometry["left_p0_p1_iou"] > 0.96
    assert geometry["right_p0_p1_iou"] > 0.96
    assert geometry["p0_left_rot180_right_iou"] > 0.98
    print("Source geometry:", json.dumps(geometry, indent=2))

    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    pages = [page["indices"] for page in corpus["pages"]]
    assert [len(pages[i]) for i in [0, 1, 2, 56]] == [262, 266, 201, 85]
    black_pages = [pages[0][13:], pages[1], pages[2]]
    black = [c for page in black_pages for c in page]
    assert len(black) == 716
    # Only complete source-visible order operations are evaluated. The repeated
    # crosses select no unique rune-value key or arbitrary additional variant.
    candidates = {
        "p56_authentic_forward_positive": pages[56],
        "p0_black_original_forward": black,
        "p0_black_each_page_180": [x for page in black_pages for x in reversed(page)],
        "p0_black_whole_chapter_180": list(reversed(black)),
    }
    keys = prime_totient_keys(1000)
    outcomes = {name: legal_f_transparent_prefix(data, keys) for name, data in candidates.items()}
    assert outcomes == {
        "p56_authentic_forward_positive": (True, 85, 5),
        "p0_black_original_forward": (False, 44, 0),
        "p0_black_each_page_180": (False, 119, 0),
        "p0_black_whole_chapter_180": (False, 10, 0),
    }
    print("Prime-totient/F-bypass original-input gate:", json.dumps(outcomes, indent=2))
    print("PASS: exact opening silhouettes and three bounded original order candidates.")


if __name__ == "__main__":
    main()
