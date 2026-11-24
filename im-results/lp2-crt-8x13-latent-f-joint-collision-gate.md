# #2613 — shared q8+q13 latent-F CRT key: exact joint collision exclusion

**Decision.** Retire the proposed continuous q8+q13 additive composition on original physical p40–53 **conditional on the frozen 96 native-GP windows**. No factor-vector/key search or p54–55 test follows: the predeclared necessary collision gate fails. No unknown plaintext, authenticated key, or all-language impossibility is claimed.

## Frozen architecture and independent inputs

For consuming plaintext rune (P_j\ne F), (C_j=P_j+A[j\bmod8]+B[j\bmod13]\pmod{29}). Plaintext F emits literal F and neither clock advances. One gauge, e.g. (A_0=0), leaves 20 independent GF29 digits. Arbitrary initial common phase is immaterial to the gate. These periods are historical LP1 key lengths, not a first-party LP2 instruction selecting their sum. #2475's fixed-physical q13×31 result and #2521's separate q8/q13 hidden-F result do not decide this shared q104 clock.

The exact original p40–53 rune tape has 3,008 runes and 125 visible F runes. Reuse #2521's three source registers, normalization and 32 evenly spaced contiguous windows of 3,008 physical runes per register. Remove actual plaintext F from each native window. The complete 96-window data and input Git blob IDs are in [raw results](lp2-crt-8x13-latent-f-joint-gate-output.json). The comparison is a finite descriptive corpus, not 96 independent statistical trials.

## Why the test covers every factor vector

After deleting actual transparent positions, the effective additive key is periodic at 104. At any lag (d=104,208,312), a rune collision and an adjacent bigram collision are invariant between active plaintext and active ciphertext. This is true even for arbitrary independent bijections at the 104 phases, a superset of the separable additive family.

The first pass uses an exact suffix-history DP over every subset of visible ciphertext F. For lag104, merging equal active suffixes of length105 preserves the exact scalar minima/maxima of each count. No fixed visible-F deletion rule, beam or key restriction enters the calculation.

| Register | Windows | Lag104 survivors |
|---|---:|---:|
| Shakespeare | 32 | 1 |
| Emerson | 32 | 0 |
| Gibran | 32 | 0 |

Original lag104 bounds: rune collisions **20–188**, adjacent-bigram collisions **0–10**; 1,992 peak history states. The sole rectangular survivor is Shakespeare window31, GP offset214098, 56 actual F holds, with rune/bigram count pairs (172,8), (165,20), (156,18) at lags104/208/312.

## Exact joint integer gate on the one remaining window

Let (H_k) be the number of held F among the first (k) visible ciphertext F positions. Each increment is exactly 0 or1, and (H_{125}-H_0=56). For a candidate equal active pair at physical indices (j,i), active lag (d) requires
[
H_{r}-H_{l}=i-j-d,
]
where ([l,r)) indexes visible F in physical interval ([j,i)). The endpoints must consume. For an equal adjacent bigram, additionally enumerate the possible preceding active positions at each endpoint (consecutive optional zeros and the first preceding nonzero), enforce their equal value, require both predecessors to consume and all intervening optional F to hold. These are all interval-cardinality or fixed-bit constraints; there is no language-score optimization.

There are 12, 40 and 56 possible bigram events at the three lags. A real mask satisfying the native counts must activate at least 8,20,18 events respectively. Pairwise compatibility is determined by the exact four-region integer count split (intersection, either exclusive interval, outside) after accounting for forced holds/consumes. The graph of pairwise compatible events only prunes branches: a clique is not accepted as a mask. The quota search selects events and maintains the exact integer difference-constraint closure for all selected interval and fixed-bit equations. A new directed bound (u\to v) of weight (w) is impossible iff (D[v,u]+w<0). Otherwise the shortest-path matrix update is (D'[i,j]=\min(D[i,j],D[i,u]+w+D[v,j])). All edge weights are integers, hence no negative cycle implies integer cumulative counts. Greedy graph coloring supplies safe clique-size upper bounds, including per-lag quotas. Branching partitions all subsets by their first selected event; selecting exactly the required number suffices because any true mask with more events contains such a subset.

**Result: 2,062 visited nodes, zero feasible selections, no cap.** Even granting any 104-phase bijection, the only remaining native control cannot attain all three necessary bigram counts with its actual 56 holds. The exact lag104 rectangle and this joint gate therefore exclude all 96 windows, without testing any p54–55 plaintext or key. An independently implemented SciPy/HiGHS binary interval-cardinality model also returned infeasible (233 variables, 242 rows); the committed integer-only solver is the authoritative certificate and needs no numerical optimizer.

## Calibration and reproduction

The SFT checks event enumeration on 618 exhaustive small masks and compares 216 exact quota decisions against full brute force. Three independently seeded random 8×13 additive plants on distinct 3,008-rune Shakespeare, Emerson and Gibran windows preserve all six active rune/bigram counts; the true latent masks satisfy every corresponding event and the total hold count. Their actual/ciphertext F counts are 50/141, 86/203 and 76/178. This verifies the necessary gate on real native-GP source text, **not** blind factor recovery. The assignment explicitly stops when the gate fails, so no arbitrary q104 or uniform-pad key inference benchmark, vector recovery, or p54–55 continuation was run.

Reproducer: [sims/lp2_crt_8x13_latent_f_joint_gate_sft.cjs](../sims/lp2_crt_8x13_latent_f_joint_gate_sft.cjs), Node22/CommonJS, repository root. Raw [all-window output](lp2-crt-8x13-latent-f-joint-gate-output.json). Actual repository inputs and algorithm executed in connected V8; the independent exact quota calculation also ran locally. No CI execution is claimed.

## Director fork

The specific q8+q13 shared consuming-clock hypothesis is closed on the declared p40–53 native window comparison. Do not spend a new factor-key sweep on the same premise. Different registers, a different effective clock or independent resets require independent source evidence. The interval-quota approach is reusable when independent collision bounds leave sparse survivors, especially #2606; it does not by itself identify a cipher or solve an unknown page.
