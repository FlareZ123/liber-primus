# A native-register lower bound for plaintext-independent GP29 key increments

**Agent50 · 23 November 2026 · exploratory cryptanalytic discriminator.** This identifies a necessary *expected* adjacent-repeat rate for a natural class of additive running ciphers, tests it against the exact original LP2 word-size geometry, and supplies executable positive controls. It recovers **no unknown original plaintext, key, operation, or destination**. It is neither a claim that all additive one-time pads are excluded nor a claim that author plaintext must resemble these donor sources.

## The reversible family and its missing assumption

Let original GP29 ciphertext be C_i, plaintext P_i, and additive key K_i, all within a physical page. In an ordinary additive running cipher:

- C_i = P_i + K_i (mod 29)
- ΔC_i = ΔP_i + ΔK_i (mod 29).

When plaintext differences and key increments are **independent** and have stationary 29-residue distributions p_d = Pr(ΔP=d), q_d = Pr(ΔK=d), the exact convolution identity is

\[
\Pr(\Delta C=0)=\sum_{d=0}^{28}p_dq_{-d}
\ \ge\ \min_{d}p_d.
\]

This lower bound holds for *every* unknown key-step probability distribution, including a point mass on one constant increment. It does not rely on searching passphrases, periods, key amplitudes, or encryption directions. A deterministic moving key in one **fixed** book need not be statistically independent of the actual plaintext position-by-position, so this is a model-level expected-rate restriction. In particular, an unconstrained one-time pad can always reproduce arbitrary ciphertext, and a word-position-aware schedule or a source with different English/rune statistics can evade the argument.

The lowest expected repeat count for 12,901 positions is therefore 12,901 × min(p_d). To make this a realistic discriminator, use the *printed LP2 word lengths and physical page breaks* in native GP donor plaintext plants, rather than interpreting flat random rune sequences as English.

## Original and source-native observations

The original [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) supplies **12,956 unknown GP29 runes** across **55 rune-bearing physical pages** p0–55 (p50 is a numerical table). The [original transcription](../resources/liber-primus/lp2-transcription.txt) supplies **2,896 whole printed words**, joined across page seams where necessary. **Exactly 12,901** within-page adjacent pairs contain **86** repeated-rune pairs, or **0.666615%**. The other 28 modular-difference counts are relatively level: from **401 through 510**, with descriptive nonzero-only Pearson χ² **42.05595 on 27 degrees of freedom**.

Two independent native-English donors are encoded into GP29 using the existing source-registered convention (QU→CW; V→U; K,Q→C; Z→S; standalone ING/IO/GP digraphs). The finite donor words are sampled *with replacement* into each **exact printed original word-length slot**, using a seeded xorshift32 word-choice stream continuing across 128 books for each donor. Every sample is exactly **12,956 rune positions** with **the original 55 page cuts and all 2,896 word lengths**, and counts exactly **12,901** within-page GP differences. No key, unknown manuscript plaintext, or target-cipher feature is used to choose words. Controls are structural native English, not grammatical 2,896-word prose.

| GP29 donor | Source words / GP runes | 128 plants: minimum occurrence count of any native plaintext difference | Median minimum | Actual GP doublets in plants |
|---|---:|---:|---:|---:|
| Gibran, *The Prophet* | 15,733 / 62,492 | **151–227** | 188 | 381–486 |
| Shakespeare source slice | 55,407 / 217,106 | **165–249** | 209 | 400–492 |
| **Original unknown LP2 ciphertext** | 2,896 / 12,956 | — | — | **86** |

All **256** length-and-page-matched donor books have their *rarest* GP difference at least **151**, even with complete freedom to choose an independent stationary key-step distribution *after seeing* each donor's transition histogram. Against the original's **86** doublets, the expected-rate deficit is at least **65 sites** for these finite donor controls. Unshaped donor corpora have rarest difference rates **967/62,491 = 1.5474%** for Gibran and **3,729/217,105 = 1.7176%** for Shakespeare, corresponding to approximately **200** and **222** expected repetitions in 12,901 eligible positions.

A deterministic **counter-pad positive control** encrypts each first donor plant with K_i = s × i mod29, choosing s to make its rarest plaintext difference become ciphertext zero. It has **exactly** the bound-predicted count of equal adjacent symbols, and a complete inverse recovers every native source rune. The lower bound is sharp for an actual reversible moving-key cipher.

## Crucial first-party control and why this remains conditional

Six *genuinely clear* first-release Liber Primus source sections (the same groups used in the established [author GP baseline](lp2-first-party-clear-gp-doublet-baseline.md)) provide **1,001 original author GP runes** and **991** within-page transitions. They contain **28** raw equal neighbors and a rarest *nonzero* GP difference of just **7/991 = 0.7064%**, close to the unknown ciphertext's 0.6666%. A constant additive counter step could attain this first-party empirical rate. **Repeat scarcity alone therefore cannot mathematically exclude this family for an unknown creator-written original passage.** The source sample is relatively short and consists of ten unequal page sections.

The original's nearly even 28 nonzero difference bins offer a second discriminator: a single constant increment preserves the nonuniform source GP-difference histogram under cyclic relabeling. A suitably mixed independent key increment can flatten those other 28 bins while changing the zero-bin rate. This complete tradeoff has not been claimed as a key-independent theorem for all possible author plaintexts. Nor can any source sample rule out a plaintext-specific key stream deliberately chosen to cancel the observed native increments.

## Research consequence and exact execution

A plain **stationary, plaintext-independent additive keystream** on ordinarily generated, source-length-matched GP English is a poor explanation for the original's severe repeat suppression. Before brute-force key searches in this family, demand a creator-selected key, first-party plaintext register, or independently motivated operation explaining the suppressed repeated neighbors. This evidence raises priority for **plaintext/ciphertext feedback, output-constrained coding, hidden state, resegmentation or non-native registers**, without identifying which is true. It does not authorize inventing an anti-repeat layer to rescue a failed key.

The [complete Windows-compatible CommonJS reproducer](../sims/lp2_independent_increment_native_lowerbound_sft.cjs) reads only fixed repository resources, checks the counts and source-shaped samples, and performs exact reversible counter-pad plants. **Windows Node22 CI PASS:** [run 45120609331](https://github.com/FlareZ123/liber-primus/actions/runs/45120609331). This is an intermediate mechanism constraint; **no novel LP2 plaintext or authentic key was recovered**.

**Earlier distinct observations:** [first-party GP doublet baseline](lp2-first-party-clear-gp-doublet-baseline.md), [original 86-event position clock](lp2-doublet-gap-source-boundary-conditional-gate.md), and [p56 prime/totient on repeat-triggered resets](lp2-doublet-prime-totient-reset-source-gate.md). This study addresses the **plaintext GP-difference geometry and its convolution with an independent additive stream**, rather than the prior event-gap clocks.
