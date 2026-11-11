"""Recover any preserved early (<143-byte) 2014 onion-2 publication witnesses.

Acquires exact Git blobs from the archived participant log, verifies the
full original object before searching, and emits compact excerpts only.
A chat claim cannot authenticate Cicada origin, server code, or LP2 key role.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
FILES = (
    ("#33012014.freenode.log", 8629610, "a2880b1db31ce523599ef30ca2e55291bf295900"),
    ("#cicadasolvers.freenode.log", 18487233, "bdd277c14f94c34b5ae714cd00c238065beeed4e"),
    ("#cicadasolvers.freenode.2.log", 27234234, "72634a9d071d32af767edbffc0493d810e88cd0d"),
)
SOURCE = json.loads((ROOT / "resources/cicada2014-onion2-timing.json").read_text(encoding="utf-8"))
FINAL = SOURCE["final_hex"].lower()
assert len(FINAL) == 512

def blob_hash(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + bytes((0,)) + data).hexdigest()

def normalized(line: bytes) -> str:
    return line.decode("utf-8", errors="replace").rstrip()[:560]

def inspect(name: str, size: int, digest: str) -> dict[str, object]:
    url = "https://raw.githubusercontent.com/neuroretransmit/cicada/main/irc-logs/" + name.replace("#", "%23")
    with urlopen(Request(url, headers={"User-Agent": "lp2-original-onion2-2014-historical-audit"}), timeout=120) as fh:
        data = fh.read()
    assert len(data) == size, (name, len(data), size)
    assert blob_hash(data) == digest, (name, blob_hash(data), digest)
    lines = data.splitlines()
    high = re.compile(rb"cu343l33nqaekrnw|patience is a virtue|second onion|onion.2", re.I)
    clock = re.compile(rb"5.minute|5 min|every five|each five|in (?:[1-9]|1[0-9]) minutes|(?:string|byte|hex).{0,25}(?:grow|append|long|len|size|refresh|change)", re.I)
    hexstrings = re.compile(rb"(?i)(?<![0-9a-f])(?:[0-9a-f]{2}){10,}(?![0-9a-f])")
    related = []
    snapshots = []
    historic = 0
    for j, raw in enumerate(lines):
        # The onion string was unveiled on 6 January 2014; allow near dates
        # through January 12 for contemporary commentary.
        if not re.match(rb"^2014 Jan (?:0[5-9]|1[0-2]) ", raw):
            continue
        historic += 1
        is_high = bool(high.search(raw))
        is_clock = bool(clock.search(raw))
        if is_high or is_clock:
            if len(related) < 80:
                related.append({
                    "line": j + 1,
                    "level": "name-or-patience" if is_high else "clock-or-length",
                    "text": normalized(raw),
                })
        for match in hexstrings.finditer(raw):
            token = match.group().decode("ascii").lower()
            # A prefix witness gives an exact publication length if the
            # preserved bytes are contiguous from byte 1. Short inline
            # fragments without a prefix do not constrain the clock.
            common = 0
            for a, b in zip(token, FINAL):
                if a != b:
                    break
                common += 1
            if common >= 20:
                snapshots.append({
                    "line": j + 1,
                    "time": normalized(raw)[:17],
                    "matching_prefix_hex_digits": common,
                    "matching_full_bytes": common // 2,
                    "token_hex_digits": len(token),
                    "text": normalized(raw),
                })
    return {
        "archive": name,
        "source_blob": digest,
        "line_count": len(lines),
        "historical_window_lines": historic,
        "related_count_sampled": len(related),
        "related_first_80": related,
        "prefix_snapshots": snapshots[:30],
        "prefix_snapshot_total": len(snapshots),
    }

def main() -> None:
    output = [inspect(*args) for args in FILES]
    print("ONION2_SOURCE_SCAN_BEGIN", flush=True)
    print(json.dumps(output, indent=2, ensure_ascii=False), flush=True)
    print("ONION2_SOURCE_SCAN_END", flush=True)

if __name__ == "__main__":
    main()
