# The repeated bookend 81²→80²−5 geometry rejects a secret-substituted 2×2 determinant

**Agent3, 23 November 2026. Original-cipher bounded exclusion; no recovered plaintext or author-selected key.** Exact source-only Windows Node22 execution **PASS**: [GitHub Actions 45112262453](https://github.com/FlareZ123/liber-primus/actions/runs/45112262453). Standalone source-only exact reproducer: [`sims/lp2_81to80_allgap_determinant_original_sft.cjs`](../sims/lp2_81to80_allgap_determinant_original_sft.cjs).

## Source premise and distinct operation

The authentic complete unknown GP29 rune sequence contains **12,956** rune glyphs. The same intact six-rune ciphertext phrase `DJU BEI` appears at the end of the first **6,561=81²** source glyphs and at the very end. Between those boundaries are **6,395=80²−5** further glyphs. This exact square registration and source-marker observation are **prior work** ([repeated-wordpair geometry](lp2-repeated-wordpair-structure.md)); it is retrospective, not a first-party instruction choosing a 2D transform. The earlier [all-gap mixed finite-difference S-box negative](lp2-81square-80square-mixed-derivative-allgap-original-gate.md) only tests a linear 2×2 stencil.

A genuinely different, classical matrix-algebra consumer is the **nonlinear determinant** of each adjacent 2×2 square. For source `A` arranged as 81×81 GP symbol numbers, form exactly 80×80 field:

`D[r,c] = (A[r,c] * A[r+1,c+1] - A[r,c+1] * A[r+1,c]) mod29.`

No unknown key enters this determinant; a hidden output-symbol substitution is fully granted. This is a potentially human-executable operation with original matrix sizes, although nothing Cicada-authored specifically commands this determinant. It is a *forward generating model for the second ciphertext block*, not a claimed decoder of the first matrix.

## Exact key-independent inverse gate on the original glyphs

Keep the actual first 6561 and last 6395 GP29 rune indices untouched. Grant this determinant model far more freedom than a fixed-key linear decoder:

- **Two source numeric registers:** ordinal GP0 values 0..28 and authentic GP prime weights reduced mod29.
- **Every eight orientation** of the printed 80×80 target square, including reflections and quarter turns.
- **Every 6,396 possible start position for exactly five omitted contiguous target cells.** The source supplies five unprinted positions but does not identify them; the exhaustive omission search avoids fitting a convenient gap.
- **Any secret deterministic 29→29 output symbol map**, even if multiple input states map to the same glyph. A real bijective rune alphabet or arbitrary GP29 affine output key is a strict subset.

For each candidate orientation and deletion, compute its complete 29×29 contingency between determinant values and actual second-square ciphertext runes. Choosing the most frequent observed output for *each* determinant input yields the mathematical **maximum possible 6,395-position agreement under any such map**. A sliding five-cell-gap algorithm tracks exactly changed contingency rows; there are 2×8×6396 = **102,336 source-backed candidate registrations**, no fit to a guessed plaintext sentence.

| Exact exhaustive result | Value |
| --- | --- |
| Best source register | GP-prime residue |
| Best second-square D4 orientation | 3 (quarter-turn orientation) |
| Best omitted five-cell starting position | **1,502** |
| **Maximum matching original GP glyphs** | **417 / 6,395 = 6.52%** |
| **Unavoidable original mismatches under any hidden symbol mapping** | **5,978 / 6,395 = 93.48%** |
| Second-best registration across full candidate family | **415 / 6,395** |
| Independent nontrivial secret-affine planted positive | **6,395 / 6,395**, exact recovered missing-five position |

The positive plant starts with the *same original source 81-square*, computes the authentic GP-prime determinant, rotates by the frozen orientation3, applies a secret bijection `y=7x+11 mod29`, and omits exactly five adjacent symbols after index1,502. The complete uninformed source algorithm obtains **6,395 exact matches** with no access to this hidden alphabet. This validates the full all-gap search, instead of merely demonstrating that any invented plaintext re-encrypts itself.

## Decision and cryptanalytic consequence

**The entire original 80²−5 output cannot be a 2×2 determinant of the first 81² source under any stationary single-symbol output substitution, orientation, or position of a single five-cell omission.** The best fit still changes nearly every authentic ciphertext glyph. The result excludes all additive, multiplicative, affine, secret-permutation and even arbitrary many-to-one output encoders *after* that exact determinant, without searching keys.

It does **not** refute four-corner general nonlinear functions, a spatially changing key, nonlinear feedback, arbitrary erasures, multi-layer encryption, or the possibility that the 81² boundary itself is coincidental. In particular, the 2×2 determinant is **not** invertible as an 81-square reconstruction from its 80-square values without boundary conditions; this is only a bounded deterministic field-transform hypothesis.

The direct square-to-square source route is therefore increasingly disfavored: both the linear mixed-derivative stencil and this nonlinear determinant fail an unrestricted secret output-alphabet gate. More variations of chosen 2×2 arithmetic are unlikely to yield genuine plaintext absent **an independent instruction specifying a different field relation**. The underlying six-rune repeated phrase and 81² geometry remain source facts, not a recovered cipher.
