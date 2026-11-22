# LP2 p15 composite 6×6 square: red20 border and 4×4 numerical interior

**Classification, 11 November 2026 (Agent 41):** A new original-source-selected candidate six-symbol key matrix, tested against the untouched p15 black ciphertext. All eight directly reversible Hill6 variants are nonlinguistic. The finite test yields no decrypted unknown plaintext, authenticated key, or established cipher.

## The stronger source geometry

Physical p15 of Liber Primus release 2 (original JPEG `resources/liber-primus/32.jpg`) prints two **spatially separate red rune headings** and a **4×4 numerical Fibonacci-prime square**. The first red heading is above the square and has 9 runes; the second is underneath the infinity sign and has 11. Three original red 13-dot punctuation marks lie immediately before the first heading, between headings, and between the second heading and black body. The source's three marked parts are consequently unambiguous even though the transcription flattens them into a single rune sequence.

The source-exact counts make a 6×6 composite more constrained than an unstructured key search:

- The two red headings have **9+11=20** GP runes. This is exactly the 20-cell border of a **6×6** square.
- The printed numerical square contains **16** values, exactly the **4×4 interior** of a 6×6 square.
- The complete hypothetical key therefore uses all **36=20+16** red-and-number positions, with no fillers or secret parameters.
- After the third red 13-dot punctuation, p15 has **139 black ciphertext runes**, beginning with original GP **I (index10)**. Treating that one source-boundary rune as a transmitted initial register yields **138=23×6** remaining runes.

**Hypothesis choices:** The manuscript gives no instruction to surround the printed square with a rune border, equate numerical entries with matrix coefficients modulo29, treat the initial black I as an IV, or apply a Hill cipher. The exact numerical correspondences motivate this bounded reversible test but do not authenticate it.

## Two frozen border readings and exact matrix inverses

Keep the 4×4 numerical entries **in their originally printed rows and columns**, reduce their values modulo29, and place them in the middle of the hypothetical 6×6 key. The 20 red heading runes, top title first and bottom title second, fill the border in either of two natural ways:

1. **Clockwise perimeter:** start upper-left, continue clockwise around the border.
2. **Printed row-major perimeter:** read border cells in line order, left to right.

Both are invertible over the manuscript's GF29 alphabet, with exact determinant **24 modulo29**.

Clockwise source key:

```text
[[ 0, 1,20,19,24,28],
 [21,10, 3,20,22,26],
 [ 0, 1,22,21,25,22],
 [16,11,17,19, 7,24],
 [ 9,21,17,12,22,20],
 [17, 1, 5, 9,21, 1]]
```

Printed row-major source key:

```text
[[ 0, 1,20,19,24,28],
 [26,10, 3,20,22,22],
 [24, 1,22,21,25,20],
 [ 1,11,17,19, 7,21],
 [ 9,21,17,12,22, 5],
 [ 1,17, 9,16, 0,21]]
```

For each matrix, apply the direct matrix and its exact inverse, both row-vector and column-vector conventions, to all **23 original six-rune blocks**. The original source uses no inferred word boundaries inside these blocks. No key phase, matrix coefficient, page offset, or English scoring is fitted.

## Original-input results

| Source border read | Direct column IoC | Direct row IoC | Inverse column IoC | Inverse row IoC |
| --- | ---: | ---: | ---: | ---: |
| Clockwise | 0.0348037660 | 0.0348037660 | 0.0340632603 | 0.0336401142 |
| Printed row-major | 0.0324764625 | 0.0340632603 | 0.0320533164 | 0.0342748334 |

The actual original **138-rune** ciphertext has IoC **0.0348037660**; all eight proposed outputs remain close to the uniform 29-symbol value **1/29 ≈ 0.03448276**. None gives an intelligible GP transliteration or ordinary GP-English-like concentration.

Each hypothesis exactly forward-reencrypts **138/138** original ciphertext runes. The test additionally uses **138 known GP runes** built from the genuinely solved p57 PARABLE (95 runes followed by its first43) and plants encrypted ciphertext under the same key/orientation choices: all **eight** recover their complete known plaintext exactly. These checks establish algorithmic reversibility without certifying historical use.

## Decision

The **20-rune red border +16-number interior** construction is a concrete, source-visible candidate for what the unusual two-title layout might indicate. Its strongest new feature is a complete 6×6 numerical/rune key with a natural single-symbol IV and exact original-body packet length. **The two direct border readings and four linear decoding conventions per reading fail to decrypt p15.** Treat the geometric relationship as a speculative clue and retire those exact Hill6 operations. A nonlinear square instruction or differently evidenced register would have to be selected independently before further tests. Do not multiply arbitrary rotations, fitted offsets, or cipher families from the same 36-value coincidence.

**Reproducer:** [single-file Node 22 CommonJS SFT](../sims/lp2_p15_red20_square16_hill6_sft.cjs) using only `resources/liber-primus/lp2-corpus.json` and `lp2-ink-annotations.json`; it verifies the red source positions, initial I, original page length, matrices, inverses, expected output IoCs, exact original roundtrips and full positive plaintext recoveries. Read-only, no external packages.
