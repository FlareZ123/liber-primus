"""Audit native JPEG post-EOI data and reconstruct LP1 p05's byte reversal.

Run from repository root: python sims/lp1_05_reversed_jpeg_trailer_sft.py
Reads only resources/liber-primus/00.jpg ... 74.jpg.
"""
from hashlib import sha256
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
FILES = [ROOT / f"{i:02}.jpg" for i in range(75)]
CHECKSUM = "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7"


def audit():
    found = []
    for path in FILES:
        raw = path.read_bytes()
        assert raw.startswith(b"\\xff\\xd8"), path
        eoi = raw.rfind(b"\\xff\\xd9")
        assert eoi > 2, path
        trailer = raw[eoi + 2 :]
        if trailer:
            found.append((path.name, len(trailer)))
            assert path.name == "05.jpg", found
            assert sha256(raw).hexdigest() == CHECKSUM
            assert len(trailer) == 72700
            assert trailer == raw[:len(trailer)][::-1]
            assert trailer[::-1] == raw[:len(trailer)]
            print("05.jpg native sha256:", sha256(raw).hexdigest())
            print("05.jpg EOI offset:", eoi)
            print("05.jpg trailer bytes:", len(trailer))
            print("05.jpg trailer == exact reversed prefix: true")
            print("Reverse recovers only an existing truncated JPEG prefix.")
    assert found == [("05.jpg", 72700)], found
    print("75 original JPEGs: 74 end at EOI; LP1 p05 has the self-reversed tail.")


if __name__ == "__main__":
    audit()
