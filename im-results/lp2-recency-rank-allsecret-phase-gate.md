# Original LP2 dynamic recency-rank cipher: all-secret phase-label gate

**Decision:** the complete original 12,956-rune tape does not support the standard continuous GP29 move-to-front/move-to-back rank cipher under native-prose controls, even when its initial alphabet and every periodic rank-label permutation are private. This is a bounded conditional exclusion of a changing-state cipher, not a recovered plaintext or a creator-selected operation. Short line-reset models escape this particular bound. A separate ciphertext-driven list update is also conditionally excluded with arbitrary private periodic rank labels at periods 1–18 by a maximum-assignment frequency bound.

## Architecture and exact invariant

Maintain a list L containing each of the 29 GP symbols once. Emit the position r of plaintext rune P in L (or a private bijective label S_phase(r)), then move P to the front. The decoder inverts the label, selects L[r], and applies the same update. Moving to the back is equivalent under list reversal. This is a concrete adaptive, reversible transform with no repeat side channel; unlike the prior fixed-phase substitution theorem, the emitted rank depends on the entire recent plaintext history.

After a rune's **first** access in a reset interval, its move-to-front rank at each subsequent access is exactly the number of distinct other runes since its preceding access. This follows because all recently touched symbols precede every untouched symbol in the list. Hence these repeat-access ranks are independent of the secret initial order. For move-to-back the corresponding rank is 28-r; equality is unchanged. Omit first accesses rather than estimate them.

For any periodic rank-label permutation (including independent private alphabets per segment and phase), equal repeat-access ranks at the same phase necessarily emit equal ciphertext runes. Thus each native control's repeat-access same-phase collision count is a **lower bound** for any choice of initial list and all private labels. Unknown first accesses can only add collisions. The original's collision count is directly measurable.

The comparison is against the same five finite full-length Crowley/Blake native GP29 donor windows as the previous [fixed-phase single-rune study](lp2-allperiod-secret-phase-bijection-original-gate.md), but after adaptive rank encoding. The current original page/mark/line boundaries are read from the source corpus, ink annotations, and rune-for-rune validated master transcription. This is not a universal theorem about the collision rate of English; it is an exact key-independent implication for the specified transform, conditioned on native text comparable to these donors.

## Full original inverse

| Fixed rank inverse | Whole book IoC | p0–39 train IoC | p40–53 holdout IoC |
|---|---:|---:|---:|
| Move to front | .03444545080 | .03443731573 | .03443184874 |
| Move to back | .03447065262 | .03445373846 | .03457115136 |

Both canonical initial GP order/identity-label inverses re-encode all 12,956 original runes exactly, but give nonlinguistic output. The first begins SWEFOMIAIAJAEPBMPUIADD... in canonical transliteration. No original key or plaintext recovered.

## All-secret collision comparisons

Each comparison asks whether the original is **strictly below all five** independent-of-key donor lower bounds.

| Clock and list reset | Periods tested | Periods below all five | Exceptions |
|---|---:|---:|---|
| Continuous book | 1–3301 | 3301 | None; smallest gap 135 at q3151 |
| Nine chapter resets | 1–1033 | 1031 | q966,969 (four of five donors still exceed original) |
| Physical 13-dot resets | 1–1033 | 1031 | q966,969 (four of five exceed original) |
| Physical page resets | 1–130 | 127 | q119,122 (four); q129 (two) |
| 594 printed line resets | 1–22 | 0 | All inconclusive under this repeat-access-only bound |

Selected continuous witnesses: q1 original 2,893,513 vs 3,947,336–4,076,871 donor lower bounds; q403 original 7,024 vs 9,427–9,793; q840 original 3,277 vs 4,315–4,498; q3301 original 634 vs 870–953. These counts do not assume a correct guessed initial list, output label, or phase permutation. Five controls overlap within two source works and are not five independent authors. No statistical p-value or universal prose impossibility is claimed.

## Distinct ciphertext-driven adaptive list

A second architecture sets P_i=L_i[S_phase(C_i)], where S_phase is an arbitrary private bijection mapping the published ciphertext symbol to a list rank. The update moves **C_i**, rather than P_i, to the front. Encoder and decoder both reconstruct the list from already emitted ciphertext, so the law is invertible. A move-to-back list is equivalent under list/rank reversal. The original ciphertext fixes the order of all previously accessed symbols at every position; before all 29 have been seen, the unseen suffix retains its arbitrary initial ordering.

For each proposed output symbol p, phase r, input symbol c and rank j, form a weight counting original positions where the list at rank j can contain p. If p has appeared, its rank is fixed. If p has not appeared, generously allow every unseen-suffix rank. This relaxes cross-position initial-list consistency and is therefore an upper bound, not an assertion that every counted position can simultaneously be attained. For each phase maximize the weight over all 29×29 bijections using a maximum-weight perfect assignment (Hungarian algorithm). Sum over phases and take the maximum over p. **Every** key and initial list is bounded by this result, even with an arbitrary fixed outer relabeling of the plaintext alphabet. No language optimization or fitted plaintext is used.

| Period | Upper bound on any one decoded symbol | Donors whose most frequent rune exceeds bound |
|---:|---:|---:|
| 1 | 703 | 5/5 |
| 7 | 1,146 | 5/5 |
| 13 | 1,418 | 5/5 |
| 18 | 1,577 | 5/5 |
| 19 | 1,629 | 4/5 |
| 24 | 1,803 | 1/5 |
| 29 | 1,925 | 0/5 |
| 31 | 1,993 | 0/5 |

The five donor maxima are 1,809, 1,753, 1,650, 1,657, 1,612. **All q1–18 are conditionally excluded against all five**; the q19–24 comparisons exclude some donors, q25–31 none. This does not show that any surviving period can recover prose. In the two canonical identity-label original inverses (front and back), full IoCs are .03449792779 and .03450873538; p40–53 holdout IoCs are .03438364561 and .03450127893. Both replay exactly, neither is readable. Two independently keyed native plants at q13 decode exactly; actual top counts 1,809 and 1,612 fit their computed bounds 1,882 and 1,728. [Separate read-only assignment SFT](../sims/lp2_cipher_recency_rank_allsecret_assignment_sft.cjs) was executed through the connected JavaScript runtime. No CI claim.

## Reproduction and implications

[Standalone Node CommonJS SFT](../sims/lp2_recency_rank_allsecret_phase_sft.cjs) runs read-only on the repository corpus and fixed source-native donors. The exact study function was executed through the connected JavaScript runtime. Both move orientations round-trip full native donor plaintext with independently generated arbitrary initial lists and private phase permutations in all five reset regimes, and the collision lower bound is confirmed. No separate Windows CI run was requested.

The continuous rank law is now a poor target for private key fitting: even arbitrary periodic label permutations up to period3301 cannot repair these native-control contradictions. The rare inconclusive reset periods and short line resets are not positive evidence for the mechanism. A different update rule, rank coding with changing nonperiodic labels, homophony or mixed plaintext could evade the bound; no source-visible instruction selects any of these. The ciphertext-driven variant is a different law and has its separate q1–18 exclusion; do not conflate the two. Prioritize a new authenticated operation or a genuinely distinct reversible state law rather than tuning the rejected recency decoder.
