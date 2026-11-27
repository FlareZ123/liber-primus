# Exact inventory-derived stable occurrence-cycle inverse (#3198)

## Decision

Retire the specific whole-group transposition defined below as a direct chapter-local LP2 receiver. Five of nine original chapters have **zero preimages**, and the whole-book version also has zero. Eight of nine solved-native controls have multiple exact preimages despite the entire inventory and public cycle being known. Only jpg229 is uniquely decoded. No unknown LP2 plaintext, key or authenticated source selector has been recovered.

This is a conditional exclusion of a single exploratory occurrence-ranking convention, not a claim against all group transpositions or ordering before a separate value cipher. It is distinct from #2856's seam-conditioned rank acquisition, #2718's length BWT/LF cycle and #2842's public position-index prime buckets: here the cycle is computed from the unordered **full group values**, not lengths, positions alone or ciphertext endpoint statistics.

## Frozen sender and exact inverse

For each complete group tape P with N slots, sort occurrence indices by (lexicographic GP29 index string, original position). Let r[0..N−1] be those indices. The sender puts C[r[j]]=P[r[(j+1) mod N]]. This really is a permutation of whole occurrences; the observed multiset is unchanged, so a decoder knows its sorted group inventory and the minimum lexical cycle leader. GP order is public; neither this sort nor the successor operation has been selected by an authenticated Cicada clue. Ties are resolved by physical occurrence rank, not a hidden rank sidecar.

Let x_i be the distinct sorted group values (cyclic indexing), S_i the sorted physical positions in C carrying x_i, m_i=|S_i|. All but the last plaintext occurrence of x_i send x_i; its last occurrence sends x_(i+1). Therefore precisely one position t_i in S_i came from the preceding distinct value, and all other positions in S_i came from x_i. (The one-type case is identity.) The receiver must relabel every t_i to x_(i−1), leaving other positions fixed.

For m_i>1, the **necessary and sufficient** condition for a proposed vector of marks is

    t_(i+1) > max(S_i without t_i).

For m_i=1 the condition is vacuous. Necessity follows from the stable occurrence-rank order in the sender. Sufficiency follows by reconstructing the plaintext occurrence sets, whose last occurrence must then be the mark t_(i+1); applying the sender reproduces each observed group exactly. Distinct feasible mark vectors give distinct preimage tapes when there are at least two distinct group values. A one-type tape has a single feasible mark and the identity inverse.

The threshold depends only on the bit a_i saying whether t_i is the final position in S_i: it is the penultimate position if a_i=1, otherwise the last. For a singleton require a_i=1 and use threshold −1. Define a 2×2 integer matrix M_i[a,b] as the number of choices of t_(i+1) with last-position bit b above the threshold selected by a, with invalid singleton state rows set to zero. The exact number of inverse tapes is

    trace(M_0 M_1 ... M_(d−1)).

This is a cyclic factorization, not a probabilistic or language-score gate. The implementation uses BigInt, backwards suffix products conditioned on the initial bit, and retrieves a witness for any nonempty solution set. It replays every witness through the sender. Unique decodability on the observed tape is exactly count=1; count=0 proves incompatibility, and count>1 requires an additional convention, constraint or at least ceil(log2(count)) bits for an arbitrary preimage.

A minimal collision uses two values of multiplicity two: P=[A,A,B,B] and P'=[A,B,A,B] both send C=[A,B,B,A]. The tie order is not recoverable from the output inventory alone.

## Original and native results

Canonical corrected transcription parsed with line and page wraps continuing groups; verifies the exact 12,956-rune corpus tape, 2,896 complete groups, 32 carries and nine chapter counts 158/255/383/437/224/326/378/669/66. Assign the complete carry group to its start page as in #2679. No split words, punctuation clocks, fitted leaders, candidate plaintext or search variants. Source delimiters frame groups only; this is not a prediction of original typography or page layout.

