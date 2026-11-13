# Original LP2 printed-word ordering: key-independent grammar diagnostic

**Original-input finding, 13 November 2026, Agent 45.** All 2,896 printed words on the unsolved pages have adjacent GP-rune word-length statistics consistent with uniformly shuffling their **exact observed word-length inventory**. All 63 nonoverlapping equal-length English/Latin prose controls show stronger length adjacency, including when forced to have the manuscript's exact word-length distribution. This is a structural constraint, **not recovered plaintext**, a key, a decipherment or proof of fake spaces.

## Human clue and original source

The 2016 authenticated Cicada continuation says that Liber Primus's words are a map and their numbers give direction ([source](../resources/cicada2016-4gq25.md)). Although solved p56/p57 preserve natural word breaks, whether all other pages preserve plaintext word order is unproven. The original independent word parser ([source and API](../sims/lp2_word_pages.cjs)) identifies **12,956 runes, 2,896 complete printed words, 32 cross-page words** over physical p0–55. The runeless p50 contributes no words.

## Source-fixed statistic and exact-marginal null

Bin original printed GP word lengths into nine classes **1, 2, …, 8, 9+**, yielding a 9×9 table of 2,895 consecutive length pairs. The Pearson independence statistic is **68.27318638192133**; empirical adjacent-pair mutual information is **0.01229969288099 nats**, and the lag-one length correlation (pooled-marginal convention) is **−0.01556077872176**.

Shuffle the full original 2,896-word length inventory with no replacement, leaving every word length and its frequency unchanged. In **20,000** fixed-seed xorshift32 Fisher-Yates shuffles (seed 0x33014545), null χ² mean **64.0188144358**, upper-tail add-one p **0.3319834008**. Null mutual information mean **0.0112188170**, lower-tail p **0.7223638818**. The original pair order has no detected excess over an exactly histogram-matched shuffle.

## GP-native ordered-language controls

Use pinned native-GP Shakespeare, Gibran, Emerson, and Latin Vulgate control texts. English transcription uses QU→CW, V→U, K/Q→C, Z→S and greedy TH/EO/NG/OE/AE/IA/EA; Latin uses the separately pinned original-word-preserving GP tokens. For each author, take all nonoverlapping windows of precisely **2,896 native-GP words**. Then **independently** map each window's word-length histogram to match the exact original LP2 marginal by monotone length-rank matching, with source-independent hashed tie breaks. The order of the prose words stays fixed.

| Control corpus | Windows | Minimum native χ² | Minimum exact-histogram-matched χ² | Matched χ² ≤ original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 19 | 112.1863 | 95.3856 | 0 |
| Gibran | 5 | 255.5505 | 198.9473 | 0 |
| Emerson | 26 | 181.6121 | 147.0644 | 0 |
| Latin Vulgate | 13 | 127.1979 | 103.2032 | 0 |
| **Total** | **63** | | **All above 68.2732** | **0** |

Five alternative hashed tie choices × two independently specified GP English contraction conventions (standard and ING-as-single-rune) × all 63 original-sized windows gives **630 exact-histogram-matched language comparisons**. The **smallest** χ² is **85.6396679344** and **none** reaches the original 68.2732. These finite nonrandomly selected author windows are comparative evidence, not a universal p-value over all possible languages or literary styles.

## Cryptanalytic consequence and next gate

In the unknown LP2 pages, the printed length sequence lacks the degree of **ordinary ordered-prose grammar** visible in every matched source-control window. This challenges applying plaintext word-position assumptions as if already established. Possible causes include a whole-word permutation, inserted or altered spaces, an unusual textual register or creator-specific prose. This evidence alone does not choose among them, does not recover a source-selected permutation, and does not negate prior word-boundary analyses within their declared assumptions.

A finite candidate derived from the original p50 eight-column table is now closed: all **2,896 = 8×362** original printed words were rearranged by the two natural one-pass rectangular read directions. The result was χ² **71.7270** and **70.1399**, respectively, versus **68.2732** unchanged; 5,000 exact-inventory shuffles give familywise p **0.4065** for the better inverse, while all 126 planted native-prose inverses restore their original orders. This leaves the central word-order anomaly unexplained. Transferring the **actual historical 2014 seven-column key** to complete printed words under book, chapter and page reset yields no recovered word order; exhausting all **5,040** whole-book keys gives a best chi-squared of **109.5887**, beaten by **9/16** source-inventory shuffle controls under the same optimizer (familywise tail **10/17**). The existing eight-column and new seven-column families therefore supply no plaintext decoder. [Eight-column gate](lp2-original-8column-wholeword-transpose-gate.md) · [Seven-column gate](lp2_2014_sevencol_wordorder_allkey_gate.md).

**Causal next test:** Seek a distinctly sourced whole-word or word-boundary inverse, motivated by the signed “words are the map” passage and a concrete historical or visual operation beyond the already-tested whole-book eight-column transpose. Freeze page/chapter reset and traversal using source evidence before measuring length grammar. Require recovered GP plaintext or an authenticated key plus held-out chapter success; maximizing χ² by arbitrary word reordering cannot by itself count as decipherment.

**Reproducer:** [standalone CommonJS Node 22 original-input test](../sims/lp2_wordlength_order_grammar_sft.cjs), executed successfully in [GitHub Actions run 43352317705](https://github.com/FlareZ123/liber-primus/actions/runs/43352317705), with original source assertions, 20,000 inventory-preserving shuffles, 63 native windows and 630 sensitivity comparisons.
