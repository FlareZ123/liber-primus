# p15 modulus 3299 as a Legendre word-direction selector: all-secret pdir gate

**Agent 42, 18 November 2026. Classification: finite capacity rejection; no unknown plaintext recovered.**

## Human solve-path hypothesis

The p15 page visibly highlights **3299** and includes an infinity ornament. A separate original-cipher structural audit reports a **1649-rune span** between the first and last members of a rare adjacent-doublet cluster. Since \(3299-1=3298=2\cdot1649\), the quadratic-residue subgroup of the multiplicative group modulo 3299 has order 1649. (Important qualification: \(1649=17\cdot97\), so 3299 is **not** a safe prime.)

The 2013 signed worked example teaches modular Diffie–Hellman arithmetic; the 2016 signed message says words are the map and numbers give direction. The p50 table supplies a 256-cell source object. A plausible composition is therefore: use the **Legendre character modulo the p15 number 3299** of a word's GP-prime-value sum as a ±1 direction, and use that direction to walk a cyclic 256-state word pointer.

**Weakest premise:** no first-party clue explicitly selects the Legendre symbol, the word-prime-sum input, or the cyclic-256 pointer. The 1649 span equals \((3299-1)/2\), but that identity alone is not evidence of design. This is a bounded test of the p=3299 analogue of the existing p=23 word-direction model, not a claim that the proposed mechanism was intended.

## Frozen model family

- Modulus: p=3299, verified prime; Euler exponent 1649.
- Direction: Legendre symbol \((G_w\mid3299)\), where \(G_w\) is the GP-prime-value sum of either the current or previous ciphertext word.
- The 256-state pointer and 29-symbol secret alphabet are inherited unchanged from the p50/GP29 pdir model.
- Enumerate both zero-sign conventions, both direction flips, all 18 combinations of backward pre-step, inter-word movement, comparator, and equality update: **288 exact models**.
- No fitted key, secret chapter phase, unobserved retry, or extra direction source.

## Original-input result

The test uses all **12,956 original runes**, 2,896 printed words, and the eight source sections. No word sum is zero modulo3299, so the zero-sign convention has no effect.

The strongest of all 288 models, even after maximizing over an arbitrary independent secret GP29 alphabet at each of the 256 pointer states, has:

- maximum possible identical-rune count: **1,268**, versus the lowest native-reference control **1,397**;
- maximum possible unigram IoC: **0.05162467176557797**, versus the lowest native-reference control **0.057816420842613**.

The best configuration is current-word sum, zeroSign −1, h=1, m=0, c=0, flip=1, skip=1. Both language-capacity gates fail. Because the calculation already grants every pointer state its best possible secret alphabet, no choice of those alphabets can make this fixed direction schedule support the reference native-language unigram distribution.

## Positive control

A 12,956-rune synthetic plant using the same p=3299 Legendre direction selector, source section resets, cyclic-256 pointer, and known planted GP29 key is exactly recovered and re-encrypted. The model and source parser are therefore functioning.

Reproduce from the repository root with:

    node sims/lp2_pdir_legendre3299_allsecret_original_sft.cjs

## Decision

Reject the **p=3299 Legendre(word GP-prime sum) / cyclic-256 pointer family** as a native-English receiver for the original LP2 text. This does not reject every possible use of 3299, the p15 infinity symbol, the T7 span, or a different DH-derived operation. It does rule out this complete, source-motivated word-direction family without needing to guess any secret alphabet.
