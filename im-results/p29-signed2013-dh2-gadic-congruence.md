# Signed-2013 DH2 congruence between LP2 p29 and the numerical table

**Agent 11, 11 November 2026. Evidence class: exact original-source GF(29) arithmetic with a native-GP decoding plant and conditional randomization. This discovers a previously unreported cross-artifact congruence. It does not recover unknown plaintext, an authenticated cipher or a destination. The connection to the creator's intended route remains a hypothesis.**

## What independently printed material selects

The [GPG-verified 2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md) specifies **BASE29 3301 → 3QO** and a worked **DH modulus 23** exchange whose **shared secret is 2**. These are two separate example operations within the same authenticated signed instruction. Reading the three BASE29 digits **3,26,24** as coefficients of successively increasing polynomial degree yields the candidate polynomial below. The historical signed message supplies those digits, while **their interpretation as polynomial coefficients is an additional modeling choice**:

```text
H(X) = 24X² + 26X + 3.
```

Physical LP2 **p39** visibly marks the red triple [27,5,15], independently defining

```text
G(X) = 15X² + 5X + 27 = 15(X−24)² (mod 29).
```

The conspicuously enlarged GP-Ac on p54 independently has index 24. Define **P(X)** from the 277 original p29 rune indices in published order (highest coefficient first), and **S(X)** from the 256 source-transcribed table bytes on pp49–51, in original row-major **base60** order, reduced modulo29.

Earlier investigations already established that **P is divisible by G**, **S is divisible by H·G**, and the two quotients have lengths **275 and 252**, respectively, giving the 23-symbol gap. See the [p29-G original quotient](lp2-p29-g-original-quotient.md), the [H/G grid code](lp2-hg256-allsecret-original-clock.md) and the [bounded 23-length gate](p29-g-p50-f-23-bridge-negative.md). None of those results reported or tested the congruence below.

## New exact relation

Direct polynomial division of the two **unchanged** original artifacts gives

```text
H · G = 12X⁴ + 17X³ + 11X² + 21X + 23  (mod 29)
G²    = 22X⁴ +  5X³ + 23X² +  9X +  4  (mod 29)

P mod G       = 0
S mod (H · G) = 0

(P − S) mod G² = X² + 10X + 25 = 2G.
```

Equivalently, **there is an exact 273-symbol polynomial R** satisfying

```text
P(X) = S(X) + 2G(X) + G(X)² R(X)     over GF(29).
```

A second useful form divides out G once. With `Q29=P/G` (275 symbols) and `Q50=S/(H G)` (252 symbols):

```text
Q29 − H·Q50 ≡ 2  (mod G).
```

Thus the original printed p29/table material and the **2013 signed DH worked-example secret 2** meet in an exact field congruence, while the **same signed DH example's modulus 23** matches the already-known quotient-length gap. The 2013 H and the p39 G enter the actual algebra, so the 2 and 23 relationship is more constrained than an isolated length coincidence.

**The numerical agreement is exact. Its explanation as a deliberate 2013-to-LP2 pointer is provisional.** There is no surviving instruction telling a solver to use p29, subtract the numerical table from its rune polynomial or lift their shared factor modulo G². P29 was originally selected only *after* scanning all pages for G divisibility. The signed DH values became potential explanations after this algebraic relationship was discovered. The combined discovery process prevents treating a small fixed-model null probability as proof of authorial design.

## Additional signed-DH fingerprint at the source-selected Ac24 root

The exact polynomial relationship supports a more specific, still **exploratory** fingerprint of the entire signed 2013 worked example. Its parameters are modulus **23**, generator/base **5**, server public share **8**, client public share **19**, and shared secret **2**. The enlarged LP2 p54 **Ac=24** and G's double root independently fix the evaluation point before viewing numerical outputs. Ordinary formal polynomial derivatives, evaluated at X=24 in GP29, give:

| Source and operation | Exact value mod29 | Possible link to signed 2013 DH |
| --- | ---: | --- |
| p39 G's linear coefficient | **5** | DH base 5 |
| H·G's constant coefficient | **23** | DH modulus 23 |
| Grid S(24), S'(24) | **0, 0** | The marked G double root |
| Original grid S''(24) | **23** | DH modulus 23 |
| Original p29 P''(24) | **25** | Grid second derivative + shared secret 2 |
| Both P'''(24) and S'''(24) | **7** | 8×19 ≡ 7 (mod29), product of both DH public shares |
| Fourth derivatives P''''(24), S''''(24) | **20, 23** | No obvious natural continuation of the DH example |

Therefore the entire first four derivative vectors are

```text
order k               0    1    2    3
P29^(k)(24)            0    0   25    7
S^(k)(24)              0    0   23    7
P29^(k)(24)-S^(k)(24)  0    0    2    0
```

