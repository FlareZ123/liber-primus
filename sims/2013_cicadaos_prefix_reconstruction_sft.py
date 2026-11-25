#!/usr/bin/env python3
"""Recover a 64,167-byte prefix of 560.13 from preserved Twitter-stage artifacts.
No ISO boot/mount, no network, no LP2 key search. Run from any directory.
"""
from pathlib import Path
import base64
import hashlib
import runpy

ROOT = Path(__file__).resolve().parents[1]
H = ROOT / "resources/historical"

def read_pinned(name, size, git_sha):
    data = base64.b64decode((H / name).read_bytes())
    assert len(data) == size, name
    assert hashlib.sha1(f"blob {len(data)}".encode() + bytes([0]) + data).hexdigest() == git_sha, name
    return data

def xor(a, b):
    assert len(a) == len(b)
    return bytes(x ^ y for x, y in zip(a, b))

def main():
    carrier = read_pinned("cicada2013-twitter-b64-carrier.b64", 64167, "3cf34e331497e7e85c6707c22d07e500397cc794")
    jpeg = read_pinned("cicada2013-gematria-jpeg.b64", 64167, "65ded13617196f0fd5d210855a75452ff2e7a340")
    png = read_pinned("cicada2013-twitter-decoded.png.b64", 15330, "fd1052f8ae704cad8dcf005759182f39631fb187")
    mask = read_pinned("cicada2013-twitter-560.13-xor-png.b64", 15330, "5eaf7e1129e75b2f3af2069c8a56bdb1d00c1d22")
    prefix = xor(carrier, jpeg)
    assert prefix[:len(png)] == xor(png, mask)
    assert prefix == (ROOT / "resources/derived/cicada2013-560.13-prefix-64167.bin").read_bytes()
    rows = runpy.run_path(str(ROOT / "sims/2013_pklmx_reproduce.py"))["XOR_ROWS"]
    checked = []
    for city, dataset, offset, phone_hex, extracted_hex, expected in rows:
        phone = bytes.fromhex(phone_hex)
        if dataset != "560.13" or offset + len(phone) > len(prefix):
            continue
        raw = prefix[offset:offset + len(phone)]
        assert raw == bytes.fromhex(extracted_hex), city
        assert xor(phone, raw).decode("ascii").strip() == expected, city
        checked.append(city)
        print(city, offset, raw.hex(), "historical XOR matches")
    assert sorted(checked) == ["Little Rock", "Okinawa", "Portland"]
    print("PASS: 64167 derived bytes, 15330 overlap, 3/7 historical rows; SHA256", hashlib.sha256(prefix).hexdigest())

if __name__ == "__main__":
    main()
