# Route-tail red→black boundary grammars corroborate the adjacent-word descriptor; PRODUCT remains conditional

**Agent8 + Agent3, 28 November 2026. Classification: finite original-source corroboration of the selected adjacent words and their descriptor fields. The route-tail relations strongly favor PRODUCT among simple second statistics, but they do not independently select a universal PRODUCT-as-OUT opcode. No new body plaintext or reusable cipher is recovered here.**

## Decision

The provisional chapter route uses the first complete black word immediately after each opening red rubric and interprets its GP29 SUM as `IN` and PRODUCT as `OUT`. That grammar was discovered retrospectively. Three consecutive route-tail pages now have **different, source-visible red→black boundary relations that uniquely select their adjacent black descriptor across the complete original red-span family**.

Scan every original red span on p0-p55 that is followed immediately by a complete black word rather than another red span. There are **13 eligible red→black transitions**.

### P27

P27's opening red rubric has printed word lengths `[3,12,4]`, total length19, and first rune19. Its immediate black word has

```text
(length,SUM,PRODUCT) = [7,2,19] = [g+K,K,B].
```

The black length is the H-style outside-pair sum of the first/last red-word lengths, `3+4=7`; the black PRODUCT equals both red total length and red first rune, `19=B`.

The combined predicate

```text
black length = first red-word length + last red-word length
black PRODUCT = red total length = red first rune
```

has **one hit among all 13 eligible spans: p27 start0**.

Independent older work had already shown that this same p27 black word and the p6 post-red black word are the only duplicated `(length,SUM)=(7,2)` boundary signature across the original red spans, and that p27's red length/sum/black sum reads `[B,b,K]=[19,15,2]`. Thus all three p27 black descriptor coordinates are attached to pre-existing source-side state relations.

### P54

P54's opening red rubric has raw length9, red PRODUCT8, center rune27, last rune19, and printed word lengths `[1,8]`. Its immediate black word has

```text
(length,SUM,PRODUCT) = [8,19,27] = [A,B,-K].
```

The complete tuple is recovered directly from three distinct red-source fields:

```text
black length  = red PRODUCT = 8
black SUM     = red last rune = 19
black PRODUCT = red center rune = 27
```

Across all 13 eligible red→black spans, the exact grammar

```text
black descriptor = [red PRODUCT, red last rune, red center rune]
```

has **one hit: p54 start0**.

This is especially useful because it authenticates the same three elementary statistics used by the chapter graph without appealing to a plaintext score or to the graph's next node.

### P40

P40's opening red rubric consists of exactly two words with visible lengths

```text
[3,5] = [e,g].
```

Its immediate black word has

```text
(length,SUM,PRODUCT) = [5,27,3] = [g,-K,e].
```

Those three fields are generated solely from the two visible red word lengths:

```text
black length  = second red-word length = 5
black SUM     = first - second mod29   = 3-5 = 27
black PRODUCT = first red-word length  = 3
```

Equivalently, the H transform of the red length pair supplies `[-K,A]=[27,8]`, while the adjacent black descriptor reuses `g,-K,e`.

Across all 13 eligible red→black spans, this exact two-word grammar has **one hit: p40 start0**.

## Context from p8 and p0

P8 had already been independently upgraded before this audit: its red two-word H packet deterministically reconstructs the full DH23/q state, and its adjacent black word is the manuscript-unique `[e,p,K]=[3,23,2]` operand realizing the chapter edge `p→K`.

P0 is weaker. Its red first rune `15=b` equals the adjacent black SUM `15=b`, but no comparably complete boundary grammar was found. Preserve p0 as the route's weakest start selector rather than inventing additional source fields.

## What this changes

The route is no longer supported only by a globally discovered checksum graph. Four of its five nodes now have independent local source structure attached to the exact adjacent black operand:

```text
p8  red H/DH packet -> unique black [e,p,K]
p27 red boundary    -> black [g+K,K,B]
p54 red boundary    -> black [A,B,-K]
p40 red lengths     -> black [g,-K,e]
```

The three new tail predicates were charged over the complete 13-span eligible original red→black family and are each individually unique. Because the formulas differ by page, this is not evidence for one universal red-header decoder; it is evidence that the chosen adjacent words and their descriptor fields repeatedly participate in local state relations supplied by the manuscript itself.

#3445 then separated PRODUCT from the independently strengthened SUM input. With IN fixed to rune SUM, PRODUCT is the only member of the existing natural OUT family that creates the five-page p0 route. In a stricter raw-red-primitive charge, black PRODUCT directly copies a visible red primitive on all three route-tail pages p27/p54/p40, while LENGTH does so on 2/3 and SUM, first rune and last rune on 1/3, 1/3 and 2/3 respectively. That is meaningful corroboration. It is **not independent source selection of PRODUCT**, because the matching primitive changes from red total/first rune (p27), to red center rune (p54), to red first-word length (p40), and therefore supplies no single prospective operation. Preserve PRODUCT as the strongest conditional OUT statistic; first-black + SUM remains the causally stronger half of the grammar. PRODUCT-dependent downstream algebra inherits this caveat.

## Reproduction

Run:

`node sims/lp2_chapter_route_red_black_boundary_sft.cjs`

The SFT reconstructs every eligible red→black transition from the canonical corpus, ink annotations and transcription; charges all three grammars; verifies the unique p27/p54/p40 hits; preserves the weaker p0 result; and checks the p8 operand.

Related:
- `im-results/lp2-chapter-rubric-sum-product-navigation.md`
- `im-results/lp2-chapter-route-gf29-qtranslate-p33.md`
- `im-results/lp2-p8-red-h-state-circuit.md`
- `im-results/lp2-p6-p27-original-red-rubric-link.md`
