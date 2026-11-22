# p50 leading-zero feature localization: held-out chapter gate

**Consolidated through 22 November 2026 (Agents3/25):** the phase-zero p50 leading-zero class transfers across nine original LP2 chapters better than predeclared coarse row/column alternatives, but literal leading digit and low numeric value remain indistinguishable because both select the same **60 of 256** cells. A *fixed-parameter, reversible* five-digit GP29 output-feedback decoder was executed and fails to recover plaintext; importantly, it is an **exact subcase** of the earlier all-secret five-digit cumulative-step theorem, already rejected on original ciphertext on **15 November 2026**. This late-run specialization is useful for illustrating the concrete transition and positive control, but supplies **no new family exclusion**. The class remains a genuine predictive partition of ciphertext repeated-rune events, without authenticating any particular cipher mechanism.

No unknown plaintext, key, opcode, or complete cipher mechanism is recovered here.

## Frozen source and clock

This gate reuses Director #1500 without changing alignment:

- original LP2 p0–55: **12,956** runes;
- **12,901** eligible within-page adjacent pairs;
- **86** adjacent-equal ciphertext events;
- nine source chapter ranges: p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55;
- global row-major p50 clock at phase0;
- a pair is indexed by its first rune;
- page turns advance the global rune clock, while cross-page pairs are excluded.

The p50 table supplies 256 printed two-character tokens. Exactly **60/256** begin with literal `0`; those phases cover **3,025/12,901** eligible opportunities and contain **33/86** repeats. The remaining 196 phases cover 9,876 opportunities and contain 53 repeats.

## Predeclared feature families

Before reading any held-out chapter, issue #1508 fixed these comparisons:

1. literal first character `0`;
2. exact token `00`;
3. the 60 lowest raw positional values under documented base60;
4. the 60 lowest raw positional values under documented drop-`f` base59;
5. a 64-cell row class learned only from the other eight chapters by selecting the eight printed rows with the highest Jeffreys-smoothed repeat rate;
6. a 64-cell column class learned only from the other eight chapters by selecting the two printed columns with the highest corresponding rate.

For every binary mask, the training chapters fit selected and unselected Bernoulli repeat rates with Beta(1/2,1/2) smoothing. The held-out chapter is scored once. The reported score is the summed natural-log predictive likelihood gain over a one-rate null fit to the same eight training chapters. Positive-direction counts compare held-out selected and unselected repeat rates without a new significance test.

## Result

| Feature | Selected cells | Nine-fold held-out log-likelihood gain | Positive held-out directions |
| --- | ---: | ---: | ---: |
| leading `0` | 60 | **+4.584893** | **9/9** |
| exact `00` | 2 | +4.225480 | 3/9 |
| 60 lowest base60 values | 60 | **identical to leading `0`** | 9/9 |
| 60 lowest base59 values | 60 | **identical to leading `0`** | 9/9 |
| learned 8-row / 64-cell class | 64 | **−5.299223** | 7/9 |
| learned 2-column / 64-cell class | 64 | **−0.418509** | 6/9 |

The leading-zero fold gains are:

`[-0.175812, 0.806375, 0.147600, 1.282505, 0.474063, 0.768704, 0.952721, 0.278334, 0.050403]`.

One chapter loses a small amount of predictive likelihood because of low event count, while the exposure-corrected direction remains positive in every chapter. Exact `00` has a similar total likelihood gain only because five events concentrate in 100 opportunities; its direction is positive in just three chapters and negative in the other six, so it does not provide the same chapter-transfer explanation.

### Literal digit versus low numeric magnitude is not identifiable here

For a positional two-character reading, every token beginning with `0` has smaller raw value than every token beginning with a nonzero first character. Because there are exactly 60 leading-zero cells, selecting the 60 lowest values reproduces the leading-zero mask exactly. This is true under both the documented base60 alphabet and the documented drop-`f` base59 alphabet.

Thus the held-out evidence supports the **60-cell class**, but it does not tell us whether a human solver should read that class as a visual leading digit, a low-value bucket, or another equivalent source-visible description. No alternative magnitude threshold should be invented to manufacture separation.

## The 53 outside-zero repeats remain unlocalized

The issue also asked whether a winning feature explains repeat locations outside the leading-zero class. Restricting the same leave-one-chapter-out row/column learners to the **9,876 outside-zero opportunities containing 53 repeats** gives:

- learned row64: predictive gain **−2.053026**, positive direction 8/9;
- learned column64: predictive gain **−0.947205**, positive direction 8/9.

The positive-direction counts do not overcome the negative held-out likelihoods. Coarse printed row or column membership does not transfer as a useful locator for the outside-zero events. The leading-zero class therefore partitions exposure; it does not explain the majority 53/86 repeat events.

## Consequence

The source-level association survives the requested feature-localization gate. The new direct five-digit reversible consumer below also fails on the entire original tape. Any future decoder must therefore identify a different first-party operation, with two explicit limitations:

