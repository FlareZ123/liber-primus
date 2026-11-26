"""Reproduce the 2014 cu343 761 three-JPEG container; Pillow is required."""
from pathlib import Path
import argparse
import hashlib
import io
import re
import zipfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_RAW = "0b642c3e25a9d19626e1f218797b96012b1f3865bf644980e690d8b1df0b4a81"
LENGTHS = (168876, 1476614, 175159)

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "resources/historical/cicada2014-cu343-761.html")
    parser.add_argument("--archive", type=Path, help="Optional original JPEG ZIP in place of the repository JPEG directory")
    args = parser.parse_args()
    raw = args.source.read_bytes()
    assert len(raw) == 3641310 and sha256(raw) == EXPECTED_RAW
    match = re.fullmatch(rb"<!--761-->\n([0-9a-f]+)\n", raw)
    assert match is not None
    packed = bytes.fromhex(match[1].decode("ascii"))
    assert len(packed) == sum(LENGTHS)
    table = bytes(range(255, -1, -1))
    unflipped = packed.translate(table)
    parts = []
    offset = 0
    for i, length in enumerate(LENGTHS):
        data = unflipped[offset:offset + length]
        if i == 2:
            data = data[::-1]
        parts.append(data)
        print("Container range", i, offset, offset + length)
        offset += length
    if args.archive:
        with zipfile.ZipFile(args.archive) as z:
            originals = {Path(n).name: z.read(n) for n in z.namelist() if n.lower().endswith(".jpg")}
    else:
        originals = {p.name: p.read_bytes() for p in (ROOT / "resources/liber-primus").glob("*.jpg")}
    assert len(originals) == 75
    for i, data in enumerate(parts):
        matches = [name for name, original in originals.items() if original == data]
        assert matches == [f"{i:02}.jpg"], matches
        with Image.open(io.BytesIO(data)) as image:
            image.load()
            assert image.format == "JPEG" and image.size == (2400, 3600)
            print(matches[0], len(data), image.size, sha256(data))
    rebuilt = b"<!--761-->\n" + (parts[0] + parts[1] + parts[2][::-1]).translate(table).hex().encode("ascii") + b"\n"
    assert rebuilt == raw
    print("PASS: complete original container is exactly reconstructed; no extra bytes.")
if __name__ == "__main__":
    main()
