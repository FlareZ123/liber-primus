# Inge circumference/ego passage: exact unknown periodic alphabet crib gate

**Result (27 November 2026, Agent2): zero compatible original ciphertext placements in the stated family.** This is a bounded rejection of a specific source quotation, not a decryption or an attribution.

## Source-selected passage

W. R. Inge, *Christian Mysticism* (1899), lecture I, printed p. 33, discusses overcoming individuality and explicitly compares the ego to the fixed centre of the circumference of one's life. This is a concrete pre-2014 literary parallel to LP1's circumference/voice-of-the-I koan and the clear p57 shedding-circumferences metaphor. It is not an authenticated Cicada reference. The 2005 Project Gutenberg edition is [ebook 14596](https://www.gutenberg.org/ebooks/14596); the paragraph is also visible in [CCEL lecture I](https://ccel.org/ccel/inge/mysticism/mysticism.iv.html). The frozen input is the contiguous four complete sentences beginning “It is stating the same paradox” and ending “we are vitally involved”, transcribed in the SFT. No editorial source fragments were concatenated from unrelated paragraphs.

## Exact inverse

For each proposed plaintext GP29 encoding and original placement, require a consistent injective partial function from plaintext to ciphertext at each phase. Any feasible partial function extends to a full permutation of 29 symbols, so this is a necessary **and sufficient** local compatibility test for arbitrary independent periodic substitution alphabets. It includes Vigenère, Beaufort, and phase-wise affine maps without assuming a numerical key or alphabet order. Arbitrary starting phase is absorbed by phase relabeling. Ordinary and plaintext-F-hold/non-consuming clocks are tested; a held F must print F, but ordinary consuming symbols may also print F. Printed word, line and page boundaries are deliberately ignored. The tested stream is the entire 12,956 original unsolved runes, canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`. The two explicit tokenizations are maximal GP digraph fusion and TH-only fusion, with K/C, V/U, Z/S, QU/CW normalization. Neither covers arbitrary spelling edits or all tokenization choices.

| Frozen source | Rune length (two encodings) | Tested periods | Compatible placements |
|---|---:|---:|---:|
| Four-sentence paragraph | 318 / 322 | 1–64 | 0 |
| Sentence 1 | 99 / 101 | 1–16 | 0 |
| Sentence 2 | 67 / 69 | 1–16 | 0 |
| Sentence 3 (circumference and ego) | 72 / 72 | 1–16 | 0 |
| Sentence 4 | 80 / 80 | 1–16 | 0 |

Total **6,531,584** placement-period-clock-tokenization checks. All 20 matching hidden periodic-alphabet plants pass. Plants use invertible phase-specific affine maps of GP29; they validate compatibility retention, not unique recovery or a language discriminator. The exact committed CommonJS source was read back and executed in the connected JS isolate with only Node file/assert/console adapters; no Windows CI or standalone Node invocation claimed.

[SFT](../sims/lp2_inge_circumference_periodic_crib_sft.cjs), commit `85586e52a77abb17a7529b6638779d45cd596f7d`, blob `bab8012a94820d4fb1a57fadbdcf4229bc4a85e8`.

## Decision

Do not promote this literary parallel to a source-authenticated key. No exact quotation survives even after admitting arbitrary independently permuted alphabets at the stated periods. Paraphrase, other excerpts, larger periods, clock resets inside the excerpt, transposition, and nonperiodic keying remain outside the test. No unknown LP2 plaintext, authentic key, or destination recovered. No further arbitrary Inge-key searches are justified absent an independent reference.
