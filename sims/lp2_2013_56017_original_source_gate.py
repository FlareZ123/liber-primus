"""Original 2013 CicadaOS DATA/560.17: byte-identical source inventory.

This is a source-only gate for Director #1242. Historical CicadaOS's 1,183,811
bytes are recovered from a pinned archive, checked against the Git blob object,
and structurally characterized. The source does not authorize an LP2 receiver.
No ciphertext tuning, custom rolling keys, or inferred first-17-page clock.
"""
from __future__ import annotations

from collections import Counter
import hashlib
import json
import math
from urllib.request import Request, urlopen


COMMIT = "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3"
PATH = "2013/002-3301/3301-contents/data/560.17"
URI = f"https://raw.githubusercontent.com/neuroretransmit/cicada/{COMMIT}/{PATH}"
EXPECTED_LENGTH = 1183811
EXPECTED_GIT_SHA1 = "49df8e57f8e6052eb2d5c2b483282461e53ef5ff"


def source_bytes() -> bytes:
    req = Request(URI, headers={"User-Agent": "LP2-original-source-research/2026"})
    with urlopen(req, timeout=60) as response:
        data = response.read(EXPECTED_LENGTH + 1)
    assert len(data) == EXPECTED_LENGTH, f"wrong archived member length: {len(data)}"
    blob_prefix = f"blob {len(data)}\0".encode("ascii")
    calculated = hashlib.sha1(blob_prefix + data).hexdigest()
    assert calculated == EXPECTED_GIT_SHA1, "source byte contents fail original git-object hash"
    return data


# Three original 2013 poster/phone observations (see 2013_pklmx_reproduce.py).
# An authentic Dataset 17 key should reproduce the exact onion hosts, fixing
# source use and byte offset independently of LP2 language or cipher fitting.
DATASET17_POSTERS = [
    ("Dallas", 0x82B5,
     "f6a2d0a48e1b1ae40cbd454f77baa7d2557683d0cd4998",
     "8f90a7ddfb6d68957edc2a3816ddc4e77b19edb9a22792",
     "y2wyuvrqraowagc5.onion"),
    ("Annapolis", 0x13099,
     "d5a6cb76e55a2166bd6a4d078857ec1f68ea6afa9738",
     "b0d4bc1086294510c55c3d6aba259f7446850493f856",
     "erwfcsdvx6pm2rsk.onion"),
    ("Columbus", 0x0269,
     "d4b10626d65995e8fb010f4388787d56433f90c6df8d8d",
     "b8dd3347b020e68399377975ef4f1a376d50feafb0e387",
     "ll5afyskb6v6g7ga.onion"),
]


def original_2013_posters(data: bytes) -> list[dict[str, object]]:
    proofs = []
    for city, offset, phone_hex, archive_slice_hex, target in DATASET17_POSTERS:
        phone = bytes.fromhex(phone_hex)
        archive_slice = bytes.fromhex(archive_slice_hex)
        raw_slice = data[offset:offset + len(phone)]
        assert len(raw_slice) == len(phone), "original source slice out of bounds"
        assert raw_slice == archive_slice, f"{city}: original ISO bytes differ from archive"
        recovered = bytes(x ^ y for x, y in zip(phone, raw_slice))
        assert recovered.rstrip(b"\r\n") == target.encode("ascii"), f"{city}: old-stage XOR fails"
        proofs.append({
            "location": city, "source_offset": offset,
            "key_slice_hex": raw_slice.hex(), "plaintext": recovered.decode("ascii"),
        })
    return proofs


def characterize(data: bytes) -> dict[str, object]:
    frequency = Counter(data)
    entropy = -sum((count / len(data)) * math.log2(count / len(data)) for count in frequency.values())
    printable = sum(32 <= b <= 126 for b in data)
    nulls = frequency[0]
    runs: list[tuple[int, bytes]] = []
    start = 0
    for i, b in enumerate(data):
        if b in (9, 10, 13) or (32 <= b <= 126):
            continue
        if i - start >= 12:
            runs.append((start, data[start:i]))
        start = i + 1
    if len(data) - start >= 12:
        runs.append((start, data[start:]))
    runs.sort(key=lambda x: len(x[1]), reverse=True)
    visible = [
        {"offset": at, "length": len(raw), "value": repr(raw[:100])}
        for at, raw in runs[:12]
    ]
    return {
        "source_url": URI, "archive_commit": COMMIT, "file": PATH,
        "source_data_bytes": len(data), "git_blob_sha1": EXPECTED_GIT_SHA1,
        "sha256": hashlib.sha256(data).hexdigest(),
        "byte_entropy_bits": round(entropy, 6),
        "unique_bytes": len(frequency),
        "zero_bytes": nulls, "printable_bytes": printable,
        "initial_64bytes_hex": data[:64].hex(),
        "final_64bytes_hex": data[-64:].hex(),
        "visible_runs_12bytes_or_more": len(runs),
        "largest_visible_runs": visible,
        "interpretation": "2013 source object, not a selected 2014 LP2 receiver",
    }


if __name__ == "__main__":
    original = source_bytes()
    result = characterize(original)
    result["authentic_2013_phone_reproductions"] = original_2013_posters(original)
    print("SOURCE_EXACT", json.dumps(result, sort_keys=True))
