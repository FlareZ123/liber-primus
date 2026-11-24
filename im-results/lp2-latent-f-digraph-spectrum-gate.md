# All latent-F masks: fixed consuming-digraph spectrum obstruction (#2628)

## Decision

A fixed injective mapping from ordered non-F plaintext pairs (28² possible) to GP29 ciphertext pairs cannot reproduce any of the 96 frozen native-prose windows on original p40–53, even granting **every subset of visible ciphertext F as literal/non-consuming**. This is a finite native-register exclusion, not a language-independent proof of impossibility or a recovery of plaintext.

## Exact all-mask bound

Original continuous chapter p40–53, no resets, 3,008 runes, 125 visible F. Any mask deletes only zeros; active length must be even, so complete pair count is 1,442–1,504. Every possible consuming pair must consist of two original positions i<j with exclusively zeros strictly between them. Count these possible edges by ordered type. This relaxed count already caps every individual bin at 13.

Strengthen independently for each target output type y. Dynamic program has 30 states: empty half-pair (29) or first symbol a in 0..28. At each observed rune x, skip iff x=0; consume from empty to x with reward 0; consume from a to empty with reward 1 iff 29a+x=y. Keep maximum score for each state. Accept only empty terminal state. This computes the exact maximum h_y over all legal masks. It need not select a common mask across y; relaxing that coupling still gives rigorous upper bounds.

Largest exact caps: 13,11,10,10,10,10,9,9,9,9,9,9,9,9,9. Sum across all 841 exact bin caps is 3,084. Sorting caps descending and greedily filling largest capacities up to n active pairs yields a vector majorizing every feasible n-pair histogram: the sum of k largest actual counts never exceeds min(n,sum of k largest caps). Thus sum c_y(c_y-1) is at most 7,834–8,076 as n ranges from 1,442 to 1,504. Minimum possible distinct-bin count from the same caps is 235–248; that statistic does not separate the donors.

## Frozen native comparison

Reuse the exact tokenizer and 32 evenly spaced 3,008-rune raw windows per source from the prior period29 all-mask gate (sims/lp2_period29_fhold_spacingfree_collision_sft.cjs): longest chart token, QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA. Strip genuine plaintext F then pair continuously at phase zero; for odd active lengths ignore the final unpaired rune (a generous comparison concession). Each complete-pair count falls in the original allowable range, and each donor is compared to the bound at its own complete-pair count. Injectivity preserves the complete sorted histogram including maximum count and ordered collision count.

| Source | Windows | Largest bin count range | Smallest ordered collision excess over matched original bound |
|---|---:|---:|---:|
| Shakespeare |32|24–47|4,124|
| Emerson |32|30–50|5,052|
| Gibran |32|31–66|5,334|
| Original all masks |—|≤13|—|

0/96 pass either bound. The relaxed edge cap suffices independently of DP. No fitting of a codebook or mask is needed, and no statistically selected original plaintext is proposed.

## Positive sensitivity

Two solved-native plaintext plants use seeded random injective 784→841 pair maps, preserve genuine F in its physical positions (including inside consuming pairs), and recover using the correct latent mask and inverse map. WELCOME: 515/515 recovered, 504 consuming, 11 true F, 23 visible F (12 consuming F). LOSS OF DIVINITY: 754/754 recovered after truncating odd consuming tail, 746 consuming, 8 true F, 51 visible F (43 consuming F). Actual spectra exactly preserved and lie inside all-mask caps. This tests the forward model and inclusion of the true masks; it does not demonstrate blind identifiability of masks.

## Reproduction / scope

`node sims/lp2_latent_f_digraph_cap_sft.cjs` from root. Core DP and controls executed directly in connector JS runtime against current repository files; standalone wrapper includes a small exhaustive-mask comparison and per-bin planted bound checks. Wrapper not separately executed. No CI or broad map search.

Retire the fixed phase-zero consuming-pair architecture for these source-native controls. A changing pair map, a compression layer, non-native language, or another independently specified receiver lies outside this decision. This is distinct from the previously rejected stationary digraph map without latent F and from the periodic additive F clock.
