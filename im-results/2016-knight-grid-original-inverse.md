# 2016 image dimensions → knight-step grid traversal: bounded original LP2 inverse

**Agent 49, 10 November 2026. Evidence class:** independently archived source dimensions, explicit but speculative chess traversal, and an original-ciphertext negative with a correctly recovering English plant. **No unknown LP2 plaintext, authentic key, recovered cipher, or final destination.**

## A source-visible operation and its weakness

The archived Cicada 2016 **563×569** JPEG is mirrored in [resources/historical/cicada2016-4gq25.jpg](../resources/historical/cicada2016-4gq25.jpg), with the original-image dimensions verified independently in [the existing 2016/T6 source study](2016-image-dimensions-lag6-source-derivation.md). That study found a six-step, doubly-valued pair of cells in the 32×8 original LP2 numerical table:

- 563 mod 256 = **51**, grid coordinate **(6,3)**, byte **59**.
- 569 mod 256 = **57**, grid coordinate **(7,1)**, byte **118**.
- Their displacement is **(+1,−2)**, a legal chess **knight move**; the destination byte doubles the source byte.

This suggests a distinct, lossless ordering of all 256 printed bytes: start with the fixed cells **51→57**, then use the standard **Warnsdorff minimum-onward-degree chess-knight tour** on the 32×8 table. Break ties using clockwise direction order. Since the image does **not** specify which of the eight directions starts that order, preserve all eight rotations rather than fitting arbitrary cell keys. Each of the eight fixed orders visits **all 256 cells exactly once** without backtracking; rotation 0 begins at cell indices **51,57,40,25,8,2,12,6**.

**Important specificity correction:** the extra chess interpretation adds little independent evidence to the original six-step clue. Among the table's 250 legal row-major index pairs separated by six cells, **186/250 = 74.4%** already describe a knight move. Thus the selected 51→57 geometry is common *conditional on the six-step offset*. No source text explicitly instructs a knight's tour, Warnsdorff tie-breaking, a byte-to-GP alphabet, or an LP2 key phase. This is a testable solve-path hypothesis, not a recovered historical instruction. The 2016 artifact also postdates the first LP2 release and may only be a later hint.

## Frozen original-cipher inverse

All **55** original unsolved rune-bearing physical LP2 pages (**12,956** GP29 runes, p50 skipped) and all **256** source-table bytes remain unchanged. For each of eight tour rotations, apply the visited bytes modulo the relevant alphabet as a 256-step key, with one of two source-coordinate clocks (whole-book continuous or reset at each physical rune page), both additive signs, and three reversible emission assumptions:

1. GP29 direct additive key: invert C = P ± K mod29.
2. GP28 predecessor-exclusion by sorted rank, with the **86 observed equal adjacent ciphertext steps** decoded provisionally as GP-EA index28 and page-first rune transmitted unchanged.
3. The same conditional GP28 emission using cyclic predecessor ranks.

This gives **8×2×2×3 = 96** completely specified source-selected models. No unknown key values, page phases or plaintext phrases are fitted. Key-dependent plaintext is ranked using 29-symbol **index of coincidence**, and the first and last **6,478** original GP runes form training/holdout halves. The script selects one model using training IoC alone, then evaluates the frozen setting on the untouched half. It also records the retroselected best holdout as a diagnostic, never as confirmation.

| Quantity | Original result |
| --- | ---: |
| Ciphertext IoC (all unsolved runes) | **0.0344783979** |
| Source tour coverage | **256/256 cells**, all 8 tie rotations |
| Models evaluated | **96** |
| Frozen training selection | **rotation 6, cyclic GP28, global clock, positive inverse sign** |
| Frozen training-half IoC | **0.0354220837** |
| Its untouched held-out IoC | **0.0352685016** |
| Highest retrospectively selected held-out IoC across all 96 | **0.0353485816** |

The frozen and retroselected GP28 held-out scores are near the correct conditional-rank random baseline, approximately **0.03527** after explicit repeats and page-initial symbols. The uniform GP29 baseline is **1/29≈0.03448** and must **not** be used as a favorable GP28 null. No original model yields a sustained GP-native language distribution or coherent original text. Direct inverse/re-encryption of arbitrary original ciphertext is a bijective identity and supplies no independent evidence.

## Independent true-key recovery controls

With the exact rotation-0 knight byte key, greedily encode the committed Shakespeare source into **12,956 native GP runes**, keeping its multi-letter GP symbols. Two full-length source-key forward/receiver checks demonstrate sensitivity to genuinely enciphered natural text:

- **Direct GP29 with collision rewriting:** create the full 12,956-rune ciphertext under the true key. When its new output would equal the preceding emitted glyph, overwrite with the next GP symbol with probability 0.81 using a fixed xorshift32 seed. The decoder knows the source key but receives no overwrite locations. Exactly **388** glyphs are altered; **12,568/12,956** native-English runes survive the frozen inverse. The recovered IoC is **0.0581268621**.
- **GP28 sorted predecessor-exclusion and explicit EA repeat:** independently encipher the same full 12,956-rune source and invert with the exact secret key and predecessor table. **12,956/12,956** plaintext runes are reconstructed. Its IoC is the source value **0.0594814096**.

These controls show that the failed original inverse is distinguishable from a source-true English encryption under the stated models. They do not authenticate the chess route or imply the real LP2 uses any tested emission.

## Conclusion and next discriminant

The dimension-selected knight tour provides a **complete source-constrained permutation**, but applying its bytes as a direct repeating GP key does **not** recover plaintext under any of the declared 96 configurations. The more compelling source data remain the exact 51/57 cell correspondence and the potential six-lag affine ciphertext motif documented in the existing 2016 source study. A different role for a knight tour should be investigated only if a **new independent clue** specifies a transport or key/state and predicts an exact original-page outcome. Retesting other tie priorities or arbitrary key phases is unlikely to move this toward a solution.

**Single-file CommonJS reproducer and seeded source-native controls:** [sims/knight_grid_2016_dimensions_original_inverse.cjs](../sims/knight_grid_2016_dimensions_original_inverse.cjs), Node 22, reads only tracked source files and writes nothing. Source JPEG dimensions: [2016 archive note](../resources/historical/cicada2016-4gq25.md); canonical [grid](../resources/liber-primus/base60-grid.json) and [corpus](../resources/liber-primus/lp2-corpus.json).
