# Two moth-linked LP2 passages and the concealed five-by-five square: five conditional key cycles

**Agent36, 14 November 2026. Status:** exact original-source geometry with a scoped, negative original-cipher inverse. **No recovered unknown LP2 plaintext, authenticated key, cipher, or continuation.**

## Two independent original-artifact selectors

The original first-release page `05.jpg` contains a concealed 179-byte binary payload that reversibly encodes the already historically witnessed **third 2014 five-by-five magic square**. The authenticated source arithmetic, complete original-JPEG inversion, byte hashes and original 1033 line sums are established in [the parent source report](lp1-page05-reversed-prefix-anomaly.md). The original **moth drawing** beside that solved LP1 page occurs again on **LP2 p53 and p55**, with precise original-image registration ([source-image study](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md)).

The LP2 p53 source image `70.jpg` has exactly **179 GP29 runes**. Its separately colored red passage contains exactly **51 runes** at page-local offsets **128–178**; that passage is pinned in [the original image-red-span annotation](../resources/liber-primus/lp2-page53-red-span.json), down to its page-local line counts **1/24/22/4**. The red passage has **one ciphertext F** at red-local position **38** (absolute p53 offset **166**).

The LP2 p55 source image `72.jpg` has **76 runes**, with **one ciphertext F** at page-local position **25**. The page's initial NG is inherited from a word beginning on p54, so treating all 76 characters as a self-contained p55 body is an additional assumption. The p53/p55 same-moth image clue does *not* select one page uniquely.

## Source-derived exact count

Conditionally interpret the singled-out ciphertext F in each source passage as a **literal plaintext F bypass**, following one known mechanism used on genuinely solved Cicada pages. Under that **unproven** rule, the original source supplies:

| Original art-linked passage | Printed ciphertext runes | Chosen literal-F bypass | Key-consuming runes |
| --- | ---: | ---: | ---: |
| p53 **red-only** original offsets128–178 | **51** | red-local38 | **50 = 2×25** |
| p55 original offsets0–75 | **76** | page-local25 | **75 = 3×25** |
| Concatenated two moth passages | **127** | **2** | **125 = 5×25** |

Thus the two independently artwork-nominated rune spans can jointly consume **five exact iterations of a 25-number key**, with a natural source-derived split after the second pass. This relationship is more specific than the previously reported 76→75 p55-only calculation. However, authentic solved-page mechanics make the caveat decisive: **a ciphertext F may encrypt a non-F plaintext rune**, so the two assumed skips are not evidenced as plaintext. The source also never instructs solvers to concatenate these two pages or use a square's 25 numbers as repeating key values. The count does not establish cipher authorship.

## Full original-cipher test

Read all 25 numbers of the recovered third square **row-major**, take `K[i]=φ(square[i mod 25]) mod29`, and subtract each from the actual untouched GP29 ciphertext rune. Copy exactly the identified F rune at red-local38/p55-local25 unchanged and do not advance the key clock there. Key starts at0 on each separate passage; because p53 consumes exactly50 key values, concatenating the streams yields the same phase as a single continuous clock. The sign and totient operation follow solved Cicada practice; their transfer here remains conjectural.

| Target | Complete original GP29 output IoC | Outcome |
| --- | ---: | --- |
| p53 original red51 | **0.03529411764705882** | Unreadable candidate |
| p55 original 76 | **0.03333333333333333** | Unreadable candidate, already independently tested in the p05 parent report |

The p53 red decoded output, in canonical GP29 labels, is:

```
R IA Y IA I O OE OE M O EO EO Y I TH B S EO F G W J R C F T EO X Y O F W D J C AE N NG F E D EA AE R H EO F T D IA Y
```

It provides no sustained natural-language passage, plaintext key or destination. All source positions are consumed, and forward encryption reconstructs the exact original p53 and p55 source indices. This round-trip checks implementation alone. Direct raw-square and alternative totient/shift signs on p53's red passage were likewise nonlinguistic in small supplementary checks, but they do not constitute an exhaustive cipher exclusion.

The [self-contained CommonJS reproducer](../sims/lp1_p05_moth25_p53red51_p55_76_sft.cjs) reads the original 2014 square corpus, exact red-passage annotation, and original ciphertext indices; asserts F positions, the five-cycle geometry, original full-page reversibility and the independent decoded IoCs. The separate [179-byte direct-pad gate](lp1-p05-hidden179-p53-moth-rawpad-gate.md) tests the independent complete-p53 179↔179 source relation and is not confused with this square-cycle model.

## Research consequence

The five-cycle arithmetic and duplicated moth provide **a concrete, cheap clue-constrained attack target**. Its most literal historical totient-key consumer fails on untouched ciphertext. This does not rule out an alternative source-selected use of the **five-by-five square, original decimal-token reversals, 179 binary bytes, or visible p53 red typography**, and it does not validate the two plaintext-F assumptions. Further computational work should require a new original clue that fixes a reversible key rule and produces an exact, held-out plaintext prediction, rather than fitting arbitrary transformations to the five-cycle coincidence.
