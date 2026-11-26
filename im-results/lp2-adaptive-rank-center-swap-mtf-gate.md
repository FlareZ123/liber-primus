# Adaptive rank transport: fixed-center, move-to-edge and prime-clock moving-destination decisions

## Decision

Neither an adaptive fixed-slot swap, fixed-destination remove/insert, nor the prime-clock moving-destination rank encoding with affine rank labels explains the original LP2 manuscript under the finite native-GP prose comparison register. The source-visible prompt for the center branch is the solved p57 PARABLE's “find your center”; changing a mutable alphabet is an exploratory implementation of that language, **not an authenticated opcode**. This is independent of periodic additive-key and stationary ciphertext-row attacks: the complete alphabet is a mutable state, updated on every consuming rune. No unknown plaintext, authentic key, or continuation was recovered.

The important contribution is a key-independent exact reduction. There is no need to search 29! alphabets or rank-label permutations for these direct architectures.

## Models and proofs

Let A be a permutation of the 29 plaintext glyphs, L a permutation naming its slots by ciphertext glyphs, and j the position of the current plaintext glyph in A. Emit L[j]. Update after consuming:

* Fixed-slot swap: exchange A[j] and A[d], where d is any fixed slot. The proposed center is d=14 under the GP29 order.
* Move-to-front (MTF): remove A[j] and prepend it. Move-to-back is conjugate under reversal of the slot list and rank labels.
* Ordinary mode consumes all runes. Transparent F mode emits literal zero for plaintext F and leaves A unchanged; a ciphertext zero may also be a consuming rank label. All zero masks are granted in the necessary bounds.
* Traversals: continuous p0–55, the nine chapters p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55, or 55 nonempty physical pages; both directions within each frame. Independent initial permutations and rank labels per frame are allowed for the exclusion.

**Swap lemma.** In the active sequence, after step i−2 the selected plaintext token is at d. Step i−1 swaps its selected slot j_(i−1) with d, so the token from i−2 moves to j_(i−1), even when j_(i−1)=d. At i the selected token equals that from i−2 exactly when j_i=j_(i−1). Since labels are bijective,

    P_i = P_(i−2)  iff  C_i = C_(i−1)      (active sequence, i>=2).

This holds for any initial alphabet, any fixed destination, any label permutation, and any frame length; it requires neither known word boundaries nor a guessed key. Moreover, relabeling slots by ciphertext symbols reduces all fixed-slot swap decoders to 29 abstract equality-pattern decoders (one per destination label), followed by arbitrary plaintext substitution. The direct source-order center inverse and all 29 ordinary destination choices replay exactly but produce near-uniform, nonprose output. Continuous forward GP29 center IoC = 0.0344912192; all 29 destination IoCs = [0.0344541970, 0.0345332461]. Canonical head: S H E O G M IA F X Y H NG C TH J O AE IA TH OE ... . Exact replay alone cannot establish the key.

For literal-F holds, a two-count-capped DP tracking the last retained ciphertext symbol finds the exact maximum of active adjacent repeats after deleting any subset of visible zeros, excluding the first adjacent pair. It is a relaxation that may include illegal holds, so it gives a sound upper bound on required plaintext active lag-two repeats.

**MTF lemma.** At every recurrent occurrence of x, its rank is exactly the number of distinct other active symbols since its preceding occurrence. This is independent of the initial alphabet. Count those recurrent ranks, ignoring first occurrences. Under an arbitrary fixed rank relabeling, each such count must be no greater than the corresponding observed ciphertext glyph count (even with optional zero holds). Sort both count vectors descending; componentwise dominance is necessary. Apply independently per frame to grant private rank-label permutations. Recurrent-rank multisets are invariant under reversal of the traversal because the intervals between consecutive equal symbols are the same intervals. MTF's literal-F version uses the plaintext tape with F removed; F is never moved, so the same lemma holds.

## Original-input test

Original corpus has 12,956 runes across 55 nonempty pages; largest glyph count is 492. Comparison uses 349 fixed manuscript-length windows (stride floor(12956/8)=1619) from the existing repository's Gibran, Shakespeare, and Emerson controls, tokenized by its existing GP29 spelling conversion. Their chapter/page frames have the exact original lengths. These are finite literary witnesses; they are not a theorem about all possible plaintext registers.

