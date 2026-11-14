# An 11-phase, fully secret predecessor-key cipher fails five original page holdouts

**Original-cipher assessment, 14 November 2026 (Agent16):** This is an explicitly reversible 11-phase ciphertext-feedback candidate, with **319 independent hidden GP29 additive shifts**, tested on every one of the 12,901 within-page unknown-runic transitions. A fifth of the **55 genuine LP2 rune-bearing pages** is withheld from shift fitting in each of five disjoint folds. The same procedure recovers **98.8–99.1%** of a genuinely different English text encrypted under the proposed 319-state cipher, but original held-out LP2 outputs remain nearly uniform GP29 and nonlinguistic. No original unknown page plaintext, author-selected secret, or destination is recovered. This excludes a useful **cross-page learnable English-register implementation**, without pretending to eliminate every possible key or cipher with additional states.

## Source motivation and precise reversible family

The numeric pages p49–51 print **256 byte-like cells**, and under the conventional base60, row-major interpretation, the first value-addressed cell follows an **11-state orbit**. Its exact existence and uncertainty as an original clue are recorded in [the earlier 11-cycle study](lp2-grid-byte-pointer-11cycle.md). LP2's many fewer adjacent-equal cipher runes than a native English cipher would lead a solver to consider changing alphabets or state-conditioned running keys. An **11-phase** predecessor-dependent shift is therefore a concrete candidate that escapes the existing **one-predecessor-only** empirical conditional-entropy exclusion: that [original-source invariant](lp2-cipher-feedback-conditional-entropy-gate.md) gives about **4.24 bits** for the 11-phase state, below the maximum native-English GP29 marginal control. Unlike a fixed Vigenère pad, one hidden shift is selected by both clock and previous **ciphertext** rune.

The *hypothetical* reversible model, modulo29, is

`C[i] = P[i] + K[(i mod11), C[i−1]]`.

The inverse is direct:

`P[i] = C[i] − K[(i mod11), C[i−1]]`.

There are **11×29 = 319 wholly unknown** GP29 secret shifts. The previous ciphertext rune is public and the inverse is one-to-one for each state. The two source-visible clock treatments are **local physical-page offset** and **absolute global original-rune offset**, with page boundaries left intact. Omit each page's first rune, whose previous state is undefined. No arbitrary starts, GP permutations or extra nonlinear operations are tried. **No first-party Cicada message prescribes the 11-state feedback rule**, so this is a conditional cipher-architecture experiment.

## True original-source train/holdout protocol

Read untouched [LP2 original GP rune indices](../resources/liber-primus/lp2-corpus.json), including all physical original pages **p0–55** except runeless numerical **p50**. Assign the 55 rune-bearing pages by original page order to folds `pageIndex mod5`: **four folds train / one entirely withheld**. For each of 319 observed states, infer its shift independently using only **original training ciphertext** and a fixed native-English GP29 unigram prior from the **63,114-rune** conversion of *The Prophet* by Kahlil Gibran. Choose the cyclic GP29 shift that maximizes the native-GP log likelihood of its training ciphertext symbols. Keys are frozen before the withheld original pages are decrypted.

Repeat for all five withheld folds, pooling their **12,901 held-out transitions** into a disjoint cross-fit readout. The code never trains from a page whose output it scores. For each option, report the held-out GP29 collision index and mean Gibran log-probability per rune. Crucially, the original cipher is **unlabeled**: no fake plaintext or candidate crib is used to choose a key. The Gibran prior is source-independent of the cipher.

For a complete positive control, take **12,956 genuine GP-encoded symbols from the independent Emerson *Essays***, keeping exactly the authentic page sizes and the same five-fold division. Encrypt them under a fixed predeclared, unknown-to-the-inference secret shift table `K[phase,previousCipher]=(7+13phase+17previousCipher+3phase·previousCipher) mod29`. Use the prior, estimator, held-out pages and original layout unchanged. Even though **319 secrets** are free, the true cipher is recognizable by the GP29 prior from the roughly 10,300 training positions per fold. All 319 original states have nonempty training observations in every fold.

## Complete five-fold outcome on original ciphertext

| 11-phase clock | Original held-out GP29 IoC | Original held-out mean log GP likelihood | Positive Emerson plant IoC | Positive exact GP rune recovery |
| --- | ---: | ---: | ---: | ---: |
| Reset at each physical page | **0.034520707** | **−4.262146** | **0.062358759** | **99.0621% (12,780/12,901)** |
| Continuous across all original runes | **0.034597767** | **−4.240962** | **0.062584332** | **98.7830% (12,744/12,901)** |

Original unchanged held-out ciphertext has mean IoC **0.034500872** and mean Gibran log GP likelihood **−4.315866**. The independent English Emberston reference plaintext at the *same 12,901 indices* has mean IoC **0.062757163**, mean log likelihood **−2.947930**. An independent match would need to be near the native register without key retuning; the observed original inverse barely improves over unchanged ciphertext even after thousands of original training symbols are allowed to select the secret shifts. The synthetic test recovers actual held-out unseen plaintext with near-99% accuracy, confirming the 319-state estimator's real sensitivity and complete reversible encryption implementation.

All five actual withheld folds produce nonlinguistic GP-rune outputs. Their differences from native GP-English output are much larger than train/holdout score variation. No original starting symbol or secret shift yields a readable decryption under these two exact recovery protocols.

## Interpretation and reproducibility

- [Single runnable Windows Node22 CJS original source and independent control](../sims/lp2_11phase_cprev_additive_holdout_sft.cjs)
- [Passing original-source and control CI run 43635433944](https://github.com/FlareZ123/liber-primus/actions/runs/43635433944)
- The estimator is maximum-likelihood for a **fixed secret additive shift for each (phase,previous ciphertext) state** under the original, preselected native GP-English *unigram* prior. It does not fit GP bigrams or plaintext passages, nor optimize a shift using held-out pages.
- All secret shifts are inferred independently, and cross-page prediction actually succeeds on a distinct literary English control. The results therefore reject this particular learnable English solution route for the two source-natural clocks; they do not make a mathematical impossibility claim against adversarially chosen secret 319-state shifts, position-dependent keys, truly random OTPs, different output alphabets, binary payloads or further encryption layers.
- The 11-cycle and numeric table remain observable first-party material, but the link between them and a running-key cipher remains conjectural. Neither supports a full inverse on all original pages.

**Decision:** retire 11-phase predecessor-dependent additive running keys fitted from unmodified native English monogram statistics as a straightforward cross-page LP2 decoder. Await an independently authored state table/key source or decoding instruction before adding further phases or secret alphabet complexity. An overfit decoder's training score is not genuine plaintext recovery.
