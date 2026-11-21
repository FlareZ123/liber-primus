# Paired 180° crosses on p0–p2: native-plaintext invariant rejects a mirrored additive key

**Agent50, 21 November 2026. New original-cipher conditional exclusion.** Original LP2 pp0–2 have a genuine 180° page-level visual involution, independently documented from their source JPEGs in [the exact-ornament analysis](lp2-p0-triple-cross-180-source-gate.md). This report tests a single, directly motivated mathematical consequence on untouched runes. It finds **0, 4 and 2 opposite-position equal-rune pairs** on the three pages; a key that assigns the same additive GP29 shift to opposite positions preserves those equality counts exactly. The counts are very low relative to authentic GP29 English controls. No unknown plaintext, key or original direction rule follows.

## One source clue, one typed receiver

The original illustrations on 17.jpg, 18.jpg and 19.jpg place the same distressed three-bar cross in the left lower and right upper corners, with an exact 180° relative rotation around the 2400×3600 page centre. The native pixel comparison after rotation gives Pearson correlations **0.996917**, **0.997325** and **0.997325**. These three pages also contain exactly **262+266+201=729** uninterrupted GP29 ciphertext runes; no reordering or guess at word boundaries is needed.

If a cryptographer used that image relation as an instruction to apply the same unknown GP29 additive key from both ends of each physical page, they would have

`C_i=(P_i+K_i) mod29`, with `K_i=K_{n−1−i}`.

Then `C_i=C_{n−1−i}` **if and only if** `P_i=P_{n−1−i}`. The statement holds for **every possible secret symmetric key**, without fitting, knowing or recovering any key value. Pair page rune0 with page rune(n−1), rune1 with rune(n−2), and so on. The original page-specific visual motif motivates exactly these physical-page scopes, independent of a 27×27 reshape.

## Actual source-cipher observations

| Original LP2 page | Original rune count | Opposite-position pairs | Exact equal pairs |
| --- | ---: | ---: | ---: |
| p0 | **262** | 131 | **0** |
| p1 | **266** | 133 | **4** |
| p2 | **201** | 100 | **2** |
| Three physically independent pages | **729** | **364** | **6** |

For comparison, the canonical [published solved native-GP29 rune corpus](../resources/external/relikd-solved-gp29-native-v1.json) has **2,979** original-orthography symbols in nine sections (including independent LP1 solved pages and LP2 p56/p57). It gives exact, length-matched, *contiguous* plaintext windows rather than a Latin character-frequency approximation. Punctuation is removed while keeping the book's GP29 fused-rune orthography.

| Window length | Solved-source contiguous windows | Mean equal opposite pairs |
| --- | ---: | ---: |
| 262 | 1,325 | **8.51547** |
| 266 | 1,309 | **8.64171** |
| 201 | 1,569 | **6.30593** |
| Total, one per page |  | **23.46311** |

Convolving the three *empirical solved-window distributions*, assuming one uniformly drawn window of each requested length independently, gives **Pr(total≤6)=0.00002447164449**. The windows within each section overlap, so this is **an empirical reference distribution under an explicit sampling convention**, not a formal independent-sample experiment or a calibrated probability that the source had a symmetric key. Under an independent equal-letter reference the authentic GP-native corpus's symbol collision probability is approximately **0.06170**, giving the same direction of evidence.

As a separate, more conservative scope, concatenate the original three ciphertext pages in published order and compare pairs across the combined **729**-symbol sequence (364 opposite pairs): there are **10** equal pairs. Every one of the **79** length-729 contiguous solved-source windows has **at least 13** (range 13–35). The combined mirror scope is less directly indicated by the per-page artwork and is reported as a holdout-style consistency check, not another selected key search.

A **positive original-language plant** takes first 262 runes of solved `A KOAN`, first 266 of solved `WELCOME`, and first 201 of solved `LOSS OF DIVINITY`. Each is encrypted with a deterministic symmetric page-level secret shift `K_i=(7+11 min(i,n−1−i)) mod29`. Exact forward encryption and inversion both pass, while the mirrored equality counts remain **11, 6, 7**. Any genuine symmetric-pad encoding would pass the same necessary invariant irrespective of the hidden key values.

## Cipher and intended-solve-path decision

The cross symmetry is an authentic, exact original *layout* instruction. Under the specific hypothesis that it specifies an **equal additive GP29 key at reflected runic positions**, the original ciphertext would require p0–p2 plaintext with a highly atypical mirrored-equality deficit compared with the book's own solved natural-language sections. This makes the model an **unpromising plaintext-recovery route** and gives a substantive source-constrained reason to retire it, without enumerating passwords or decrypting garbage.

The observation **does not establish** that the crosses describe ciphertext rather than decoration. It does not exclude opposite *negative* shifts, a per-position arbitrary secret alphabet with no additive structure, a different geometric receiver, non-English binary plaintext, or a hidden key whose values are independent across the mirror. It cannot prove no conceivable English paragraph could have six mirrored pairs; it is an empirically strong negative for ordinary GP-native prose.

**Director fork:** Stop the literal mirrored-additive-key branch for p0–2. The stronger challenge is finding a first-party statement that maps the 180° drawing to a named rune/key operation or to a source-selected external key. Do not run a new broad 27×27 fold or Atbash menu solely because the decorative cross is turned upside down.

**Read-only CommonJS reproduction:** [`sims/lp2_p0_three_cross_symmetric_key_source_sft.cjs`](../sims/lp2_p0_three_cross_symmetric_key_source_sft.cjs), exact source input `resources/liber-primus/lp2-corpus.json` and `resources/external/relikd-solved-gp29-native-v1.json`. It asserts original 262/266/201, all 0/4/2 and 10 counts, all 4,203 solved plaintext windows, exact 0.00002447164449 source-control tail, and the 11/6/7 native symmetric-pad positive.
