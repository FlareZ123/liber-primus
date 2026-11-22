# P32 peeled 9×9 matrix against the 81×81 first bookend square

**Original-cipher result, 12 November 2026 (Agent 39): direct source-key Hill inversion is negative. No unknown LP2 plaintext, authentic key, complete cipher or puzzle destination recovered.**

## Why this test is player-actionable

Three separate visible cues suggest a finite experiment. The original physical p32 tree page contains **121 complete runes**, naturally forming an **11×11** matrix. Its first printed row and first column have GP-prime sums **563 and 569**, the respective dimensions of the independently signed 2016 tree image. The solved p57 Parable expressly mentions shedding one's **circumferences**. Removing the one-cell outer circumference of the p32 square leaves a **9×9** block, precisely **81** cells.

The authentic repeated six-rune ciphertext pair at global positions 6555–6560 and 12950–12955 additionally places the first copy's end at **6561=81²**. A human could lay out those first 6,561 original runes as an **81×81** square, subdivide it into **81 nonoverlapping 9×9 tiles**, and try the p32 interior as a public matrix key. This path uses visible artifacts and ordinary finite-field arithmetic; **no original instruction explicitly selects Hill encryption or the bookend geometry**, so it remains a hypothesis.

## Fixed cipher and actual inverse

Keep p32 in printed 11×11 row-major orientation, deleting its first/last printed row and column exactly once. The interior matrix is

~~~
 7 17 19 15 22 18 10 27 22
 8 17 27  4 16  2  0  0  3
 3 19 18 14  7 23 15 20  0
17 12 27 20 24  7 23  9 25
26 19  6  2  7 14 27  2  7
 4 14 27 14 24  1 17  8 28
 1  8 12 21 27 28 11 15 13
22 21  3 19 17  1 23 15 17
 4 22 18  9  9  7  6  1 20
~~~

Those values are unchanged **GP ordinal indices 0–28**. Its determinant is **28 ≡ −1 mod29**. The other printed-source GP representation replaces each ordinal with the matching GP-prime weight reduced mod29; its determinant is **6**, also invertible.

For every original 9×9 tile C over GF(29), apply **six** fixed, exactly invertible maps for each source matrix M:

- left: M⁻¹C or MC;
- right: C(M⁻¹)ᵀ or CMᵀ;
- both: M⁻¹C(M⁻¹)ᵀ or MCMᵀ.

Every map has a known opposite-matrix encoder. No key, matrix entry, glyph, phase, tile index, language model, or reset is fitted to the original.

## Measured full original-input result

The first square is exactly 6,561 original rune positions. The original square IoC is **0.03452278058**, near the uniform GP29 value 1/29. Every one of the twelve inverses remains at the same level:

| Result | Source representation and direction | IoC |
| --- | --- | ---: |
| Highest of all 12 | GP ordinals, right-forward | **0.03455010390** |
| Second highest | GP-prime residues, right-inverse | 0.03454067085 |
| Lowest of all 12 | GP-prime residues, both-inverse | **0.03442078282** |
| Genuine solved p57 95-rune plaintext control | Original source-native GP runes | **0.06270996641** |

All twelve original plaintext candidates are unreadable in GP transliteration. The test supplies a complete explicit inverse on original ciphertext, yet none approaches the rune concentration of solved GP-English text. Each candidate correctly re-encrypts **6,561/6,561 original positions**; this checks implementation consistency for an invertible family and provides no independent authentication of a key.

For each map, an artificial 6,561-symbol source-native plaintext made by cycling the **actual 95 solved p57 runes** was separately encrypted by its opposite map and recovered **6,561/6,561**. This validates matrix orientation, tiling and inverses, while the repeated control is explicitly *not* an independent literary-language trial.

## Decision and reproduction

**Retire exactly these twelve direct GP29 Hill interpretations of the peeled p32 source matrix acting on the first bookend square.** The test does not rule out a different inner register, a distinct tiling rule specified by another clue, another physical book layout, unknown state, or a multi-layer cryptosystem. The attractive 11→9 and 81² geometry alone supplies no recovered key or prose.

[Single-file CommonJS reproducible original-cipher test](../sims/p32_peeled9_81square_tensor_sft.cjs) asserts the two original six-rune bookends, source 563/569 prime sums, both matrix determinants, all twelve full-source forward/reverse identities and all twelve exact positive plants, then prints every candidate's original IoC and first 32 GP symbols. The **exact committed script was independently executed against the exact repository source corpus**, and its printed maxima and controls agree with this report. No extra GitHub Actions workflow or repeated broad search was introduced.
