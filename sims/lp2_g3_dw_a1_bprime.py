#!/usr/bin/env python3
"""Bounded b' inverse test for the frozen R38 G3 dw/prime/M29/self/A1 row.

The decoder receives only rune ciphertext, sentence-local multisets of printed
word lengths, page bounds, and the frozen GP/quadgram tables. It does not
receive plant plaintext or true word order. The plant harness is imported from
a pinned Dukotah research snapshot so the b' generator and LP2 layout are
reproducible.
"""
from __future__ import annotations

import argparse
import collections
import json
import random
import sys
from pathlib import Path

CELL = ("dw", "prime", 29, "self", "A1")
CONVS = ("C0", "CS", "CE")
SIGNS = (-1, 1)
COMBOS = ((0, "C0"), (1, "C0"), (1, "CS"), (1, "CE"),
          (2, "C0"), (2, "CS"), (2, "CE"))


def add_duko_paths(duko_root: Path):
    analysis = duko_root / "liber-primus" / "analysis"
    paths = [
        duko_root / "challenges",
        duko_root / "liber-primus" / "src",
        analysis / "round46" / "L1-word-loader",
        analysis / "round10b" / "B6-non-english-plaintext",
        analysis / "campaign18_skip",
    ]
    for p in paths:
        if not p.exists():
            raise FileNotFoundError(p)
        sys.path.insert(0, str(p))


def load_modules():
    from types import SimpleNamespace
    import l1lib as G
    import words as W
    import _heavy as H
    from lp import gematria as gp
    import skipdecode as sk
    return SimpleNamespace(G=G, W=W, H=H, gp=gp, sk=sk)


def page_bounds(starts, n):
    starts = list(starts)
    if not starts or starts[0] != 0:
        raise ValueError(f"invalid page starts: {starts[:5]}")
    return list(zip(starts, starts[1:] + [n]))


def segments(words, bounds, page, conv):
    lo, hi = bounds[page]
    out = []
    for wi, w in enumerate(words):
        s = int(w["start"])
        e = s + int(w["len"])
        if conv == "C0":
            a, b = max(s, lo), min(e, hi)
            if a < b:
                out.append((a, b - a, int(w["sent"]), wi))
        elif conv == "CS":
            if lo <= s < hi:
                out.append((s, int(w["len"]), int(w["sent"]), wi))
        elif conv == "CE":
            if lo < e <= hi:
                out.append((s, int(w["len"]), int(w["sent"]), wi))
        else:
            raise ValueError(conv)
    return out


def sentence_multisets(segs):
    by_sent = collections.OrderedDict()
    for start, length, sent, wi in segs:
        by_sent.setdefault(sent, []).append(length)
    return [sorted(v) for v in by_sent.values()]


def segment_lengths(segs):
    return [int(x[1]) for x in segs]


def contiguous_span(segs):
    if not segs:
        return None
    for a, b in zip(segs, segs[1:]):
        if a[0] + a[1] != b[0]:
            return None
    return segs[0][0], segs[-1][0] + segs[-1][1]


def g3_encrypt(plain, lengths, sign, primes):
    out = []
    pos = 0
    prev = 0
    for length in lengths:
        word = plain[pos:pos + length]
        if len(word) != length:
            raise ValueError("word lengths exceed plaintext")
        shift = (sign * (prev % 29)) % 29
        out.extend((int(x) + shift) % 29 for x in word)
        prev = sum(primes[int(x)] for x in word) % 29
        pos += length
    if pos != len(plain):
        raise ValueError(f"length sum {pos} != plaintext size {len(plain)}")
    return out


def score_norm(st):
    return st["score"] / st["ngrams"] if st["ngrams"] else -1e9


def extend_lm(st, word_runes, trans, Q):
    letters = st["tail"] + "".join(trans[int(x)] for x in word_runes)
    add = 0.0
    nadd = 0
    # tail has at most three letters, so every quadgram here contains
    # at least one newly decoded letter.
    for i in range(max(0, len(letters) - 3)):
        add += Q.d.get(letters[i:i + 4], Q.floor)
        nadd += 1
    return st["score"] + add, st["ngrams"] + nadd, letters[-3:]


