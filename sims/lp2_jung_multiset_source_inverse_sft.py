"""Same-title Jung Liber Primus inverse: original whole-word length multisets.

Instead of demanding source words appear in original printed order, this test
recovers a hypothetical original source passage despite any permutation of
whole words within an illustrated chapter. No secret keyword, cipher language,
font spelling, page or source offset may be fitted from original outcomes.

Read-only Windows Python 3.12 SFT. Source PDF fetched into memory, SHA-256
authenticated, and the exact source-title body selected by source headings;
no source PDF or source prose is written to the repository.
"""
from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from hashlib import sha256
import json
from random import Random

import lp2_jung_liberprimus_section_address_sft as jung
import lp2_jung_liberprimus_wordlength_source_sft as source_lengths

# These nine boundaries are selected by original illustrations.
CHAPTER_CUTS = (0, 3, 8, 15, 23, 27, 33, 40, 54, 56)
BINS = 18


@dataclass(frozen=True)
class Match:
    replacement_count: int
    source_word_offset: int
    exact_windows: int
    target_word_count: int


def min_multiset_distance(source: Sequence[int], wanted: Sequence[int]) -> Match:
    """Half-L1 histogram distance across ALL fixed-length contiguous windows.

    This is the minimum number of changed word lengths necessary for the
    source passage's multiset to match an original page or chapter exactly.
    The source and target both use length 17 for all longer words.
    """
    window = len(wanted)
    if window > len(source):
        return Match(window, -1, 0, window)
    want_counts = [0] * BINS
    have_counts = [0] * BINS
    for n in wanted:
        want_counts[min(n, 17)] += 1
    for n in source[:window]:
        have_counts[min(n, 17)] += 1
    distance = sum(abs(a - b) for a, b in zip(want_counts, have_counts))
    lowest = distance
    best_offset = 0
    exact_windows = int(distance == 0)
    for start in range(1, len(source) - window + 1):
        out = min(source[start-1], 17)
        incoming = min(source[start+window-1], 17)
        if out != incoming:
            distance -= abs(want_counts[out] - have_counts[out])
            have_counts[out] -= 1
            distance += abs(want_counts[out] - have_counts[out])
            distance -= abs(want_counts[incoming] - have_counts[incoming])
            have_counts[incoming] += 1
            distance += abs(want_counts[incoming] - have_counts[incoming])
        if distance < lowest:
            lowest, best_offset = distance, start
        if distance == 0:
            exact_windows += 1
    assert lowest % 2 == 0
    return Match(lowest // 2, best_offset, exact_windows, window)


def target_segments() -> tuple[list[dict], list[dict]]:
    original, physical = source_lengths.original_words()
    assert len(original) == len(physical) == 2896
    assert sum(original) == 12956
    page_numbers = [p for p in range(56) if p != 50]
    page_lengths = {
        p:[min(n,17) for n,q in zip(original,physical) if q==p]
        for p in page_numbers
    }
    page_windows = []
    for start in range(55):
        for span in range(1,4):
            if start+span > 55:
                continue
            indices = page_numbers[start:start+span]
            page_windows.append({
                "physical":indices,
                "lengths":[l for p in indices for l in page_lengths[p]],
                "span":span
            })
    assert len(page_windows) == 162
    chapters = []
    for index,(begin,end) in enumerate(zip(CHAPTER_CUTS,CHAPTER_CUTS[1:])):
        lengths = [min(n,17) for n,p in zip(original,physical)
                   if begin <= p < end]
        chapters.append({"chapter":index, "physical":[begin,end-1], "lengths":lengths})
    assert [len(c["lengths"]) for c in chapters] == [
        158,255,383,437,224,326,378,669,66
    ]
    return page_windows,chapters


def evaluate(label: str, source: list[int], pages: list[dict],
             chapters: list[dict]) -> dict:
    allbook=[w for chapter in chapters for w in chapter["lengths"]]
    assert len(allbook)==2896
    wholebook=min_multiset_distance(source,allbook)
    rows = []
    for entry in pages:
        hit = min_multiset_distance(source,entry["lengths"])
        rows.append({
            "start":entry["physical"][0],
            "end":entry["physical"][-1],
            "span":entry["span"],
            "min_changed":hit.replacement_count,
            "source_offset":hit.source_word_offset,
            "exact_windows":hit.exact_windows,
            "target_words":hit.target_word_count
        })
    chapter_rows = []
    for entry in chapters:
        hit = min_multiset_distance(source,entry["lengths"])
        chapter_rows.append({
            "chapter":entry["chapter"],
            "physical":entry["physical"],
            "min_changed":hit.replacement_count,
            "source_offset":hit.source_word_offset,
            "exact_windows":hit.exact_windows,
            "target_words":hit.target_word_count
        })
    return {
        "scheme":label,
        "source_words":len(source),
        "whole_book_multiset":{
            "source_word_offset":wholebook.source_word_offset,
            "min_changed":wholebook.replacement_count,
            "exact_windows":wholebook.exact_windows,
            "target_words":wholebook.target_word_count
        },
        "exact_by_page_span":{
            str(span):sum(r["exact_windows"] for r in rows if r["span"]==span)
            for span in (1,2,3)
        },
        "exact_whole_chapter_windows":sum(r["exact_windows"] for r in chapter_rows),
        "best_by_page_span":{
            str(span):sorted((r for r in rows if r["span"]==span),
                             key=lambda r:r["min_changed"])[:2]
            for span in (1,2,3)
        },
        "best_whole_chapter":sorted(
            chapter_rows,
            key=lambda r:r["min_changed"]/r["target_words"]
        )[:2]
    }



def read_row_by_columns(sequence: Sequence[int], width: int) -> list[int]:
    """Write left-to-right in rows of width and read downward by column."""
    return [sequence[i] for col in range(width)
            for i in range(col,len(sequence),width)]


def inverse_column_read(sequence: Sequence[int], width: int) -> list[int]:
    """Restore row-major order after row-write, column-read."""
    offsets = [i for col in range(width)
               for i in range(col,len(sequence),width)]
    result = [0]*len(sequence)
    for value,original_index in zip(sequence,offsets):
        result[original_index] = value
    return result


def rail3(sequence: Sequence[int]) -> list[int]:
    rails = ([],[],[])
    for i,value in enumerate(sequence):
        rail=(0,1,2,1)[i%4]
        rails[rail].append(value)
    return [x for rail in rails for x in rail]


def inverse_rail3(sequence: Sequence[int]) -> list[int]:
    path=[(0,1,2,1)[i%4] for i in range(len(sequence))]
    counts=[path.count(rail) for rail in range(3)]
    pieces=[]
    cursor=0
    for n in counts:
        pieces.append(list(sequence[cursor:cursor+n]))
        cursor+=n
    pos=[0]*3
    result=[]
    for rail in path:
        result.append(pieces[rail][pos[rail]])
        pos[rail]+=1
    return result


def original_title_tiebreak(source: list[int], original: list[int]) -> dict:
    """Order-sensitive test of a source-selected minimum histogram match.

    The visual original p0–2 section displays THREE cross-bearing pages, and
    p0 has an original red 13-rune line. The resulting fixed candidate
    rearrangements are 3-row and 13-column reads, their inverses, a 3-rail
    path, and whole-section reversal. No permutations are fitted.
    """
    match = min_multiset_distance(source,original)
    assert len(original)==158
    candidate=source[match.source_word_offset:
                     match.source_word_offset+len(original)]
    assert len(candidate)==len(original)
    transform=[
        ("printed-order", list(candidate)),
        ("whole-reversal", list(reversed(candidate))),
        ("three-columns",read_row_by_columns(candidate,3)),
        ("inverse-three-columns",inverse_column_read(candidate,3)),
        ("thirteen-columns",read_row_by_columns(candidate,13)),
        ("inverse-thirteen-columns",inverse_column_read(candidate,13)),
        ("three-rail",rail3(candidate)),
        ("inverse-three-rail",inverse_rail3(candidate)),
    ]
    counts=[{"operation":name,
             "exact_positions":sum(a==b for a,b in zip(original,variant)),
             "equal_length_out_of":len(original)}
            for name,variant in transform]
    counts.sort(key=lambda x:-x["exact_positions"])
    observed=counts[0]["exact_positions"]
    rng=Random(3301)
    maxima=[]
    for _ in range(1000):
        randomized=list(candidate)
        rng.shuffle(randomized)
        variants=[
            randomized,
            list(reversed(randomized)),
            read_row_by_columns(randomized,3),
            inverse_column_read(randomized,3),
            read_row_by_columns(randomized,13),
            inverse_column_read(randomized,13),
            rail3(randomized),
            inverse_rail3(randomized)
        ]
        maxima.append(max(sum(a==b for a,b in zip(original,variant))
                          for variant in variants))
    upper=(1+sum(n>=observed for n in maxima))/1001
    # Exact source-known recoverability, including 4 predeclared errors.
    planted=read_row_by_columns(candidate,3)
    recovered=inverse_column_read(planted,3)
    assert recovered==candidate
    errors=list(planted)
    for i in (9,31,73,111):
        errors[i]=1+(errors[i]%17)
    recovered_errors=inverse_column_read(errors,3)
    assert sum(a==b for a,b in zip(recovered_errors,candidate))==154
    return {
        "source_offset_selected_before_any_order_test":match.source_word_offset,
        "minimum_wordlength_replacements":match.replacement_count,
        "top_fixed_order_readouts":counts,
        "order_null": {"shuffle_replicates":1000,
                       "max_of_eight_reads":True,
                       "median_random_max":sorted(maxima)[500],
                       "random_95th_percentile_max":sorted(maxima)[949],
                       "upper_tail_probability":round(upper,6)},
        "plant": "three-column 158-source-word plant restored exactly; four mutations leave 154/158"
    }


def main() -> None:
    pages,chapters = target_segments()
    raw,words,details = jung.source_subbook()
    original_sha = sha256(raw).hexdigest()
    assert original_sha == "5cbb32a6a6033399c8692ac9aaeb148e02a1a0734f4d7a31a90453fbc6073359"
    assert details["source_words"] == len(words)
    assert len(words) == 41654
    variants = [
        ("native-GP", [min(17,source_lengths.gp_length(w)) for w in words]),
        ("literal-Latin", [min(17,len(w)) for w in words])
    ]
    for name,source in variants:
        # Independent positive: a contiguous authored 180-word window retains
        # the same exact multiset after three 60-word deterministic reversals.
        positive = source[5000:5180]
        shuffled = [
            *reversed(positive[0:60]),
            *reversed(positive[60:120]),
            *reversed(positive[120:180])
        ]
        planted = min_multiset_distance(source,shuffled)
        assert planted.replacement_count == 0
        assert planted.exact_windows >= 1
        print("POSITIVE",json.dumps({"mode":name,"source_words":180,
              "exact_windows":planted.exact_windows},sort_keys=True))
    results = [evaluate(name,seq,pages,chapters) for name,seq in variants]
    for row in results:
        print("SOURCE",json.dumps(row,sort_keys=True,separators=(",",":")))
    observed = {
        "source":"Jung English reader, exactly titled Liber Primus body",
        "source_sha256":original_sha,
        "source_section":details,
        "original_runes":12956,
        "original_printed_words":2896,
        "original_page_windows":len(pages),
        "original_chapter_windows":len(chapters),
        "source_variants":len(variants),
        "no_whole_book_exact":all(row["whole_book_multiset"]["exact_windows"]==0 for row in results),
        "no_multi_page_exact":all(
            row["exact_by_page_span"]["2"] == 0 and
            row["exact_by_page_span"]["3"] == 0 for row in results),
        "no_chapter_exact":all(row["exact_whole_chapter_windows"] == 0
                               for row in results)
    }
    print("SUMMARY",json.dumps(observed,sort_keys=True))
    order_tiebreak=original_title_tiebreak(variants[1][1],chapters[0]["lengths"])
    print("FIRST_CHAPTER_FIXED_ORDER",json.dumps(order_tiebreak,sort_keys=True))
    # Lock the chapter-0 source position and winning inverse-3-column order
    # before consulting any later chapter: no chapter-specific offset fitting.
    first_at=order_tiebreak["source_offset_selected_before_any_order_test"]
    next_at=first_at+len(chapters[0]["lengths"])
    continuation=[]
    for chapter in chapters[1:3]:
        target=chapter["lengths"]
        donor=variants[1][1][next_at:next_at+len(target)]
        assert len(donor)==len(target)
        hist=min_multiset_distance(donor,target)
        predicted=inverse_column_read(donor,3)
        exact=sum(a==b for a,b in zip(predicted,target))
        continuation.append({
            "chapter":chapter["chapter"],
            "physical":chapter["physical"],
            "source_word_offset_frozen":next_at,
            "word_count":len(target),
            "source_multiset_wordlength_replacements":hist.replacement_count,
            "inverse_threecolumn_exact_positions":exact,
            "inverse_threecolumn_exact_fraction":round(exact/len(target),6),
            "source_continuation_matches_within_10_wordlength_changes":hist.replacement_count <= 10
        })
        next_at+=len(target)
    print("LOCKED_JUNG_CONTINUATION",json.dumps(continuation,sort_keys=True))


if __name__ == "__main__":
    main()
