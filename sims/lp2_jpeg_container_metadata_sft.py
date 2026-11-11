"""Source-only JPEG marker audit for the 75 original Liber Primus scans.

Usage: python sims/lp2_jpeg_container_metadata_sft.py [image-directory-or-ZIP]
Standard-library only; does not alter input images or decode entropy coefficients.
"""
from collections import Counter, defaultdict
from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile
import sys

NAMES = tuple(f"{i:02d}.jpg" for i in range(75))


def digest(data):
    return sha256(data).hexdigest()


def scan(data):
    """Parse JPEG marker envelope, byte stuffing, scans and first EOI."""
    if data[:2] != b"\xff\xd8":
        raise ValueError("Missing JPEG SOI")
    pos = 2
    markers = [("D8", b"")]
    stuffed = restarts = entropy = 0
    while pos < len(data):
        if data[pos] != 255:
            raise ValueError(f"Expected JPEG marker at {pos}")
        while data[pos] == 255:
            pos += 1
        tag = data[pos]
        pos += 1
        if tag == 0xD9:
            markers.append(("D9", b""))
            return {"markers": markers, "tail": data[pos:],
                    "stuffed": stuffed, "restarts": restarts, "entropy": entropy}
        if tag in (0x01, 0xD8) or 0xD0 <= tag <= 0xD7:
            markers.append((f"{tag:02X}", b""))
            continue
        length = int.from_bytes(data[pos:pos+2], "big")
        if length < 2 or pos + length > len(data):
            raise ValueError(f"Invalid length at {pos}")
        payload = data[pos+2:pos+length]
        markers.append((f"{tag:02X}", payload))
        pos += length
        if tag == 0xDA:
            while pos < len(data)-1:
                if data[pos] != 255:
                    pos += 1
                    entropy += 1
                elif data[pos+1] == 0:
                    stuffed += 1
                    pos += 2
                    entropy += 2
                elif data[pos+1] == 255:
                    pos += 1
                elif 0xD0 <= data[pos+1] <= 0xD7:
                    restarts += 1
                    pos += 2
                else:
                    break
    raise ValueError("Missing JPEG EOI")


def fingerprint(data):
    parsed = scan(data)
    markers = parsed["markers"]
    sof = [v for t, v in markers if t == "C0"]
    if len(sof) != 1:
        raise ValueError("Expected one baseline SOF0 frame")
    header = sof[0]
    return {
        "markers": tuple(t for t, _ in markers),
        "size": (int.from_bytes(header[3:5], "big"),
                 int.from_bytes(header[1:3], "big")),
        "components": header[5],
        "precision": header[0],
        "app": tuple((t, digest(v)) for t,v in markers
                     if t.startswith("E") and len(t) == 2 and
                     0xE0 <= int(t, 16) <= 0xEF),
        "dqt": digest(b"".join(v for t,v in markers if t == "DB")),
        "dht": digest(b"".join(v for t,v in markers if t == "C4")),
        "eoi_tail": len(parsed["tail"]),
        "restarts": parsed["restarts"],
        "scan_count": sum(t == "DA" for t,_ in markers),
        "byte_len": len(data),
    }


def load_images(source):
    path = Path(source)
    if path.is_dir():
        return {name: (path / name).read_bytes() for name in NAMES}
    with ZipFile(path) as archive:
        return {name: archive.read(next(n for n in archive.namelist()
                                        if n.endswith("/" + name)))
                for name in NAMES}


def main(source):
    files = load_images(source)
    fp = [fingerprint(files[name]) for name in NAMES]
    lp1, lp2 = fp[:17], fp[17:]
    def group(field, pages):
        groups = defaultdict(list)
        for idx, rec in enumerate(pages):
            groups[str(rec[field])].append(idx)
        return dict(groups)
    print("Original scans:", len(fp), "LP1 controls:", len(lp1),
          "LP2 manuscript:", len(lp2))
    for field in ("markers", "components", "size", "precision",
                  "app", "dqt", "dht", "scan_count", "restarts", "eoi_tail"):
        groups = group(field, lp2)
        print(f"LP2 {field}: {len(groups)} variants; group sizes:",
              sorted((len(x) for x in groups.values()), reverse=True))
        if field == "components":
            print("LP2 grayscale physical pages:", group(field, lp2).get("1"))
    assert all(f["size"] == (2400, 3600) and f["precision"] == 8
               for f in lp2)
    assert Counter(f["components"] for f in lp2) == {3:35,1:23}
    assert len({f["app"] for f in lp2}) == 1
    assert all(tuple(x[0] for x in f["app"]) == ("E0","E2") for f in lp2)
    assert len({f["dqt"] for f in lp2}) == 2
    assert len({f["dht"] for f in lp2}) == 58
    assert all(f["scan_count"] == 1 and not f["restarts"] and
               not f["eoi_tail"] for f in lp2)
    assert all(not any(t in f["markers"] for t in ("E1","ED","FE","C2"))
               for f in lp2)
    assert lp1[5]["eoi_tail"] == 336713
    assert lp1[10]["eoi_tail"] == 3486295
    assert sum(bool(f["eoi_tail"]) for f in lp1) == 2

    # Validate detection of both positive-control append formats.
    remainder = files["10.jpg"]
    layers = []
    while remainder.startswith(b"\xff\xd8"):
        one = scan(remainder)
        length = len(remainder) - len(one["tail"])
        layers.append(length)
        remainder = one["tail"]
    assert layers == [754662,712733,703428,2070134] and not remainder
    reverse_tail = scan(files["05.jpg"])["tail"][::-1]
    reversed_jpeg = scan(reverse_tail)
    assert len(reversed_jpeg["tail"]) == 360

    # Two independent planted positive controls on an original LP2 image.
    sample = files["17.jpg"]
    assert len(scan(sample + b"PLANTED")["tail"]) == 7
    planted_app = sample[:2] + b"\xff\xed\x00\x09CONTROL" + sample[2:]
    assert any(t == "ED" and v == b"CONTROL"
               for t, v in scan(planted_app)["markers"])
    print("LP1 controls: four forward JPEG layers in scan 10;",
          "reverse JPEG and 360 residual bytes in scan 05.")
    print("SFT PASS: all LP2 metadata invariants and planted controls.")
    return fp


if __name__ == "__main__":
    home = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
    main(sys.argv[1] if len(sys.argv) > 1 else home)
