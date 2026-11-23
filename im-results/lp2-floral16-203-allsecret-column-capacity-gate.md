# Floral 16×203 black register: an all-secret fixed-column original-cipher obstruction

**Agent9, 23 November 2026. Scope: original-rune algebra and finite source-native-English control, without recovered plaintext, key or author-selected cipher.** The established 16×203 register is an exact physical source selection. This study tests an entire *unknown-key* direct-plaintext architecture instead of choosing any candidate shift, key or language-tuned column. It narrows a genuine potential cipher route but does not establish what the manuscript's author intended.

## Original source and explicit alternative

The original physical LP2 floral pages p40–55 comprise 3,316 GP29 symbols. The exact red spans are p40 beginning8, p53 ending51 and p54 beginning9 (68 total), so excluding every red rune yields **3,248 black symbols =16×203**. The original page order is kept, including the empty-rune numerical p50; there are no synthetic symbols or rejoined words. The 16 equal rows are created only after concatenating all black glyphs, so **row boundaries do not correspond to physical page boundaries**. Source: `resources/liber-primus/lp2-corpus.json`, `lp2-ink-annotations.json`, and [original image geometry](lp2-floral16-3299-source-geometry-gate.md).

Proposed architecture: place the putative 3,248-rune plaintext as sixteen 203-rune lines. At column `j∈{0,…,202}`, encode all sixteen rows using a *single unknown deterministic output function* `f_j:GP29→GP29`, potentially different for every column. An arbitrary secret bijection at every column includes ordinary 203-period substitution/Vigenère, affine, unknown alphabet, stationary nonlinear S-box and arbitrary per-column output relabeling. The stronger deterministic family even admits noninjective functions. Rival: the colored layout marks two distinct chapters, 203 may be incidental, and plaintext could undergo position mixing or a separate cipher layer.

## Exact theorem on the original columns

For each column `j`, let `h_j(s)` count occurrences of symbol `s` among sixteen rows. Set `E=Σ_j Σ_s binom(h_j(s),2)`, the number of same-symbol *unordered row pairs in the same column*. There are `203×binom(16,2)=24,360` possible pairs.

A deterministic column encoder satisfies `P[r,j]=P[r',j] ⇒ C[r,j]=C[r',j]`, so **E(C)≥E(P)** regardless of the 203 unknown functions, including maps that merge plaintext letters. For bijective functions the equality is exact: **E(C)=E(P)**. This bound is also invariant under any permutation of the sixteen rows within each column; changing the p15 spiral/page-row ordering cannot alter it. The law assumes that plaintext and ciphertext occupy these exact same coordinates. It says nothing about row-specific keys or position-changing cipher stages.

On the complete unchanged **3,248-rune original black tape**, the numerator is **E(C)=857**, giving `857/24,360 = 0.03518062397372742`. This previously recorded count was described only against random row rotations in the [geometry study](lp2-floral16-3299-source-geometry-gate.md); the new decision is the secret-key-independent **native-language impossibility gate** derived from it.

## Actual native-English donor controls

Use the repository's stable, source-labelled Shakespeare, Gibran and Emerson texts, convert every Latin word to GP29 using the established longest-match transliteration and `K,Q→C; V→U; Z→S`, and examine every *203-rune-stride* contiguous 3,248-rune window. This predeclared stride yields **2,917 overlapping windows**. They are neither independent draws nor an estimate of a universal probability; they are an exact finite matched-length comparison. Source titles and byte offsets are specified in the reproducer.

| Native GP29 donor | Windows | Minimum E | Median E | Maximum E | Windows with E≤857 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare `shakespeare_first300k.txt` | 1,062 | **1,321** | 1,467 | 1,648 | 0 |
| Gibran `gibran_prophet_58585.txt` | 275 | **1,333** | 1,493 | 1,639 | 0 |
| Emerson `emerson_essays_2944.txt` | 1,580 | **1,361** | 1,533 | 1,662 | 0 |
| **Original 16×203 source** | 1 | **857** | 857 | 857 | 1 |

Even the least repetitive donor window requires **464 more equal column pairs** than the actual ciphertext contains. Under the stated deterministic per-column encoding, *none of these 2,917 original-length English candidates can be the plaintext, irrespective of how the 203 secret functions are chosen*. A cipher that randomly merges letters only increases equal pairs and cannot rescue the class.

A planted positive encrypts a full native-GP Shakespeare donor under **203 distinct secret affine column functions**. It reproduces its exact 3,248 original plaintext symbols under inverse and preserves the native equality count; an intentionally noninjective 17-class column output likewise cannot decrease the count. These are controls for the algebra and software only, not a key recovered from original LP2.

## Source-selection and solve-path decision

The physical flower stencil is identically reproduced on all sixteen scanned images, including original quantized DCT data; its 13/31 black/outlined dot arrangement is static. It does not reveal 203 distinct column functions or choose a row clock ([source-image report](lp2-floral16-identical-margins-source-gate.md), [dot interpretation](lp2-floral-dot-masks-grid-row-original-gate.md)). The alternative 3,299-rune register is selected by removing **only the two introductory red headings** and keeping p53 red51; it does not naturally define 16 complete equal rows. Separately, p15's verified 4×4 Fibonacci-prime spiral supplies sixteen values and a 3299 seed, with no printed instruction that makes those numbers an alphabet, line permutation or codebook. The genuine twelve cross-page unfinished words strongly favor preserving physical text order rather than a bare p15 page spiral ([geometry study](lp2-floral16-3299-source-geometry-gate.md)).

**Decision for Director #2387:** The 16×203 register does *not* admit ordinary GP-native English via one stationary deterministic substitution per column, even with completely unknown 203 separate keys. This is a useful all-secret exclusion of the most direct proposed register consumer. Neither floral art nor historical instructions currently selects a different *typed*, reversible operation linking that register to plaintext, and neither 16×203 nor 3299 is thereby authenticated as a cipher framing. A proposal using changing row keys, a non-GP intermediate or a value-changing position mixer would need its own independent original-source clue and original-text test. Preserve the physical geometry for that future clue; **no new original LP2 plaintext, authentic key or destination has been recovered**.

**Reproducer:** [`sims/lp2_floral16_203_allsecret_column_source_sft.cjs`](../sims/lp2_floral16_203_allsecret_column_source_sft.cjs), a standalone read-only Node22/CommonJS program that asserts original page and red-rune counts, exact source E, all 2,917 native donor-window minima/ranges, and a reversible full-length GP29 planted control. All original/donor pair counts were also computed directly in one independent in-memory JavaScript execution of the exact connected GitHub source files before this report was committed. No separate GitHub Actions run is claimed.
