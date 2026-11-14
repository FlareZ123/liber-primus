"""Exact first-order-transition-preserving word-prefix null for original LP2.

Run with Python 3.12 and cmudict==1.1.3. No network or write operations.
Randomized Euler-trail surrogates preserve every page's 29x29 directed
bigram-count matrix, page length, first/last rune, word slots, and punctuation.
The random-outgoing-edge Euler sampler is not claimed to be exactly uniform
over the entire Markov type class; outcomes are descriptive Monte Carlo.
"""
import collections
import hashlib
import json
import random
import re
from pathlib import Path

import cmudict

ROOT = Path(__file__).resolve().parents[1]
SEED = 0x9C129A93
REPS = 10000
PLANT_REPS = 1000
LENGTHS = (4, 5, 6)
FOLDS = str.maketrans({"K": "C", "Q": "C", "V": "U", "Z": "S"})
DIGRAPHS = {"TH", "NG", "EO", "OE", "AE", "IA", "EA"}
HOME = (8, 3, 19, 18)


def emit(event, **data):
    print(json.dumps({"event": event, **data}, sort_keys=True), flush=True)


def lexicon(tiles):
    lookup = {token: i for i, token in enumerate(tiles)}
    prefixes = {k: set() for k in LENGTHS}
    source = sorted(set(w.upper() for w in cmudict.words()
                        if re.fullmatch(r"[A-Za-z]+", w)))
    for source_word in source:
        word = source_word.translate(FOLDS)
        symbols = []
        i = 0
        while i < len(word):
            token = word[i:i + 2]
            if token in DIGRAPHS:
                symbols.append(lookup[token])
                i += 2
            else:
                symbols.append(lookup[word[i]])
                i += 1
        for length in LENGTHS:
            if len(symbols) >= length:
                prefixes[length].add(tuple(symbols[:length]))
    assert HOME in prefixes[4]
    return prefixes, len(source), hashlib.sha256(
        "\n".join(source).encode("utf-8")).hexdigest()


def parse_source():
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json")
                        .read_text(encoding="utf-8"))
    segments = (ROOT / "resources/liber-primus/lp2-transcription.txt"
                ).read_text(encoding="utf-8").strip().split("%")[:55]
    source_pages = [p for p in corpus["pages"]
                    if p["page"] <= 55 and p["indices"]]
    assert len(segments) == len(source_pages) == 55
    lookup = {char: i for i, char in enumerate(corpus["runes"])}
    records = []
    slots = []
    after_period = False
    current_after = False
    stops = 0

    def flush():
        nonlocal slots
        if slots:
            records.append((tuple(slots), current_after))
            slots = []

    for page_index, segment in enumerate(segments):
        observed = []
        for ch in segment:
            if ch in lookup:
                if not slots:
                    current_after = after_period
                    after_period = False
                slots.append((page_index, len(observed)))
                observed.append(lookup[ch])
            elif ch in "/ \n\r\t":
                continue
            else:
                flush()
                if ch == ".":
                    stops += 1
                    after_period = True
        assert observed == source_pages[page_index]["indices"]
    flush()
    assert len(records) == 2896
    assert stops == 175
    assert sum(len(slots) - 1 for slots, _ in records) == 10060
    assert sum(slots[0][0] != slots[-1][0] for slots, _ in records) == 32
    assert sum(sum(a == b for a, b in zip(
        p["indices"], p["indices"][1:])) for p in source_pages) == 86
    return corpus, [p["indices"] for p in source_pages], records


def census(pages, words, prefixes, hits=False):
    output = {label: 0 for length in LENGTHS
              for label in ("all" + str(length), "post" + str(length))}
    found = []
    for slots, after in words:
        available = min(len(slots), max(LENGTHS))
        first = tuple(pages[page][index] for page, index in slots[:available])
        for length in LENGTHS:
            if len(slots) >= length and first[:length] in prefixes[length]:
                output["all" + str(length)] += 1
                if after:
                    output["post" + str(length)] += 1
                if hits:
                    found.append({
                        "physical_page": (slots[0][0] if slots[0][0] < 50
                                          else slots[0][0] + 1),
                        "source_offset": slots[0][1],
                        "word_length": len(slots),
                        "gp_prefix": first[:length],
                        "after_period": after,
                        "prefix_length": length,
                    })
    return output, found


