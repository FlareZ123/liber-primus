# LP2 opening red heading: prime-count navigation to the tree map and numerical page

**Status (Agent 25, 13 November 2026): a new, source-exact candidate navigation rule. It does not recover unknown plaintext or authenticate a decryption.** The source labels and arithmetic identify a concrete p0-to-p32/p50 route, but the operations were recognized retrospectively and no manuscript instruction explicitly selects them. The simplest p32-ring-key decoder of the independently marked p33 body is negative.

## Original visible input, and the operation under consideration

Physical LP2 p0 starts with **13 red runes in two printed words of 8 and 5 rune glyphs**, followed by its red 13-dot stop. Encode those original runes using the published Gematria Primus **prime weights**, not the 0–28 rune indices. The first red word sums to **347**, the second to **315**. These exact source quantities were previously recorded in [the red-word analysis](red-prime-totient-crosslink.md) and [the opening-selector report](lp2-p0-27x27-opening-selector.md); the following *difference plus prime-count* interpretation is a separate provisional proposal.

The two-word sum and difference are:

- `347 − 315 = 32`, directly selecting **physical p32** if the difference is a page number.
- `347 + 315 = 662`, and the ordinary prime-counting function `π(662) = 121`; physical **p32 contains exactly 121 original runes**. Equivalently `662 = p_121 + 1 = 661 + 1`.
- Their arithmetic mean is **331**, the authenticated 2014 Onion7 **7×7 magic-square center** already recognized in prior research. Additionally, `331 = p_67`, so its one-based prime ordinal is **67**: source image **67.jpg** is the exceptional **rune-free physical p50**, in the three-page **256-byte base-60 numerical table**. Source archive indices are `17 + LP2 physical page`.
- The separate counts `π(315)=65` and `π(347)=69` bracket image number **67** symmetrically. These are dependent calculations on the same two words, not extra statistical confirmations.
- The two original red **word lengths** give `8 × 5 = 40`. The **11×11** page32 square has exactly **40 outer-ring cells** and **81 interior cells**. Physical **p33 has an original 13-dot/red-heading-bounded 81-rune body** at page-local rune offsets [10,91). This supplies a concrete candidate boundary-to-interior transfer rather than a fitted phrase.

There is an independent, previously established historical clue for the proposed destination: the signed **2016 563×569 tree image** repeats the p32 tree illustration. Its width and height exactly match the **top-row (563) and left-column (569) GP-prime sums** of original p32 under the natural 11×11 row-major arrangement. See [the tree image and source axis report](lp2-tree121-signed2016-source-gate.md). The current link only supplies an *additional possible origin at the first red heading*; it does not upgrade that image linkage to a cipher key.

## Finite original-corpus selector comparison

The [CommonJS SFT](../sims/lp2_p0_red_primecount_p32_p50_map_sft.cjs) traverses all **2,896 original printed GP words**, including words continuing across physical page breaks, and checks all **2,895 adjacent word pairs**. For each pair with prime-weight sums `a,b`, define a target page `d=|a−b|` where `0≤d≤55`. The proposed selector accepts the pair only when **`π(a+b)` equals that actual page's rune count**.

There are exactly **three** matches:

| Source | Word ordinal (zero-based) | Prime sums | Target page | `π(total)` and page runes |
| --- | ---: | --- | ---: | ---: |
| **p0 first red two words** | **0** | **347 / 315** | **32** | **121 / 121** |
| p30, ordinary text | 1684 | 217 / 268 | 51 | 92 / 92 |
| p41, ordinary text | 2255 | 267 / 216 | 51 | 92 / 92 |

The initial red pair is the **only qualifying pair among these three at a manuscript-initial red heading**. The other two demonstrate that the numeric identity can also arise elsewhere. This is a finite candidate count under a *retrospectively selected function*, **not a discovery-wide probability**. The complete result remains conditional on the author using a word-sum difference and prime counting, rather than any of many other available operations. All possible individual-page and crossing-page differences were included via the canonical 2,896-word transcript.

## Direct original-cipher consumer: 40-rune circumference → p33's 81-rune body

Test the least-flexible key interpretation suggested by the p0 lengths and the earlier p32→p33 inner-square link. Read the original **40 p32 outer-ring glyph indices clockwise**, beginning at the top-left corner, repeat this sequence unchanged as a GP29 additive key, and apply both signs to the independent **81 original p33 body glyphs** at [10,91). No shift, optimized offset, alternate traversal, secret alphabet, or extra transformation is fitted.

| Original input or explicit inverse | 81-rune IoC | Readout |
| --- | ---: | --- |
| Untouched original p33 body | 0.033024691358 | Original ciphertext |
| `p33 − repeated p32 ring` | **0.032716049383** | Nonlinguistic |
| `p33 + repeated p32 ring` | **0.029012345679** | Nonlinguistic |

Both 81-rune decoders exactly re-encrypt the actual source glyphs, confirming only invertible arithmetic. Neither produces readable plaintext; **the direct ring-as-repeating-key route is negative**. Earlier independent p32 inner9×9-to-p33 tests also failed under the direct operations they specified. Do not extend this with arbitrary ring orientation, phases or additional ciphers without a new source instruction.

## Research decision

The p0 red-heading arithmetic offers a **candidate entry point** that independently names p32 (page and rune count) and original numerical image67/p50, while its word lengths reproduce p32's outer-vs-inner 40/81 geometry. The page32 tree image and p33 81-rune body preexist this discovery and supply a potential next step, **but the navigation rule remains an unverified interpretation**. Its strongest missing input is an author-attributable instruction fixing the exact readout from the chosen p32/p50 sources. No actual ciphertext key, decryption algorithm, unknown LP2 plaintext or destination is established. Prefer discriminating source-controlled consumers of this combined p0→p32/p50 pointer to repeated exact-number coincidences.

**Reproduction:** `sims/lp2_p0_red_primecount_p32_p50_map_sft.cjs` reads only canonical checked-in GP indices, the original transcript/ink annotations and the 256-byte grid; it asserts the full-corpus selector matches and the original exact ring inverses.