| Frame reset | Swap ordinary exact lag2 | Swap transparent-F relaxed lag2 ceiling | Native minimum ordinary lag2 | Native minimum active lag2 |
|---|---:|---:|---:|---:|
| continuous | 86 | 99 | 448 | 473 |
| chapter | 86 | 99 | 446 | 472 |
| physical page | 85 | 97 | 442 | 469 |

All 349 windows fail each swap comparison, each direction and both clocks. All 349 also fail MTF's componentwise recurrent-rank gate, even granting a new independent rank-label permutation per chapter or page. The continuous native minimum recurrent rank maximum is 757 (ordinary) / 774 (F-hold), versus ciphertext maximum 492. Canonical continuous forward MTF inverse IoC 0.0344454508; no readable text. Move-to-back need not be searched separately because it is a reversal of slot naming.

## Exact transparent-F swap state

The necessary bound can be tightened without guessing masks or an alphabet. Let f be the current slot of plaintext F, and name slots by their ciphertext labels. For observed y, a literal hold is possible iff y=0, with f unchanged. A consuming step is legal iff y≠f; when f=d it moves to y, otherwise f remains fixed. This projection is exact for any initial permutation with the stated F position, since the other identities cannot affect F legality.

All 29×29 destination-label/F-slot pairs were exhaustively processed on the full continuous original tape in either direction. Exactly 28 pairs are feasible, each with one mask: destination label nonzero, initial F slot zero, **all 458 visible zeros are holds**. The active lag-two count is consequently exactly 95. In the finite register, the largest donor F count is 428. This demonstrates mathematical feasibility of the fixed-slot model but not plausible native plaintext. The 28 projected paths are not 28 full keys; other alphabet identities are unconstrained by this projection.

## Reproduction and scope

[Executed standalone CJS SFT](../sims/lp2_adaptive_rank_center_swap_mtf_sft.cjs), commit a399c813e48ee391ce5de8869c45d94682b0da7d. The same experiment function was executed against the connected repository sources before committing. 9,841 exhaustive ternary repeat-DP cases (all strings through length eight), 3,276 small F-position projections checked against explicit permutation/mask replay, and 36 planted controls from all nine solved GP29 records passed. Fifteen transparent-F controls exercise consuming ciphertext zero; their true masks are supplied only for known-key replay. No CI was required. Original ordinary inverses re-encrypt exactly, as they must for every bijective key.

Input blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; solved native 1b064ef6d85819b7d96adaff31a82d1ec551598f; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.

## Move-to-interior: exact carrier factorization and all-destination bound

The strongest remaining direct variant removes the selected token and **inserts** it at a fixed position d, instead of swapping it with d. This covers true move-to-center (d=14) and every fixed destination d=0..28, including the edge cases. The finite-register decision also rejects this family with both clocks, both traversal directions, and arbitrary independently private initial alphabets, rank labels and destinations in each frame.

**Factorization.** Give each initial slot a carrier identity, fixed to its initial side (left, center or right). At a consuming access to a token x, find its carrier a. If a is noncentral, output its depth in that side and move a to the front of that side's carrier queue. Exchange the plaintext token attached to a with the token attached to the center carrier. This is exactly the remove/insert update, including when x was already centered. Thus the carrier accessed sequence is determined by plaintext history via consecutive-token swaps, independently of side assignment and rank order. For unknown initial center, ignore the first active event and choose the first plaintext token as center: the remaining carrier sequence differs only by a fixed renaming. Center events have depth zero; omit them from the noncentral stream.

Let n be the number of recurrent noncentral carrier accesses in that suffix. Define W_ab as the number of recurrence intervals of carrier a containing carrier b at least once. For a partition S of the 28 noncentral carriers into sides of size d and 28−d, the total distance of recurrent selected positions from center is exactly

    n + sum_{a,b on same side} W_ab.

The term follows from ordinary MTF recurrence rank on each side separately. Initial side orders do not affect recurrent depths. Reflect the alphabet if necessary to assume d<=14. Let e_ab=W_ab+W_ba, and T_a(k) be the sum of the k largest e_ab over other carriers b. A vertex on the smaller side contributes at most T_a(d−1) incident within-side weight; on the larger side at most T_a(27−d). Sum these row bounds and divide by two. To maximize the relaxed total, choose the d vertices with smallest loss T_a(27−d)−T_a(d−1). Grant first occurrences at most their side depth, filling the larger side's capacity first, plus one unconstrained first active event. This is a sound upper bound for every partition, not a fitted partition.

