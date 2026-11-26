# Ciphertext duplicate deletion: exact native-F periodic-key receiver

**Decision:** length-changing soft duplicate deletion is a distinct explanation for the adjacent-doublet deficit, not stochastic V-BACK (which preserves length). An exact maximum-path receiver recovers the starting phase on all eight known-key native plants, with 26 total Levenshtein edits in 1,176 planted plaintext runes. Neither historical fixed key recovers original LP2 prose under this receiver. This does not exclude unknown keys, alternative deletion laws or other representations.

## Sender and inverse

For fixed cyclic offsets K and phase s, plaintext F emits 0 without advancing; otherwise emit x=(p+K[s]) mod29 and advance s. After encryption, if x equals the last retained ciphertext rune, delete x with probability .81; otherwise retain it. A retained repeat has probability .19. Deleted ciphertext still consumes the ordinary native key clock. This exploratory model is motivated by observed repeat suppression; no historical deletion instruction is established. It differs from backward/forward skip, redraw and inserted-null models. Printed word lengths need not equal plaintext lengths.

For each observed rune, maximize joint log probability over (key phase, last two plaintext runes). Before the next observed rune, close all possible hidden deletion edges emitting the previous retained ciphertext. Negative log probabilities make deletion edges strictly costly; max-heap relaxation terminates on the finite state space and finds the optimum without a deletion-count cap or beam (floating-point tolerance 1e-12). Then traverse all native-F preimages of the next observed rune, applying log(.19) for a retained repeat. Initial phase is uniform over the complete key cycle. No trailing deletions are modeled after the last retained rune; control prefixes end at the last retained rune. Exact replay includes the chosen deletion path and verifies every original ciphertext rune.

Train interpolated native GP trigram probabilities on the first five records in resources/external/relikd-solved-gp29-native-v1.json, unigram add-.5 and backoff pseudocount 10. Freeze historical WELCOME offsets [23,10,1,10,9,10,16,26] and KOAN offsets [0,10,4,0,1,19,0,18,4,18,9,0,18] from the [validated native key report](lp2-native-key-postshuffle-phase-graph.md). They are candidate LP2 keys, not authenticated LP2 operands.

## Planted and original results

| Key | Donor | Plaintext runes | Deleted | Inferred deletions | Edit distance | Phase recovered |
|---|---|---:|---:|---:|---:|---|
| WELCOME | jpg107-167 |319|15|15|8|yes|
| WELCOME | jpg229 |89|4|3|1|yes|
| WELCOME | p56 |85|0|1|1|yes|
| WELCOME | p57 |95|7|7|0|yes|
| KOAN | jpg107-167 |319|9|10|5|yes|
| KOAN | jpg229 |89|7|6|5|yes|
| KOAN | p56 |85|1|1|2|yes|
| KOAN | p57 |95|4|3|4|yes|

| Key | Original scope | Retained runes | Inferred deletions | Joint nats/retained rune | LM nats/plaintext rune |
|---|---|---:|---:|---:|---:|
| WELCOME | opening body p0–2 |716|70|-4.629842|-4.187652|
| WELCOME | terminal p54–55 |308|26|-4.527928|-4.137909|
| WELCOME | full |12956|1406|-4.570327|-4.092187|
| KOAN | opening body p0–2 |716|87|-4.421130|-3.907831|
| KOAN | terminal p54–55 |308|42|-4.397115|-3.822611|
| KOAN | full |12956|1556|-4.451975|-3.942015|

Controls have genuine held-out native language but artificial ciphertext and known keys. They are not sealed unknown-key controls. All eight phases recovered; one plant exactly recovered. Deletion locations and plaintext are not always identifiable. Full original candidates require ~10.9% and 12.0% additional hidden runes relative to observed length, compared with much smaller planted rates. Their decoded paths remain nonprose. Opening and terminal permit independent starting phases and do not assume printed boundaries are true plaintext boundaries; the full-tape run assumes one continuous key clock across all unknown chapters. Full WELCOME candidate starts `CWHDAEOURMEACBHCHHUCSLUGGSEAUEANYLLUCNGTHOTHDAWEAAAEUNGSJDWHBEOULSTHINGSJIBDPEOHEF`; full KOAN starts `SWEAOBSNLSHEHBCUNGGWFWRDNPNHOWTIAAYEDUNGEONSTHIUEBLDARBLNTHWTHDTHYAEPCRENIAMIGFX`. These are not recovered phrases.

This is a fixed-key negative, not an all-key theorem. The next useful question is whether an unknown-key deletion-aware receiver can recover blind keys or whether an independent historical source selects another key. No new authenticated key, plaintext or destination.

