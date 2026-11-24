#!/usr/bin/env python3
"""Test the 2012 phone number as a Python-MT GP29 keystream seed for p41.

Run from the repository root with Python 3.12:
    python sims/lp2_p41_phone_seed_python_mt_gate.py

This tests one fixed source-derived seed, three standard stream-to-GP29
extractions, both additive signs, and the authentic plaintext-F bypass.
It does not search seeds or phases.
"""
from __future__ import annotations

from json import dumps, loads
from pathlib import Path
from random import Random

CORPUS = Path("resources/liber-primus/lp2-corpus.json")
TRANSCRIPT = Path("resources/liber-primus/lp2-transcription.txt")
WORDLIST = Path("resources/control/english_wordfreq_textblob.txt")
PHONE_SEED = 2143909608
METHODS = ("randrange29", "bits5mod29", "float29")


def gp(word: str, tokens: list[tuple[str, int]]) -> list[int] | None:
    s = (word.upper().replace("QU", "CW").replace("V", "U")
         .replace("K", "C").replace("Q", "C").replace("Z", "S")
         .replace("ING", "NG").replace("IO", "IA"))
    out: list[int] = []
    while s:
        token = next((item for item in tokens if s.startswith(item[0])), None)
        if token is None:
            return None
        out.append(token[1])
        s = s[len(token[0]):]
    return out


def parse_source():
    src = loads(CORPUS.read_text(encoding="utf-8"))
    rune_map = {r: i for i, r in enumerate(src["runes"])}
    all_runes: list[int] = []
    spans: list[tuple[int, int]] = []
    word_start = 0
    for c in TRANSCRIPT.read_text(encoding="utf-8"):
        if len(all_runes) == 12956:
            break
        if c in rune_map:
            all_runes.append(rune_map[c])
        elif c not in "/%" and not c.isspace() and len(all_runes) > word_start:
            spans.append((word_start, len(all_runes)))
            word_start = len(all_runes)
    if word_start < len(all_runes):
        spans.append((word_start, len(all_runes)))
    assert len(all_runes) == 12956 and len(spans) == 2896
    assert all_runes == [x for p in src["pages"][:56] for x in p["indices"]]

    page = src["pages"][41]
    page_start = sum(len(p["indices"]) for p in src["pages"][:41])
    page_spans = [
        (a - page_start, b - page_start)
        for a, b in spans
        if a >= page_start and b <= page_start + len(page["indices"])
    ]
    assert len(page["indices"]) == 273 and len(page_spans) == 60
    assert all(page_spans[i - 1][1] == page_spans[i][0]
               for i in range(1, len(page_spans)))
    prefix = page["indices"][:page_spans[0][0]]
    suffix = page["indices"][page_spans[-1][1]:]
    body = [page["indices"][a:b] for a, b in page_spans]
    assert len(prefix) == 3 and len(suffix) == 5
    return src, prefix, body, suffix


def make_keys(method: str, size: int = 273) -> list[int]:
    rng = Random(PHONE_SEED)
    if method == "randrange29":
        return [rng.randrange(29) for _ in range(size)]
    if method == "bits5mod29":
        return [rng.getrandbits(5) % 29 for _ in range(size)]
    if method == "float29":
        return [int(rng.random() * 29) for _ in range(size)]
    raise ValueError(method)


def inverse_options(c: int, pointer: int, key: list[int], sign: str):
    if c == 0:
        yield 0, pointer  # plaintext F is transparent and consumes no key
    p = (c - key[pointer]) % 29 if sign == "plus" else (c + key[pointer]) % 29
    if p != 0:
        yield p, pointer + 1


def encrypt(plain: list[int], key: list[int], sign: str) -> list[int]:
    pointer = 0
    out: list[int] = []
    for p in plain:
        if p == 0:
            out.append(0)
        else:
            c = (p + key[pointer]) % 29 if sign == "plus" else (p - key[pointer]) % 29
            out.append(c)
            pointer += 1
    return out


