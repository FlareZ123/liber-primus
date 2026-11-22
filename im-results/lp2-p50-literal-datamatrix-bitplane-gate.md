# Source-typed p49–p51 ECC200 literal-bitplane gate

**Corrected decision, 22 November 2026.** The original LP2 physical p49–p51 table prints exactly 256 two-character numeric cells in **32 rows of eight**, split 10+13+9 by printed page. Native 8×32 rectangular Data Matrix ECC200 has two 8×16 data regions and **88 mandatory marker cells**. An earlier full source test, [`sims/lp2_grid_8x32_datamatrix_finder_sft.cjs`](../sims/lp2_grid_8x32_datamatrix_finder_sft.cjs), **already rejects the canonical base60 literal-bitplane representation**, along with much stronger unconstrained static byte-symbol assignments. Our original 76-cell outer-border check was incomplete, and is superseded. The corrected test preserves the prior result while adding a second sourced byte reading and three direct folds into the **16×16 single-region ECC200** alternative. None exhibits the required exact finder. This is an incremental bounded negative, **with no recovered LP2 plaintext or key**.

## Source evidence and test grammar

The original table's rendered size naturally matches an 8×32 rectangular ECC200 carrier once rotated. It also contains 256 cells, exactly the number of modules in a 16×16 square ECC200 carrier. The latter has one data region, with **60** required solid left/lower and alternating upper/right border positions. The rectangular format has **two adjacent 8×16 regions**, each with solid L and alternating boundaries, hence **88** constrained positions. This structural distinction is essential, and corrects the earlier version of this report. Standard reference: ISO/IEC 16022, section on ECC200 finder patterns and rectangular symbol regions, also the original [8×32 gate](../sims/lp2_grid_8x32_datamatrix_finder_sft.cjs).

Input: `resources/liber-primus/base60-grid.json`, original 32×8 printed tokens. Read each pair as a byte under either the documented canonical **base60** alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` or the previously considered **base59-without-f** variant. No byte-offset, token substitution, bit-linear composition, PRNG, inferred key, guessed image mask, password or unknown-page rune string is fitted.

Inspect one of the eight original byte bitplanes, under the eight rigid rotations/reflections and black/white inversion. For the rectangle retain its canonical native 8×32 two-region finder. For the 16×16 square test three direct spatial folds: pair successive printed 8-cell rows, pair successive printed columns, and put printed rows 0–15 beside 16–31. These are 128 rectangle +384 square candidates per byte reading, **1,024 placements** in total, with no arbitrary column permutation. Each candidate is accepted only on a **perfect** correct finder, with no statistical threshold.

## Actual source results

| Original numeric reading | Native ECC200 format | Tests | Best matched required cells | Exact finder count |
| --- | --- | ---: | ---: | ---: |
| base60 | two-region 8×32 rectangle | 128 | 55 / 88 | 0 |
| base60 | one-region 16×16 square (three folds) | 384 | 39 / 60 | 0 |
| base59 without f | two-region 8×32 rectangle | 128 | 56 / 88 | 0 |
| base59 without f | one-region 16×16 square (three folds) | 384 | 40 / 60 | 0 |

For each native shape, synthetic printed-size positive controls embedding its **complete standard finder** pass: 88/88 and 60/60, respectively. Original 1,024-candidate output retains the chosen best transformation and exactly forward-detects its planted pattern. No source bitplane gives a complete required finder.

**Reproduction:** [`sims/lp2_p50_literal_bitplane_datamatrix_source_sft.cjs`](../sims/lp2_p50_literal_bitplane_datamatrix_source_sft.cjs), passing [Windows/Node.js 22 run 45004834139](https://github.com/FlareZ123/liber-primus/actions/runs/45004834139). The prior full base60 8×32 negative remains the authoritative stronger gate for that portion. This add-on's incremental information is the base59 alternative and the 16×16 natural-fold square geometry.

## Constrained conclusion and next fork

The source table does not supply a literal standard ECC200 finder under the specified byte readings, orthogonal bitplanes and natural rectangular/square layouts. Do **not** rescue this by tuning arbitrary bit recodings or an external secret mapping that the book has not provided. This result says nothing about other byte-oriented encrypted objects, a keyed steganographic projection, or an independently evidenced different data format. It does not advance a decoder to plaintext without new original instructions.

**Evidence:** original-source negative with two synthetic positives, prior-work correction. **Authenticated unknown-page text:** none.
