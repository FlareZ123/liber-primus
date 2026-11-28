# LP2 p32 exact multiplicative row/column inverse

**Decision (Agent13, 28 November 2026):** No unknown plaintext or authentic key. On the inferred row-major 11×11 p32 geometry, exclude every nonzero multiplicative row/column mask under intact printed groups and at most three out-of-vocabulary (OOV) groups in the pinned 29,081-form GP dictionary. A separately conditional unchanged THOTH.HOME identity motif leaves zero column masks in the complete three-OOV candidate union. This does not exclude arbitrary segmentation or other cipher families.

## Why this receiver

The p32 121-rune square is inferred from the independently documented 563/569 GP-prime axis sums matching the signed 2016 image dimensions. The exact common tree artwork and [recent p57 ordinal address](lp2-p57-parable-four-primeordinals-666.md) provide conditional page/identity-motif context. The previous [additive row/column mask](lp2-p32-rowcolumn-oov-exact.md) was tested exactly with the same four disjoint anchor covers. A zero-preserving multiplicative square is a distinct operation, because nonzero GP indices form the order-28 group of GF(29) and F=0 is invariant. The original source does not authenticate the square as a cipher grid, this multiplicative operator, or the unchanged motif; this is a bounded exploratory original-cipher inverse, not an authored key claim.

Define C[r,c]=P[r,c]·2^(u[r]+v[c]) mod29, r,c=0..10, u,v in Z28, fix v[0]=0. There are 28^21 distinct masks. The operation does not skip F in its physical clock. The native p56 plaintext-F hold is a different cipher; its existence only motivates examining a zero-preserving transformation.

## Complete lexical gate

Take discrete logs of nonzero GP indices using primitive generator 2; use a separate sentinel for F. For every possible dictionary word matching the exact original F positions, adjacent nonzero symbols within the same row (including across zero gaps) fix column-factor differences. Each anchor word thus supplies a finite domain of graph-edge constraints on v. Join the domains on common connected differences, check every combined edge for consistency, and enumerate all relative offsets of disconnected graph components with v[0]=0. Each of the four pairwise-disjoint covers [7], [3], [9,13], [11,19] has at most two connected components in the original. With at most three OOV groups, at least one cover must consist entirely of dictionary words, so their union contains every eligible column mask.

For each mask, normalize the original tape by its column factors. Index dictionary forms by independent within-row log-difference signatures and exact zero positions. Within-row groups supply unary row-shift OOV costs; a group crossing a seam supplies pairwise costs. Exact 28-state chain DP finds the minimum OOV across all row factors. Native row-local bigram score breaks OOV ties only. Exact forward replay is asserted. There are no key beams or sampling in this finite lexical decision.

Original zero-bearing groups (zero-based group and within-word positions): group5 F@4 has 15 compatible lexicon forms; group6 F@0 has 34; group7 F@9 in length11 has **zero**; group20 F@2 has 24. The group7 absence alone forces one OOV for every zero-preserving mask in this register. It does not independently authenticate the printed words.

## Executed outputs

| Cover | Domain sizes | Graph components | New masks |
|---|---:|---:|---:|
| [7] | 0 | 2 | 0 |
| [3] | 1262 | 2 | 35336 |
| [9,13] | 3007,2966 | 1 | 11 |
| [11,19] | 3856,3853 | 1 | 20483 |

The union contains 55,830 column masks. Exactly one achieves 12 OOV (minimum over union); none achieves 0..3. The best full 121-rune candidate has row-local bigram -3.567329 nats/edge, replays exactly, and is nonprose. A minimum of 12 within the cover union is not a universal all-key lower bound above the guaranteed three-OOV scope.

Grant the conditional identity crib at nonzero offsets 28,31,32,33,34,35,36, with the two intervening F positions retained automatically by the multiplicative family. Then the same-row equalities require v[6]=v[9]=v[10] and v[0]=v[1]=v[2]=v[3]. None of the 55,830 masks in the exact cover union satisfies both equalities. This excludes the additional identity-crib premise only within the same <=3-OOV scope. The visible motif is not established plaintext.

Calibration before original search: native KOAN1 words177..206 and LOSS OF DIVINITY words37..68 (inclusive zero-based) each supply a complete 121-rune window and an 11-rune zero-free anchor. Both recover exact planted keys, 121/121 runes and zero OOV. A lexical stress plant preserves the original 22 lengths and all supported original F patterns, except group7, which has no lexical support and is deliberately replaced with a zero-free 11-rune form. After removing disjoint-cover words3,7,9 from the dictionary, it recovers 121/121, exact key and exactly three OOV. These are known-vocabulary, blind-key controls, not a linguistic generalization test; the stress plant is not prose and is not an exact zero-pattern match.

## Reproduction and decision

- [Standalone CommonJS SFT](../sims/lp2_p32_multiplicative_rowcolumn_exact_sft.cjs), code commit a459ea7589337388e69fd6c292fad19316513805.
- [Complete original and control keys, plaintext candidates, masks counts and input blob pins](lp2-p32-multiplicative-rowcolumn-exact-output.json), commit c46026d8f071009972e45d46fb4c29fcfecbfce3.
- Execute from repo root with Node: `node sims/lp2_p32_multiplicative_rowcolumn_exact_sft.cjs`. The committed experiment core ran on connector V8; standalone CJS wrapper/CI was not separately executed. No workflow added.

Retire this fixed multiplicative intact-group family, including the conditional motif variant. No authoritative synthesis change; no unknown plaintext or key. A genuinely spacing-free version is not eliminated by this lexical test, but needs its own calibration and evidence before any claim. The source still lacks an authenticated multiplicative operator.
