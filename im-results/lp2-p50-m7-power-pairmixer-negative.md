# p32 M7 powers selected by p50 digit/parity: negative pair-mixer gate

**Status:** rejected for this exact source-derived operator; intermediate result, not an established decryption.

## Hypothesis

A low-parameter candidate for the surviving p50 ten-state full-pair family is to use the source-derived p32 projective matrix

```
M7 = [[14,25],[25,28]] mod 29
```

as a reversible linear map on each original bookend pair ((K_i,C_i)). The p50 predecessor token supplies a 5×2 state: its first base-60 digit (d=0,ldots,4) selects the power, and the parity of its second digit selects the direction. Thus use (M7^d) for one parity and (M7^{-d}) for the other. The first output coordinate is candidate plaintext (P_i); the second is auxiliary (Q_i).

This combines three already documented source readings: the p32 M7 projectivity (with the p39 root-24/eigenvalue-ratio link), the p50 predecessor-byte clock, and the original A81×81/B80×80 bookend pairing. It is a candidate operation, not a claim that the author specified this composition.

## Reproduction

Inputs and mappings:
- `resources/liber-primus/lp2-corpus.json`: flatten pages 0–55; first 6,561 runes are A, remaining 6,395 are B.
- `resources/liber-primus/lp2-grid-256.json`: the 256-byte p50 table. At B offset (j), use predecessor byte `bytes[(6561+j-1) mod 256]`; no phase fitting.
- The five B holes are `{2244,2384,2476,2575,2672}`, leaving 6,395 paired positions.
- Test both already-documented A-side K mappings from `sims/lp2_bookend_p50_pairmixer_tenstate_majorization_sft.cjs`: the order-80 GF81 field mapping and the literal A-interior crop mapping.

For each p50 byte (v), set (d=lfloor v/60floor) and (p=(vmod60)mod2). Apply (M7^d) or (M7^{-d}) to the column vector ((K_i,C_i)^T) over GP29. Both parity conventions were tested (even=forward and even=inverse), and both output lanes P and Q were scored. The determinant is 28 mod29, so every selected matrix is invertible.

Run from the repository root:

```sh
node sims/lp2_p50_m7_power_pairmixer_gate.cjs
```

The reproducer is `sims/lp2_p50_m7_power_pairmixer_gate.cjs`.

## Result

| K mapping | Even parity means forward? | Output lane | Entropy (bits) | (29×IoC) |
|---|---:|---|---:|---:|
| GF81 field | yes | P | 4.85547436 | 0.999134 |
| GF81 field | yes | Q | 4.85489506 | 0.999833 |
| GF81 field | no | P | 4.85454117 | 1.000349 |
| GF81 field | no | Q | 4.85504100 | 0.999724 |
| A-interior crop | yes | P | 4.85604679 | 0.998291 |
| A-interior crop | yes | Q | 4.85553642 | 0.998995 |
| A-interior crop | no | P | 4.85500510 | 0.999748 |
| A-interior crop | no | Q | 4.85568877 | 0.998779 |

The outputs remain essentially uniform over GP29. For comparison, the pinned native Gibran control entropy in the bookend source-gate is 4.29444259 bits. Neither output lane, either A-side mapping, nor either parity orientation yields a language-like distribution.

## Decision and limits

Reject this specific `M7^{±d}` p50-selected pair operator. The test used no fitted phase, coefficient, or plaintext crib. It does not reject every possible source-selected operator in the 10-state pair family; a different operator needs its own independent source derivation, not a post-hoc search through arbitrary pair bijections.

Related evidence:
- `im-results/p50-fragment-projective-rank-crosslink.md` — source derivation of M7 and the p39 root-24 relation.
- `sims/lp2_bookend_p50_pairmixer_tenstate_majorization_sft.cjs` — original A/B bookend and p50 predecessor-state definitions; the 10-state family passes a necessary frequency-capacity gate but does not itself recover plaintext.
