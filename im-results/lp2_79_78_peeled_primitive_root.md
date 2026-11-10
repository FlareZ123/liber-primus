# LP2 79/78 circumference peel: primitive-root and matrix tests

**Status: bounded negative; no plaintext recovered.** This tests one source-constrained interpretation of the solved-page instruction to shed circumferences, together with the red-triangle 53/79/78 arithmetic.

## Source geometry

The 12,956-rune stream splits exactly into 81² = 6,561 and 80²−5 = 6,395. The repeated six-rune bookend occurs at first-block offsets 6,555–6,560 and second-block offsets 6,389–6,394 (global 12,950–12,955). Treating the five absent terminal cells as the final five positions of the second 80×80 square places all five on its bottom perimeter; the second six-rune marker ends immediately before them. This terminal-hole placement is a hypothesis, not an observed image-level fact.

Peeling one outer ring gives 79×79 and 78×78 interiors. The p53 red span sums to 2,262 = 29×78; the p15 and p40 spans sum to 638 = 29×22 and 435 = 29×15. Since 79 is prime, 53 is a primitive root mod79, and 78 = φ(79), the first 79×79 interior can be indexed by F79 residues. Dropping the last row/column (the 1-based residue zero) gives a 78×78 matrix, which can be compared with the second 78×78 interior. Powers of 53 enumerate the 78 nonzero residues; the 22/15 red values are tested as row/column phase offsets.

## Tests and results

Two direct algebraic relations were tested over F29:

- **Cellwise key-pad relation:** the first 78×78 interior is reordered by raw coordinates, powers of 53, reverse powers, and the red-derived phase offsets (22,15) and (15,22); subtract/add it cellwise from the second interior. Across 14 settings, the best continuous GP-trigram mean is **−4.1380**, essentially the original-cipher score **−4.1493** and far below the untouched Shakespeare test score **−2.4185**. The best setting is powers-of-53 with phase (22,15), positive B−A.
- **78×78 Hill-matrix relation:** use the first interior as a key matrix, with raw, powers-of-53, and both phase-offset bases. All four matrices have full rank 78 over F29. Test both A⁻¹B and BA⁻¹. The best mean is **−4.1443** (powers-of-53, BA⁻¹), again indistinguishable from ciphertext-level language.

The source-paired key/cipher symbol mutual information remains only **0.057–0.067 nats**, with unrestricted row accuracy **0.060–0.065**. No output contains a readable passage. Exact synthetic cellwise and Hill roundtrips both recover all 6,084 planted runes, validating the indexing and modular arithmetic.

The language score is a continuous GP trigram model (0.8 smoothed trigram + 0.2 smoothed bigram), trained on the first 200,000 Shakespeare characters and evaluated on characters from 240,000 onward. It is appropriate for a grid whose word separators have been removed.

## Decision

The specified 79/78 peel, F79* power ordering, red-derived phase offsets, and direct mod-29 cellwise/Hill relations do **not** recover GP-English. This does not reject the circumference clue itself, the terminal-five placement, other 79/78 transpositions, nonlinear/stateful operations, or an external role for the red spans. Do not expand this into unconstrained matrix/orientation sweeps.

**Reproduction:** [script](../sims/lp2_79_78_peeled_primitive_root_probe.cjs); manual option `peeled-79-78` in [Source-square matrix-state keystream challenge](../.github/workflows/clue-square-matrix-stream-manual.yml).