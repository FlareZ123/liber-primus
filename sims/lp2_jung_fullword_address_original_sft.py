"""Full source-word output, not initials, for Jung Liber Primus numeral addresses.

Directly source-selected by the signed 2016 "words are the map / numbers the
direction" clue, with the unauthenticated same-title Jung Liber Primus donor.
Reads one complete donor word per one complete original GP29 printed word.
Only the base-29 whole-word integer and GP-prime sum are tested; source offsets,
keys, reverse digits and word-order variants are not tuned.

Windows Python 3.12, read-only; original PDF from fixed SHA-256 in memory.
"""
from __future__ import annotations

from collections import Counter
from hashlib import sha256
from math import log
from random import Random
import json

import lp2_jung_liberprimus_section_address_sft as jung
import lp2_jung_liberprimus_wordaddress_sft as base

ALPHA = 0.2
NULL_REPLICATES = 400
SEED = 3301


def lexical_model(words: list[str]) -> tuple[Counter,Counter,int]:
    corpus = [x.upper() for x in words]
    singles = Counter(corpus)
    bigrams = Counter(zip(corpus,corpus[1:]))
    return singles,bigrams,len(singles)


def score(words: list[str], model: tuple[Counter,Counter,int]) -> float:
    singles,bigrams,vocab_size = model
    total = sum(singles.values())
    baseline = (total + ALPHA*vocab_size)
    acc = 0.0
    for a,b in zip(words,words[1:]):
        # Source donor-language word-pair probability vs independent unigram.
        # The baseline retains rare-word preferences, so a long random list of
        # valid dictionary words alone does not count as a linguistic decrypt.
        conditional = (bigrams[(a,b)] + ALPHA) / (
            singles[a] + ALPHA*vocab_size)
        marginal = (singles[b] + ALPHA) / baseline
        acc += log(conditional / marginal)
    return acc/max(1,len(words)-1)


def longest_verbatim_source_run(decoded: list[str],
                                source: list[str]) -> tuple[int,int,int]:
    # Exact coherent spans are stronger than merely showing dictionary words.
    lookup: dict[tuple[str,str],list[int]] = {}
    for j in range(len(source)-1):
        pair=source[j],source[j+1]
        lookup.setdefault(pair,[]).append(j)
    best=(0,-1,-1)
    for i in range(len(decoded)-1):
        for j in lookup.get((decoded[i],decoded[i+1]),[]):
            k=2
            while (i+k<len(decoded) and j+k<len(source)
                   and decoded[i+k]==source[j+k]):
                k+=1
            if k>best[0]:
                best=(k,i,j)
    return best


def decode(words: list[tuple[int,...]], donor: list[str],
           primes: list[int],radix:int) -> list[str]:
    return [donor[base.address(word,radix,primes,len(donor))].upper()
            for word in words]


def test_known_source_plant(donor: list[str],primes: list[int]) -> None:
    positions=list(range(5000,5070))
    encoded=[base.encode_address(i,4) for i in positions]
    assert len(encoded)==70
    actual=decode(encoded,donor,primes,29)
    assert actual==[x.upper() for x in donor[5000:5070]]
    assert longest_verbatim_source_run(actual,[x.upper() for x in donor])[0]>=70
    print("POSITIVE",json.dumps({
        "source_words_recovered":70,
        "encoded_gp29_digits_per_word":4,
        "full_words_exact":True
    }))


def main() -> None:
    original,corpus=base.original_words()
    pdf,donor,bounds=jung.source_subbook()
    assert sha256(pdf).hexdigest()==base.PDF_SHA
    assert len(original)==2896 and len(donor)==41654
    primes=corpus["prime"]
    test_known_source_plant(donor,primes)
    vocab=[x.upper() for x in donor]
    model=lexical_model(vocab)
    reports=[]
    for radix,label in ((29,"source-whole-word-base29"),
                        (0,"source-word-GP-prime-sum")):
        target=decode(original,donor,primes,radix)
        observed=score(target,model)
        coherent=longest_verbatim_source_run(target,vocab)
        rng=Random(SEED)
        randoms=[]
        for _ in range(NULL_REPLICATES):
            shuffled=list(target)
            rng.shuffle(shuffled)
            randoms.append(score(shuffled,model))
        tail=(1+sum(s>=observed for s in randoms))/(1+NULL_REPLICATES)
        reports.append({
            "mode":label,
            "output_words":len(target),
            "output_unique_words":len(set(target)),
            "source_correspondence_max_exact_verbatim_words":coherent[0],
            "source_correspondence_from_original_word":coherent[1],
            "source_correspondence_from_donor_word":coherent[2],
            "log_likelihood_ratio_per_word":round(observed,6),
            "randomized_output_llr_min":round(min(randoms),6),
            "randomized_output_llr_max":round(max(randoms),6),
            "randomized_output_llr_median":round(sorted(randoms)[len(randoms)//2],6),
            "shuffled_word_upper_tail":round(tail,6),
            "nonlinguistic_if_no_coherent_spans":coherent[0]<8
        })
        print("SOURCE_WHOLE_WORD",json.dumps(reports[-1],sort_keys=True))
    print("SUMMARY",json.dumps({
        "source":"Jung same-title Liber Primus body",
        "source_pdf_sha256":sha256(pdf).hexdigest(),
        "source_words":len(donor),
        "runes_original":12956,
        "original_full_words":len(original),
        "decoders_tested":len(reports),
        "source-selected_offsets":0,
        "planted_positive":True
    },sort_keys=True))


if __name__ == "__main__":
    main()
