# Count-local GP29 permutation constraints (#3174)

**Decision.** Raw independent plaintext-occurrence clocks cannot supply a nonconstant immediate permutation inverse, even with an extra known global clock. For an order-independent coupled alphabet updated by one plaintext-centered transposition per occurrence, the complete nonidentity update graph must be a disjoint union of stars, pairs and singletons. A new original-cipher histogram capacity test on 562,060 length-matched native literary windows requires at least four permanently inactive centers (five for the Gibran register). This rules out an occurrence-driven centered swap active on 26–29 labels, within that fixed all-consuming continuous sender and finite native reference scope. No source selects an admissible coupled update, no unknown plaintext or key recovered.

## Independent clocks: exact online-inverse theorem

Let Q have q≥3 symbols. At known global clock t, let n_x count occurrences of plaintext symbol x among the t consumed events. Suppose emission for x is f_x(n_x,t), with no dependence on other counts or hidden information. An immediate unrestricted inverse requires the q outputs to be a permutation of Q at every reachable count vector n (nonnegative, sum t). All such vectors are reachable under arbitrary plaintext.

Fix t. For each distinct x,y, choose a third symbol to absorb all t counts, giving n_x=n_y=0. Thus all f_x(0,t) are pairwise distinct and exhaust Q. For any a∈[0,t], choose n_x=a,n_y=0 and let a third symbol absorb t−a. Then f_x(a,t) cannot equal f_y(0,t) for any y≠x. Hence **f_x(a,t)=f_x(0,t)**. Its occurrence clock is irrelevant; only the ordinary global clock remains.

The same result applies to the reduced consuming alphabet if a separate literal F is reserved and identifiable. It does not assume that actual p56 F is identifiable from ciphertext alone: that authentic cipher has ambiguous F outputs. Restricted plaintext languages, delayed/branch-disambiguated decoding, extra side information, state dependent on other counts, and non-length-preserving emissions are outside this theorem. A specific collision in a length-preserving map at the final event also destroys fixed-length injectivity for unrestricted input.

Example, naively transferring the solved prime-minus-one clock to each symbol: f_x(n)=x+prime[n]−1 mod29 (zero-based prime index). Initially all symbols shift by 1. After one plaintext U (index 1), its next output is 3; never-consumed TH (index 2) also outputs 3. This fails before language scoring. This illustrative transfer is not an independently authored LP2 receiver.

## Coupled count-local updates: classification

For a permutation A from plaintext coordinates to ciphertext labels, emit c=A(p) and update A←A∘T_p(n_p). Here T_x(k) is a predetermined permutation of plaintext coordinates, depending solely on x and its pre-emission occurrence count k, and all events consume. The receiver knows A and counts at each step, so a known initial A gives an immediate inverse. To be a **count state**, rather than order-dependent feedback, A after a prefix must depend only on the vector of counts.

This is true iff T_x(a) and T_y(b) commute for every x≠y and a,b≥0. Necessity: from any state with counts a,b for x,y, compare suffixes xy and yx; their resulting count vectors are equal, so cancel the same initial A. Sufficiency: every reordering of a multiset is a sequence of adjacent swaps of unequal labels; those cross-label updates commute and their own counts do not change under that exchange. Updates for repeated occurrences of a single label need not commute with each other.

Specialize to T_x(k) either identity or transposition (x,v_x(k)). Two distinct transpositions commute precisely when disjoint; identical ones also commute. Draw an undirected edge for each nonidentity transposition, marking its owning x. Any two distinct incident edges must have the same owner, necessarily their common endpoint. By propagation, each connected component with at least three vertices is a star with exactly one active center and all other vertices inactive (their own updates are always identity). A second owner on one edge of a large star would not commute with its neighboring edge. A size-two component may have one or two active centers; a singleton has none. For q=29, all 29 centers cannot be active, irrespective of key or clock period. With at most one inactive center, all components are pairs or singletons.

There is also a useful reduction for one fixed permutation G_x per symbol (T_x(k)=G_x). If count-order independence holds, the G_x generate an abelian permutation group. On any orbit the induced faithful action is transitive and regular: an element fixing one point commutes with all group elements, hence fixes the whole orbit. Thus the order of the induced group is the orbit size. In the transitive GP29 case, prime degree forces a cyclic group of order 29. In a suitable coordinate chart the entire state is the scalar sum Σ_x w_x n_x mod29, with G_x fixed powers of one cycle. It is an additive feedback family in that chart, not a genuinely 29-dimensional independent phase register. This reduction does not authenticate the chart/weights or exclude all such feedback.

## Exact original histogram capacity

