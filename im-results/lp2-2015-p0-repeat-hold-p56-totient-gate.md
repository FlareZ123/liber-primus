# 2015 p0 prime-difference register: p56-totient repeat-hold second-stage gate

**Status:** negative structural result. No previously unknown plaintext sentence recovered.

## Question

Issue [#1207](https://github.com/FlareZ123/liber-primus/issues/1207) fixes the source-exact 729-rune p0–2 first-difference register and asks whether one complete, source-constrained second-stage inverse can recover original prose. The February 2015 participant source documents the first prime-shift/difference and an additional difference, but supplies no authenticated third operation. The second difference is a diagnostic: it turns the 40 adjacent equalities in the first-difference tape into 40 zeroes; it does not itself decrypt the text.

## Frozen hypothesis

The solved original LP2 p56 page supplies a concrete prime-totient key direction, (K_j=(p_j-1)\bmod29), with primes beginning at 2 and subtraction in GP29. The p56 regression implementation is `sims/authentic_lp2_p56_totient_regression.cjs`.

A bounded state rule can be selected from the 40 source-visible repeated-D sites: **hold the prime-totient key clock when the current first-difference symbol equals its predecessor; otherwise advance it.**

This gives one fully specified, invertible second-stage transducer:

- Input: the fixed 729-symbol 2015 first-difference sequence (D).
- Key: (K_j=(p_j-1)\bmod29), (p_0=2).
- Initial key index: (j=0).
- Decryption: (P_i=(D_i-K_j)\bmod29).
- State update: after processing (D_i), increment (j) iff (i=0) or (D_i\ne D_{i-1}); otherwise hold.
- No fitted phase, page reset, word reset, key wrap, or free initial state.

The encoder computes (D_i=(P_i+K_j)\bmod29) and applies the same update based on the resulting (D_i). The reproduction script verifies exact forward reciphering.

## Result

The exact original first stage produces 40 adjacent equalities. The frozen repeat-hold second stage consumes 689 prime-totient symbols over 729 runes and yields IoC **0.034139043** (normalized IoC **0.990032**), not a language-like distribution.

More decisively, the original p2 six-rune word at global offset **543** is `ᚾᚻᛒᛖᚷᛇ`. Its fixed first-difference values are:

`[15, 26, 26, 26, 26, 13]`.

At the three repeated positions, the repeat-hold rule uses the same key symbol on the same D value. It therefore forces plaintext positions 2, 3, and 4 to be identical, regardless of the prime values or initial key phase. The repository's GP29-normalized English frequency lexicon has 29,157 entries, 29,154 encodable entries, and **zero** six-rune entries satisfying that triple-equality constraint. The same witness is independently identified in `sims/lp2_2015_prime_delta_second_feedback_zero_sft.cjs`.

This is a structural incompatibility for native English with preserved printed word boundaries, not merely a low language-model score. A different language or a cipher that changes word boundaries is outside this hypothesis.

## Decision

Reject the repeat-hold second-stage. The 40 repeated-D sites do not furnish a viable key-clock rule when combined with the original p56 prime-totient key. Do not rescue it with a different phase, arbitrary F mask, fitted key, or extra cipher layer.

No independent-chapter transfer was attempted: the February 2015 first-stage source is specific to p0–2, and the frozen second stage already fails a source-word constraint inside that chapter. Applying the first stage elsewhere would introduce a new unsupported premise.

## Reproduction

Run from repository root:

`node sims/lp2_2015_p0_p56_totient_repeat_hold_gate.cjs`

The script asserts the source rune counts, the 40 repeated sites, the key clock, exact forward reciphering, the p2 witness, and the GP29 dictionary constraint. The first-stage source reconstruction is also preserved in `sims/lp2_2015_prime_delta_second_difference_original_sft.cjs`.

## Remaining uncertainty

The historical 2015 transformation may be an accidental participant-side transformation rather than an intended Cicada layer. This result rejects only the frozen p56-totient/repeat-hold family; it does not identify the actual LP2 cipher or rule out a separately source-selected second stage.
