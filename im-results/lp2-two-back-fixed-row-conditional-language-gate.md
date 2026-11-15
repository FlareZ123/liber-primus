# Two-back state-conditioned step invariant: original LP2 versus source-native plaintext

**Decision (15 November 2026, Agent33):** The actual 12,956-rune unknown LP2 ciphertext contains **no detectable source-native-like plaintext frequency signal** when cipher steps are conditioned on the ciphertext rune two positions earlier. This discriminates a fixed 29-row two-back lookup/bijective rotor mechanism suggested by the 2026 anti-doublet fingerprint. Its all-secret **stationary row-codebook** family has the wrong observable conditional frequency structure for ordinary Cicada-style GP29 plaintext, without guessing any keys or plaintext. This is a model-family caution, **not proof that an arbitrary keyless transducer is impossible** and **not new recovered LP2 text**.

## Motivated model and invariant

The published original 86/12,901 equal-adjacency events and near-uniform first-order step distribution permit several encryption architectures. In particular [the independently constructed two-back keyless rotor](lp2-28step-chain-keyless-lag2-counterexample.md) applies a state-dependent permutation of source-native plaintext indices to the nonzero ciphertext steps and reproduces first-order LP2 statistics on solved English. Its untouched LP2 inverse is nonlinguistic. One stronger prediction of this whole source-motivated mechanism is testable without knowing any row's permutation.

At original GP29 rune position `i>=2`, define **state** `v=C[i-2]` and **step** `s=(C[i]-C[i-1]) mod29`, resetting separately at every physical page. The hypothesized fixed-row cipher is `s=π_v(P[i])`, with a separate unknown but *time-invariant bijection of all 29 GP29 symbols* for each of the 29 possible two-back ciphertext states `v`. Under any such row key, the collision probability of `s` conditioned on state `v` equals the collision probability of plaintext `P` conditioned on that exact same state: a permutation only relabels frequencies. This holds for unknown secret row maps, not just the particular additive rotor.

The fixed row conditional coincidence estimator pools each state's ordered same-step pairs, then normalizes by the 29-symbol uniform baseline:

`I_2 = 29 × [Σ_{v,s} n(v,s)(n(v,s)-1)] / [Σ_v n(v)(n(v)-1)]`.

A source-native English-like alphabet has highly uneven symbol frequencies; if a fixed row substitution were hiding it, the conditioned **emitted** steps should preserve that nonuniformity. Fewer than 86 doublets are observable in this test because each physical page's first **two** runes are excluded by the two-back state definition.

## Original source and positive controls

Inputs are the original [2014 physical GP29 transcription](../resources/liber-primus/lp2-corpus.json), pages p0–55 excluding runeless p50, and the nine published solved Cicada [native-GP29 reference passages](../resources/external/relikd-solved-gp29-native-v1.json). The test extracts **12,846** source transitions from 12,956 original unknown runes, with **85** step-zero events; solved controls contain 2,979 original source-native GP29 plaintext runes and 2,961 state-bearing events.

Two independent control constructions preserve the complete source GP29 alphabet and produce genuine reversible ciphertext under known row permutations:

- A **fixed keyless** second-cipher-back rotor: `s=0` for EA (index28), otherwise `s=1+((P+v) mod28)`; the authentic solved 2,979-rune sample yields 20 doublets.
- **100 independent seeded unknown bijective row sets**: each of 29 states has an independently shuffled permutation of nonzero steps1–28 for source plaintext indices0–27 and reserves zero step for EA. This runs a more general secret row codebook than the arithmetic rotor; the random choices are fixed before measuring any LP2 candidates. Their absolute output rune values vary, but every row remains 29-to-29 lossless.

All observations and seeded synthetic controls were computed by the checked-in [single-run CJS reproducer](../sims/lp2_two_back_rowcodebook_english_invariant_sft.cjs), with original Windows Node.js 22 [successful run 43724538185](https://github.com/FlareZ123/liber-primus/actions/runs/43724538185).

| Register | State-conditioned normalized coincidence `I₂` | 29×29 state-step independence chi-square | State-step mutual information |
| --- | ---: | ---: | ---: |
| **Original 12,846 unknown rune transitions** | **1.02195008** | **749.85063** | **0.042882 bits** |
| Native solved GP29 under published fixed two-back rotor | **1.81401811** | **2,992.27681** | **0.750002 bits** |
| Native solved GP29 under 100 independent all-secret row permutations | **1.73131754–1.82618970**, median **1.78371871** | Not needed | Not needed |

The original 29 state bins contain between **392 and 488 samples each**, making this a direct source-conditional measurement rather than a tiny isolated glyph coincidence. By contrast, the native solved controls have only 85–118 samples per state yet display a much larger invariant.

To test whether the original conditional signal exceeds a realistic no-row-effect baseline, the runner preserves each physical page's exact cipher-step inventory and the original **two-back state labels**, shuffles step positions within their page, and measures `I₂` for **2,000 deterministic permutations** (seed `0x33012016`). The shuffle mean is **1.02455509**; 406 trials are at or below original and 1,594 at or above. Add-one lower-tail **p=0.2034**, upper-tail **p=0.7971**. Thus the observed `I₂` is indistinguishable from ordinary state-step independence at this level.

## Decision, scope and next fork

The source fails the source-native-English prediction of **a globally fixed 29×29 two-back row permutation**, even though the concrete keyless two-back construction accurately reproduces its coarse doublet/first-order statistics. This distinction matters: designing an encoder that matches the *86 doublets* is much easier than recovering the author's keyed inverse or genuine unknown plaintext. The new gate prevents simply promoting the earlier numerical two-back mimic into a cryptanalytic lead.

This **does not** exclude a key changing by position, chapter, source word, a longer/shorter memory, a non-bijective emission, a different plaintext register, or a deliberately state-conditioned underlying plaintext distribution. The original known plaintext controls differ in content and physical lengths from the unknown pages, so this is an empirical source-native model-family diagnostic, not a mathematical proof against all language. No source-authored GP29 row maps, original keys, unknown plaintext or p56 hash preimage have been found. **Next** require a visible manuscript clue for an additional state/clock update before testing another model; a post-hoc extra parameter would only evade the present necessary-condition gate.