def directed_pairs(seq):
    counts = [[0] * 29 for _ in range(29)]
    for a, b in zip(seq, seq[1:]):
        counts[a][b] += 1
    return counts


def euler_surrogate(seq, rng):
    """Reassemble precisely the original directed edges in random outgoing order."""
    outgoing = [[] for _ in range(29)]
    for a, b in zip(seq, seq[1:]):
        outgoing[a].append(b)
    for edges in outgoing:
        rng.shuffle(edges)
    stack = [seq[0]]
    result = []
    while stack:
        symbol = stack[-1]
        if outgoing[symbol]:
            stack.append(outgoing[symbol].pop())
        else:
            result.append(stack.pop())
    result.reverse()
    assert len(result) == len(seq)
    return result


def simulate(original_pages, words, prefixes, repetitions, seed,
             check_matrix=True):
    rng = random.Random(seed)
    reference, _ = census(original_pages, words, prefixes)
    names = list(reference)
    ge = collections.Counter()
    moments = {name: [0, 0, 10**9, -1] for name in names}
    distributions = {name: collections.Counter() for name in names}
    source_edges = [directed_pairs(p) for p in original_pages]
    for trial in range(repetitions):
        shuffled = [euler_surrogate(p, rng) for p in original_pages]
        if check_matrix and trial < 3:
            for a, b, expected in zip(original_pages, shuffled, source_edges):
                assert b[0] == a[0] and b[-1] == a[-1]
                assert directed_pairs(b) == expected
        sample, _ = census(shuffled, words, prefixes)
        for name in names:
            value = sample[name]
            distributions[name][value] += 1
            ge[name] += value >= reference[name]
            moments[name][0] += value
            moments[name][1] += value * value
            moments[name][2] = min(moments[name][2], value)
            moments[name][3] = max(moments[name][3], value)
    summary = {}
    for name in names:
        s, s2, smallest, largest = moments[name]
        mean = s / repetitions
        summary[name] = {
            "observed": reference[name], "null_mean": mean,
            "null_sd": max(0, s2 / repetitions - mean * mean) ** 0.5,
            "min": smallest, "max": largest,
            "null_ge": ge[name],
            "montecarlo_upper_tail": (ge[name] + 1) / (repetitions + 1),
            "histogram": dict(sorted(distributions[name].items())),
        }
    return summary


def main():
    corpus, pages, records = parse_source()
    prefixes, nwords, checksum = lexicon(corpus["translit"])
    original, hits = census(pages, records, prefixes, hits=True)
    assert original["all4"] == 68 and original["post4"] == 6
    assert len(hits) >= 68
    emit("source", pages=len(pages), total_runes=sum(map(len, pages)),
         printed_words=len(records), seed=SEED, replicates=REPS,
         source="canonical original LP2 indices and printed word boundaries",
         euler_null="exact full 29x29 within-page rune bigram matrix; fixed first/last rune",
         dictionary="cmudict 1.1.3", dictionary_words=nwords,
         dictionary_sha256=checksum,
         prefix_counts={str(k): len(prefixes[k]) for k in LENGTHS})
    emit("original", counts=original, hits=hits)
    surrogate = simulate(pages, records, prefixes, REPS, SEED)
    emit("original_euler_surrogates", summary=surrogate)

    # Frozen positive: twelve post-stop 4-rune HOME implants, same punctuation.
    planted = [list(seq) for seq in pages]
    eligible = [(slots, after) for slots, after in records
                if after and len(slots) >= 4]
    assert len(eligible) >= 12
    for slots, _ in eligible[:12]:
        for (page, offset), rune in zip(slots[:4], HOME):
            planted[page][offset] = rune
    planted_summary, _ = census(planted, records, prefixes)
    assert planted_summary["post4"] >= original["post4"] + 10
    power = simulate(planted, records, prefixes, PLANT_REPS,
                     SEED ^ 0x50117, check_matrix=True)
    emit("marker_positive", planted_post4=planted_summary["post4"],
         original_post4=original["post4"], surrogate=power["post4"],
         inserted_post_period_home=12, reps=PLANT_REPS)
    emit("pass", message="Source, transitions, dictionary and positive controls verified")


if __name__ == "__main__":
    main()
