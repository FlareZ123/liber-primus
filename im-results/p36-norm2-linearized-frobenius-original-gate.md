# p36 norm-2 linearized-field inverse: exact reversible GF(29^238) negative

**Agent1, 14 November 2026.** The source-authenticated number relations define a new, *fully invertible* two-term linearized-field cipher candidate without guessing a key. The **16 frozen inverses fail to recover unknown LP2 plaintext**. This is a supporting bounded negative, rather than a claim that Cicada selected the operation.

## Independent upstream source and motivating operator

Original physical LP2 pp49–51 contain the 256-cell base60 numerical table, whose GF29 polynomial factors into the published exact small factors and the unique monic irreducible polynomial `R238` of degree238. Original physical p36 prints **238 GP29 runes** that can be treated, without editing, as a field element `K` in `F=GF(29)[X]/R238`. The previous independent source-exact factor calculation established **Norm(K)=2** and **Trace(K)=11**, paralleling the signed 2013 worked BASE29/DH23 examples.

The field norm yields a useful *reversible* transform that differs from prior direct field multiplication, pure Frobenius and semilinear multiplication-plus-Frobenius tests:

```text
C = P + s*K*(P^29) in GF(29^238),    s in {+1,-1}.
```

The `P^29` map is the characteristic-29 Frobenius linear operator. Since `Norm(K)=2`, the map has **no nonzero kernel**. Indeed, a nonzero kernel input would imply `P^28 = -1/(sK)`. Taking `Norm` gives `1 = 1/Norm(sK) = 1/2` in GF29, a contradiction. Therefore the GF29-linear map is a bijection on all 238-symbol blocks for either sign. The independently established norm relation makes the invertibility argument exact, without an arbitrary exponent or fitted plaintext.

A 2014 player could have learned GF29 arithmetic from the signed 2013 BASE29 and DH challenge, but the first-party record does **not** instruct the large-extension field or the particular two-term sum. This remains a source-constrained hypothesis.

## Reproducible inverse and unchanged-original readout

Construct `R238` coefficient-for-coefficient by dividing the original numeric-table polynomial by its certified small factors. For each original p36 key orientation and each sign, form the complete 238×238 GF29 matrix of `P↦P+sK P^29`, invert it exactly by row elimination, and apply it to ciphertext blocks. Test the physical book clock (54 complete blocks = **12,852 runes**), and a fresh clock after p36 (16 complete blocks = **3,808 runes**), with both input block coefficient orders. This totals **16** fully specified original-cipher inverses, touching no original rune or markup.

| Readout | GP29 coincidence |
| --- | ---: |
| Unchanged entire unknown book (12,956 runes) | **0.03447840** |
| Unchanged post-p36 runes | **0.03439432** |
| **All 16 inverse outputs, minimum** | **0.03442271** |
| **All 16 inverse outputs, maximum** | **0.03455791** |
| Solved p57 native GP prose reference (95 runes) | ~0.06271 |

The best of the 16 is p36 key reversed, sign −, post-p36 block clock, reversed input coefficients, with **0.03455791** IoC over 3,808 recovered coefficients, still essentially uniform. Its first twenty GP graphemes are `NG I N G F T EA NG A N J B NG EA M R EA W EO G`; these are not coherent native prose.

For every key/sign choice, an **independently solved p57 native-GP 238-rune positive plant** is exactly encrypted and recovered **238/238**, and the entire original decoded sequence re-encodes to its unchanged source blocks coefficient-for-coefficient. The test pins the original numerical-table raw256 SHA256, complete p36 source length, field factorization and all 16 output model choices.

**Standalone CommonJS/Windows Node22 source SFT:** [`sims/p36_norm2_linearized_frobenius_sft.cjs`](../sims/p36_norm2_linearized_frobenius_sft.cjs), [successful GitHub Actions run 43587409060](https://github.com/FlareZ123/liber-primus/actions/runs/43587409060). The first CI attempt failed on a redundant leading zero coefficient in the untrimmed polynomial quotient; the corrected code explicitly trims it, and the second run passed. The script's exact inverses and all original readouts were also independently recomputed using the same original JSON data.

## Research decision

Retire this **exact field-linearized `I±K·Frob` block family** as a direct decoder of natural GP29 prose on the original p36-linked clocks. The norm2 condition makes the hypothesized cipher mathematically elegant, but **invertibility and an exact cross-artifact numerical correspondence are insufficient evidence of authorial selection**. No source-selected plaintext, keying rule, or endpoint follows. A future extension requires a genuinely independent authored instruction selecting another field operator and a particular target page; arbitrary key phases and nonlinear masks are not justified by this negative.
