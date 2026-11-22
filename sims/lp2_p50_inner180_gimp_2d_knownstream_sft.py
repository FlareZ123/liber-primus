#!/usr/bin/env python3
"""Original p50 grid known-plaintext recovery under exact historical GIMP v2.8 row field.

Read-only source test; requires NumPy (Windows workflow pins numpy==2.2.6).
"""
from hashlib import sha256
from pathlib import Path
import json

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
TABLE_SHA = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
SENTENCE = (
    "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "
    "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
)


def encode_gp(text: str, alphabet: list[str]) -> list[int]:
    order = sorted(enumerate(alphabet), key=lambda p: -len(p[1]))
    out: list[int] = []
    for word in text.split():
        while word:
            idx, token = next((i, s) for i, s in order if word.startswith(s))
            out.append(idx)
            word = word[len(token):]
    return out


def main() -> None:
    grid = json.loads((ROOT / "resources/liber-primus/lp2-grid-256.json").read_text(encoding="utf-8"))
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    source_bytes: list[int] = grid["bytes"]
    assert len(source_bytes) == 256 and sha256(bytes(source_bytes)).hexdigest() == TABLE_SHA
    p56plain = encode_gp(SENTENCE, corpus["translit"])
    p56cipher = corpus["pages"][56]["indices"]
    p57 = corpus["pages"][57]["indices"]
    assert [len(p56plain), len(p56cipher), len(p57)] == [85, 85, 95]
    inner = [8 * r + c for r in range(1, 31) for c in range(1, 7)]
    border = (
        list(range(8))
        + [r * 8 + 7 for r in range(1, 32)]
        + [31 * 8 + c for c in range(6, -1, -1)]
        + [r * 8 for r in range(30, 0, -1)]
    )
    assert len(set(inner + border)) == 256 and len(border) == 76

    # Historical GLib 2.2 default uses the MT19937 init_genrand seed path.
    # The fixed GIMP 2.8 paint-mode row seeds come from seed 314159265.
    mt = np.random.RandomState(314159265)
    row_seeds = mt.randint(0, 2**32, size=4096, dtype=np.uint32)
    assert row_seeds[:8].tolist() == [
        3721122731, 618219707, 807213306, 3144837749,
        3447982176, 3230631767, 755972506, 1398685501,
    ]
    raw = np.zeros((32, 8), dtype=np.uint32)
    for y in range(32):
        raw[y] = np.random.RandomState(int(row_seeds[y])).randint(
            0, 2**32, size=8, dtype=np.uint32
        )
    assert raw[0].tolist() == [
        505524582, 4277517655, 1702989131, 912900261,
        1432505218, 4108960502, 2270003630, 316039421,
    ]
    key_ranges = {
        "gimp-range255": (raw.astype(np.uint64) % 255).astype(np.uint8).reshape(-1).tolist(),
        "raw-lowbyte": (raw.astype(np.uint64) % 256).astype(np.uint8).reshape(-1).tolist(),
    }
    assert key_ranges["gimp-range255"][:8] == [87, 10, 191, 6, 133, 152, 5, 71]

    def decipher(cipher: int, pad: int, method: str) -> int:
        if method == "xor":
            return cipher ^ pad
        if method == "subtract":
            return (cipher - pad) % 256
        return (cipher + pad) % 256

    def encipher(plain: int, pad: int, method: str) -> int:
        if method == "xor":
            return plain ^ pad
        if method == "subtract":
            return (plain + pad) % 256
        return (plain - pad) % 256

    expectations = {
        ("gimp-range255", "solved", "xor"): 2,
        ("gimp-range255", "solved", "subtract"): 1,
        ("gimp-range255", "solved", "add"): 1,
        ("gimp-range255", "printed", "xor"): 2,
        ("gimp-range255", "printed", "subtract"): 1,
        ("gimp-range255", "printed", "add"): 0,
        ("raw-lowbyte", "solved", "xor"): 1,
        ("raw-lowbyte", "solved", "subtract"): 1,
        ("raw-lowbyte", "solved", "add"): 0,
        ("raw-lowbyte", "printed", "xor"): 2,
        ("raw-lowbyte", "printed", "subtract"): 0,
        ("raw-lowbyte", "printed", "add"): 1,
    }
    for label, key in key_ranges.items():
        for register, known in (("solved", p56plain + p57), ("printed", p56cipher + p57)):
            for method in ("xor", "subtract", "add"):
                recovered = [decipher(source_bytes[pos], key[pos], method) for pos in inner]
                count = sum(actual == expected for actual, expected in zip(recovered, known))
                assert count == expectations[(label, register, method)]
                assert count < len(known)
                print(f"{label:14s} {register:7s} {method:8s} original: {count}/180 known symbols")

                # Plant and exactly recover an independent original-GP 256-rune
                # source record, including all 76 withheld perimeter symbols.
                source55 = p57[:76]
                planted = [0] * 256
                for pos, plain in zip(inner, known):
                    planted[pos] = encipher(plain, key[pos], method)
                for pos, plain in zip(border, source55):
                    planted[pos] = encipher(plain, key[pos], method)
                assert [decipher(planted[pos], key[pos], method) for pos in inner] == known
                assert [decipher(planted[pos], key[pos], method) for pos in border] == source55
    print("PASS: 12 original models reject exact GIMP pad; 12 planted 256-rune source records invert.")


if __name__ == "__main__":
    main()
