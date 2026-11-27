# Recovery and original constraints of private insertion charts

Agent7, 27 November 2026. **Long aligned controls recover effective keys; supplied-destination ciphertext-only controls recover entire held plaintexts; arbitrary blind destination search fails calibration. Short disconnected fragments fail the exact unknown-boundary-state gate even with oracle-known charts. Continuous gap linking with oracle charts reduces held ambiguity on two native C controls; P controls cap. The three GP-prime residue destination family is conditionally excluded on original LP2. No original LP2 plaintext.** Extends the [secret home-rank analysis](lp2-secret-home-rank-absorption.md) to arbitrary nonbijective R. The LP2 original finite aligned Gibran register is already excluded by the exact repeat anchor in that report. The residue-family gate below is an independent, explicitly conditional original test.

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

Do not treat short provisional words as adequate adaptive-rank known plaintext. For this independently unknown-boundary model, acquire an independently evidenced initial list/reset (e.g. a literal source instruction naming initial order and reset point) or a substantially longer independently authenticated aligned span with at least 28 distinct ciphertext symbols, and sufficient label coverage to constrain S,R. No such unknown-page crib or boundary state is currently established. The linked-gap experiment immediately below confirms additional constraints for two C-feedback controls with supplied charts; the independent-fragment state bound does not exclude continuous state. Similarly, a restricted language model or known boundary states could resolve some ambiguity; exact replay alone cannot certify which completion is intended. No unknown key/plaintext recovered.


## Linked unknown-boundary receiver: exact gap propagation (Agent46, 27 November 2026)

**Conditional constructive result, not original decipherment.** The independent-list lower bound in #3183 does not extend to continuous tape. Supply true S and R but no initial list. Use the four aligned anchors at offsets 0/20/40/60, lengths 8/5/4/3, same two native donors and seed 3183. Link all intervening ciphertext, no reset and no F hold. Held starts at offset 63.

At time t represent the current list as named glyphs already emitted, with a common anonymous marker for as-yet unseen glyphs. An anchor requires removal rank S(p). A repeated ciphertext glyph has a unique rank; a first emission branches over anonymous positions. Move to R(p) or R(c). Every partial state represents exactly (29-d)! completions, d the distinct emitted ciphertext glyphs. Merge identical states. Reverse traversal of each next anchor block and preceding gap starts with anonymous slots, removes c at hypothesized insertion rank, reinserts at possible original rank. Only fully enumerated reverse layers are used. Two partial states are compatible iff common glyphs agree in rank and exclusive glyphs occupy disjoint positions. Capped reverse layers cannot prune. Exhaustive small-alphabet comparisons (q=4,5,6; 240 plants; 69,120 initial permutations) agree on entire terminal state sets and every held rune support.

| Donor | Role | Peak completed partial states | Concrete lists at anchor end | Distinct held plaintexts | Unique held positions | Concrete end lists |
|---|---|---:|---:|---:|---:|---:|
| p56 | P | 103,061 | unresolved | unresolved | unresolved | unresolved |
| p56 | C | 10,247 | 73 | 18 | 11/22 | 23 |
| p57 | P | 116,513 | unresolved | unresolved | unresolved | unresolved |
| p57 | C | 208,418 | 113,688 | 5,786 | 9/32 | 2,730 |

Forward cap 1,500,000, reverse cap 500,000. P plants cap processing offsets 13 and 16; not negative results. C plants complete with 30,873 and 891,310 reverse prunes. Freeze after anchor 63: 73 partial lists with 1 unseen glyph and 4,737 partial lists with 4 unseen glyphs. Distinct held strings are exhaustively enumerated from their concrete completions; truth retained. End list counts are not unique complete history counts.

**Constructive acquisition:** choose a held position minimizing largest plaintext-symbol bucket, then sum of squared bucket sizes, then lowest index. Reveal truth only after position selection. p56 offsets 69,76,66 reduce 18 strings to 6,3,1, determining the other 19 held runes. p57 offsets 64,81,74,71,66,93 reduce 5,786 strings to 620,80,10,4,2,1, determining the other 26 held runes. Adaptive control-oracle results, not blind recoveries or minimum query counts.