For the centered-transposition count-state family, the ciphertext image A_0(B) of each graph component B is invariant. Consequently Σ_{x∈B}P_x=Σ_{y∈A_0(B)}C_y, independently of the unknown initial alphabet or schedule. Here P,C are plaintext and ciphertext rune histograms over the same interval, with no resets, omission or F holds.

The pinned corpus physical p0–55 has 12,956 runes. Sorted largest ciphertext counts: 492,482,471,470,460,460. Top-two capacity 974; top-three 1,445; top-four 1,915. If every component has ≤2 vertices, no plaintext symbol can exceed 974 occurrences. Prior pinned native reference minima for the modal rune are 1,416/1,408/1,491 (Gibran/Shakespeare/Emerson, [independent native reference gate](lp2-pivot-swap-static-substitution-gate.md)). Thus those native windows cannot fit the pair-only family.

Stronger new bound, without optimizing a permutation:

1. A plaintext label is forced into a large (≥3) component if its count matches no single ciphertext count and its sum with every other plaintext count matches no sum of two distinct ciphertext-label counts.
2. Let f be the number of forced labels, M their total count. If f>0, the total number v of vertices in large components is at least max(f,3,m), where m is the smallest number of largest ciphertext bins whose total is ≥M. This grants arbitrary unknown assignment and overlooks conflicts, so it is a necessary relaxation.
3. With v vertices in k large stars, at least v−k centers are inactive. Since k≤floor(v/3), and q−v residual vertices contribute at least (q−v) mod2 inactive centers (odd size cannot be covered by pairs), the lower bound is min_{v≥v_min, v=0 or v≥3} [v−floor(v/3)+(29−v) mod2]. This includes the parity obstruction for a size-four star plus 25 remaining vertices.

Using the same pinned native encoder as #2921, every contiguous length-12,956 window was scanned. No source passage, phase, key, or clock was chosen from an original language score.

| Native reference | Runes | Windows | Minimum forced mass | Minimum large vertices | Min inactive lower bound | Max lower bound |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | 62,492 | 49,537 | 2,548 | 6 | 5 | 9 |
| Shakespeare | 217,106 | 204,151 | 1,512 | 4 | 4 | 9 |
| Emerson | 321,327 | 308,372 | 1,628 | 4 | 4 | 12 |

All 562,060 windows require ≥4 inactive centers; 0 admit a sender with 26 or more active centers. The Gibran scope requires ≥5. This is an exact necessary bound for this native register, **not an existence result for sparser stars**. The weak bound on the positive plants below also illustrates that passing it cannot identify a key. It is not a universal English theorem, and arbitrary resets, transposition of alphabet coordinates between scopes, order-dependent state laws, noncentered coupled updates, or nonnative/compressed text remain outside this test.

## Reproduction and calibration

[Standalone CJS driver](../sims/lp2_occurrence_clock_permutation_gate.cjs); `node sims/lp2_occurrence_clock_permutation_gate.cjs` from the repository root. The exact computational core ran on connector-fetched pinned files. The standalone Node wrapper was not separately executed. Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.

Four deterministic positive controls (three full-length literary plants and genuine p57 clear runes, total 38,963 runes) use stars 0→{1,2,3,4} and 5→{6,7}, ten pairs 8–27, singleton 28, cyclic leaf choice by own count, and independent fixed affine initial alphabets. Exact known-key inverse and forward replay 38,963/38,963; final permutations agree under reversed and sorted plaintext ordering. Actual inactive count 7, relaxed histogram lower bound 1 on each plant. These controls verify the mechanics and soundness, not hidden-key recovery or original applicability.

## Source decision and remaining route

The genuine p56 successive prime-minus-one schedule establishes global consuming time, not per-symbol count, and the original GP chart fixes rune/prime assignments but no coupled transposition. The authenticated 2016 signed word-map/direction message does not name a swap, second index, count-state law or initial alphabet. Earlier historical source constraints and #3150/#3155 already show why a literal prime clock is not sufficient to select a swap; the direct reciprocal public-clock and hidden plaintext-coordinate prime pivot receivers have their own distinct negative results. #2746 instead used **previous ciphertext-symbol occurrence counts** to select a shared q8 additive register; that public clock is reversible and already excluded under its pinned native scope. #2505's frequency sorting, #2921 fixed pivot, #2870 collision-repair coupling and other adaptive swaps need not be count-order independent in the specific sense above.

No new independently selected coupled occurrence law was identified in these source witnesses. Do not enumerate arbitrary stars, weights, or repair rules. Reopen only on a concrete source clue giving the complete coupled law and receiver; if the proposed state is count-order independent, apply the commutation/classification before key recovery. If it is an order-dependent feedback law, judge it separately against prior adaptive inverses and require a genuinely withheld plaintext prediction. The broad sparse star and cyclic feedback possibilities remain mathematically possible but unauthenticated. No unknown LP2 plaintext, key, or destination.