Reproducer: `node sims/lp2_ciphertext_duplicate_deletion_viterbi_sft.cjs`. Core actually executed in connected V8 with exact repository inputs; standalone Node wrapper not separately run.


## Blind key recovery using deletion-invariant transitions

The exact invariant is that dropping any number of repeats of the last retained ciphertext leaves **every ordered transition between distinct symbols** unchanged, including multiplicity. If both ciphertext endpoints are nonzero, neither is a held plaintext F; their adjacent pre-filter positions consume consecutive key phases. Thus on the 756 ordered nonzero unequal cells, approximate the ciphertext pair histogram by a cyclic mixture of translated native plaintext pair distributions. No deletion locations, key phase, or word boundaries enter key fitting. The equality of the masked pre/post deletion histograms is explicitly checked on every plant.

Train a non-F native pair matrix T on the first 60% (by GP rune count) of the pinned Gibran, Emerson and Shakespeare donor texts (326,540 adjacent non-F pairs). For each candidate ordered key pair (u,v), kernel H_uv(a,b)=T(a−u,b−v) mod29, restricted to a,b≠0 and a≠b. For q-cycle K, M=Σ H_{K_j,K_(j+1)}. Given normalized observed masked histogram Y, maximize (Y·M)^2/(M·M), the least-squares fit with a free positive scale. Uniform phase balance and phase-independent native pair frequencies are modeling approximations. Precompute the 841×841 Gram matrix; coordinate ascent changes two cycle edges per move, testing all 29 vertex values. Use 64 deterministic starts, at most 30 sweeps, seed 0x7d3301; this is a heuristic key search, not exhaustive over all 29^q keys. Cyclic rotations are equivalent. No true key enters the fit.

Four 12,956-rune donor windows (Emerson/Shakespeare, both q8/q13) from outside training, independent random keys and .81 duplicate deletion: **4/4 exact keys up to rotation**. A second experiment fits only first 9,640 retained runes of four new disjoint 13,400-rune native windows with fresh keys and decodes the remainder by the frozen deletion-aware receiver. Three of four keys recovered exactly; the failed q13 control exposes directed-edge-multiset ambiguity (the two cycles have the same directed multiset when repeated vertices allow alternate Euler tours). The successful held-out edits are 113/3467, 91/3488 and 76/3496; the fourth incurs 1760/3427. The receiver grants independent start phase on the held-out block; it does not freeze its entire latent deletion path from the prefix.

| Scope | q | Fit residual | Frozen held-out pair log likelihood gain vs uniform (nats/pair) | Held-out best LM nats/rune |
|---|---:|---:|---:|---:|
| Emerson control |8|.00014405|+.27672|-2.79806|
| Shakespeare control |8|.00015540|+.15153|-2.84492|
| Emerson control |13|.00013196|+.15655|-2.80579|
| Shakespeare control (wrong cycle) |13|.00017137|+.16616|-3.55385|
| Original best fit |8|.00039646|−.17578|-3.97410|
| Original best fit |13|.00027139|−.10264|-3.92484|

Original fit is exactly the first 9,640 runes (p0–39), followed by independent scoring and deletion-aware decoding of the 3,316-rune p40–55 continuation. The best q8 cycle is [18,7,4,8,1,12,0,11]; q13 is [0,28,25,19,22,4,15,26,16,23,12,7,3]. Both are **fitted hypotheses, not authentic keys**. All ten highest prefix-ranked cycles at each q have negative held-out likelihood gain over uniform (q8 −.22412 to −.17164, q13 −.12921 to −.09984) and nonprose exact-replay decodes. Best held-out LM across these is −3.91368 for q8 and −3.87908 for q13. No original candidate resembles the successful controls. Original prefix residual is substantially larger than matched plants. This is an independently calibrated constructive attack, but the negative is conditional on the shared periodic-key, native-pair-mixture and deletion model, and on heuristic candidate retrieval. It is not an all-key impossibility proof.

Important next step if this receiver becomes source-supported: enumerate the finite Euler-cycle ambiguity of a recovered directed key-edge multiset before language scoring. It would repair the specific wrong-cycle control without changing the pair fit. It does not rescue the original's negative held-out pair likelihood because equivalent Euler cycles predict exactly the same pair distribution.

Reproducer: `node sims/lp2_duplicate_deletion_pair_cycle_key_recovery_sft.cjs`. Actual V8 core executed on pinned repo inputs, including the original and all eight plants. Standalone Node wrapper not separately run. The decoder was factored into an exported reusable builder without changing its scoring or transition law.


### Exact Euler ordering resolves the fourth blind split plant

