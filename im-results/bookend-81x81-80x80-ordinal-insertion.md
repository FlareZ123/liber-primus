# A source-aligned 81×81 / 80×80 bookend hypothesis with five printed ordinal inserts

**Status: intermediate structural hypothesis with a finite original-input exclusion, 11 November 2026. No unknown Liber Primus plaintext, authentic key, decoder or destination recovered.** Reproducer: [single-file SFT](../sims/lp2_bookend_80grid_five_ordinals_sft.cjs).

## Exact source arithmetic and proposed human path

The unsolved second-release corpus has 12,956 GP runes. Its sole repeated adjacent two-word ciphertext type is the 3+3-rune pair ᛞᛄᚢ / ᛒᛖᛁ, appearing at positions 6,555–6,560 and 12,950–12,955. The first occurrence therefore ends at **6,561 = 81²**, within physical p27 (page-local cut 34). The suffix has **6,395** runes. An independently visible, nonrunic feature occurs entirely in this suffix: **five red Arabic-ordinal paragraph labels**, numbered 1 through 5, on pp36–38. Their source body starts at absolute rune positions **8,805, 8,944, 9,035, 9,133, 9,229**; the last paragraph ends at 9,358. Original prose lengths between starts/terminal end are **[139,91,98,96,129]**, summing to **553 = 7×79**.

Treating each printed numeral as exactly one nonrune position expands the suffix from 6,395 to **6,400 = 80²** slots. The five natural pre-paragraph insertions have resulting zero-based 80×80 row/column coordinates:

| Paragraph numeral | Absolute rune offset before insertion | Linear slot after insertion | Row | Column |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 8805 | 2244 | 28 | 4 |
| 2 | 8944 | 2384 | 29 | 64 |
| 3 | 9035 | 2476 | 30 | 76 |
| 4 | 9133 | 2575 | 32 | 15 |
| 5 | 9229 | 2672 | 33 | 32 |

This supplies a possible historical solve path: notice the exact repeated terminal two-word phrase, count the square-sized first passage, then view the five *actual printed* ordinal labels as the apparent missing cells of a next-smaller square. The difference **81²−80² = 161** is a single removed L-shaped border of an 81×81 matrix. However, the choice to count exactly those nonrune glyphs as cells is **a hypothesis**. Other drawings, punctuation marks and tables also occur in the manuscript. No instruction directs a human to make these grids, compare them or use GP residues as a field.

## Frozen original-cipher test and decision

The 81×81 first block can furnish an 80×80 source pad by cropping any of its four corners, or by applying one of four canonical 2×2 local operations on its 80×80 adjacent blocks: horizontal difference, vertical difference, mixed finite difference and determinant. For each mask, take its eight dihedral orientations and both modular-addition signs. This is exactly **64 crop + 64 adjacent-block = 128** original-source variants. The five ordinal slots are retained for square geometry but omitted from the 6,395-rune plaintext statistics.

For each variant, decode the authentic trailing ciphertext by a fully specified GF(29) additive inverse. Every variant is fully reversible when its key is fixed, and a separate 6,395-symbol GP-encoded Gibran literary plant is recovered *exactly* through its corresponding forward encoder and inverse. Source-native plant success is an implementation control, not historical key identification.

All actual outputs remain ciphertext-like. The **largest original top-12-symbol concentration is only 2,863 / 6,395 (44.769%)** among all 128 inversions; the highest IoC is **0.034586030737**, near the uniform GP29 value 1/29. By comparison, among **18 fixed 6,395-rune Gibran GP reference windows** (step 3,197), the smallest top-12-symbol concentration is **4,881 / 6,395 (76.325%)**. An *arbitrary single hidden GP alphabet relabeling* preserves the top-12 count, so it cannot repair any of the 128 original outputs into a source-like direct GP literary register.

**Scope:** This retires these 128 specific square-crop and local-differential additive inverses, with an optional one-to-one alphabet relabeling. It does not exclude a real 81→80 construction using unobserved state, transposition, non-GP intermediate text, compression, more complex geometric operations, different marker insertion semantics or non-English plaintext. Nor does the exact square count authenticate that the five red numerals were intended as cells. Do not expand this into unmotivated large geometry/parameter searches without a new independent clue.

## Reproduction inputs

The single-file Node 22 CommonJS SFT uses the canonical [page/runic source](../resources/liber-primus/lp2-corpus.json), [source numbered-interval audit](../sims/lp2_cuneiform_seven_five_square_sft.cjs), and untouched [Gibran reference](../resources/control/gibran_prophet_58585.txt). It asserts both copies of the original six-rune bookend, all counts and five insertion coordinates, the exact 128 configurations, fixed native comparison, and complete roundtrips. Its source assumptions and finite exclusions can be rerun without any fitted original key.
