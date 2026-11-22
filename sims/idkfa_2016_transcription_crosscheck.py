#!/usr/bin/env python3
"""Cross-check the 2016 aautcsh/idkfa transcription against the canonical LP2 corpus.

The source is a historical derived transcription, not an original artifact:
https://github.com/aautcsh/idkfa/blob/b6f00d0f7bcbdff495dcd13954af4829d8cf5bcc/data/liber

The current corpus is pinned deliberately. If it changes, review the new corpus
and update the expected Git blob ID rather than silently accepting drift.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

SOURCE_BLOB_SHA1 = "b670f9a89884da8c2bb8f1afa78bf5f1be409d92"
CORPUS_BLOB_SHA1 = "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
SOURCE_COMMIT = "b6f00d0f7bcbdff495dcd13954af4829d8cf5bcc"


def git_blob_sha1(data: bytes) -> str:
    header = b"blob " + str(len(data)).encode("ascii") + b"\0"
    return hashlib.sha1(header + data).hexdigest()


def rune_indices(text: str, glyph_to_index: dict[str, int]) -> list[int]:
    """Keep only corpus rune glyphs; IDKFA uses ASCII F for the F rune."""
    return [glyph_to_index[ch] for ch in text if ch in glyph_to_index]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path,
                        help="downloaded IDKFA data/liber at the pinned commit")
    parser.add_argument("--corpus", required=True, type=Path,
                        help="resources/liber-primus/lp2-corpus.json")
    args = parser.parse_args()

    source_bytes = args.source.read_bytes()
    corpus_bytes = args.corpus.read_bytes()
    source_sha = git_blob_sha1(source_bytes)
    corpus_sha = git_blob_sha1(corpus_bytes)
    if source_sha != SOURCE_BLOB_SHA1:
        raise SystemExit(
            f"source Git blob mismatch: expected {SOURCE_BLOB_SHA1}, got {source_sha}"
        )
    if corpus_sha != CORPUS_BLOB_SHA1:
        raise SystemExit(
            f"corpus Git blob mismatch: expected {CORPUS_BLOB_SHA1}, got {corpus_sha}"
        )

    source_text = source_bytes.decode("utf-8")
    corpus: dict[str, Any] = json.loads(corpus_bytes)
    pages = corpus["pages"]
    runes = corpus["runes"]
    translit = corpus["translit"]
    glyph_to_index = {glyph: i for i, glyph in enumerate(runes)}
    glyph_to_index["F"] = glyph_to_index["ᚠ"]

    chunks = source_text.split("%")
    if len(chunks) != 72:
        raise SystemExit(f"expected 72 historical text chunks, got {len(chunks)}")
    if len(pages) != 58:
        raise SystemExit(f"expected 58 canonical LP2 pages, got {len(pages)}")
    if pages[50]["indices"]:
        raise SystemExit("expected LP2 p50 to be numeric-grid-only (zero rune indices)")

    # Chunks 0–14 are the preceding LP1 text. The LP2 transcription omits p50,
    # which is a numeric table and has no rune stream in data/liber.
    mapping: dict[int, int] = {}
    for old_chunk in range(15, 72):
        page = old_chunk - 15
        if page >= 50:
            page += 1
        mapping[old_chunk] = page

    mismatches: list[dict[str, Any]] = []
    exact_pages: list[int] = []
    for old_chunk, page_number in mapping.items():
        observed = rune_indices(chunks[old_chunk], glyph_to_index)
        expected = pages[page_number]["indices"]
        if len(observed) != len(expected):
            mismatches.append({
                "page": page_number,
                "old_chunk": old_chunk,
                "old_count": len(observed),
                "canonical_count": len(expected),
                "substitutions": [],
                "length_mismatch": True,
            })
            continue

        substitutions = []
        for offset, (old_value, canonical_value) in enumerate(zip(observed, expected)):
            if old_value != canonical_value:
                substitutions.append({
                    "offset": offset,
                    "old_index": old_value,
                    "old_rune": runes[old_value],
                    "old_translit": translit[old_value],
                    "canonical_index": canonical_value,
                    "canonical_rune": runes[canonical_value],
                    "canonical_translit": translit[canonical_value],
                })

        if substitutions:
            mismatches.append({
                "page": page_number,
                "old_chunk": old_chunk,
                "old_count": len(observed),
                "canonical_count": len(expected),
                "substitutions": substitutions,
                "length_mismatch": False,
            })
        else:
            exact_pages.append(page_number)

    expected_mismatches = {
        24: [(172, "A", "AE")],
        57: [(80, "E", "Y")],
    }
    actual_mismatches = {
        item["page"]: [
            (sub["offset"], sub["old_translit"], sub["canonical_translit"])
            for sub in item["substitutions"]
        ]
        for item in mismatches
    }
    if actual_mismatches != expected_mismatches:
        raise SystemExit(
            "unexpected transcription differences:\n"
            + json.dumps(actual_mismatches, indent=2, ensure_ascii=False)
        )
    if len(exact_pages) != 55 or len(mismatches) != 2:
        raise SystemExit(
            f"unexpected totals: {len(exact_pages)} exact pages, "
            f"{len(mismatches)} mismatch pages"
        )

    print(json.dumps({
        "source_commit": SOURCE_COMMIT,
        "source_git_blob_sha1": source_sha,
        "corpus_git_blob_sha1": corpus_sha,
        "historical_text_chunks": len(chunks),
        "lp2_pages_compared": len(mapping),
        "exact_pages": len(exact_pages),
        "mismatch_pages": mismatches,
        "omitted_lp2_page": 50,
        "interpretation": (
            "55 exact rune-page matches; p24 and p57 each have one historical "
            "transcription substitution, both visually resolved in favor of "
            "the canonical corpus from original JPEGs. p50 is numeric-grid-only."
        ),
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