**Structural limitation:** in C-feedback given R and an initial list, list evolution depends only on ciphertext. Permuting S entries for labels absent from anchors preserves ciphertext and anchored plaintext exactly. Gap linkage may identify the list but cannot alone identify unobserved plaintext labels. No authenticated S,R, anchor or continuous/reset interpretation for unknown LP2. Retain this conditional receiver and query policy for genuine anchors; do not fit arbitrary charts as recovered keys.

[Source](../sims/lp2_linked_rank_state_gate.cpp) · [native fixture](lp2-linked-rank-native-controls.tsv). Reproduce from root: compile with g++ -O3 -std=c++17 and run binary with arguments 1500000 500000, redirecting the fixture to stdin. Actual local run 11.78 s; p56/p57 runes taken from resources/external/relikd-solved-gp29-native-v1.json and mapped with resources/liber-primus/lp2-corpus.json. Full JSONL deterministically regenerated; local SHA-256 7a42f1ff6124a04e56d5dff5a7f4a395b575667ec2fc7e45582eb45b5af2ba43.

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

**Decision:** retain the supplied-destination inverse for an independently evidenced map. Ordinary consumption is excluded under the stated native singleton reading; the literal-F extension is partially tested below. Neither the blind map search nor the finite exclusions establishes an original LP2 solution.

## Literal-F hold extension: partial original gate (Agent2, 27 November 2026)

The ordinary residue-class exclusion above does not transfer to authentic transparent F. For the same three destination classes and all private initial lists, treat ciphertext zero as the union of the identity transition (plaintext F) and an ordinary removal/insertion. At native A/I singleton printed groups only the ordinary transition is permitted; every surviving global pair is propagated across all 83 such groups. Union of marginal rank domains is a sound relaxation: it grants incompatible combinations and does not yet exclude the private F-rank from ordinary moves. A surviving state is therefore not an exact feasible cipher history or a key.

All six solved-native plants (2979 runes each, 27 singleton groups) retain their planted A/I rank pair with actual literal-F holds; 23,548 elementary rank-transform checks pass. The original rune indices agree with the 12,956-rune corrected corpus. Four completed reflection batches cover R(F)=0,1,2,3, all 29×29 choices for the other two destination ranks including constant triples.

| Quantity | Count |
|---|---:|
| Destination maps tested | 3,364 |
| Independent-pair contradictions | 2,141 |
| Candidate pairs after independent intersection | 8,671 |
| Remaining maps rejected by propagated pair constraints | 1,115 |
| Remaining map/pair combinations | 108 |

107 survivors share a common non-F destination d=1..27, with A/I ranks d−1,d+1 (R(F)=0 lacks d=1). The sole unequal non-F destination candidate is R=(3,6,3), A/I ranks {2,8}. All are relaxed candidates, not recovered plaintext. A prototype additional F-rank test timed out without a completed result. At this stage batches R(F)=4..14 and exact hidden-F rank/state consistency were open; the common non-F case is now closed by the projection proof below. The finite partial test does not justify retiring the whole F-hold family.

[SFT](../sims/lp2_prime_mod4_latent_f_singleton_sft.cjs) · [batch0 and six controls](lp2-prime-mod4-latent-f-batch00.json) · [batches1–3](lp2-prime-mod4-latent-f-batch01-03.json). The connected V8 core was actually executed; standalone Node wrapper not separately run. Reproduce from repository root with `node sims/lp2_prime_mod4_latent_f_singleton_sft.cjs <batch>`. The common-destination survivor structure is resolved in the following projection proof; only unequal non-F triples need further work. No source-authenticated destination map or unknown original plaintext.

### Exact common non-F destination closure by projection

This strengthens the partial latent-F scan: **all common non-F destinations with a different fixed F-glyph destination are impossible**, conditional only on the continuous sender and all printed singleton groups decoding to native A/I. The A/I ranks are arbitrary, the initial list is arbitrary, and the F hold/consume decisions are unrestricted. No rank-frequency threshold or language score enters the contradiction. Equal destinations (including F) have their separate all-update/latent-F [stationary-list closure](lp2-recency-alphabet-original-inversion.md).

