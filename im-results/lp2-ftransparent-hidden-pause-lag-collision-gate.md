# Exact hidden-pause and sparse-slip collision bounds for the authentic plaintext-F clock (#2521, #2606, #2609)

**Decision:** In physical LP2 p40–53 (one continuous chapter clock, arbitrary starting phase), the original ciphertext is incompatible with every one of the 96 frozen native-GP control windows for **all periods 2–32** even permitting every possible subset of ciphertext F to be transparent. #2521 established q8/q13; #2606 covers the other 29 periods. Each statistic independently separates the other 29 periods even after conservative active-length normalization. The same invariants pass both authentic encrypted LP1 controls and four additional independent random-key plants including harmonics. The sparse-slip extension also excludes q13 with up to two signed unit slips under the same 96-window comparison register. These are finite-register all-key obstructions, not a proof about all conceivable prose or a recovered LP2 key.

## Model and theorem

The authentic solved LP1 WELCOME and second KOAN encryption rule is
```
P_i = F  => C_i = F, k does not advance
P_i != F => C_i = (P_i + K[k mod L]) mod29, k advances
```
A ciphertext F is not necessarily a transparent F. Delete the actual transparent positions, producing active streams (P') and (C'). For any pair of active indices separated by an integer multiple of L, their phase is identical. Thus
```
P'[i] == P'[i-d] iff C'[i] == C'[i-d], d = L,2L,3L.
```
For the same reason equal length-2 blocks at these distances are preserved. This remains true under any fixed bijection for each phase, not merely an additive shift. It is independent of the key digits, initial phase, and printed word boundaries. It allows an arbitrary key per tested chapter, but not an unmodelled reset inside the chapter.

For a given ciphertext, permit deletion of **any** subset of its visible F runes, not just subsets compatible with a particular key. Compute exact minima/maxima of each invariant over these relaxed paths by dynamic programming on the most recent (3L+1) consumed rune values. At F, both consume and skip branches are retained; every other rune consumes. The future increment to either count depends only on this suffix. Therefore merging states with the same suffix while keeping componentwise minima and maxima is exact for each scalar statistic. Joint bounds are a safe rectangular relaxation; passing the bounds is not a feasible-key witness. A compatible key/clock is necessarily in the relaxation.

A toy sequence with five optional F deletions was exhaustively enumerated and matches the DP exactly: equal-rune range 3–7; equal-bigram range 0–2.

## Frozen experiment and authentic positive controls

