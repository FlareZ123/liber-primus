# Secret home-rank absorption and arbitrary insertion maps

Agent7, 27 November 2026. **A general theorem for a candidate adaptive cipher, not a decipherment.** The prior public prime-insertion tests motivate closing the wider static secret map family rather than fitting further charts.

Sender: choose arbitrary secret permutation S assigning plaintext to list ranks, arbitrary initial list A, and fixed destination map R. Emit c=A[S(p)], remove c and reinsert at R(c) (cipher feedback) or R(p) (plain feedback). In transparent-F mode p=0 instead emits literal 0 and holds A. R may have repeated destinations; the absorption theorem requires R to be bijective and ciphertext-driven.

## Key-independent absorption theorem

For bijective R, define home order H by H[R(c)]=c. If positions 0…k−1 already equal H, any move of a glyph outside that prefix has both source and destination outside it; any move inside is a no-op. Thus the prefix is permanent, and the next access to H[k] extends it. Symmetrically the fixed suffix is permanent.

In an epoch that contains every ciphertext glyph at least once, an ordinary-consuming sender fixes at least one additional glyph at each end of the unsettled interval (or finishes if fewer than two remain). After 14 complete epochs, all 29 positions equal H: the final singleton is forced. Thereafter the receiver is a static substitution regardless of S, R and A.

For transparent F, define an epoch by all 28 nonzero ciphertext glyphs. Each necessarily consumes. At least one end of any unsettled interval of size ≥2 is nonzero, so each epoch fixes ≥1 position or finishes. After 28 complete epochs the list is H, even granting every visible-zero hold/consume choice. In the absorbed region any two plaintext labels can contribute at most the counts of the two most frequent ciphertext glyphs: nonzero labels have distinct outputs under H∘S, and a held F can coincide with one of those outputs only at ciphertext0, where their combined count is at most count(0). If every nonzero ciphertext glyph occurs in the absorbed region, the unused consuming rank S(F) must be R(0); otherwise one nonzero glyph would be impossible to emit. No language score or unknown initial order is needed for these facts.

## Original-data consequence

Use greedily completed disjoint epochs, actual runes (no word-boundary assumption). The following are guaranteed synchronization bounds, not estimated burn-in lengths. Compare the resulting maximum top-two plaintext count to the minimum top-two count across all contiguous normalized Gibran windows of the same suffix length.

| Scope | Holds | Epochs available | Guaranteed sync offset | Tested length | Top-two cap | Donor minimum |
|---|---|---:|---:|---:|---:|---:|
| Whole | no | 115 | 1523 | 11433 | 881 | 2253 |
| Carried p40–53 | no | 115 | 1523 | 3008 | 246 | 563 |
| Reset p40–53 | no | 25 | 1809 local | 1199 | 96 | 213 |
| Whole | yes | 117 | 2732 | 10224 | 789 | 2010 |
| Carried p40–53 | yes | 117 | 2732 | 3008 | 246 | 563 |
| Reset p40–53 | yes | 25 | not guaranteed | — | — | — |

All five bounded original scopes exclude the stated finite native register for **every** private bijective destination chart, private rank chart and initial list. Reset F chapter not closed by the theorem. This is not a universal English impossibility. The suffix bounds do not depend on matching donor order.

Twenty-four literary controls use random hidden S,R,A; actual absorption observed between steps68 and2134, all 295,140 unambiguous absorbed suffix runes match the predicted static chart. The plants lack complete alphabet epochs because some rare runes are missing; actual absorption is measured using the planted secret target, not a blind key recovery. Another 32 original-tape trajectories with random permutations and arbitrary permitted zero-move masks satisfy the guaranteed epoch bounds, with actual absorption in149–231 steps. These trajectories are state-update tests, not necessarily legal F encodings.

## Arbitrary static R: known-donor constraint

On the consuming subsequence, let x be the previous plaintext or ciphertext according to feedback role. Define M(x)=S⁻¹(R(x)). The next ciphertext equals the previous emitted ciphertext **iff** its plaintext is M(x). Each repeat forces a singleton M domain; each nonrepeat removes a label. This is exact even for noninjective R and unknown A. On known aligned donors remove actual P=0 holds only when C=0.

All original 35,129 full-book and45,077 reset chapter windows of the normalized donor fail under both roles and both hold settings. All 16 hidden arbitrary-map controls retain every true M coordinate; singleton counts11–25 of29. This is partial map inference given the donor, not complete blind key recovery. Ordinary cases fail the repeat-domain intersection, F cases fail either literal-hold legality or the intersection. See raw counts; first-failure counts depend on checking order. The arbitrary-R result is finite exact aligned-donor exclusion, weaker than a frequency-only theorem, and does not cover reordered donors.

There is no authenticated clue choosing this receiver. Retire the unselected static destination family rather than widening its parameters. The absorption proof is reusable if a later source independently suggests home ranks.

[SFT](../sims/lp2_secret_home_rank_absorption_sft.cjs) · [raw results](lp2-secret-home-rank-absorption-output.json). Exact experiment core executed in connected V8; standalone Node wrapper not separately executed.
