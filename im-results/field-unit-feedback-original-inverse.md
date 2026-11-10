# Reversible GP field-unit feedback: original LP2 and EA-anchor inversions

**Evidence:** three executed source-constrained, heldout-original inverse tests. **No unknown Liber Primus plaintext or authentic key recovered.** This research explicitly inverts the original ciphertext rather than fitting a forward-only repeat filter.

## Mechanism and a unique plaintext prediction

For a GP runic stream interpreted in F29, let `D_i=(C_i-C_{i-1}) mod29`. The observed scarcity of `D_i=0` motivates a reversible alphabet with 28 nonzero steps and a rare transparent symbol EA (GP index28). For each page-local i≥6, hypothesize:

```text
K_i = (a*f(C-history) + b*g(C-history) + d) mod28
D_i = 0                             if P_i == EA(28)
D_i = 15^((P_i + K_i) mod28) mod29  otherwise
P_i = EA(28)                        if D_i == 0
P_i = (log_15(D_i) - K_i) mod28      otherwise
```

The GP-source-linked element 15 has order28 in F29. All nonzero steps are unique, so the inverse is exact for a given ciphertext-history key, and no plaintext is guessed at repeated ciphertext positions. Physical page IV positions 0–5 are outside the tested model.

## Finite original-cipher search

With ciphertext features `prev=C[i-1]%28`, `prev2`, `prev5`, `prev6`, `delta=(C[i-1]-C[i-2])%28` and `index=i%28`, enumerate these **eleven prespecified pairs**:

```text
(prev,prev2) (prev,prev5) (prev,prev6) (prev2,prev5)
(prev5,prev6) (prev,delta) (prev,index) (prev2,index)
(prev5,index) (prev6,index) (delta,index)
```

For each pair enumerate all 28³=21,952 coefficient triples (a,b,d), both forward and reverse within-page reading, giving **482,944** specified invertible original inverse candidates. Scores are GP-Shakespeare non-EA unigram log-likelihood *excess over uniform1/28*, trained independently from the first 100,000 encoded GP source runes. Select by the first 27 physical rune-bearing LP2 pages; freeze key and evaluation on the remaining 28. Source text is 218,800 GP runes. The exact ciphertext is 55 rune-bearing unsolved pages, 12,956 symbols. The 86 page-local zero steps are mapped to EA without key fitting.

| Candidate selected on original training | Train excess (nats/nonzero step) | Heldout excess |
| --- | ---: | ---: |
| Forward, (prev,index), a=10,b=21,d=9 | **−0.792549** | **−0.883367** |
| Forward, (prev5,index), a=7,b=23,d=2 | −0.795818 | −0.901940 |
| Forward, (prev,prev6), a=16,b=3,d=15 | −0.803995 | −0.890002 |
| Reverse, (prev2,index), a=15,b=13,d=8 | **−0.786265** | **−0.912913** |
| Reverse, (delta,index), a=19,b=6,d=7 | −0.800798 | −0.848206 |

All 11 selected forward feedback models have *negative* heldout source-language excess. The corresponding 11 reverse models also fail; their top original training score declines sharply on heldout. The source-family best direction and model were selected from the original training pages, so these figures are descriptive rather than an independent global-null significance estimate.

## Mechanism-sensitive positive control

A disjoint authentic-English GP source, matched exactly to the 55 original physical page lengths, was encrypted using the same reversible architecture with a hidden source-independent setting: features (prev,prev6), a=7,b=11,d=5. Exactly roundtripping the ciphertext recovers **every modelled post-IV source rune**, including zero-step EA runes. Without supplying the hidden coefficients, the matching search selected **the exact (7,11,5)**, yielding training excess **+0.386149** and heldout excess **+0.362240** nats per nonzero step. The independently trained source theoretical expected excess was **+0.408764**. Positive recovery establishes that the declared inverse and its language criterion can recover a genuine key if present.

## Interpretation

Direct, low-dimensional affine ciphertext-history keys using the eleven specified source-compatible feedback feature pairs do **not** decrypt the original LP2 nonzero differences into ordinary English GP runes. This includes models with lag-six and page-local positional feedback, but it does not exclude more complex key schedules, changing symbol alphabets, unknown page IV initialization, alternate text registers, or hidden-state methods.

The exact fixed-key original source test and its source-disjoint planted positive can be reproduced by [`sims/field_unit_feedback_inverse.cjs`](../sims/field_unit_feedback_inverse.cjs) (Node22, CommonJS). No workflow is created for this bounded result.


## Source-synchronized plaintext-autokey inverse

An additional and more directly recoverable first-order model chooses the exponent key from **previous plaintext**, rather than previous ciphertext:

```text
D[i] = 0                                    iff P[i] = EA(index28)
D[i] = 15^((P[i] + a*(P[i-1] mod28) + b) mod28)  otherwise
P[i] = (log_15(D[i]) - a*(P[i-1] mod28) - b) mod28
```

