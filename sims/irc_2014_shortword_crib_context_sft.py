"""Inspect only the byte-pinned May 24, 2014 LP2 short-word IRC claim context.

Uses the same source Git blob and byte count as the existing 2016 IRC scanner.
The author is an IRC participant, not an authenticated Cicada speaker.
"""
from __future__ import annotations

import hashlib
from urllib.request import Request, urlopen

NAME = "#cicadasolvers.freenode.log"
URL = "https://raw.githubusercontent.com/neuroretransmit/cicada/main/irc-logs/%23cicadasolvers.freenode.log"
SIZE = 18_487_233
SHA1 = "bdd277c14f94c34b5ae714cd00c238065beeed4e"
CENTER = 188_780
PRIMARY = 186_782

def main() -> None:
    with urlopen(Request(URL, headers={"User-Agent": "LP2-2014-original-crib-context"}), timeout=120) as resp:
        raw = resp.read()
    assert len(raw) == SIZE, (len(raw), SIZE)
    git_blob = b"blob " + str(len(raw)).encode() + b"\0" + raw
    assert hashlib.sha1(git_blob).hexdigest() == SHA1
    lines = raw.splitlines()
    print("PINNED_SOURCE", NAME, len(raw), len(lines), SHA1)
    for anchor in (PRIMARY, CENTER):
        print("EXACT_CONTEXT_START", anchor)
        for index in range(anchor - 45, anchor + 40):
            print(f"{index + 1:07d} {lines[index].decode('utf-8', errors='replace')[:500]}")
        print("EXACT_CONTEXT_END", anchor)
    print("LOCAL_SAME_DAY_REFERENCE_START")
    targets = (b" less ", b" it's ", b" its ", b" 27 28", b"26 27", b"page 34", b"page 35")
    a, b = max(0, CENTER - 2_000), min(len(lines), CENTER + 2_000)
    hits = []
    for i in range(a, b):
        lower = lines[i].lower()
        if any(word in lower for word in targets):
            hits.append((i+1, lines[i].decode("utf-8", errors="replace")[:420]))
    for at, line in hits[:120]:
        print(f"{at:07d} {line}")
    print("LOCAL_SAME_DAY_REFERENCE_END", len(hits))

if __name__ == "__main__":
    main()