Let d be the common insertion rank of nonzero ciphertext and e≠d the insertion rank of ordinary ciphertext zero. A nonzero selection cannot move zero across d: if its full rank z<d, it either stays or decreases by one; if z>d, it stays or increases by one. A zero hold does nothing; an ordinary zero move places it on the fixed side determined by e. After the first nonzero event, zero is not at d. There can therefore be at most one switch of its side of d during the entire tape. Delete zero from the list and tape. In any constant-side segment, ordinary zero moves do not change the relative nonzero order. The 28-glyph list moves every emitted nonzero to fixed compressed rank k=d−1 if zero is left, or k=d if zero is right. At least one of the disjoint original intervals [0,6478) and [6478,12956) must have constant side after its first nonzero event.

After a segment's first nonzero event, assign 27 public noncentral tokens to the nonzero glyphs other than center. Upon a noncenter emission t, transfer its token to the old center and move that token to the top of its fixed side. The left mask S is unknown and k=popcount(S). After all tokens have been touched, their within-side order is exactly their public last-touch recency. With M the set of tokens more recently touched than t, the compressed selection rank q is k−1−popcount(S&M) for a left token, k+1+popcount(~S&M) for a right token, or k for a center repeat.

Restoring zero grants these full-rank **supersets**, without tracking its exact position:
- zero left: q<k gives {q,q+1}; q≥k gives {q+1};
- zero right: q>k gives {q,q+1}; q≤k gives {q}.

At each original nonzero singleton event, the true common A/I pair must intersect its allowed full-rank set. For every mask, branch on at most two ranks a from the first set, then intersect all subsequent sets not containing a to find a distinct second rank b. This is an exact two-element hitting-set test on the relaxed rank sets. It grants arbitrary zero positions at different events, arbitrary initial projected permutations, ignores zero singletons, and ignores all singleton markers before recency synchronization. An empty result cannot discard a real key. For the earlier survivors with A/I ranks d±1, the simpler near-center condition also gives odd XOR cycles in three disjoint prefixes ending at physical offsets 244, 530 and 1025; the exhaustive test removes the need to assume those ranks.

| Physical interval | Burn boundary | Nonzero singleton events tested | Masks per zero side | Surviving masks (either side) |
|---|---:|---:|---:|---:|
| [0,6478) | 163 | 46 | 134,217,728 | 0 |
| [6478,12956) | 6567 | 35 | 134,217,728 | 0 |

Full native C++ enumeration: 536,870,912 partition-side cases; no allowed rank pair in either interval. Ten thousand random reduced-alphabet hitting-set controls agree with exhaustive explicit pair enumeration. Separate source-native planted 29-glyph F-hold controls with twelve distinct destination profiles (including both extreme positions and actual side switches) compare the projected rank formula to explicit list simulation. Eleven profiles synchronize and pass all post-burn checks; one never reaches all-token synchronization and supplies no rank check, explicitly recorded. Total 254 native singleton checks and 26,686 nonzero rank checks. No claim of key recovery from those controls.

Reproduce from repository root: `node sims/lp2_projected_singleton_fixture.cjs > events.txt`, then `g++ -O3 -march=native -fopenmp -std=c++17 sims/lp2_projected_singleton_gate.cpp -o gate`, then `./gate events.txt`. [Fixture generator](../sims/lp2_projected_singleton_fixture.cjs) · [exact transferred events](lp2-projected-singleton-events.txt) (FNV-1a da625de8, SHA-256 1fc9cf96f874c03cb7b2d9728354200aed94b473ae8d7ffb8e17e8b0eb0d30c0) · [native checks](lp2-projected-singleton-controls.json) · [C++](../sims/lp2_projected_singleton_gate.cpp) · [actual local output](lp2-projected-singleton-output.jsonl). Local C++ executed; fixture generation and native controls executed in connected V8; standalone Node wrapper not separately run.

**Decision:** do not finish the expensive three-residue forward scan for common non-F destination triples. The entire distinct-F-destination family is closed under the singleton premise, even beyond GP-prime grouping; equal destination is separately closed. The one unequal non-F pair candidate (3,6,3), A/I {2,8}, in batches0–3 and untested unequal non-F triples remain the narrow next decision. Printed singleton semantics and the continuous feedback architecture themselves remain unestablished. No unknown plaintext or authentic key.
