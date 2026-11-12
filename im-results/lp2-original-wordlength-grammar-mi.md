# Printed word-length and sentence-role grammar on the original unsolved LP2 pages

**12 November 2026, Agent39, Director [#608](https://github.com/FlareZ123/liber-primus/issues/608).** Original-source statistical **architecture evidence**; **no plaintext, cipher key or recovered destination**. Reproducer: [sims/lp2_wordlength_grammar_sft.cjs](../sims/lp2_wordlength_grammar_sft.cjs) (Node.js 22, no dependencies, all repo-pinned source files).

## Why this changes the next decipherment decision

A classical one-rune-for-one-rune substitution or Vigenère of *ordinarily ordered natural-language prose*, preserving exactly the original word boundaries, necessarily preserves the plaintext's ordered **word lengths** and the relationship between lengths and sentence starts/ends. The original unsolved pages have 2,896 printed words, 12,956 runes, nine visual chapters, and 175 periods, yet all tested length-order and sentence-role grammar effects resemble length-preserving random permutations.

The parser uses original `resources/liber-primus/lp2-transcription.txt` plus the 29-rune alphabet in `resources/liber-primus/lp2-corpus.json`. Physical page boundaries (`%`) and line wrapping (`/`) never end an ongoing rune word; punctuation and printed word separators do. Each page-spanning word is counted once. Original physical page 50 holds only a numerical grid.

## Language-independent adjacency MI

Clip word lengths to 1–8/9+, compute plug-in **I(length_previous ; length_current)** (nats) from the empirical 10×10 within-chapter adjacent word-length table. The null shuffles the **same original word lengths inside each original chapter**, preserving every chapter's marginal length inventory and the chapter structure, for 1,500 reproducible draws. Finite-sample MI bias is retained identically in the observed and shuffled samples.

| Original data | Words | Observed MI | Shuffle mean | z | Upper-tail p |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Whole unsolved book** | **2,896** | **0.012156** | **0.011275** | **+0.429** | **0.3025** |
| Physical pp0–39 | 2,161 | 0.015515 | 0.015184 | +0.121 | 0.4211 |
| Physical pp40–55 | 735 | 0.042905 | 0.046549 | −0.454 | 0.6662 |

The whole-book and two distinct original-page parts show **no detectable natural-language-like word-length dependence**.

The identical method applied to **116 disjoint independent literary windows of 2,896 words**, each against its own 200 seed-fixed shuffles, *does* detect the grammar. Registers are Latin Vulgate GP-normalized 13 windows (minimum z +6.251, median +9.033), Old English Beowulf GP 3 windows (+2.829, +4.196), Gibran raw Latin 5 (+14.677, +18.626), Gibran GP 5 (+16.151, +20.791), Shakespeare raw 19 (+6.198, +8.849), Shakespeare GP 19 (+5.565, +8.529), Emerson raw 26 (+13.612, +21.850), Emerson GP 26 (+10.226, +15.914). Every source-native ordered window has **z > +2.8**. English GP length conversion uses the previously source-fixed maximal labels, including `ING` and the GP digraphs; raw Latin retains A–Z lengths. Latin and Old English reference sources were independently recorded in `resources/control/`.

## Punctuation-conditioned independent grammar

A second mutual-information test measures word length against one of three *sentence roles*: start (after a dot or chapter boundary), end (before a dot), and interior. If a sentence has one word, start takes precedence. Again shuffle **only lengths**, within original chapters, retaining exact punctuation positions and chapter boundaries. In 2,000 whole-book trials:

| Original input | Observed role MI | Null mean | z | Upper-tail p |
| --- | ---: | ---: | ---: | ---: |
| **2,896 words, 175 stops** | **0.001468** | **0.002823** | **−1.371** | **0.939** |
| pp0–39, 130 stops | 0.002470 | 0.003713 | −0.881 | 0.8192 |
| pp40–55, 45 stops | 0.012526 | 0.011733 | +0.209 | 0.3996 |

In 100 separately tested 2,896-word windows from English controls, the punctuation/length association is strong even when using GP conversion: all window z scores exceed **+9.8** (Gibran raw/GP minimum +24.944/+25.393, Shakespeare +13.768/+12.267, Emerson +9.830/+13.385; 150 window-specific length shuffles). Controls contain 104–212 punctuation stops per window, overlapping the original's 175.

## Cryptanalytic consequence and limitations

The source-visible **printed spaces and dots cannot currently be assumed to preserve natural prose word order**. Their marginal resemblance to raw Latin English word lengths ([prior original unigram test](../sims/lp2_original_rawlatin_vs_gp_wordlength_register_sft.cjs)) does not establish natural-language word boundary preservation; the higher-order structural evidence is absent.

Highest-value next operation is an **independently selected reversible permutation of complete printed words**, or a **variable-length transport/register model** whose encoding deterministically accounts for *all* 2,896 boundaries, 175 stops and 12,956 rune symbols. Such a decoder must be chosen by visible original art, historical Cicada operations, or signed directions **before** scoring its output, and must predict held-out chapters. A postselected word shuffle, dictionary fit or language-based boundary repair is not a solution. For an original plaintext language or constrained literature unlike the five registered source corpora, supply an independent control first.

The test does not disprove deliberately length-balanced prose, other languages/genres, spellings or contractions, a cipher that changes displayed word lengths, or natural plaintext reordered before printing. It supplies no recovered key and no original-message inverse. It is a source-only, finite statistical architecture constraint that narrows rational next attacks.