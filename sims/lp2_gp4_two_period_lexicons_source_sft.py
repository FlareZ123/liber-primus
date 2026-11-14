"""SFT for Director #810: two pre-LP2 English lexicons, four prefix widths,
two distinct source-preserving word-start nulls, and known-plaintext controls.

2007 CMUdict v0.7a and January 2011 SCOWL Rev 7.1 are fixed before
observing unknown-page counts. Only already-authenticated original LP2
rune strings and word starts are scored. Prints JSON records; writes no files.

Python 3.11+, numpy. CI runner needs HTTPS access to public dictionary archives.
"""
from __future__ import annotations

from collections import defaultdict
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import random
import re
from urllib.request import Request, urlopen
from zipfile import ZipFile, is_zipfile

import numpy as np

from lp2_p32_home_english_prefix_familywise_sft import (
    DIGRAPHS, GP_FOLDS, LENGTHS, ROOT, emit, parse_pages
)

CMU2007 = "https://raw.githubusercontent.com/Alexir/CMUdict/master/cmudict.0.7a"
SCOWL2011 = "https://downloads.sourceforge.net/project/wordlist/SCOWL/Rev%207.1/scowl-7.1.zip"
DEBIAN2011 = "https://sources.debian.org/data/main/s/scowl/7.1-1/final/"
LEVELS = (10, 20, 35, 40, 50, 55, 60)
SCOWL_FILES = tuple(
    f"{language}-words.{level}"
    for language in ("english", "american") for level in LEVELS
)
REPLICATES = 1500
SEED = 3301810


