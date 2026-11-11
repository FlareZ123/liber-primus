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

## A second, independent H-field channel: source quotient product recovers a DH-shaped minimal polynomial

**This is an additional exact original-input result, with a crucial model-selection qualification.** Unlike the G-adic residue2 above, it uses the separate **irreducible quadratic H** extracted from the signed 2013 BASE29 example. In GF29, the polynomial H=24X²+26X+3 is equivalent to the monic irreducible `X²+18X+11`; its discriminant19 is a nonsquare. Consequently `E=GF(29)[X]/(H)` is a genuine **841-element field**, with ordinary field multiplication, trace and norm to GF29.

Remove the independently source-supported factors once, then reduce each original quotient modulo H:

```text
A = (P29/G) mod H      = 19X+16
B = (S/(H·G)) mod H    =  6X+ 5
A·B mod H             = 24X+15
```

These are direct exact remainders from the unmodified original 277-rune p29 polynomial and the 256 printed numeric-table values. The **field norm and trace**, defined by multiplying each element by its Frobenius conjugate and adding the conjugates respectively, give

| Field element | Trace in GF29 | Norm in GF29 |
| --- | ---: | ---: |
| A = 19X+16 | **9** | **2** |
| B = 6X+5 | **18** | **26** |
| AB = 24X+15 | **4** | **23** |

The product's coefficients **24,15** equal the independently marked G double-root index24 and its leading coefficient15. For the product `β=AB`, the exact minimal polynomial is

```text
β² − 4β + 23 = 0  in E.
Tr(β)=4=2×2,  N(β)=23.
```

This produces **both the signed DH worked example's shared secret2 (half the trace)** and **its modulus23 (the norm)** by the same standard field operation. Furthermore `N(A)=2` directly reproduces the shared secret; `N(B)=26=−3 mod29`, where 3 is the first source BASE29 digit of 3QO; and `N(β−2)=19` reproduces the example's client public share19. The full signed example also has base5 and server share8; the H-field coefficients `[19,16]` and `[6,5]` admit the retrospective numerical readings `16=2×8` and `6=8−2`. These last arithmetic decompositions do not independently identify a coding rule.

**Independence and scope:** Because H is relatively prime to G, the H-field residue of `P29/G` is not fixed by the prior equation `P29/G−H·S/(HG)≡2 (mod G)`. The fresh H-field identities therefore supply a distinct exact original-data constraint. However, **the choice to multiply A and B was conceived after examining this source family**, the reversal of BASE29 digits into H is a modeling choice, and all numerical interpretations were selected retrospectively. The field algebra establishes that these outputs exist; no historical source yet directs a player to multiply these residues, compute their norm, or interpret the result as a decryption key.

A concrete next step is to identify an original visual or signed-language clue that selects `A`, `B`, and their **field product** in a way that would have been available to a contemporary solver, then make a frozen plaintext prediction. More arithmetic matches to signed values without a selected inverse should be treated as conjectural. The joint H-field and G-adic correspondences raise the relevance of this finite-field branch but still recover **zero unknown LP2 plaintext**.

### Executable H-field DH-power inverse gate

The signed 2013 challenge discusses Diffie–Hellman, motivating one bounded repeated-multiplication operation on the new original-derived `β=24X+15`, whose exact multiplicative order in GF(29²) is **70**. The residual R contains **273 runes = 136 GP29 pairs + one unmatched rune**. Interpret each source-order pair as `aX+b` over H's 841-element field, leave the unmatched original rune unchanged at the first or last boundary, and apply `β^{±(j+s)}` to pair `j` for `s=0` or `1`.

These **eight fixed variants** comprise two boundary placements, two signs and two natural initial exponents, without fitted outer permutations, key phases or language scores. The original residual has IoC **0.033801982**. The original outputs' IoCs range **0.032859298 to 0.034690799**, with no coherent native-GP English. The standalone test re-encodes every original source symbol and recovers complete source-native solved-p57 GP positive plants for every model. The specified direct DH-power interpretation does not decipher original LP2. No authentic source selects further phases or encodings.

## Literal finite-field Diffie–Hellman shared-key candidate (Agent 17, 11 November 2026)

**New bounded original-cipher negative; no LP2 plaintext or authenticated key.** The 2013 signed challenge explicitly demonstrates Diffie–Hellman. A more literal, previously untested field operation on the two existing source-derived H-field residues is to interpret them as *public shares*, instead of merely multiplying the residues. Use the polynomial class \(g=X\) as generator in \(E=GF(29)[X]/(H)\), where it has order **840**. With the already established \(A=19X+16\) and \(B=6X+5\), exhaustive discrete logarithms in this small field give

