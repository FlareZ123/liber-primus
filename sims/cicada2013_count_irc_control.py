#!/usr/bin/env python3
"""Verify first-onion COUNT observations in the 2013 IRC archive mirror.

The transcript is a participant chat log, not a raw TCP capture or daemon
source. This script checks exact mirrored bytes and a fixed set of 7-Jan-2013 COUNT
reports as an independent holdout against the separate AfndPJa0 Pastebin.

Usage:
  python sims/cicada2013_count_irc_control.py /path/to/full-log.txt
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.request import urlopen

EXPECTED_BYTES = 399_787
EXPECTED_GIT_BLOB_SHA1 = "2d865faeec179d6b5984643d8b2af7efa3269f73"
EXPECTED_LINES = 5_179
MIRROR_URL = ("https://raw.githubusercontent.com/cicada-solvers/"
    "The-Complete-Cicada3301-Archive/f0f03edcb029e94b519efcacf1bf2511353e17c2/"
    "2013/additional%20docs/logs/all%20cosmos%20posts%20from%207th%20on%20the%20761%20song%20-%20full%20log.txt")

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
    ("a", 97, "*", "heldout", 3940),
    ("b", 61, "+", "heldout", 3940),
    ("ab", 158, "", "heldout", 3940),
    ("norwell", 279, "", "heldout", 3990),
    ("ae", 101, "*", "heldout", 4034),
    ("bob", 129, "", "heldout", 5079),
    ("o", 7, "*", "heldout", 5083),
    ("eo", 41, "+", "heldout", 5105),
    ("b", 61, "+", "heldout-repeat", 5081),
]

# Date-stamped participant-reported service observations, not daemon bytes.
# These are independent of the COUNT suffix samples above.
NUMBER_TRACE_PAIRS = [
    (10, "2 5", 3768, 3769),
    (20, "2 2 5", 3770, 3771),
    (3301, "+", 3726, 3727),
    (1033, "+", 3777, 3778),
    (4007, "2 2 17 103", 3970, 3972),
    (1595277641, "1031 1229 1259", 4000, 4001),
    (691, "2 2 7 7", 4042, 4043),
]
NUMBER_INLINE_REPORTS = [
    (23, "2 2 2 2 2", 5062),
    (61, "2 2 2 2", 5116),
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

def prime_factors(n: int) -> list[int]:
    factors: list[int] = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d = 3 if d == 2 else d + 2
    if n > 1:
        factors.append(n)
    return factors

def numeric_command_prediction(n: int) -> str:
    # Inferred from distinct first-hand observations. A composite is factored
    # directly; a prime is reversed first, then factored (or returns '+').
    selected = reverse_decimal(n) if is_prime(n) else n
    if is_prime(selected):
        return "+"
    return " ".join(map(str, prime_factors(selected)))

def recover_hello_prefix(lines: list[str]) -> bytes:
    # IRC participants transmitted 65-byte chunks of a hex-dumped PGP reply.
    # The last line is half-byte truncated; only complete bytes are recovered.
    recorded = bytearray()
    for line_number in range(3669, 3689):
        match = re.search(r" ([0-9a-f]{7}): ([0-9a-f]+)$", lines[line_number - 1])
        if match is None:
            continue
        offset = int(match.group(1), 16)
        if offset != len(recorded):
            raise SystemExit(f"HELLO hex stream offset {offset} != {len(recorded)}")
        hex_part = match.group(2)
        recorded.extend(bytes.fromhex(hex_part[:len(hex_part) // 2 * 2]))
    text = recorded.decode("ascii")
    if (len(recorded) != 936
        or not text.startswith("-----BEGIN PGP SIGNED MESSAGE-----\n")
        or "\nxsxnaksict6egxkq.onion\n" not in text
        or "-----BEGIN PGP SIGNATURE-----" not in text
        or "-----END PGP SIGNATURE-----" in text):
        raise SystemExit("HELLO reply reconstruction does not match IRC witness")
    return bytes(recorded)

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
    parser.add_argument("source", nargs="?", type=Path,
                        help="Exact UTF-8 archive mirror file; omitted: fetch pinned GitHub mirror")
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Liber Primus repository root (defaults to this script's parent)",
    )
    args = parser.parse_args()

    raw = args.source.read_bytes() if args.source else urlopen(MIRROR_URL, timeout=40).read()
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

    numeric_checked = []
    for operand, expected, input_line, output_line in NUMBER_TRACE_PAIRS:
        if (f"> {operand}" not in lines[input_line - 1]
            or f"> {expected}" not in lines[output_line - 1]):
            raise SystemExit(f"NUMBER trace changed: {operand}, {input_line}-{output_line}")
        prediction = numeric_command_prediction(operand)
        if prediction != expected:
            raise SystemExit(f"NUMBER({operand}) expected {expected!r}, got {prediction!r}")
        numeric_checked.append({
            "input": operand,
            "result": expected,
            "lines": [input_line, output_line],
            "input_prime": is_prime(operand),
            "tested_integer": reverse_decimal(operand) if is_prime(operand) else operand,
        })
    for operand, expected, line in NUMBER_INLINE_REPORTS:
        source_line = lines[line - 1]
        if str(operand) not in source_line or expected not in source_line:
            raise SystemExit(f"NUMBER inline report changed: {line}")
        prediction = numeric_command_prediction(operand)
        if prediction != expected:
            raise SystemExit(f"NUMBER inline ({operand}) expected {expected!r}, got {prediction!r}")
        numeric_checked.append({
            "input": operand, "result": expected,
            "lines": [line], "input_prime": is_prime(operand),
            "tested_integer": reverse_decimal(operand) if is_prime(operand) else operand,
        })

    help_lines = lines[3605:3613]
    if not all(any(word in item for item in help_lines)
               for word in ("[number]", "count [phrase]", "hello", "help", "quit")):
        raise SystemExit("historical HELP grammar changed")
    if "unlisted command: primes" not in lines[5132]:
        raise SystemExit("historical unlisted PRIMES observation changed")

    hello_prefix = recover_hello_prefix(lines)
    hello_text = hello_prefix.decode("ascii")

    # The independently archived complete clearsigned response has 60 bytes
    # after the 936 complete bytes transmitted in the contemporary IRC log.
    # Git's Windows checkout may rewrite 31 LF bytes to CRLF (1027 worktree
    # bytes). Normalize only that transport effect to recover the 996 Git blob.
    complete_hello = (
        args.repo_root / "resources/historical/cicada2013-first-onion-hello.asc"
    ).read_bytes().replace(bytes([13, 10]), bytes([10]))
    expected_tail = bytes.fromhex("75794f360a5a7679627a70347334537a526a6b6b39734d4d360a3d5759564f0a2d2d2d2d2d454e4420504750205349474e41545552452d2d2d2d2d0a")
    if len(complete_hello) != 996 or complete_hello[:936] != hello_prefix:
        first_diff = next(
            (i for i, (a, b) in enumerate(zip(complete_hello, hello_prefix)) if a != b),
            None,
        )
        raise SystemExit(
            f"full archived HELLO differs from 2013 IRC 936-byte prefix: "
            f"archive length={len(complete_hello)}, IRC length={len(hello_prefix)}, "
            f"first_diff={first_diff}, "
            f"archive_region={complete_hello[max(0, (first_diff or 0)-12):(first_diff or 0)+18]!r}, "
            f"IRC_region={hello_prefix[max(0, (first_diff or 0)-12):(first_diff or 0)+18]!r}"
        )
    if complete_hello[936:] != expected_tail:
        raise SystemExit("HELLO continuation is not solely the recorded signature tail")
    signed_lines = hello_text.splitlines()
    whitespace_counts = (5, 3, 2, 2, 3, 5)
    for line_number, count in zip((4, 6, 8, 10, 12, 14), whitespace_counts):
        if signed_lines[line_number - 1] != " " * count:
            raise SystemExit(f"2013 IRC disagrees on HELLO blank line {line_number}")

    output = {
        "source": {
            "pastebin_id": "XQ9rJSad",
            "archive_commit": "f0f03edcb029e94b519efcacf1bf2511353e17c2",
            "git_blob_sha1": actual_blob,
            "bytes": len(raw),
            "lines": len(lines),
        },
        "status": "participant-reported IRC observations; not raw TCP bytes or daemon code",
        "baseline_source": "separate AfndPJa0 participant Pastebin",
        "independent_heldout_observations": checked,
        "number_command": {
            "scope": "participant-reported inferred service behavior, not original daemon",
            "inferred_rule": "composite: factor input; prime: reverse decimal digits then factor, or '+' if reverse is prime",
            "observations": numeric_checked,
        },
        "hello_command": {
            "response": "hex-encoded PGP signed-message prefix",
            "complete_recovered_bytes": len(hello_prefix),
            "sha256_prefix": hashlib.sha256(hello_prefix).hexdigest(),
            "second_onion": "xsxnaksict6egxkq.onion",
            "signature_truncated_in_irc": True,
            "archived_complete_bytes": len(complete_hello),
            "archived_complete_sha256": hashlib.sha256(complete_hello).hexdigest(),
            "irc_exact_prefix_of_complete": True,
            "missing_irc_bytes_are_signature_tail_only": len(expected_tail),
            "contemporaneous_blank_space_runs": list(whitespace_counts),
            "witness_limit": (
                "The independent 2013 participant record preserves the first 936 bytes; "
                "the complete signed object is a later archive copy. The signature "
                "does not cryptographically authenticate trailing whitespace."
            ),
            "signed_message_body": hello_text.split("-----BEGIN PGP SIGNATURE-----", 1)[0],
        },
        "unlisted_command": {
            "name": "primes",
            "IRC_line": 5133,
            "status": "participants saw a primes listing; no LP2 instruction",
        },
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
