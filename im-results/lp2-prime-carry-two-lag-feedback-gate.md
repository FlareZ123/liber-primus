# Source-clocked two-lag ciphertext-feedback filter: bounded negative

**Decision:** exactly exclude this fixed realization on original p40–53: all 812 coefficient pairs have empty reachable-state sets by rune 491, even granting every legal F-hold path. The original statistical screen remains supporting evidence; no unknown plaintext or authentic key was recovered.

## Exact model tested

For a consuming plaintext rune P_i != F=0, the forward law is

    C_i = P_i + a*C_(i-1) + b*C_(i-2) + r_j (mod 29)

where r_j = (q_j - 1) mod 29 and q_j is the j-th prime beginning with q_0=2. A plaintext F is emitted literally as ciphertext F and does not advance j. The two feedback registers are the preceding two ciphertext runes; they are initialized to zero at the p40 chapter boundary. The clock and coefficients remain continuous across p40–53 with no page resets.

The consuming inverse is

    P_i = C_i - a*C_(i-1) - b*C_(i-2) - r_j (mod 29).

At observed ciphertext F, the exact inverse branches between a literal plaintext-F hold and a consuming path only when the computed plaintext is non-F. At nonzero ciphertext, a consuming path whose computed plaintext is F is invalid. This is a finite sender with a possibly ambiguous inverse and 812 candidates: a in GF(29), b in GF(29)*. No clock phase, scale, arbitrary additive tape, extra bias, or hidden initial-state search was allowed.

This is distinct from the earlier ciphertext-only lag-two filter (which omits the public prime input) and from the second-order evolving-key recurrence (whose state is key-derived rather than ciphertext-visible). The authentic p56 prime/F receiver is the a=b=0 control case.

## Calibration and implementation checks

The Node 22 SFT uses the pinned LP2 corpus, the solved GP29 reference, and disjoint prefixes of the pinned Shakespeare, Gibran and Emerson texts for its unigram model. It fixes the training/continuation boundary at 1,500 / 1,508 runes.

- **Authentic p56 control:** 85 runes, one plaintext-F hold, 84 consuming prime steps; a=b=0 reproduces the actual p56 ciphertext exactly.
- **Three planted 3,008-rune native-text controls:** the true coefficient pair ranked first among all 812 candidates in every case, and was the sole legal training candidate in each case.
  - Shakespeare, true key (7,11): rank 1; best exact-replay path agrees with 2,996/3,008 known plaintext runes (1,488/1,500 training; 1,508/1,508 continuation).
  - Gibran, true key (13,5): rank 1; 2,987/3,008 (1,487/1,500 training; 1,500/1,508 continuation).
  - Emerson, true key (19,8): rank 1; 3,006/3,008 (1,500/1,500 training; 1,506/1,508 continuation).

The remaining 2–21 symbol differences are residual plaintext-path ambiguity: the selected paths still forward-re-encrypt exactly. Thus key discrimination is calibrated, but the F-hold inverse is not always a unique plaintext decoder.

## Original p40–53 feature gate

The repository's p40–53 continuous transcription contains 3,008 runes, 18 adjacent equalities, index of coincidence 0.0345426275, 125 zero/F symbols, and maximum bin 125.

For each of the 812 coefficient pairs, the SFT encrypted nine independent 3,008-rune native-text windows (three each from Shakespeare, Gibran and Emerson) under the same fixed clock and state initialization. It compared the original repeat count and IoC with the mean and sample standard deviation across those nine windows for each pair.

**No coefficient pair passed the joint three-standard-deviation gate.** The closest pair was (4,28):

| Statistic | Native-control mean | SD | Original | Distance |
|---|---:|---:|---:|---:|
| Adjacent repeats | 101.7778 | 18.6734 | 18 | 4.4865 SD |
| IoC | 0.0353284 | 0.0003897 | 0.0345426 | 2.0164 SD |

The gate is a descriptive three-SD control rule, not a formal p-value. The repeat anomaly is the reason the original statistical screen stopped: the original has 18 adjacent equalities where the closest model/control fit averages about 102. Because no pair passed, the SFT deliberately did **not** run an original plaintext/key search or tune a second clock, reset, or initialization.

## Exact original reachability certificate (Critic, 26 November)

The statistical gate above is now superseded as the decisive exclusion by a separate Boolean reachability audit. Let (j) be the number of consumed prime steps before original rune (i). Start at (J_0=\{0\}). Given a reachable (j), retain (j) for a literal hold iff (C_i=0); retain (j+1) for a consuming step iff `(C_i-a*C_(i-1)-b*C_(i-2)-r_j) mod29 != 0`. The feedback is completely determined by the printed ciphertext, including literal holds. This recurrence is exhaustive by induction: a legal inverse path has exactly one of these two transitions, and both transitions are sufficient to construct its next plaintext symbol. A zero reachable set can never revive.

On the pinned p40–53 tape, **0/812** coefficient pairs have any complete legal path, independent of language and of any F-mask preference. The longest-surviving pair `(11,1)` dies at zero-based chapter offset 490 (the 491st rune); every other pair dies earlier. The audit preserves all 812 first-dead offsets. The same implementation replays actual p56 exactly at `(0,0)` and retains the actual consuming cursor at every step on three separately encoded authentic solved-native sections. These are reachability/implementation controls, not claims of blind key recovery (the earlier plants address that).

Inputs: corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; solved-native blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`. [Exact certificate](lp2-prime-carry-two-lag-exact-reachability.json) · [Independent Boolean SFT](../sims/lp2_prime_carry_two_lag_exact_reachability_sft.cjs). The audit ran in connected JavaScript V8; standalone Node/CI was not separately invoked. No alternative parameters or original key fitting were introduced.

## Scope and limitations

This rejects only the tested fixed realization: zero initial ciphertext registers at p40, prime-minus-one clock origin zero, literal plaintext-F holds, one continuous clock, fixed coefficients, and nonzero second lag. It does not prove that every dynamic or nonlinear mechanism is impossible. Alternative initial states, clock transformations, or resets are outside this test and should not be added without an independent source selector.

The target rune sequence came from resources/liber-primus/lp2-corpus.json; its source note says the transcription derives from existing community transcriptions and is not independent. This run did not independently re-transcribe the original JPGs. Both the statistical result and exact certificate are conditional on that pinned sequence.

## Reproduction

- Implementation: [sims/agent46_lp2_prime_carry_two_lag_filter_sft.cjs](../sims/agent46_lp2_prime_carry_two_lag_filter_sft.cjs)
- Raw machine output: [lp2-prime-carry-two-lag-feedback-gate.json](lp2-prime-carry-two-lag-feedback-gate.json)
- Node 22 workflow run: [45776684049](https://github.com/FlareZ123/liber-primus/actions/runs/45776684049), artifact source-test-output (ID 15095429011)
- The run also validates the p56 source control and all three planted coefficient recoveries.

**Conclusion:** the p56 prime-minus-one/F-hold operation is an authentic control, but adding this fixed two-lag ciphertext-visible feedback does not explain the unusually low p40–53 adjacent-repeat count. Retire this realization rather than retuning it.