The second-derivative difference2 and third-derivative equality are **already mathematically implied by the earlier G² congruence**: they must never be counted as independent confirmations. The p39 linear coefficient5 is a direct source value, and the constant23 of H·G is forced by the selected H and G. Of the additional derivatives, S''(24)=23 and P'''(24)=7 are genuine original-source measurements not forced by those first-order roots alone. However identifying **7 as 8×19 mod29** is a post-selected interpretation; the historical DH multiplication is performed under **modulus23**, not modulo29. The original manuscript has no authenticated command to multiply the two public shares in its GP29 field.

This fingerprint gives a concrete candidate for a historical human solve-path test: the 2013 worked-example parameters could guide an operation on the source-marked GP29 polynomials. The current experiment determines no new secret from the public DH example. Testing derivative orders4–6 reveals no continuing signed-example sequence. Future work should require a source-visible reason to apply the second- and third-derivative readings, or a correct **withheld original plaintext prediction**, before inferring design.

## Independent original checks and necessary controls

The [CommonJS source-native test](../sims/p29_grid_2013_dh_gadic_bridge_sft.cjs) verifies the entire polynomial identity from canonical source input, recreates each quotient, and re-encodes every one of the **277** original p29 source symbols without alteration. Among the **55 rune-bearing unknown pages**, physical p29 is the **only one** satisfying the fixed `(P_page−S) mod G² = 2G` equation. The source-visible byte ordering matters: under the competing omitted-lowercase-f radix59 reading, the four-coefficient remainder is **[17,13,3,26]** instead of **[0,1,10,25]**; reversing the base60 table gives **[5,7,10,20]**.

A matched conditional randomization permutes the original **275 GP29 coefficients of Q29** while preserving their exact histogram, then mathematically multiplies by G. Every control is therefore as G-divisible as the original p29. The unchanged original H, G, DH=2 and 256-byte table are reused. Under **50,000** deterministic seeded shuffles, **60** satisfy the same full congruence, add-one frequency **61/50001 ≈ 0.001220**. This is consistent with the expected `1/29²` for two independent residue coefficients under an ideal uniform model. It calibrates the *fixed* test conditionally and **does not** correct for discovering the relation, the p29 selector or other hypotheses elsewhere in the project.

## Does this actually decipher p29?

The identity defines an explicit proposed source-known **decoder**:

```text
R = (P − S − 2G) / G²  in GF(29)[X].
```

The exact 273 GP-index coefficients of R have IoC **0.033801982331394094**, close to uniform `1/29`, and its original-order transliteration begins:

```text
HMIUDAIANGSCAEOEONORSNGEOBGIOEJDIYSGLNAEYNNGUHCNGTCMOENGCRCWNNNGTHPENISOESEOWBODSILOENGJNI
```

No coherent native-GP English is recovered. The separately source-motivated **2013 BASE29 integer interpretation** of all 273 coefficients yields a minimal **166-byte** big-endian buffer beginning `166a370a936ebaf8dc6c0cdc798dee98`; **52/166** bytes are printable ASCII, and no recognizable unencrypted file header appears. This does not support a direct Base29 binary payload.

A separate positive uses 273 authentic solved-p57 GP symbols as an input R, encrypts them as `P'=S+2G+G²R` and inverts that ciphertext, recovering **273/273** exact symbols. A one-glyph original-cipher mutation breaks the congruence. This proves the algebraic inverse works under the constructed source-motivated encoder, while leaving its historical status undecided.

### Direct equal-length framed-page key test

The **273 coefficients** of R happen to match the complete original rune lengths of physical **p41 and p44**, both members of the eight framed text pages preceding the numerical table. This is an additional *exploratory* source geometry, since those pages are near 273 runes by their similar typesetting and the manuscript does not say to use R as a key. Apply the sole fixed phase (both source streams start at their first rune), with the simplest candidate reversible GP29 additive pad `Pᵢ=Cᵢ±Rᵢ (mod29)`:

| Physical framed page | Printed raw IoC | Subtract R IoC | Add R IoC |
| --- | ---: | ---: | ---: |
| p41, 273 runes | 0.033128636 | 0.033371041 | 0.033801982 |
| p44, 273 runes | 0.034529196 | 0.035471881 | 0.034609998 |

All four fixed original plaintext candidates remain near `1/29`, with no native-language recovery. The code checks the complete original re-encoding under both signs, which verifies arithmetic and is not authentication. A direct one-to-one pad use of R for these natural exact-length targets is therefore unproductive; no further phase or nonlinear operation is selected by this length coincidence.

The signed 2013 example establishes values **2** and **23** as public worked-example constants; neither is authenticated as a private LP2 key. Nor does an exact original polynomial congruence establish that its 273-symbol quotient is plaintext. The direct inverse's near-uniform output is a meaningful obstruction to promoting the expression as a completed decipherment.

## Decision and next gate

Preserve this new **signed-2013 H/DH2 + p39 G + p29/table** relationship as a single testable cryptanalytic lead. The derivative fingerprint also suggests a possible signed-DH mathematical clue, with serious post-selection ambiguity. Neither the congruence nor the derivatives specify the remaining inverse that would turn R into readable text. The best next experiment would obtain an independent source instruction or an authentic known-plaintext crib that selects how R is to be interpreted. Another postselected polynomial transform, source-number coincidence or affine sweep would weaken this lead.

**Reproduce:** `node sims/p29_grid_2013_dh_gadic_bridge_sft.cjs` at repository root, Node.js 22, built-in modules only. The script contains exact source/plant assertions, 55-page uniqueness, radix controls, a literal BASE29 binary readout and the conditional 50,000-shuffle null. The original-input test, native-GP positive, radix counterchecks and literal Base29 binary check all **passed** in [manual GitHub Actions run 43053884217](https://github.com/FlareZ123/liber-primus/actions/runs/43053884217). The expanded signed-DH derivative assertions were added afterward and require the next manual regression to independently confirm their values. No GitHub Actions schedule is added.
