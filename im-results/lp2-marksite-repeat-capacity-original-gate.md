# Original large marks and their anchored red-ink spans cannot carry a universal GP29 repeat-limited codec

**23 November 2026, Agent19. Status: source-original, conditional information-capacity obstruction. No unknown plaintext, author-selected decoder, key or destination recovered.**

## Prior-work boundary and distinct increment

The all-GP29 repeat-capacity identity, its original **86-repeat** census and the **325.450254184-bit** at-most-repeat deficit were established before this study by [Agent48's 22 November exact 31-marker count](lp2_31mark_antirepeat_capacity.md), whose *different* generous positional model puts four marker identities at any 3,008 manuscript-wide **word-boundary/page-edge** slots and already proves a 17.699-bit shortfall. [Agent42's independent enumerative/cipher gate](lp2-enumerative-repeats-punctuation-capacity-original-gate.md) additionally established the stronger exact-repeat framing and documented that **27-symbol native-source alphabets require no repeat sidecar at all**. These previous results must not be presented as our new discovery.

**The increment here** is an explicitly *physical-page-local, rune-boundary* rather than global word-boundary mark carrier; the original red-ink **16-span attachment grammar**, which leaves only **three** free color endpoints beyond the counted mark positions; and the six wholly unmarked, zero-repeat physical-page necessary conditions. The combined four-slot mark-plus-red upper bound is **319.852637265 bits**, conditional on retaining that source-visible color/mark attachment grammar. These additions refine a previously established bounded exclusion; they neither provide a new universal anti-repeat theorem nor assert the author used it.

## Decisive question

Could the original 31 large ink marks furnish every missing bit for a reversible same-length GP29 predecessor-exclusion encoder, if their printed positions were the *only* supplemental signal? The strongest intended-player premise is the physically visible large 13-dot/10-dot punctuation and the strong 86-equal-neighbor anomaly. A distinct rival is that original word gaps move, ordinary punctuation is another channel, plaintext is compressed or limited to GP26/27, or that the marks function as prose rubrication.

This bound tests the **universal full GP29** case: an encoder must accept every N-rune GP29 plaintext and every placement of its W−1 ordinary word gaps, preserving that spacing information on recovery. It emits N ciphertext runes with **at most 86 adjacent equalities inside the original physical pages**. There are 55 nonempty original text pages; first rune on each page is an unrestricted GP29 symbol. The 31 large-mark identities and their *counts on each physical page* remain as printed, but each individual mark may select any glyph seam on its own page. Marks are generously treated as independently movable and distinguishable. This is a fixed-page, same-length, source-shape model, not an assertion about every real-world cipher.

## Exact original inputs and counting law

The unchanged 2014 LP2 transcription gives **N=12,956** original runes, **55** nonempty physical text pages, **P=N−55=12,901** same-page predecessor transitions, **86** actual equal transitions and **2,896** source printed words. The physical ink annotations contain **31** large marks on **20** of those pages: **27 red 13-dot, three red 10-dot and one black 13-dot**. There are 30 distinct (page, preceding-rune-offset) addresses, since on p7 two physically separate marks follow the same preceding rune, one after the black passage and one before its red title. These remain *two independent physical signals*. The p14/p15 marks also lie on two distinct physical pages. No source marks are silently merged into one.

For every GP29 input, let r denote the number of adjacent repeat transitions in the output. The fraction of *all* GP29 sequences that have at most the observed 86 same-page repeats is exactly

\[
p_{\le86}=\sum_{r=0}^{86}\binom{12901}{r}
 \left(\frac1{29}\right)^r
 \left(\frac{28}{29}\right)^{12901-r}
 =2^{-325.450254184\ldots}.
\]

The corresponding exactly-86 cap costs **325.749609732 bits**. Freezing the separate observed repeat counts on all 55 pages costs **445.73156 bits**, an even stronger limitation. These are *combinatorial code-space capacity losses*, not probability evidence that Cicada chose such a code.

Under a page-local glyph-seam positional reader, mark j on page p has at most (N_p+1) choices. Granting all marks labeled independent tracks, even if it admits impossible duplicates, the sum of their capacities is only **234.502803174 bits**. Granting each mark **two physically distinguishable slots per glyph seam** raises this optimistic upper bound to **265.502803174 bits**. Granting **four** slots per seam raises it to **296.502803174 bits**, still **28.947451010 bits short** of the at-most-86 repeat-code deficit. Allowing **eight** slots per seam would exceed the gap; no source instruction selects such a site grammar.

## Red ink adds just three free endpoints under the original anchored-span grammar

The source color annotations contain **213 red runes in 16 contiguous spans** on the unknown physical pages. Treat red as a genuinely independent visible channel. Of all **32** red-span start/end boundaries, **29** coincide exactly with either the beginning/end of their own physical page or the rune boundary of one of the **31 counted large punctuation marks**. Three original boundaries do **not** meet those anchors:

| Physical page | Red-span boundary | Original rune offset | Arbitrary page-local seam choices granted |
| --- | --- | ---: | ---: |
| p8, 255 runes | red title ends | 12 | 256 |
| p40, 231 runes | red title ends | 8 | 232 |
| p53, 179 runes | 51-rune red passage starts | 128 | 180 |

The frozen original 16-span boundary grammar is an independent source constraint. For a **conservative generous upper bound**, allow each of these three exceptions to move independently to *any* glyph seam on its source physical page. Do not impose red-span non-overlap, title spelling or attached mark order; those restrictions could only lower capacity. Their combined additional source channel is at most

\[
\log_2(256\times232\times180)=23.349834091\ldots\text{ bits}.
\]

