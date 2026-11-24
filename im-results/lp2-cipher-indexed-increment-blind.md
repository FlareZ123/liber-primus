# Ciphertext-indexed additive increments: spacing-free blind differential key recovery

**Decision (Agent1, 24 November 2026):** A constructive attack recovers an arbitrary 29-entry running-key increment table on independent planted native-register controls, including the historical plaintext-F hold extension. Neither mode recovers unknown LP2 plaintext. In particular, this is not an all-key exclusion of arbitrary ciphertext feedback.

## Mechanism and inverse

The solved source uses GP29 arithmetic and, in two LP1 sections and LP2 p56, transparent plaintext F. One compact way to make the arithmetic clock depend on the observed ciphertext is to introduce a shared secret table D of 29 residues and a single initial shift k. It is a candidate mechanism, not a source-selected interpretation of the p50 grid or another illustration.

Ordinary mode: C_i = P_i + k_i (mod 29), k_(i+1) = k_i + D[C_i] (mod 29).

Thus the plaintext difference at i>0 is

    P_i - P_(i-1) = C_i - C_(i-1) - D[C_(i-1)] (mod 29).

The initial shift cancels, so every adjacent pair of plaintext differences depends on only two table entries. This permits a 29-label pairwise factor objective over 29 unknown table positions, instead of fitting long cumulative plaintext paths by a global black-box search. The objective is trained on external native-GP prose (Shakespeare, Gibran, Emerson; each planted target is excluded). It uses 0.5 pseudocounts and native ING/IO spellings. Initialize from independent difference row likelihoods, then coordinate-maximize the adjacent-difference conditional log likelihood for up to 40 sweeps from deterministic starts (32 per control, 64 original). The search is heuristic globally; there is no claim of exact MAP table recovery on LP2.

For the F-hold variant, when P=0 emit C=0 and retain k. Otherwise the ordinary equation and table update apply. Every all-nonzero ciphertext triple must correspond to a nonzero consuming plaintext triple, so the same pairwise estimator works on these triples without guessing F positions. The reference difference distribution is conditioned on nonzero plaintext triples. The 28 nonzero table entries are estimated first; retain the top eight distinct terminal coordinate solutions, enumerate all 29 D[0] values, and exactly Viterbi-invert the prefix with state (incoming shift, previous plaintext). At each C=0 both the transparent-F and legal ordinary branch are retained. Select the complete fitting prefix by native bigram score and freeze its terminal state before continuation. DP is exhaustive **for each fixed candidate table**; the table pool is finite. A native bigram scorer selects the initial shift in ordinary mode.

## Original source and prediction

All 12,956 original p0–55 runes and 2,896 printed groups are checked against the canonical transcription. The spacing-free key fit uses only p0–39 (9,640 runes); p40–53 (3,008 runes) is the frozen continuation, and p54–55 (308 runes) is unused by this blind search. Neither printed word lengths nor the latter two regions enter the optimization.

* Ordinary mode: 64 distinct local optima. Prefix winner decodes with -4.99806 nats/rune (native bigram), frozen p40–53 with -5.05638. No recognizable prose; exact re-encryption of all 12,648 tested runes is automatic for any candidate table and only checks implementation.
* F-hold mode: 64 distinct local optima, 8 retained nonzero tables x29 zero entries = 232 tested full tables. **None admits a legal complete fitting prefix**, with all initial shifts and both F interpretations included. Maximum legal prefix is 714 runes. The held-out chapter is never used to select or alter a candidate. No recovered key, no legal continuation to score.

An independent exact intact-word necessary condition in ordinary mode: for a proposed plaintext word p of the same length, each occurrence of an identical predecessor ciphertext rune imposes the same D residue. This holds even with a private initial shift and private table per word. The source-native DWYL long-word lexicon supplies 17,541 distinct 13-rune spellings and 11,327 distinct 14-rune spellings. Seven anchors have 19, 0, 0, 8, 0, 0, 17,541 candidates in source order, so four printed long words alone rule out this intact-word lexicon model even with unrelated private tables. This exact scoped exclusion does not apply to F holds, different spellings, or moved word separators.

## Positive and held-out controls

Each long literary target uses a separate deterministic random 29-entry increment table, first 10,000 ciphertext runes for key fit, and untouched following 3,000 for prediction. The corresponding author is excluded from model training. The shorter planted source control concatenates all nine creator-native solved sections (2,979 runes; 2,479/500 split), and its language model uses external literature only. The underlying native reference is a transcribed solved corpus, not an independent contemporary source artifact.

| Control | Ordinary recovered table / withheld exact | F-hold recovered table / withheld exact |
| --- | --- | --- |
| Shakespeare | 29/29; 3000/3000 | 29/29; 2988/3000 |
| Gibran | 29/29; 3000/3000 | 29/29; 2998/3000 |
| Emerson | 29/29; 3000/3000 | 29/29; 2998/3000 |
| Creator-native solved register | 29/29; 500/500 | 29/29; 500/500 |

All eight planted experiments recover their initial shifts, and the reconstructed prefix plus heldout text forward-replays every ciphertext rune exactly. The slight F-hold plaintext errors demonstrate genuine latent-path ambiguity even with the correct key. Pairwise refinement recovers the two and six missing increment entries respectively on the short native ordinary and F-hold plants, whereas independent row initialization already recovers all long-control nonzero entries. The source-native heldout recovery is not evidence of a new authentic Cicada key.

## Research disposition

Do not rerun the fixed ordinary or F-hold ciphertext-indexed additive increment model with different seeds or tune on the original holdout. The blind attack is a reusable spacing-independent key inference method for a compact feedback family, not evidence that the family was intended by Cicada. A new source-selected non-additive mechanism could reuse the factor objective with an appropriate local inverse. The finite original candidate failure does not exclude all tables under an arbitrary language, different reset clock, or other feedback mechanism.

Reproduce with Node.js 22:
`node sims/lp2_cipher_indexed_increment_blind_sft.cjs`.

[Exact output](lp2-cipher-indexed-increment-blind-output.json) · [SFT](../sims/lp2_cipher_indexed_increment_blind_sft.cjs). Executed in the connected JS runtime against repository inputs; no CI workflow was invoked. Code and output checkpoint: e2d0d2ddd2b8b92e0ff47b09f314f681c4830eac.
