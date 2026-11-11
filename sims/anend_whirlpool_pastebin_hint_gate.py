#!/usr/bin/env python3
"""Bounded Whirlpool test of the literal Pastebin lead reported in 2016.

This tests only the filename/identifier and conventional URL strings. It does
not fetch or hash the missing HTML file's contents.
"""
import json
import subprocess

TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
ABC_WHIRLPOOL = (
    "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c"
    "7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"
)
assert len(TARGET) == 128


def whirlpool(data: bytes) -> str:
    """Use OpenSSL 3's legacy provider for the historical Whirlpool digest."""
    result = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data,
        capture_output=True,
        check=True,
    )
    digest = result.stdout.decode("ascii").strip().split()[-1].lower()
    if len(digest) != 128:
        raise RuntimeError(f"unexpected OpenSSL Whirlpool output: {result.stdout!r}")
    return digest


assert whirlpool(b"abc") == ABC_WHIRLPOOL

# The 2016 Tor Stack Exchange answer names uRkNsGsa.htm but gives no raw URL.
# These are the exact filename/ID and ordinary Pastebin URL forms, not a URL sweep.
CANDIDATES = [
    ("filename", b"uRkNsGsa.htm"),
    ("bare-paste-id", b"uRkNsGsa"),
    ("bare-host-path", b"pastebin.com/uRkNsGsa"),
    ("https-page", b"https://pastebin.com/uRkNsGsa"),
    ("http-page", b"http://pastebin.com/uRkNsGsa"),
    ("https-raw", b"https://pastebin.com/raw/uRkNsGsa"),
    ("http-raw", b"http://pastebin.com/raw/uRkNsGsa"),
    ("https-download", b"https://pastebin.com/download/uRkNsGsa"),
    ("filename-lf", b"uRkNsGsa.htm\n"),
    ("filename-crlf", b"uRkNsGsa.htm\r\n"),
]

results = []
for label, value in CANDIDATES:
    digest = whirlpool(value)
    results.append({
        "candidate": label,
        "bytes_hex": value.hex(),
        "whirlpool": digest,
        "matches_target": digest == TARGET,
    })
assert not any(item["matches_target"] for item in results)

print(json.dumps({
    "source_lead": "2016 Tor Stack Exchange answer naming uRkNsGsa.htm",
    "target": TARGET,
    "known_answer": {"input": "abc", "whirlpool": ABC_WHIRLPOOL},
    "candidate_count": len(results),
    "matches": sum(item["matches_target"] for item in results),
    "results": results,
    "conclusion": "No literal filename, Pastebin ID, or conventional URL candidate matches; the missing file bytes remain untested."
}, indent=2))
