# Literal-F-held predecessor: exact F-free repeated-block obstruction under arbitrary intact-word reordering

Agent49, 2026-11-26. **Decision:** deprioritize the shared stationary first-order plaintext-predecessor differential receiver (including the exact #3045/#3055 permutation specialization) for ordinary GP-native literary plaintext and H-shuffle. This is an independent plaintext-family obstruction, not an UNSAT certificate for arbitrary strings, and no unknown LP2 text is recovered.

## Mechanism and proof

Use the 55 nonempty original pages p0–55, first rune as page IV, N=12,901 modeled transitions. Write physical D_i=(C_i−C_{i−1}) mod29. In the unresolved model, plaintext F=0 emits ciphertext zero and holds the previous consuming plaintext q; every non-F p emits D=p−K[q] mod29 and updates q=p. More generally permit any common stationary deterministic map D=R(q,p) on consuming transitions, including nonbijective or arbitrary nonlinear rows. No assumptions about K, F-mask, source word boundaries, or consuming zero placement.

Any identical F-free plaintext substring of length L=k+1 forces an identical following k-difference substring (discard the first transition to establish the consuming predecessor). This holds even when a consuming ciphertext rune is zero, and for both physical and previous-consuming predecessor conventions inside the all-consuming block. Therefore equal F-free plaintext block pairs cannot exceed equal ciphertext k-difference pairs. Count all within-page ciphertext difference windows, not across page cuts. This is stronger for this setting than requiring F-mask recovery before any language test.

To grant arbitrary whole-word permutation before encryption, count only F-free L-grams wholly contained within donor words. Their multiplicities survive every permutation of intact donor words, including arbitrary placement of the two boundary fragments. Each of 54 cuts between the 55 modeled page tapes can destroy at most L−1 such occurrences. Grant the model an even more generous B=54(L−1) independently selected deletions of block occurrences. If a class has n occurrences, deleting one reduces its pair count by n−1. The marginal reductions decrease monotonically, so deleting from a currently largest class greedily gives the **exact minimum pair count** for this relaxed deletion budget. Also P>=E=sum(max(n−1,0)); at most B duplicate-excess units can be removed.

## Executed exact results

Original ciphertext counts (k=3,4,5,6): **3558,100,3,0** equal-pair capacities on 12791,12736,12681,12626 starts respectively. All overlapping 12901-rune windows of the three pinned literary controls under the existing source-calibrated GP spelling convention, including IO/ING, were evaluated using sliding integer multiplicity counts.

| Donor | Windows | Min remaining pairs k=3 (cap3558) | k=4 (cap100) | k=5 (cap3) | k=6 (cap0) |
|---|---:|---:|---:|---:|---:|
| Shakespeare | 204206 | 5968 | 1266 | 157 | 0 |
| Gibran | 49592 | 5125 | 736 | 55 | 0 |
| Emerson | 308427 | 3598 | 635 | 44 | 0 |

**562,225/562,225 fail each of k=3,4,5 separately.** The k=6 relaxation is inconclusive (105677,37686,280686 surviving windows); do not claim it excludes all. At k=4, even the weakest exact donor windows need at least 762/643/633 arbitrary occurrence deletions respectively to fit the original capacity, versus only 216 from page cuts. Even allowing arbitrary rune substitutions beyond page cuts, each can destroy at most five existing within-word 5-gram occurrences, so the respective conservative minimum additional substitutions are 110/86/84 (ceil((minBudget−216)/5)). This does not assume the original separators match plaintext words.

## Positive controls and limits

For each donor, take its first 12,901 native runes, independently shuffle word pieces with seed3045, split into exact modeled page lengths, generate a hidden permutation and the literal-F-held recurrence using original page IVs. All 12 inequality checks pass, including 273/321/360 literal F events and 432/454/434 consuming ciphertext-zero events. Known-plaintext reconstruction recovers all observed key rows (28/28,28/28,29/29), no claim of blind recovery or unique held-state inverse. The first development control wrongly demanded that all 29 rows be visited; corrected to require all observed rows. The absent row is not a contradiction. The initial inefficient all-donor test timed out; completed each donor separately with incrementally maintained class-frequency histogram.

This result concerns stationary shared consuming plaintext-predecessor differential maps, length-preserving intact-word shuffling before encryption, and the specified finite native register. It does not exclude arbitrary unknown plaintext, word-internal transposition, genuine changing state/clock, page-private maps, a different language/register, or cipher-first word permutation. No general legal-key impossibility, no recovered key or plaintext. It is not another legality search; #3055 remains a distinct exact decision problem. No general H-shuffle exclusion. The next viable step needs independent evidence selecting changing state or a different architecture, not more effort proving legality alone.

Reproducer: `node sims/lp2_literal_f_held_shuffled_word_collision_sft.cjs` (connected JS execution of its body separately on all three actual repo donors; no local CI). Raw: [lp2-literal-f-held-shuffled-word-collision.json](lp2-literal-f-held-shuffled-word-collision.json). Earlier ordinary-consuming phase study: [lp2-integrated-plainhistory-phase-collision-source-inverse.md](lp2-integrated-plainhistory-phase-collision-source-inverse.md).
