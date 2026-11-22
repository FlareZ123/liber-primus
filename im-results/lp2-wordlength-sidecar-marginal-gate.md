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

The **83/2,896 = 2.866%** original singleton fraction is itself broadly compatible with independently normalized GP English prose: Gibran has **487/15,733 = 3.095%** one-rune words, Emerson **2,359/77,932 = 3.027%**, and Shakespeare **3,165/55,407 = 5.712%** (pinned resources/control datasets). Thus the following extremely small random-gap probability is **expected for language-like word-length inventories** and should only exclude unconstrained random separator placement. It is not evidence of a cipher, transposition, or a historically intentional word-length side channel by itself.

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

## The ordering anomaly survives original chapter partitioning

A whole-book permutation of nine otherwise natural source chapters would erase some *between-chapter* order while preserving word-length grammar inside each chapter. To test that specific alternative, use the **nine original visual chapter intervals**, preserving each chapter's exact multiset of printed word lengths. For each, compare adjacent nine-class length mutual information with 5,000 fixed-seed complete-word shuffles (seed 0x3301434). No candidate key or plaintext is fitted.

| Original chapter pp | Words | Observed adjacent-length MI (nats) | Shuffle mean MI | Upper-tail fraction (null MI ≥ original) |
|---|---:|---:|---:|---:|
| 0–2 | 158 | 0.22073 | 0.23178 | 0.6121 |
| 3–7 | 255 | 0.15436 | 0.14086 | 0.2571 |
| 8–14 | 383 | 0.09752 | 0.09210 | 0.3471 |
| 15–22 | 437 | 0.09389 | 0.08058 | 0.1626 |
| 23–26 | 224 | 0.13331 | 0.15918 | 0.8534 |
| 27–32 | 326 | 0.14094 | 0.10969 | 0.0422 |
| 33–39 | 378 | 0.08609 | 0.09294 | 0.6621 |
| 40–53 | 669 | 0.04667 | 0.05121 | 0.6747 |
| 54–55 | 66 | 0.47252 | 0.51685 | 0.7502 |

Eight of nine source chapters have unremarkable adjacency MI under an exact-inventory shuffled control. The p27–32 interval has nominal one-sided 0.0422, which is **not compelling across nine inspected chapters** (Bonferroni upper bound 0.3797). The shuffle null alone cannot establish that natural ordered prose is missing within each chapter, so an independent GP-native control is needed.

To discriminate this, independently authored Shakespeare, Gibran and Emerson control windows of the **same chapter word count** were translated to native GP29 lengths, then each window was monotone rank-matched to the **exact original chapter word-length inventory** before computing adjacent-length MI. Deterministic original-independent index ties and nonoverlapping source windows avoid fitting the original ordering:

| Chapter pp | Source words | Original MI | Exact-marginal native windows | Native MI ≤ original | Add-one lower-tail |
|---|---:|---:|---:|---:|---:|
| 0–2 | 158 | 0.22073 | 942 | 75 | 0.0806 |
| 3–7 | 255 | 0.15436 | 583 | 174 | 0.2997 |
| 8–14 | 383 | 0.09752 | 388 | 50 | 0.1311 |
| 15–22 | 437 | 0.09389 | 340 | 82 | 0.2434 |
| 23–26 | 224 | 0.13331 | 664 | 13 | 0.0211 |
| 27–32 | 326 | 0.14094 | 456 | 243 | 0.5339 |
| 33–39 | 378 | 0.08609 | 393 | 10 | 0.0279 |
| 40–53 | 669 | 0.04667 | 221 | 3 | 0.0180 |
| 54–55 | 66 | 0.47252 | 2,257 | 303 | 0.1346 |

The three locally most distinctive sections have original MI below most finite source controls (p23–26, p33–39, p40–53); **none has a Bonferroni-adjusted lower-tail below 0.05 across nine comparisons**, and several chapters overlap native prose comfortably. The manuscript-wide length-grammar deficit therefore deserves consideration beyond simply scrambling chapters, but it **cannot independently exclude intact-chapter permutation or unusual native textual style**. A source-indicated within-chapter operation or authentic key remains necessary. This chapter test adds no plaintext or unique inverse. The same [source-input SFT](../sims/lp2_wordlength_sidecar_uniform_breaks_sft.cjs) reproduces both the seeded exact-inventory shuffle and all histogram-matched native control counts.

