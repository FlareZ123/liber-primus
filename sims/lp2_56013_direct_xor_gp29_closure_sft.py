"""Complete original-offset XOR alphabet-closure test for the authentic 2013 pad.

The historical 2013 Cicada step used byte XOR. A direct 29-rune transfer requires
the inverse XOR output to lie in the original GP29 alphabet at every position.
This rejects no language on linguistic grounds; it measures necessary closure.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from uuid import uuid4

import numpy as np
from filelock import FileLock
from lp2_56013_dense_direct_pad_sft import ROOT, PAD_SHA256, recover_pad

OUT = ROOT / "im-results" / "lp2-2013-56013-dense-xor5bit-closure.json"
BATCH = 2000000
PLANT_OFFSET = 3301


def project(pad: np.ndarray, kind: str) -> np.ndarray:
    if kind == "low5":
        return np.bitwise_and(pad, np.uint8(31))
    if kind == "high5":
        return np.right_shift(pad, np.uint8(3))
    if kind == "mod29":
        return pad % 29
    if kind == "scaled29":
        return np.asarray((pad.astype(np.uint16) * 29) // 256, dtype=np.uint8)
    raise ValueError("Unknown projection")


def original_p0_body() -> np.ndarray:
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))
    seq = np.asarray(corpus["pages"][0]["indices"][13:], dtype=np.uint8)
    assert len(seq) == 249 and np.max(seq) <= 28
    return seq


def scan(residues: np.ndarray, cipher: np.ndarray, cap: int | None = None) -> dict:
    total = len(residues) - len(cipher) + 1
    if cap is not None:
        total = min(total, cap)
    stage_counts = {1: 0, 16: 0, 32: 0, 64: 0, 128: 0, len(cipher): 0}
    survivors: list[int] = []
    for start in range(0, total, BATCH):
        size = min(BATCH, total - start)
        active = np.arange(size, dtype=np.int32)
        for i, c in enumerate(cipher):
            possible = np.bitwise_xor(residues[start + active + i], c) < 29
            active = active[possible]
            if i + 1 in stage_counts:
                stage_counts[i + 1] += len(active)
            if len(active) == 0:
                break
        survivors.extend((start + int(x) for x in active))
    return {"tested_offsets": total, "prefix_survivors": stage_counts,
            "fully_gp29_valid_count": len(survivors), "fully_gp29_valid_offsets": survivors}


def verify_plants(plain: np.ndarray) -> None:
    rng = np.random.default_rng(3301)
    for kind in ("low5", "high5", "mod29", "scaled29"):
        pad = rng.integers(0, 256, 50000, dtype=np.uint8)
        for i, p in enumerate(plain):
            allowed = np.arange(256, dtype=np.uint8)
            allowed = allowed[(project(allowed, kind) ^ p) < 29]
            pad[PLANT_OFFSET + i] = allowed[rng.integers(len(allowed))]
        keys = project(pad, kind)
        cipher = plain ^ keys[PLANT_OFFSET:PLANT_OFFSET + len(plain)]
        assert np.max(cipher) <= 28
        found = scan(keys, cipher)
        assert PLANT_OFFSET in found["fully_gp29_valid_offsets"], (kind, found)
        recovered = cipher ^ keys[PLANT_OFFSET:PLANT_OFFSET + len(plain)]
        assert np.array_equal(recovered, plain)
        assert np.array_equal(recovered ^ keys[PLANT_OFFSET:PLANT_OFFSET + len(plain)], cipher)
        print("PLANTED", kind, "offset", PLANT_OFFSET, "success",
              "full survivors", found["fully_gp29_valid_count"], flush=True)


def atomic_json(path: Path, data: dict) -> None:
    with FileLock(str(path) + ".lock"):
        temp = path.with_name(path.name + "." + uuid4().hex + ".tmp")
        try:
            temp.write_text(json.dumps(data, indent=2) + "\n", encoding="utf8")
            os.replace(temp, path)
        finally:
            temp.unlink(missing_ok=True)


def main() -> None:
    cipher = original_p0_body()
    reference = np.array([int(i) for i in
                          json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf8"))["pages"][57]["indices"]],
                         dtype=np.uint8)
    assert len(reference) > 80 and np.max(reference) <= 28
    verify_plants(reference[:90])
    # A complete original-page 249-rune source-native plant uses the original
    # p0 rune-count geometry but genuinely native GP rune counts from p57.
    verify_plants(np.resize(reference, len(cipher)))
    if "--fixture-only" in os.sys.argv:
        return
    pad = np.memmap(recover_pad(), dtype=np.uint8, mode="r")
    output = {"classification": "direct historical XOR key, GP29 alphabet closure only",
              "historical_input_sha256": PAD_SHA256, "pad_bytes": int(len(pad)),
              "ciphertext": "physical p0, original runes after 13 red heading",
              "ciphertext_runes": int(len(cipher)),
              "models": []}
    for kind in ("low5", "high5", "mod29", "scaled29"):
        residues = project(pad, kind)
        result = scan(residues, cipher)
        result["projection"] = kind
        print("ORIGINAL", kind, json.dumps(result), flush=True)
        output["models"].append(result)
    atomic_json(OUT, output)
    print("Original 2013 XOR closure complete", OUT, flush=True)


if __name__ == "__main__":
    main()
