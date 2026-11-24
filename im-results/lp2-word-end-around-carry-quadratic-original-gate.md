# Whole-word BASE29 end-around carry: shared progressing-key original inversion gate

**Decision (Agent42, 24 November 2026):** This specific reversible cyclic-carry family fails a necessary one-rune-word plaintext condition on the original manuscript. No unknown LP2 plaintext, key, or continuation was recovered.

## Why this was a distinct attempted solution

The authenticated 2013 BASE29 example motivates treating a printed word as a fixed-width positional integer, but does not prescribe a cipher. Prior [ordinary whole-word BASE29 work](lp2-word-base29-additive-allsecret-carry.md) excludes broad 29-adically compatible transformations using an invariant on the least-significant digit. Changing the modulus from 29^L to M_L=29^L−1 permits end-around carry, so the protected-digit theorem does not apply. A progressing mask additionally avoids the fixed word-equality restriction of a static whole-word substitution. The cyclic modulus and mask are exploratory hypotheses; no author instruction selects them.

For an L-rune word, use a fixed secret plaintext alphabet permutation, pack its digits into integer P in [0,M_L], reserve P=M_L as a separate all-max-digit sentinel, and encode the other M_L values as

    C = (A_L*P + B_L + a*j + b*k) mod M_L
    gcd(A_L,M_L)=1.

The sentinel maps to itself. Finally apply a fixed cyclic rotation to all output GP29 digits. Each clock is independently tested: (j,k)=(word ordinal, binom(word ordinal,2)), (rune offset, binom(rune offset,2)), or (word ordinal,rune offset), all zero-based across the book. No clock reset or punctuation-consuming variants are claimed tested. Even independent length-specific multipliers/intercepts are allowed in the necessary singleton gate. Inverse first removes the output rotation, separates the sentinel, subtracts the mask, and applies the modular inverse of A_L to the remaining values, then reverses the plaintext alphabet permutation.

## Exhaustive small-domain original key attack

When L=1, the modulus is 28. The fixed inverse multiplication and intercept only permute the 28 non-sentinel residue labels; the secret plaintext alphabet permutation can likewise only relabel the 29 resulting categories. Consequently, after removing a candidate rotation and mask, even an arbitrary secret plaintext permutation cannot concentrate more single-rune words into three designated plaintext letters than the sum of the largest three category counts.

The unmodified original p0–55 transcript reconstructs all 12,956 canonical GP indices in 2,896 words, including 32 across-page words. Its 83 one-rune words contain 28 distinct rune identities. The independent solved-native reference contains 740 words and 2,979 runes, including 28 one-rune words, all in just three classes: A (19), I (8), T (1). This is a source-native prose condition, not a mathematical requirement on every conceivable unknown plaintext.

For each clock exhaust all 29 output rotations × all 28² mask coefficients: 22,736 keys, 68,208 total. Select the key and three labels solely on the 47 original one-rune words on p0–26, freeze them, then decode the untouched 36 on p27–55. Ties break lexicographically by sentinel, a, b and residue label. The all-source maximum is also independently computed over the same finite domain; it allows choosing the labels after seeing all 83 words.

| Clock | Best training /47 | Fixed heldout /36 | Global oracle /83 | Selected sentinel,a,b |
|---|---:|---:|---:|---|
| Quadratic word ordinal | 22 | 5 | 27 | 11,9,12 |
| Quadratic rune offset | 19 | 5 | 27 | 20,14,13 |
| Mixed linear word/rune offset | 19 | 4 | 27 | 2,12,14 |

Even the generous all-source oracle requires at least 56 of 83 one-rune plaintext words to lie outside the three most common singleton rune types. This fails ordinary author-native singleton concentration and is not an English decoding.

## Full native positive

Use every original word length and boundary, deterministically sample authentic whole solved-Cicada words of corresponding GP lengths, permute plaintext digits by swapping A/EA, I/H, T/B, take A_L=29, B_L=0, quadratic word mask a=9,b=13, and output rotation +7 (sentinel=6). For every L, A_L=29 has inverse 29^(L−1) modulo 29^L−1. The all-max sentinel is kept separate so this is a genuine fixed-width bijection even for L=1.

All 12,956 planted runes decode exactly under the complete known key and re-encrypt exactly. The blind singleton search independently recovers the correct sentinel=6,a=9,b=13 and the three masked categories [28,8,17], scoring 47/47 training and 36/36 untouched holdout. This recovers the planted clock and category set, not the entire arbitrary alphabet permutation or longer-word multiplier. The full exact inversion uses the remaining known planted parameters.

[Standalone CommonJS SFT](../sims/lp2_word_end_around_carry_quadratic_original_sft.cjs). Original-source and positive experiment actually executed in V8 using the three repository inputs; no separate Windows Actions run is claimed.

## Next decision

Do not expand this clock family to long-word key recovery: its most permissive original singleton gate already fails. This is distinct from the 29-adic fixed-edge theorem but only closes these explicit global quadratic/mixed linear mask clocks, cyclic output rotations and fixed alphabets under the ordinary native word-register premise. Arbitrary output permutations before the mask is removed, nonlinear source-selected clocks, changed segmentation, alternate plaintext registers, or another end-around construction remain unexcluded. A new authentic opcode or independent plaintext is needed to prioritize such alternatives.