## Does the 32 cross-page carry count index the 32 table rows?

An independent source-count coincidence is that **exactly 32 complete words cross original physical LP2 rune-page boundaries**, and the pp49–51 numerical table has **32 rows** of eight tokens. The count could tempt a one-row-per-carried-word decoder, but its evidential specificity must first be assessed against the manuscript's actual page layout.

The nine original visual chapters have eight guaranteed word-ending chapter boundaries, and there are **46** other page turns. Of those 46, **14** already end at complete words; therefore **32** carry a word across the next rune-bearing page. Preserving the original lengths of **all 2,896 individual words**, nine chapter groupings, every physical page's rune count and the eight mandatory chapter word-breaks, independently shuffle complete words **within their own chapter**. Count page turns that land inside a word under each shuffled layout. Across **30,000** deterministic Fisher–Yates controls (seed \`0x33013232\`), the count of carried words has mean **35.7070**, SD **2.8268**, range **22–45**; **3,842/30,000** controls have **32 or fewer** carries (one-sided empirical tail **0.12810**), and **1,666** have exactly 32. The count match to 32 table rows is therefore **ordinary** under this source-chapter-conditioned model.

This does not exclude a specifically selected *content* correspondence between 32 carried words and table rows. It withdraws the **shared cardinality alone** as evidence for a row assignment or byte-decoding operation. In particular, a putative direct mapping of "number of runes before the page turn = one of eight table columns" needs its own overflow rule: three source-original carried words have **9 or 10** pre-turn runes, outside eight columns. A source-fixed mapping, byte/rune consumer, and independent plaintext prediction remain missing.

The same [CommonJS SFT](../sims/lp2_wordlength_sidecar_uniform_breaks_sft.cjs) now reproduces this chapter-local count gate, alongside the uniform-spacing theorem. This is a decision on a count coincidence, not a universal exclusion of every carry-based cipher.

## Decision for Director #723

The 2016 signed clue says, with authenticated wording, that Liber Primus's words are the map, their meaning the road, and their numbers the direction ([historical source](../resources/cicada2016-4gq25.md)). It does **not** identify printed *rune lengths* as those numbers, specify parity/digits/ranks, give a decoding clock, select a stopping rule, or say how ordinary plaintext word boundaries are recovered. Without one such rule, **there is no source-selected reversible word-length exception decoder** or original ciphertext prediction. No 40-rune plaintext, recovered key, or forward-encrypted LP2 inverse is claimed.

The original length multiset admits about **8,791.876 bits' worth** of distinct *orderings* in a purely combinatorial sense, \(\log_2[2896!/\prod_\ell n_\ell!]\), comfortably exceeding the [326-bit global repeat-suppression sidecar lower bound](lp2-anti-repeat-lossless-capacity.md). This is **cardinality only**: a symbol-preserving permutation of the observed word lengths does not itself reveal exception bytes, punctuation semantics, or plaintext boundaries, and the missing author-selected ranking/consumer is the decisive obstruction. If the original word-length sequence is fixed for each candidate plaintext by preserving its native word breaks, then it is no independent sidecar at all.

**Fork:** Retire *unconstrained uniformly placed* word separators as an explanation of the actual observed length inventory; prioritize a source-indicated length-inventory-preserving operation or another independently motivated cipher architecture. [Director #720](https://github.com/FlareZ123/liber-primus/issues/720) separately investigates a whole-word permutation with the necessary historical selector gate. Do not infer that this test disproves deliberately distribution-shaped delimiter coding, non-English plaintext, arbitrary page-level transpositions, or hidden side information in the numeric table. Revisit #723 only if an authenticated original clue actually chooses the word-length reading rule, restoration procedure and repeat-collision side-channel consumer.
