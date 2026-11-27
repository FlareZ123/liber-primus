# Recovery and original constraints of private insertion charts

Agent7, 27 November 2026. **Long aligned controls recover effective keys; supplied-destination ciphertext-only controls recover entire held plaintexts; arbitrary blind destination search fails calibration. Short disconnected fragments fail the exact unknown-boundary-state gate even with oracle-known charts. The three GP-prime residue destination family is conditionally excluded on original LP2. No original LP2 plaintext.** Extends the [secret home-rank analysis](lp2-secret-home-rank-absorption.md) to arbitrary nonbijective R. The LP2 original finite aligned Gibran register is already excluded by the exact repeat anchor in that report. The residue-family gate below is an independent, explicitly conditional original test.

## Sender and attack

A private permutation S assigns plaintext labels to ranks; A is a private initial list; R is an arbitrary private map from labels to ranks, with repetitions allowed. Emit c=A[S(p)], remove c, insert at R(p) or R(c). In F-hold mode p=0 emits 0 without moving. Supplied known plaintext positions determine the consuming sequence. No initial chart, destination, or list given to the solver.

For consecutive occurrences j,i of the same emitted glyph, its rank immediately after j is R(x_j), while immediately before i it is S(p_i). Each intervening move changes that rank by at most one. Thus |S(p_i)−R(x_j)|≤i−j−1. Adjacent repetitions give equality; adjacent nonrepeats give inequality. For gap2, with a=S(p_{j+1}), b=R(x_{j+1}), r=R(x_j), the exact rank equation is:
- remove: y=r−[a<r], with a≠r;
- insert: S(p_i)=y+[b≤y].

Merge equality variables; use 29-bit domains, distance-support relations, gap2 support propagation, and matching-based all-different filtering on S. The latter uses a perfect matching and alternating-cycle reachability to delete edges absent from every perfect matching. Propagate position domains forward and backward along the known glyphs, allowing every supported removal and insertion rank and closing singleton all-different consequences. Correlations between domains are conservatively relaxed. Reflection gauge S(F)<S(U) retains one of each reflected key pair.

Branch MRV/degree over used rank variables, with explicit node cap. At complete effective charts, replay 29 initially anonymous slot IDs, binding each selected slot to its observed glyph; reject inconsistent or noninjective binding. Complete unused chart entries and anonymous slots without observing holdout. Replay the whole fit exactly. The first fit-consistent key is frozen; neither held plaintext nor held ciphertext influences search.

Held ciphertext-only inverse: ordinary case deterministic. For F mode branch at literal 0, allow ordinary move only if inverse label is nonzero. Merge identical alphabet+last-two-plaintext states and score with fixed smoothed GP trigram trained on Shakespeare and Emerson, excluding Gibran. Exact MAP until a 200,000-state cap; capped case retries with a declared 4096-state beam. Second independent F controls directly use the beam (no claim of exact MAP if clipped). Verify reencryption of each decoded held tape. Forward held ciphertext prediction with true held plaintext is a separate test of the effective key, never used for selection.

## Controls

Two disjoint 12,956-rune Gibran intervals at starts2001 and18001; four independently randomized private keys per interval (S/A permutations, R arbitrary). Fit8,000, hold4,956 for each. First batch node cap2000, second500. Every key is fit-consistent, every held ciphertext prediction exact. Key match counts compare to planted key after reflection, not an assertion of uniqueness.

| Donor start | Feedback | F hold | Nodes | Held ciphertext | Held plaintext | Inverse |
|---:|---|---|---:|---:|---:|---|
| 2001 | P | no | 20 | 4956/4956 | 4956/4956 | deterministic |
| 2001 | P | yes | 13 | 4956/4956 | 4952/4956 | capped exact, beam clipped |
| 2001 | C | no | 276 | 4956/4956 | 4956/4956 | deterministic |
| 2001 | C | yes | 90 | 4956/4956 | 4949/4956 | exact MAP, 64 max states |
| 18001 | P | no | 11 | 4956/4956 | 4956/4956 | deterministic |
| 18001 | P | yes | 18 | 4956/4956 | 4956/4956 | beam clipped |
| 18001 | C | no | 56 | 4956/4956 | 4956/4956 | deterministic |
| 18001 | C | yes | 29 | 4956/4956 | 4954/4956 | beam not clipped |

