# Historical hidden-service blobs as LP2 per-page pads

**Status: intermediate negative; no plaintext recovered.**

## Hypothesis and source

The three 256-byte objects in `resources/cicada-hiddenservice-256-candidates.json` (onion2/onion3/onion4; historical markers 761/1033/3301) might be page-reset key material for LP2. The human-motivated mapping is direct byte reduction modulo 29; a secondary, explicitly bounded mapping groups adjacent bytes as big-endian 16-bit values modulo 29. The 256-byte length makes a one-page pad plausible for pages no longer than the available key. This is a test of that narrow role, not a claim that the blobs are keys.

## Exact test

Reproduction: `node sims/onion_hiddenservice_page_pad_test.cjs`.

- Corpus: 55 rune-bearing unsolved pages, 12,956 runes; pages longer than the pad are excluded for each mapping.
- Byte mapping: `K[i] = byte[i] mod 29` (256 symbols). Pair mapping: `K[i] = (byte[2i] * 256 + byte[2i+1]) mod 29` (128 symbols).
- Both key orientations and both additive signs; page-reset key pointer; offsets 0–20, maximized subject to full-page fit; no key wrap.
- Collision-aware additive model ported from `sims/keyskip_transducer.cjs`: plaintext held fixed across rejected proposals, `rejectRepeat=0.83`, at most four local rejects and 40 total extra key positions.
- English-versus-uniform log-likelihood ratio from the repository's GP29 encoding of `resources/control/shakespeare_first300k.txt`. This exact likelihood test does **not** include the separate F-null convention.
- Positive plant: 200 known English GP29 symbols encrypted with the true Onion2 byte key, offset 7, and the same collision rule.

## Results

The positive plant passed: true-key LLR **+68.075** versus deterministic wrong-key LLR **−111.946**.

Byte-mod-29 scan: best LLR **−5.755**, page 49, Onion3, reversed, negative sign, offset 10. No byte candidate has positive English evidence.

Pair-BE scan: best LLR **+0.412** total (only **+0.0062 per rune**), page 49, Onion3, forward, positive sign, offset 7. The pair family contains 4 eligible pages (32, 49, 51, 55).

Forty histogram-preserving byte-permutation nulls were run over the same pair-BE family. One null maximum exceeded the observed candidate (**+0.585**, page 49, shuffled Onion3, reversed, positive sign, offset 19), giving exploratory empirical `p = 2/41 = 0.0488`. The candidate is therefore not exceptional against the matched null family.

A 30,000-state trigram beam for the best pair-BE candidate produces:

`IBERBUUHTHEFLAEEAHEAWRYIEEARWYOHDGRYTHRWORLIMASSEAAOEIAGLRWBWTHCOEXEOAXIAAWBS`

with log score **−5.365 per rune**. This is not credible English plaintext. The short 66-rune page 49 is also the maximum-producing page for most permutation nulls, explaining why a weak unigram statistic can rank there without yielding language.

## Conclusion and limits

**Reject the direct byte-mod-29 and adjacent-byte-pair-mod-29 per-page-pad interpretations under this collision model.** The only positive LLR is negligible, matched by a shuffled key, and fails the independent trigram readability check. No key or plaintext has been recovered.

This does not test nibble encodings, PRNG-seeded expansion, arbitrary transformations of the blobs, a different page assignment, or the F-null overlay. Those are separate hypotheses and should not be silently folded into this result. The current evidence does not justify expanding this branch without a new source-selected operation.
