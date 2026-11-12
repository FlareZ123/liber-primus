# Exact p50 76-cell perimeter and 180-cell interior: two source-sized receiver candidates

**Status:** original-print geometric correspondence; source-linked direct consumer tests negative; no plaintext, verified key or decoder. [Original-input SFT](../sims/lp2_p50_ring76_inner180_dual_source_gate_sft.cjs).

## Why the exact split could matter

The original LP2 p49–51 numerical table prints **32 rows × 8 columns = 256 tokens**, a single rectangle. Its outermost one-cell-wide clockwise perimeter contains exactly **76 tokens**, while the remaining inner **30×6 rectangle contains 180 tokens**. For a 256-token rectangular grid with a nonempty inner rectangle, the *only* dimensions whose one-cell perimeter is 76 are **32×8 or 8×32** (solve `rc=256` and `2(r+c)-4=76`). The printed dimensions select the former.

There are two independently known but **unproven** historical receivers of these lengths: the immediately later unknown LP2 p55 has exactly **76 GP29 runes** including the first-rune carry from p54; an anonymous 14-Jan-2013 Pastebin source separately lists **180 missing ordinary primes, 73..1223** (prime ordinals21..200) from the contemporary first-onion discussion. The solved p57 line "shed our own circumferences" can motivate attempting a perimeter/interior separation. Its wording does not identify p50, p55, the 2013 list, or a cipher. The 180-prime list is preserved as a participant transcript, without an authenticated original service capture or signature. The second count follows arithmetically from 256−76; it is not an independently chosen table dimension or a second statistical validation.

This partition is a **new candidate source-sized route**, rather than a decryption, because a byte-to-rune consumer and any missing-prime mapping must still be selected by external instructions.

## Frozen finite direct consumers

### Outer 76 cells → original p55, source-era XOR

Read the perimeter once from the **top-left** cell, along the top edge, down the right edge, left along the bottom and up the left edge; optionally reverse this same 76-element sequence as a direction control. The existing conventional base60 interpretation gives bytes 0..255. To apply the historically genuine Cicada XOR operation to original 0..28 GP rune indices, choose either the source-native low-five-bits byte representation (`byte & 31`) or the already established GP29 residue (`byte mod29`). For each i, take `P[i] = C_p55[i] XOR K_outer[i]`. A native-GP result requires all 76 outputs within 0..28; values29..31 cannot be read as GP29 without an unselected escape code.

| Perimeter key representation | Direction | Native-GP symbols | Invalid rune positions (0-based) |
| --- | --- | ---: | --- |
| Low five bits | Clockwise | 68/76 | 8 positions |
| Low five bits | Reversed | 68/76 | 8 positions |
| Byte mod29 | Clockwise | 66/76 | 10 positions |
| Byte mod29 | Reversed | **72/76** | **29,30,43,44** |

The most promising of these four still emits the invalid values [29,31,29,30] in two pairs inside p55 words; the other 72 glyphs are not readable GP prose. All four XOR operations invert exactly when applied twice; the native alphabet viability check is the decisive negative. A direct **raw-byte XOR** using the outer key and the published p55 GP **ordinals** or **prime weights** yields only 26–32 printable ASCII characters out of 76 in the corresponding clockwise/reverse arrangements, without text.

### Outer 76 cells → p55, direct GP29 addition/subtraction

A second source-native operation uses the solved p56's additive **GP29** arithmetic rather than historical XOR. Keep the same top-left clockwise perimeter, the published base60 byte values and the exact original p55 rune order. Reduce each perimeter byte **mod29**, then apply one direct symbolwise addition or subtraction (with reversed perimeter as a direction control), without tuning a phase, skip or permutation. Every output consists of 76 valid GP29 runes, and the exact inverse returns all 76 original input runes; this is automatic for every key and does **not** select a historical one.

| Perimeter reading | Operation on p55 index | Decoded IoC | First twelve GP29 symbols |
| --- | --- | ---: | --- |
| Clockwise | subtract key | 0.03298246 | NG Y Y IA Y I W C I S A U |
| Clockwise | add key | 0.03368421 | NG A EO OE B L IA D EA S F J |
| Reversed | subtract key | 0.03719298 | T L Y J X D A H F E R T |
| Reversed | add key | 0.03649123 | Y U EO N F W I L N EO L AE |

For scale, unchanged p55 IoC is **0.03789474** and authentic solved p57 GP29 prose is **0.06270997**. All four 76-rune results lack a readable GP29 text or recognizable directive. These are exact natural-start, direct-mod29 variants only, **not** a universal exclusion of keyed table transformations. An alternative phase, operation or byte-to-rune encoding would need an independent original-source selector before testing.

### Inner 180 cells → 2013 missing-prime sequence

Retain the inner 30×6 source tokens in their printed row-major order. Compare against the 180 historically listed consecutive primes in the listing's printed order. Only **3/180** respective values satisfy `byte mod29 = prime mod29` and **5/180** satisfy `byte mod29 = (prime−1) mod29`. Direct source GP29 subtraction `(byte−prime) mod29` has rune IoC **0.03767846**; addition has **0.03333333**, compared with raw inner byte residues **0.03823712**. Neither produces a readable GP29 passage or an identifiable index/prime mapping. This excludes the obvious direct position-aligned residues, not independent nested permutations, encodings, or unpublished source instruction.

## Decision and reproduction

The **76/180 perimeter/interior partition is exact and source-visible**. It gives two concrete historically adjacent candidate input lengths, but no operation selected by the maker. The four direct 76-place XOR inverses are **mathematically invalid as all-GP29 decoded output** and the four source-native direct additive GP29 inverses also give unreadable text; the direct 180-place prime-removal operation gives noise. Retire these exact candidate transfers. Further tests should require original evidence selecting a different consumer and should not overinterpret the matching counts or refit position-specific exceptions.

The [standalone CommonJS SFT](../sims/lp2_p50_ring76_inner180_dual_source_gate_sft.cjs) reconstructs the 32×8 perimeter without duplicate cells, checks dimension uniqueness and p55 exact length, parses all 180 original archived primes, asserts the original source counts and direct outputs, and checks both the XOR and GP29 additive inverses. It uses [original p50 tokens](../resources/liber-primus/base60-grid.json), [original p55 runes](../resources/liber-primus/lp2-corpus.json) and [contemporaneous participant prime list](../resources/external/2013-01-14-missing-primes-pastebin.md).
