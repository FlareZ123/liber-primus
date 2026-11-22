# p39 Newton-jet and p54-deflated quotient gates: original-input rejection

**Classification:** bounded, source-constrained intermediate negative. The p39/p54 deflated Newton step reaches the signed DH23 shared secret, but its fixed p55 state/correction streams do not decrypt the page. No LP2 plaintext or usable key recovered.

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

## Scalar Newton-map state as a period-three key (Agent 30, 11 November 2026)

The p39 red triple fixes the polynomial jet `[P(15), P'(15), 15] = [27, 5, 15]`. A solver who recognizes the ordinary Newton update `T(x) = x - P(x)/P'(x) mod 29` can derive the finite cycle `15 → 27 → 21 → 15`. A simple reversible readout is to use the current state itself as the GP29 additive key. This is distinct from the previously tested `P(x)`, `P'(x)`, Newton-correction, successor and GF(29²) pair-valued streams.

The seed is anchored at the third red rune, p39 local offset 121 / global zero-based rune offset **9521**. The three-state key runs continuously over all **12,956** unknown runes, with no page/word reset or fitted phase. Both natural additive directions were tested:

| Candidate | GP29 trigram score (nats/rune) | IoC |
|---|---:|---:|
| Raw original | **−4.147504** | **0.03447840** |
| `P_i = C_i − K_i` | −4.168685 | 0.03451266 |
| `P_i = C_i + K_i` | −4.162366 | 0.03449491 |
| Held-out native-GP Shakespeare reference | **−2.459500** | **0.05884076** |

Both source-seeded candidates score below the raw ciphertext and remain near the uniform 29-symbol baseline. The exact 12,956-rune native-GP plant is recovered and re-enciphered without error. The first two jet values also match at input 14, but the third red rune selects 15; the unselected seed-14 Newton cycle `[14, 26, 18, 22, 10, 28]` remains nonlinguistic (subtract score −4.138883). That small score edge is not plaintext and must not be used to override the source-fixed seed.

**Decision:** retire the direct period-three state-value additive key. The test does not reject every possible use of the Newton map as a nonlinear state/indexing device, but any different readout needs an independent source instruction and a discriminating original-cipher prediction. Reproduction: [standalone SFT](../sims/p39_newton_cycle_state_key_sft.cjs).


## Deflated p54-root quotient and signed-DH23 p55 gate (Agent24, 11 November 2026)

### Source-fixed derivation

The p39 red triad is the original polynomial jet \([P(15),P'(15),15]=[27,5,15]\). The first rune of the p54 nine-rune red span is enlarged Ac/index 24, and the original p50 polynomial has a double root at 24. Deflate that marked root, without searching for another:
\[
Q(X)=P(X)/(X-24)^2\quad\text{over }GF(29).
\]
The division is exact (degree 253), and the p39 jet determines
\[
Q(15)=10,\qquad Q'(15)=3.
\]
The ordinary Newton correction is \(10/3=13\), so the first successor is
\[
15-13\equiv 2\pmod{29}.
\]
This equals the shared secret in the authenticated 2013 DH23 example (\(p=23,g=5,a=15,b=6,K=2\); public shares 8 and 19). Separately reported p3/p39-prefix and p36 field norms also recover 23, 6 and 2; see [the p36 field report](p36-grid238-dh11-field-multiplication-gate.md). These are cross-round correspondences, not a cipher specification. The signed 2013 TCP source defines DH key agreement and client-supplied NEXT storage, but no KDF, symmetric cipher, IV, or deterministic consumer of K=2.

The fixed Newton orbit is:
- states: `15 → 2 → 11 → 3 → 6 → 28 → 16 → 24 → 10 → 17 → 6`, then the six-cycle `6 → 28 → 16 → 24 → 10 → 17`;
- corrections: `13, 20, 8, 26, 7, 12, 21, 14, 22, 11`, then the six-cycle `7, 12, 21, 14, 22, 11`.

It has preperiod 4 and period 6. The seed is anchored at the third p39 red rune, global offset 9521; the first post-seed state is 2. The p55 page begins at global offset 12880, 3359 positions after the anchor. Therefore the p55 state key is fixed to `[28,16,24,10,17,6]` repeated, and the correction key to `[7,12,21,14,22,11]` repeated. No reset or fitted phase is used.

### Original-cipher test

The target is the 76-rune p55 page; the continuous suffix after the p39 seed contains 3,434 runes. The two canonical Newton readouts (state and correction) were each tested as GP29 additive and multiplicative keys, in both directions, on the original p55 and continuous suffix. All eight transformations have exact native-GP positive controls (8/8).

| Readout | Operation | p55 trigram | p55 IoC | Suffix trigram |
|---|---|---:|---:|---:|
| State | `C-K` | −4.374260 | 0.035439 | −4.155331 |
| State | `C+K` | −4.165861 | 0.030175 | −4.185305 |
| State | `C/K` | −4.386552 | 0.036140 | −4.172480 |
| State | `C*K` | −4.086521 | 0.035789 | −4.158859 |
| Correction | `C-K` | −4.074458 | 0.027719 | −4.168224 |
| Correction | `C+K` | −4.170238 | 0.038596 | −4.144716 |
| Correction | `C/K` | −4.104470 | 0.045263 | −4.159368 |
| Correction | `C*K` | −4.370624 | 0.036491 | −4.153415 |

Raw p55 is −3.984523 (IoC 0.037895); the held-out native-GP p55 reference is −2.626778. **Every p55 candidate scores below raw p55.** The best suffix edge (correction `C+K`, −4.144716 versus raw −4.166766) is only 0.022 nats/rune, remains far from the native reference (−2.464036), and has no readable plaintext. The high-IoC correction `C/K` output is likewise nonlinguistic. Do not treat either small statistical edge as plaintext.

**Decision:** the first Newton successor's exact match to DH23 K=2 is an interesting source-linked correspondence, but the fixed deflated-Q Newton state/correction streams do not decode p55. Retire direct additive/multiplicative use of these two readouts on the source-anchored p55 clock. Do not rescue the route with alternate roots, phases, resets, or extra layers. No LP2 plaintext or key was recovered.

**Reproduction:** `node sims/p39_deflated_newton_dh23_p55_gate_sft.cjs`; manual workflow `.github/workflows/p39-deflated-newton-dh23-p55-gate.yml`.


## Decision

Reject the **global, source-fixed, additive full-pair p39 Newton-jet register**, the **direct period-three scalar Newton-state additive key**, and the **source-anchored p54-deflated-Q Newton state/correction additive/multiplicative p55 keys** as plaintext recovery mechanisms. The deflated quotient's first Newton successor is exactly the signed DH23 shared secret 2, but the original p55 prediction fails in all eight fixed readouts. This is a cross-round correspondence, not a recovered cipher.

These tests remain distinct from:
- scalar projections in `sims/p39_newton_field_clock_original_sft.cjs`;
- the autonomous scalar derivative-state gate in `im-results/p39-grid-jet-autonomous-state.md`;
- raw primitive/beta pair pads in `sims/lp2_red_triad_pair_field_inverse.cjs`.

Any different use of the deflated quotient, DH tuple, or Newton map needs an independent source instruction and a new discriminating original-cipher prediction. Do not repeat the rejected state/correction keys with unselected resets, phases, projections, or extra layers. No plaintext or LP2 key has been recovered.

**Reproduction:** run `node sims/p39_newton_pair_field_original_sft.cjs` and `node sims/p39_deflated_newton_dh23_p55_gate_sft.cjs` from the repository root.