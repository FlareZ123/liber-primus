# Source-blind invariant under all 29 arbitrary stationary predecessor-row permutations

**Status, 10 November 2026:** source-key-independent conditional-rune distribution invariant, executed on original LP2 and independent English-GP positive controls. It is a broad statistical exclusion of the specified stationary causal cipher family under the GP-English plaintext-register assumption. **No original unknown LP2 plaintext is recovered.**

**Relation to existing stronger repository evidence:** The [previous-cipher S-box invariant](previous-cipher-sbox-invariant.md) already establishes a stronger exact GP-E count/capacity exclusion of this same stationary predecessor-state class (maximum 769 occurrences of any plaintext symbol, versus 1,574.5±33.3 expected GP E). The conditional-IoC test below supplies a **different independent, key-free distributional diagnostic and a word-position-conditioned source control**. It must be read as complementary confirmation, not as the repository's first or strongest exclusion of this family.

## The complete unknown-key cipher class

Index the GP runes 0..28, reserve index 28 (EA) for an exact repeat of the previous ciphertext rune, and allow **an arbitrary 28-permutation \(\pi_x\)** for every previous ciphertext rune \(x\in\{0,\ldots,28\}\). Specifically, at any position after the physical page's first rune:

\[
C_i=\begin{cases}
C_{i-1},& P_i=28,\\
\pi_{C_{i-1}}(P_i),& P_i\in\{0,\ldots,27\},
\end{cases}
\]

where each \(\pi_x\) is a bijection from the 28 possible plaintext indices to the **28 outputs distinct from x**. There is no algebraic, cyclic, additive, or short-key restriction: each row can be any of **28!** permutations. This includes all first-order, stationary ciphertext-dependent 28-ary substitution systems respecting the proposed EA nonrepeat convention. The first rune on each page serves as the openly transported initial state. Historical use remains conjectural.

**Key-free invariant:** For each predecessor state \(x\), collect counts \(n_{x,y}\) of the nonrepeat next ciphertext runes \(y\ne x\), and compute within-row index of coincidence:

\[
I = \frac{\sum_x\sum_{y\ne x}n_{x,y}(n_{x,y}-1)}
         {\sum_x n_x(n_x-1)}.
\]

For any fixed unknown \(\pi_x\), it merely **permutes** counts within row x, so I is **exactly invariant** to all unknown keys, including the entire \((28!)^{29}\) keyspace. This is a deterministic mathematical fact, independent of English. Interpreting I as linguistic evidence requires the separate plaintext-source model: if original plaintext is English-like GP, individual rows should be concentrated, hence I should resemble the independent GP-source control rather than \(1/28\). Repeating the calculation in 261 groups defined by predecessor rune *and canonical word offset, capped at eight* gives a second, strictly more conditioned diagnostic that can expose word-aware nonuniformity.

This test is intentionally immune to the immense combinatorial key search that direct substitution solving would require. It can reject a family without reconstructing a single candidate key.

## Original, planted and matched null results

The original input comprises 12,956 canonical GP ciphertext runes. Discard physical page-first symbols and unchanged predecessor transitions (the putative EA tag). The 2,896 whole canonical words and their printed positions are retained exactly.

| Source and grouping | Conditional IoC | Number of groups | Number of within-group ordered pairs |
| --- | ---: | ---: | ---: |
| Original LP2, predecessor state | **0.0357991433** | 29 | 5,662,426 |
| Original LP2, predecessor + word-position state | **0.0359500522** | 261 | 913,434 |
| Secret arbitrary 29-row permutation of GP-English plaintext, predecessor state | **0.0640361519** | 29 | 5,774,738 |
| Same true secret permutation plant, predecessor + word-position | **0.0638752017** | 261 | 929,500 |

The independent GP-English source is a *contiguous 12,956-rune segment* of the committed Shakespeare-to-GP control. All 29 row keys are separate seed-shuffled, **unrestricted random 28-permutations**, and the positive encoder is exactly reversible: **12,956/12,956 plaintext runes recovered** using the true unknown-table inverse. The positive source preserves natural English-GP sequential dependencies. Its conditional IoC ≈0.064 is dramatically different from the essentially uniform original.

For a controlled local null, preserve the exact original positions of 86 same-rune transitions and the entire original page structure, but replace every nonrepeat next rune by a seeded uniform choice among the 28 possible outputs. Run **160 independently seeded matched-marker surrogates**:

| Grouping | Null mean ± SD | Null observed range | Original |
| --- | ---: | ---: | ---: |
| Predecessor alone | **0.03572091 ± 0.00011431** | 0.0353373 to 0.0360212 | 0.0357991 |
| Predecessor + word position | **0.03572418 ± 0.00026764** | 0.0350906 to 0.0364785 | 0.0359501 |

Original LP2 lies comfortably within the matched null range in both configurations. Meanwhile, an authentic first-order stationary permutation of independently sourced English-GP exhibits the expected unmistakable within-state nonuniformity.

## Limits and interpretation

The invariant has no English-source tuning and no unknown-key optimization. It provides strong conditional evidence that **LP2 is not the direct output of a stationary, arbitrary 29-predecessor-state permutation of ordinary English-like GP runes**, assuming the zero-step EA marker convention. Its mathematics applies to every independent 28-permutation row; our English-positive inference is validated only for the supplied Shakespeare control, and a different or compressed plaintext register could have much more uniform row distributions. A key varying with absolute time, word position, earlier ciphertext taps, external source keys, or a nonlinear plaintext preprocessing step falls outside the stationary single-predecessor model.

This establishes a meaningful boundary: there is little point brute-forcing 29 independent 28-permutations on the original pages to find English. Future attacks need **evolving keying, additional state, or a different register**, and should demonstrate any proposed exception through independent heldout plaintext recovery.

## Exact reproduction

- [Standalone conditional-permutation inverse and 160 matched nulls](../sims/conditional_permutation_ioc_invariant.cjs).
- [Passing manual GitHub Actions 42802789101](https://github.com/FlareZ123/liber-primus/actions/runs/42802789101).
- Companion experiments: [source-blind unknown-lag feedback](reversible-exponent-feedback-lookup.md), [lossless conditional word echoes](lossless-word-echo-permutation.md), [word-local lookup test](word-local-exponent-autokey-inversion.md).
