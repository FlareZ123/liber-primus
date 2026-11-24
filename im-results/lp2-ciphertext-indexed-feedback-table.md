# Exact ciphertext-indexed additive table inverse (#2633)

**Decision:** retire the proposed shared 29-entry feedback architecture under the calibrated native language model. The exact legal-key space collapses to 6,144 tables on the two tested original spans (first includes p15) and to two tables if shared across all nine chapters. The best original table is nonlinguistic; frozen-prefix prediction fails before language scoring. No recovered unknown plaintext or key.

## Frozen mechanism and exact inverse

For physical prior ciphertext j, a consuming plaintext p!=0 emits c=(p+T[j]) mod29; plaintext F=0 emits literal zero. The prior physical ciphertext updates after every symbol. One shared arbitrary table T; one arbitrary initial index at each chapter. This differs from #2550 (q8 plus scalar previous-ciphertext term) and #2617 (q8 plus consuming plaintext difference). There is no hidden phase or extra bank.

For every observed transition j->c with c!=0, T[j]!=c is necessary: otherwise the only algebraic inverse p=0 could not emit c!=0. Conversely, any table respecting every such exclusion has a legal path, choosing p=(c-T[j]) mod29 for c!=0 and p=0 for c=0. At c=0 and T[j]!=0, consuming p=-T[j] is also legal. The per-row domains are therefore exact and independent. This is a complete constructive reduction, not a heuristic search.

For a fixed table, a two-state forward recursion marginalizes all possible plaintext interpretations of each observed zero. A native unigram model permits exact independent row optimization; a native bigram model couples adjacent plaintext interpretations but is exactly scoreable for every table. Both models use additive 0.5 smoothing on seven native solved sections, with KOAN1 and LOSS OF DIVINITY excluded entirely. All scores below are natural-log likelihood ratios versus independent uniform GP29 ciphertext. A stationary independently uniform additive pad with transparent plaintext F supplies a second explicit null. Scoring conditions on each chapter's first physical ciphertext; its arbitrary incoming state is not fitted or scored.

## Hidden-table calibration and held-out prediction

Two distinct pseudo-random 29-entry tables from seeds 0x3301 and 0x7135, using fixed LCG and respective initial states 1 and 2, encrypt the excluded native sections. Fit only the first two thirds: exact independent-row unigram MLE, then deterministic coordinate ascent in the bigram marginal score (maximum 12 sweeps). Freeze the table and decode the remaining suffix by Viterbi, starting from the observed preceding ciphertext. Every recovered suffix exactly re-encrypts.

| Plant | Training runes | Unigram correct rows | Refined correct rows | Held-out plaintext | Held-out LLR |
|---|---:|---:|---:|---:|---:|
| KOAN1 | 520 | 28/29 | 29/29 | 254/260 | +176.671659 |
| LOSS OF DIVINITY | 503 | 27/29 | 29/29 | 249/252 | +154.774999 |

Both hidden keys recovered exactly; nine residual plaintext errors arise from ambiguous zero interpretations under the fixed Markov decoder. A round trip alone would not certify the key or plaintext.

## Original assigned scopes: exact all-table result

Pinned corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and native reference 1b064ef6d85819b7d96adaff31a82d1ec551598f. The actually executed scopes **p15–22** and p40–53 are source rune intervals [3603,5506) and [9640,12648). The issue requested p16–22, whose correct interval is [3762,5506); the 159 extra p15 runes are included in all first-span and joint statistics below. This scope correction does not change the separate all-nine-chapter result. Together they contain 4,909 internal physical transitions.

- Independent row-optimized unigram maxima: p15–22 -818.699239 nats; p40–53 -1710.951939 nats. A shared table's exact maximum is -3248.801240 nats.
- Joint legal domain contains exactly 6,144 tables. Seventeen rows must be zero; hence 2,916/4,909 plaintext signs are fixed equal to ciphertext under every legal table.
- Enumerating every table and marginalizing all zero branches gives best native bigram LLR **-2267.735259 nats (-0.461955/rune)**; second -2273.205749. The stationary F-transparent independent-pad baseline is -7.066596 nats. The best shared table has 57 ambiguous zero positions, and the Viterbi candidates replay exactly; this is a necessary invariant, not evidence of a true key.
- A separate prospective fit on the first 1,000 runes of p15–22 (same calibration algorithm) yields -187.907834 training nats. Its frozen table has 36 illegal transitions in the remaining p15–22 suffix and 95 in p40–53. No legal complete prediction or plaintext exists for that frozen key. No continuation-driven table changes were used.
- The original has a radically tighter legal domain than the independently keyed native plants. This reflects the near-full observed transition alphabet, not hidden key recovery.

## Conditional all-book consequence

If this identical table is further assumed shared across all nine source-defined chapters (independent initial states), the exact transition exclusions leave only:

1. all-zero T (identity);
2. all-zero except T[17]=17.

No other table can decode even arbitrary nonlinguistic plaintext under the frozen law. Across 12,947 internal transitions, **12,502 (96.56%)** must be unchanged under both possibilities. The second table changes only symbols immediately after GP0=17 and has 19 ambiguous zero positions. The all-zero and nonzero alternatives have native bigram LLR -6262.935284 and -6213.719435 nats respectively. The near-identity collapse is a direct source constraint and strongly contradicts the proposed manuscript-wide cryptographic role. This extension does not exclude chapter-private tables outside the two tested shared scopes, a different plaintext convention, or additional state.

## Reproduction and next decision

`node sims/lp2_ciphertext_indexed_feedback_table_sft.cjs` enumerates every legal joint and whole-book table, scores the latent paths, fits the two hidden-key plants, checks suffix replay and original fixed-key legality, and asserts the counts and scores above. Core computations executed in the JS tool runtime; standalone CJS wrapper is preserved. No new CI. Reject this precise shared-table architecture; there is no source evidence warranting additional hidden states or arbitrary banks as rescue parameters.