def download(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": "LP2-archived-lexicon-study/1.0"})
    with urlopen(req, timeout=70) as response:
        return response.read()


def original_lexicons() -> dict[str, dict[str, object]]:
    cmu_bytes = download(CMU2007)
    assert len(cmu_bytes) > 3_000_000
    cmu_words = set()
    for line in cmu_bytes.decode("latin-1").splitlines():
        line = line.strip()
        if not line or line.startswith(";;;"):
            continue
        word = re.sub(r"\(\d+\)$", "", line.split()[0].upper())
        if re.fullmatch(r"[A-Z]+", word):
            cmu_words.add(word)

    archive_mode = "sourceforge-2011-zip"
    try:
        scowl_bytes = download(SCOWL2011)
        assert is_zipfile(BytesIO(scowl_bytes)), "Historical SCOWL response is not ZIP bytes"
        with ZipFile(BytesIO(scowl_bytes)) as z:
            entries = {
                Path(n).name: z.read(n)
                for n in z.namelist()
                if Path(n).name in SCOWL_FILES and "/final/" in n
            }
        assert len(entries) == len(SCOWL_FILES), (len(entries), sorted(entries))
        hashes = {"scowl-7.1.zip": sha256(scowl_bytes).hexdigest()}
    except (OSError, ValueError, AssertionError) as exc:
        # A concrete 2011 Debian source-package mirror is fixed in advance;
        # no substitution by a post-2014 wordlist is permitted.
        archive_mode = f"debian-source-scowl-7.1-1; sourceforge={type(exc).__name__}"
        entries = {name: download(DEBIAN2011 + name) for name in SCOWL_FILES}
        hashes = {}

    scowl_words = set()
    for name, blob in entries.items():
        hashes[name] = sha256(blob).hexdigest()
        scowl_words.update(
            w.upper()
            for w in blob.decode("latin-1").splitlines()
            if re.fullmatch(r"[A-Za-z]+", w)
        )
    assert len(cmu_words) > 100_000 and len(scowl_words) > 20_000, (
        len(cmu_words), len(scowl_words)
    )
    emit("original_lexicons_locked",
         historical_sources={
             "cmudict": {"year": 2007, "url": CMU2007,
                         "sha256": sha256(cmu_bytes).hexdigest(),
                         "words": len(cmu_words)},
             "scowl": {"year": 2011, "url": SCOWL2011,
                       "archive_mode": archive_mode,
                       "file_sha256": hashes,
                       "words": len(scowl_words),
                       "definition": "English+American word lists at fixed SCOWL levels 10,20,35,40,50,55,60; no proper names"}},
         rune_spelling="K,Q->C; V->U; Z->S; greedy TH NG EO OE AE IA EA")
    return {"cmu2007": {"words": cmu_words}, "scowl2011": {"words": scowl_words}}


def prefixes(words: set[str], tiles: list[str]) -> dict[int, set[tuple[int, ...]]]:
    index = {tile: i for i, tile in enumerate(tiles)}
    result = {k: set() for k in LENGTHS}
    for raw in words:
        raw = raw.translate(GP_FOLDS)
        encoded = []
        pos = 0
        while pos < len(raw):
            pair = raw[pos:pos + 2]
            if pair in DIGRAPHS:
                encoded.append(index[pair])
                pos += 2
            else:
                encoded.append(index[raw[pos]])
                pos += 1
        for k in LENGTHS:
            if len(encoded) >= k:
                result[k].add(tuple(encoded[:k]))
    return result


def scores(pages, words, lexicons):
    result = {}
    for name, pfx in lexicons.items():
        for k in LENGTHS:
            result[(name, k)] = sum(
                len(word[4]) >= k
                and tuple(pages[p][pos] for p, pos in word[4][:k]) in pfx[k]
                for word in words
            )
    return result


def global_phase_counts(pages, words, pfx, length):
    stream = np.array([sym for pg in pages for sym in pg], dtype=np.int16)
    n = len(stream)
    offsets = []
    total = 0
    for pg in pages:
        offsets.append(total)
        total += len(pg)
    starts = [offsets[p] + start for p, start, word_len, *_ in words
              if word_len >= length]
    mask = np.zeros(n, dtype=np.float64)
    mask[starts] = 1.0
    hits = np.fromiter(
        (int(tuple(int(stream[(pos + j) % n]) for j in range(length)) in pfx[length])
         for pos in range(n)),
        dtype=np.float64, count=n
    )
    counts = np.rint(
        np.fft.ifft(np.conj(np.fft.fft(mask)) * np.fft.fft(hits)).real
    ).astype(int)
    # Exact phase zero must match the genuine original printed start count.
    original = scores(pages, words, {"one": pfx})[("one", length)]
    assert counts[0] == original, (length, counts[0], original)
    return {
        "source": original, "eligible_starts": len(starts),
        "total_stream_hits": int(hits.sum()),
        "mean": round(float(counts.mean()), 5),
        "max": int(counts.max()),
        "ge": int(np.count_nonzero(counts >= original)),
        "exact_tail": round(float(np.mean(counts >= original)), 8),
    }


def solved_p57_control(raw, corpus, pfx):
    # P57 is source-clear GP29 prose, not a reconstructed unknown plaintext.
    text = raw.strip().split("%")[57]
    indices = {r: i for i, r in enumerate(corpus["runes"])}
    actual, words = [], []
    current = []

    def close():
        if current:
            words.append(tuple(current))
            current.clear()

    for char in text:
        if char in indices:
            i = indices[char]
            actual.append(i)
            current.append(i)
        elif char not in "/ \t\n\r":
            close()
    close()
    assert actual == corpus["pages"][57]["indices"] and len(actual) == 95
    controls = {}
    for name, dictionary in pfx.items():
        controls[name] = {}
        for k in LENGTHS:
            eligible = [w for w in words if len(w) >= k]
            hits = sum(w[:k] in dictionary[k] for w in eligible)
            controls[name][k] = {"correct_word_starts": hits,
                                 "eligible": len(eligible)}
    return controls


def main():
    corpus = json.loads((ROOT/"resources/liber-primus/lp2-corpus.json").read_text("utf8"))
    raw = (ROOT/"resources/liber-primus/lp2-transcription.txt").read_text("utf8")
    original_pages = [p for p in corpus["pages"] if p["page"] <= 55 and p["indices"]]
    pages, words, _ = parse_pages(raw, corpus["runes"], original_pages)
    assert len(pages) == 55 and len(words) == 2896
    assert sum(len(pg) for pg in pages) == 12956
    assert sum(word[5] != word[0] for word in words) == 32

    frozen = original_lexicons()
    pfx = {name: prefixes(item["words"], corpus["translit"])
           for name, item in frozen.items()}
    assert all(len(pfx[name][k]) > 100 for name in pfx for k in LENGTHS)
    emit("dictionary_prefix_inventory", sets={
        name: {k: len(pfx[name][k]) for k in LENGTHS} for name in pfx
    })
    native = solved_p57_control(raw, corpus, pfx)
    emit("clear_p57_original_GP_wordstart_control", result=native)

    actual = scores(pages, words, pfx)
    home = (8, 3, 19, 18)
    assert all(home in pfx[name][4] for name in pfx)
    # Deterministic word-start plant detects an actual unencrypted prefix
    # signal at untouched printed slots without inventing a cipher/key.
    plant = [list(page) for page in pages]
    locations = [rec[4] for rec in words if rec[2] >= 6][:25]
    for slots in locations:
        for (page, pos), value in zip(slots[:4], home):
            plant[page][pos] = value
    planted = scores(plant, words, pfx)
    assert all(planted[(name, 4)] >= actual[(name, 4)] + 15 for name in pfx)
    emit("positive_wordstart_plant", overwritten_words=len(locations),
         original={str(key):value for key,value in actual.items()},
         planted={str(key):value for key,value in planted.items()})

    exact = {
        f"{name}:k{k}": global_phase_counts(pages, words, dictionary, k)
        for name, dictionary in pfx.items() for k in LENGTHS
    }
    emit("exact_global_original_stream_phase", phases=12956,
         correction="Bonferroni 8 frozen lexicon-by-length tests",
         familywise_min_adjusted=min(1.0, 8 * min(v["exact_tail"] for v in exact.values())),
         results=exact)

    # Distinct conditional null: independently circularly rotate each intact
    # original physical page. The per-page circular high-order n-gram multiset
    # and original source word-start/length/boundary slots all remain fixed.
    rng = random.Random(SEED)
    keys = sorted(actual)
    observations = {key: [] for key in keys}
    for step in range(REPLICATES):
        rotated = []
        for page in pages:
            off = rng.randrange(len(page))
            rotated.append(page[off:] + page[:off])
        trial = scores(rotated, words, pfx)
        for key in keys:
            observations[key].append(trial[key])
        if step == 0:
            assert len(rotated) == 55 and sum(map(len, rotated)) == 12956
    random_result = {}
    for name, length in keys:
        vals = np.array(observations[(name, length)], dtype=np.int16)
        score = actual[(name, length)]
        ge = int(np.count_nonzero(vals >= score))
        random_result[f"{name}:k{length}"] = {
            "source": score, "mean": round(float(vals.mean()), 5),
            "min": int(vals.min()), "max": int(vals.max()),
            "ge": ge, "reps": REPLICATES,
            "tail_plus_one": round((ge+1)/(REPLICATES+1), 8)
        }
    emit("independent_page_rotation_null", reps=REPLICATES, seed=SEED,
         holds="each page's full circular n-gram multiset, original page length, all 2896 word boundaries and 32 page-spanning words",
         changes="page cut-point and up to 2 boundary crossing n-grams",
         correction="Bonferroni 8 frozen lexicon-by-length tests",
         familywise_min_adjusted=min(1.0, 8*min(
             v["tail_plus_one"] for v in random_result.values())),
         results=random_result)
    emit("limit", caveat="Period lexicons alone do not select cipher operation or unknown plaintext; exact global phase changes source page-boundary alignment; page rotations alter source first/last rune. Familywise correction applies to the predeclared two lexicons times 4 widths only.",
         recovered_unknown_GP29_plaintext=0)


if __name__ == "__main__":
    main()
