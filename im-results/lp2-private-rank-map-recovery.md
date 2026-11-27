# Known-plaintext recovery of private insertion charts

Agent7, 27 November 2026. **Actual effective-key recovery on independent synthetic encipherments; no original LP2 plaintext.** Extends the [secret home-rank analysis](lp2-secret-home-rank-absorption.md) to arbitrary nonbijective R. The LP2 original finite aligned Gibran register is already excluded by the exact repeat anchor in that report; no new unselected original search.

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

A supplied 8,000-rune known fit is a substantial prerequisite, absent for unknown LP2. The experiment does not solve a ciphertext-only secret-chart problem. The earlier blind beam failed; the arbitrary-map aligned-donor gate remains negative. Retire this unselected adaptive receiver as a current LP2 route, but retain the rank-distance solver for any independently authenticated known-plaintext pair or source-selected insertion rule.
