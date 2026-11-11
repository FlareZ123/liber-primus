# LP2 source clocks and 13/31 fragment traversal

**Classification:** original-source layout and traversal evidence. No unknown plaintext or cipher key recovered.

## Current section-boundary evidence

The canonical raw transcription has eight section-ending dollar markers across the 55 rune-bearing unresolved pages. Its sixth marker falls at the end of physical p32, global rune offset **7,960**. Physical p33 (scan 50.jpg) has two separate red headings: 10 runes beginning at local offset **0**, and 8 runes beginning at local offset **91**. The latter follows three large black circles and a red 13-dot mark.

A source-native typographic control sharpens the first boundary: solved p57's red `PARABLE` title is a 7-rune red span at local offset **0**, followed by red 13-dot punctuation at offset **7**. P33's first heading has the same layout signature: 10 red runes at offset **0**, followed by red 13-dot punctuation at offset **10**. P33's second heading is 8 red runes at offset **91**, with red punctuation at offsets **91** and **99**; the repeated 1033/3301 cuneiform artwork begins immediately after it and continues across p34–p39. P32 itself ends with red 13-dot punctuation. The strongest human-facing reading is therefore that **both p33 red headings begin titled units**, making the 91-rune/23-word interlude a standalone unit rather than an unmarked continuation of the prior p32 body.

An independently maintained, upstream-related transcription inserts a section separator before the second p33 red heading and not after p32. That is a transcription-convention witness, not independent cryptographic evidence. The canonical transcription remains unchanged to preserve comparability. The visual analogy strengthens the two-heading segmentation as a reading of the artifact; it still does **not** prove that a cryptographic key clock resets at either heading.

A further **17-based body-word relation** is visible, but the rune-count arithmetic must keep punctuation separate. P33 has **214 runes / 53 words**. Its two red headings occupy 10+8 runes; the two 13-dot marks are punctuation and are **not** part of the rune count. Removing only the headings leaves **196 body runes = 14²**. The two body units are **81 = 9²** and **115** runes. An original-JPEG scan of physical p33 (`resources/liber-primus/50.jpg`, SHA-256 `13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d`) resolves the geometry. The printed lines contain **[18,16,18,23,16]** runes in the first five-line unit and **[19,18,18,22,22,24]** in the second six-line unit, including the heading runes. Deleting only the first-line red headings of length 10 and 8 gives exact body-line lengths **[8,16,18,23,16]** and **[11,18,18,22,22,24]**. An independent pixel-row projection of the original scan identifies eleven dark text-line centers at y=[698,900,1096,1279,1472,1952,2148,2320,2509,2706,2894], with the black-dot separator between units. Thus **196=14²** and first-unit **81=9²** are only count factorizations: neither square is printed in a source-visible 14-row or 9-row grid; both require reflow of variable-length source lines. No unique square traversal or key schedule follows. [Original-source SFT](../sims/p33_original_square_geometry_sft.py) checks the canonical line counts and independently counts the original JPEG's eleven rows. Since 196=4×49 as well, four 7×7 blocks are another count-based candidate, and p57 has a 7×7 square; however the p33 red boundary splits the body after81 runes (not a multiple of49), so the visible sectioning does not select four consecutive blocks or an operation. Removing the two heading words leaves **51 body words = 3×17**; physical p55 independently has **17 words**. This is a word-count relation, not a 10×17 rune matrix. The earlier 170=10×17 calculation was erroneous because it subtracted the two 13-dot punctuation marks from the rune total.

A simple sequential grouping of the 51 p33 body words into 17 triplets does **not** reproduce p55's 17 word lengths: p55 lengths are [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3], while the corresponding p33 triplet rune totals are [19,12,10,13,19,7,7,13,14,8,9,12,16,19,8,14,9]. Thus the 17-word-count relation has no direct triplet-to-p55-word-length alignment. No row/column order or reversible operation is selected.

Three lossless source clocks remain possible:

| Segmentation | Runes per body (sum 12,956) | Words per body (sum 2,896) |
|---|---|---|
| p32-end marker only: 8 bodies | 729, 1145, 1738, 1894, 1021, 1433, 1680, 3316 | 158, 255, 385, 435, 224, 326, 378, 735 |
| p33 second heading only: 8 bodies | 729, 1145, 1738, 1894, 1021, 1524, 1589, 3316 | 158, 255, 385, 435, 224, 349, 355, 735 |
| Both p33 headings: 9 bodies | 729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316 | 158, 255, 385, 435, 224, 326, 23, 355, 735 |

The interlude between global offsets 7,960 and 8,051 is exactly **91 runes / 23 words**. The p57 title analogy makes a standalone titled unit the strongest typographic interpretation. Keep the alternative clocks for comparative cryptanalysis: visual sectioning is evidence about intended reading order, not proof of a cryptographic reset.

## Repeated cuneiform layout

The 1033/3301 cuneiform artwork begins at the bottom of p33 after the second red heading and repeats at the top of every p34–p39. A source-selected original-JPEG template search finds only pp33–39 above NCC 0.95: p33 0.98994, each p34–p39 0.99375; the best page outside that contiguous seven-page run is 0.30788. The six p34–p39 top-patch RGB arrays are byte-identical (SHA-256 21d5cb4cb00e0a0d7d5b8adbbe14e497128951623ea4e98e10213f5c7288938f). This supports the second p33 heading as the typographic entry to the illustrated passage, but not an encryption reset.

