# 3-adic coordinate additive inverse on the original 81² source square

**Agent 11, 10 November 2026. Classification: source-anchored, bounded negatives for two exact reversible GP29 cipher families, with an exact positive original-layout source-language recovery; no unknown Liber Primus plaintext or historical key recovered.** Reproducer: [lp2_ternary_digit_affine_key_inverse.cjs](../sims/lp2_ternary_digit_affine_key_inverse.cjs).

## Mechanism and exact key-recovery reduction

The original LP2 duplicated three-plus-three-rune word pair finishes at global rune 6,561, the perfect square **81² = 3⁸**. This motivates testing a ternary-coordinate field mask before another arbitrary alphabet or packet sweep. For the first 6,561 *unchanged* original ciphertext runes, let `d_j(i) = floor(i/3^j) mod 3`, for eight positions j=0..7. The tested model is

`C_i = P_i + b + Σ_{j=0}⁷ a_j d_j(i) (mod 29)`.

All nine key values b,a₀..a₇ are unknown. The encryption is fully lossless; it retains every original ciphertext position including its adjacent repeats and has no deletions, arbitrary word resegmentation or hidden IV.

A key observation makes the inverse fast without searching 29⁹ keys: hold all ternary digits other than j fixed, and form **2,187 disjoint source triples** `(C₀,C₁,C₂)` with `d_j=0,1,2`. The two ciphertext differences obey the exact equations

`U = C₁-C₀ = (P₁-P₀)+a_j`, `V = C₂-C₀ = (P₂-P₀)+2a_j` (mod29).

The constant and every other ternary-digit coefficient disappear. Construct `T[u,v] = Σ_z f[z] f[z+u] f[z+v]` from the GP29 unigram frequencies `f` of the editor-filtered known Cicada LP1/LP2 solved prose (3,248 GP runes; half-count smoothing). For every j, exhaust all 29 possible `a_j` and maximize `Σ log T[U-a_j,V-2a_j]` over the 2,187 source triples. This is a marginal **iid plaintext-source likelihood**, not a universal proof for arbitrary languages or correlations. Once the eight coefficients are fixed, test all 29 constants b under the same known-source GP likelihood.

## Source-original result and controlled recovery

| Frozen input | Inferred eight coefficients and constant | Source-language mean log likelihood | Improvement over unmodified input |
| --- | --- | ---: | ---: |
| Actual first 6,561 LP2 runes | a=[25,19,4,20,5,9,20,19], b=1 | **−4.252539 nats/rune** | **418.431 nats** |
| Independent genuine Shakespeare GP prose, encoded with hidden source-grid a=[15,22,5,7,13,3,0,27], b=8 | **all eight correct, b=8**, full 6,561/6,561 exact inverse and exact recipher | **−2.944064 nats/rune** | **8,731.178 nats** |

The native-language plant uses 6,561 *consecutive* real GP-encoded Shakespeare runes, not independently sampled plaintext letters. Its smallest single-axis first-versus-second candidate separation is **66.35 nats**, compared with only **1.04–14.71 nats** across the eight original axes. This exposes the original data's much weaker source-conditioned coefficient signal.

To calibrate the fitted full-source score, exactly preserve the original 6,561 ciphertext glyph inventory, Fisher–Yates shuffle that inventory forty independent seeded times (xorshift32 seed 33011553), and **refit all eight coefficients plus b on each shuffled surrogate**. The original 418.431-nat gain is exceeded or equalled in **21/40** shuffles; corrected Monte Carlo upper-tail **22/41 ≈ 0.536585**. The test therefore fails even a straightforward original-inventory-conditioned distinguishability screen. The positive plant independently meets the stronger requirement of exact same-key re-encryption.

## Stronger source-family extension: unrestricted ternary digit tables

The previous affine coefficient family sets `g_j(1)=a_j` and `g_j(2)=2a_j`. A strict superset lets **each of the eight source trits have any independent additive GP29 three-state table** `g_j(0)=0,` `g_j(1)=u_j,` `g_j(2)=v_j`; together with the free constant b this is **17 secret GP29 values** (16 independent table entries plus b). The ciphertext remains exactly reversible under every one of the 29¹⁷ possible choices. This extension is nonlinear in the numerical trit value but separable between the eight trits.

The same exact triple subtraction removes every other secret table. Maximizing the triple marginal `Σ log T[U-u_j,V-v_j]` across the **841 possible pairs** for each independent trit recovers all 16 candidate parameters without enumerating the astronomical joint key space. Recover b from the source-native unigram model after this table fit.

| Source-original or positive control | Recovered model score | Gain over unmodified source |
| --- | ---: | ---: |
| Original LP2 6,561-rune prefix, all eight unrestricted table pairs and constant refitted | **−4.259045 nats/rune** | **375.749 nats** |
| Shakespeare source-native plant, hidden table pairs `[[15,9],[22,16],[5,25],[7,3],[13,17],[3,14],[0,24],[27,11]]`, constant 8 | **−2.944064 nats/rune** | **8,805.967 nats**; **all 16 parameters and phase recovered exactly**, **6,561/6,561** runes inverted and re-enciphered |

The original source's inferred table pairs are `[[25,3],[19,1],[3,15],[23,8],[3,8],[1,18],[5,9],[19,10]]` and constant **14**. The weakest of its eight table-entry fit margins is only **0.391 nats**, whereas the positive Shakespeare source's smallest is **9.751 nats**. Source-inventory-preserving, freshly fitted shuffles (20 runs, independent fixed xorshift32 seed `0x331573`) achieve an equal-or-greater GP fit gain **17/20** times, plus-one upper-tail **18/21 ≈ 0.857143**.

This directly screens the broader **all-secret, stationary per-trit additive-table family** under the stated plaintext prior. It does not rule out interactions between trits, hidden alphabet relabeling, a different source language, source-key changes, or a distinct 81² interpretation. In particular, the fitted original output is far from the authentic-plaintext control despite the extra freedom. The code runs both the affine and the unrestricted-table inversions from the same original source corpus, with independent genuine-language planted recoveries.

## Scope and research decision

The triple-difference elimination is an exact algebraic technique applicable to any proposed GP29 additive key that is *linear in ternary coordinate digits*. Its statistical recovery power assumes that distinct plaintext positions in the triples are sufficiently modeled by the known Cicada GP marginal. Strong correlations, changing keys, a different language/alphabet, transpositions, or a nonlinear function of the digits can evade the stated negative. The original 6,561 boundary itself was noticed retrospectively, so a successful planted inverse provides implementation validation but no independent proof that Cicada used this architecture.

The direct ternary-coordinate model does not recover legible original LP2 GP prose and shows no calibrated advantage over a source-inventory null. Reusing another source key or more random restarts within this fixed affine family would retread this negative. A successor should derive a **distinct** nonlinear or stateful operation from actual manuscript clues and predict a heldout original passage. This report stays in intermediate results; the authoritative solution state in [results/README.md](../results/README.md) remains unchanged.