The target, periods, statistics and comparison domain were frozen in [#2521 comment 7124769127](https://github.com/FlareZ123/liber-primus/issues/2521#issuecomment-7124769127) before the target results. Primary target p40–53 (3008 runes, 125 visible F). Supplementary scopes are the other eight physical chapters and the whole 12956-rune continuous tape. For each scope, select 32 evenly spaced, contiguous windows of identical **visible** length from each of the existing Shakespeare, Emerson and Gibran native-GP controls. Remove all actual plaintext F in each window. There is no reliance on printed word lengths or any ciphertext-derived word segmentation. Windows overlap and are descriptive finite controls, not independent significance trials.

Replay exact original WELCOME (515 runes, period 8 DIUINITY) and second KOAN (319 runes, period 13 FIRFUMFERENFE) with the already pinned native solved sources, requiring every ciphertext rune to agree.

| Authentic original | Period | Printed Fs | Actual transparent Fs | True rune count | DP rune range | True bigram count | DP bigram range |
|---|---:|---:|---:|---:|---:|---:|---:|
| WELCOME | 8 | 25 | 11 | 88 | 68–102 | 9 | 6–11 |
| KOAN | 13 | 5 | 2 | 65 | 57–69 | 10 | 8–11 |

Both active plaintext statistics equal their exact active ciphertext statistics. WELCOME has 14 ordinary encrypted F outputs and KOAN has 3, confirming that a fixed visible-F deletion rule would be invalid.

## Primary original result

Counts aggregate the three frozen active distances L, 2L and 3L. Each displayed native minimum is the minimum of that source's 32 windows.

| Period | Exact original rune range | Native minima S/E/G | Exact original bigram range | Native minima S/E/G | Joint native passes |
|---|---:|---|---:|---|---:|
| 8 | 220–391 | 493 / 520 / 500 | 5–19 | 44 / 38 / 46 | 0/96 |
| 13 | 223–425 | 464 / 497 / 499 | 6–24 | 34 / 41 / 50 | 0/96 |

Thus each statistic independently rejects every primary control window, even before enforcing the common unknown additive key. The peak number of live distinct history states was 64 in both searches. No beam, mask cap or heuristic pruning.

## Remaining periods 2–32 (#2606)

The target and comparison register are unchanged. The original q8/q13 experiments are not rerun. For each other period (q=2,3,\ldots,32), the exact suffix DP uses the last (3q+1) active runes and counts collisions aggregated at (q,2q,3q). The native window's active length is fixed by its plaintext F holds. For an additional conservative rate comparison, divide the original maximum count by the minimum possible number of opportunities, (3(3008-125)-6q) for rune pairs and three fewer for bigrams. Divide each native count by its actual opportunity count (3(3008-H)-6q) (and minus three for bigrams). This upper bound relaxes the dependence between collision count and number of holds and cannot reject a valid match spuriously.

All 29 new periods reject all 96 windows separately on both raw counts and normalized rates. Peak live history size is 1,024. The narrowest conservative normalized rune gap is 0.001935146 at q28; the narrowest bigram gap is 0.000142683 at q27. No surviving period justifies an original key recovery sweep.

| Period | Rune: original max / native min | Bigram: original max / native min | Peak states | Windows passing |
|---:|---:|---:|---:|---:|
| 2 | 345 / 409 | 13 / 20 | 8 | 0 |
| 3 | 354 / 481 | 16 / 31 | 9 | 0 |
| 4 | 358 / 460 | 14 / 29 | 21 | 0 |
| 5 | 379 / 492 | 22 / 30 | 37 | 0 |
| 6 | 367 / 496 | 17 / 36 | 63 | 0 |
| 7 | 370 / 493 | 16 / 28 | 64 | 0 |
| 9 | 375 / 493 | 20 / 36 | 64 | 0 |
| 10 | 389 / 495 | 27 / 37 | 64 | 0 |
| 11 | 401 / 482 | 25 / 42 | 64 | 0 |
| 12 | 399 / 495 | 20 / 35 | 64 | 0 |
| 14 | 427 / 491 | 27 / 36 | 86 | 0 |
| 15 | 419 / 482 | 23 / 44 | 127 | 0 |
| 16 | 399 / 487 | 15 / 38 | 128 | 0 |
| 17 | 420 / 479 | 20 / 39 | 128 | 0 |
| 18 | 410 / 498 | 26 / 44 | 128 | 0 |
| 19 | 418 / 483 | 19 / 41 | 136 | 0 |
| 20 | 442 / 493 | 31 / 45 | 227 | 0 |
| 21 | 426 / 475 | 30 / 34 | 256 | 0 |
| 22 | 406 / 501 | 22 / 32 | 256 | 0 |
| 23 | 431 / 476 | 28 / 46 | 256 | 0 |
| 24 | 441 / 501 | 33 / 38 | 418 | 0 |
| 25 | 432 / 490 | 20 / 28 | 511 | 0 |
| 26 | 442 / 484 | 25 / 35 | 512 | 0 |
| 27 | 437 / 482 | 36 / 38 | 512 | 0 |
| 28 | 440 / 464 | 29 / 37 | 512 | 0 |
| 29 | 430 / 494 | 33 / 35 | 512 | 0 |
| 30 | 444 / 485 | 40 / 43 | 605 | 0 |
| 31 | 450 / 511 | 39 / 41 | 978 | 0 |
| 32 | 426 / 495 | 34 / 37 | 1024 | 0 |

Four independent random-key plants test the identical key-free bound (no key passed to the DP): Shakespeare q2 (3008 runes), Emerson q17 (3008), Gibran q32 with primitive q16 (1200), Shakespeare q30 with primitive q15 (1200). The genuine active plaintext and ciphertext counts agree, and all four counts lie inside the respective exact relaxed bounds. Twenty-four random toy tapes independently exhaust all F masks and match the DP minima/maxima. The initial original computation used the already established DP; the new plants were subsequently checked before publishing. No key inference is claimed on these controls.

[New SFT](../sims/lp2_fhold_period2to32_exact_gate_sft.cjs) and [complete 29×96 count, rate and control data](lp2-fhold-period2to32-exact-gate-output.json). Actual repo data and exact algorithm executed in connected V8; no CI execution claimed.

## Supplementary original scopes

| Pages | Runes | Period8 max rune / bigram | Period13 max rune / bigram | Joint passes 8 / 13 (each /96) |
|---|---:|---:|---:|---:|
| 0–2 | 729 | 94 / 3 | 101 / 1 | 0 / 0 |
| 3–7 | 1145 | 139 / 7 | 141 / 9 | 0 / 0 |
| 8–14 | 1729 | 210 / 10 | 218 / 14 | 0 / 0 |
| 15–22 | 1903 | 254 / 9 | 256 / 14 | 0 / 0 |
| 23–26 | 1021 | 128 / 4 | 145 / 11 | 0 / 1 |
| 27–32 | 1433 | 176 / 8 | 210 / 7 | 0 / 0 |
| 33–39 | 1680 | 208 / 6 | 186 / 8 | 0 / 0 |
| 40–53 | 3008 | 391 / 19 | 425 / 24 | 0 / 0 |
| 54–55 | 308 | 42 / 1 | 35 / 4 | 0 / 2 |
| 0–55 continuous | 12956 | 1657 / 68 | 1749 / 96 | 0 / 0 |

Whole-book period8 source rune minima are 2252/2362/2399 and bigram minima 204/238/235; period13 minima are 2197/2378/2288 and 204/231/247. The three surviving supplementary control windows at period13 merely fall inside both independent scalar intervals; they are not actual feasible key/clock assignments.

## Sparse signed phase slips (#2609)

**Decision:** On the same 3,008-rune p40–53 chapter, even granting up to two arbitrary ±1 changes in the consuming clock, none of the 96 frozen contiguous native GP windows can satisfy the necessary collision invariants of a fixed period-13 phase-bijection cipher. The proved lower bound is **at least three slips**, with no feasible three-slip witness. This is conditional on the frozen finite comparison register; it is not a theorem about every plaintext with the old fixed-clock scalar collision minima. No source location or authentic slip instruction is established.

Let a consuming position have integer clock t_i=i+Σs_j over slips before it, with s_j in {-1,+1}, and allow the two slips at the same physical gap. Plaintext F still emits F without advancing. The initial phase is free. For d in {13,26,39}, count equal consuming rune pairs at clock difference d (R); count equal adjacent consuming bigrams only if both corresponding clock differences are d (B). Both statistics are exactly invariant under any secret fixed bijection for each phase. In particular, the old fixed-active-index comparison alone would be invalid after a slip; both original and native sides are now bounded under the changed clock.

**Certified upper on original:** The old suffix DP extended with independent scalar objectives R, B, R+4B gives exact no-slip maxima 425, 24, 507. For each equal physical ciphertext end pair, the possible active distance interval is [physical distance − interior visible F count, physical distance]. A nonzero net shift s in {-2,-1,1,2} permits a new collision only when the interval contains d−s for a tested d. For bigram gain also require some possible consuming predecessor equality. Count every such candidate, even mutually inconsistent F masks. Subtract any guaranteed lost nominal pair with no zero in the closed endpoint interval, and its bigram if both immediate predecessors are guaranteed consuming and equal. Each event is a physical cut interval with signed weights. For two ordered cuts, sum their individual interval contributions and replace the contributions of intervals containing both cuts by the contribution of the combined shift. Difference arrays and a banded exact overlap table maximize this bound over all cut pairs and signs; no candidate cut is sampled.

**Certified lower on native:** For each of the same 96 active donor windows, subtract the maximum total weight of nominal equality intervals touched by one or two cuts; for bigrams use the entire interval from the earlier predecessor to the later end. The exact maximum two-cut union weight uses the same interval overlap identity, granting even independently chosen native cut locations and signs. This deliberately discards all new native collisions and does not assume aligned ciphertext/native cut locations.

| Slip budget | Original R upper | B upper | R+4B upper | Surviving native windows |
|---|---:|---:|---:|---:|
| 0 | 425 | 24 | 507 | 0/96 |
| ≤1 | 447 | 27 | 534 | 0/96 |
| ≤2, interval relaxation | 464 | 30 | 558 | 1/96 |
| ≤2, local exact refinement | 464 | 30 | 547 | 0/96 |

The one relaxed survivor is Shakespeare window 23 (zero-based, native GP offset 158847, 55 actual F holds). Its nominal counts are R=464, B=34, R+4B=600. The most favorable two-cut removal bounds are 25, 8, and 52 respectively, giving lower bounds 439, 26, and **548**. The weighted lower bound is calculated jointly, rather than combining the separate minima.

**Exact local refinement:** The last survivor requires an original weighted increase of at least 41 above the fixed-clock maximum 507. For a single cut, the interval bound filters to 71 cut/sign candidates with upper gain ≥21; enumerate every local visible-F subset for each. Affected equality intervals span at most 42 active gaps including a bigram predecessor, so 43 guaranteed consuming (nonzero) positions on each side suffice to contain every changed contribution. The maximum actual single-cut increase among the candidates is 17; all others have upper ≤20. Hence two cuts separated by at least 43 nonzero physical positions have total gain ≤40 by additivity of disjoint affected comparison intervals. For closer cut pairs, the same interval upper filters to 420 ordered cut/sign candidates with gain ≥41, including coincident cuts. Exact local enumeration gives maximum 28; all other close cases have upper ≤40. Therefore every allowed two-slip clock has original R+4B ≤507+40=547, strictly below 548. The 71 single candidates enumerate 7,104 local masks; the 420 close candidates enumerate 226,304. No enumeration cap is reached.

**Controls and reproducibility:** 32 seeded toy tapes exhaust 1,024 full F masks, checking the coarse inequality, exact local-versus-global delta, and far-cut additivity. Three independent arbitrary GP29 permutation plants on genuine native WELCOME and KOAN plaintexts inject (+1,−1), one −1, and two coincident +1 slips respectively; exact inverses and slipped-clock collision counts agree, with R/B=101/18, 62/10, 66/10. Both certificate directions contain each plant's true score. These controls test the necessary-condition bound, not blind key/slip recovery. The actual original and control runs executed in the connected JavaScript runtime. No Windows CI run claimed.

[Node22/CommonJS reproducer](../sims/lp2_q13_sparse_phase_slip_collision_bound_sft.cjs) · [complete machine-readable certificate](lp2-q13-sparse-phase-slip-collision-bound.json). Run from repository root with `node sims/lp2_q13_sparse_phase_slip_collision_bound_sft.cjs`. The input Git blob SHAs, all 96 donor bounds, and each exact cut candidate are included in the output.

**Consequence:** The source-correction premise does not rescue the native period-13 route with one or two ±1 slips. Only one of #2597's two separator corrections lies in this chapter, and a corrected separator is not itself evidence of a consuming-clock slip. Three slips in a 3,008-rune chapter is still a small lower bound; do not claim a large complexity obstruction or that three suffice. No independently visible slip locations, key or held-out plaintext exist. Stop this finite gate and require an independent source-selected clock law before reopening key recovery.


## Progressive period-eight keyword (#2641, Agent46)

**Decision:** Reject the source-continuous progressive-q8 additive model under the same frozen 96-window native reference register, for all 28 nonzero increments, arbitrary initial phase and every possible latent F history. This is an independent reproduction of the already established progressive-q8 result: Agent8's [09:09Z exact gate](lp2-progressive-cycle-and-arbitrary-cycle-fhold-inverse.md#spacing-free-all-slope-necessary-condition), [commit 254978b](https://github.com/FlareZ123/liber-primus/commit/254978bebb4793399f3db5c458fe7d6ac4c82703), used the same p40–53 tape, all-slope translated-lag invariant, all visible-F deletions and 96 native windows, obtaining identical 431/28 maxima and 493/38 donor minima. The earlier work additionally covers q13 and the full manuscript. #2641 adds independent controls and a historical citation; it does not enlarge the excluded domain.

A real period-available example is Helen Fouché Gaines, *Elementary Cryptanalysis* (1939), chapter XX, Fig.155: each consecutive eight-letter keyword is alphabetically advanced by a fixed increment. [Original book text, Project Gutenberg](https://www.gutenberg.org/files/75074/75074-h/75074-h.htm), ch.XX (the book predates 2014; the digital edition need not). This supplies a recognizable operation, not evidence Cicada selected it.

Freeze consuming position j and `C'[j]=P'[j]+K[j mod 8]+d floor(j/8) mod29`, d=1..28. As in WELCOME, physical plaintext F emits F without advancing j; a consuming non-F may emit ciphertext F. For each m=1,2,3, same-base-phase pairs separated by 8m satisfy
```
P'[j] == P'[j-8m] iff (C'[j]-C'[j-8m]) mod29 == m*d mod29.
```
The preceding pair has the same shift difference, so this also exactly characterizes equality of active bigrams. An arbitrary initial clock merely rotates/rebases the eight-vector; the invariant does not depend on it. The effective key period is 232, but the shorter translated-lag invariant remains.

Reuse the exact suffix DP with 25 most recent consumed symbols, replacing equality by the translated comparison above. Independently exact rune and bigram extrema, permitting *every* deletion subset of ciphertext zeros, even those inconsistent with an actual key. Retain the original corrected p40–53 full 3008-rune tape (125 ciphertext zeros) and the same 96 fixed length-matched Shakespeare/Emerson/Gibran windows. Their native minima remain 493 rune and38 bigram collisions; conservative active-length normalized minima .0559147102189 and .00436029833620.

Across all d=1..28, the strongest original maximum occurs at d=7 for both statistics: **431 rune and28 bigram** collisions, normalized upper .0501104522730 and .00325657129565. Thus every increment rejects every reference window independently on either statistic, even after the conservative normalization. Zero joint passes; peak64 suffix states. No mask cap or language selection.

Three independently encrypted 3008-rune source-native literary plants with secret eight-vectors, d=1,17,28 and initial consuming origins0,3,7, have true counts 569/59,558/63,607/94, inside the corresponding exact relaxed bounds. Direct active plaintext-versus-ciphertext collision replay agrees in all three; 32 independently seeded toy tapes exhaust every zero mask and match DP extrema. No blind key recovery claimed or performed because the necessary gate fails on original. No unknown plaintext.

[Node22/CommonJS exact reproducer](../sims/lp2_progressive_q8_fhold_exact_gate_sft.cjs) · [all28 increment bounds, 96 native windows, and plants](lp2-progressive-q8-fhold-exact-gate-output.json) · [checkpoint a5808dd](https://github.com/FlareZ123/liber-primus/commit/a5808dd9695738a66befb4516c954cf073ebae14). Executed in connected V8. No Windows CI claim. No arbitrary increments, reset positions, alternative periods or native registers are excluded beyond this stated family. Reopen only upon a new independently source-selected progression or clock.

## Progressive affine cycle: arbitrary phase bijections (Agent15)

Extend the progressive additive cycle result to the **783 genuinely new nontranslation affine maps** (T(x)=ax+b\pmod{29}), (a=2,…,28), (b=0,…,28). The frozen consuming model is (C'[j]=T^{\lfloor j/8\rfloor}(S_{j\bmod8}(P'[j]))), with eight unrestricted fixed symbol bijections (S_j), arbitrary origin, and the historical transparent-plaintext-F/no-clock-advance rule. This is an exploratory generalization, not a newly authenticated Cicada operation.

For active lag (8m), (m=1,2,3), equal plaintext symbols are equivalent to (C'[j]=T^m(C'[j-8m])), since both (T) and (S_j) are bijective. The equivalent preceding-position comparison gives the same invariant for equal active bigrams. A 25-symbol suffix-state graph branches on every ciphertext F (hold or consume), and exact DP gives independent maxima for each statistic; the relaxed masks need not be feasible under any actual key. The graph is reused across all affine maps.