def beam_decode(cipher, groups, offset, sign, beam_width, primes, trans, Q):
    total = sum(sum(g) for g in groups)
    if offset < 0 or offset + total > len(cipher):
        return None
    beam = [{
        "score": 0.0, "ngrams": 0, "prev": 0, "tail": "",
        "out": (), "lengths": ()
    }]
    pos0 = offset

    for group in groups:
        slen = sum(group)
        rem0 = tuple(sorted(collections.Counter(group).items()))
        buckets = [dict() for _ in range(slen + 1)]

        for st in beam:
            key = (st["prev"], rem0, st["tail"], st["ngrams"])
            buckets[0][key] = {**st, "rem": rem0}

        for pos in range(slen):
            states = sorted(buckets[pos].values(), key=score_norm, reverse=True)[:beam_width]
            if not states:
                continue
            for st in states:
                for length, count in st["rem"]:
                    if count <= 0 or pos + length > slen:
                        continue
                    shift = (sign * st["prev"]) % 29
                    dec = tuple((int(cipher[pos0 + pos + j]) - shift) % 29
                                for j in range(length))
                    new_prev = sum(primes[x] for x in dec) % 29
                    new_score, new_ngrams, new_tail = extend_lm(st, dec, trans, Q)
                    new_rem = tuple(
                        (l, c - (1 if l == length else 0))
                        for l, c in st["rem"]
                        if c - (1 if l == length else 0) > 0
                    )
                    ns = {
                        "score": new_score, "ngrams": new_ngrams,
                        "prev": new_prev, "tail": new_tail,
                        "out": st["out"] + dec,
                        "lengths": st["lengths"] + (length,),
                        "rem": new_rem
                    }
                    key = (new_prev, new_rem, new_tail, new_ngrams)
                    old = buckets[pos + length].get(key)
                    if old is None or score_norm(ns) > score_norm(old):
                        buckets[pos + length][key] = ns

        finals = [x for x in buckets[slen].values() if not x["rem"]]
        if not finals:
            return None
        beam = sorted(finals, key=score_norm, reverse=True)[:beam_width]
        pos0 += slen

    if not beam:
        return None
    return max(beam, key=score_norm)


def candidate_offsets(lo, conv, max_len, total, n):
    if conv == "C0":
        candidates = [lo]
    elif conv == "CS":
        candidates = range(lo, lo + max_len + 1)
    elif conv == "CE":
        candidates = range(max(0, lo - max_len), lo + 1)
    else:
        raise ValueError(conv)
    return [x for x in candidates if 0 <= x and x + total <= n]


def format_plain(out, lengths, groups, trans):
    p = 0
    wi = 0
    sentences = []
    for group in groups:
        words = []
        for _ in group:
            length = lengths[wi]
            words.append("".join(trans[int(x)] for x in out[p:p + length]))
            p += length
            wi += 1
        sentences.append(" ".join(words))
    return ". ".join(sentences)


def make_parsed_plant(A, P, lengths):
    W, G = A.W, A.G
    rendered = W.render(P.flat, lengths, P.sent_ends, G.LINE_STARTS, G.PAGE_STARTS)
    return W.parse(rendered)


def encrypt_plant_stream(A, P, Qtrue, bounds, conv, sign, primes):
    cipher = [None] * len(P.flat)
    coverage = [0] * len(P.flat)
    for page in range(len(bounds)):
        segs = segments(Qtrue.words, bounds, page, conv)
        if not segs:
            continue
        span = contiguous_span(segs)
        if span is None:
            raise ValueError(f"non-contiguous true page unit page={page} conv={conv}")
        u0, uend = span
        lengths = segment_lengths(segs)
        plain = list(P.flat[u0:uend])
        enc = g3_encrypt(plain, lengths, sign, primes)
        for i, value in enumerate(enc, start=u0):
            cipher[i] = value
            coverage[i] += 1
    return cipher, coverage


