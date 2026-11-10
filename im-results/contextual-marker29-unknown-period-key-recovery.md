# Original-ciphertext key recovery in a speculative reversible GP29 transducer

**Agent 8 · 10 November 2026 · original-ciphertext train/holdout and fully planted solved-Cicada controls.** This is a completed original-source key-recovery attack against the exact but **postselected** four-marker contextual mechanism documented in [the parent report](contextual-marker29-reversible.md). **No original Liber Primus plaintext or authentic key recovered.**

## Attack definition

The lossless four-marker cipher maps 29 plaintext symbols into 29 distinct ciphertext differences at each state, with special context-reserved symbols EA, S, L/E and a keyed cyclic permutation of the remaining differences. Its exact forward and inverse procedures, including all 55 physical-page initial runes, are in [\`sims/contextual_marker29_reversible.cjs\`](../sims/contextual_marker29_reversible.cjs). These reserved labels were selected from known original motifs; they are **hypothetical**, not verified plaintext.

For every nonreserved ciphertext position, the unknown source pad is one number from 0..28 modulo the local 26/27/28-symbol residual alphabet (29 at page initials). With a period \`p\`, infer **every one of p arbitrary key digits independently** from original physical pages0–27, choosing the maximum-likelihood pad under the actual solved-Cicada LP1 GP unigram frequencies. Without fitting any key or source-language parameters on physical pages28–55, decode the second half and compute its source-language likelihood.

The script [\`sims/contextual_marker29_period225_key_recovery.cjs\`](../sims/contextual_marker29_period225_key_recovery.cjs) performs this complete columnwise fit. Additional manuscript-motivated periods are \`15,16,28,29,32,79,225,256\`, each tested under global and page-local pad clocks. Because these clue-period alternatives are compared after seeing the corpus, their individual frozen-holdout deviations require family-wise care and do not constitute standalone decryption.

## Precise original-p225 result and planted positive

For the **225 independently unknown** key-digit model, the original ciphertext has **12,691 key-dependent glyphs**: 6,617 fit from p0–27, 6,074 held out. There are 265 conditional original reserved markers (EA 86, S77, L91, E11). Original results:

| Unknown-p225 model | First-half trained log GP score/rune | Frozen holdout score/rune | GP-uniform expected holdout |
| --- | ---: | ---: | ---: |
| Global pad clock | −3.577382 | **−4.220200** | −4.196365 |
| Page-local pad clock | −3.562719 | **−4.210349** | −4.196365 |

Those dramatically better training scores are completely explainable by fitting **225 independent pad columns**; original holdout gains are **negative**.

The positive generator draws contiguous GP source text from the authentic solved-Cicada reference, at the exact original LP2 page lengths, encrypts with the real 225 red GP index sequence as true period225 key, and *hides that key before inference*. In 12 independent source-native plants (seed \`0x2253ea15\`), the fitter recovers **221–225 of 225 key digits in the displayed examples**, with observed *untouched original-layout plaintext* accuracy **98.26%–100%** across all 12. One example recovers all **225 key digits and 100% of 6,195 heldout true-source runes**. The frozen native log score in the first plant is **−2.913349**, while the same architecture on actual LP2 has **−4.220200**. The blind fit genuinely has high power when this architecture and repeating-pad source family are true.

A separate period16/page planted solved-source control recovers **all 16 true key digits and 100% original-layout heldout runes**, with a native-likelihood advantage of +1.28237 nats/rune over the uniform reference.

## Clue-period original scan

These are the *best original frozen holdout advantages* (GP log units per keyed rune), for each period under the two predetermined clock conventions:

| Candidate period | Global clock | Page-local clock |
| ---: | ---: | ---: |
| 15 | +0.02736 | +0.04920 |
| 16 | +0.04266 | +0.00428 |
| 28 | +0.01765 | **+0.06179** |
| 29 | +0.01702 | −0.02563 |
| 32 | −0.02142 | +0.03771 |
| 79 | +0.00688 | −0.00953 |
| 225 | −0.02383 | −0.01398 |
| 256 | +0.01867 | −0.00764 |

The mild **period28/page-local** excess is the largest of 16 *postselected* candidates and remains tiny relative to +1.28 nats/rune on the known-true source plant. It does not resemble decisive recovery of the solved-author GP distribution. An independent original **bigram holdout diagnostic** was therefore implemented to discriminate a weak true source signal from selected unigrams, without using holdout text for key fitting.

## Native-GP conditional-bigram recovery

[\`sims/contextual_marker29_bigram225_key_recovery.cjs\`](../sims/contextual_marker29_bigram225_key_recovery.cjs) starts from the 225-period unigram-fitted key then refines all key digits by **training-only coordinate ascent** of the exact solved-Cicada GP conditional bigram likelihood plus 0.75×GP unigram likelihood. Every altered source digit is tested against all 29 key choices using the original reversible inverse. Frozen original second-half bigram scores:

| Period225 recovery model | Frozen original mean GP conditional bigram log score | Native solved-text plant example |
| --- | ---: | ---: |
| Global, unigram-only seed | −4.056659 | −2.458355 |
| Global, train-only bigram refinement | **−4.062626** | **−2.456187** |
| Page-local, unigram-only seed | −4.067258 | source plant not modeled |
| Page-local, train-only bigram refinement | **−4.042926** | source plant not modeled |

Original GP bigrams remain unlike the real source, even though training objective improves substantially. In 4 independently planted native-GP examples, known true key digits were recovered **224–225 / 225**, and withheld true plaintext recovered **99.94%–100%** in shown controls.

The original cipher always exactly roundtrips under any fitted key because it is constructed to be bijective. **Such roundtrip is algebraic consistency, not plaintext recovery.** Independent source-language predictions and planted truth establish the distinction.

## Reproduction and status

- \`node sims/contextual_marker29_period225_key_recovery.cjs\`: complete unknown key column fit, source-native positive controls, 16 clue-period/clock original scans. [Passed manual CI 42801381531](https://github.com/FlareZ123/liber-primus/actions/runs/42801381531).
- \`node sims/contextual_marker29_bigram225_key_recovery.cjs\`: source-native conditional bigram coordinate optimizer, original frozen holdout and complete positive controls. Same successful run.
- \`node sims/contextual_marker29_clueperiod_bigrams.cjs\`: 16 clue-period frozen original bigram source evaluations, with separate true period28/page source plant. Pending independent run results at the time of this first synthesis.

**Research implication:** Under this fully specified GP29 transducer, a direct unknown periodic key of clue lengths up to 256 is insufficient to reveal actual LP2 plaintext. A more complex source-derived key state, fundamentally different word/letter register, or different cipher structure would be required. The model's postselected reserved output rules also leave a measurable excess of observed five-position ciphertext repeats. Do not promote this construction or its fitted original plaintext-looking strings to \`results/\`.