On the original p40–53 (3,008 runes, 125 visible F, peak 64 states), all 783 maps fail all 96 previously frozen matched literary windows. **Maximum rune collisions 444** (a=4,b=20); **maximum bigram collisions 34** (a=21,b=2), versus native minima **493/38**. The conservative normalized upper bounds are 444/8601 and 34/8598, below native minima 0.0559147102189 and 0.00436029833620. The already established translation case completes the affine family, including identity via the fixed-phase gate. No additional key fitting is warranted for this model.

Sixty-four seeded exhaustive toy mask checks agree exactly with the DP maxima. Three distinct 3,008-rune native plants use eight random full permutations, affine maps (2,7), (7,13), (28,11), and initial consuming origins 0,3,7. Their exact plaintext/active-ciphertext collision pairs 569/59, 558/63, 607/94 lie inside the original-style all-mask bounds 633/68, 618/68, 655/101 respectively. The complete CommonJS run core executed in connected V8; no standalone Windows CI claim.

[Reproducer](../sims/lp2_progressive_affine_q8_fhold_exact_gate_sft.cjs) · [all maps, controls and planted keys](lp2-progressive-affine-q8-fhold-exact-gate-output.json). Reject the frozen continuous q8 common affine drift family under the finite native reference register. This does not exclude arbitrary nonaffine drift, unrelated cycle maps, different clocks, resets or other plaintext distributions. No unknown plaintext or key.

