# Whole-book Q238 Frobenius with every stationary 238-coordinate key: collision obstruction

**Agent 45, 14 November 2026. Status: original-input, key-independent necessary-condition negative.** [Passing manual CI 43538597974](https://github.com/FlareZ123/liber-primus/actions/runs/43538597974), job **frobenius-secret**, executed the standalone [CommonJS Node22 source test](../sims/lp2_q238_frobenius_stationary_secret_sft.cjs). No unknown LP2 plaintext, historical cipher key, or continuation recovered.

## Source motive and genuinely different question

The original pp49–51 numerical grid contains 256 byte-valued cells. Its existing exact GF29 polynomial factorization supplies a monic irreducible **degree-238 factor Q**; physical p36 separately prints **238 GP29 runes**. This makes GF(29^238) a source-visible possibility, although no original instruction identifies it as the historical cipher.

[Prior analysis](lp2-p36-q238-frobenius-original-inverse.md) exhausted 238 **unkeyed** field automorphisms on three individual 238-rune vectors. Its remaining distinct possibility was a hidden masking layer. We test that possibility over **54 complete actual book blocks**, without attempting to guess any key.

Let F denote the canonical GF29-linear Frobenius automorphism y → y^29 in the source-defined polynomial basis. A proposed encoder is

    C_b = F(S(P_b)) + U  (mod 29),

where the same **unknown** 238-symbol vector U is added to every ciphertext block and S applies **238 arbitrary independent unknown rune bijections** S_j at their corresponding plaintext input positions. This encompasses C=F(P+K), C=F(P)+K, all 29!^238 independent input-alphabet assignments and a fixed unknown permutation of the coordinate positions. It does not require knowing the key U, the 238 mappings, or the permutation.

Because F is invertible and linear,

    Y_b = F^(-1)(C_b) = S(P_b) + F^(-1)(U).

For any block pair a,b and within-block coordinate j, **Y_a[j] equals Y_b[j] exactly when P_a[j] equals P_b[j]**. A secret reused at that coordinate cannot alter the within-coordinate pair-equality count, however it is chosen. A common coordinate permutation only permutes the 238 comparison columns, leaving their summed count unchanged. This necessary condition therefore rejects the entire freely-keyed stationary family at once if the transformed source equality profile does not match GP-native English.

## Actual original-source inversion

Use all unmodified canonical LP2 p0–55 ciphertext runes (**12,956**, omitting runeless p50). Reconstruct Q from the *actual source 256-byte grid* and its established five small factors; build Frobenius as a 238×238 GF29 matrix and invert via exact modular Gaussian elimination. Evaluate two physically motivated block starts, both source order and whole-block reversed order. Trailing incomplete blocks are excluded, never zero-padded.

The equality statistic counts matches across distinct full blocks at **the same position j** inside the 238-vector, summed over j. Denominator is 238×B×(B−1)/2.

| Fixed source clock | Orientation | Equal symbol pairs | All compared pairs | Rate |
| --- | --- | ---: | ---: | ---: |
| From p0, 54×238 | Original | **11,814** | 340,578 | **0.0346880891** |
| From p0, 54×238 | Reversed | **11,920** | 340,578 | **0.0349993247** |
| First rune after p36, 16×238 | Original | **998** | 28,560 | **0.0349439776** |
| First rune after p36, 16×238 | Reversed | **1,000** | 28,560 | **0.0350140056** |

These are all near uniform-GP29 1/29 ≈ 0.03448 regardless of the hypothesized key. The test does not interpret punctuation or impose guessed plaintext word divisions.

## Native register and genuine encrypted control

The test uses the existing repository source-calibrated English→GP29 encoder, which exactly reproduces separately solved LP1 words and LP2 p57 (including ING, IO, and letter normalization). Each unmodified Shakespeare, Gibran and Emerson control is converted to original GP-native runes, sampled in exact 238×B contiguous windows with half-window stride, and scored under the **same identical-coordinate statistic**.

| GP-native English control | 54-block windows: minimum–maximum | 16-block windows: minimum–maximum |
| --- | --- | --- |
| Shakespeare | 32 windows, **0.0571969–0.0616599** | 113 windows, **0.0547619–0.0640406** |
| Gibran | 8 windows, **0.0590731–0.0615072** | 31 windows, **0.0573880–0.0649860** |
| Emerson | 49 windows, **0.0600509–0.0635390** | 167 windows, **0.0577381–0.0678221** |

All **89** 54-block native windows and all **311** 16-block native windows exceed all relevant original source scores. These overlapping references are descriptive controls, not independent samples from a calibrated tail probability.

The positive cipher plant uses **3,808 genuine native Gibran GP29 runes**, the exact 238-symbol p36 ciphertext vector as a hidden coordinate key, and an additional nontrivial affine alphabet multiplier 11 before the complete Q238 Frobenius map. The inverse recovers **3,808/3,808** transformed source runes exactly and retains the native control's same-coordinate equality **0.0589635854**, proving that genuine English remains detectable under a strong secret chosen from the original source.

## Decision

**Retire the family of GP-native stationary coordinate-substitution / 238-position additive secrets repaired by the canonical source Q238 Frobenius block layer**, on both natural whole-book clocks and either full-block reading orientation. This is broader than the earlier p36-only unkeyed automorphism test because **every** secret within the defined large family is covered through a key-independent equality invariant.

Its precise limits are important: a different field map, changing keys between blocks, nonlinear output substitutions *after* the field map, a different block boundary, or plaintext in a different register escape the proof. Those require an independent original authored selector and a plausible complete plaintext inverse before more variants are warranted. No unsolved page was deciphered.

**Reproduce:** On Windows 11 with Node.js 22 run the repository-root SFT at sims/lp2_q238_frobenius_stationary_secret_sft.cjs. Inputs: original LP2 numerical grid, all original GP rune indices, source-native encoder and three tracked English corpora. Checks assert the original grid SHA256, exact Q factorization, all four collision totals, calibrated source controls, and the planted reversible full cipher. Manual-only workflow suite **frobenius-secret** passed on [14 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/43538597974).
