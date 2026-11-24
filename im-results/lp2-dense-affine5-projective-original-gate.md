# Unknown dense affine-five inverse and missing-lane reconstruction

**Decision:** no native-GP decipherment under the tested complete-chapter five-rune dense linear receiver. Two-stage blind recovery identifies both independent planted 5×5 matrices and offsets exactly. Original p33–39 has an all-key pooled-IoC ceiling .04192192, independent p3–7 ceiling .04526369. Neither fitted original inverse yields connected prose. No unknown plaintext/key.

## Source scope and rival

The original p33–39 numerical section invokes 1033/3301, which also occur in the authentic 2014 Stage10 numerical squares. The complete chapter has precisely 1,680 runes = 336×5; p3–7 has 1,145 = 229×5. Prior [literal square Hill inverses](lp2-stage10-original-gf29-magic-square-inverse.md) and [fixed 3301-square CBC](lp2-2014-3301-square-hill5-cbc-original-gate.md) failed. A historical matrix need not itself be the cipher key; test the broader unknown matrix mechanism, not another arithmetic interpretation of the printed squares. There is no authenticated instruction selecting this block model.

Frozen inverse: (p_i=M c_i+b) over GF29, any shared invertible 5×5 matrix and five offsets. Natural complete-chapter framing starts at the first rune of p33, uninterrupted across physical pages; no fringes or F bypass. Fit p33–39, freeze, apply to complete p3–7. The held-out chapter is a shared-key challenge; the training all-key ceiling independently applies to a chapter-private matrix on p33–39. No arbitrary alternative phase, padding or receiver search.

## Stage 1: projective directions

Extend the [four-rune method](lp2-dense-affine4-projective-original-gate.md) to all ((29^5-1)/28=732,541) normalized nonzero row directions. Histogram each over complete blocks. Maintain the exact maximum-weight independent vector basis by streaming matroid exchange: insert a new direction iff replacing the lowest-weight feasible basis element strictly improves total collision count. This gives the same optimal basis value as descending-weight greedy selection. For dimension d and n blocks, each row histogram's sum of squares is invariant under any bijective row relabeling; by Cauchy–Schwarz the pooled collision numerator is at most (d\sum_j\sum_x f_j(x)^2-dn). Divide by (dn(dn-1)). Thus the all-key ceiling even allows **independent arbitrary 29-symbol output permutations per row** following the invertible linear projection. It does not require the affine labeling assumption used for actual key recovery.

Rank all 812 affine labelings of each selected direction by independent GP unigram likelihood and retain the top four. Precompute directed within-block and cross-block bigram edge scores for the 20 candidate lane streams; exactly evaluate all (4^5\times5!=122,880) label/order combinations without repeatedly decoding the whole tape. The language model is the first half of Gibran GP conversion. [Stage 1 CJS](../sims/lp2_dense_affine5_projective_inverse_sft.cjs) · [actual output, pinned input hashes](lp2-dense-affine5-projective-output.json).

## Stage 2: actual missing-lane key recovery

The second independent plant exposed a real limitation of marginal projection: four true rows were recovered, but its fifth plaintext lane had a weaker frequency signal than a false linear combination. Rather than simply accepting approximate plaintext, independently select the weakest recovered lane by its lowest training IoC. With the four other recovered lanes fixed, inspect complete printed words of length 2–5 containing exactly one symbol of the missing lane. For each, enumerate all 29 possible missing values and retain those yielding a word in an independent 29,226-type GP lexicon. Keep constraints with 1–4 alternatives. Each gives a linear equation in the missing row and bias (six coefficients). Construct up to 12 disjoint rank-six bases ordered by fewest alternatives then longer word and earlier position. Enumerate basis assignments, require an invertible full matrix, rank resulting candidates by training lexical rune coverage and bigram tie-break. Freeze before applying to the withheld chapter. No planted key is used in selection; the saved planted keys reconstruct the test ciphertext only.

This is a useful joint recovery method when all but one lane is reliable. [Stage 2 CJS](../sims/lp2_dense_affine5_missing_lane_lexical_sft.cjs) · [actual output](lp2-dense-affine5-missing-lane-output.json).

## Results

| Input | All-key training pooled IoC ceiling | All-key withheld ceiling | Stage 1 exact recovery train / held | Stage 2 exact recovery train / held |
|---|---:|---:|---|---|
| Solved Cicada GP plant | .06311864 | .06615110 | 1680/1680, 1145/1145 | 1680/1680, 1145/1145 |
| Independent Gibran GP plant | .06052001 | .06179955 | 1366/1680, 931/1145 | 1680/1680, 1145/1145 |
| Original p33–39 → p3–7 | .04192192 | .04526369 | No credible plaintext | No credible plaintext |

The second plant's exact five-row matrix and bias are recovered by the repair: 158 low-ambiguity equations, 12 disjoint bases, 18 distinct invertible row candidates. Its held-out complete-word coverage grows from 30.82% to 98.25%, all 1,145 held-out symbols correct. Both complete final matrices and offsets exactly match their independent plants; all replay assertions pass. The native control's true row is retained unchanged.

Original: the projection fit has .03731104 training and .03417565 withheld IoC, 4.05% and 1.22% lexical rune coverage. Weakest-lane repair has only 35 low-ambiguity equations and 775 row candidates; it improves training coverage slightly to 5.30%, but yields only 1.48% coverage and 3/1,073 long-word runes on the held-out chapter, IoC .03440162. No coherent paragraph. This is an unsuccessful attempted original decipherment, not a new partial plaintext. The all-key ceilings are exact mathematics conditional on the block architecture and the control comparison is empirical, not a universal English-language theorem.

Both pure computations ran directly on the pinned repository texts in V8, and the runnable CommonJS files contain identical logic. Preserve the failed intermediate stage and the actual repair rather than silently reporting only the final successful controls.

## Research consequence

Retire the natural complete-chapter direct dense five-rune inverse under native-GP language assumptions, including arbitrary output row relabelings. The explicit historical five-square dimensions alone do not identify a cryptographic operation. The missing-lane method is reusable on any future independently sourced block architecture that yields several strong projection lanes. Chained matrices and other framings are outside this exact result.