\[
a=\log_g(A)=261,\quad b=\log_g(B)=423,\quad
K=A^b=B^a=g^{ab}=7X+1.
\]

This is an exact source-derived candidate shared value, with multiplicative order **280**, and requires **no guessed exponents**. However, assigning the p29 and table residues to the two DH participants, choosing \(g=X\), and transferring the historical protocol into \(GF(29^2)\) are all **unproven interpretation choices**; the actual 2013 worked example operates modulo 23.

A frozen minimal cipher consumer interprets consecutive original GP29 rune pairs as \(aX+b\) and **divides by \(K\)** in the same field, with the entire book paired from its first rune and no fitted phase, substitution or orientation. Exact original outcomes:

| Original input | Rune count | Unchanged IoC | Divided by \(K\) IoC |
| --- | ---: | ---: | ---: |
| All unsolved LP2 runes, original global order | 12,956 | **0.0344783979** | **0.0345156108** |
| Physical p55, local pair order | 76 | **0.0378947368** | **0.0322807018** |
| Exact \(R=(P-S-2G)/G^2\), consecutive pairs, final unmatched rune unchanged | 273 | **0.0338019823** | **0.0342598578** |

The residual also fails a literal DH *progressive-power* inverse \(R_j/K^{j+1}\): IoC **0.0341251885**. All outputs remain nonlinguistic under the source's native GP29 transliteration. The exact candidate field arithmetic satisfies both DH public-share equations. Independent source-native solved-p57 plaintext plants are recovered **12,956/12,956** full-book and **273/273** residual runes under the inverse and reencryption, including the progressive-power variant. A static field secret and its simplest repeat/power consumers do not explain the original ciphertext; this does not rule out another authentic use of the same value.

**Reproduce:** [single-file CommonJS original-corpus test](../sims/p29_hfield_dh_shared_key_sft.cjs). Do not expand arbitrary DH bases, phases, secret-sharing interpretations or key derivations without an independent original instruction selecting them.

### Source-defined p33 cuneiform body: local pair-consumer gate (negative)

The source-defined cuneiform body runs from p33 local rune 91 through p39 local rune 118 inclusive: **1,468 runes / 734 pairs**. It begins at global rune offset **8,051**, which is odd. Consequently, pairing from the beginning of the whole book does not pair the first body rune with the second body rune; resetting pair boundaries at the marked cuneiform-unit start is a distinct, source-local alignment. The boundary is independently recorded in the [2013 NEXT/cuneiform section analysis](2013-next-chain-p33-39-gate.md).

Using the already-derived candidate `K=7X+1` from the p29/p50 H-field relation above, I tested exactly four source-local consumers. Consecutive body runes are interpreted in printed order as `aX+b` in `GF(29)[X]/(X²+18X+11)`: static multiplication by `K`, static multiplication by `K⁻¹`, progressive multiplication by `K^(j+1)`, and progressive multiplication by `K^−(j+1)`. No pair reversal, alternate phase, extra state, or new field element was searched.

| Fixed body-local operation | IoC | GP trigram nats/rune |
|---|---:|---:|
| static `K` | 0.03497285 | −11.77881 |
| static `K⁻¹` | 0.03474904 | −11.89480 |
| progressive `K^(j+1)` | 0.03415653 | −11.91461 |
| progressive `K^−(j+1)` | 0.03459209 | −11.83657 |

The unchanged body scores IoC **0.03431255** and −11.83876 nats/rune. Across **2,126** native Gibran windows of the same 1,468-rune length, the minimum trigram score is **−8.30153**, the 10th percentile **−8.09781**, and the median **−7.98352**. None of the four outputs enters the native range. All four original-input inverses re-encrypt exactly, and all four independently planted native-GP plaintext controls recover exactly.

**Decision:** retire these four static/progressive body-local pair consumers of the provisional `K` candidate. This closes the previously untested odd-offset, section-reset pairing; it does not invalidate the exact H-field arithmetic or prove that `K` is an intended LP2 key. Do not expand to alternate pair orientations or phases without an original-source selector. [Reproducer](../sims/p33_cuneiform_hfield_dh_shared_key_sft.cjs).

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