Aggregate 39,648/39,648 held ciphertext predictions, 39,635/39,648 held plaintext. All eight decoded continuations exactly replay. All ordinary continuations exact; thirteen errors in F mode. In the first C-ordinary control the recovered key agrees with only3/29 S,3/29 R,1/29 A coordinates (reflection-normalized) despite exact fit and holdout. This demonstrates effective-key nonuniqueness on observed data; no full private-key uniqueness claim. Other controls recover most or all planted chart coordinates; unused labels can remain unidentifiable. Even the exact C-hold MAP has many legal histories and seven errors, so replay and optimal language score alone do not prove intended plaintext.

Initial prototype with 200 nodes recovered three of four keys; improved matching propagation, completion matching and position singleton closure plus2000 cap recover all four. Combined second-control execution timed out without committing results; rerun as four separate bounded batches with distinct seeds and direct F beam. No fabricated timeout result. All completed cores executed in connected V8; standalone Node wrapper not separately run. No CI.

## Reproduction and decision

[SFT](../sims/lp2_private_rank_map_recovery_sft.cjs): run from repo root with optional argument 0 (first four, default) or 1/2/3/4 (independent P ordinary/P hold/C ordinary/C hold). [First raw](lp2-private-rank-map-recovery-output.json) · [1](lp2-private-rank-map-recovery-batch1.json) · [2](lp2-private-rank-map-recovery-batch2.json) · [3](lp2-private-rank-map-recovery-batch3.json) · [4](lp2-private-rank-map-recovery-batch4.json).

A supplied 8,000-rune known fit is a substantial prerequisite, absent for unknown LP2. The aligned experiment does not solve a ciphertext-only secret-chart problem; the supplied-destination experiments below remove the known-plaintext requirement but not the destination-map prerequisite. The earlier blind beam failed; the arbitrary-map aligned-donor gate remains negative. Retire this unselected adaptive receiver as a current LP2 route, but retain the rank-distance solver for an independently authenticated sufficiently informative known-plaintext alignment or source-selected insertion rule. The short-fragment test below identifies a specific state deficit.


## Short disconnected aligned fragments: exact state-identifiability gate (#3183, Agent1)

**Decision:** independently unknown boundary lists make four source-sized cribs insufficient for a held inverse even if an oracle supplies the full true shared rank and destination charts. This does not rule out a continuous globally constrained state receiver or a source-defined known boundary list. No original crib is established.

### Joint all-different formulation and exact conditional solver

Let S be an all-different 29-element rank map, R an arbitrary rank destination map, and fragment j have unknown initial permutation A_j. Start each fragment with anonymous slot IDs 0..28 and move those IDs, not glyphs. For observed aligned P_t,C_t, select the slot at rank S(P_t); bind that initial slot ID to C_t, and move it to R(P_t) or R(C_t) according to feedback role. Repeated binds must agree and different slots must not bind the same glyph. These are exact constraints on the shared S,R, with one all-different slot/glyph completion per fragment. The fragment solver checks any proposed chart, returns the partial list and end-state slot order, and represents all completions without enumerating permutations. It is not an exhaustive unknown-chart optimizer. All rune events consume in this test.

For a feasible chart and d distinct observed C symbols, there are exactly (29-d)! possible initial lists. The unbound slot IDs can be assigned the unused glyph labels arbitrarily; this is necessary and sufficient. No amount of coupling the *shared chart* across fragments removes the independently unknown starting-list permutations. If d<=27 and an unseen ciphertext glyph appears in the held continuation, at its first occurrence each of the 29-d possible positions of that glyph yields a distinct plaintext rune via S^{-1}; all completions agree on the preceding held prefix. All such branches admit exact replay. Thus an oracle chart does not yield a unique unrestricted plaintext continuation in this state model. Independent full list identification requires at least 28 distinct observed glyphs in that fragment; that is necessary and sufficient conditional on the chart. A known source-defined boundary list would also remove this specific factorial deficit.

Let p be the number of distinct observed plaintext labels across the cribs, and x the number of distinct destination labels (P or C depending on role). Even fixing all observed chart entries, permuting S among unseen plaintext labels and independently changing R on unseen destination labels produces at least (29-p)! * 29^(29-x) distinct parameter charts with identical fits, without using any held data. Some may be effectively equivalent on other limited data; this is a parameter lower bound, not a count of independent historical keys.

### Two disjoint native plants and held-state results

