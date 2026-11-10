# LP2 79/78 circumference peel: primitive-root and matrix tests

**Status: bounded negative.** No plaintext recovered.

## Source geometry

The 12,956-rune stream splits exactly into 81² = 6,561 and 80²−5 = 6,395. The repeated six-rune bookend `DJUBEI` occurs at first-block offsets 6,555–6,560 and second-block offsets 6,389–6,394 (global 12,950–12,955). Treating the five absent terminal cells as the final five positions of the second 80×80 square places all five on its bottom perimeter; the second six-rune marker ends immediately before them. This terminal-hole placement is a hypothesis, not an observed image-level fact.

Peeling one outer ring gives a 79×79 first interior and a 78×78 second interior. The p53, p15 and p40 red spans have lengths 51, 9 and 8; their **GP prime-value sums** are respectively 2,262 = 29×78, 638 = 29×22 and 435 = 29×15. The reproducer explicitly sums `GP.prime[runeIndex]`, not rune indices.

Since 79 is prime, 53 is a primitive root modulo 79, and 78 = φ(79), the first 79×79 interior can be indexed by nonzero F79 residues. Dropping the last row/column (the 1-based residue-zero position) gives a 78×78 matrix to compare with the second interior. Powers of 53 enumerate the 78 nonzero residues; the red-derived values 22/15 are tested as row/column phase offsets.

There is a second, independent primitive-root source. The repository's documented 2013 Parable ID3 number is

`N = 1,595,277,641 = 1,259 × 1,031 × 1,229`,

the product of the three p57 clause sums. It gives `N mod 79 = 68`; 68 has multiplicative order 78 modulo 79 and is therefore another primitive root for the same 78-cell interior. The same source gives `N mod 3301 = 70` (documented in [the Parable multiplicative-pad audit](parable-primitive-multiplicative-pad.md)); this matrix test uses only the directly relevant F79 residue 68.

## Tests and results

Two direct algebraic relations were tested over F29.

- **Cellwise key-pad relation:** reorder the first 78×78 interior by raw coordinates, powers of 53, reverse powers, red-derived phase offsets (22,15)/(15,22), and powers of the 2013 Parable root 68 (forward/reverse); subtract/add it cellwise from the second interior. Across **18 settings**, the best is the source-derived `pow68-parable-2013` mapping with positive B−A: continuous GP-trigram mean **−4.1378**, mutual information **0.06163 nats**, and unrestricted row accuracy **0.06131**. The best powers-of-53 phase result is −4.1380. These are effectively ciphertext-level scores, not English.

- **78×78 Hill-matrix relation:** use the first interior as a key matrix, with raw, powers-of-53, both red-phase bases, and powers-of-68 forward/reverse. Test both A⁻¹B and BA⁻¹. All **12 matrices have full rank 78** over F29. The best is the Parable-root-68 forward matrix under A⁻¹B, mean **−4.1372**; the best powers-of-53 result is −4.1443. No output contains a readable passage.

The native ciphertext mean is **−4.1493**, versus **−2.4185** on the untouched Shakespeare test. Source-paired key/cipher mutual information remains approximately 0.06 nats and row accuracy approximately 0.06. Exact synthetic cellwise and Hill roundtrips recover all **6,084** planted runes for both root-53 and root-68 maps, validating the indexing and modular arithmetic.

The language score is a continuous GP trigram model (0.8 smoothed trigram + 0.2 smoothed bigram), trained on the first 200,000 Shakespeare characters and evaluated on characters from 240,000 onward. This is appropriate for a grid whose word separators have been removed.

## Decision

The specified circumference peel, F79 power orderings, red-derived phases, and direct mod-29 cellwise/Hill relations do **not** recover GP-English. The 2013 Parable number supplies a genuine, independently sourced primitive root 68 modulo 79, but this natural direct matrix use also fails. This rejects only these direct matrix relations under the stated terminal-five and residue-zero conventions; it does not reject the circumference clue, the terminal-five placement, other transpositions/stateful operations, or an external role for the red spans. Do not expand this into unconstrained matrix/orientation sweeps.

**Reproduction:** [script](../sims/lp2_79_78_peeled_primitive_root_probe.cjs); [path-filtered CI run 42906260987](https://github.com/FlareZ123/liber-primus/actions/runs/42906260987). The root-68 extension is also runnable through [its workflow](../.github/workflows/lp2-79-78-peeled-root68.yml). Historical source relation: [Parable ID3 multiplicative-pad audit](parable-primitive-multiplicative-pad.md).
