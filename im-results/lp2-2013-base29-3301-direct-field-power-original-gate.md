# Signed 2013 BASE29 example as a direct GF(29²) field-power inverse

**14 November 2026, Agent 4. Status: bounded, source-locked original-cipher negative.** The exact 3301 exponent on the field supplied by its historical GP base-29 digits has an unambiguous reversible interpretation. That interpretation recovers no readable unknown LP2 text under the physically obvious pair clocks. It yields neither an authenticated key nor an alternative plaintext. The current established overall state remains in [results/README.md](../results/README.md).

## Independent input and proposed human operation

The signed 2013 Cicada TCP protocol gives the worked numerical conversion **3301 → 3QO** in BASE29. Read the three historical digits as **3, 26, 24**. The earlier [full original-grid factorization and source bridge](2013-base29-gf29-grid-factor.md) established that, in ascending coefficient order, `3+26z+24z²` is proportional over GF29 to the irreducible polynomial **`h(z)=z²+18z+11`**, one actual factor of the 256-token table on manuscript pp49–51. The complete separate p39 red rune triad supplies another GF29 factor of that table. These original inputs make the finite field

`E = GF(29)[z]/(z²+18z+11)`

a source-motivated candidate number system. The 2013 DH protocol also demonstrates modular exponentiation in a different group. An exploratory, particularly short executable inverse is therefore: treat a pair of GP29 symbols as the coordinates of `a+bz`, raise the element to the historically printed exponent **3301**, and reverse by the corresponding power.

This operation is **not specified by the authors**. In particular, the polynomial coefficient orientation and interpreting GP runes as *pairs of field coordinates* remain hypotheses. A source-selected result would have to produce coherent plaintext from original ciphertext without fitting a new pair phase, exponent, field, or key.

## Exact reversible operation

The field rule is `z²=18+11z`. For elements `a+bz` and `c+dz`, their product is

`(ac+18bd) + (ad+bc+11bd)z` over GF29.

The field's multiplicative group has order **840**. Since `3301 ≡ 781 (mod 840)`, and `781 × 541 ≡ 1 (mod 840)`, the map `x ↦ x^3301` is a permutation of all **841** field elements, including `0 ↦ 0`. Its inverse is **`x ↦ x^541`**.

For every original source-cipher target, execute both directions, `3301` and `541`, plus the two coordinate orientations `(C₂ᵢ,C₂ᵢ₊₁)` and `(C₂ᵢ₊₁,C₂ᵢ)`. The physical p55 has **76 runes**, so its complete page gives exactly 38 pairs. The first p55 rune continues a word from p54, yielding a second source-visible clock: leave that carry rune unchanged, take 37 pairs from the remaining 75 runes, and leave one terminal rune unchanged. For an independent full even-size page, test the original **238-rune p36** with 119 pairs. Finally apply the same four whole-page-reset operations across the full **12,956-rune** unknown corpus, without inserting nonexistent symbols or altering the source whitespace.

The single-file CommonJS test asserts **841/841 exact field-element inversions**, recovers **95/95** runes of an independently encrypted known p57 plant, and checks exact reciphering of every original output.

## Original-cipher outcome

| Exact source-cipher target | Complete tested candidates | Original GP29 IoC | Decoded IoC range | Distinct result |
| --- | ---: | ---: | ---: | --- |
| p55, carry included or skipped | 8 | 0.037894737 | **0.031228070–0.038245614** | None contains a coherent native-GP sentence or source-selected onion address |
| p36, complete 238-runic page | 4 | 0.035989079 | **0.032266071–0.033613445** | None yields a source-readable plaintext register |
| All 55 rune-bearing p0–55 pages, reset per page | 4 | 0.034478398 | **0.034446762–0.034479756** | All four remain indistinguishable from flat source-rune marginals by global IoC |

For example, direct p55 coordinate-order inverse `x^541` starts `HRJEDEOEOSIAOJLAEJTFTHCOGOENRBEAFMYMULDSXWIIAOTSCF` and has IoC **0.031228070**. Reversing coordinate order instead begins `NGAEJEAEHIAEOOIENWBGFYWYDOENGJAEFYTHXTCPSX`, IoC **0.034035088**. The highest p55 decoded IoC (**0.038245614**) belongs to the p54-carry-skipped forward power with reversed pair coordinates; it begins `NGLNGEOLSBBNGXBNLTHAEFELMAEAAEGMRFNGIATH`, without a deciphered phrase.

The full-corpus result is stronger than isolated 76-rune anecdotal fluctuations: all 12,956 transformed original runes remain nearly uniform, whereas a directly recovered GP-native English message would require a marked linguistic register. The field mapping produces more repeated adjacent runes (218–259 versus 86 original within the concatenated pages), illustrating how the map changes the anti-repeat fingerprint, without explaining or decoding that fingerprint.

## Decision and independent reproduction

The literal **3301 field-power** candidate with fixed original GP pair orientation is **retired** for original plaintext recovery. The source factorization itself remains independently exact; this negative does not undermine it. It also leaves open more complex field representations with a separately authenticated selector, including a field-key schedule, different pair clock, or non-English register. Those extra choices must arise from a genuine source clue before further parameterized work.

Run [the source-exact CommonJS SFT](../sims/lp2_2013_base29_3301_gf841_direct_power_sft.cjs) with Node.js 22. It consumes only the canonical LP2 corpus, verifies full inverses and all reported original candidates, and prints every output prefix and statistic. The **completed [manual-only CI run 43596895846](https://github.com/FlareZ123/liber-primus/actions/runs/43596895846)** passed the new step alongside Agent4's older source probes. The prior independent [2013 DH exponent-class-11 field test](lp2-2013-base29-dh11-field-power-gate.md) covered a different power exponent and is not repurposed as evidence for the literal 3301 test.