Each actual ciphertext doublet gives the **entire previous plaintext state** `P[i]=EA` and thereby synchronizes the exact plaintext decoder for all following nonzero steps. This avoids guessing the unknown initial plaintext rune, which is a material advantage over ordinary plaintext autokeys. On a whole-book continuous reading, the first original repeated rune is at global zero-based position **122**; all **12,834** subsequent original runes are conditionally recoverable from any fixed (a,b). The 86 observed doublets are anchor symbols, while 12,748 subsequent nonzero steps are scored. In page-reset mode, **13 of 55** physical rune-bearing pages have no anchor, so only 6,241 original symbols (including 86 doublets) fall into anchored suffixes.

A complete **28² = 784** (a,b) search was trained on the first 27 original rune-bearing pages and held out the last 28, or trained on the first 6,480 global rune positions and held out the rest. Both forward and reverse reading directions were searched, with each frozen candidate scored against an independently trained GP-English non-EA unigram prior.

| Original scope and reading | Selected a,b | Train excess nats/nonzero | Frozen heldout excess |
| --- | --- | ---: | ---: |
| Continuous, forward | (14,14) | −0.826558 | −0.899554 |
| Continuous, reverse | (14,3) | −0.816283 | −0.905158 |
| Physical page resets, forward | (8,20) | −0.790764 | −0.864109 |
| Physical page resets, reverse | (12,9) | −0.791100 | −0.955380 |

**No selected original inverse produces plausible GP-English.** The negative criterion is actual decoded-language likelihood, not a post-hoc synthetic marker count.

In the source-disjoint **positive**, source GP text is encrypted with secret true (a,b)=(7,11), preserving the original 55 page lengths. The blind search identifies the exact key in both models. Source-matched page resetting scores **+0.366470 train / +0.368077 heldout**; continuous state scores **+0.385465 / +0.362617** nats per nonzero rune. Every rune after a planted EA synchronization event exactly roundtrips, with unknown initial-state prefixes deliberately excluded. Thus the model has sufficient key-recovery power for the specified register.

This eliminates a directly synchronized **first-order GP plaintext autokey** with a constant two-parameter key under the stated source register, page/global continuity and reading directions. It cannot exclude more general plaintext history, state-dependent clocking, transformed plaintext alphabets, or a genuinely independent secret keystream. It does **not** establish that any actual observed doublet is GP EA in the original manuscript.

Reproduce from the checked-in [`EA-anchor exact plaintext-autokey program`](../sims/ea_anchor_plaintext_autokey_inverse.cjs). All synthetic-positive and original tests use the same inverse and 784-key training selection, without adding a CI workflow.


## Delayed plaintext feedback, synchronized by residue-class EA events

The first-order scheme has a useful exact extension motivated by the observed five- and six-rune ciphertext echoes. Let a single plaintext-feedback delay be `L`, so for nonzero original steps:

```text
P[i] = (log_15(C[i]-C[i-1]) - a*(P[i-L] mod28) - b) mod28
```

An actual repeated original rune forces model-conditional `P[i]=EA=28`, and seeds its independent residue class `i mod L`. Each subsequent position in that class is then **exactly reconstructible** for the frozen (a,b). No initial-state search or post hoc output overwrite is needed. Thus even sparse marker events can synchronize almost all of a long plaintext in the tested single-delay family.

On the original **continuous physical-page concatenation**, select (a,b) from the first 6,480 rune positions for every `L=1..16`; freeze the key on the remaining 6,476. Run both reading directions. This adds **16×784×2=25,088** original deterministic inverse candidates. The original 86 adjacent repeats are the conditional source-synchronizing markers.

| Original scope | Best trained a,b | Train GP excess nats/nonzero | Heldout GP excess |
| --- | --- | ---: | ---: |
| Forward, delay 5 | (16,24) | −0.808203 | −0.879045 |
| Forward, delay 6 | (16,11) | −0.812557 | −0.890600 |
| Reverse, delay 5 | (23,1) | −0.822099 | −0.892545 |
| Reverse, delay 6 | (2,13) | −0.819799 | −0.908591 |
| Best training across all forward delays: delay 13 | (22,15) | −0.780305 | −0.903410 |
| Best training across all reverse delays: delay 9 | (27,5) | −0.778332 | −0.913426 |

**All 32 frozen delay/direction winners score below the non-EA uniform source** on heldout original ciphertext. At delay six, all six global residue chains have at least one synchronization anchor; **6,430** heldout nonzero original runes are deciphered by this conditional inverse, and no original English passage appears.

A genuinely encrypted, source-disjoint **delay-six positive** with secret `a=7,b=11` is recovered at the exact parameters by the same blind search. The decoder roundtrips **every runic position after its class has first been synchronized**, with **+0.378869** training and **+0.362617** heldout nats/nonzero. All planted classes become seeded. These are original-layout forward-control ciphertexts and demonstrate the search could select the correct key.

The bounded negative concerns the *single delayed plaintext tap* with one shared coefficient and additive offset, 16 fixed delays, a primitive-root F29/28-unit output and global manuscript state. It cannot reject nonlinear or multi-tap feedback, variable key/clock state, or separately keyed passages. The residue-class synchronization principle remains useful if a future independently sourced plaintext-state rule is discovered.

