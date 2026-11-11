# Full pair-valued p39 Newton-jet register: original-input rejection

**Classification:** bounded, source-constrained intermediate negative. No plaintext or key recovered.

## Hypothesis

The p3 red triad fixes the quadratic extension
\[
GF(29^2)=GF(29)[u]/(u^2-3u-8),\qquad u^2=3u+8.
\]
The p39 red triad fixes the original 256-byte table polynomial's jet at 15:
\[
P(15)=27,\qquad P'(15)=5.
\]
The existing p39 field-clock work evaluates the original table polynomial and derivative along the primitive field cycle. Earlier work tested scalar projections of the Newton correction and successor. This test asks whether the **full two-coordinate field elements** themselves form the keystream for adjacent pairs of GP runes.

## Exact test

The original 256 table bytes, reduced modulo 29 and interpreted as high-to-low polynomial coefficients, define P. Its formal derivative is P'. The field clock is
\[
z_i=15u^i=u^{690+i},\quad u^{690}=15.
\]
For each i, four source-derived field outputs were tested:

- \(V_i=P(z_i)\)
- \(S_i=P'(z_i)\)
- \(D_i=P(z_i)/P'(z_i)\)
- \(N_i=z_i-D_i\)

Each field element \(a+bu\) was serialized as the adjacent GP pair \((a,b)\). The 12,956 unknown runes from LP2 pages 0–55 were paired continuously into 6,478 field elements. No page, word, or phase reset was introduced. For each of the four streams, both additive signs \(C_i-K_i\) and \(C_i+K_i\) were tested. The starting phase is fixed by the p39 value 15; there is no phase sweep.

At the two derivative-zero clock states (exponents 180 and 360), the displacement uses the zero sentinel already used by the established field-clock implementation. Each stream also contains additional zero values. Therefore ordinary multiplicative inversion is not defined over the complete stream; multiplicative pair-pad models were not claimed as tested.

## Results

| Measure | Original ciphertext | English GP reference | Best candidate |
|---|---:|---:|---:|
| Index of coincidence | 0.03447840 | 0.05884076 | 0.03449569 |
| Native-GP trigram score | −4.147504 | −2.459500 | −4.152214 |

All eight additive candidates scored below the untransformed ciphertext. Their trigram scores ranged from −4.18162 to −4.15221, and their IoCs remained close to the uniform 29-symbol baseline of 1/29 ≈ 0.034483.

The best trigram candidate was the Newton successor stream with C+K. The best IoC candidate was the derivative stream with C+K. Neither shows a language signal. The four streams contain respectively 24, 16, 32, and 31 zero elements across the 6,478 positions.

The implementation also planted a native-GP English reference under each of the eight additive transformations and recovered every one exactly. This validates the pair arithmetic, sign convention, and scoring path.

## Decision

Reject the **global, source-fixed, additive full-pair p39 Newton-jet register** as a direct plaintext recovery mechanism. This result is distinct from:

- scalar projections in sims/p39_newton_field_clock_original_sft.cjs;
- the autonomous scalar derivative-state gate in im-results/p39-grid-jet-autonomous-state.md;
- raw primitive/beta pair pads in sims/lp2_red_triad_pair_field_inverse.cjs.

It does not exclude a ciphertext-dependent nonlinear state transition, a genuinely non-GP intermediate, a different source-defined output map, or a page/word-local register. Those would require independent source instructions; arbitrary new phase or projection sweeps are not justified.

**Reproduction:** run node sims/p39_newton_pair_field_original_sft.cjs from the repository root.