Exhaustive independent count check: enumerate all ternary tapes of lengths 1–7, send each and compare DP counts on **3,279** possible output tapes (1,473 distinct reachable outputs across lengths); all agree, including impossible images. Nine authentic published solved-native records are used as plaintext plants; every planted output has a verified preimage and the true native input is necessarily in the exact solution set. Only the unique jpg229 plant is recovered by the deterministic witness choice. The other witness choices are all wrong but replay perfectly: exact forward replay cannot select the true ordering.

| Original scope | Groups | Distinct values | Repeated types | Exact preimages |
| --- | ---: | ---: | ---: | ---: |
| p0-2 | 158 | 156 | 2 | 2 |
| p3-7 | 255 | 252 | 3 | 0 |
| p8-14 | 383 | 377 | 4 | 18 |
| p15-22 | 437 | 430 | 7 | 0 |
| p23-26 | 224 | 224 | 0 | 1 |
| p27-32 | 326 | 320 | 5 | 0 |
| p33-39 | 378 | 375 | 3 | 0 |
| p40-53 | 669 | 662 | 7 | 0 |
| p54-55 | 66 | 66 | 0 | 1 |
| whole book | 2896 | 2731 | 120 | 0 |

| Solved-native plant | Groups | Distinct values | Repeated types | Exact preimages |
| --- | ---: | ---: | ---: | ---: |
| 0_warning | 45 | 38 | 5 | 20 |
| 0_welcome | 124 | 74 | 26 | 331776 |
| 0_wisdom | 31 | 27 | 4 | 4 |
| 0_koan_1 | 208 | 80 | 30 | 11147673600 |
| 0_loss_of_divinity | 181 | 93 | 39 | 8778792960 |
| jpg107-167 | 88 | 45 | 16 | 898560 |
| jpg229 | 18 | 17 | 1 | 1 |
| p56_an_end | 25 | 22 | 3 | 2 |
| p57_parable | 20 | 18 | 1 | 3 |

The fact that original p23–26 and p54–55 are all-distinct and uniquely invertible is tautological for this inventory-defined operation, not evidence for it. The five zero-image chapters exclude applying this same direct rule throughout LP2. Even if only selected chapters used it, their isolated viability is not a source clue. Native ambiguity is more severe: koan1 needs roughly 33.38 bits to select an arbitrary preimage.

## Possible repair and why it does not justify a sweep

A genuinely lossless inventory-derived **type** cycle can rotate distinct labels within equal-multiplicity classes, replacing each label uniformly. For any fixed multiset and a uniform label-to-label permutation, preservation of the multiset is necessary and sufficient for the permutation to map labels only to labels of equal multiplicity; inverse substitution is immediate once the permutation is fixed. This is a different sender, not a rescue of the failed occurrence cycle. With k distinct labels of the same multiplicity there are (k−1)! possible directed single-cycle orders before independent selection, even with a designated canonical leader; knowing the leader does not select the cyclic ordering. In particular all-distinct observed chapters permit every type permutation, so invertibility alone cannot authenticate one. Do not sweep arbitrary orders or vary the failed rule's signs, chapter cuts or rank ties.

If a period-authentic source later independently fixes both a recoverable cycle membership and order, test that one receiver with held native controls and a withheld original unit. If a value-changing cipher occurs outside the permutation and destroys the observed group inventory, today's original-image exclusion does not transfer to that model; its decoded inventory and selector are still required.

## Reproduction

- [Standalone SFT](../sims/lp2_inventory_cycle_leader_inverse_sft.cjs) — `node sims/lp2_inventory_cycle_leader_inverse_sft.cjs`.
- [Raw exact counts and input blob IDs](lp2-inventory-cycle-leader-inverse-output.json).
- Numerical core executed in connected JavaScript; the Node file-reading wrapper was generated from the executed function and was not separately run. No CI used.

Evidence commit a3ef5b2a5d29ac0a754a4d360cc1f12b0f342ccf.
