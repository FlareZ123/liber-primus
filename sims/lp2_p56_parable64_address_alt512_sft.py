"""Source-selected 64-rune three-line key against four historical p56 hashes.

Uses the frozen original p57 PARABLE-heading prime(449) addresses of Agent38:
361 => physical page36 line1, 133 => p13 line3, 331 => p33 line1.
This is a conditional source-address grammar, not an authenticated decoder.
"""
from __future__ import annotations

import json
from pathlib import Path

from lp2_p56_alternate512_original_source_sft import (
    KECCAK_EMPTY, SKEIN_EMPTY, STREEBOG_EMPTY, TARGET, WHIRLPOOL_EMPTY, digest,
)

ROOT = Path(__file__).resolve().parent.parent
res = ROOT / "resources" / "liber-primus"
corpus = json.loads((res / "lp2-corpus.json").read_text(encoding="utf8"))
pages = (res / "lp2-transcription.txt").read_text(encoding="utf8").split("%")
pages.insert(50, "")
assert len(pages) == 58
rune_ids = {r: i for i, r in enumerate(corpus["runes"])}


def line_indices(page: int, line: int) -> list[int]:
    """Source-aligned 1-based printed nonempty physical line, as in the CJS gate."""
    options = [
        [rune_ids[ch] for ch in part if ch in rune_ids]
        for part in pages[page].split("/")
    ]
    options = [part for part in options if part]
    return options[line - 1]


def prime_sum(xs: list[int]) -> int:
    return sum(corpus["prime"][x] for x in xs)


def main() -> None:
    assert digest(b"") == {
        "skein512_512": SKEIN_EMPTY,
        "keccak512_pre_fips": KECCAK_EMPTY,
        "streebog512": STREEBOG_EMPTY,
        "whirlpool": WHIRLPOOL_EMPTY,
    }
    parts = [line_indices(36, 1), line_indices(13, 3), line_indices(33, 1)]
    assert [len(p) for p in parts] == [23, 23, 18]
    assert [prime_sum(p) for p in parts] == [1020, 1229, 920]
    states = [k for line in parts for k in line]
    assert len(states) == 64
    assert prime_sum(states) == 3169
    assert line_indices(13, 3) == [
        16, 3, 14, 26, 19, 0, 14, 18, 3, 25, 6, 26, 20, 3, 12,
        0, 15, 25, 12, 19, 27, 22, 7,
    ]
    candidates = {
        "original_GP_index64": bytes(states),
        "original_GP_prime64": bytes(corpus["prime"][v] for v in states),
    }
    hits = []
    for name, data in candidates.items():
        results = digest(data)
        for algorithm, value in results.items():
            matches = value == TARGET
            print(f"{name} {algorithm}: {value} match={matches}", flush=True)
            if matches:
                hits.append((name, algorithm))
    print(json.dumps({
        "original_heading_sum": 449,
        "selected_page_line_addresses": ["361", "133", "331"],
        "original_line_rune_lengths": [23, 23, 18],
        "original_line_GP_prime_sums": [1020, 1229, 920],
        "combined_prime_sum": 3169,
        "source_encodings": list(candidates),
        "algorithms_tested": 4,
        "full_digest_comparisons": 8,
        "p56_matches": hits,
    }, indent=2))
    print("PASS: source-addressed original64 four-hash comparison")


if __name__ == "__main__":
    main()
