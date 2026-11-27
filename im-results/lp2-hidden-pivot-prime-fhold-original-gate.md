# Hidden plaintext-coordinate pivot swap: exact F-slot obstruction (#3155)

## Decision

Test one reversible changing permutation, with native literal-F hold and the independently fixed p56 prime-minus-one consuming clock. The pivot comes from the genuine solved prime clock, but its use as a transposition coordinate and a first-prime restart at the p54 terminal-section rubric are hypotheses; no original instruction selects these operations. No other generator or clock is scored.

Let A map plaintext GP29 coordinates to ciphertext tokens. If plaintext p=0 (F), emit 0 and hold A and the clock. Otherwise emit c=A(p), then A'=A∘(p t), with t=(prime_j−1) mod29. For fixed hold decisions, decryption is p=A^-1(c), rejecting p=0, and the same swap. This differs from a swap of two public ciphertext labels: the second ciphertext label is A(t), hidden in the current permutation. On two consecutive equal consuming tokens c, the second plaintext is necessarily the first pivot t, independent of A. Consequently an all-key reduction P_i=A_0^-1(D_i) with a key-independent D_i cannot hold in general: after the first repeated c, a constant plaintext t would require D_i=A_0(t), which varies over arbitrary A_0.

## Key-free partial inverse

Maintain only exact known token-to-position and position-to-token pairs. On a consume, a known position of c gives the plaintext. Move c to public t. If both its previous position and the previous occupant of t were known, move the displaced token to that position. Otherwise discard the affected known pair; no speculation about an unknown initial token. Holds output literal F and leave the state unchanged. This sound partial tracker is reusable with a known hold/clock path; it does not identify the entire initial permutation or all latent holds.

A sharper exact obstruction arises when t=0. The just-emitted token c enters plaintext F's reserved slot. Since no consuming plaintext can be F, that token is immobile until the next pivot t=0. It cannot be emitted as a consuming ciphertext in the intervening interval, irrespective of the initial permutation, other swaps, and any intervening literal F holds.

## Original contradiction

Frozen receiver: the 308 original runes p54+p55, in physical order starting at the major p54 rubric; prime clock starts at 2 and advances only on non-F. This includes the carried rune at the start of p55. The first visible ciphertext F occurs at offset 41 (zero-based), so offsets 0–40 consume mandatorily. At clock 16, prime=59, pivot=0, and ciphertext index 19 (M) is placed in F's slot. The next t=0 is clock 50 (prime=233). Original ciphertext index 19 recurs at offset 33 (clock 33, pivot=22), before it can be released. **Every initial GP29 permutation and all 64 potential F-hold masks fail at offset 33.** This is an exact all-key necessary-condition contradiction, not a linguistic score or optimizer failure. No original plaintext is possible under this frozen receiver.

## Calibration and reproducibility

Sixteen disjoint 308-rune native windows alternating Gibran/Shakespeare, offsets 1000+700*i, with random initial permutations (xorshift32 seed 0x3155ab26). Known-mask forward/inverse replays 16/16. The key-free partial tracker recovers respectively 244,246,251,244,237,254,250,229,244,251,252,237,243,252,248,237 rune coordinates (including literal held F); every recovered coordinate agrees with truth. The F-slot gate accepts every true control; 0/16 independent uniform consuming-label wrong-law controls with the same true F masks survive. This demonstrates soundness and useful partial recovery, not blind key recovery with unknown holds. No language fitting or other clock search follows the original contradiction.

[Read-only CJS SFT](../sims/lp2_hidden_pivot_prime_fhold_sft.cjs). Computational core executed on connector-fetched source; full Node wrapper not separately executed. Corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, Gibran df260a07d56bf5998d40a6360b6132c35c252d10, Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85.

Retire this exact hidden-pivot native F / first-prime / terminal-section receiver. A nonzero-only pivot, a different clock origin, or a different update may evade the theorem, but would need a new independent selector. No unknown plaintext, key, or destination recovered.
