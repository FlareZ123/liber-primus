# P15 commuting affine Zeckendorf digit transformations — blind inverse

**Decision:** no unknown plaintext or key. This extends the additive and direct-multiplicative digit models to arbitrary shared fixed points, removing the direct multiplication's fixed F invariant.

## Algebraic scope

An invertible affine map over GF29 is T(x)=a*x+b, a!=0. Two maps commute exactly when (a-1)d=(c-1)b for T=(a,b), U=(c,d). If every multiplier is 1, the family is translations. Otherwise any nonidentity multiplier supplies a unique fixed point q=b/(1-a); the commutation equation forces every other map to fix the same q. Therefore a commuting digit-map group, followed or preceded by a fixed arbitrary affine base map, reduces to

    C_n = q + 2^(w0 + sum(w_k*z_k(n))) * (P_n-r) mod29

where r,q are independent field elements and the 17 digit exponents are modulo28. This covers all ordinary-clock commuting affine digit products with a fixed affine base map, not arbitrary noncommuting maps or moving fixed points. It is an algebraic model extension, not an authenticated source instruction.

The original p15 spiral gives exact absolute prime distances at the first 16 distinct Fibonacci arguments. Use the same discrete-log weights as the multiplicative experiment. The source fixed-point test uses r=q=3301 mod29=24. The fully blind inverse allows all 841 pairs of fixed points and all weights.

## Recovery method

Subtract q from ciphertext, subtract r from plaintext, and take nonzero logs base2. For every digit k, use fitting-position pairs whose masks differ only in k. Their log differences cancel all other digit weights. Score all 28 shifts against frozen source-native lag distributions conditional on r. Rank all 841 (r,q) pairs by summed best shift log likelihood ratio plus the marker-count likelihood penalty. Optimize the best eight pairs using four initializations, exact affected-trigram coordinate scores, up to ten sweeps. Train language distributions from nine solved-native sections, Gibran and Shakespeare; three disjoint Emerson spans are unseen controls. Fit on original p15 offset20 through p21 (1752), freeze for p22 (131). No word-boundary constraint.

All three planted true fixed-point pairs rank 1/841 before trigram optimization. The selected keys recover all 51 weights, 6 fixed points and 5649/5649 runes, including all 393 held-out runes. Held gains relative to uniform: +0.700209,+1.112448,+0.829368.

Original fixed source pivot gain -3.138367 fitting / -2.988901 held. Blind winner (r=5,q=25) gain -2.530177 fitting / -3.522855 held; no prose. All original and plant selected inverses re-encrypt exactly, which verifies implementation only. The blind original search is calibrated but heuristic: 8/841 marker pairs receive full coordinate optimization, and arbitrary digit weights are not exhausted. Do not promote this to an all-key theorem. No source selects further changes to the marker or clock.

[Reproducer](../sims/lp2_p15_commuting_affine_zeckendorf_inverse_sft.cjs) · [full raw results](lp2-p15-commuting-affine-zeckendorf-inverse.json). Executed in connected V8; standalone Windows CI not run. Commits cb1eafff,19bd2ea1.
