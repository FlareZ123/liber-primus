# Original LP2: all twenty-nine fixed zero-step plaintext markers fail a word-shape English control

**Classification (15 November 2026, Agent30): independent length-conditioned calibration of an already-excluded cipher family, not a new cipher-family exclusion, plaintext recovery or historical cipher identification.** [Agent10's prior 12 November all-secret gate](lp2-fixedmarker-original-wordshape-allsecret-gate.md) already tested all 29 markers with 32,082 lexical word types and 567,679 native-GP windows, and [Agent6's independent 14 November matched-corpus gate](lp2-fixed-reserved-rune-doublet-source-gate.md) also rejected all 29. This further experiment differs by using 14,385 actual solved/Cicada-literary word occurrences, their exact GP lengths and positions, and 2,000 complete-word resamples. It corroborates those earlier conclusions and does not broaden the excluded cipher family. The separate [EA-only terminal-word obstruction](lp2-ea-zero-terminal-word-invariant.md) provides a stronger one-way implication test for EA specifically.

## The exact cipher decision

Consider any reversible or keyed GP29 cipher whose original ciphertext obeys, on each rune-bearing physical page after its first rune,

`C[i] == C[i-1] ⇔ P[i] == r`

for **one fixed plaintext rune** `r` among all 29 native GP symbols. This invariant would hold regardless of the unknown key, nonzero-step permutations, current cipher state, feedback depth or phase. It also requires that source print boundaries remain genuine GP29 word boundaries and that the plaintext resembles the historical English spelling of the already solved material. The converse is important: a model only requiring `C[i]==C[i-1] ⇒ P[i]==r` is outside this experiment's exclusion.

The preserved original LP2 pp0–55 have **12,956 ciphertext runes**, with **86 equal adjacent pairs across 12,901 observable same-page sites**, in **2,896 complete printed words** after joining line/page-carried fragments. All **55 physical page initial positions** are excluded from the fixed-marker test because their ciphertext predecessor is undefined. Source-exact events occupy 23 word-initial, 44 strict-interior and 19 word-terminal sites; none is a singleton. The previously established EA-only check found 18 affected GP words of length at least three with forced EA endings, absent from the 9,981 corresponding independent known-English control words.

## Fully source-length-matched test

The controls are **740 actually solved GP29 words** (2,979 native runes) and **13,645 prose words** from the three original-era *Book of the Law* files and Cicada's Blake *Marriage of Heaven and Hell* source. They use the already validated GP normalization `ING→NG`, `V→U`, `K/Q→C`, `Z→S` and the other native digraph tokens. The source register has **14,385 total words**.

For each candidate `r`, estimate the frequency of `r` in each `(whole word GP length, zero-based position)` cell from these source words, smoothed by half an observation. Compare the **original exact source doublet indicator**, at each position where a within-page previous ciphertext rune exists, with those length-matched expectations using a Bernoulli likelihood-ratio deviance.

The control randomization samples **entire words** with replacement, preserving each of the original 2,896 printed word lengths and each of the 55 unobservable page-start positions. Thus within-word letter correlations and actual original lengths, including all GP 1–14-rune words, appear in every synthetic book. Fixed xorshift32 seed `0x33012026`; 2,000 independent synthetic books. This tests a source-derived generative register without optimizing any original unknown ciphertext as a key. A different source text style or spelling distribution is a genuine alternative.

| Fixed marker `r` | Original deviance | Control mean | Largest control deviance in 2,000 |
| --- | ---: | ---: | ---: |
| **G (best of all 29)** | **261.726** | 74.505 | 108.424 |
| EA | 271.276 | 55.499 | 85.009 |
| X | 278.429 | 45.481 | 67.210 |
| NG | 292.685 | 52.143 | 81.158 |
| J | 330.103 | 40.922 | 61.176 |
| E | 3116.015 | 99.751 | 175.201 |

**All 29 original candidate deviances exceed all 2,000 matched whole-word source-book controls for that same candidate.** Each marker has Monte Carlo plus-one upper-tail estimate **1/2001 ≈ 0.000500**, conditional on the finite source register. To reject the union of these 29 fixed-marker models one needs every individual null rejected; this is an intersection-union decision, so no opportunistic selection of only the best marker is needed. Every GP value was tested before ranking. This result does not claim a distribution-free p-value for English.

## Exact reversible source-shaped positive

The reproducer separately draws an authentic-source GP word for each of the **2,896 original word lengths**, giving a **12,956-rune planted plaintext**. It enciphers each of the 55 source-shaped pages with the completely reversible nonzero-step scheme `step=(plaintext−r) mod29`, `cipher[i]=(cipher[i−1]+step) mod29`, and `cipher[first]=plaintext[first]`, for **r=G**. It recovers **12,956/12,956 planted plaintext runes**, forward re-encrypts all of them, and verifies at every observable original word position that `cipher[i]==cipher[i−1]` agrees exactly with the planted `plaintext[i]==G`. The positive's English word-shape score falls below the original G score. This establishes that the test accepts its defined cipher on true source-like GP words. It does not make a bijective inverse of the actual LP2 into coherent language.

## Cryptanalytic consequence and next decoder choice

A hypothetical **fixed, uniquely designated 29th rune as zero feedback step** faces an independently replicated whole-book, exact-word-shape obstruction **regardless of which of the 29 GP runes is designated**. Selecting a more convenient rune does not rescue the model within the original Cicada-like English register. Merely changing the secret nonzero-step key cannot change this conclusion. A genuinely new attack would need a source-selected **stateful or changing escape rule**, a cipher whose zero-step meaning is not fixed, or an independent reason to use different plaintext segmentation/register. No specific one of those broader mechanisms is established by this negative.

**Successful original-source CI:** [GitHub Actions run 43728573718](https://github.com/FlareZ123/liber-primus/actions/runs/43728573718). All original assertions, the 29×2,000 bootstrap, and full reversible native-word positive passed on Node.js 22.

**Self-contained original-source CommonJS reproduction:** [`sims/lp2_all29_zero_step_wordshape_gate_sft.cjs`](../sims/lp2_all29_zero_step_wordshape_gate_sft.cjs). It asserts the actual source inventory, excludes every page-start correctly, runs the full 29×2,000 resampling comparison, and includes the independent full-book reversible original-shaped positive. No modification to supplied JPEGs or historical input files is needed.
