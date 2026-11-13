"""Fixed-candidate scan of an archived 2017 onion graph, with no Tor activity.

Source candidate: workplace/p55-sixteenword-ornament-onion-candidate.md
Data: https://www.cranic.it/data/supporting_material.tar.gz
Run on Windows/Python3: python sims/lp2_p55_cranic2017_v2hosts_sft.py archive.tar.gz
Self-test: python sims/lp2_p55_cranic2017_v2hosts_sft.py --selftest

A candidate occurrence is an historical lead, not a validated destination. A
candidate absence is meaningful only when the archived material preserves
literal .onion hostnames and the two known historical controls are detected.
"""
from __future__ import annotations
import io
import json
import sys
import tarfile
from pathlib import Path

CANDIDATE = b"6sws36unkmvdy4b7.onion"
CONTROLS = (b"ky2khlqdf7qdznac.onion", b"avowyfgl5lkzfj3n.onion")
NEEDLES = (CANDIDATE, *CONTROLS)
CHUNK = 1 << 20
MAX_MEMBER = 1 << 30

def scan(archive: str | Path | io.BytesIO) -> dict:
    hits = {needle.decode("ascii"): [] for needle in NEEDLES}
    files = 0
    total_bytes = 0
    skipped = 0
    with tarfile.open(
        fileobj=archive if isinstance(archive, io.BytesIO) else None,
        name=None if isinstance(archive, io.BytesIO) else str(archive),
        mode="r:*",
    ) as tar:
        for member in tar:
            if not member.isfile():
                continue
            if member.size > MAX_MEMBER:
                skipped += 1
                continue
            stream = tar.extractfile(member)
            if stream is None:
                skipped += 1
                continue
            files += 1
            previous = b""
            offset = 0
            while block := stream.read(CHUNK):
                data = previous + block.lower()
                base = offset - len(previous)
                for needle in NEEDLES:
                    start = 0
                    while (start := data.find(needle, start)) >= 0:
                        hits[needle.decode("ascii")].append({
                            "member": member.name, "byte_offset": base + start
                        })
                        start += 1
                offset += len(block)
                total_bytes += len(block)
                previous = data[-(max(map(len, NEEDLES)) - 1):]
    return {"files_scanned": files, "bytes_scanned": total_bytes,
            "skipped_large_or_unreadable": skipped,
            "candidate": CANDIDATE.decode("ascii"), "hits": hits}

def selftest() -> None:
    fixture = io.BytesIO()
    with tarfile.open(fileobj=fixture, mode="w:gz") as tar:
        for name, data in (
            ("2017/empty.txt", b"nothing"),
            ("2017/index.txt", b"x" * (CHUNK - 14) + CANDIDATE + b"\n" + CONTROLS[0]),
            ("../not-extracted/test.txt", CONTROLS[1]),
        ):
            member = tarfile.TarInfo(name)
            member.size = len(data)
            tar.addfile(member, io.BytesIO(data))
    fixture.seek(0)
    result = scan(fixture)
    assert result["files_scanned"] == 3, result
    assert all(len(result["hits"][h.decode()]) == 1 for h in NEEDLES), result
    assert result["hits"][CANDIDATE.decode()][0]["byte_offset"] == CHUNK - 14
    print("SELFTEST_PASS: streaming tar, cross-chunk match, three frozen hosts")

if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--selftest":
        selftest()
    elif len(sys.argv) == 2:
        selftest()
        print(json.dumps(scan(sys.argv[1]), sort_keys=True, indent=2))
    else:
        raise SystemExit("Usage: script.py archive.tar.gz | --selftest")
