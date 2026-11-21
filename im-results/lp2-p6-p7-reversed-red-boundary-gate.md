# P6→p7 reversed red-word boundary and p50 address gate

**Classification (21 November 2026): verified original-source structural observation; prospective p50 decoder not established.** All 56 unresolved LP2 pages remain encrypted. This gate addresses Director issue [#2051](https://github.com/FlareZ123/liber-primus/issues/2051). It preserves a previously unrecorded **p6→p7 red-word numeric handoff candidate** without promoting it to a key, plaintext or an authentic instruction.

## Exact source readout

Original LP2 physical p6 and p7 are `resources/liber-primus/23.jpg` and `24.jpg`. The canonical GP29 corpus, original red-ink annotations and printed word separators place the two red passages at p6 rune offsets **71–81** (11 runes, four words) and p7 offsets **194–207** (14 runes, five words). The p6 passage is bracketed by red 13-dot markers; p7's terminal red passage has red dot markers. These are physical page indices, not JPEG-number indices.

| Passage | Printed word GP0 sums | Rune lengths |
|---|---|---|
| p6 red, entire | **71, 19, 65, 26** | **4, 1, 4, 2** |
| p7 red, entire | **26, 65, 23, 42, 53** | **2, 4, 3, 2, 3** |
| p6 **last two** | **65, 26** | **4, 2** |
| p7 **first two** | **26, 65** | **2, 4** |

The adjoining two-word sequences across these **consecutive physical pages** exactly reverse both the printed lengths and the GP0 sums. Their actual rune strings differ; this is a numerical/word-boundary correspondence, not duplicated rune text. The p6 total is 181 and its word-length product is 32; p7 totals 209. The previously documented totient relation `phi(181)=phi(209)=180` provides additional context, but was already known before this comparison and must not be counted as independently predicted evidence.

## Family and conditional calibration

All 16 p0–p55 annotated red spans were parsed using original word separators. Four pairs of red spans lie on consecutive physical pages: p6/p7, p7/p8, p39/p40 and p53/p54. Only p6/p7 has its last two word lengths equal to the reversal of the next span's first two, and it is also the **only** reversed-length-and-sum boundary among those four pairs. The corpus contains 48 fully contained printed red words in the 14 red spans with at least two such words. In the length-conditioned red-word population, ten have length two (only GP0 sum 26 repeats) and ten have length four (only sums 65 and 57 repeat).

Under the deliberately narrow diagnostic null that separately permutes the observed GP0 sums among the ten red words of each length while keeping the physical p6/p7 boundary slots fixed, the probability of *any* equal sum in the specified two-rune pair is `2/(10×9)`; for the specified four-rune pair it is `4/(10×9)`. Their product is **8/8100 = 0.0009876543209876543**. This is a conditional combinatorial diagnostic, **not** an historical design probability: this GP0 reversal was noticed after exploring p6 and p7, alternative encodings and boundary choices are uncharged, and words/locations are not necessarily exchangeable.

## Director #2051 p50 fork

The p6 four word sums map by direct zero-based original row-major addresses in the physical 32×8 p50 table:

| GP0 address | Physical row, column (zero-based) | Printed token | Hypothetical base60 value |
|---:|---:|---|---:|
| 71 | 8, 7 | `1m` | 108 |
| 19 | 2, 3 | `0X` | 33 |
| 65 | 8, 1 | `4F` | 255 |
| 26 | 3, 2 | `2r` | 173 |
| 181 (whole p6 red sum) | 22, 5 | `0e` | 40 |

The two four-rune red words (sums 71 and 65) point into the same p50 row, but different columns. The p6 length product, 32, identifies the **number of p50 rows**, yet supplies neither a unique row/column nor a token-reading rule. The whole-span address 181 yields value 40, **not** p6's length product 32. The already documented 181→…→32 base60 pointer path uses additional choices about radix, origin, pointer semantics and step count. The original 2016 signed “words are the map; numbers are the direction” line does not specify these choices or a reversible ciphertext consumer. The independently documented base59/base60 transcription uncertainty remains relevant.

**Decision:** close the *prospective p6→p50 table-address decoder* branch as unsupported by a unique source-authenticated address/operation. Do not re-run the previously investigated p50 path or reselect its radix to fit p32. Retain the new p6→p7 **sum-conserving reversed two-word boundary** as a narrowly described lead: it may guide an independently source-selected **wordwise operation preserving length and GP0 sum**, but it does not yet select a symbol mapping, a key, a receiver, or unknown plaintext. Any successor must first identify that operation from the original artifact and predict an untouched input; equality of checksums cannot by itself invert a cipher.

## Related independent p6→p32 difference

The 4|1|4|2 p6 red-word sums minus the identically partitioned p32 fragment7 GP0 block sums are exactly **[23,5,0,3]**. This recovers the 2013 DH teaching modulus/base numerically, without specifying a cipher or plaintext. The separately scoped [28-fragment original-input control](./lp2-p6-p32-dh23-word-block-difference.md) is preserved as a provisional candidate for the active #2047 investigation.

## Reproduction

The read-only Node 22/CommonJS SFT `sims/lp2_p6_p7_red_boundary_gate_sft.cjs` regenerates every word, the four adjacent-page controls, the conditional probabilities and direct p50 lookups from the canonical repository inputs. It asserts the exact values reported here and logs the complete diagnostic object.
