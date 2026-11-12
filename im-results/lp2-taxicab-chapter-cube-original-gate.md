# Source-visible 729 / 1729 chapter lengths and bounded cubic readout

**Evidence class:** exact original-manuscript chapter arithmetic, followed by a source-limited, reversible original-cipher experiment. **No unknown LP2 plaintext, key, or decoding operation recovered.**

## Candidate human solve path

The original Stage11 image order, red page-start headings and preceding-page red 13-dot stops select the first three substantive chapters at physical pages **0–2, 3–7 and 8–14**. The first contains **729** GP29 runes; the third contains **1,729**. These counts were established independently in the [source-visible chapter atlas](lp2-global-original-visual-section-map.md). Their combination has a potentially useful, previously untested mathematical reading:

- **729 = 9³ = 27²**, already the source basis for the provisional first-chapter 27×27 square.
- **1,729 = 9³ + 10³ = 1³ + 12³**, the Hardy–Ramanujan taxicab number, which has two representations as sums of two positive integer cubes.
- **1,729 = 7 × 13 × 19**. Seven is the number of physical pp8–14 scans, 13 is the separately visible large-dot count and 19 is the solved p57 PARABLE body word count. The factors were identified after observing the total; there is no original instruction combining these three clues.

The overlap between **729** and the first summand **9³** makes the cube hypothesis somewhat more constrained than an arbitrary factorization of a single observed number. However, it is still a candidate numerical reading. The pp8–14 source-page rune counts are **[255,268,263,273,261,272,137]**, so they do **not** provide seven physical layers of equal length 247. Neither original art nor a signed instruction specifies cube orientation or an even-layer reconstruction. No inference of intentional taxicab encoding follows from these exact equalities.

A cheap, decisive first check is whether the proposed cube or cuboid shapes alone describe an authentic **permutation cipher**. If so, a fixed geometric readout could expose coherent original plaintext and give a usable reversible operation without hunting an unconstrained key.

## Frozen source-original cubic inverse

[The runnable CommonJS SFT](../sims/lp2_taxicab_chapter_cube_sft.cjs) reads the canonical page rune indices and the checked-in, independently sourced first 300,000 Shakespeare characters. It trains a smoothed GP29 **conditional trigram language model on the first 75%** of that literary source and reserves the final quarter for independent native-language windows. The score is the average natural log conditional probability per rune, so higher scores are more language-like.

For each of eight source-count interpretations, the SFT exhausts the exact **48 reversible ordinary three-dimensional reads**: six axis orders and eight independent axis-direction reversals. It does not fit a rune substitution, key, cipher state, word spelling or segmentation to any original result.

| Original-input interpretation | GP runes | Raw trigram score | Best of 48 | Best axis order / reverse mask |
|---|---:|---:|---:|---|
| pp0–2, full 9×9×9 | 729 | −5.912137 | **−5.873146** | 012 / 4 |
| pp8–14, first 729 as 9×9×9 | 729 | −5.918111 | **−5.693697** | 210 / 0 |
| pp8–14, last 1,000 as 10×10×10 | 1,000 | −5.939389 | **−5.793325** | 120 / 7 |
| pp8–14, first 1,000 as 10×10×10 | 1,000 | −5.929605 | **−5.814128** | 102 / 2 |
| pp8–14, last 729 as 9×9×9 | 729 | −5.935464 | **−5.749902** | 120 / 0 |
| pp8–14, drop first, 12×12×12 | 1,728 | −5.931061 | **−5.804418** | 201 / 6 |
| pp8–14, drop last, 12×12×12 | 1,728 | −5.929227 | **−5.800895** | 201 / 6 |
| pp8–14, 7×13×19 cuboid | 1,729 | −5.931833 | **−5.786757** | 210 / 5 |

The 45 held-out, untouched **1,729-rune native-GP English windows** score between **−2.572122 and −2.222880**, far above the best original readout **−5.693697**. A source-native 729-rune English plant is placed under a nontrivial three-dimensional orientation, exactly restored by the positional inverse and language-like after decoding. The source-original readings remain ciphertext-like.

These results reject the **direct, unkeyed axis-permutation-only** interpretation for this fixed 48-symmetry family and English GP29 plaintext. They do not exclude more complex 3D traversals, independently sourced keys, reversible nonlinear mappings, altered word-boundaries, binary intermediates or genuinely non-English plaintext. A higher score among 48 ciphertext-like candidates does not support plaintext recovery.

## Research decision

Keep the exact 729 / 1729 equalities as a conditional **mathematical clue candidate**, with their severe orientation and physical-page objections. Do not promote the taxi-number coincidence to a selected cipher architecture. Further cube-dependent key searches would be valuable only if an **independent source clue** specifies the cube packing, a changing-state operation, or a source-recoverable key. The simple geometrical route has been tested once and can be retired.

**Reproduction:** `node sims/lp2_taxicab_chapter_cube_sft.cjs` from the repository root, Node.js 22. The program reads only existing stable resources and writes no files.