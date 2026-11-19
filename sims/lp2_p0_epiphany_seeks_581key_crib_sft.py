#!/usr/bin/env python3
"""Exact source-key-library crib gate for conditional p0 EPIPHANY SEEKS.

Usage:
  python sims/lp2_p0_epiphany_seeks_581key_crib_sft.py external-cicada3301

The external tree is pnotisdev/cicada3301 pinned at
15200c67abee106913ba01ff504c5b6e88d16cc7. Its work/kscreen/export.py must
already have produced data/library.ksb. This SFT searches the pre-existing
581 additive source/historical streams at every available phase. Both signs
and both stream orientations are charged before inspection.
"""
from __future__ import annotations

import json
from pathlib import Path
import struct
import sys

PINNED_EXTERNAL = "15200c67abee106913ba01ff504c5b6e88d16cc7"

def parse_ksb(path: Path) -> list[tuple[str, bytes]]:
    data = path.read_bytes()
    assert data[:4] == b"KSB1"
    count = struct.unpack_from("<I", data, 4)[0]
    at = 8
    out: list[tuple[str, bytes]] = []
    for _ in range(count):
        name_len = struct.unpack_from("<H", data, at)[0]
        at += 2
        name = data[at:at + name_len].decode("utf-8")
        at += name_len
        stream_len = struct.unpack_from("<I", data, at)[0]
        at += 4
        stream = data[at:at + stream_len]
        at += stream_len
        out.append((name, stream))
    assert at == len(data)
    return out

def encode_gp(text: str, translit: list[str]) -> list[int]:
    normalized = text.upper().replace("K", "C").replace("V", "U").replace("Z", "S")
    tokens = sorted(((token, index) for index, token in enumerate(translit)),
                    key=lambda item: len(item[0]), reverse=True)
    out: list[int] = []
    for word in normalized.split():
        pos = 0
        while pos < len(word):
            for token, index in tokens:
                if word.startswith(token, pos):
                    out.append(index)
                    pos += len(token)
                    break
            else:
                raise AssertionError(f"Cannot encode GP text at {word[pos:]} in {word}")
    return out

def find_all(haystack: bytes, needle: bytes) -> list[int]:
    hits: list[int] = []
    start = 0
    while True:
        at = haystack.find(needle, start)
        if at < 0:
            return hits
        hits.append(at)
        start = at + 1

def main() -> None:
    assert len(sys.argv) == 2
    root = Path(__file__).resolve().parent.parent
    external = Path(sys.argv[1]).resolve()
    corpus = json.loads((root / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))

    cipher = corpus["pages"][0]["indices"][:13]
    assert cipher == [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]
    plaintext = encode_gp("EPIPHANY SEEKS", corpus["translit"])
    assert plaintext == [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15]

    plus_key = [(c - p) % 29 for c, p in zip(cipher, plaintext)]
    minus_key = [(p - c) % 29 for c, p in zip(cipher, plaintext)]
    assert plus_key == [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]
    assert minus_key == [3, 5, 21, 10, 2, 5, 11, 26, 0, 21, 0, 13, 10]
    assert [sum(cipher[:8]), sum(cipher[8:])] == [96, 85]
    assert [sum(plaintext[:8]), sum(plaintext[8:])] == [121, 71]
    assert [sum(plus_key[:8]), sum(plus_key[8:])] == [149, 43]
    assert sum(plus_key) == sum(plaintext) == 192

    streams = parse_ksb(external / "work/kscreen/data/library.ksb")
    assert len(streams) == 1439

    info_lines = (external / "work/kscreen/data/library.tsv").read_text(encoding="utf-8").splitlines()
    assert info_lines[0].split("\t") == [
        "name", "length", "period", "predicted_ioc_english", "excluded_by_global_ioc"
    ]
    excluded_by_name: dict[str, bool] = {}
    for line in info_lines[1:]:
        name, _length, _period, _pi, excluded = line.split("\t")
        excluded_by_name[name] = excluded == "1"
    assert len(excluded_by_name) == len(streams)
    assert sum(excluded_by_name.values()) == 858
    assert len(streams) - sum(excluded_by_name.values()) == 581

    variants = {
        "plus-forward": bytes(plus_key),
        "minus-forward": bytes(minus_key),
        "plus-reverse": bytes(reversed(plus_key)),
        "minus-reverse": bytes(reversed(minus_key)),
    }

    exact_hits: list[dict[str, object]] = []
    for name, stream in streams:
        for variant_name, needle in variants.items():
            for offset in find_all(stream, needle):
                exact_hits.append({
                    "stream": name,
                    "variant": variant_name,
                    "offset": offset,
                    "excluded_by_prior_global_ioc": excluded_by_name[name],
                })

    survivor_hits = [hit for hit in exact_hits if not hit["excluded_by_prior_global_ioc"]]
    status = (
        "CANDIDATE: exact conditional p0 crib key found in frozen source library"
        if exact_hits
        else "PASS: no exact conditional p0 crib key in frozen source library"
    )
    decision = (
        "Forward-test each exact source-stream hit on the untouched p0 body before promotion."
        if exact_hits
        else (
            "No exact contiguous phase of any of the 1,439 frozen source/historical additive-key "
            "streams generates the conditional EPIPHANY SEEKS title crib under either sign or "
            "stream direction. A distinct source-selected operation or key generator is still required."
        )
    )
    print(json.dumps({
        "status": status,
        "external_pin": PINNED_EXTERNAL,
        "cipher_gp29": cipher,
        "plaintext_gp29": plaintext,
        "required_plus_key": plus_key,
        "required_minus_key": minus_key,
        "word_sums": {
            "cipher": [sum(cipher[:8]), sum(cipher[8:])],
            "plaintext": [sum(plaintext[:8]), sum(plaintext[8:])],
            "required_plus_key": [sum(plus_key[:8]), sum(plus_key[8:])],
            "plaintext_total": sum(plaintext),
            "required_plus_key_total": sum(plus_key),
        },
        "library_streams": len(streams),
        "prior_global_ioc_excluded_streams": sum(excluded_by_name.values()),
        "prior_global_ioc_survivor_streams": len(streams) - sum(excluded_by_name.values()),
        "charged_variants_per_stream": len(variants),
        "exact_hits": exact_hits,
        "survivor_exact_hits": survivor_hits,
        "decision": decision,
    }, indent=2))

if __name__ == "__main__":
    main()