**Reproduction:** the same [EA-anchor plaintext-autokey CJS program](../sims/ea_anchor_plaintext_autokey_inverse.cjs) now executes first-order page/global modes plus the whole-book delayed search and exact lag-six positive, without adding a scheduled CI workload.


## Integrated three-marker bijective inverse with plaintext-feedback key

A further attempt directly addresses the shared [integrated-original-inversion challenge](../workplace/integrated-original-inversion-challenge.md). It combines the previously described **lossless contextual marker alphabet** (EA emits a zero step, conditional E/L emits the five-back rune, S emits the affine six-back T transformation, collision priorities followed by unique unused-field-power fallback) with an **unknown plaintext-dependent free-alphabet rotation**:

```text
K[i] = a * (P[i-L] mod28) + b
       with declared initial source state 0 for i<L

C[i] - C[i-1] = reserved-step(P[i], original word context)
        OR     freeDelta[(freeRank(P[i]) + K[i]) mod freeRadix(i)]
```

Every local context defines an exact **29-to-29 permutation**, even where multiple candidate markers target the same output, and the page-initial output uses a separate additive modulo29 expression. Original whole-word offsets and physical page initial indices are read from the original transcription; page-split words remain continuous. The unknown source plaintext state is a single shared delayed feedback with `L=1..8` and `(a,b)∈Z28²`, giving **6,272** complete original inverses. The original-source word-specific E/L/S markers remain explicitly **postselected hypotheses**.

Select by GP-Shakespeare log-likelihood excess over a **contextually matched uniform free-alphabet baseline** on physical rune-bearing pages 0–26, then freeze and test pages 27–55. Original fixed-source results:

| Delay | Selected (a,b) | Training excess nats/rune | Frozen heldout excess |
| --- | --- | ---: | ---: |
| 1 | (0,23) | +0.067691 | +0.003352 |
| 2 | (7,24) | +0.086248 | +0.034166 |
| 3 | (14,23) | +0.087275 | +0.020624 |
| 4 | (3,21) | +0.075340 | +0.020690 |
| 5 | (14,23) | +0.083752 | +0.030594 |
| 6 | (12,22) | +0.069826 | −0.012666 |
| 7 | (20,15) | +0.068129 | −0.047838 |
| 8 | (24,24) | +0.087352 | −0.021673 |

These small positive unigram residuals at delays two through five are **insufficient to authenticate the model or identify plaintext**. The marker classes, word-context transformations and test model were motivated by patterns observed on the same manuscript, so the table's nominal scores are exploratory. A best genuine control must recover a much larger, coherent language signal.

A disjoint original-layout **synthetic positive** is encrypted with delay six, `a=7,b=11`, and exactly the same bijective contextual alphabets. The blind inverse selects both true coefficients, recovers **all 12,956** source runes, and obtains heldout free-alphabet excess **+1.271436 nats/rune**, far above the original's largest frozen excess of +0.034166. The original selected decoders also support **exact re-encryption of all 12,956 original runes** for their respective assumed keys. That reversibility is conditional and does not imply those decoded runes are authentic.

This supplies a **single complete original-input forward/inverse** combining the three source-selected collision classes and a plaintext-state key, while still failing the crucial readability/key-identification gate. Reproduce from [`sims/integrated_marker_plaintext_autokey_inverse.cjs`](../sims/integrated_marker_plaintext_autokey_inverse.cjs). Its exact original roundtrip and blind positive are built-in assertions. A stronger candidate needs a cryptographically derived key and a clear GP language signal on withheld original text; otherwise, isolated +0.03 unigram excess should remain unpromoted.


### Independent heldout GP trigram check of the integrated inverse

The integrated candidates' small unigram excess was further tested with a **separately trained GP trigram model** (first 100,000 GP Shakespeare reference runes), conditioned on each original position's *actual set of permitted free-symbol plaintext outputs*. The score is the candidate plaintext's trigram log probability minus the average trigram log probability of every allowable free GP symbol in precisely that fixed original context. This avoids treating the postselected excluded-marker alphabet's intrinsic bias as a plaintext signal.

| Frozen original candidate | Training conditional trigram excess | Heldout conditional trigram excess |
| --- | ---: | ---: |
| L2 (7,24) | +0.059994 | **+0.018422** |
| L5 (14,23) | +0.031984 | **+0.016485** |
| L8 (24,24) | +0.023300 | **+0.011403** |
| Disjoint true-source plant L6 (7,11) | **+2.200828** | **+2.187189** |

All scores are nats per original **unreserved** rune and exclude positions where the hypothetical original special markers force the plaintext by construction. The *entire* output register, including the marker emissions, supplies trigram history. The frozen original candidates remain effectively at the source-conditional uniform baseline, whereas the planted correct key produces roughly two nats of contextual language signal per rune. The first hundred GP transliteration labels of the original L2 and L5 reconstructions are unrecognizable as continuous English; their full decoded candidate streams have no independently authenticated plaintext content.

The script now computes this discriminant and exact re-encryption for **all eight delay-specific fitted original keys**, and prints the comparable source-positive results. The weak first-order residuals are appropriately classified as non-recoveries; a plausible cipher solution must substantially exceed this source-controlled language gap.