## Blind nonlinear common-cycle map across chapters (Agent15)

Allow an arbitrary permutation T of all 29 outputs, rather than an affine map. Permit every specified page interval its own eight arbitrary fixed phase permutations and its own clock origin. Only T is shared across intervals. This creates a genuinely nonlinear, recoverable component, not a claimed historical key schedule.

The exact intervals are p0–2, p3–6, p7–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. In particular the p6/p7 split is an analyst choice; this is not an authenticated chapter-reset convention.

The initial single-interval p40–46 fit was uncalibrated: only 6/1/6 of the 29 planted T entries were recovered, so no original exclusion follows from that pilot. The longer training experiment freezes seven training intervals p0–39, and uses p40–53 and p54–55 strictly for prediction. Its objective is active lag-8/16/24 equality count minus 0.35 per deleted ciphertext F. A fixed T admits an exact suffix DP and mask traceback. A fixed active tape admits a maximum-weight assignment initialization at lag 8 and local output swaps maximizing the sum of three lag counts. Alternate these two steps, with 16 seeded restarts, at most 10 rounds/restart and 20 best improving swaps/round. Selection uses training objective alone; no plaintext language scoring or held-out tuning.

Three native literary plants use the nine frozen page-interval lengths, one random full common T, independent random per-interval phase permutations and origins. The training-only procedure recovers **29/29, 25/29, 29/29** map entries. The corresponding exact held-out p40–53 rune/bigram maxima are 625/66, 597/68 and 589/88, versus actual native counts 582/54, 590/79 and 550/82. Thus the middle plant is a genuine partial failure, not an exact-recovery success. The independently maximized count pair for the frozen original fitted map is **384/22**, below every one of the 96 frozen same-length native windows (493/38); original training objective 1426.70 versus plant objectives 1882.95, 1867.65, 1943.70. On p54–55 the frozen original map gives only 36/2. This rejects the **particular trained map** under the native register; it is not an all-permutation theorem, and no phase keys or plaintext were recovered. A loose independent-lag assignment relaxation on p40–53 upper-bounds arbitrary T by 903 rune collisions, so it is not a useful exact rejection.

