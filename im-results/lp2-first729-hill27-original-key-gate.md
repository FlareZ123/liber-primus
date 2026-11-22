# LP2 opening 27×27 GP29 array as a Hill key for subsequent visual chapters

**Agent27, 15 November 2026. Bounded negative on original ciphertext. No key or unknown plaintext recovered.**

## Original clue and fixed inverse

The physical LP2 opening pp0–2 has exactly **729 = 27×27 original GP29 runes**. In the standard 29-rune alphabet, this supplies 27 consecutive printed-order rows of length27. The resulting literal **27×27 matrix M is full rank 27 over GF(29)**, making it a mathematically valid invertible Hill key without fitting any symbols.

A human player could notice the 27² length and its relation to the prime modulus29. **No first-party instruction authenticates Hill27, the grouping, or using the first chapter as a key**, so this is a strictly one-route test. The published [original image chapter atlas](lp2-global-original-visual-section-map.md) fixes the first two untouched test spans as physical **p3–7 (1,145 runes)** and **p8–14 (1,729 runes)**.

Freeze 27 GP29 ciphertext runes as a column vector and apply one of the two mathematically natural fixed matrices, `M^{-1}` or `(Mᵀ)^{-1}`, to each complete block modulo29, with no inferred IV, pad, address, phase, or key. For completeness also test the two inverse orientations, `M` and `Mᵀ`, since the source has not selected encrypt-versus-decrypt direction. Hold the terminal partial blocks (11 and one original runes respectively) out of interpretation rather than invent padding.

The [read-only Node22 source test](../sims/lp2_first729_hill27_source_inverse_sft.cjs) checks exact 729 original source inputs, rank/inversion algebra on all 27 basis vectors, and 81/81 synthetic GP29 recovery on **original clear p57 PARABLE** with both original and transposed key.

## Original-cipher test

[Windows Node22 run 43711787410](https://github.com/FlareZ123/liber-primus/actions/runs/43711787410) passed with the unchanged source manuscript. Every output is nonlinguistic and near-uniform. Original GP29 coincidence probabilities are p3–7 **0.034634** and p8–14 **0.034460**. The candidate decoded IoCs are:

| Frozen source matrix applied | Original p3–7, 42 blocks | Original p8–14, 64 blocks |
| --- | ---: | ---: |
| `M^{-1}` | 0.034623 | 0.034252 |
| `(Mᵀ)^{-1}` | 0.034406 | 0.034718 |
| `M` | 0.034732 | 0.034389 |
| `Mᵀ` | 0.034448 | 0.034466 |

The native solved p57 plaintext control IoC is **0.06270997**. The complete first 135 decoded GP29 runes for each of eight outputs are printed in the runner logs, with no coherent text. Validity of the synthetic Hill inversion does not establish decryption of original ciphertext.

**Decision:** reject the direct `27×27 original-p0–2 key → 27-rune Hill block transform` in these two authentic neighboring sections, under precisely these source order, matrix directions, GP29 modulus and complete-block alignment assumptions. Altered grouping, nonlinear processing, or a different source-selected operator remain untested. The full-rank property alone is expected of many random square matrices and is not a first-party instruction.

This is a bounded original-input negative for the reusable [primary solution research](../results/README.md). It does not invalidate independently pursued 27×27 sparse-node readings, nor any actual authored source clue that may later prescribe a different consumer.
