# Source-facing LP2 spread traversal: a lossless map and a bounded negative

**Classification, 10 November 2026, Agent 22:** exact original-manuscript position maps and an original-input, matched-null test of one physically motivated reading order. **No recovered plaintext, authentic cipher key, or verified historical traversal.** The result leaves whole-page permutations, hidden state, and source-identified nontrivial transpositions open.

## Visible source clue and exact coordinate maps

Original pages `25.jpg`–`31.jpg` (physical LP2 p8–14) feature alternating trees on their left and right margins. In a codex with p0 starting on a recto, physically facing decorated leaves would include **p9–10, p11–12, and p13–14**, with trees directed toward the gutter. A different binding parity gives p8–9, p10–11, and p12–13, placing the illustrated trees on the outer margins instead. The visual motif motivates testing a *horizontal facing-spread line interleave*: print line 0 from one page, line 0 from its neighbor, then line 1 from each, and so forth. It does not demonstrate that the creator intended that operation.

The [single-file source-coordinate reproducer](../sims/lp2_spread_traversal_sft.cjs) validates the exact 55 rune-bearing original pages against both the canonical rune corpus and slash-delimited physical printed-line transcription. It constructs two **bijective permutations of all 12,956 original rune offsets**, with an explicit inverse for each:

- **Even–odd spread convention:** p0+p1, p2+p3, ..., p54+p55. Exactly 27 paired spreads; runeless physical p50 is skipped without discarding the adjacent p51 runes.
- **Odd–even facing-page convention:** preserve the singleton p0, pair p1+p2, p3+p4, ..., p53+p54, and append singleton p55. Exactly 26 paired spreads; the p49–p50 pair is incomplete because p50 is the printed 256-byte table without a rune text stream.

Every original coordinate retains its physical page, page-local rune offset, printed-line index and rune column. Both constructed maps have 12,956 unique inputs and an exact inverse. No arbitrary ciphertext reordering, insertion, loss or later repair is needed.

## Source-ciphertext prediction

The original 55 rune-bearing ciphertext pages have only **4 equal neighboring GP runes at 539 physical line-wrap joins**. This is much lower than random GP29 emission's approximately 1/29 equal-rune rate. If a hypothetical single continuously repeat-suppressing ciphertext stream were produced *after* a facing-page line interleave and then printed in ordinary page order, the previously hidden cross-page line joins in the proposed interleave would also need to exhibit strong suppression. This is a **necessary diagnostic within that declared architecture**, not a universal property of a secret transposition.

Count two newly adjacent types: `AB`, the final rune of page A's line `k` followed by the first of page B's line `k`; and `BA`, page B's line `k` final followed by page A's line `k+1` first.

| Source-selected pairing | AB equal / joins | BA equal / joins | Combined |
|---|---:|---:|---:|
| Even–odd over all pages | 11 / 278 | 13 / 255 | **24 / 533** |
| Odd–even over all pages | 9 / 265 | 8 / 246 | **17 / 511** |
| Tree-facing subset p9–10, p11–12, p13–14 | 4 / 31 | 1 / 29 | **5 / 60** |
| Ordinary within-page printed wraps | | | **4 / 539** |

The cross-page counts are considerably less suppressed than ordinary printed wraps. More importantly, the same numbers must be calibrated against the original pages' actual first and last glyphs.

A 40,000-trial xorshift32-seeded conditional null **keeps every original left page, every original source rune and its order, and the number of printed lines on each right page fixed**. It shuffles complete right pages only within the same line-count class. This preserves every page's text, word boundaries, glyph inventories and visual line morphology while disrupting only the hypothesized paired alignment. The resulting one-sided *low-repeat* tests are:

| Pairing | AB observed vs null mean, lower-tail p | BA observed vs null mean, lower-tail p |
|---|---|---|
| Even–odd | 11 vs 10.93915, **0.597985** | 13 vs 9.31165, **0.943226** |
| Odd–even | 9 vs 9.882825, **0.461163** | 8 vs 8.04585, **0.581660** |

The ornaments could also suggest reflecting printed text across the central gutter. To grant each spread either left-first or right-first reading and independently reverse all printed rune lines on the left and right leaves, the test evaluates **eight explicit, invertible orientations per pairing**. Every null replica rescans the same eight and compares its *minimum* number of newly adjacent equal runes against the original's minimum, correcting for the chosen orientation within that family.

| Pairing | Original minimum over eight routes | Null mean of eight-route minima | Matched family lower-tail p |
|---|---:|---:|---:|
| Even–odd | **13** | 12.757025 | **0.616010** |
| Odd–even | **10** | 13.435250 | **0.103647** |

A detector-power control assigns two different synthetic GP symbols alternately along each exact source spread permutation; it has **zero** equal runes at both types of newly adjacent join. Both positive controls and the 12,956-position inverse assertions pass. This is a constructed layout-control cipher feature, not original plaintext recovery.

## Decision and usable output

**Neither physical pairing nor any of the eight simple mirror conventions exhibits a source-matched cross-page repeat-suppression effect.** The weaker odd–even family result (lower-tail p ≈0.104) cannot justify selecting a historical reading order, and the three tree-facing spreads by themselves have five doublets in sixty joins. An intended layout operation might apply *before* the cipher's repeat-suppression layer, use an evolving key per line, reorder whole pages, or draw a different instruction from the visible ornament. Those possibilities are outside the tested mechanism.

The reusable output is the **complete, reversible rune-coordinate traversal** under both codex parities, with exact original-source checks and clear source-specific boundaries. Original page-major text order remains the conservative default for any new original-cipher inverse until a stronger artwork or historical clue selects another clock. Any candidate that introduces a line-wise transposition should account for the manuscript's observed within-page antirepetition and supply an independent original-plaintext prediction.

**Reproduction:** [`sims/lp2_spread_traversal_sft.cjs`](../sims/lp2_spread_traversal_sft.cjs), Node.js 22, 40,000 seeded matched permutations separately for each parity; run from the existing manual-only [physical-line diagnostic workflow](../.github/workflows/physical-line-initial-crosspage-manual.yml) with `analysis=spread-interleave`. [Successful original-source GitHub Actions run 42881961970](https://github.com/FlareZ123/liber-primus/actions/runs/42881961970).
