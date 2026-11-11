# p15 mirrored leaves: 20 red runes exactly balance the two eight-page streams

**Evidence class:** original-source structural correspondence with two bounded original-cipher inverse negatives. **No unknown LP2 plaintext, authentic cipher key, complete inverse, or destination has been recovered.**

## The independent visual trigger and new numeric correspondence

Native source scans of physical pp7 and 23 have nearly identical five-dot ornaments under the exact vertical reflection `(x,y) → (x,3674−y)`. Their physical page indices straddle p15: `7+23=30=2×15`. Sixteen physical leaves lie between these source-matched ornaments excluding central p15, exactly the number of positions in p15's proven 4×4 Fibonacci-prime spiral. These source clues independently select a **p15-centered, eight-page-per-side comparison**, without selecting a cipher operation.

The pinned original-rune corpus and independent original-ink annotation give the following **new exact balance**:

| Source unit | Physical pages or p15 ink | GP29 runes |
| --- | --- | ---: |
| Earlier eight leaves | p7–14 | **1,937** |
| p15 red inscription above the grid | p15 first marked span | **9** |
| p15 red inscription below the grid | p15 second marked span | **11** |
| Later eight leaves | p16–23 | **1,957** |

Therefore **1,937 + 9 + 11 = 1,957**. Crucially, the two 9- and 11-rune red spans are visually separated by the p15 diagram; the flattened transcription joins them, but the scan does not. Treating them as a split 20-rune balancing token is an **inferred interpretation**, not an authenticated instruction to insert them into a key or plaintext stream.

Two conditional comparisons clarify how unusual the numeric observation is, while preserving the actual limits of the evidence:

- Among **all 12,870** eight-versus-eight assignments of the same 16 source page lengths, **91** leave a signed difference of exactly 20 (91/12,870 ≈ **0.007071**). This allocation model is conditional on the selection of those source pages, and it does not estimate a historical author's intent.
- Over all 40 centers p8–47 that permit eight physical pages on both sides, **p15 alone** has an eight-page **absolute** length difference exactly equal to its center page's marked-red rune count. The nearby p27 case differs by one: `|1945−1965|=20`, while the center's red inscription has 19 runes. This scan is a descriptive sensitivity check, not an independently frozen discovery gate.

The 20-symbol balance is a stronger and more source-specific reason to test full-side alignment than the earlier six-page/two-outlier glyph-length resemblance. It does not establish whether the red strings supply ciphertext, an operation, a key, padding, or an unrelated inscription.

## Two finite original-cipher experiments

**A. Original per-page mirrored fold (initial gate).** Match the eight pairs `(7,23),(8,22),(9,21),(10,20),(11,19),(12,18),(13,17),(14,16)`; read each side in source-order, optionally reverse the second page, then combine its first `min(length(A),length(B))` GP29 positions with ± modulo29. This uses **1,810** rune pairs; the source length mismatch discards 274 runes. The original-source output and exhaustive **8!** page-pairing comparison show no privileged original GP29 plaintext:

| Fixed operator | Output GP29 IoC | All 40,320 alternative pairings with IoC ≥ observed |
| --- | ---: | ---: |
| `(A−reverse(B)) mod29` | 0.034508244535 | 18,461 |
| `(A+reverse(B)) mod29` | 0.034335382633 | 32,696 |
| `(A−B) mod29` | 0.034261473480 | 37,812 |
| `(A+B) mod29` | 0.034259641021 | 39,064 |

**B. Full-side, red-balanced fold (new source-specific gate).** To avoid discarding the unpaired page-local ends, construct the left `9 red above | p7..14 text | 11 red below` as **1,957** symbols, then reverse the entire chronological p16..23 rune stream, also **1,957** symbols, before combining positionwise. This is one frozen, visually motivated candidate; it is not selected by an original deciphering instruction.

| Candidate output operation | Original length | Coincidence index | Additional observation |
| --- | ---: | ---: | --- |
| `(A−reverse(B)) mod29` | 1,957 | **0.034323852397** | Flat native-GP histogram; no legible original passage |
| `(A+reverse(B)) mod29` | 1,957 | **0.034566805960** | Flat native-GP histogram; no legible original passage |
| Five-bit `A XOR reverse(B)` | 1,957 | **0.031411022046** over 32 values | All 32 values occur; **180** values belong to 29,30,31 and no source selects their meaning |

The XOR case is historically motivated by Cicada's documented 2014 XOR-share operation, but no source tells the solver to XOR LP2's reflected pages or specifies an authentic 32-symbol plaintext alphabet. The first two recover no native GP29 language. A synthetic GP29 pad/inverse control passes exactly, which validates the implementation without making the key historical. A separately tested handful of alternative red placements and right-page read orientations had best IoC 0.034684364, again flat; no phase, offset, key or map was tuned to maximize language.

## Cryptanalytic decision

**Retire direct GP29 sum/difference and plain five-bit XOR of the p15-balanced streams as original plaintext operations.** Preserve the stronger verified source fact `p7–14 + p15 red(9+11) = p16–23`, with p7/p23's geometric mirror and p15's 16-position central diagram, as a candidate structural clue. There is still no source-chosen symbol-level pairing, word/punctuation restoration, key, reversible output representation or independently predicted plaintext.

An actionable successor would identify a **visible, historically plausible instruction** specifying what to do with the two 1,957-rune streams and the center's red inscriptions. It must explain all symbols of the proposed unit, yield an explicit inverse before examining its English output, and predict a withheld original segment. Do not expand to arbitrary placements, rotations, byte mappings or further numeric coincidences absent such a selector.

**Reproduction:** [full-side source balance and original operations](../sims/lp2_p15_red20_symmetric_fold_sft.cjs) reads `resources/liber-primus/lp2-corpus.json` plus `lp2-ink-annotations.json` and asserts every count, the exact partition enumeration, the 40-center check, three original inverse outputs and a planted GP29 pad. [Per-page matching and exhaustive assignment](../sims/lp2_p15_fold_rune_pair_inverse_sft.cjs) is independent. [Earlier original-image five-dot reflection proof](lp2-p7-p23-five-dot-mirror-page15-gate.md) fixes the geometry and shows that complete 16-page mirrored *ink overlap* is unexceptional; it does not test this rune-length balance or direct source-paired ciphertext operation.
