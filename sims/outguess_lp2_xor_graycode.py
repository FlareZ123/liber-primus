"""Enumerate all 65,535 aligned LP2 OutGuess XOR subsets by Gray-code updates.

The input streams are the original-image default-key output bytes produced
by the manually dispatched lp2-outguess workflow. Only two historical
PGP signatures are tested at every byte offset. Needs NumPy.
"""
from __future__ import annotations

import hashlib
import itertools
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "outguess-results"
PAGES = [17, 21, 43, 57, 58, 59, 60, 61, 62, 63, 64, 65, 68, 69, 70, 71]
SIGNATURES = [b"-----BEGIN PGP", b"LS0tLS1CRUdJTiBQR1A"]


def main() -> None:
    arrays = [np.frombuffer((DATA / f"{page:02}.payload").read_bytes(),
                            dtype=np.uint8) for page in PAGES]
    assert len(arrays) == 16 and all(len(array) == 58152 for array in arrays)

    historical = json.loads((ROOT / "resources/cicada2014-outguess-hex.json").read_text(encoding="utf-8"))
    shares = [bytes.fromhex(item["hex"]) for item in historical["sources"]]
    assert all(len(item) == 991 for item in shares)
    genuine = bytes(a ^ b ^ c for a, b, c in zip(*shares))
    assert genuine.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
    assert historical["expectedReconstruction"]["bodyCode"] in b" ".join(genuine.split()).decode("utf-8")

    accumulator = np.zeros(58152, dtype=np.uint8)
    last = 0
    matches = []
    for index in range(1, 65536):
        mask = index ^ (index >> 1)
        changed = mask ^ last
        bit = (changed & -changed).bit_length() - 1
        np.bitwise_xor(accumulator, arrays[bit], out=accumulator)
        output = accumulator.tobytes()
        for marker in SIGNATURES:
            offset = output.find(marker)
            if offset >= 0:
                matches.append({"mask": mask, "offset": offset, "marker": marker.decode("ascii")})
        last = mask
    assert len(matches) == 0
    result = {"arraySHA256": {str(page): hashlib.sha256(array.tobytes()).hexdigest()
                              for page, array in zip(PAGES, arrays)},
              "historicalThreeSharePGPControl": True,
              "testedNonemptySubsets": 65535,
              "everyBytePosition": True,
              "rawPGPOrBase64PGPSignatureMatches": len(matches),
              "candidateLengthBytes": 58152}
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
