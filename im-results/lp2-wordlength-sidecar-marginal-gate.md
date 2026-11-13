# Original LP2 word lengths: side-channel versus constrained segmentation

**13 November 2026, Agent 10. Source-original structural gate for Director #723; no plaintext, cipher, key, or destination recovered.** This report contrasts two ways to produce the manuscript's near-random *order* of printed word lengths: freely randomized separators versus rearrangement/encoding that deliberately preserves the strongly nonuniform *length inventory*. It makes no claim that either mechanism is historical.

## Fixed source and strongest competing explanations

The original unsolved LP2 physical pages p0–p55 have **12,956 GP29 runes**, distributed across **55 rune-bearing physical pages** (p50 is runeless). The complete printed-word parser joins line wraps and page carries: **2,896 words, 32 cross-page carried words**, with **83 one-rune words**. The 2,895 actual word separators consist of **2,873 within-page breaks and 22 between-page breaks**. [Canonical parser](../sims/lp2_word_pages.cjs) · [original transcription](../resources/lp2-transcription.txt).

The earlier independent [word-grammar study](lp2-wordlength-order-grammar.md) found nine-bin adjacent-length χ² **68.2732**, typical under exact-inventory shuffling (one-sided permutation p **0.332**); no tested native prose controls had so little adjacent-length structure after fixing their marginal inventory to match LP2. This **ordering** observation is compatible with word-order transposition, an engineered word-boundary side channel, and unusual non-prose or cryptographic original texts. It does not choose a reading rule.

The *marginal* length distribution supplies an independent, sharply discriminating constraint:

| Complete printed word length in runes | Observed word count |
|---:|---:|
| 1 | **83** |
| 2 | 448 |
| 3 | 720 |
| 4 | 513 |
| 5 | 317 |
| 6 | 256 |
| 7 | 216 |
| 8 | 156 |
| 9 | 78 |
| 10 | 52 |
| 11 | 32 |
| 12 | 18 |
| 13 | 4 |
| 14 | 3 |
| **Total** | **2,896** |

## Exact unconstrained-separator null

A minimal version of the "arbitrarily inserted word breaks carry state" hypothesis is to place precisely **2,895** separators uniformly among the **12,955** internal rune gaps, while retaining the source-observed rune and printed-word totals. The equally likely compositions number \(\binom{12955}{2895}\). A particular word has length one with probability \(2895/12955\), giving

\[
E[\text{one-rune words}]=2896\cdot\frac{2895}{12955}
=\mathbf{647.1570822}.
\]

For exactly \(s\) singleton words, choose their positions and distribute the remaining excess lengths with every other word at least two runes:

\[
\Pr(S=s)=
\frac{\binom{2896}{s}\binom{10059}{2895-s}}
{\binom{12955}{2895}}.
\]

The finite exact left tail over \(s=0,\ldots,83\) is **\(5.71725\times 10^{-239}\)** (log10 tail **−238.242813**). Thus the original **83** versus expected **647.16** is radically incompatible with a *uniform* arbitrary-delimiter channel under this specific null. This calculation is exact within the stated model; it is not a universal probability of Cicada authors choosing to encode boundaries.

## Original physical-page and carry-preserving robustness

The uniform global null ignores the original page geometry, so a stronger null **holds fixed the 55 original page rune lengths, each page's count of interior printed breaks, and the presence/absence of all 54 inter-page breaks**. Only the within-page positions of the fixed 2,873 break events are shuffled without replacement. Consequently all 22 cross-page breaks and all 32 carried page transitions stay at their source-visible locations.

For a page with \(L\) runes and \(k\) interior breaks, an interior rune is singleton with probability \(k(k-1)/[(L-1)(L-2)]\); a page-edge rune is singleton when its adjacent interior break is selected and its fixed outer boundary is a break. Summing all original pages yields **641.0043541** expected one-rune words. In **10,000** seeded independent randomizations (xorshift32 seed \`0x3301723\`), the mean was **641.149**, SD **19.8015**, range **562–723**, and **0/10,000** had as few as the original 83. The Monte Carlo add-one upper-tail diagnostic is **0.00009999**. The unconditioned *exact* probability above is much sharper; the page-aware experiment establishes that merely preserving page carry geometry cannot rescue the uniform-spacing account.

**Reproducer:** [original-input single-file CommonJS SFT](../sims/lp2_wordlength_sidecar_uniform_breaks_sft.cjs), run with Node 22 and the committed canonical transcription; the SFT asserts the exact source counts and both nulls. Reuse the existing manual-only [word-length grammar workflow](../.github/workflows/lp2-wordlength-grammar-original-manual.yml).

## Decision for Director #723

The 2016 signed clue says, with authenticated wording, that Liber Primus's words are the map, their meaning the road, and their numbers the direction ([historical source](../resources/cicada2016-4gq25.md)). It does **not** identify printed *rune lengths* as those numbers, specify parity/digits/ranks, give a decoding clock, select a stopping rule, or say how ordinary plaintext word boundaries are recovered. Without one such rule, **there is no source-selected reversible word-length exception decoder** or original ciphertext prediction. No 40-rune plaintext, recovered key, or forward-encrypted LP2 inverse is claimed.

The original length multiset admits about **8,791.876 bits' worth** of distinct *orderings* in a purely combinatorial sense, \(\log_2[2896!/\prod_\ell n_\ell!]\), comfortably exceeding the [326-bit global repeat-suppression sidecar lower bound](lp2-anti-repeat-lossless-capacity.md). This is **cardinality only**: a symbol-preserving permutation of the observed word lengths does not itself reveal exception bytes, punctuation semantics, or plaintext boundaries, and the missing author-selected ranking/consumer is the decisive obstruction. If the original word-length sequence is fixed for each candidate plaintext by preserving its native word breaks, then it is no independent sidecar at all.

**Fork:** Retire *unconstrained uniformly placed* word separators as an explanation of the actual observed length inventory; prioritize a source-indicated length-inventory-preserving operation or another independently motivated cipher architecture. [Director #720](https://github.com/FlareZ123/liber-primus/issues/720) separately investigates a whole-word permutation with the necessary historical selector gate. Do not infer that this test disproves deliberately distribution-shaped delimiter coding, non-English plaintext, arbitrary page-level transpositions, or hidden side information in the numeric table. Revisit #723 only if an authenticated original clue actually chooses the word-length reading rule, restoration procedure and repeat-collision side-channel consumer.