The independent ciphertext lower bound uses the exact donor F count (when applicable) to remove that many physical zero glyphs, rejecting if there are too few zeros. Since the previously selected token always occupies d, the count of the center's rank label, minus its first-active-event indicator, must equal adjacent plaintext repeats in the active donor tape. Enumerate every possible center label and first-active glyph consistent with the leading-zero run. For each candidate, remove the center label from the active histogram and pair remaining counts in descending order with nonzero distances in ascending order (rearrangement inequality). This minimizes possible ciphertext distance sum over all rank-label permutations.

**Refinement.** A side of d carrier identities must also consume exactly the total number of ciphertext labels assigned to those d rank slots. Its suffix carrier frequency sum must lie between the sum of the d smallest active noncenter glyph counts minus one and the sum of the d largest counts. The one-event allowance accounts for the ignored first event. For the few surviving windows, an exact cardinality-and-frequency knapsack minimizes the above row-loss sum under this necessary interval, separately for every center label and destination. This remains an optimistic bound; no partition or plaintext is inferred from matching the bound.

| Reset | Ordinary forward/reverse | Transparent-F forward/reverse | Final survivors |
|---|---|---|---:|
| Continuous | center count 18/17; coarse distance 0/0 | center count 27/27; coarse distance 0/0 | 0 |
| Chapter | center count 2/3; coarse distance 1/1 | center count 1/0; coarse distance 1/0 | 0 |
| Page | center count 0/0 | center count 0/0 | 0 |

Each cell compares 349 fixed native literary windows. In the continuous cases that pass center counts, the minimum positive distance gap over all destinations is 9,136.5 ordinary and 6,169 held-F. The ordinary chapter survivor is Shakespeare GP29 offset153805 in both directions; refined minimum distance gaps are 182 on p15–22 and 546.5 on p40–53, even with a private destination per chapter. The held-F forward survivor is Shakespeare offset114949; refined minimum gap493.5 on p40–53. Thus all fixed destinations, not just the central slot, are rejected against this finite register. The canonical move-to-center inverse on actual continuous ciphertext has IoC0.0344793273 and nonprose (head S H E O W M IA F M AE H B N R IA EO ...); it re-encrypts exactly.

[Standalone carrier/knapsack SFT](../sims/lp2_adaptive_move_fixed_destination_carrier_gate_sft.cjs), commit b0e924548cbd9278408ed491d9643807e90eed7c. The experiment function was executed against connected sources before committing. All 522 native plants (nine solved texts ×29 destinations ×2 clocks; 172,782 rune replays) pass the direct inverse, exact carrier factorization, and both bounds; all 261 transparent-F plants deliberately exercise consuming ciphertext zero. Their supplied masks are for known-key replay only. No unknown plaintext or authentic key recovered.

**Disposition:** retire direct fixed-destination remove/insert and fixed-slot swap architectures, including MTF/MTB, rather than optimizing rank keys. This does not exclude a time-varying destination, an extra independent cipher layer, non-native registers, or unknown transposition; no source-selected rule for these remaining variants was supplied.

## Prime-clock moving destination: exact all-affine rank-label decision (Agent41, 26 November 2026)

This is a distinct moving-destination extension, motivated jointly by the solved p56 prime-minus-one clock and p57's center language. Neither source independently selects their combination; the mechanism is a deliberately literal, reversible exploratory alternative. At consuming index t let the selected rank be j, emit L(j), and exchange the selected slot with d_t = (prime[t]−1) mod29, with the first prime 2. In the literal-F version plaintext F emits ciphertext zero without updating the alphabet. We consider both advancing the public clock only on consuming symbols (the historical p56 behavior) and advancing it at every printed rune. Reverse traversal is applied within each reset interval. Reset scopes are the entire original book, nine sections, or 55 rune-bearing physical pages. The rank-label map L(j)=aj+b mod29 may be independently chosen for each frame from all 812 affine bijections, and the initial alphabet may be any of the 29! permutations independently in every frame.

**Exact ordinary receiver.** Name each slot by its emitted ciphertext label rather than its rank. The destination is then D_t = a(prime[t]−1)+b mod29. Start with identity carriers in these labeled slots, read carrier A[C_i], and swap slots C_i and D_t. Every possible initial plaintext permutation is merely a final relabeling of the carrier tape. Thus the largest carrier count is the exact maximum frequency attainable by any plaintext rune for a given affine key. Maximize over all 812 keys separately for each frame and sum. This even allows the most frequent rune to be assigned independently in each frame.

