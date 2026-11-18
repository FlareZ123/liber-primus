#!/usr/bin/env python3
"""Verify first-onion COUNT observations in the 2013 IRC archive mirror.

The transcript is a participant chat log, not a raw TCP capture or daemon
source. This script checks exact mirrored bytes and a small, predeclared set
of 7-Jan-2013 COUNT reports against the canonical GP29 alphabet.

Usage:
  python sims/cicada2013_count_irc_control.py /path/to/full-log.txt
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

EXPECTED_BYTES = 399_787
EXPECTED_GIT_BLOB_SHA1 = "2d865faeec179d6b5984643d8b2af7efa3269f73"
EXPECTED_LINES = 5_179

EXACT_LINES = {
    3940: "[2013-01-07 12:02:53] <soulseekah> count a = 97* count b = 61+ count ab = 158",
    3990: "[2013-01-07 12:07:11] <soulseekah> count norwell",
    3991: "[2013-01-07 12:07:11] <soulseekah> 279",
    4034: "[2013-01-07 12:09:34] <soulseekah> count ae",
    4036: "[2013-01-07 12:09:35] <soulseekah> 101*",
    5079: "[2013-01-07 15:08:42] <crash_demons> count bob = 129",
    5081: "[2013-01-07 15:08:49] <crash_demons> count b = 61+",
    5083: "[2013-01-07 15:08:55] <crash_demons> count o = 7*",
    5105: "[2013-01-07 15:14:38] <Atlas_> try to count eo",
    5107: "[2013-01-07 15:14:59] <crash_demons> count eo = 41+",
    5108: "[2013-01-07 15:15:12] <Atlas_> + is always prime",
    5117: "[2013-01-07 15:16:09] <NikTitanik> count j",
    5118: "[2013-01-07 15:16:16] <Atlas_> 37",
    5119: "[2013-01-07 15:16:17] <Atlas_> +",
    5120: "[2013-01-07 15:16:26] <crash_demons> count j=37*",
    5125: "[2013-01-07 15:17:18] <n_factor> its really there to search for primes that are prime both forward and backward",
    5128: "[2013-01-07 15:17:41] <n_factor> ones that are prime both directions, not necessarily palindromic",
}

OBSERVATIONS = [
    ("a", 97, "*", "training", 3940),
    ("b", 61, "+", "training", 3940),
    ("ab", 158, "", "training", 3940),
    ("norwell", 279, "", "heldout", 3990),
    ("ae", 101, "*", "heldout", 4034),
    ("bob", 129, "", "heldout", 5079),
    ("o", 7, "*", "heldout", 5083),
    ("eo", 41, "+", "heldout", 5105),
]

def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    d = 3
    while d * d <= n:
        if n % d == 0:
            return False
        d += 2
    return True

def reverse_decimal(n: int) -> int:
    return int(str(n)[::-1])

def expected_marker(n: int) -> str:
    if not is_prime(n):
        return ""
    return "*" if is_prime(reverse_decimal(n)) else "+"

def git_blob_sha1(raw: bytes) -> str:
    header = b"blob " + str(len(raw)).encode("ascii") + b"\0"
    return hashlib.sha1(header + raw).hexdigest()

def load_tokens(root: Path) -> list[tuple[str, int]]:
    corpus = json.loads(
        (root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
    )
    return sorted(
        zip(corpus["translit"], corpus["prime"]),
        key=lambda item: len(item[0]),
        reverse=True,
    )

def gematria_sum(word: str, tokens: list[tuple[str, int]]) -> int:
    text = word.upper()
    pos = total = 0
    while pos < len(text):
        if text[pos].isspace():
            pos += 1
            continue
        match = next(
            ((token, value) for token, value in tokens if text.startswith(token, pos)),
            None,
        )
        if match is None:
            raise ValueError(f"no GP29 token at {text[pos:]!r} in {word!r}")
        token, value = match
        total += int(value)
        pos += len(token)
    return total

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Exact UTF-8 archive mirror file")
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Liber Primus repository root (defaults to this script's parent)",
    )
    args = parser.parse_args()

    raw = args.source.read_bytes()
    if len(raw) != EXPECTED_BYTES:
        raise SystemExit(f"byte length mismatch: {len(raw)} != {EXPECTED_BYTES}")
    actual_blob = git_blob_sha1(raw)
    if actual_blob != EXPECTED_GIT_BLOB_SHA1:
        raise SystemExit(
            f"Git blob SHA-1 mismatch: {actual_blob} != {EXPECTED_GIT_BLOB_SHA1}"
        )

    lines = raw.decode("utf-8").splitlines()
    if len(lines) != EXPECTED_LINES:
        raise SystemExit(f"line count mismatch: {len(lines)} != {EXPECTED_LINES}")
    for number, expected in EXACT_LINES.items():
        actual = lines[number - 1]
        if actual != expected:
            raise SystemExit(
                f"source line {number} changed:\nexpected {expected!r}\nactual   {actual!r}"
            )

    tokens = load_tokens(args.repo_root)
    checked = []
    for word, observed_value, observed_suffix, role, line in OBSERVATIONS:
        value = gematria_sum(word, tokens)
        suffix = expected_marker(value)
        if (value, suffix) != (observed_value, observed_suffix):
            raise SystemExit(
                f"{word}: computed {(value, suffix)!r}, "
                f"transcript reports {(observed_value, observed_suffix)!r}"
            )
        checked.append(
            {
                "word": word,
                "line": line,
                "role": role,
                "sum": value,
                "reverse": reverse_decimal(value),
                "reported_suffix": observed_suffix or None,
                "classification": (
                    "emirp-or-palindromic-prime"
                    if observed_suffix == "*"
                    else "prime-only"
                    if observed_suffix == "+"
                    else "composite"
                ),
            }
        )

    output = {
        "source": {
            "pastebin_id": "XQ9rJSad",
            "archive_commit": "f0f03edcb029e94b519efcacf1bf2511353e17c2",
            "git_blob_sha1": actual_blob,
            "bytes": len(raw),
            "lines": len(lines),
        },
        "status": "participant-reported IRC observations; not raw TCP bytes or daemon code",
        "training_observations": [x for x in checked if x["role"] == "training"],
        "heldout_observations": [x for x in checked if x["role"] == "heldout"],
        "ambiguous_j_exchange": {
            "lines": [5117, 5118, 5119, 5120],
            "reports": [lines[n - 1] for n in (5117, 5118, 5119, 5120)],
            "action": "excluded from marker calibration because command/response association is unclear",
        },
        "conclusion": (
            "All eight unambiguous participant reports match GP29 sums and the "
            "star/plus prime-reversal rule; this corroborates the separate 2013 "
            "AfndPJa0 participant paste but does not authenticate wire-level output."
        ),
    }
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()
