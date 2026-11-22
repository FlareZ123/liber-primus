#!/usr/bin/env python3
"""Marker-aware audit of LP1 05.jpg's OOB header and reversed JPEG copy.

Run from repository root: python sims/lp1_05_reversed_jpeg_trailer_sft.py
"""
from hashlib import sha256
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
EXPECTED_SHA256 = "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7"


def first_jpeg_eoi_end(buf: bytes) -> int:
    """Return the first JPEG EOI end, respecting marker segments and entropy stuffing."""
    if not buf.startswith(b"\xff\xd8"):
        raise ValueError("missing JPEG SOI")
    i = 2
    while i < len(buf):
        if buf[i] != 0xff:
            raise ValueError(f"expected marker at {i}")
        while i < len(buf) and buf[i] == 0xff:
            i += 1
        if i >= len(buf):
            raise ValueError("truncated marker")
        marker = buf[i]
        i += 1
        if marker == 0xd9:
            return i
        if marker == 0x01 or 0xd0 <= marker <= 0xd7:
            continue
        length = int.from_bytes(buf[i:i + 2], "big")
        if length < 2 or i + length > len(buf):
            raise ValueError(f"bad FF{marker:02x} segment at {i}")
        if marker != 0xda:
            i += length
            continue
        i += length
        while i < len(buf):
            if buf[i] != 0xff:
                i += 1
                continue
            j = i + 1
            while j < len(buf) and buf[j] == 0xff:
                j += 1
            if j >= len(buf):
                raise ValueError("truncated entropy marker")
            nxt = buf[j]
            if nxt == 0x00 or 0xd0 <= nxt <= 0xd7:
                i = j + 1
                continue
            if nxt == 0xd9:
                return j + 1
            break
    raise ValueError("JPEG EOI not found")


def main() -> None:
    raw = (ROOT / "05.jpg").read_bytes()
    digest = sha256(raw).hexdigest()
    assert digest == EXPECTED_SHA256, digest
    end = first_jpeg_eoi_end(raw)
    assert end == 336353, end
    trailer = raw[end:]
    assert len(trailer) == 336713, len(trailer)
    header = trailer[:360]
    assert header[:2] == b"\n\n"
    hex_text = header[2:].decode("ascii")
    assert len(hex_text) == 358
    payload = bytes.fromhex(hex_text)
    assert len(payload) == 179
    assert trailer[360:] == raw[:end][::-1]

    # This later raw FF D9 pair is inside the reversed copy, not the first
    # JPEG's EOI. The 72,700-byte reverse-prefix is only a substructure.
    last_marker = raw.rfind(b"\xff\xd9")
    assert last_marker == 600364, last_marker
    assert raw[last_marker + 2:] == raw[:72700][::-1]

    print("05.jpg SHA-256:", digest)
    print("first valid JPEG EOI end:", end)
    print("non-JPEG OOB header:", len(header), "bytes")
    print("header format: LF LF + 358 hex chars ->", len(payload), "OOB bytes")
    print("reversed full JPEG copy:", len(trailer) - 360, "bytes")
    print("trailer[360:] == reverse(raw[:first EOI]): true")
    print("later raw FF D9 at", last_marker, "is inside reversed copy")
    print("final 72,700-byte reverse-prefix is a substructure, not trailer boundary")


if __name__ == "__main__":
    main()
