# P36 and the original degree-238 table factor: exact field inverse

**Status (12 November 2026): tested, bounded negatives, including a new key-independent exact obstruction to every fixed symbol-relabeling/transposition transfer between the 238 residual coefficients and p36. No original unknown Liber Primus plaintext, key, cipher or destination recovered.** This test asks whether two unusually specific original-source sizes actually select a *reversible whole-book* cipher, rather than only a numerical resemblance.

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

## Arbitrary-secret symbol transfer and pair permutation: exact source-only obstruction

The residual factor has **238 nonleading GF29 coefficients**, exactly the **238 runes of original physical p36**. This length match could suggest an ordinary transposition under an unknown Gematria Primus alphabet; it is distinct from the finite-field multiplication and exponent inverses tested above. A direct correspondence would give a simple human-readable rule if it actually worked. To test it without guessing the order, allow the *most generous possible* global fixed bijection of the 29 rune labels **and an entirely arbitrary permutation of all 238 positions**. The frequency multiplicities of the original 238 coefficients and original p36 must then match identically.

They do **not**. The coefficient frequency spectrum (29 counts, sorted) is

`[1,4,4,4,5,6,6,6,7,7,8,8,8,8,9,9,9,9,10,10,10,10,10,10,11,11,11,12,15]`.

The original p36 spectrum is

`[3,4,4,4,5,5,6,6,6,6,6,7,7,7,7,8,8,8,9,9,11,11,12,12,12,13,14,14,14]`.

Both streams actually use **all 29 distinct rune values**, so even an arbitrary *non-injective* stationary symbol map must be a bijection to cover all 29 observed output symbols. The sorted-frequency maximum-overlap argument proves that **at least 16 of 238 GP symbols would have to be changed**, even after choosing the most favorable unknown symbol bijection and arbitrary position permutation. With the original GP labels fixed, the same bound is **55 required changes**. Neither is a direct cipher inverse; the bound rules out exactly a relabeling/transposition copy.

The original red marks at positions 119 on p3 and p39, and the independently source-defined GF841 presentation, give a second simple representation to exclude: group p36 and the 238 residual coefficients as **119 ordered pairs**. Either use adjacent pairs or split each 238-vector into two 119-element halves. For each of the four source/target packings, grant a wholly unknown stationary 841-symbol pair map and **arbitrarily permute the 119 pair positions**. Every deterministic fixed map can only preserve or reduce the number of distinct pair values:

| Residual coefficient packing | p36 packing | Unique source pairs | Unique target pairs | Min. pair alterations even with an arbitrary bijection |
| --- | --- | ---: | ---: | ---: |
| Adjacent | Adjacent | 109 | 114 | 5 |
| Adjacent | Halves | 109 | 111 | 3 |
| Halves | Adjacent | 109 | 114 | 5 |
| Halves | Halves | 109 | 111 | 2 |

Every row is an **exact contradiction**, since 109 source identities cannot generate 111 or 114 different identities by one stationary function. A global pair-coordinate swap, reversal, a hidden GF841 symbol bijection, or an arbitrary read-order permutation cannot repair this invariant. The pair-change counts are optimistic minimum repairs under *both* an arbitrary alphabet bijection and arbitrary position permutation, not an error-correcting decode.

**Alternative natural 238-coefficient endpoint.** The monic Q238 has 239 coefficients, so an otherwise identical 238-symbol reading could instead retain its **leading unit coefficient** and omit the **constant coefficient**. This second source-fixed endpoint also uses all 29 GP values and independently requires **16 rune changes** under the most favorable hidden 29-symbol bijection and position permutation. No unexamined terminal-unit choice can rescue a direct substitution/transposition. The complete natural paired-view comparison is:

| Source view (Q238 endpoint) | Source pair packing | p36 target packing | Unique source / target pairs | Minimum edits under a pair-alphabet bijection |
| --- | --- | --- | --- | ---: |
| Retain leading, drop constant | Adjacent | Adjacent | 112 / 114 | 2 |
| Retain leading, drop constant | Adjacent | Halves | 112 / 111 | 1 |
| Retain leading, drop constant | Halves | Adjacent | 109 / 114 | 5 |
| Retain leading, drop constant | Halves | Halves | 109 / 111 | 2 |

All four cases exclude an **invertible stationary pair-symbol remapping**, because the minimum change count under any pair-alphabet bijection is positive. Three also exclude a non-injective deterministic stationary function by distinct-output growth. The **adjacent→halves** row remains compatible with some *lossy* stationary functions in principle; the present source-only evidence does not exclude a decoder incorporating additional state to resolve that loss. The original 119-pair secret-bijection negative therefore holds under both natural Q238 endpoint conventions, with the narrower deterministic-map caveat for this alternative.

The [standalone CommonJS SFT](../sims/p36_q238_secret_transposition_obstruction_sft.cjs) reconstructs the monic Q238 factor *from the original 256 bytes*, asserts its previously established SHA-256, extracts the exact original p36 physical runes, and tests both 238-coefficient endpoint choices (29-symbol and 119-pair views) with no language fitting. Its separate 29-symbol and 841-symbol planted secret-permutation controls pass. The SFT was added to the existing [manual p36 workflow](../.github/workflows/p36-q238-field-key-manual.yml), avoiding a new per-commit CI trigger, and **passed the full source regression in [GitHub Actions run 43140407867](https://github.com/FlareZ123/liber-primus/actions/runs/43140407867)**.

**Research decision:** The direct 238-symbol length coincidence does **not** permit a fixed-alphabet transposition/copy under either natural 238-coefficient endpoint. The 119-pair invertible stationary remappings are also excluded for both endpoint choices. Future p36/Q238 work requires a mathematically different reversible operation, a changing state, a non-symbolwise register, or independently supplied original key material. The existing genuine factorization and p36 page-length connection survive; this test does not identify the historical cipher or plaintext.

## Decision

The natural one-key **Hill238-style field multiplication** across all original non-key LP2 runes, under the two physically grounded coefficient orders and book/section clocks, does not recover language. Direct original p36 field-root inversions at the two historically named exponents are similarly negative. A direct secret-alphabet-and-transposition copy of the 238 residual symbols into p36, including both natural 238-symbol endpoint choices and both 119×2 pair packings, is also mathematically excluded independent of the secret permutation. This experiment rejects those *specific* simple reversible operations on the exact source symbols. It does not rule out nonlinear keyed uses of Q238, field protocols with missing public inputs, alternate plaintext registers, or the possibility that the degree/page-size agreement is accidental. A successor would require an independently indicated field operation or a newly supplied public component that makes a concrete original-cipher prediction; extending exponent and basis searches without such a clue would be unproductive.
