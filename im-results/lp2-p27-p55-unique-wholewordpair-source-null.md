# Unique p27/p55 complete ciphertext word-pair repeat: a bounded original gate

**21 November 2026 · Agent8 · intermediate observation.** Exactly one complete adjacent word pair is reused across the 55 rune-bearing encrypted LP2 pages. This is a useful *source text cross-reference* and is **insufficient to name plaintext, a key period, or an encryption rule**. [Reproducer](../sims/lp2_crosspage_wordpair_jdu_bei_sft.cjs) · [Windows Node22 PASS 44962907739](https://github.com/FlareZ123/liber-primus/actions/runs/44962907739).

## What the original glyphs show

The unchanged original scans, visually checked as **44.jpg (physical p27)** and **72.jpg (physical p55)**, contain the same two full hyphen-separated three-rune words, in the same order. Original GP29 transcription renders them:

```text
p27, word starts at local rune28 (global 6555): DJU - BEI
p55, word starts at local rune70 (global12950): DJU - BEI
```

Their canonical original rune indices are `[23,11,1] [17,18,10]`. The second occurrence is **the terminal two printed words of p55**. The first lies on p27's second printed line. The global start-offset separation is **6395 = 5 × 1279**; no original instruction identifies a five-rune repeating cipher key or equates these two page contexts.

Parse the original `resources/lp2-transcription.txt` continuously across page separators and line wraps, ending after the original unknown-page stream of **12,956 runes**. Only printed hyphens and periods terminate words. This gives exactly **2,896 complete printed words** and **2,731 distinct complete ciphertext word sequences**, byte-for-byte consistent with the canonical `lp2-corpus.json`. Searching **every adjacent pair of complete words across all 55 encrypted rune-bearing pages**, there is **one and only one pair whose entire two-word sequence recurs at two different physical pages**, the p27/p55 instance above. There are no other cross-page whole-two-word repetitions, even shorter ones.

This distinction matters: many short *rune substrings* repeat by chance, but their whole printed word boundaries are usually misaligned. The distinctive pair could represent a plaintext refrain under a word-reset cipher, or it could arise from unrelated collision of short ciphertext words. Neither reading is presently selected by an original key source.

## Conditioned full-search controls

The test uses the **maximum full two-word rune length of any cross-page duplicate** as its search statistic. The observed maximum is **6**, so the null correctly pays for examining all 2,895 adjacent word pairs rather than treating the discovered p27/p55 pair as predetermined.

A seeded whole-word permutation preserving each physical page's complete-word inventory, original word counts and original word lengths gives **21/10,000** full-book trials with a cross-page pair of at least6 runes: add-one tail **0.002200**. This is suggestive if page is the only layout constraint.

A stronger, conservative comparison shuffles the original whole words **only within their printed source lines**, preserving exact line ownership and each line's actual word multiset. It gives **2,021/10,000** trials with a pair of at least6 runes: add-one tail **0.202180**. The p55 terminal line contains only the two complete words `DJU` and `BEI` (the preceding `CX` glyphs continue a word from the preceding printed line), making same-line adjacency partly forced. That explains why page-only rarity overstates the evidence. Both nulls are *descriptive conditioning choices*, and many candidate features have been examined previously across the project.

The SFT asserts the full 2,896-word source parse, exact source offsets, the unique repeated pair and an independently planted repeated two-page phrase. Both nulls use fixed seeded xorshift32 permutations of unchanged complete GP29 words. All assertions and controls pass on the original repository in [Windows Node22 run 44962907739](https://github.com/FlareZ123/liber-primus/actions/runs/44962907739).

## Cryptanalytic implication

A repeated complete ciphertext phrase at the same **global offset modulo5** is compatible with a word-reset or periodic-five keystream, but one repeated event does not distinguish those models from chance. The standard base60 p50 byte array is **not** repeated at the corresponding two source positions (global phases155 and150), so a literal p50 period256 additive keystream would **not** generate the same plaintext from those equal ciphertexts. The original signed 2016 `AND YOU`, solved p57 `OUR OWN`, and the source-adjacent `YOU ARE` candidate each also **fail** the simple five-period additive necessary condition `K[0]=K[5]` when imposed on `DJU BEI`. Those examples are illustrative exclusions of individually named cribs, not an exhaustive plaintext proof.

**Decision:** preserve the exact p27/p55 word pair as an original-source coincidence that may become a useful *holdout* for an independently discovered cipher. Its line-conditioned frequency does not support promoting a fixed plaintext crib or creating another source-free key search. A solution-level continuation would derive the same six plaintext runes at both sites from one first-party selected *value-changing* mechanism, predicting an independent original ciphertext passage and replaying both ciphertexts exactly.

**Reproduction:** `node sims/lp2_crosspage_wordpair_jdu_bei_sft.cjs` in the repository, with no installed dependencies beyond Node22.