[Reproducer](../sims/lp2_nonlinear_common_cycle_q8_fhold_blind_fit_sft.cjs) · [frozen fit and controls](lp2-nonlinear-common-cycle-q8-fhold-blind-fit.json). Run core executed in connected V8. No Windows CI claim. No further unconstrained permutation fitting warranted absent a better source-selected law or an independently recovered key component.

## Research decision

Retire the fixed period **2–32** F-transparent continuous-chapter route for the frozen p40–53 native register, and treat whole-book q8/q13 reuse as very strongly disfavored under the same register. The result expands the fixed-phase theorem by allowing latent plaintext-F pauses exactly, and is independent of the previous all-secret period8 digit enumeration. Do not repeat a heuristic key search for these same assumptions. It does not exclude a distinct non-native register, different period, state-dependent bijection, transposition or independently source-selected internal reset. For the original q8/q13 supplemental experiment, the only unresolved small-scope windows are period13 p23–26 and p54–55; a surviving relaxed window is not a basis for speculative extra reset tuning.

For a genuinely different hypothesis, an observed reset schedule or alternate register independently selected before comparing the ciphertext would change the model. The q13 sparse-slip extension requires at least three slips for the frozen native register and supplies no source-selected correction law. Nothing here recovers unknown LP2 plaintext or key.

Reproduction: [standalone Node22/CommonJS SFT](../sims/lp2_ftransparent_hidden_pause_lag_collision_sft.cjs), commit b2aafba4884fc6e149d3618168ec6b11ab7d67c1. Run from repository root with `node sims/lp2_ftransparent_hidden_pause_lag_collision_sft.cjs`. Actual original data, exact authentic positive replays and toy brute-force comparison were executed in connected V8; no independent Windows CI claim.
