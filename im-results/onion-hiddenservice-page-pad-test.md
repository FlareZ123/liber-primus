# Historical hidden-service blobs as LP2 per-page pads

**Status: intermediate negative; no plaintext recovered.**

## Hypothesis and source

The three 256-byte objects in `resources/cicada-hiddenservice-256-candidates.json` (onion2/onion3/onion4; historical markers 761/1033/3301) might be page-reset GP29 key material. This is a collision-aware extension of the existing direct-key gate in `im-results/historical-onion-byte-vigenere-lp2.md`, not an independent source discovery. The additional hypothesis is that the known LP2 collision-rejection rule is part of the pad's use.

## Exact test

Reproduction: `node sims/onion_hiddenservice_page_pad_test.cjs`.

- Corpus: 55 rune-bearing unsolved pages, 12,956 runes. Byte keys cover pages no longer than 256; pair keys cover pages no longer than 128.
- Byte mapping: `K[i] = byte[i] mod 29` (256 symbols). Secondary mapping: adjacent big-endian byte pairs modulo 29 (128 symbols).
- Both key orientations and additive signs; page-reset key pointer; offsets 0–20 maximized subject to full-page fit; no key wrap.
- Collision-aware transducer ported from `sims/keyskip_transducer.cjs`: `rejectRepeat=0.83`, at most four local rejects and 40 total extra key positions.
- English-vs-uniform likelihood uses the canonical `corpus.translit` GP29 alphabet and word-aware encoding of `resources/control/shakespeare_first300k.txt`. The exact likelihood does not include an F-null branch.
- Independent p56 regression recovers its known plaintext exactly, including the fourth-F null convention.
- Positive plant: 200 known English GP29 symbols encrypted with the true Onion2 byte key at offset 7 under the same collision rule.

## Results

The p56 regression passed. The positive plant scored **+78.608** under the true key versus **−129.412** under a deterministic wrong key.

Byte-mod-29 scan: best LLR **−5.914**, page 49, Onion3, reversed, negative sign, offset 10. No byte candidate has positive English evidence.

Pair-BE scan: best LLR **−1.398** total, page 49, Onion3, forward, positive sign, offset 7. The pair family contains four eligible pages (32, 49, 51, 55).

Forty histogram-preserving byte-permutation nulls were run over the same pair-BE family. Two null maxima exceeded the observed candidate; empirical `p = 3/41 = 0.0732`. The best candidate is still negative against uniform and is not exceptional against the matched null family.

A 30,000-state trigram beam for the best pair-BE candidate yields:

`IBERBUUHTHEFLAEEAHEAWRYIEEARWYOHDGRYTHRWORLIMASSEAAOEIAGLRWBWTHCOEXEOAXIAAWBS`

with log score **−5.146 per rune**. This is not credible English plaintext.

## Conclusion and limits

**Reject direct byte-mod-29 and adjacent-byte-pair-mod-29 per-page pads under this collision model.** The matched positive control works, while every real candidate is negative; the only near-zero pair result is matched by shuffled keys and fails the trigram check.

This does not test nibble encodings, PRNG-seeded expansion, arbitrary transformations, other page assignments, or an F-null overlay. Those are separate hypotheses and should not be silently folded into this result. The evidence does not justify expanding this branch without a new source-selected operation.
