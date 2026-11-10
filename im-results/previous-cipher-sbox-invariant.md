# Page-specific arbitrary previous-cipher S-box invariant (Agent 16)

**Status (2026-11-10):** reproducible strong negative under an explicit English-like plaintext and ciphertext-feedback permutation model. **No LP2 plaintext or key recovered.**

## The larger cipher family

For a physical LP2 rune page `p`, suppose its ciphertext obeys

```text
C[p,t] = S[p][C[p,t-1]][P[p,t]]
```

where every row `S[p][a]` is **any permutation of the 29 GP rune symbols**. The rows can differ arbitrarily between the 29 previous-ciphertext contexts and between **all 55 pages**. Every such row is a bijective substitution, so this family includes position-dependent alphabet choice driven by the immediately preceding ciphertext symbol, far beyond affine/mod-29 feedback.

For fixed `p,a`, the output-symbol **collision index** of `C[p,t]` conditioned on `C[p,t-1]=a` is invariant to the unknown row permutation. Define `n[p,a,b]` to count within-page transitions from ciphertext `a` to `b`. The observable pooled conditional collision statistic is

```text
R = sum[p,a,b] n[p,a,b]*(n[p,a,b]-1)
    / sum[p,a] N[p,a]*(N[p,a]-1),   N[p,a] = sum[b] n[p,a,b].
```

This compares the fraction of repeat outcomes among pairs of transitions sharing a physical page and previous ciphertext symbol. **For any deterministic row permutation, the entire numerator is exactly equal to its plaintext counterpart within those same contexts**. The invariant itself does not assume that plaintext is English. To test an English interpretation, however, the conditional plaintext distribution and its dependence on prior ciphertext must be modeled.

## Data and direct result

Input is `resources/liber-primus/lp2-corpus.json`, pages 0–55 with runeless p50 omitted from rune statistics. This yields **55 pages, 12,956 runes, 12,901 within-page transitions, 86 equal adjacent pairs**.

Observed `R = 1,919 / 54,009 = 0.03553111518`. The global pooled analogue (one shared 29-by-29 table rather than independent page tables) is **0.03536787427**, but the quantitative simulation below deliberately uses the **more permissive page-specific** version.

The literature control is `resources/control/shakespeare_first300k.txt`, converted into **218,800 GP runes** using the repository's `QU→CW, V→U, K→C, Z→S` convention and greedy two-letter GP transliteration. Its marginal collision probability is **0.059969986**; this is only orientation, because conditioning on previous ciphertext can alter the plaintext distribution.

## Precisely calibrated simulations

The script creates exactly the manuscript's 55 page lengths. For each synthetic page it chooses an independent **random 29-by-29 array of permutations**, takes a random contiguous GP-Shakespeare segment, and encrypts each plaintext rune using the row indexed by the previous ciphertext rune. If the generated output equals the previous ciphertext rune, an independent **81% chance** reroutes it to a uniformly random different rune. This models a strong anti-repeat intervention which can break the strict bijection at affected occurrences.

The counterfactual null is a **29-state anti-repeat Markov stream** on the same lengths: transition to the previous output symbol with probability 0.00667, otherwise choose uniformly among the other 28 symbols. Null and planted replicates both undergo the same **page-conditioned** collision scorer. The null mimics the dominant near-uniform + anti-doublet profile without claiming to reproduce every local dependence.

Fixed xorshift32 seed `0x1629edab`, 200 null manuscripts and 200 planted English manuscripts:

| Statistic | Actual LP2 | Anti-repeat null (200) | English S-box plant (200) |
| --- | ---: | ---: | ---: |
| Page-conditioned collision ratio | **0.0355311** | 0.0352827 mean | **0.0652798 mean** |
| Replicate standard deviation | — | 0.0007656 | 0.0014188 |
| Replicate minimum–maximum | — | 0.0333586–0.0373706 | **0.0611940–0.0694440** |

The real manuscript has no excess relative to the null (upper-tail empirical p **0.3433**). All 200 plants show greater collision concentration than actual LP2 despite independently arbitrary **page-specific** S-boxes and repeat repair. An empirical plant-side lower-tail p is at most **1/201 ≈ 0.00498**, a simulation-resolution bound, and the effect-size separation is much larger.

### Single-page family-wise screen

A single anomalous page could be obscured by full-book aggregation. For each of the 55 pages, compute its own `R[p]`, and select the maximum only after scoring all pages. In a second experiment, seed `0x1631cafe`, **1,000 independently simulated null manuscripts** undergo the same maximum selection.

- Largest observed page score: **0.0502732 on LP2 page 27**.
- Null distribution of the **maximum over all pages**: mean **0.0581297**, 95th percentile **0.0819672**; observed upper-tail family-wise **p = 0.74525**.
- No real page exceeded the illustrative score threshold **0.055**.
- Across 1,000 planted English manuscripts (55,000 independently encoded pages), **82.605% of planted pages** exceeded 0.055. This threshold was selected as a descriptive power indicator, not a multiple-testing discovery criterion.

The pagewise test does **not** show an individual English-like feedback S-box page hidden among the 55.

## Interpretation, limits, and next direction

This disfavours direct English-like GP plaintext under a **fixed, deterministic current-plaintext substitution row selected solely by the immediately previous ciphertext rune**, even allowing an independently chosen full table on every manuscript page, with the tested collision repairs. It makes searching 55 arbitrary 29-by-29 first-order S-boxes an inefficient priority. The same invariant also applies to many-to-one **decoding** only with modifications; the mathematical statement here strictly assumes a bijection.

The result does **not** exclude a second or longer history variable, unobserved changing key state, keys advancing independently of ciphertext, arbitrary per-position permutations, homophonic or variable-length encodings, non-English plaintext, a later mixing layer, or a pathological plaintext whose rune distribution conditional on previous ciphertext is nearly flat. A permutation model whose conditioning variable is genuinely hidden is outside this exclusion.

Because this is a *negative* discrimination rather than plaintext recovery, the next cryptanalytic priority is to seek hypotheses with externally constrained keystream or key-generation predictions; avoid another exhaustive first-order feedback parametrization without a fresh mechanism.

## Reproduce

`node sims/previous_cipher_sbox_invariant.cjs` (Node.js 18+, no external packages). The script uses only checked-in files, asserts the canonical corpus and control sizes, fixes both PRNG seeds, performs both null/plant experiments, and prints the exact statistics above as JSON. It was executed against its fetched GitHub source and both GitHub reference files in the active JavaScript runtime before this report was written. No scheduled or per-commit workflow is involved.
