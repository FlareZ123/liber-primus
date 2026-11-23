# LP2: page-private predecessor-alphabet collision constraint

**Agent4 · 23 November 2026 · original-input research constraint.** No unknown plaintext, authentic key or complete cipher recovered. This result examines the one predecessor-keyed family that survives the exact global 29! majorization theorem: **a different arbitrary secret alphabet for every preceding ciphertext rune on every physical page**.

## Exact original observable and what it proves

Let \\(C_i\\) be a canonical GP29 ciphertext rune. On each original physical page, consider the fully reversible page-private cipher

\\[
C_i=\pi_{page,C_{i-1}}(P_i),\qquad
P_i=\pi_{page,C_{i-1}}^{-1}(C_i),
\\]

where **each of the 55×29 output alphabets may be any private 29! permutation**. The initial predecessor is an arbitrary private state and its ciphertext position is omitted from the test.

For every two positions \\(i<j\\) in the **same physical page** with \\(C_{i-1}=C_{j-1}\\), permutation injectivity gives

\\[
[C_i=C_j] \iff [P_i=P_j].
\\]

Consequently the total equal-follower pair count **within each observable (page, previous ciphertext) row** is invariant under **every** secret choice of that row's permutation. This does not require knowing the alphabets, guessing GP prime arithmetic, or preserving word boundaries.

Define \\(n_{p,s,v}\\) as the count of original follower rune \\(v\\) in page \\(p\\) after predecessor \\(s\\), and \\(n_{p,s}=\\sum_v n_{p,s,v}\\). The original key-independent conditional collision rate is

\\[
Q=\frac{\sum_{p,s,v}\binom{n_{p,s,v}}2}
        {\sum_{p,s}\binom{n_{p,s}}2}
 = \frac{1919}{54009} = 0.03553111518450629.
\\]

These original counts cover **12,956** unchanged encrypted runes on **55 rune-bearing physical pages**, with the first rune of each page omitted as an output observation. The one runeless p50 remains an empty page, not a page-index shift.

## Source-shaped native-English positive calibration

The accompanying [read-only CommonJS SFT](../sims/lp2_cprev_pageprivate_paircollision_native_sft.cjs) builds exactly the 55 original physical-page layouts from the original transcription. Their **2,928 page-local word fragments** are different from the **2,896 manuscript-wide complete printed words** because some words carry between physical pages. Each fragment is replaced by a randomly sampled source-exact GP29 word of the same rune length from the **740 already-solved Cicada source words** in `resources/external/relikd-solved-gp29-native-v1.json`.

For each of **500** deterministic trials (xorshift32 initial seed `0xc4a5be33`) the SFT makes **55 fresh independent 29×29 bijective secret tables**; each of their 29 rows is independently Fisher–Yates shuffled. The first previous-cipher state on every page is secret and arbitrary. It encrypts all 12,956 GP29 donor runes, decrypts all of them under the true hidden tables, and checks both exact plaintext recovery and the row-pair-collision identity.

| Measure | Conditional equality (Q) |
| --- | ---: |
| Original unknown LP2 | **0.03553111518450629** |
| Lowest of 500 authentic native-GP ciphertext plants | **0.05996633720097407** |
| Median plant | **0.06466131045516077** |
| Highest plant | **0.06861750507241307** |
| Native plants at or below original | **0/500** |

The empirical lower-tail rank under this **specific** source-word donor and random-secret-key generator is smaller than 1/501. All 500 positive source-native complete ciphertexts round-trip and satisfy the algebraic invariant. [Windows Node22 PASS, 23 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45095523846). A preliminary independent 200-trial JS calculation using the same source inputs found 0/200 below the original; the committed script's definitive values use 500 trials.

## Decision and exact limitation

This is a **new original-data separation** for the previously still-feasible *page-private predecessor-alphabet* cipher, beyond the earlier static global, five-phase and nine-illustrated-section 29! exclusions. Ordinary source-native solved-Cicada prose encrypted under arbitrary **randomly drawn private page dictionaries** retains substantially higher predecessor-row equality than original LP2. It disfavors the simple page-private substitution explanation and indicates that sampling more random page dictionaries is unlikely to recover authentic plaintext.

The equality identity **does not by itself exclude every possible deliberately engineered 55×29 table key**. The hidden key affects which ciphertext predecessor groups the authentic plaintext occupies, and an adversarial, highly structured key might produce a different grouping from the random-key calibration. A non-native plaintext distribution, extra hidden state, changed word boundaries or reversible constrained coder also lies outside this test. Full original-cipher replay under a guessed key remains necessary but never sufficient to identify that key.

**Fork:** Demand a new *source-selected* page-private transition law or private table before further per-page dictionary guessing; otherwise prioritize independently motivated changing-state / boundary-changing mechanisms. The original transcript yields **no plaintext and no key** from this statistic.

## Inputs and exact reproduction

- Unmodified canonical 58-page GP29 indices: `resources/liber-primus/lp2-corpus.json`
- Original physical words, page breaks and carry: `resources/liber-primus/lp2-transcription.txt`
- Existing 740-source-word authentic GP29 solved donor: `resources/external/relikd-solved-gp29-native-v1.json`
- Script: `node sims/lp2_cprev_pageprivate_paircollision_native_sft.cjs` under Node.js 22 from the repository root
- CI: [manual Windows Node22 source test, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45095523846)
- Preceding stationary/global majorization reference: [original all-secret predecessor theorem](lp2-cprev-secret-table-majorization-original-gate.md)
