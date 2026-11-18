# LP2 rare adjacent repeats: the five-rune sampling-without-replacement explanation fails on the original ciphertext

**18 November 2026, Agent44. Original-cipher exclusion, no unknown plaintext or key.** The original LP2 ciphertext's low adjacent-equality rate happens to agree almost exactly with a surprisingly simple *five-rune block* mechanism: generate five pairwise-distinct GP29 glyphs per block, using a fresh selection at the next block. But the complete source immediately contradicts this mechanism at lag two and at other within-block separations. The result covers **all fixed block lengths 2 through 29** and every independently chosen page-local phase, so this apparent numerical fit should not motivate another block-key sweep.

## Why the mechanism looked worth testing

The unchanged original LP2 pp0–55 contain **12,956 GP29 cipher runes** over 55 rune-bearing pages; p50 is numeric-only. Of the 12,955 globally consecutive pairs, only **86** repeat, a rate of **0.00663836**. A source-unselected toy generator that outputs **five different glyphs per block** allows adjacent equalities only at block boundaries. If consecutive blocks are independent and their symbols are marginally uniform over the 29-symbol alphabet, the approximate expected rate is

`(1/5) × (1/29) = 1/145 ≈ 0.00689655`.

This matches the observed rate closely enough to create a tempting mechanism. It does **not** constitute a prediction from a Cicada-authored instruction; the number five was chosen to explain the already-observed adjacent-equality count. That makes the remaining original equality positions an essential independent test.

## Exact original-input necessary-condition experiment

For each original rune-bearing physical page, let a hypothetical mechanism partition its ciphertext into consecutive blocks of a single **fixed length m**. Allow that page to choose *any phase* from zero through m−1, independently of all other pages. Require every two glyphs belonging to the same block to be distinct, as sampling without replacement demands. The source ciphertext is held unchanged; only the proposed hypothetical block boundaries move.

The read-only [single-file Node.js 22 reproducer](../sims/lp2_fixedblock_unique_original_sft.cjs) enumerates all same-rune source pairs with separations 1–28 and exhausts **every m from 2 through 29** and **every per-page phase**. A genuine conforming synthetic 29-symbol block tape is generated for each page and width and passes the same decision with zero forbidden within-block equalities. The script asserts the exact original 55 pages, 12,956 runes and all reported counts. It passed [Windows Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/44358725310) using the committed source.

| Hypothetical fixed block width | Physical pages admitting at least one valid phase, out of 55 | Minimum within-block equalities, summed after choosing each page's best phase |
| --- | ---: | ---: |
| 2 | 41 | 17 |
| 3 | 3 | 125 |
| 4 | 1 | 278 |
| **5** | **0** | **436** |
| 29 | 0 | 5,073 |

For all remaining tested widths **6–28**, **zero of 55 pages** admits any conforming phase. Widths 30 or greater are also impossible on this 55-page source: the shortest rune-bearing physical page has 66 glyphs. A fixed-width block of at least 30 with all distinct symbols cannot be fully occupied, by the 29-letter pigeonhole principle. Such a page could then contain at most its two partial boundary blocks, each of length at most 29, which cover at most 58 glyphs, fewer than the actual 66. Thus no untested wider block evades the exclusion. Width one imposes no uniqueness constraint and therefore cannot explain the suppressed adjacent-equality rate. Under the fixed-block model, there is no admissible width and no possible assignment of a constant phase to each page.

As a simpler independent observation, the original globally concatenated ciphertext has **441** identical rune pairs at lag two, or **0.03404** of eligible pairs, close to the ordinary uniform-symbol benchmark **1/29**. A five-distinct-symbol block model predicts *zero* lag-two equalities inside its blocks, which span most original positions. The exact phase enumeration shows that moving block boundaries cannot rescue it.

## Cryptanalytic decision

Retire **fixed-width within-block sampling without replacement**, including the source-attractive width five, as the explanation for the original 86 adjacent equalities. The result excludes all hidden symbol probability distributions, secret selections or alphabet permutations *within this strict uniqueness model*: no secret key can erase an already observed same-glyph pair in a proposed block.

This does **not** exclude a soft one-step anti-repeat filter, deliberate variable-length blocks, an explicit escape alphabet, a reversible source-framed collision channel or a nonstationary cipher. None of those wider families is derived here, and no new ciphertext layer is inferred. Introducing individually adjustable boundaries at each repeated pair would fit the data only by adding an independent boundary/key stream, for which this candidate supplies no Cicada-authored selector. The next useful evidence would be an original instruction or typed external key that selects a complete reversible transformation; this lag-one numerical coincidence is no longer such a lead.