def best_path(chunks, key: list[int], sign: str, lexicon: set[tuple[int, ...]]):
    # Each chunk is (runes, score_as_word). Prefix/suffix fragments are unscored.
    states: dict[int, tuple[int, list[int]]] = {0: (0, [])}
    processed = 0
    for ci, (cipher, score_word) in enumerate(chunks, 1):
        next_states: dict[int, tuple[int, list[int]]] = {}
        for pointer, (old_score, old_plain) in states.items():
            def visit(i: int, q: int, word_plain: list[int]) -> None:
                if i == len(cipher):
                    score = old_score + int(score_word and tuple(word_plain) in lexicon)
                    prior = next_states.get(q)
                    if prior is None or score > prior[0]:
                        next_states[q] = (score, old_plain + word_plain)
                    return
                for p, nq in inverse_options(cipher[i], q, key, sign):
                    visit(i + 1, nq, word_plain + [p])
            visit(0, pointer, [])
        processed += len(cipher)
        states = next_states
        if not states:
            return {"full": False, "first_dead_chunk": ci, "first_dead_rune": processed}

    score, plain = max(states.values(), key=lambda item: item[0])
    target = [x for cipher, _ in chunks for x in cipher]
    assert encrypt(plain, key, sign) == target, "inverse path failed exact forward replay"
    words = []
    at = 0
    for cipher, score_word in chunks:
        word = plain[at:at + len(cipher)]
        if score_word:
            words.append(word)
        at += len(cipher)
    counts = [plain.count(i) for i in range(29)]
    n = len(plain)
    ioc = sum(x * (x - 1) for x in counts) / (n * (n - 1))
    return {
        "full": True,
        "dictionary_hits": score,
        "word_count": len(words),
        "rune_count": n,
        "ioc": ioc,
        "final_state_count": len(states),
        "first_words": words[:12],
    }


def chunks_for(prefix, body, suffix):
    chunks = []
    if prefix:
        chunks.append((prefix, False))
    chunks.extend((w, True) for w in body)
    if suffix:
        chunks.append((suffix, False))
    return chunks


def main() -> None:
    src, prefix, body, suffix = parse_source()
    tokens = sorted(
        ((s, i) for i, s in enumerate(src["translit"])),
        key=lambda item: len(item[0]), reverse=True
    )
    lexicon: set[tuple[int, ...]] = set()
    by_length: dict[int, list[list[int]]] = {}
    for line in WORDLIST.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) != 2 or not parts[0].isalpha() or not parts[1].isdigit():
            continue
        word = gp(parts[0], tokens)
        if word is not None:
            lexicon.add(tuple(word))
            by_length.setdefault(len(word), []).append(word)

    original_chunks = chunks_for(prefix, body, suffix)
    results = []
    positive_controls = []
    for method in METHODS:
        key = make_keys(method)
        for sign in ("plus", "minus"):
            result = best_path(original_chunks, key, sign, lexicon)
            results.append({
                "seed": PHONE_SEED,
                "method": method,
                "sign": sign,
                **result
            })

            # Same p41 geometry, with planted native words and the same exact
            # key/clock, checks the inverse and F-bypass implementation.
            plant_words = [by_length[len(w)][0] for w in body]
            plant_plain = prefix + [x for w in plant_words for x in w] + suffix
            plant_cipher = encrypt(plant_plain, key, sign)
            cursor = len(prefix)
            cipher_chunks = []
            if prefix:
                cipher_chunks.append((plant_cipher[:cursor], False))
            for w in plant_words:
                cipher_chunks.append((plant_cipher[cursor:cursor + len(w)], True))
                cursor += len(w)
            if suffix:
                cipher_chunks.append((plant_cipher[cursor:], False))
            planted = best_path(cipher_chunks, key, sign, lexicon)
            assert planted["full"] and planted["dictionary_hits"] == len(body)
            positive_controls.append({
                "method": method,
                "sign": sign,
                "dictionary_hits": planted["dictionary_hits"],
                "word_count": planted["word_count"],
                "forward_replay": True
            })

    output = {
        "source": "canonical original p41, 273 runes, 60 words",
        "prefix_runes": len(prefix),
        "suffix_runes": len(suffix),
        "body_runes": sum(map(len, body)),
        "phone_seed_decimal": PHONE_SEED,
        "phone_seed_hex": hex(PHONE_SEED),
        "lexicon_size": len(lexicon),
        "key_methods": list(METHODS),
        "results": results,
        "synthetic_positive_controls": positive_controls,
        "interpretation": "A complete path is not by itself plaintext; inspect dictionary hits and exact replay."
    }
    print(dumps(output, sort_keys=True))


if __name__ == "__main__":
    main()
