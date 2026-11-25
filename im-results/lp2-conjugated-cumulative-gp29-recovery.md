# Spacing-free cumulative GP29 inverse with independently secret alphabet permutations

**Agent31, 25 November 2026.** A blind original-cipher inversion attempt and an exact all-key capacity refinement. Four native control encryptions (two distinct Gibran passages, two independently generated keys/anchors per passage) recover every withheld rune. Original p16–22 fails predictive recovery, and the larger two-secret-permutation architecture is excluded for that span and five of nine complete chapters against all contiguous windows in two fixed literary registers. No unknown plaintext, key or destination recovered.

## Operation and evidence

The rare equal-successor pattern motivates a continuous cumulative encoder: if the increment corresponding to one rare plaintext rune is zero, adjacent ciphertext equality exposes that rune regardless of the secret output alphabet. GP29 supplies an authentic field of prime order; arbitrary relabeling of its elements is an exploratory hypothesis, not a first-party key instruction. The solved p56 uses a different additive prime-totient clock and literal-F holds, so it is not an authentic positive control for this proposed mechanism.

Start from canonical p16–22 (1,744 ciphertext symbols), disregard printed word lengths/order, and use

```
C[i] = S^-1((S(C[i-1]) + P[i] - b) mod 29)
P[i] = (S(C[i]) - S(C[i-1]) + b) mod 29
```

S is an arbitrary bijection of GP29, b is the reserved plaintext anchor. The first ciphertext rune is the supplied IV, so there are 1,743 recoverable plaintext positions. No literal-F bypass, hidden state, page reset, clock drift or post-ciphertext reordering is modeled. Global translation of S is a gauge and does not alter any plaintext. The observed 10/1,743 equality rate is used only to choose the two nearest unigram rates in the fixed Emerson model: NG/ING (0.60810%) and IA/IO (0.66008%); this is a full-target scalar selection, so the withheld continuation is independent for key training but not completely untouched for anchor selection.

The decoder optimizes the output permutation directly, using a trigram model trained on 321,327 GP-native Emerson runes, with add-half unigram smoothing and backoff strengths 20 and 35. It uses 4 seeded 30,000-swap simulated-annealing restarts on 1,220 decoded prefix positions; it updates only affected trigram terms. The highest training-scoring key is frozen before decoding 523 continuation positions. No printed separators are used. It checks full exact forward replay including the given IV. Replay is an implementation invariant for *every* permutation and supplies no key authentication.

## Blind recovery results

The two target-excluded Gibran passages are at offsets 10000 and 30000 in the fixed encoded file. The same passage is reused across the two anchor variants, so there are two independent plaintexts and four independently generated encryption keys, not four independent texts.

| Anchor | Original train | Original withheld | Equal-mask randomized null withheld | First native withheld | Second native withheld |
|---|---:|---:|---:|---:|---:|
| NG | -5.218528 | -6.168767 | -5.799520 | -2.323416 (523/523) | -2.286903 (523/523) |
| IA | -5.112138 | -6.002045 | -5.824703 | -2.323416 (523/523) | -2.286903 (523/523) |

Units: mean conditional trigram log likelihood, nats per rune, higher better. Matched nulls independently generate the next rune uniformly among the 28 unequal values except at the original equality positions. Each run has exact replay. Some control restarts miss the correct basin (e.g. NG first control 1/4 successful), hence this is a heuristic attack, not exhaustive key enumeration. The original keys and previews are retained in the raw JSON; the original continuation scores are worse than both respective matched nulls and substantially below correctly decoded native text.

## Exact stronger all-secret capacity

A preexisting [arbitrary predecessor-row majorization theorem](lp2-firstorder-static-quasigroup-majorization-gate.md) bounds frequencies by independently taking the largest transitions in each ciphertext-predecessor row. That broader model need not have column constraints. This extension instead considers the more specific reversible family with **two wholly independent secret permutations** S and H, where

```
C[i] = S^-1((S(C[i-1]) + H(P[i])) mod 29).
```

No choice of H or S is fitted. For any nonzero increment d, a fixed plaintext rune induces a permutation of all 29 ciphertext states, specifically one 29-cycle (because 29 is prime); the zero increment is the identity. For any k nonzero increments, their transition edges form a simple bipartite k-regular graph: exactly k outgoing and k incoming edges at every vertex, no diagonal, no shared edges. The true cyclic-group structure is stronger than this relaxation.

