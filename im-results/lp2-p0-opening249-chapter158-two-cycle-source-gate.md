# P0 black249 ↔ opening-chapter 158 words ↔ original p50 reciprocal cycle

**Classification (Agent31, 21 November 2026): original-artifact cardinality bridge, conditional navigation, no recovered ciphertext plaintext or author key.** The independently source-visible opening chapter yields a two-number address pair that is *exactly* the previously verified nontrivial 2-cycle of the p50 base60 successor table. The relation has a small fixed-family table-shuffle frequency, although the count-to-cell rule was recognized retrospectively. It is evidence to investigate the intended chapter-count and table-address semantics, not evidence of a known LP2 cipher.

## A human-visible proposed route

1. LP2's first unsolved page **p0 / scan 17.jpg** has a red **13-rune** heading ending at its **13-dot** punctuation marker. Its remaining **249 runes** are visibly black. Source annotation and corpus give 262 total−13 red=**249**. The mark is a boundary between the heading and the first black body; it is not itself an instruction to take a count.
2. Source-visible chapter headings begin at physical pages **[0,3,8,15,23,27,33,40,54]**. Thus the first chapter ends at p2, immediately before the next red heading on p3. The canonical word parser, retaining cross-line and cross-page words, counts **158 original printed words** beginning in pp0–2. This includes the two opening red words; removing them gives 156 body words, which does *not* produce the cycle.
3. Original source grid tokens: **p50 row-major cell249 is `2c`**, ordinary base60 **158**, and **cell158 is `49`**, ordinary base60 **249**. Thus addressing with the black p0 length and the three-page printed-word count closes the same two-cycle: **249→158→249**. These are the exact two nodes in the p50 graph's only nontrivial 2-cycle, whose existence and source-original glyphs were previously documented. An already explored alternative **base59** interpretation yields **cell249→156, cell158→245**, so the bridge is absent under base59.

This combines previously independently reported facts: physical p0 ink adjudication, the source-visible chapter boundaries and the 158 opening word count, and the visually audited p50 two-cycle. The new candidate relation is the pairing **p0 black249 ↔ opening-chapter words158**. The same 158 occurs as the number of rune symbols on p49+p51, already examined in the separate source-only 158-flank bridge; this does not supply a missing cipher operand.

## Unfiltered source-chapter negative controls

To avoid finding a special relation only by selecting chapter 1 after the fact, apply the *same* typed comparison to all nine visible unsolved opening red-heading chapters: first-page rune count minus its **initial** red heading, and every original printed word assigned to that chapter by the canonical parser. A pair is eligible only if both numbers directly address cells0..255, without truncation or modulo operations.

| Chapter (physical pages) | First-page initial red | First-page black runes | Chapter printed words | Two-way p50 pointer |
|---|---:|---:|---:|---|
| p0–2 | 13 | **249** | **158** | **249↔158** |
| p3–7 | 16 | 201 | 255 | no |
| p8–14 | 12 | 243 | 383 | unaddressable |
| p15–22 | 9 | 150 | 437 | unaddressable |
| p23–26 | 16 | 197 | 224 | no |
| p27–32 | 19 | 215 | 326 | unaddressable |
| p33–39 | 10 | 204 | 378 | unaddressable |
| p40–53 | 8 | 223 | 669 | unaddressable |
| p54–55 | 9 | 223 | 66 | no |

Only the first chapter satisfies the full directional pair. The manuscript's runeless p50 must remain an actual physical page: the word parser has only 55 unknown rune-bearing page entries; the chapter counts here use the repository's explicit *rune page→physical page* conversion.

## Exact *conditional* baseline

Fix all nine originally observed chapter counts, the original 256-cell base60 token multiset, and the rule above. Uniformly reassign the 256 table values to the 256 cell addresses, without changing value multiplicities. Under this null, the count of values158/249 is **1/3**, giving

\[
\Pr[T(249)=158,\ T(158)=249]
=\frac{1\times3}{256\times255}
=0.0000459558823529.
\]

Of the four chapter-pairs with both addresses in range, only **(249,158)** and **(201,255)** have both required values anywhere in the original table; the other two have a missing required value. Value multiplicities of 201/255 are **2/1**. The two eligible address/target sets are disjoint, hence exact inclusion-exclusion over every original chapter gives

\[
\frac{3}{256\times255}
+\frac{2}{256\times255}
-\frac{6}{256\times255\times254\times253}
=\boxed{0.0000765917069887}.
\]

**Interpretation boundary:** these are original-multiset **fixed-hypothesis** frequencies, not discovery-adjusted evidence for deliberate encoding. The chapter choice, first-page black versus all-chapter words, omission of the 13 red heading symbols, alphabet radix, and address semantics were explored in a repository with thousands of hypotheses. A source-selected, prospective operation on a different page remains absent. Uniformly shuffled table values are also a deliberately limited null, rather than an authenticated model of Cicada's table construction.

## Cryptanalytic next decision

The candidate route has a concrete human-readable entry point, but there is presently no published Cicada instruction that says “count opening chapter words, address the p50 table with the first black span” or describes what the reciprocal result does to actual unknown-page ciphertext.

A useful new lead would explain why the original opening **p0 red13/black249** division selects the first of the two coordinates, why the source-visible **p0–p2** word count supplies the other, and specify a reversible page/word-state consumer *without* tuning cipher candidates to the p0 body. A viable consumer must predict coherent unknown-page plaintext on withheld original source and replay the forward transform exactly. Do not expand into arbitrary page pairs, secondary arithmetical echoes, or clock sweeps on these same two numbers.

Reproducer: [`sims/lp2_p0_opening249_chapter158_tablecycle_sft.cjs`](../sims/lp2_p0_opening249_chapter158_tablecycle_sft.cjs), Node22/CommonJS. Sources: `resources/liber-primus/lp2-corpus.json`, `lp2-ink-annotations.json`, `lp2-grid-256.json`, `lp2-transcription.txt`; parser `sims/lp2_word_pages.cjs`. Related prior source-only decisions: [chapter boundaries](../sims/lp2_visual_chapter_boundary_sft.cjs), [158-flank bridge](lp2-158-word-flank-table-bridge.md), [source p50 graph and 2016 correspondence](lp2-p50-functional-graph-2016-wordmap.md).
