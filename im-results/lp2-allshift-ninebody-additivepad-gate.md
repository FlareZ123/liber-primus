# Nine-body shared GP29 pad with unrestricted relative pointer shifts

**11 November 2026, Agent 14. Classification:** bounded original-cipher negative with a powered positive control. No unknown LP2 plaintext, authentic key, complete inverse or destination recovered. The strongest apparent original match is not exceptional among even a small set of matched ciphertext controls.

## The original-source problem and all-shift attack

LP2 has nine visually distinguished text bodies with fixed global rune boundaries `[0,729,1874,3612,5506,6527,7960,8051,9640,12956]` ([section-clock source audit](../workplace/lp2-section-clock-ambiguity.md)). One unit, the p33 91-rune titled interlude (body 6), cannot supply a 256-rune overlap. The remaining eight unit IDs are `[0,1,2,3,4,5,7,8]`. The observed counts total 12,956 actual runes, without interpolating p50's numeric table. No unit boundary or reset is asserted to be cryptographic.

Test the candidate **same arbitrary nonperiodic GP29 additive keystream** reused at different unknown pointer positions in two bodies, also granting an unrelated *unknown Caesar shift* to every body. A same-pad model has

`C[b,t]=(P[b,t]+K[t+s_b]+a_b) mod29`.

Where two bodies align on the same pad index, the key cancels exactly in their differences. With native-GP-like prose plaintext, the difference `P[p,t]-P[q,t']` should have an overrepresented residue because its letters have nonuniform frequencies. No actual pad values are searched. The historical 2014 three-share XOR transfer makes reused streams conceivable as an exploratory cipher architecture, but **no known original LP2 instruction selects this pad or its alignment**.

For *every* one of the 28 unordered body pairs, enumerate every integer relative shift with at least 256 overlapping original runes, including offsets far outside the ±2 already covered by [page-clock slip analysis](shifted-page-pad-crossfit.md). The search contains **75,747 distinct pair/shift alignments**. For each overlap, form all 29 difference-residue counts and select the largest as the best arbitrary relative Caesar phase. A standardized diagnostic is `z=(maxcount−n/29)/sqrt(n*(1/29)*(28/29))`. Choose the maximum over all original alignments, pairs and relative Caesar phases. This is a **search maximum**, so a single-bin z is not a discovery-wide p-value. The model does not encode a non-GP intermediate, hidden alphabet permutations, symbol deletion or feedback-dependent clocks.

## Exactly executed original result and matched nulls

| Prespecified input | Maximum z over full alignment scan | Strongest pair, overlap / shift |
| --- | ---: | --- |
| Unmodified original unknown LP2 | **5.6585** | body0 against body4, **426** aligned runes, second-stream relative shift **+303** |
| Four independent whole-body circular rotation controls, seed `0x33012014` | **5.4786, 5.6679, 5.5500, 5.4071** | full search rerun independently |
| Four independent full 29-symbol per-body permutation controls, seed `0x33012015` | **5.5468, 6.4368, 5.2968, 6.3369** | full search rerun independently |

The observed best pair has **36** of 426 difference symbols equal to residue **11**, versus uniform expectation **14.69**. A second-source control exceeds the observed maximum under either control family; **two** of the four arbitrary-alphabet controls do. The body rotations preserve every original rune, all relative runs inside the body and internal anti-repeat features; the alphabet permutations preserve every exact within-body equality and the original doublet locations. Both independently break a putative GP29 shared additive key. These small controls are diagnostic, not a calibrated confidence interval, and suffice to show that selecting the largest 5–6σ pair after 75,747 alignments **cannot** establish key reuse.

The nulls and exact original peak were calculated using the original 12,956-symbol corpus; original body0 against body4 at `delta=+303` has `n=426`, `hits=36`, `difference=11`. Source-selected p33 layout (nine-unit rather than either older eight-body clock) was fixed before the calculation. The 256-rune overlap threshold limits fitting very short accidental overlaps, without claiming that 256 was a historical clue.

## Actual GP-English planted-key positive control

The independently preserved `resources/control/gibran_prophet_58585.txt`, rendered under the repository GP29 transliteration, yields **63,114 native GP29 runes** and full-text IoC **0.06020301**. Fill the original eight body lengths from disjoint positions of that native control, generate one secret **4,000-position GP29 random pad**, and assign each body an independently random pointer offset in 0..199 and independently random Caesar shift. Seed `0x3301c1c4` fixes the plant. The full unmodified scanner finds the strongest planted match at **body2 against body7, relative shift +113**, exactly the planted key-pointer difference **116−3**, with **114/1,589** same-residue differences and **z=8.1401**. This demonstrates that the scorer detects at least this realistic-length reused-pad original-language plant without being told its hidden shifts. A synthetic plant is not evidence of an authentic Cicada key.

## Causal decision and reproducibility

The entire original all-shift search supplies **no independently predictive shared-pad alignment** and no basis to select authentic key material. Retire repeated exact *nine-body* additive GP29 pad with arbitrary body Caesar constants as a priority under the stated native-language assumption unless a distinct source instruction fixes key sharing or alignment; the controls are too few for a universal impossibility claim. This contrasts with and complements earlier **physical-page** shared-pad tests and small-±2 page slips; the current scan evaluates the full possible relative offsets for eight coherent human-visible text units. Do not expand offsets or carry this peak into a tuned cipher/key search.

**Exact standalone CommonJS reproducer:** [`sims/lp2_allshift_ninebody_sharedpad_sft.cjs`](../sims/lp2_allshift_ninebody_sharedpad_sft.cjs). It loads the preserved original corpus and the independent control text, asserts the original strongest residue tuple and full alignment count, reruns both four-replicate nulls and the native-text planted-key control, and emits machine-readable JSON. The experiment writes no files and creates no automatic Actions workflow.
