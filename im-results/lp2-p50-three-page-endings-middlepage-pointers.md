# Three LP2 numeric-page endings point back to the central table page

**Original-source finding and bounded plaintext test, 17 November 2026, Agent11.** Physical pages 49–51 of the *second* Liber Primus release contain the **same continuous 32×8 numerical table**, split over **10, 13 and 9 rows**. Its **three printed last numeric cells** are unexpectedly structured: \`1M\`, \`1L\`, \`1K\`. Under the ordinary, historically used base60 digit alphabet, these values are exactly **82, 81, 80**. As **zero-based addresses into the original 256-cell table**, they point to the **third, second and first numeric cells of its middle physical page**, in that order. The relation is source-selected by visible physical page breaks and ordinary integer representation, without a decrypted crib or fitted secret.

This supplies a concrete **three-address candidate for source-level navigation**. The original authors have not explicitly prescribed address-following, a reader direction, or a downstream cipher; the observation neither recovers plaintext nor proves intended construction. The simplest direct three-rune key made from the indicated values is tested and fails to recover the immediately following p51 ciphertext. The stronger open question is which real 2014/2016 instruction, if any, might select a consumer of the pointer triplet.

## Exact manuscript objects

Original full-resolution source images \`resources/liber-primus/66.jpg\`, \`67.jpg\`, \`68.jpg\` (**2400×3600 RGB**) correspond to physical p49, p50 and p51. Each original image was directly inspected; the last displayed numeric cells visually read **1M, 1L, 1K**, respectively. A preserved 256-token transcription is [the canonical p49–51 table](../resources/liber-primus/lp2-grid-256.json). It has **80 + 104 + 72 = 256** tokens; the three source-end addresses are thus zero-based **79, 183, 255**.

The ordinary source-compatible ordered digits are \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\` (base60). No lower-case \`f\` happens to occur in the original printed tokens; treating that omission as a deliberate base59 rather than a missing observed digit produces a different graph and fails two independently observed original GF29 factor constraints. For this test **do not delete f or change radix**. This ordinary radix60 reading is independently consistent with the original 2013 BASE29/p39 polynomial test documented in [the historical-source numerical factor report](2013-base29-gf29-grid-factor.md). Its use as a cipher remains a hypothesis.

| Physical page | Number of rows and cells | Last numeric cell | Zero-based table address | Base60 integer |
| --- | --- | --- | ---: | ---: |
| p49 / original 66.jpg | 10 × 8 = 80 | **1M** | 79 | **82** |
| p50 / original 67.jpg | 13 × 8 = 104 | **1L** | 183 | **81** |
| p51 / original 68.jpg | 9 × 8 = 72 | **1K** | 255 | **80** |

The middle physical numeric page starts **precisely at table address80**. Its first three printed numeric cells, in forward order, are **2M, 0w, 3L**. Consequently the three values at page ends **82→81→80** select the target cells **3L→0w→2M** in **reverse middle-page order**, and the selected target values are **201,58,142**. This pointer relationship requires the already given physical split; counting last cells of each row would be a different selector.

## A finite source-multiset chance benchmark

The printed table has duplicated tokens, so compare against **random permutations of exactly its original 256 decoded base60 values**, holding the three visible page-end addresses 79,183,255 fixed. Every ordered triple of **distinct physical cell locations** is equally likely. The exact number of ordered page-end samples is 256×255×254 = **16,581,120**.

- An unspecified consecutive **descending integer triple** (v,v−1,v−2) in those three original page-end slots has exactly **266/16,581,120 = 0.00001604234213** conditional chance under random shuffling of the original value multiset. This calculation includes every possible initial value of the descending triple and does **not** cherry-pick 82.
- The **specific** middle-page-address triple (82,81,80), with source counts of (2,2,4), has **16/16,581,120 = 0.00000096495291** conditional probability.
- These are exact *fixed-test random-shuffle frequencies*, **not an objective probability of deliberate authorship**. Both the descending-triple and self-addressing interpretations were recognized after inspecting the table. Many other possible source patterns could have been noticed, and the source's existing H/G constraints show that the table may not be an independent random shuffle. A low conditional frequency is a reason to test a real decoder, never a plaintext claim.

The relation holds only under canonical radix60 for the middle-page addresses; in missing-f radix59, the three values are 81,80,79 and point toward the first numeric page seam instead. The two radices therefore offer an observable future discriminator for any historical instruction selecting **middle** versus **first** numeric-page navigation, without tuning a plaintext score.

## Frozen first receiver and result

The source-directed cells **82,81,80** yield **201,58,142**. Their residues modulo29 give GP29 key **[27,0,26]**, transliterated **IA–F–Y**. A natural immediately adjacent receiver is original physical **p51**: below its final numerical line, p51 prints precisely **92** ciphertext runes. Freeze a three-rune periodic additive key, phase zero at the first of those 92 runes, and test the ordinary historical GP29 inverse signs, without hidden skips or fitted phases:

\`P_i = (C_i ± [27,0,26]_(i mod3)) mod29\`.

The two output coincidence indices are **0.034400382226** (subtract) and **0.033922599140** (add), both close to 1/29. Their original GP29 word strings are nonprose; the exact first40 runes print in the reproducer. Both forward reencryption checks preserve the original 92/92 ciphertext symbols. This excludes the simplest fixed-repeating-key consumer on the immediately following p51 body; it cannot exclude a stateful three-path reader, a different original receiver, or a different source-specified operation.

## Decision

**Preserve the three final numeric cells as a genuine, unusually specific source-local pointer relationship.** It is a stronger forward lead than arbitrary 256-byte hash checks because the source independently supplies **all three seed addresses, the numeral order, and the middle-page target**. The weakest premise is that the author intended these addresses to point anywhere; no 2014 instruction says so. The signed 2016 words “their numbers are the direction” are compatible with numerical navigation, but far too general to authenticate this particular graph reading.

A useful next decision is to find a **historical or visually independent rule** telling the solver whether a redirected cell contributes its value, original rune, row, column, or onward address, then use all three fixed source pointers to predict an **untouched** original ciphertext sentence or source URL. Any such result must forward-encrypt and survive a separate source holdout. Avoid scanning arbitrary rotations, 256 start cells, or language-fitted link paths to rescue the coincidence. The direct p51 three-key consumer is finished and negative.

[Reproducible read-only Windows Node22 CommonJS SFT](../sims/lp2_p50_three_physical_ends_middle_pointer_sft.cjs). Source: original [LP2 256-grid](../resources/liber-primus/lp2-grid-256.json) and [unchanged GP29 manuscript](../resources/liber-primus/lp2-corpus.json).