The one natural cross-check against the original p56 SHA-512 target is also negative: hashing those exact 166 bytes gives `f065b5e900b135cd91971e7c49d15ab7b411779795242def18a7c6d4db3414ea260a04f54e63918f2ce82a025904af6716a8770c695538f2dfc76d5565bf2cc5`, not the 128-hex digest printed on original p56 (`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`). Thus the canonical big-endian BASE29 bytes of R are not a direct preimage of the p56 digest. No alternate byte order, padding or encoding was searched.

A separate positive uses 273 authentic solved-p57 GP symbols as an input R, encrypts them as `P'=S+2G+G²R` and inverts that ciphertext, recovering **273/273** exact symbols. A one-glyph original-cipher mutation breaks the congruence. This proves the algebraic inverse works under the constructed source-motivated encoder, while leaving its historical status undecided.

### Direct equal-length framed-page key test

The **273 coefficients** of R happen to match the complete original rune lengths of physical **p41 and p44**, both members of the eight framed text pages preceding the numerical table. This is an additional *exploratory* source geometry, since those pages are near 273 runes by their similar typesetting and the manuscript does not say to use R as a key. Apply the sole fixed phase (both source streams start at their first rune), with the simplest candidate reversible GP29 additive pad `Pᵢ=Cᵢ±Rᵢ (mod29)`:

| Physical framed page | Printed raw IoC | Subtract R IoC | Add R IoC |
| --- | ---: | ---: | ---: |
| p41, 273 runes | 0.033128636 | 0.033371041 | 0.033801982 |
| p44, 273 runes | 0.034529196 | 0.035471881 | 0.034609998 |

All four fixed original plaintext candidates remain near `1/29`, with no native-language recovery. The code checks the complete original re-encoding under both signs, which verifies arithmetic and is not authentication. A direct one-to-one pad use of R for these natural exact-length targets is therefore unproductive; no further phase or nonlinear operation is selected by this length coincidence.

The signed 2013 example establishes values **2** and **23** as public worked-example constants; neither is authenticated as a private LP2 key. Nor does an exact original polynomial congruence establish that its 273-symbol quotient is plaintext. The direct inverse's near-uniform output is a meaningful obstruction to promoting the expression as a completed decipherment.

## Source-first decision: exact arithmetic lacks an intended operation

The 2013 [authenticated TCP protocol](../resources/external/2013-tcp-server-signed-source.md) only specifies decimal-to-BASE29 conversion, a *worked participant-server* DH example modulo23, and server commands. It never says to treat the BASE29 digit sequence as a formal polynomial over GP29, apply polynomial derivatives, or copy the test DH shared value 2 to the following year's manuscript. In the historical protocol the server selects its own DH base and exponent per request; the worked example's known number2 is therefore **not secret key material**.

Original physical LP2 **p29** ([original scan 46.jpg](../resources/liber-primus/46.jpg)) is an unillustrated block of ordinary black ciphertext: there is no distinctive red heading, numeric margin, endpoint or source-visible instruction that selects this page for pairing with the remote p50 numerical table. The original p39 three-rune red marking and p54 enlarged GP-Ac are real visual features, but there is no connecting pointer or instruction to treat the former as quadratic G, select the latter as a derivative evaluation point or compare against p29. P29 was initially discovered **after scanning all 55 rune-bearing pages for G-divisibility**, and the DH2 residue match was subsequently recognized by model-fitting. Its fixed-condition shuffle p≈0.00122 excludes neither that selection bias nor alternative mathematical representations.

**Disposition of Director Issue #306:** preserve (P=S+2G+G^2R), the irreducible H-field arithmetic and all original negative inverse controls as exact *intermediate* mathematics. The source audit finds no player-visible rule selecting the page, coefficient order, G-adic lifting, H-field multiplication, derivative order or a complete reversible consumer of R. The direct R, BASE29, additive, GF841 and DH-power decoders already recover no unknown plaintext. **Do not commission additional dependent G-adic decoders** until an independently dated original instruction or a frozen withheld original-plaintext prediction changes this source gate. Re-exploring other roots or encodings to recreate the signed demonstration values would be post-selection.

**Reproduce:** `node sims/p29_grid_2013_dh_gadic_bridge_sft.cjs` at repository root, Node.js 22, built-in modules only. The script contains exact source/plant assertions, 55-page uniqueness, radix controls, a literal BASE29 binary readout and the conditional 50,000-shuffle null. The original-input test, native-GP positive, radix counterchecks and literal Base29 binary check all **passed** in [manual GitHub Actions run 43053884217](https://github.com/FlareZ123/liber-primus/actions/runs/43053884217). The expanded signed-DH derivative assertions were added afterward and require the next manual regression to independently confirm their values. No GitHub Actions schedule is added.
