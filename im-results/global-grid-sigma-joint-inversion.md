# Joint decryption with eight source-derived 256-bit keys and one unknown rune alphabet

**Class:** reproducible cryptanalytic algorithm with a strong *planted plaintext recovery*, followed by a bounded negative on the original LP2 ciphertext. Agent 25, 2026-11-10. **No authentic LP2 plaintext, key or destination recovered.**

## The actual inversion problem

LP2 prints 32 rows × 8 columns of base-60 byte pairs. Each vertical column yields a 32-byte key. The ciphertext has nine '$'-delimited nonempty sections, one of only nine runes; merging that bridge with its following section gives **eight** groups of **729, 1,145, 1,729, 1,903, 1,021, 1,524, 1,589 and 3,316 runes**.

The explicit hypothesis was that group s is encrypted with key column s, with one shared *unknown* permutation of all 29 ciphertext-rune labels across groups, and an additive mod-29 keystream. Whenever a proposed emitted ciphertext rune would repeat the previous rune, a rejection filter can consume another hidden key byte before repeating the plaintext-symbol attempt. This captures a concrete mechanism that could explain the manuscript's unusually few identical adjacent glyphs.

Earlier work tested the grid bytes as direct keys while assuming the original rune alphabet, and separately optimized an unknown alphabet on short prefixes while allowing key skips. The new algorithm pools all eight groups to estimate **one global unknown alphabet** and **eight separate invisible skip paths**. It has the possibility of recovering actual original plaintext if the source-key hypothesis is correct.

## Reusable exact-inference components

The implementation [global_grid_sigma_em.cjs](../sims/global_grid_sigma_em.cjs) reuses the repository's exact Hungarian assignment and key-skip Viterbi implementations. Its key steps are:

1. Generate AES-256-CTR or ChaCha20 pad bytes from each 32-byte grid column, restarting the pad at the next text group and using a zero nonce.
2. Initialize an unknown 29-symbol inverse alphabet from pooled section-start prefixes of widths 10, 20, 30, 45, 65, 100 or 160 runes, with an independent identity initialization.
3. Iterate a relaxed-skip alignment, global maximum-weight 29×29 alphabet assignment, strict collision-activated alignment, and another global alphabet assignment. Each key-pointer path is section-specific, while the permutation is shared.
4. Decode the complete 12,956-rune source with its recovered alphabet and key draw positions. The English GP-rune unigram and word-position likelihoods come from a disjoint 300KB Shakespeare control source.

This is coordinate optimization with exact substeps, **not a proof of globally optimal recovery**. One unknown common alphabet per eight groups is an important testable assumption. The algorithm is also independent of the particular cryptographic key generator and therefore useful for alternative externally grounded key candidates.

## Nontrivial full-manuscript-sized positive control

A separately held-out source of 12,956 genuine GP-English runes was encrypted under *the actual eight grid-column AES256-CTR keystreams*, a **random shared outer 29-rune permutation**, and a rejection filter that used **399 extra key draws**. The hidden skips by group were **[17,38,44,81,29,42,56,92]**.

Under exactly these previously unknown hidden values, the solver recovered:

| Measurement | Recovered |
| --- | ---: |
| Arbitrary outer-alphabet entries | **29 / 29** |
| Correct plaintext rune positions | **11,680 / 12,956 = 90.15%** |
| Inferred total extra key draws | **399**, exact final drift for every group |
| True recovered-source language score | **-2.834449 log units/rune** |

As an additional diagnostic, supplying the exact planted key-pointer positions to the Hungarian estimator recovered all **29/29** alphabet entries, and supplying the exact planted alphabet to Viterbi recovered **11,636/12,956** exact key positions. These controls isolate the two subproblem implementations and demonstrate that the pooled joint iteration can escape a failure of the short single-group initializer.

An earlier *single 240-rune section* joint attempt failed its own plant, despite oracle-perfect subcomponents. It should not be cited as an exclusion of source-derived keys. Pooled inference is substantially better powered under a shared alphabet.

## Original LP2 runes, all sixteen direct grid modes

The exact same pooled solver was run over **all 12,956 original unsolved LP2 runes** for a prespecified 2×2×2×2 family:

- AES-256-CTR / ChaCha20;
- natural / reversed bytes within each 32-byte column;
- byte modulo29 / scaled byte-to-rune mapping;
- positive / negative additive cipher sign.

The eight columns remained in corresponding section order. The best of the sixteen was **AES-256-CTR, forward key, byte modulo29, negative sign**, scoring **-4.948202 log units/rune**. Other modes scored between **-4.949398 and -4.985261**, with **no readable plaintext**. The original positive-control configuration (AES-CTR, forward/mod29/positive sign) scored **-4.955593** on real LP2, compared with **-2.834449** for the planted full-length English.

The real best among modes remains **over two log units per rune** worse than the planted control and generates no meaningful recovered passage. Its fitted alphabet and skip positions cannot be credited as actual cryptographic evidence. There is no reason to elevate this to an established plaintext or key in results/README.md.

## Limits and useful next attack

The screen disfavors the **direct eight-column AES/ChaCha encryption model with one shared outer permutation, the printed column/section pairing, zero IV and a collision-triggered skip process** under the implemented English-like source. It cannot exclude a secret column-to-section permutation, a different nonce or key derivation, unknown outer mappings that change between sections, or other mechanisms.

**Highest-value extension:** jointly optimize the hidden assignment of eight columns to eight sections alongside the shared 29-rune alphabet and section-specific skip paths, or test a single long section where the unknown rune alphabet may be section-specific. Demand a planted *random column assignment* or *section-specific alphabet* to validate any new model before treating a noisy LP2 fit as a result.

Execution evidence:
- [First pooled control and actual 12,956-rune run 42755915082](https://github.com/FlareZ123/liber-primus/actions/runs/42755915082)
- [Complete 16-mode original-manuscript scan 42756143612](https://github.com/FlareZ123/liber-primus/actions/runs/42756143612)
- [CJS implementation](../sims/global_grid_sigma_em.cjs) and manually dispatched [runner](../.github/workflows/global-grid-sigma-em.yml).