1. the current evidence selects an equivalence class shared by literal-leading-zero and low raw numeric magnitude, rather than uniquely authenticating the visual digit as the operative bit;
2. any mechanism that treats the class as an exclusive collision/escape channel is incomplete, because 53 repeats remain outside it and prior exact collision-rejection work already found zero registered long-word English preimages.

The separate literal-bitmap test in Director #1513 closes the idea that this 60-cell mask itself visibly spells a stable instruction. A source-constrained cipher consumer may still use the class as a clocked selector, but failure should not be rescued by phase shifts, new magnitude thresholds, or ad hoc row/column state.

## One complete five-digit output-feedback inverse (Agent25, 22 November 2026)

The stage above established an **original-source event clock**: a ciphertext pair's first-rune global index selects p50 cell `(i−1) mod256`, where `i` is the second rune's zero-based book-global offset. The *entire* printed base60 first-digit channel is readily readable, with five states `q=floor(B/60)∈{0,1,2,3,4}`; the exact 256-cell multiplicities are **[60,58,65,56,17]**. Because GP29 modular output feedback is a familiar reversible human-computable operation, one natural concrete model is:

```text
C[-1] = 0
q[i] = floor(p50_byte[max(0,i-1) mod 256] / 60)
C[i] = C[i-1] + P[i] + q[i] (mod 29)
P[i] = C[i] - C[i-1] - q[i] (mod 29)
```

This tests the **first-digit state itself**, rather than a fitted binary label or a guessed secret 29-letter keystream. **Prior-art correction:** [Agent8's 15 November exact all-secret theorem](lp2-p50-step256-allsecret-inverse.md) already used *the same source cell clock and the same literal five first-digit categories*, allowing every arbitrary secret 29-symbol bijection `π_q` of the ciphertext step `D_i=C_i−C_(i−1)`. Its five-class invariant `Q=0.035304464`, compared with **minimum 0.057788283** among 122 pinned native-language windows, excludes this entire ordinary-GP29 class without choosing any secret key. This experiment's rule `D=P+q` simply fixes `π_q(P)=P+q` inside that already-excluded family. Therefore neither its IoC failure nor its exact inversion is a new mathematical exclusion. This paragraph supersedes any implication that the direct mechanism had not previously been bounded. It mechanically connects the observed binary correlation to the language model: a repeated ciphertext rune `C[i]=C[i-1]` occurs precisely when the original plaintext rune equals `-q[i] mod29`. Thus a leading-zero cell's repeat corresponds to plaintext **F** (GP0); the four other first-digit values correspond to **EA, IA, Y, AE**. These are relatively uncommon GP runes in known ordinary cleartext and are a *possible* source-shaped explanation for the leading-zero enrichment. This hypothesis adds no private starting state, free phase, fitted coefficient, page reset, skip or extra cipher layer. **The historical creator did not explicitly instruct this equation or equate its five digit levels with GP29 feedback**, so it is an exploratory mechanism gate, not source-authenticated cipher grammar.

[Read-only original-source CommonJS SFT](../sims/lp2_p50_literal_highdigit_ciphertext_feedback_original_sft.cjs), run on the full unchanged **12,956** original p0–55 rune tape: the exact 86 same-page doublets split by source digit **[33,12,17,19,5]**, asserting that the digit-zero subgroup is **33** on the same pair clock as the earlier held-out result. Every original decoded rune re-encrypts **12,956/12,956**. An independently genuine **95-rune solved p57** plaintext plant encrypts and decrypts **95/95**; deliberately shifting the source digit phase by one restores only **18/95** of the planted runes. Therefore correct implementation is supported by an independent linguistic control, even though the original cipher does not validate the hypothesis.

**Original decoding fails:** GP29 IoC is **0.0346688474** versus source ciphertext **0.0344783979** and independently clear p57 **0.0627099664**. The fixed original readout begins `EOMWEOFEOCFEOIBUIOENNGTTHHJICLWHBWCLCEAENHWPIRLRNLBSOETHAEMEYCBTHRBRCUEOLOEEOAEOJNBBTHDLEOYIGJRAI...`, with no coherent native GP prose. The positive-control and complete original-reencryption assertions passed [Windows Node22 CI #44968299568](https://github.com/FlareZ123/liber-primus/actions/runs/44968299568).

**Decision:** this no-secret five-digit decoder is **already implied negative** by the stronger 15 November all-secret invariant, with the new original-run script supplying a standalone positive-tested instance only. Its failure leaves the independent leading-zero event association intact. The next cryptanalytic action must change the family in a **source-authored** way (for example a genuine changing state or separate plaintext representation), without retuning fixed offsets and codebooks that the prior theorem already covers.

## Reproduction

Run [`sims/lp2_p50_digit0_feature_loco_sft.cjs`](../sims/lp2_p50_digit0_feature_loco_sft.cjs) under Node 22. The committed source-exact SFT passed on Windows/Node 22 in [run 44386744497](https://github.com/FlareZ123/liber-primus/actions/runs/44386744497). It uses only repository source JSON and Node built-ins, asserts the original opportunity/event counts, asserts both radix-mask identities, reproduces all six held-out scores above, and reports the residual outside-zero gate.
