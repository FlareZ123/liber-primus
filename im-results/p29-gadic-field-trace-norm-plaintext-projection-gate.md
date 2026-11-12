# P29 signed-DH field trace/norm as a plaintext projection

**Decision (Agent 28, 12 November 2026):** Original p29 and the original numerical table define an exact 273-rune G-adic residual and source-associated elements in a degree-two GF(29) extension. The 44 bounded trace/norm projection readouts below produce **no coherent GP-native English**. No unknown plaintext, original key or historical decoder was recovered. Reversible field multiplication alone had already been tested; this work specifically tests **noninvertible, two-runes-to-one-rune projections**, a different possible information carrier.

## Why try this operator?

The existing [p29 2013 DH/G-adic source bridge](p29-signed2013-dh2-gadic-congruence.md) establishes the exact original-source polynomial identity

`P29 = S50 + 2G + G²R` (mod 29), with `G = 15X²+5X+27`, `R` containing 273 GP29 coefficients, and `S50` the 256 table values in original order reduced modulo29. The authenticated 2013 BASE29 example supplies `H = 24X²+26X+3`, an irreducible quadratic. The quotient field `E = GF(29)[X]/H` has 841 elements. Existing exact source remainders are `A=19X+16` and `B=6X+5`; their product `β=24X+15` has trace4 and norm23. A separate, already examined DH interpretation gives `K=7X+1`.

The field's mathematical **trace** and **norm** take one element `aX+b` (two GP29 coefficients) to a single GF29 coefficient. This suggests a new direct plaintext extraction rather than earlier pairwise multiplication, and reuses the previously source-derived elements without guessing a fresh numeric key. No signed source specifically instructs applying trace/norm to `R`; the operation is a falsifiable hypothesis.

For `H` normalized to `X²+18X+11`, the exact outputs are `Tr(aX+b) = 2b−18a (mod29)` and `N(aX+b) = b²−18ab+11a² (mod29)`.

## Frozen 44-way original test

The source `R` has odd length273. Permit the unmatched rune either **first or last** (2), preserve or swap coefficients in each of the remaining 136 pairs (2), and use precisely five predetermined field elements `1, A, B, β, K` (5). For each pair/element evaluate **trace(element × pair)** and **norm(pair − element)** (2). Add one natural interleaved `[trace(pair), norm(pair)]` channel under each of the four boundary/orientation configurations: **2×2×5×2 + 4 = 44**. No candidate-selecting English vocabulary, secret phase, cipher alphabet, initial key, or source position is fitted.

Original input yields:

| Measurement | Exact outcome |
| --- | --- |
| Native p29 G-adic residual | 273 symbols; IoC **0.0338019823** |
| Fixed original projection variants | **44** |
| Highest projected IoC among 44 | **0.0389978214** |
| Best projected native-GP trigram score | **−5.4198108294** nats/rune |
| Best projection | Leave last rune unmatched, reverse pair coordinates, trace without a field multiplier |
| 399 independent matched 136-symbol held-out English windows | **Minimum −2.9421008844** nats/rune |
| Any projection enters held-out native score range? | **No** |

The fixed trigram model is trained on a separate 75% portion of the canonical GP-normalized Shakespeare control; every held-out window has higher score than the best source projection. The strongest original candidate transliterates `OETHLAIAGWNGFHGLJXFOGAPS...`, which is not an authentic recovered plaintext passage.

**Detection-power control:** the program embeds all **95 original solved-p57 GP runes** into synthetic field pairs through the same trace, then recovers every symbol; a separate witness construction embeds/re-extracts all 95 through norm. The positive plants show that the declared projections are capable of returning genuine source-native text if it is present. They do not claim that such encoding was used in LP2.

## Consequence and reproducibility

This rejects direct source-element trace/norm projections of the exact `R` residual under the 44 declared readouts as explanations for ordinary GP-English plaintext. It does **not** rule out trace/norm with an independently derived position-dependent key, different field representation, transport encoding, extra cipher layer, or plaintext from an unrelated language. None should be added without an authentic clue that chooses it. The stronger causal next step remains source-selected key material or a held-out original-ciphertext prediction.

**Reproducer:** [`sims/lp2_p29_gadic_field_projection_sft.cjs`](../sims/lp2_p29_gadic_field_projection_sft.cjs), Node 22 CommonJS, reads canonical p29, original 256-cell table, p57 known GP text, and the independent training corpus. Exact original-repository validation succeeded in [manual GitHub Actions run 43276958026](https://github.com/FlareZ123/liber-primus/actions/runs/43276958026), via manual-only `p29-gadic-field-projections` selector in the existing grid workflow.
