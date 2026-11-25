"""Exact raw ISO9660 replay of the seven historical phone-stage XOR rows.

Read-only; does not mount or execute CicadaOS. Uses the byte extents independently
recorded by Actions artifact 14428471181, then checks the actual DATA directory.
Run from any directory with Python 3.10+: python sims/cicada2013_iso_raw_phone_replay_sft.py
Optional positional argument: an existing original 3301.iso.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
import runpy
import sys
import tempfile
from urllib.request import Request, urlopen

EXPECTED_SIZE = 136_398_848
EXPECTED_SHA256 = "784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f"
SECTOR = 2048
DATA_DIRECTORY_SECTOR = 26
EXTENTS = {"560.13": (4_087_808, 118_818_811),
           "560.17": (122_906_624, 1_183_811)}
URL = "https://connortumbleson.com/uploads/2024/01/3301.iso"


def verified_sha256(source):
    source.seek(0)
    digest = hashlib.sha256()
    total = 0
    while block := source.read(1 << 20):
        digest.update(block)
        total += len(block)
    assert total == EXPECTED_SIZE, (total, EXPECTED_SIZE)
    actual = digest.hexdigest()
    assert actual == EXPECTED_SHA256, actual
    return actual


def read_data_extents(source):
    source.seek(DATA_DIRECTORY_SECTOR * SECTOR)
    sector = source.read(SECTOR)
    assert len(sector) == SECTOR
    result = {}
    offset = 0
    while offset < len(sector) and sector[offset]:
        length = sector[offset]
        record = sector[offset:offset + length]
        assert len(record) == length and length >= 34
        extent = int.from_bytes(record[2:6], "little")
        size = int.from_bytes(record[10:14], "little")
        assert extent == int.from_bytes(record[6:10], "big")
        assert size == int.from_bytes(record[14:18], "big")
        name = record[33:33 + record[32]].decode("ascii")
        if name in ("560.13;1", "560.17;1"):
            assert not record[25] & 0x82, "Unexpected directory or multi-extent file"
            result[name[:-2]] = (extent * SECTOR, size)
        offset += length
    assert result == EXTENTS, result
    return result


def replay(source):
    digest = verified_sha256(source)
    extents = read_data_extents(source)
    rows = runpy.run_path(str(Path(__file__).with_name("2013_pklmx_reproduce.py")))["XOR_ROWS"]
    assert len(rows) == 7
    proofs = []
    for city, member, offset, phone_hex, archive_hex, expected in rows:
        start, size = extents[member]
        phone = bytes.fromhex(phone_hex)
        assert offset + len(phone) <= size
        absolute = start + offset
        source.seek(absolute)
        raw = source.read(len(phone))
        assert raw == bytes.fromhex(archive_hex), (city, raw.hex())
        decoded = bytes(a ^ b for a, b in zip(phone, raw))
        assert decoded.strip() == expected.encode("ascii"), (city, decoded)
        proofs.append({"city": city, "member": member, "member_offset": offset,
                       "iso_offset": absolute, "length": len(raw),
                       "raw_hex": raw.hex(), "decoded_hex": decoded.hex()})
    print("RAW_ISO_PHONE_REPLAY_PASS " + json.dumps({
        "iso_bytes": EXPECTED_SIZE, "sha256": digest, "extents": extents,
        "rows": proofs}, sort_keys=True), flush=True)


def main():
    if len(sys.argv) == 2:
        with open(sys.argv[1], "rb") as source:
            replay(source)
        return
    assert len(sys.argv) == 1, "Usage: script.py [3301.iso]"
    with tempfile.TemporaryFile() as source:
        request = Request(URL, headers={"User-Agent": "Liber-Primus-source-replay/1.0"})
        with urlopen(request, timeout=120) as response:
            total = 0
            while block := response.read(1 << 20):
                total += len(block)
                assert total <= EXPECTED_SIZE
                source.write(block)
        print("SOURCE_DOWNLOADED", total, flush=True)
        replay(source)


if __name__ == "__main__":
    main()
