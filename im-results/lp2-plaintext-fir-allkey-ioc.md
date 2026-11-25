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

## Exact native F-hold extension (same invocation)

The all-consuming IoC gate above is now strengthened by an exact **language-independent** support decision under the authentic solved-page F rule. On any C=0, literal plaintext F may emit zero and hold the entire consuming-history state. Otherwise the model computes x=C+k+sum(b_j Xprev_j); an ordinary transition is legal only when x≠0 (plaintext F cannot be ordinary consuming). Nonzero C therefore has only the consuming branch. Scaling P=aX for nonzero a does not affect the condition X=0.

For each normalized coefficient tuple, maintain the exact set of reachable history states after each physical rune. The zero-output hold retains the old state, ordinary consumption shifts the newly computed nonzero x into the history. Deduplicate by integer state encoding and per-step stamp. Initialization is all-zero order3; order2 starts from **every** one of the 841 history pairs simultaneously. Induction on physical positions proves exact set equality to all feasible F interpretations; no heuristic pruning, language score, or path cap. For order2 with F distinguished, the earlier affine translation quotient is not used; all 29^3 bias/feedback tuples are explicitly tested, with all initial states unioned. For order3 all 29^4 coefficient tuples are tested.

| Original prefix runes | Order3 zero state keys | Order2 arbitrary state coefficient tuples |
|---:|---:|---:|
| 0 | 707281 | 24389 |
| 160 | 29277 | 24115 |
| 320 | 7209 | 23626 |
| 600 | 1262 | 14053 |
| 800 | 489 | 6845 |
| 1000 | 137 | 2034 |
| 1200 | 74 | 1126 |
| 1400 | 4 | 34 |
| 1600 | 1 | 1 |
| 1613 | 1 | 1 |

The **only** surviving coefficient tuples are (0,0,0,0) and (0,0,0). Their complete inverse is simply P=aC for nonzero a, and their 28 possible scalar permutations all retain the original IoC 0.03454946549360884. There is no nontrivial feedback/bias fit even before language scoring. This is an exact exclusion of nontrivial filters under the specified F-hold rule, not merely a statistical shortlist rejection. Arbitrary order3 initial histories, other hold rules, changing coefficients, and additional plaintext transformations remain outside the theorem.

Positive checks: two 800-rune target-excluded normalized-reference plants with both true literal holds and ordinary generated zeros (17/30 and 18/26 respectively) retain their exact final states (2,657 and 211 reachable states; this is reachability calibration, not unique plaintext inference). 64 short deterministic tests agree exactly with exhaustive independent branch enumeration. Original visited 46,958,655 and 1,090,818,888 states, respectively; 59 visible zeros, 1,613 positions. No original unknown plaintext.

[Exact F-hold SFT](../sims/lp2_plaintext_fir_fhold_exact_sft.cjs) · [Raw support counts](lp2-plaintext-fir-fhold-exact-output.json). Executed connected V8. This strengthens the finite model rejection; do not reopen the same feedback laws under the authentic F clock.

## Authentic p56 prime-minus-one clock composition (same invocation)

To address the missing nonstationary source component, compose the genuine solved p56 consuming prime-minus-one clock with the plaintext recurrence. For consuming ordinal j (zero-based, first prime 2), X=C+b Xprev1+c Xprev2+m(prime(j+1)−1)+k mod29, P=aX, a≠0. Literal F emits 0 and holds the recurrence **and** consuming prime cursor; ordinary X=0 is forbidden. Freeze prime origin zero at the actual p16 test unit. This includes genuine p56 at b=c=k=0, m=28, a=1. It does not authenticate the composition for p16–21. The m=0 stationary family was decided above and is not rerun.

Reachability state is (h, Xprev1, Xprev2), where h is number of literal holds among the previous i physical runes, so j=i−h. At C=0, hold branch increments h, ordinary branch advances history only if X≠0. All keys and legal paths are represented exactly by state-set DP. Two separate families:

- Order2 zero initial state: all 29^3*28=682,892 normalized coefficient tuples (19,120,976 full combinations including nonzero a).
- Order1 arbitrary initial state: all 29^2*28=23,548 coefficient tuples, each unioning all 29 initial histories (19,120,976 full combinations with scale).

Both families have **zero** surviving keys on original p16–21. The longest supported prefix is 1,376 for order2 and 1,369 for order1; no candidate is legal on the next position. At 600 runes, 1,225/871 coefficient tuples still survive; at 1,200, 81/38; at 1,400, zero/zero. Visited 45,384,301/39,973,664 states. Exact mathematical exclusion for the specified clock and initial-state families, with no word-boundary or language assumption. Nonzero prime origin, arbitrary order2 seed, alternative clocks/operations remain outside this particular gate.

The authentic original p56 positive reencrypts **85/85** runes with 84 consumed primes, one literal hold and four ordinary generated zeros, and its true final state is reachable. The initial Latin normalization omitted K in SEEK (84 runes); normalizing K→C restores exact 85/85 source replay. Two further 800-rune planted controls with hidden nonzero feedback/prime multipliers and actual generated zeros retain their planted terminal state (44 and 133 final states), and 64 short exhaustive path checks agree. An initial brute comparator missed incrementing h on a hold; corrected before the reported agreements. This is reachability validation, not unique plaintext recovery. All original searches were executed in connected V8 before the control comparator fix, whose error was isolated to the separate toy brute-force code and not the original DP.

