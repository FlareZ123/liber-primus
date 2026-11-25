# All-key ciphertext-only GF(29) plaintext-filter inverse

**Agent5 — 25 November 2026. Bounded negative on original ciphertext.** New experiment, distinct from #2703's known-quotation fit and #2466's fixed sparse ciphertext stencil. No unknown LP2 plaintext or key recovered.

## Model and exact reduction

The original p15 Fibonacci-prime spiral weakly motivates finite-memory recurrence ciphers, but does not authenticate these coefficients, clock, or initialization. Test a standard causal affine filter, without a presumed source quotation or word segmentation. All physical GP29 rune positions consume; nonrunes do not. Fit original p16–21 (1,613 runes); withhold p40–53 (3,008). Corpus Git blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.

**Order <=3, zero state:** X_i = C_i + b X_(i-1) + c X_(i-2) + d X_(i-3) + k mod 29; P_i = a X_i mod 29, a≠0. This is an invertible form of C_i = a0 P_i + a1 P_(i-1) + a2 P_(i-2) + a3 P_(i-3) + e (a0≠0). Multiplication by any nonzero a preserves IoC. Exhaust every (b,c,d,k), 29^4 = 707,281 normalized combinations, covering all 19,803,868 full coefficient choices. For fixed b,c,d, compute particular response y to C with k=0 and z to constant 1 with zero state; output X=y+kz. This makes bias evaluation direct, no search truncation.

**Order <=2, arbitrary state:** X_i=C_i+bX_(i-1)+cX_(i-2)+k, P_i=aX_i, X_-1=s, X_-2=t arbitrary. There are 28*29^5=574,312,172 parameter choices, including degenerate/redundant representations. Shifting X'_i=X_i-h gives k'=k+(b+c-1)h and shifted initial states. When b+c≠1 mod29, take h=k/(1-b-c) to make k'=0, enumerate all s',t'. When b+c=1, k is unchanged by a shift; take h=t to fix t'=0, enumerate all s',k. Thus for each of 841 coefficient pairs there are 841 normalized states; exactly 707,281 enumerated representatives suffice for the maximum IoC over **every original parameter choice**, because bijective affine plaintext transforms preserve equality. Response superposition y+s'u+jv evaluates both branches (v is response to initial second state in the nonresonant case, to unit bias in the resonant case).

The two model families overlap; do not sum their full parameter counts as disjoint keys. The third-order family does not grant arbitrary initial states; the second-order extension does. Neither permits transparent F holds, variable coefficients, nonconsecutive taps, non-GP alphabets, or a changing state law beyond the stated recurrence.

## Original results

Rank by exact integer sum of n_r(n_r-1), not by guessed words or fitted plaintext. Choose the affine scale (and shift for order2) by unigram log likelihood trained on the final 994 runes of the normalized LP1 reference (blob 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d). That reference is editor-normalized and contains repeated continuation text; it is a finite illustrative language control, not a universal English bound. Its first 1,613 rune IoC is 0.06127478505135846 and final 994 IoC 0.0636832069962575. Uniform GP29 baseline 1/29≈0.03448.

| Model | Normalized max IoC | Unique max parameters | Frozen p40–53 IoC |
|---|---:|---|---:|
| Order3 zero-state | 0.03557248103575324 | (b,c,d,k)=(18,15,9,2), a=28 | 0.034447990150641414 |
| Order2 arbitrary-state | 0.03569785812851229 | (b,c,s',t',k')=(18,5,15,10,0), a=12, affine output shift z=17 | 0.03438276114597853 |

Order3 holdout restarts the fixed zero state independently at p40. Order2 carries the fit state continuously across physical p16–53 including intervening p22–39 ciphertext; no new holdout fit. Exact fit forward replay for the best candidates passes. All top-ranked candidate prefixes are nonprose. Raw top original candidates and controls in [JSON](lp2-plaintext-fir-allkey-ioc-output.json). The maxima apply to all keys in these precise families; the decision that this excludes credible native-English plaintext is a statistical language-register judgment, not an algebraic proof that no conceivable plaintext exists. No authored source identifies this mechanism.

## Calibration

Two 400+400-rune plants per family using disjoint-from-frequency-training slices of the normalized reference. Fit only the first 400; choose affine transform from fit score; predict 400 withheld runes. Order3 resets zero state for withheld tape. Order2 is continuous across fit/withheld seam, includes a resonant and nonresonant coefficient case. All four all-key searches uniquely identify the correct normalized class and recover **1,600/1,600 held-out symbols**, plus 1,600/1,600 fit. In order2, the recovered class/affine map is equivalent to the planted raw parameters, as intended. These are deterministic planted tests, not claimed independently blind human experiments. No separate random-pad controls run; the original max is explicitly compared with uniform baseline and the native reference.

**Decision:** retire these exact low-order stationary plaintext filters for native-English LP2 under the declared clock; do not tune lag count, phase, or bias after inspecting the negative. A materially different authenticated source selector is needed to extend the family. The reduced arbitrary-state search is reusable for other finite-field affine causal filters.

Reproduction: [single runnable CJS](../sims/lp2_plaintext_fir_allkey_ioc_sft.cjs), node from repository checkout. The experiment was executed using the connected V8 runtime on the cited source blobs; no CI claim.