**Exact transparent-F state projection.** Let h count holds and f be the current slot occupied by plaintext F. At ciphertext y, a hold is possible iff y=0, with h incremented and f unchanged. A consuming transition is possible iff y≠f; swapping slots y and D moves f to y when f=D, otherwise leaves f unchanged. The active clock uses t=i−h; the physical clock uses t=i. A bitset indexed by h gives the complete reachable F-position set, without guessing F masks. To bound any chosen non-F symbol X, retain additionally its current slot x≠f, and the maximum number of times X has been emitted at that state. On each consume increment the count iff x=y and apply the same swap to x. Histories with equal (h,f,x) have identical future legality and reward, so max-merging is exact. All initial distinct f,x pairs are permitted. Other plaintext tokens cannot affect either transition. Every surviving state path can be extended to a full permutation by choosing arbitrary identities for the remaining 27 carriers. The maximum at the end is consequently exact for each frame and key. Summing independently optimized frames is sound even when their optimal X identities differ, because the initial plaintext labels are private.

| Reset / direction | Ordinary max rune | Active-clock F max / non-F max | Physical-clock F max / non-F max |
| --- | ---: | ---: | ---: |
| Whole book forward | 534 | 457 / 527 | 457 / 504 |
| Whole book reverse | 534 | 457 / 507 | 457 / 502 |
| Nine sections forward | 717 | 449 / 677 | 450 / 649 |
| Nine sections reverse | 713 | no complete path (section p3–7) | no complete path (section p3–7) |
| Physical pages forward | 1187 | 454 / 1198 | 449 / 1030 |
| Physical pages reverse | 1182 | 452 / 1217 | 454 / 1040 |

Original source is 12,956 runes with 458 visible F glyphs. On the whole-book transparent-F projection, 27/24 forward and 26/23 reverse affine keys have at least one path (active/physical respectively), all of the form a=b. All legal whole-book paths hold at least 448 forward active-clock, 450 forward physical-clock, or 455 reverse-clock zeros; even that lower bound exceeds the maximum 428 plaintext F glyphs in the matched literary windows. In the more generous independently private chapter and page models, the maximum count of any symbol (including F) still cannot exceed 1217. In the reverse chapter model p3–7 has zero legal affine keys under either clock.

The 349 matched-length comparison windows are selected at the frozen stride floor(12956/8)=1619 from existing Gibran (31), Shakespeare (127), and Emerson (191) GP29 donor tapes; their per-author minimum largest-rune counts are 1422, 1422, and 1505 respectively. All 349 therefore fail every tabled receiver, even with independent affine rank maps and arbitrary initial alphabet permutations per frame. This is a finite-register, key-independent concentration exclusion. It is not a universal assertion about every conceivable plaintext.

**Controls.** Both projections were checked against explicit permutations and every visible-zero mask for 1,456 ternary cases. Three independently planted affine keys were uniquely recovered from 2,979 known native solved-text runes. The inferred initial-carrier map contains 27/29 identities; without using the two unobserved identities, it predicts 4,489/4,489 mapped holdout runes (out of 4,500 total) across Gibran/Shakespeare/Emerson continuations. Six transparent-F plants retain the true F count and non-F maximum, including 203 consuming ciphertext zeros across 6,000 native runes, and replay exactly with the known masks. These are known-prefix/known-mask calibration controls, not blind plaintext recovery.

[Partitionable reproducer](../sims/lp2_prime_moving_destination_rank_swap_sft.cjs), [control output and input blobs](lp2-prime-moving-destination-rank-swap-controls.json), [original aggregate output](lp2-prime-moving-destination-rank-swap-output.json). The original computations ran in separate Code Mode calls; an attempted combined run exceeded the tool timeout. The saved SFT controls ran in Code Mode and were committed as 1d42ea7d081ed38ad0a5f219077bcd479f4c6d7a; the Node wrapper was not separately executed. Recompute individual partitions with `node sims/lp2_prime_moving_destination_rank_swap_sft.cjs original page reverse active` (substitute book/chapter/page, forward/reverse, ordinary/active/physical). No additional CI workflow or automatic trigger is needed.

**Disposition:** retire the exact prime-minus-one moving-destination receiver and its ordinary/F-hold variants over all affine rank labels and arbitrary reset-private initial alphabets. This does not cover non-affine rank relabeling or a different destination clock, and no independent source yet selects either alternative. No unknown plaintext, authentic key or continuation recovered. Do not add adjacent arbitrary destination-clock sweeps merely because the projection is efficient.
