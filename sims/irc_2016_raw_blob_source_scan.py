"""Fetch and inspect three pinned multi-MB historical IRC Git blobs.

This checks the source Git blob hashes before reading text and prints only
targeted match counts and bounded line contexts. It never guesses a hash
preimage or treats participant chat as an authenticated Cicada statement.
"""
from __future__ import annotations

import hashlib
import json
import re
from urllib.request import Request, urlopen

FILES = (
    ("#33012014.freenode.log", 8629610, "a2880b1db31ce523599ef30ca2e55291bf295900"),
    ("#cicadasolvers.freenode.log", 18487233, "bdd277c14f94c34b5ae714cd00c238065beeed4e"),
    ("#cicadasolvers.freenode.2.log", 27234234, "72634a9d071d32af767edbffc0493d810e88cd0d"),
)

# Exact missing object first; broader terms only give historical context.
TARGETS = {
    "specific_2016_html": rb"uRkNsGsa(?:\.htm)?",
    "specific_filename_stem": rb"uRkNs",
    "known_2016_key_fingerprint": rb"7A35090F",
    "an_end_phrase": rb"\bAN[\s_\-]+END\b",
    "sha512_word": rb"SHA[\s_\-]*512",
    "liber_primus": rb"\bLIBER[\s_\-]+PRIMUS\b",
    "2016_reference": rb"\b2016\b",
    "full_128_hex": rb"(?<![a-f0-9])[a-f0-9]{128}(?![a-f0-9])",
}

def git_blob_sha(data: bytes) -> str:
    """Return Git's object SHA-1 for raw byte-exact blob content."""
    prefix = b"blob " + str(len(data)).encode("ascii") + b"\x00"
    return hashlib.sha1(prefix + data).hexdigest()


def scan() -> None:
    """Print one compact audited JSON summary for all three raw objects."""
    all_results = []
    for name, expected_size, expected_sha in FILES:
        url = (
            "https://raw.githubusercontent.com/neuroretransmit/cicada/main/"
            "irc-logs/" + name.replace("#", "%23")
        )
        req = Request(url, headers={"User-Agent": "liber-primus-historical-source-audit"})
        with urlopen(req, timeout=120) as response:
            data = response.read()

        actual_sha = git_blob_sha(data)
        assert len(data) == expected_size, (name, len(data), expected_size)
        assert actual_sha == expected_sha, (name, actual_sha, expected_sha)
        lines = data.splitlines()
        matches = {}
        for key, pattern in TARGETS.items():
            compiled = re.compile(pattern, re.IGNORECASE)
            hit_positions = [
                index for index, line in enumerate(lines)
                if compiled.search(line)
            ]
            matches[key] = {
                "count": len(hit_positions),
                "sample": [
                    {"line": i + 1,
                     "text": lines[i].decode("utf-8", errors="replace")[:380]}
                    for i in hit_positions[:(100 if key.startswith("specific") else 12)]
                ],
            }
        all_results.append({
            "archive": name, "size_bytes": len(data), "git_blob_sha1": actual_sha,
            "line_count": len(lines), "matches": matches,
            "first_line": lines[0][:150].decode("utf-8", errors="replace"),
            "last_line": lines[-1][:150].decode("utf-8", errors="replace"),
        })
        print(
            f"VERIFIED {name}: {len(data)} bytes, {len(lines)} lines, "
            + ", ".join(f"{k}={v['count']}" for k, v in matches.items()),
            flush=True,
        )

    print("SOURCE_AUDIT_JSON_BEGIN", flush=True)
    print(json.dumps(all_results, ensure_ascii=False, indent=2), flush=True)
    print("SOURCE_AUDIT_JSON_END", flush=True)


if __name__ == "__main__":
    scan()
