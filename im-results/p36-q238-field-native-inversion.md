# P36 and the original degree-238 table factor: exact field inverse

**Status (11 November 2026): tested, bounded negative. No original unknown Liber Primus plaintext, key, cipher or destination recovered.** This test asks whether two unusually specific original-source sizes actually select a *reversible whole-book* cipher, rather than only a numerical resemblance.

## Original source and proposed human operation

The original LP2 numeric p49–51 table is 256 sexagesimal-printed bytes. As previously established in [the complete factorization](lp2-grid-complete-gf29-factorization.md), its row-major descending-coefficient polynomial over GF(29), with formal highest byte zero, has a monic **irreducible degree-238 factor** `Q`. The independently printed physical p36 has exactly **238 runes**. A solver equipped with the alphabet's 29 residues and basic polynomial arithmetic could therefore reasonably try treating p36 as a single nonzero element `A` in the field `GF(29)[X]/(Q)`, and using the **unique inverse `A⁻¹`** to decode other 238-rune blocks.

This is a mechanically defined, source-shaped proposal. Its weakest premise is that a human puzzle author intended a large extension-field block cipher even though the manuscript gives no explicit polynomial instruction. Neither the degree match nor the existence of an inverse authenticates that premise.

The full test is [`sims/p36_q238_field_key_original_sft.cjs`](../sims/p36_q238_field_key_original_sft.cjs), executed in [successful manual GitHub Actions run 43111634245](https://github.com/FlareZ123/liber-primus/actions/runs/43111634245). Original byte SHA-256: `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. All **12,718 original GP29 runes outside p36** are kept, in original physical page order. The test excludes p36 because it is the proposed key-bearing page, not candidate encrypted text. Its source polynomials are exactly reconstructed, not pasted or fitted to plaintext.

## Exact finite operation and result

For any complete 238-rune ciphertext block `C`, decode `P = A⁻¹C (mod Q)`. A reversible encryption would be `C = AP (mod Q)`. Because finite-field multiplication mixes all 238 positions, **a shorter final block cannot safely be zero-padded, transformed and truncated**: its discarded coefficients would carry needed information. The original-input test therefore leaves short terminal blocks unchanged under either (a) a continuous book clock or (b) the nine printed section clocks. Both physically natural coefficient interpretations are tested, with the forward multiplication as a separate direction control.

The eight whole-book outputs all retain an IoC indistinguishable from the high-entropy original:

| Orientation | Book-clock inverse | Section-clock inverse | Book-clock forward | Section-clock forward |
| --- | ---: | ---: | ---: | ---: |
| First p36 rune is constant coefficient | 0.03448093 | 0.03447636 | 0.03446427 | 0.03448798 |
| First p36 rune is highest coefficient | 0.03449365 | 0.03449727 | 0.03448193 | 0.03448248 |

The untouched non-key source has **IoC 0.03447201**. All eight output prefixes remain uninterpretable as GP English. The matching source-native plant, made from genuine solved p57 runes and padded to exactly 238, has **IoC 0.06754601**. Its full 238-rune multiplication and inverse recover *every* original symbol exactly; the full-book runs also pass exact inverse-forward replay for their own block clocks. A round trip alone is not evidence of a true decipherment; the decisive missing property here is readable original-language content.

## Historical exponent alternative, still no plaintext

The 2013 example used modular Diffie–Hellman; **3301** and **1033** were explicitly emphasized Cicada numbers. For this *already fixed* extension field the multiplicative group order is `29^238 − 1`, and both exponent values are coprime to that order. Therefore the candidate inverse of `C = P^e` is unique: `P = C^(e⁻¹ mod (29^238−1))`. Applying that algebraic inverse to the original p36 source element gives:

| Power e | First-rune-low IoC | First-rune-high IoC |
| --- | ---: | ---: |
| 3301 | 0.03510265 | 0.03442896 |
| 1033 | 0.03382619 | 0.03301067 |

All four candidates re-exponentiate to the exact authentic p36 element, and independent source-native 238-rune plants are recovered exactly. **No resulting sequence resembles readable p36 prose.** The exponents have clear prior appearances in Cicada artifacts, but no source instructs interpreting p36 ciphertext as an exponentiated extension-field message.

## Decision

The natural one-key **Hill238-style field multiplication** across all original non-key LP2 runes, under the two physically grounded coefficient orders and book/section clocks, does not recover language. Direct original p36 field-root inversions at the two historically named exponents are similarly negative. This experiment rejects those *specific* simple reversible operations on the exact source symbols. It does not rule out nonlinear keyed uses of Q238, field protocols with missing public inputs, alternate plaintext registers, or the possibility that the degree/page-size agreement is accidental. A successor would require an independently indicated field operation or a newly supplied public component that makes a concrete original-cipher prediction; extending exponent and basis searches without such a clue would be unproductive.
