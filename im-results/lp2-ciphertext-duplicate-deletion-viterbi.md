# Ciphertext duplicate deletion: exact native-F periodic-key receiver

**Decision (26 November 2026): source-selector gate negative.** Post-encryption duplicate deletion remains a statistically motivated channel model, not a Cicada-selected operation. The source audit below found no inspected original LP2 cue or authenticated 2012–2017 Cicada instruction that fixes the deletion trigger, donor/key, clock/reset, or output serialization. The p57 “shed our own circumferences” wording has a stronger source-attested semantic referent in solved LP1 (the self/ego); the documented 2013 “skip” operations are key-pointer or byte-offset operations, not deletion of repeated ciphertext. Issue [#2906](https://github.com/FlareZ123/liber-primus/issues/2906) is closed. Do not extend this branch without a new first-party selector. The experiments below remain valid as algorithmic controls and conditional negatives: the fixed WELCOME/KOAN and authentic p56 prime-clock receivers produce nonprose original outputs, and the exact donor-prefix gate rejects all 532,721 tested contiguous 12,956-rune windows for q8/q13 across the three pinned donor texts. No authentic key or unknown plaintext was recovered.

## Deterministic dot-synchronized deletion: exact ambiguity despite known input lengths (#3187, 27 November, Agent8)

**Decision:** reject the specific periodic duplicate-deletion sender as a lossless GP29 inverse. The physical marks do not remove its ambiguity. This is separate from the stochastic deletion fit below, the Round48 stationary output-law equivalence, and deterministic retries that consume one plaintext per emitted rune.

### General synchronization prerequisite

For a fixed ordered marker skeleton, let (D_n) be all finite GP29 tapes of total rune length at most (n), with that marker skeleton interleaved (same admissible marker positions and alphabet for input and output; empty intervals may be allowed or disallowed consistently). Suppose a sender maps this domain to itself, never increases total rune length, and the decoder knows its fixed key, initial states and reset rule. If it is injective, the restriction to each finite (D_n) is an injection into itself, hence a bijection. By induction on length, no tape can map to a shorter tape: every shorter output is already occupied by its own length class. This rules out genuinely shortening, universally reversible data deletion on this unrestricted domain, regardless of finite-state sophistication. The same reasoning holds interval by interval if each interval is independently nonexpanding. It does **not** exclude restricted redundant input languages, separately known input lengths, variable punctuation encoding additional information, expanding pre-encodings, or silent *control* events determined from the key and observed data. Deleting reconstructible control events is not loss of plaintext runes. The theorem is conditional on the same domain/codomain, not a language-specific claim.

### Fixed source-conditioned sender and exact inverse

The physical p0 large 13-dot mark is after rune13, and the next large mark is after rune729. The source's 31 large marks on p0–55 include 28 thirteen-dot and three ten-dot glyphs. For one deliberately simple exploratory interpretation, a mark resets an input-rune clock to zero, and its dot count fixes period (qin{10,13}) until the next large mark. The initial heading uses q13. Keep all other marks as copied events (no update); keep the duplicate-offset empty intervals. At input position (j=1,2,...), delete the rune iff (jmod q=0) and its value equals the last emitted rune; otherwise emit it. The first rune cannot be deleted. Reset the remembered emitted rune at the large mark. This preserves printed event order; no independently authored source instruction selects this particular deletion rule or treats dot count as the clock. No key search, language scoring, or tuned phase is involved.

Given observed interval (y) of length (m), let (A(i,d)) count distinct input prefixes that emit the first (i) observed runes and delete (d) runes. Start at (A(0,0)=1). Next input position is (i+d+1); when gated and (i>0), the only possible deletion value is (y_{i-1}), and add (A(i,d)) to (A(i,d+1)). The emission of (y_i) adds to (A(i+1,d)) unless the same gate would delete it. All paths have distinct input strings because forward execution is deterministic. Count trailing deletions, too. At least (q-1) emissions separate successive deletions, so the finite upper bound (lfloor m/(q-1)floor+1) suffices. BigInt counts are exact. Brute-force comparison over all binary input strings of length 0–9 at q2/3/4 checks 3,069 inputs and 3,876 output/count cells with zero mismatches.

### Original-cipher result

Use canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` and large-mark event blob `96409ec38f8fbbb19f8e47aaf48ff2bf1788a99e` (physical mark inventory and p0 override already source-adjudicated). All 12,956 runes included; p50 has no runes. With **the entire pre-deletion interval length disclosed** and thus the final clock phase also known, original opening body ([13,729)) has 15 possible length-717 inputs (one deletion, q13, final phase2). For a concrete collision, start from that exact 716-rune ciphertext and duplicate the previous emitted rune at input position 13 or 26 (one-based). These are distinct 717-rune inputs: the first inserts GP index18 and the second GP index10. Both replay the entire identical original 716-rune tape, with exactly one deletion and phase2. Copied punctuation can be placed after the inserted duplicate and before the next emitted rune; deletion erases the difference. A length-preserving pre-encryption permutation simply maps these two distinct latent inputs back to two distinct candidate plaintexts.

Only four intervals require positive deletions at their minimum feasible input length:

| Global rune interval | q | Min deletions | Exact minimum-length histories |
| --- | ---: | ---: | ---: |
| [13,729) | 13 | 1 | 15 |
| [1874,3603) | 13 | 1 | 11 |
| [3623,5506) | 13 | 2 | 3186 |
| [8805,9358) | 10 | 1 | 13 |

All other intervals have one zero-deletion path at minimum. Across all intervals the minimum is five deleted runes, and the exact Cartesian product is **6,833,970 distinct length-12,961 inputs** with the same per-interval lengths and phases. This would require at least 23 independently supplied binary bits for worst-case identification of these particular histories. Allowing arbitrary legal interval lengths gives a 317-decimal-digit total number of paths. No authentic input length, state channel, or key is supplied by the source. This is an actual original-input ambiguity of the specified rule, not a statistical inference of hidden events or a bound on all LP2 ciphers.

Reproducer: [synchronized periodic deletion SFT](../sims/lp2_synchronized_periodic_deletion_gate_sft.cjs), commit `7ddc637f968a0a49edfddf38ac17804914ef36d2`. Numerical core and exhaustive small control ran in connected V8; standalone Node filesystem wrapper not independently executed. Since the all-input and original-input uniqueness gates fail, the issue's conditional blind-key/held-language stage is not justified. Next decision: require a independently sourced redundancy code or explicit recoverable side-channel before returning to genuinely shortening data deletion. A deterministic sender that omits only known control symbols belongs to the length-preserving clock family and needs its own original inverse. No new plaintext or key.

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


## Nonperiodic clock selected by the authentic p56 solve

The authentic prime-minus-one clock provides a nonperiodic candidate independent of the fitted q8/q13 cycles. Use additive shifts (prime[j]−1) mod29 with literal plaintext F transparent; start at prime 2. Confirm authentic p56 encryption 85/85 runes, 84 consumed primes. Apply the same duplicate-deletion Viterbi with absolute prime index rather than periodic phase, fixed start zero, deletion probability .81, and prefix index cap j≤i+ceil(.25n) where i is the emitted count and n the total observed length. This is a bound on excess consumed primes, not on total deletion count, because hidden F may be transparent. The negative-cost closure over hidden repeats is exact within these bounds. No initial-prime search.

On the genuine p56 ciphertext with deletion probability zero, the LP1-trained trigram decoder's best path has edit distance 5/85 from known plaintext (ambiguity at zeros, not exact known-text decoding). The authentic known plaintext itself re-encrypts exactly. Four independently planted held-out native plaintexts have deletion-channel edit counts 5/319, 2/89, 2/85, 0/95. Inferred deleted counts 5,4,3,1 versus true 5,5,2,1. Genuine known-text controls calibrate the receiver, not the hypothesis that LP2 uses deletion.

| Original tape, reset at prime 2 | Observed runes | Hidden inferred | LM nats/rune |
|---|---:|---:|---:|
|p0 black+p1–2|716|104|−3.823453|
|p54–55|308|48|−3.809570|

Both decoded paths re-encrypt and collapse exactly to source ciphertext, but are nonprose, substantially below planted LM scores −2.50 to −2.17. The fixed prime-start receiver does not produce a solution. No claim about arbitrary prime offsets, longer hidden-length budgets, or a different initial state. This directly checks a historically demonstrated nonperiodic key rather than sweeping further speculative periodic keys. No new evidence for this deletion channel.

Reproducer: `node sims/lp2_duplicate_deletion_primeclock_sft.cjs`. Core run in connected V8; standalone wrapper unrun.


## Exact unknown-prime-origin receiver with no deletion-length restriction (Agent14, 2026-11-26)

Extend the preceding fixed-origin test, not its periodic-key branch. The source-authenticated prime-minus-one clock and plaintext-F hold remain unchanged. The candidate deletion mechanism is still hypothetical; the independently chosen origin interval is zero-based 0..3301 inclusive. Optimize over every initial origin and all hidden paths, with no assumed word boundaries and no deletion-count or relative prime-offset cap.

The C++ solver merges all candidate starting origins into an exact Viterbi dynamic program keyed by absolute next-prime index and two preceding plaintext runes. Between retained symbols, consuming deletion edges advance that index; transparent F deletion is permitted only when the last retained ciphertext is F. At most two consecutive deleted F symbols need be considered: after two the trigram state is (F,F), and additional repetitions are negative-cost self-loops. The maximum over hidden histories can therefore be obtained by a single ascending index sweep per retained symbol. An origin label is retained for the winning path, then a second single-origin run recovers the plaintext and entire deletion mask. Every recovered path is re-encrypted and reduced to the unchanged original ciphertext.

The initial finite index cap is used only to obtain an incumbent S. For N observed runes, R observed repeats, h deleted runes, maximum log LM transition M<0, and deletion probability d, every path's joint score is at most (N+h)M+h log(d)+R log(1-d). Consequently any path able to equal or beat S has h ≤ (S−NM−R log(1-d))/(M+log(d)). The ceiling of that bound gives a provably sufficient absolute next-prime limit 3301+N+H. Recompute the joint maximum over this larger domain. This removes the arbitrary 25% excess-length cap. Also run the strictly more permissive **free-channel** relaxation replacing both log(d) and log(1-d) by zero: it bounds the maximum joint score for every d in (0,1), and indeed any per-repeat deletion probability schedule. It is not a normalized stochastic model or an exact maximum marginal likelihood.

The language model is the independent weighted TextBlob rune trigram from the [opening title exhaustive-model builder](../sims/lp2_p0_title_exhaustive_model.py), with float32 log-table SHA256 c89f79b93c817dc9d73450cb61f64b5630c3fce2c37b7bad500b30ab38a448ce. Its largest transition is −0.0162083. Six distinct prime origins and independently seeded deletion schedules on the same held-out 716-rune literary passage from Gibran establish recovery capability; five origins exact, one shifted by one prime index. They are six independent cipher plants, not six independent literary donors.

| True origin | Recovered origin | Observed runes | True/inferred deletions | Rune edit distance | Joint nats/observed |
|---:|---:|---:|---:|---:|---:|
|0|0|702|14/14|5|−2.347869|
|133|134|700|16/15|7|−2.357202|
|174|174|700|16/18|5|−2.357902|
|330|330|708|8/7|5|−2.329709|
|1033|1033|702|14/14|4|−2.353741|
|3301|3301|698|18/18|4|−2.361089|

| Original scope | Channel | Best origin/end prime index | Hidden | Joint nats/observed | Score/decoded rune | Proven sufficient index cap |
|---|---|---:|---:|---:|---:|---:|
|p0 black + p1–2 (716)|d=.81|1634/2483|141|−4.659758|−3.893100|18639|
|p0 black + p1–2 (716)|free upper bound|1634/2483|143|−4.608639|−3.841427|206888|
|p54–55 (308)|d=.81|1604/1953|42|−4.674007|−4.113126|9909|
|p54–55 (308)|free upper bound|2093/2468|72|−4.616787|−3.742028|91033|

The opening's exact maximum begins CRISSALPNGDINHARWYTHNGNEAETELLEEMENGNOWETHNGEANTHLEOYNGLEBNOECAEFIMPOIREAF; the best terminal .81 path begins USOEATXEHUERNGDEAOTEADNGTIBNGSLIATOUTEIOECDRNNGUSOFTEODPLIASPPXXDOTJEAEDUB. These are nonprose; exact forward replay is not a proof of decipherment. The unusually weak optimum persists even when deletion is entirely unpenalized. No original key or plaintext recovered. This is a calibrated exact language-model negative covering 3302 possible initial prime indices, arbitrary run deletion and no boundaries, not a mathematical exclusion of every possible plaintext or origins beyond the stated interval. No new source selects the deletion law.

Reproduction: compile [sims/lp2_prime_deletion_unknown_origin.cpp](../sims/lp2_prime_deletion_unknown_origin.cpp) with C++17/O3. Run the linked Python model builder to emit model.bin, original.txt (p0 black+p1–2), plant_plain.txt; construct terminal.txt by comma-joining canonical pages 54 and 55. Run the executable with model.bin, input text, original, 3301, .81 (or -1 for free channel). For plants use model.bin, plant_plain.txt, plant, 3301, .81, seed, plantOrigin, using seed=plantOrigin for the six rows. Actual locally compiled C++ tests completed, including the uncapped optima and exact replay; the repository model builder was not separately run against a checked-out repository, but the locally generated model was pinned by its binary hash and normalized source word rows.


## Source-selection audit (Agent19, 26 November 2026)

The model requires four independently selected items: (1) a post-encryption rule that deletes an emitted symbol when it repeats the last retained ciphertext rune, (2) the exact plaintext donor or key, (3) the key-consumption clock and reset, and (4) the GP29/output serialization. The observed 86 adjacent repeats and the fitted 0.81 deletion probability do not select any of these; 0.81 is a channel-model parameter, not a first-party instruction.

- **LP2 wording:** solved p57 says “WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN”. The source-linked LP1 passages on pp03, 10 and 14 explicitly connect circumference with the self/“I” and the end of self. This is a source-supported semantic reading; it does not name duplicate symbols, a deletion trigger, a donor, or a cipher clock. See [the p57 circumference source decision](../workplace/lp2-p57-circumference-source-semantic-decision.md).
- **Original p55/p57 images:** the p55 tree/moth and bilateral floral ornament, and the p57 tree with its red title/terminal dot marks, provide no visibly numbered deletion sites, unique direction, or state register that would determine the four required fields. This is an observation about these original pages, not a claim that all possible hidden carriers are impossible.
- **Historical “skip” precedent:** the preserved 2013 CicadaOS materials do document exact byte operands and offsets for XOR operations (including _560.00 and 560.17). Those are byte-addressed key-source operations; they do not delete a repeated ciphertext output. The source-specific transfer tests and their limits are in [the 2013 authored offset/skip/XOR audit](lp2-2013-cicadaos-authored-offset-skip-and-xor.md). The 2013 prime-echo shell emits a prime sequence but supplies no duplicate-deletion rule.
- **Other signed-era language:** the 2012 “displayed once” statement concerns one-time message delivery; the 2013 “No more testing” / “Same rules apply” message concerns challenge administration; the 2014 Stage10 form specifies magic-square submissions and upload paths; the 2016 signed “words / meaning / numbers / direction” message does not define a deletion channel; and the 2017 signed warning says to verify the PGP signature. None supplies a duplicate trigger, donor/key, clock/reset, or output alphabet.
- **Strongest rival and scope:** an unpreserved private instruction or a different hidden carrier could still exist. This audit therefore rejects the current proposed duplicate-deletion route as source-selected, not every variable-length channel or every possible LP2 cipher. Reopen only on a new authenticated instruction or artifact that fixes the missing receiver fields before original-output scoring.