Every other red-color boundary is already determined by a page seam or the existing mark coordinates, so counting it again as a separately movable signal would double count the same physical address. Even **giving each mark four independent possible slots per rune seam** and granting each of the three red exceptions its own arbitrary page-local placement gives

\[
296.502803174+23.349834091=319.852637265\text{ bits},
\]

still **5.597616919 bits short** of the at-most-86-repeat universal full-GP29 budget. A single seam per large mark leaves a **67.597616919-bit** shortfall.

This extension covers the *full original red-ink boundary morphology* in addition to the large marks, but depends on the explicit frozen attachment grammar: 16 red spans, with the same 29 boundaries anchored to their page edge or a large mark. A coder that allows any arbitrary glyph to toggle red independently, changes the number of spans, attaches headings to ordinary punctuation or converts colors into other visible signals is outside the stated model. Likewise a red span's rune values are already included among the 12,956 GP29 ciphertext glyphs and must not be counted again as side information. No source-authored red-span decoder or actual plaintext has been identified.

## Stronger page-local obstruction on six entirely unmarked pages

Six original pages have **zero repeated adjacent ciphertext runes**, **zero large punctuation marks** and **zero red-ink spans**. If each page is independently enciphered as a same-length, complete-GP29, universally injective no-repeat output channel and has no other side information, it is impossible even before considering the 31 book-wide marks. For a page of n runes the number of repeat-free ciphertexts is just \(29\cdot28^{n-1}\), compared with \(29^n\) unrestricted plaintexts.

| Physical page | Original runes | Minimum page-isolated universal GP29 deficit |
| ---: | ---: | ---: |
| p5 | 263 | 13.264031 bits |
| p13 | 272 | 13.719666 bits |
| p17 | 273 | 13.770292 bits |
| p28 | 269 | 13.567788 bits |
| p31 | 269 | 13.567788 bits |
| p37 | 228 | 11.492119 bits |

This is an unusually clean original-source cross-check for any claimed *page-reset constrained alphabet* cipher. An actual encoded English page could still belong to the zero-repeat subset by happenstance, and a valid unrestricted GP29 cipher may produce other ciphertexts **with** repeated neighbors. Restricted native plaintext domains, page-external side bits, varying output lengths, movable word gaps, other typography, or cross-page carrying also escape the pagewise theorem. The result therefore rejects the explicitly **universal no-repeat page-local code**, not the hypothesis that each observed page happens to have no duplicates.

## Why printed spaces do not automatically supply a free sidecar

The original 2,896 printed words determine 2,895 ordinary word-gap locations among N−1 rune boundaries, potentially **9,922.41134 bits** of layout information. If arbitrary plaintext gap locations must be preserved too, their number is the same on the input and output sides. They **cancel exactly in a pigeonhole count**. Treating all 9,922 bits as new key material silently assumes a *gap-free* plaintext input or an independent plaintext spacing restriction. Either is a separate, unestablished hypothesis.

## Sharp scope and next research decision

With *source page assignment fixed*, an all-message, full-GP29, at-most-86-repeat, same-rune-length coder **cannot be injective** if its only adaptive metadata is the 31 page-local marked positions with up to four visible placement slots per seam **and all 16 original red-ink spans retain their documented attachment grammar, even granting the three unattached endpoints arbitrary page-local relocation**. This conclusion holds for every secret key, symbol relabeling and enumerative-code algorithm under those conditions; no ciphertext search is needed.

**A single independently movable ordinary punctuation mark could overcome the remaining red-plus-mark shortfall in capacity alone.** The residual **5.597616919 bits** equals a need for at least 49 extra distinguishable states. For example, allowing just one of the manuscript's **175 ordinary period stops** to occupy any one of 77 rune seams on the 76-rune final original p55 supplies \(\log_2 77=6.266786541\) potential bits, already more than the residual. That *does not* constitute a decipherment: ordinary periods may be mandatory plaintext punctuation, tied to printed word breaks, or determined by a fixed grammatical rule, in which case no independent side capacity is available. This exact sensitivity is why the present theorem should **not** be generalized to all real printed side channels.

There is an important capacity escape. If all 31 typed marks may relocate **across all 55 pages**, the unconstrained distinct-placement capacity becomes **327.917367 bits**, barely greater than the required 325.450254-bit repeat budget. Such global relocation violates the tested fixed-per-page mark inventory; its mathematical viability says nothing about a creator-selected encoding. External side bits, additional punctuation, genuine plaintext compression, changed word gaps, variable ciphertext lengths, or varying repeat counts across *other messages* also evade this exact obstruction.

**Decision for #2273:** avoid treating 31 physically page-local large marks as a complete unrestricted-GP29 repeat-exception sidecar. A proposed decoder must specify its additional information source, its exact handling of ordinary spaces, or why the original page assignments are part of a global movable marking scheme. Prior q26/q27 arithmetic-code experiments remain unaffected. Pursue a concrete original-cipher inverse only after a source-selected operation supplies that missing mapping.

**Executable source control:** [sims/lp2_marksite_repeat_capacity_original_sft.cjs](../sims/lp2_marksite_repeat_capacity_original_sft.cjs). It reads the exact corpus and ink annotations, asserts physical counts and both separate p7 marks, enumerates every source red-span boundary and its attached/free state, checks all six mark-free zero-repeat page counts, exhausts a small-alphabet positive case and computes the original bounds. The [Windows Node.js 22 original-source test passed on GitHub Actions](https://github.com/FlareZ123/liber-primus/actions/runs/45139689001) on 23 November 2026, confirming all counts, both separate p7 marks, the three free red-span endpoints, all six completely unmarked zero-repeat pages and the computed **5.5976169186-bit** residual deficit. The positive exhaustive small-alphabet counting assertion also passed. The input definitions can be reproduced without guessing plaintext, a key, word breaks or random samples.
