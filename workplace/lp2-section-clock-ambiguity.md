# LP2 source clocks and 13/31 fragment traversal

**Classification:** original-source layout and traversal evidence. No unknown plaintext or cipher key recovered.

## Current section-boundary evidence

The canonical raw transcription has eight section-ending dollar markers across the 55 rune-bearing unresolved pages. Its sixth marker falls at the end of physical p32, global rune offset **7,960**. Physical p33 (scan 50.jpg) has two separate red headings: 10 runes beginning at local offset **0**, and 8 runes beginning at local offset **91**. The latter follows three large black circles and a red 13-dot mark.

An independently maintained, upstream-related transcription inserts a section separator before the second p33 red heading and not after p32. That is a transcription-convention witness, not independent cryptographic evidence. The canonical transcription remains unchanged to preserve comparability.

Three lossless source clocks remain possible:

| Segmentation | Runes per body (sum 12,956) | Words per body (sum 2,896) |
|---|---|---|
| p32-end marker only: 8 bodies | 729, 1145, 1738, 1894, 1021, 1433, 1680, 3316 | 158, 255, 385, 435, 224, 326, 378, 735 |
| p33 second heading only: 8 bodies | 729, 1145, 1738, 1894, 1021, 1524, 1589, 3316 | 158, 255, 385, 435, 224, 349, 355, 735 |
| Both p33 headings: 9 bodies | 729, 1145, 1738, 1894, 1021, 1433, 91, 1589, 3316 | 158, 255, 385, 435, 224, 326, 23, 355, 735 |

The interlude between global offsets 7,960 and 8,051 is exactly **91 runes / 23 words**. It may be a prologue, separate section, or continuation; the image establishes its position, not a cipher reset.

## Repeated cuneiform layout

The 1033/3301 cuneiform artwork begins at the bottom of p33 after the second red heading and repeats at the top of every p34–p39. A source-selected original-JPEG template search finds only pp33–39 above NCC 0.95: p33 0.98994, each p34–p39 0.99375; the best page outside that contiguous seven-page run is 0.30788. The six p34–p39 top-patch RGB arrays are byte-identical (SHA-256 21d5cb4cb00e0a0d7d5b8adbbe14e497128951623ea4e98e10213f5c7288938f). This supports the second p33 heading as the typographic entry to the illustrated passage, but not an encryption reset.

A source-locked direct transfer of the known p56 prime-totient cipher from the illustrated 1033 (174th prime) and 3301 (464th prime) numerals tested six original starts (7,960; 8,051; 8,174) and both primes through the first p40 rune at 9,640. All six outputs remain near-uniform (IoC 0.034296917–0.034757083); no new plaintext. This excludes only that direct source-locked family.

## New source-fixed 13/31 traversal over all 32 fragments

The five-slot border ornament's documented binary reading gives **13** and **31**. Across all 58 physical pages, the 31 thirteen-dot marks delimit **32 full-text fragments** (13,136 runes total). The first 28 fragments contain the 12,956 unresolved runes; the final four contain the solved p56/p57 tail. The two empty intervals at global boundaries 1,860 and 3,603 are retained.

The full-period recurrence

\[
x_{n+1}=13x_n+31\pmod{32},\qquad x_0=0
\]

visits all 32 fragment indices exactly once. Its restriction to the four solved-tail fragments is **31, 28, 29, 30** in both forward and inverse orders. Those fragments are p57[7:], p56, p57[:7], so their concatenation is exactly a cyclic rotation of the known 180-rune solved tail beginning at p57 offset 7 (tail offset 92). This is a source-anchored structural match.

Directly concatenating the 28 unknown fragments in LCG order does not improve GP trigram score: chronological −6.195857, forward −6.198043, inverse −6.195210; the inverse is ordinary against a 1,000-random-order null (upper-tail p=0.235). The 225 red-only runes also do not become readable under the same permutation. Thus the LCG is **not a direct plaintext transposition**. Its likely remaining role is a fragment index, clock, or row assignment; forward versus inverse orientation is unresolved.

The economical next test is the source-fixed pairing of the 32 fragments with the 32 rows of the p49–p51 32×8 base-60 table under this LCG, with only forward/inverse assignments and a fixed within-fragment row clock. Do not expand into arbitrary permutations or repeat the already-negative F31 red-fragment/grid screens.

## Consequence and reproduction

Keep the canonical dollar-marker transcription unchanged. Section-reset ciphers must state which p33 boundary they use; the 13/31 LCG is a separate traversal candidate, not evidence for a p33 reset.

- Three clocks and original-image evidence: [source-clock SFT](../sims/lp2_section_clock_sft.cjs) and [original-JPEG cuneiform SFT](../sims/lp2_cuneiform_header_sft.py).
- Direct 1033/3301 transfer: [prime-totient SFT](../sims/lp2_cuneiform_prime_totient_sft.cjs).
- 13/31 fragment order and solved-tail control: [LCG reproducer](../sims/lp2_lcg32_fulltext_fragment_order.cjs) and [detailed report](../im-results/lp2_lcg32_fulltext_fragment_order.md).
- Original ink annotations and normalized ciphertext: resources/liber-primus/lp2-ink-annotations.json and resources/liber-primus/lp2-corpus.json.
- The p57 solved rune control is [Wulfic page 74](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/pages/page_74/runes.txt).