Enumerate every distinct directed Euler cycle of each recovered key-edge multiset, fixing the least vertex as a start and quotienting cyclic rotations. Select order by the deletion-aware Viterbi score on the **same prefix used for key fitting**, never the withheld block. This resolves the pair-statistic ambiguity without changing its predictive histogram. The four blind split controls now yield 4/4 exact key cycles; Euler counts 1, 1, 1, 2. Held-out edit counts 113/3467, 91/3488, 76/3496, 105/3427. The earlier wrong q13 cycle is retained as the initial pair-only witness, not silently reclassified.

Original p0–39 fit/p40–55 holdout, ten highest prefix pair-ranked cycles per q: q8 10 Euler candidates including repeated multiset classes, best held-out LM -3.913683, best held-out pair gain -0.171636; q13 10 Euler candidates including repeated multiset classes, best held-out LM -3.879075, best held-out pair gain -0.099836. All prefix-selected Euler orders still decode to nonprose. These are calibrated algorithmic results, not a globally exhaustive key exclusion. No further unselected q8/q13 cycle search is justified.

The updated key-recovery SFT now performs this exact Euler completion automatically; the original pair-only ordering is still output alongside the resolved key. Core executed in connected V8, standalone Node wrapper unrun.


## Exact all-key gate for arbitrary run-preserving edits and contiguous donor prefixes

The preceding key recovery is heuristic. A distinct exact gate uses the same invariant without a language model, phase-mixing approximation, coin probability or deletion-count limit. Let T_j(a,b) count adjacent **non-F plaintext** pairs (a,b) at consuming phase j in a candidate prefix. Under native additive F holds, its contribution to the ciphertext cell (a+K_j,b+K_(j+1)) cannot exceed that cell's observed count when both endpoints are nonzero and unequal. Deletion or duplication confined to an already existing run preserves those off-diagonal counts exactly. Every other plaintext contribution is nonnegative. Thus each phase admits only key-pair edges satisfying all 784 individual count inequalities. One directed closed walk through the q phase-specific edge graphs is necessary for any shared cyclic key. It is sufficient for the *relaxed separate cell constraints*, not for actual complete plaintext compatibility. Rotating the initial phase is absorbed into the unrestricted cyclic key.

The original p0–55 tape contains 12,956 runes and 11,961 nonzero unequal ordered transitions; the largest masked cell count is 30. For a deletion-only sender, the unknown true plaintext has length at least 12,956. Testing just the first 12,956 runes of any candidate donor is sound: extending it can only add off-diagonal transitions. **Every contiguous 12,956-rune window** of the three pinned native-converted literary donors is therefore a candidate prefix, without needing to guess the number of hidden symbols. For duplication-only or mixed run-preserving edits, the prefix gate applies only if the underlying plaintext is at least this long.

Efficient exhaustive sliding implementation: assign each adjacent non-F pair its absolute consuming phase modulo q; starting the window later rotates all phase labels uniformly. Precompute for each plaintext pair and threshold the list of key-pair edges whose mapped observed count equals that threshold. Maintain exact violation counters for each edge as a sliding pair enters/leaves. A phase with zero admissible edges immediately rejects the window. Otherwise compute cyclic reachability across the q layers using 29-bit successor masks. No ranking, random subsampling or beam enters the original gate.

| Period | Donor | Windows | Every phase has an edge | Closed walk survives |
|---:|---|---:|---:|---:|
|8|Gibran|34,674|0|0|
|8|Emerson|293,896|0|0|
|8|Shakespeare|204,151|0|0|
|13|Gibran|34,674|0|0|
|13|Emerson|293,896|0|0|
|13|Shakespeare|204,151|5,818|0|

All 532,721 distinct windows per period fail (1,065,442 period/window tests). In q8 every phase is empty in every window; in q13 the 5,818 locally surviving Shakespeare windows all fail the closed-walk condition. Six independent 13,400-rune native plants (q8/q13 × three donors, random keys, .81 duplicate deletion) retain the true key edges and a closed walk both on the entire plaintext and on the prefix equal to observed ciphertext length. Masked pre/post-deletion transition histograms are exactly equal for each plant. No source-selected deletion operation or original key emerges.

This is a finite exact all-key exclusion for **contiguous plaintext prefixes from these three complete native-converted donor tapes**, even granting arbitrarily many deleted repeats; it does not exclude arbitrary prose with other phase-specific pair counts, chapter-private keys, nonlinear state, arbitrary transpositions, shorter underlying tapes with inserted runes, or other edits. It materially narrows the length-changing loophole for direct historical donor text and native q8/q13 keys, rather than merely ranking more candidate keys.

Reproducer: `node sims/lp2_duplicate_deletion_allkey_pairprefix_sft.cjs`. Core executed in connected V8 against exact repository inputs, standalone Node wrapper not separately run.