Let W[a,b] count all original directed transitions including physical page seams within the selected span, D = sum W[a,a], and M_k be the maximum weight of any diagonal-free bipartite k-regular graph. This is an exact integral min-cost-flow problem: source→row and column→sink capacity k, every off-diagonal row→column edge capacity1 with cost -W[a,b]. M_0=0. For *every* secret S,H and every plaintext ordering, the sum of the k highest plaintext frequencies is at most

```
B_k = max(M_k, D + M_(k-1)).
```

The second term grants inclusion of the zero-increment rune. The bound is necessary, not sufficient for a genuine cyclic-group key: an optimal regular graph need not decompose into compatible powers of one 29-cycle. It requires no intact printed words and survives arbitrary *plaintext* order permutation, but not a ciphertext permutation that changes observed transitions, changing state, or variable-length transport. Each span has its first symbol as IV.

All contiguous length-matched GP windows in the exact repository Emerson and Gibran files were enumerated (overlapping windows, not independent observations). For each window we require top-k frequency sums <= B_k for every k=1..5. The table reports the original B1/B5 and numbers passing all five bounds.

| Original physical span | Edges | B1 / B5 | Emerson survivors / windows | Gibran survivors / windows |
|---|---:|---:|---:|---:|
| p0–2 | 728 | 87 / 338 | 120675 / 320600 | 34749 / 61765 |
| p3–7 | 1144 | 117 / 455 | 144 / 320184 | 0 / 61349 |
| p8–14 | 1728 | 146 / 602 | 0 / 319600 | 0 / 60765 |
| p15–22 | 1902 | 164 / 671 | 0 / 319426 | 0 / 60591 |
| p23–26 | 1020 | 104 / 404 | 236 / 320308 | 6 / 61473 |
| p27–32 | 1432 | 131 / 534 | 0 / 319896 | 0 / 61061 |
| p33–39 | 1679 | 152 / 611 | 0 / 319649 | 0 / 60814 |
| p40–53 | 3007 | 229 / 940 | 0 / 318321 | 0 / 59486 |
| p54–55 | 307 | 58 / 196 | 320783 / 321021 | 62167 / 62186 |
| p16–22 | 1743 | 156 / 634 | 0 / 319585 | 0 / 60750 |
| p0–55 | 12955 | 685 / 3117 | 0 / 308373 | 0 / 49538 |

The specific new column-coupled restriction matters on p16–22: the older independently maximized row-only one-symbol capacity is 172, versus the minimum native top-one counts166 (Emerson) and170 (Gibran), so that single statistic was inconclusive; the exact regular-graph cap156 is below both. The row-only top-five statistic already rejects those finite windows; the refinement does not claim to newly exclude the entire earlier, broader predecessor-row family. The fresh calculation also shows p27–32 fails via k>=2 even though its B1 equals the Emerson minimum. Five complete chapters individually fail even with private S,H per chapter. Four shorter chapter spans retain finite windows; a pass is just a relaxed marginal constraint, never a plaintext solution.

One native independent two-permutation plant gives actual top-k sums [195,352,478,603,720], beneath computed caps [215,409,571,717,845]. An exhaustive 4-vertex toy graph check independently verifies exact min-cost regular capacities [0,22,31,39]. The separate annealing experiment supplies four exact inversion controls. No CI is claimed; both code paths executed in connected JS runtime.

## Decision

Retire the fixed continuous conjugated cumulative decoder as a serious receiver for p16–22 under the tested native registers. The exact relaxation excludes the stronger independent inner permutation on five complete spans and the full tape, so widening the annealing search to H or tuning the rare anchor on those spans is unwarranted without independent evidence for a different state clock or balanced plaintext. The short surviving chapter spans are only reasonable candidates for further **actual key recovery** if a source clue independently selects this architecture. Do not reinterpret the count bounds as proof of arbitrary-language impossibility.

## Reproduction

- `node sims/lp2_conjugated_cumulative_gp29_recovery_sft.cjs` — [code](../sims/lp2_conjugated_cumulative_gp29_recovery_sft.cjs), [raw](lp2-conjugated-cumulative-gp29-recovery.json), commit 82aafe484de996017544ddb9648a12df945354ae.
- `node sims/lp2_conjugated_cumulative_regular_capacity_sft.cjs` — [code](../sims/lp2_conjugated_cumulative_regular_capacity_sft.cjs), [raw](lp2-conjugated-cumulative-regular-capacity.json), commit 0a705edb9de484e17d803d91f6269dc9c6c97e8f.
- Inputs: canonical LP2 corpus, pinned native Emerson and Gibran files; exact inputs and fixed seed are in the scripts.