A source-locked direct transfer of the known p56 prime-totient cipher from the illustrated 1033 (174th prime) and 3301 (464th prime) numerals tested six original starts (7,960; 8,051; 8,174) and both primes through the first p40 rune at 9,640. All six outputs remain near-uniform (IoC 0.034296917–0.034757083); no new plaintext. This excludes only that direct source-locked family.

## Retrospective 13/31 traversal candidate over all 32 fragments

The five-slot border ornament's documented binary reading gives **13** and **31**. Across all 58 physical pages, the 31 thirteen-dot marks delimit **32 full-text fragments** (13,136 runes total). The first 28 fragments contain the 12,956 unresolved runes; the final four contain the solved p56/p57 tail. The two empty intervals at global boundaries 1,860 and 3,603 are retained.

The full-period recurrence

\[
x_{n+1}=13x_n+31\pmod{32}
\]

visits all 32 fragment indices exactly once for any seed. The earlier seed-zero presentation used \(x_0=0\), but **zero is not selected by the ornament or an authenticated instruction**. With seed zero, the four solved-tail fragments restrict to **31, 28, 29, 30** in both forward and inverse position-permutation orders. That exact dual order is seed-dependent: enumerating all 32 seeds produces all four cyclic forward tail rotations, and using the independently source-derived FOLD mismatch value **18** as the seed gives forward **28,29,30,31** and inverse-position **30,29,28,31**. Thus the solved tail confirms only that this full cycle can induce cyclic tail orders; it does not select the seed, orientation, or an LCG operation.

The earlier finite [orientation SFT](../sims/lp2_lcg32_tail_orientation_sft.cjs) fixed seed zero; within that conditional family exactly one of 128 full-period affine clocks, the 13/31 pair, yields the exact dual-map solved-tail order, while four yield any matching cyclic tail order. The all-seed audit shows that this statistic does not establish a source-fixed orientation because the seed itself was never supplied. Of five rotations of the ornament's `01101` mask, only multipliers 13 and 21 are full-period with increment31; 21 fails the solved-tail cyclic check. These conditional counts do not identify a cipher, authentic key, or unknown plaintext.

Directly concatenating the 28 unknown fragments in LCG order does not improve GP trigram score: chronological −6.195857, forward −6.198043, inverse −6.195210; the inverse is ordinary against a 1,000-random-order null (upper-tail p=0.235). The 225 red-only runes also do not become readable under the same permutation. Thus the LCG is **not a direct plaintext transposition**. Its likely remaining role is a fragment index, clock, or row assignment; forward versus inverse orientation is unresolved.

**The proposed fixed row-pairing test is now complete.** The source-fixed 13/31 LCG traverses all 32 rows, 8 columns and, separately, all 256 cell addresses. Forty complete original-cipher inverses use the frozen row/column orders: 32 GP29/GP28 per-fragment reset variants and eight global 256-byte table-pad variants. All re-encrypt all 12,956 original runes and recover a native solved-page-derived plant, but their decoded outputs remain nonlinguistic. GP29 IoC stays **0.0344419952–0.0345017289**, compared with original **0.0344783979**; GP28 transparent outputs remain nonlinguistic. These direct table-pad and register uses are bounded negatives ([reproducer](../sims/lp2_lcg13_31_grid_original_gate.cjs); [consolidated report](../im-results/lp2_lcg32_fulltext_fragment_order.md)). Future use requires a separately signaled nonlinear or non-GP operation. Retain the original p33 boundary ambiguity and avoid free row rotations.

**All-secret phase test (11 November):** For the original 32 fragments and eight source-table columns, arbitrary independent secret GP29 permutations per fixed fragment×column phase preserve all original within-phase equal-symbol counts. The 12,956 ciphertext runes have **94,652/2,728,348 = 0.03469206** such ordered equal pairs; **2,335** native GP windows (overlapping within four corpora) from Gibran, Shakespeare, Emerson, Latin Vulgate and Old English Beowulf lie in **0.05675–0.07807**. All eight 13/31 forward/inverse and column-reset/global public-state labellings preserve the original count, and synthetic secret-S-box encrypt/decrypt controls pass. The fixed-public-phase GP29 substitution family cannot explain native-like plaintext under those independently specified positions, whatever the secret permutation. Feedback/hidden state/non-GP registers are outside scope. [Standalone SFT](../sims/lp2_lcg32_allsecret_phase_invariant_sft.cjs) · [consolidated evidence](../im-results/lp2_lcg32_fulltext_fragment_order.md).

## Consequence and reproduction

Keep the canonical dollar-marker transcription unchanged. For section-reset ciphers, use the **both-p33-headings / 9-body segmentation as the primary source-native reading**, while retaining p32-only and second-heading-only clocks as controls. Do not infer a cryptographic reset from typography alone. The 13/31 LCG is a separate traversal candidate, not evidence for a p33 reset.

- Three clocks and original-image evidence: [source-clock SFT](../sims/lp2_section_clock_sft.cjs) and [original-JPEG cuneiform SFT](../sims/lp2_cuneiform_header_sft.py).
- Direct 1033/3301 transfer: [prime-totient SFT](../sims/lp2_cuneiform_prime_totient_sft.cjs).
- 13/31 source-fragment cycle, solved-tail control and complete original grid gate: [fragment reproducer](../sims/lp2_lcg32_fulltext_fragment_order.cjs), [40-model original-inverse SFT](../sims/lp2_lcg13_31_grid_original_gate.cjs), and [consolidated report](../im-results/lp2_lcg32_fulltext_fragment_order.md).
- Original ink annotations and normalized ciphertext: resources/liber-primus/lp2-ink-annotations.json and resources/liber-primus/lp2-corpus.json.
- The p57 solved rune control is [Wulfic page 74](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_74/runes.txt).