Use actual solved native p56 AN END (85 runes) and p57 PARABLE (95). For each, generate full continuous native tape under an independent private S permutation, arbitrary R, and A permutation, both P and C feedback roles. Use four short fragment lengths 8,5,4,3 from the first four original p0 printed groups; starts fixed at 0,20,40,60 in each donor, followed by 12 held runes each. During recovery, grant the true S,R but not the state at each fragment; do not link through gap ciphertext (unknown starts deliberately independent, as one of the issue's allowed branches). Literal fragment offsets are a calibration profile, not original proposed cribs.

| Native plant/role | Distinct P / destination labels across 20 anchors | Known held prefix lengths | Distinct P choices at first unseen held C | Wrong sliding alignments passing true-chart test |
|---|---|---|---|---:|
| p56 P | 14/14 | 0,2,0,0 | 21,25,25,26 | 173/320 |
| p56 C | 14/15 | 0,0,0,0 | 22,25,25,26 | 148/320 |
| p57 P | 10/10 | 0,1,0,0 | 21,25,26,26 | 107/360 |
| p57 C | 10/14 | 0,0,0,0 | 23,24,25,26 | 169/360 |

16/16 true fragments retained; 597/1360 wrong sliding native offsets also pass with the *true* chart (overlapping/repeated windows, not independent trials). Four alternative charts generated by changing unseen entries also retain all fragments. For each fragment the solver explicitly constructs cyclic completions of the unbound labels to realize every possible first-unseen plaintext symbol, verifying exact forward replay of all 12 held ciphertext symbols. In 14/16 cases the first held rune is ambiguous immediately. The state solutions are exact factorial sets, not heuristic counts; smallest is 21! for an 8-distinct-rune fragment. Even 20 aggregate anchors give only 10–14 distinct plaintext labels; the four lower bounds on parameter-chart counts are given by the formulas above and in the reproducer output.

Reproduce: [partial-state solver and native calibration](../sims/lp2_partial_rank_chart_state_gate.cjs), seed3183, actual core executed in connected V8. The standalone wrapper has not been run separately. Source inputs are the pinned LP2 corpus and the solved-native rune records already used above. See [Agent4 partial anchor handoff](../communications/broadcast/20261127_agent4_partial_anchor_phase_inverse.md) and [shared-cycle calibration](lp2-shared-gp29-cycle-action-calibration.md) for the distinct state-free cyclic-key attack; its successful transfer cannot identify an unknown adaptive list.

### Next research decision

Do not treat short provisional words as adequate adaptive-rank known plaintext. For this independently unknown-boundary model, acquire an independently evidenced initial list/reset (e.g. a literal source instruction naming initial order and reset point) or a substantially longer independently authenticated aligned span with at least 28 distinct ciphertext symbols, and sufficient label coverage to constrain S,R. No such unknown-page crib or boundary state is currently established. Linking the actual full ciphertext through gaps could add constraints, especially C-feedback where a move destination is known from C given R; this was not tested and cannot be excluded by the independent-fragment state bound. Similarly, a restricted language model or known boundary states could resolve some ambiguity; exact replay alone cannot certify which completion is intended. No unknown key/plaintext recovered.


## Ciphertext-only inverse conditional on an independently supplied destination map (Agent2)

For ordinary continuous C-feedback, supplying R makes the rank stream deterministic given A, independent of S. Fit the sorted rank-frequency likelihood under a Shakespeare GP model by greedy full initial-list transpositions (six starts, up to fifteen sweeps), then solve rank-to-GP substitution by sixteen seeded 10,000-swap anneals under a smoothed Shakespeare trigram model. No printed word boundaries or plaintext anchors enter recovery. Freeze both inferred charts before the held continuation.

Two distinct literary controls, Gibran and Emerson, each normalized [38000,44000), independently planted arbitrary S and A. Each of the 29 ciphertext labels is assigned independently to one of the eight ranks of least frequent donor plaintext labels (generation only; solver receives R, not donor frequencies or the donor). Fit 3000 runes, hold 3000, continuous state, ordinary consumption. Equal adjacent ciphertext pairs: 23 and 18 out of 5999; all 29 glyphs occur.

| Donor | Fit plaintext | Held plaintext | Full replay |
|---|---:|---:|---:|
| Gibran | 2957/3000 | 3000/3000 | 6000/6000 |
| Emerson | 2968/3000 | 3000/3000 | 6000/6000 |

Both held scores equal the actual native score. This is useful inverse capability, not unique initial-key identification. A source-authenticated destination map would now permit a real ciphertext-only recovery attempt even without a long crib. No such new map has been identified. The previous fixed public GP-prime-minus-one map already failed its original gate.

[SFT](../sims/lp2_private_rank_known_destination_blind_state_sft.cjs) · [raw](lp2-private-rank-known-destination-blind-state-output.json). Executed connected V8 core; standalone Node wrapper not separately run.

### Unknown map is the remaining obstacle

Separate hidden-map Gibran and Emerson controls, [30000,36000), split 3000/3000, 16 and 40 adjacent repeats. Fit a chart-invariant objective (half sorted-unigram log likelihood minus empirical rank bigram conditional entropy) by alternating coordinate destination moves and initial-list transpositions; follow with whole destination-group moves and exchanges. Neither held recovery improves with group moves. Blind held objective -4.912/-4.651 vs planted -3.850/-3.938. Even an oracle best rank-to-GP bijection fitted using the held truth gives only 628/3000 and 1220/3000 held matches (upper diagnostic, not recovered plaintext). Same-destination pair confusion TP/FP/FN is 24/29/24 and 12/10/33; destination coordinates correct up to reflection 6/29 and 3/29. Near-oracle starts with true initial list and three perturbed destination coordinates still yield only 2392/3000 and 2282/3000 oracle held matches (27/29 and 25/29 destination matches). Do not extrapolate to unknown LP2 maps or spend more compute on the untyped search. No original unconstrained blind fit was performed.

[SFT](../sims/lp2_private_rank_grouped_destination_search_sft.cjs) · [raw](lp2-private-rank-grouped-destination-search-output.json).

## Exact original gate: three GP-prime residue destination groups (Agent2)

Exploratory restricted C-feedback family: classify each ciphertext glyph by GP prime modulo four (prime 2, primes 1 mod 4, primes 3 mod 4), assign any destination rank to each of the three classes. No original instruction selecting this classification is established. Ordinary continuous consumption, arbitrary private initial list and arbitrary static rank-to-plaintext bijection. The sole plaintext restriction is that the 83 singleton printed groups are one-rune words A or I; actual solved native controls support this restriction, but it is not established for unknown LP2 (H-decoy remains possible).

At every event maintain a conservative 29-bit domain of ranks per glyph. If emitted glyph c is at rank j and inserted at d, any other glyph at rank r transforms to r-[r>j]+[r-[r>j]>=d]. Union the allowed transforms over the rank domain of c and apply sound singleton all-different closure. First pass independently intersects all singleton rank-pair support conditions. Second pass restricts the live emitted-glyph domain at each singleton to each surviving pair, propagating the constraint forward. Empty domains or absent pairs are exact contradictions despite relaxed correlations. Exhaustive reflection quotient covers all nonconstant destination triples; constant maps were already excluded by the stronger all-partition [fixed insertion gate](lp2-adaptive-fixed-insertion-partition-gate.md). All 12,956 original rune indices match the corrected transcription; 83 singleton groups.

Six independent native solved-corpus plants (2979 runes, 27 singletons each; different triples including a constant one) retain the true pair through forward and bidirectional propagation; 23,548 individual rank-transform mask checks pass. No claims of key identification from these controls.

| Stage | Count |
|---|---:|
| Nonconstant reflection representatives | 12,180 |
| Rejected by independent singleton pair intersections | 10,933 |
| Remaining maps | 1,247 |
| Remaining candidate rank pairs across maps | 5,300 |
| Pairs surviving propagated singleton constraints | 0 |

All 24,360 nonconstant triples and the 29 previously excluded constant maps are therefore ruled out under the stated continuous ordinary sender and singleton-word premise. No source reset, F hold, alternate partition, or H-decoy spacing claim follows. No recovered original plaintext. This is a finite original contradiction, not a generic rejection of private adaptive rank ciphers.

[SFT](../sims/lp2_prime_mod4_adaptive_destination_allinitial_sft.cjs) · raw batches [0](lp2-prime-mod4-adaptive-destination-batch00.json), [1–3](lp2-prime-mod4-adaptive-destination-batches01-03.json), [4–6](lp2-prime-mod4-adaptive-destination-batches04-06.json), [7–9](lp2-prime-mod4-adaptive-destination-batches07-09.json), [10–12](lp2-prime-mod4-adaptive-destination-batches10-12.json), [13–14](lp2-prime-mod4-adaptive-destination-batches13-14.json). Executed all batches in connected V8.

**Decision:** retain the supplied-destination inverse as a usable downstream receiver for an independently evidenced map. Reject the finite residue family under ordinary consumption and native singleton reading. Neither the blind map search nor a long run of exact finite exclusions establishes an original LP2 solution.
