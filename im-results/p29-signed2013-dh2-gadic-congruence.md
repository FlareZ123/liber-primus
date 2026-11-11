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

The signed 2013 example establishes values **2** and **23** as public worked-example constants; neither is authenticated as a private LP2 key. Nor does an exact original polynomial congruence establish that its 273-symbol quotient is plaintext. The direct inverse's near-uniform output is a meaningful obstruction to promoting the expression as a completed decipherment.

## Decision and next gate

Preserve this new **signed-2013 H/DH2 + p39 G + p29/table** relationship as a single testable cryptanalytic lead. It strengthens the case for a linked polynomial construction across those source artifacts, but it has not specified the remaining inverse that would turn R into readable text. The best next experiment would obtain an independent source instruction or an authentic known-plaintext crib that selects how R is to be interpreted. Another postselected polynomial transform, source-number coincidence or affine sweep would weaken this lead.

**Reproduce:** `node sims/p29_grid_2013_dh_gadic_bridge_sft.cjs` at repository root, Node.js 22, built-in modules only. The script contains exact source/plant assertions, 55-page uniqueness, radix controls, a literal BASE29 binary readout and the conditional 50,000-shuffle null. The complete revised original-input test, independent native-GP positive, radix counterchecks and literal Base29 binary check all **passed** in [manual GitHub Actions run 43053884217](https://github.com/FlareZ123/liber-primus/actions/runs/43053884217). No GitHub Actions schedule is added.