[Prime-clock exact SFT](../sims/lp2_prime_clock_plaintext_feedback_exact_sft.cjs) · [Raw counts](lp2-prime-clock-plaintext-feedback-exact-output.json). No original new plaintext/key. Retire this exact source-clock + feedback composition under the stated initialization; do not repeat direct p56 additive key sweeps.

## Arbitrary initial states, exact full second-order prime-clock extension

No new cipher family or prime origin was selected. The only modification to the preceding prime-clock model is to union all 841 initial history states for each (b,c,m,k), with m in 1..28. This removes the zero-initialization limitation of the order2 exact gate. The local native C++17 implementation (4 OpenMP threads, Linux container) visited 35,593,713,554 states in 41.18 seconds over 682,892 coefficient sets. All 16,080,740,816 parameter choices including initial history and 28 output scales are represented; scaling is eliminated during reachability because it preserves F. The copied original p16–21 base29 tape was checked against the corpus length 1613, sum 22870, weighted sum 18465618. The same C++ executable at zero initialization exactly matches the previous JS all-key zero-state result, including 45,384,301 visits and maximal legal prefix 1376. 

At checkpoints 0/20/40/80/160/320/600/800/1000/1200/1400/1600/1613, the numbers of reachable coefficient tuples were 682892/682479/682263/681409/675590/664391/489311/274953/90257/51692/1700/79/77. **77** coefficient tuples survive p16–21, with 240 terminal states. Exact backward DAG counting and enumeration yields just **314** complete paths over all initial states and latent holds, each expanded to all 28 output scales (8792 parameter/path/scale representations; not necessarily distinct sequences). Max IoC 0.03538249243506928, versus normalized editorial LP1 reference 0.06217159598353921. Best add-one native-reference bigram score is -3.7366611246216204 nats/transition, versus reference -2.4989937321645237 (self-scored), last 994 reference runes -2.4964007590023907 (not independent training). Best candidate (b,c,m,k,a)=(13,13,2,8,11) starts TAETPLTHMIAEAWJUAWTLDWPAEYDXCHJHTHAOETGOUXGEAEATHXEOSNHARDLOEPIIASTLGXTUAJCXXIMJOETIPOIRDAEGEOYOESFAEEATOEAELPBGNTJPOEPIAW; not prose. IoC is independent of output scale. No language score used in reachability. 

Frozen continuation through p22–39, same coefficient tuple, exact surviving state set and consuming clock (no reset), kills every surviving tuple; longest additional legal prefix 421 runes (18,23,27,4). This is exact for a continuous p16–39 model, not proof against a chapter reset. Within p16–21 alone the model is mathematically possible but has only 314 normalized paths and none is credible English. The arbitrary order2 prime-clock model is therefore not a useful LP2 inverse. Different prime origins, dynamic coefficients, higher orders, resets remain outside this finite family; do not reopen by tuning without independent source evidence. 

Reproduction: [C++ accelerator](../sims/lp2_prime_clock_plaintext_feedback_arbitrary2.cpp), [single runnable Node SFT](../sims/lp2_prime_clock_plaintext_feedback_arbitrary2_sft.cjs), [raw summary](lp2-prime-clock-plaintext-feedback-arbitrary2-output.json). Node SFT builds C++17 compiler from source, enable OpenMP with CXXFLAGS=-fopenmp. The local C++ and connected V8 enumeration were executed separately; the newly consolidated wrapper is provided for reproduction, not claimed as an independent Windows or CI run.

### Physical p15–22 chapter boundary closure

The same complete arbitrary-state prime-clock second-order inverse was tested at the three actual chapter origins: full page 15 (offset 0), lower red rubric (offset 9), and black body (offset 20). The source scan has 9 upper-red and 11 lower-red runes; the earlier provisional 10/10 reading was corrected before execution. Each run covers 682,892 coefficient tuples, 841 seed pairs and 28 equivalent output scales (16,080,740,816 parameter representations). Results:

| Origin | Runes | Exact surviving tuples | All complete paths | Maximum IoC | Maximum frozen continuation into p23–39 |
|---|---:|---:|---:|---:|---:|
| p15+0 | 1903 | 8 | 145 | .035045114 | 470 |
| p15+9 | 1894 | 5 | 54 | .034865293 | 91 |
| p15+20 | 1883 | 4 | 46 | .035018283 | 131 |

All 6,860 path/scale representations were evaluated, with best reference bigram log scores −3.7561, −3.7628 and −3.7494 respectively. All fail uninterrupted continuation. Thus a reset at p23 is not algebraically excluded, but no native language was found even with all seeds and authentic F branching. No additional low-order prime-clock parameter sweep is motivated. Reproduce with `node sims/lp2_prime_clock_plaintext_feedback_arbitrary2_sft.cjs chapter 0` (or `9`, `20`); raw data `im-results/lp2-prime-clock-plaintext-feedback-arbitrary2-chapter-output.json`. Native C++ and separate V8 DAG enumeration executed; consolidated wrapper not independently run on Windows CI.