def decode_page(cipher, segs_printed, lo, conv, max_len, beam_width, primes, trans, Q):
    groups = sentence_multisets(segs_printed)
    if not groups:
        return groups, []
    total = sum(sum(g) for g in groups)
    offsets = candidate_offsets(lo, conv, max_len, total, len(cipher))
    results = []
    for sign in SIGNS:
        for offset in offsets:
            if any(x is None for x in cipher[offset:offset + total]):
                continue
            r = beam_decode(cipher, groups, offset, sign, beam_width, primes, trans, Q)
            if r is not None:
                results.append({**r, "sign": sign, "offset": offset})
    return groups, sorted(results, key=score_norm, reverse=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--duko", required=True)
    ap.add_argument("--plants", type=int, default=20)
    ap.add_argument("--beam", type=int, default=400)
    ap.add_argument("--seed", type=int, default=2964)
    ap.add_argument("--outdir", default="im-results")
    args = ap.parse_args()

    add_duko_paths(Path(args.duko).resolve())
    A = load_modules()
    W, G = A.W, A.G
    primes = list(A.gp.PRIMES)
    trans = [A.sk.idx_to_trans([i]) for i in range(29)]
    Q = A.H.Q

    if len(primes) != 29 or len(trans) != 29:
        raise RuntimeError("unexpected GP alphabet/prime table size")
    if len(G.PAGE_STARTS) < 3:
        raise RuntimeError("Duko layout has fewer than three pages")

    corrected_path = Path("resources/transcriptions/lp2-image-corrected.txt")
    corrected_text = corrected_path.read_text(encoding="utf-8")
    Qorig = W.parse(corrected_text)
    original = list(Qorig.runes)
    orig_bounds = page_bounds(Qorig.page_starts, len(original))
    duko_lp = W.lp2()
    layout_match = (list(Qorig.page_starts) == list(duko_lp.page_starts)
                    and original == list(duko_lp.runes))

    # Verify the direct word-state recurrence round-trips with true boundaries.
    smoke_plain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    smoke_lens = [3, 4, 5]
    smoke_sign = -1
    smoke_cipher = g3_encrypt(smoke_plain, smoke_lens, smoke_sign, primes)
    recovered = []
    pos = 0
    prev = 0
    for length in smoke_lens:
        word = [(smoke_cipher[pos + j] - smoke_sign * prev) % 29
                for j in range(length)]
        recovered.extend(word)
        prev = sum(primes[x] for x in word) % 29
        pos += length
    if recovered != smoke_plain:
        raise RuntimeError("G3 direct word-state roundtrip failed")

    # Twenty independent b' plants distributed over p0-p2 and the published
    # page-fragment conventions. The decoder sees only printed sentence
    # multisets; true order/plaintext are evaluation-only.
    plant_rows = []
    combo_schedule = [COMBOS[i % len(COMBOS)] for i in range(args.plants)]
    for i, (page, conv) in enumerate(combo_schedule):
        seed = args.seed * 10000 + i
        rng = random.Random(seed)
        P = G.make_plant("bp", rng)
        Qtrue = make_parsed_plant(A, P, P.true_lens)
        Qprint = make_parsed_plant(A, P, P.printed_lens)
        bounds = page_bounds(Qtrue.page_starts, len(P.flat))
        if list(Qprint.page_starts) != list(Qtrue.page_starts):
            raise RuntimeError("b' plant altered page starts")
        true_segs = segments(Qtrue.words, bounds, page, conv)
        print_segs = segments(Qprint.words, bounds, page, conv)
        span = contiguous_span(true_segs)
        if span is None or not print_segs:
            plant_rows.append({"i": i, "seed": seed, "page": page, "conv": conv,
                               "status": "invalid-unit"})
            continue
        u0, uend = span
        true_lengths = segment_lengths(true_segs)
        true_plain = list(P.flat[u0:uend])
        true_groups = sentence_multisets(true_segs)
        printed_groups = sentence_multisets(print_segs)
        true_sign = random.Random(seed ^ 0x5A5A5A5A).choice(SIGNS)
        cipher, coverage = encrypt_plant_stream(A, P, Qtrue, bounds, conv,
                                                true_sign, primes)
        lo, hi = bounds[page]
        groups_match = (len(true_groups) == len(printed_groups)
                        and [sorted(x) for x in true_groups] == printed_groups)
        total_match = sum(sum(g) for g in printed_groups) == len(true_plain)
        max_len = max((int(w["len"]) for w in Qprint.words), default=1)
        groups, candidates = decode_page(
            cipher, print_segs, lo, conv, max_len, args.beam, primes, trans, Q
        )
        best = candidates[0] if candidates else None
        exact = bool(best and best["sign"] == true_sign
                     and best["offset"] == u0
                     and list(best["out"]) == true_plain
                     and list(best["lengths"]) == true_lengths)
        wrong_exact = any(c["sign"] != true_sign
                          and list(c["out"]) == true_plain
                          and list(c["lengths"]) == true_lengths
                          for c in candidates)
        plant_rows.append({
            "i": i, "seed": seed, "page": page, "conv": conv,
            "true_sign": true_sign, "true_offset": u0,
            "best_sign": best["sign"] if best else None,
            "best_offset": best["offset"] if best else None,
            "best_score": score_norm(best) if best else None,
            "exact_plaintext_and_boundaries": exact,
            "wrong_sign_exact_null": wrong_exact,
            "groups_match": groups_match, "total_match": total_match,
            "true_runes": len(true_plain), "true_words": len(true_lengths),
            "printed_groups": printed_groups, "true_lengths": true_lengths,
            "best_lengths": list(best["lengths"]) if best else None,
            "coverage_ok": all(x == 1 for x in coverage[u0:uend]),
        })

    # Apply the same frozen receiver to corrected original ciphertext p0-p2.
    original_rows = []
    for page in range(3):
        for conv in CONVS:
            segs = segments(Qorig.words, orig_bounds, page, conv)
            if not segs:
                original_rows.append({"page": page, "conv": conv, "status": "empty"})
                continue
            span = contiguous_span(segs)
            if span is None:
                original_rows.append({"page": page, "conv": conv, "status": "non-contiguous"})
                continue
            lo, hi = orig_bounds[page]
            groups = sentence_multisets(segs)
            total = sum(sum(g) for g in groups)
            max_len = max((int(w["len"]) for w in Qorig.words), default=1)
            offsets = candidate_offsets(lo, conv, max_len, total, len(original))
            candidates = []
            for sign in SIGNS:
                for offset in offsets:
                    r = beam_decode(original, groups, offset, sign, args.beam,
                                    primes, trans, Q)
                    if r is not None:
                        candidates.append({**r, "sign": sign, "offset": offset})
            candidates.sort(key=score_norm, reverse=True)
            best = candidates[0] if candidates else None
            wrong = [c for c in candidates if best and c["sign"] != best["sign"]]
            original_rows.append({
                "page": page, "conv": conv, "status": "decoded" if best else "no-candidate",
                "lo": lo, "hi": hi, "total_runes": total,
                "sentence_word_counts": [len(g) for g in groups],
                "best_sign": best["sign"] if best else None,
                "best_offset": best["offset"] if best else None,
                "best_score": score_norm(best) if best else None,
                "opposite_sign_score": score_norm(wrong[0]) if wrong else None,
                "best_lengths": list(best["lengths"]) if best else None,
                "best_text": format_plain(best["out"], best["lengths"], groups, trans) if best else None,
            })

    plant_success = sum(bool(x.get("exact_plaintext_and_boundaries")) for x in plant_rows)
    wrong_nulls = sum(bool(x.get("wrong_sign_exact_null")) for x in plant_rows)
    groups_match_n = sum(bool(x.get("groups_match")) for x in plant_rows)
    valid_n = sum(x.get("status") != "invalid-unit" for x in plant_rows)

    result = {
        "cell": CELL, "beam_width": args.beam, "seed": args.seed,
        "plants_requested": args.plants, "plants_valid": valid_n,
        "plant_exact_successes": plant_success,
        "plant_exact_rate": plant_success / max(1, valid_n),
        "plant_group_multiset_matches": groups_match_n,
        "wrong_sign_exact_nulls": wrong_nulls,
        "corrected_vs_pinned_Duko_layout_match": layout_match,
        "original_runes": len(original),
        "plant_rows": plant_rows, "original_rows": original_rows,
        "source_selector_assessment": (
            "The signed 2016 wording (words/map, meaning/road, numbers/direction) "
            "supports a word-and-number navigation hypothesis, but does not uniquely "
            "select previous-word GP prime-sum mod 29, A1 constant shift, sign, or "
            "page reset. Treat the exact G3 row as a bounded hypothesis, not an "
            "established Cicada mechanism."
        )
    }

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    json_path = outdir / "lp2-g3-dw-a1-bprime.json"
    json_path.write_text(json.dumps(result, indent=2), encoding="utf-8")

    md = [
        "# G3 dw/prime/M29/self/A1 under b' length-order permutation", "",
        "## Decision frame", "",
        "This is a bounded test of the exact archived R38 row. The signed 2016 wording",
        "connects Liber Primus words, meaning, and numbers, but does not uniquely",
        "specify this formula. No neighbouring rows, lags, moduli, A2/A3 modes, or",
        "page scopes were searched.", "",
        "## Frozen mechanism", "",
        "- Cell: **dw/prime/M29/self/A1**",
        "- Initial previous-word value: 0 at each page-unit start",
        "- For each word, shift every rune by sign times the previous decoded word's GP-prime sum mod 29",
        "- Update the state to the current decoded word's GP-prime sum mod 29",
        "- Only the order of lengths within each sentence is hidden; the decoder receives sentence-local length multisets",
        f"- Beam width: **{args.beam}**; signs -1/+1; offset range bounded by the published page-fragment convention and printed maximum word length",
        "",
        "## Synthetic b' plant gate", "",
        f"- Independent plants: **{valid_n}/{args.plants}**",
        f"- Exact plaintext + boundaries + sign + offset recovered: **{plant_success}/{valid_n}**",
        f"- Sentence-local length multisets matched true page-unit groups: **{groups_match_n}/{valid_n}**",
        f"- Wrong-sign exact recoveries: **{wrong_nulls}**", "",
        "| i | page | convention | true sign/offset | best sign/offset | exact | groups match | score |",
        "|---:|---:|:---:|:---:|:---:|:---:|:---:|---:|"
    ]
    for x in plant_rows:
        md.append("| {i} | {page} | {conv} | {ts}/{to} | {bs}/{bo} | {ex} | {gm} | {sc} |".format(
            i=x.get("i"), page=x.get("page"), conv=x.get("conv"),
            ts=x.get("true_sign"), to=x.get("true_offset"),
            bs=x.get("best_sign"), bo=x.get("best_offset"),
            ex=x.get("exact_plaintext_and_boundaries"),
            gm=x.get("groups_match"),
            sc=round(x["best_score"], 4) if x.get("best_score") is not None else "—"
        ))
    md += [
        "", "## Original corrected ciphertext p0-p2", "",
        f"Corrected transcription rune count: **{len(original)}**. Pinned Duko layout/rune-stream match: **{layout_match}**.",
        "", "| page | convention | best sign | offset | quadgram score | opposite-sign score | candidate |",
        "|---:|:---:|---:|---:|---:|---:|---|"
    ]
    for x in original_rows:
        md.append("| {p} | {c} | {s} | {o} | {sc} | {ws} | {txt} |".format(
            p=x.get("page"), c=x.get("conv"), s=x.get("best_sign"), o=x.get("best_offset"),
            sc=round(x["best_score"], 4) if x.get("best_score") is not None else "—",
            ws=round(x["opposite_sign_score"], 4) if x.get("opposite_sign_score") is not None else "—",
            txt=(x.get("best_text") or x.get("status") or "—").replace("|", "/")
        ))
    md += [
        "", "## Interpretation", "",
        "Synthetic success is necessary but not sufficient: it only shows that the",
        "decoder can invert the planted mechanism when its assumptions are true.",
        "The original application is meaningful only if its best candidate is",
        "coherent English, wins against the wrong-sign null, and does not depend on",
        "an unsupported page-offset choice. The 2016 wording is not a unique key",
        "selector. If the plants fail, or original p0-p2 remain non-linguistic,",
        "retire this exact row without extending the family.", "",
        "## Reproduction", "",
        "Run .github/workflows/agent1-g3-dw-a1-bprime-manual.yml at the pinned",
        "Dukotah commit. Machine-readable per-plant and per-page results are in",
        "lp2-g3-dw-a1-bprime.json.", ""
    ]
    md_path = outdir / "lp2-g3-dw-a1-bprime.md"
    md_path.write_text("\n".join(md), encoding="utf-8")

    print(json.dumps({
        "plants_valid": valid_n, "plant_successes": plant_success,
        "plant_rate": plant_success / max(1, valid_n),
        "groups_match": groups_match_n, "wrong_sign_exact_nulls": wrong_nulls,
        "layout_match": layout_match, "original": original_rows,
        "json": str(json_path), "markdown": str(md_path)
    }, indent=2))


if __name__ == "__main__":
    main()
