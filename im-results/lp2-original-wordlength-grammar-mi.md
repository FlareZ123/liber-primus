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

## Source-grid 8- and 32-lane whole-word interleave: fixed-order invariant (14 November 2026)

The source's original pp49–51 number table is physically **32 rows by 8 columns**. A tempting, different way to repair the scrambled word-length grammar would be to write ordinary complete words into 8 or 32 *contiguous* lanes, read them round-robin, and encipher each symbol afterwards. This is a **candidate model**, not an authenticated grid operator, and is different from the already-tested p40 red-eight *columnar* whole-word permutation. It admits an exact keyless test even if a different secret fixed lane order is used in each of the nine original visual chapters.

For a width-\`w\` rowwise lane-interleaver, printed word \`i\` and printed word \`i+w\` (when both are in one original visual chapter) are successive in the **same source prose lane**, independent of every chapter-specific permutation of the \`w\` lane labels. Consequently the **lag-\`w\` word-length mutual information** is invariant under that entire secret-order family. For ordinary native English GP prose the source word lengths at these paired positions should retain the natural-language length association. This is a necessary-language-register test, **not a mathematical impossibility for every conceivable plaintext**.

Use all original 2,896 complete words and the nine source-visible chapter starts. Clip rune-word lengths to 1..8/9+; compute the 10×10 plug-in MI at source lags 8 and 32, discarding cross-chapter pairs. Use 700 independently seeded whole-word-length shuffles **within the same nine chapters**, preserving every original length count and every chapter size. The p40–53 visual chapter is also scored separately, preserving its **669 original printed words**. The existing exact lag-one control is \`0.012156\` nats.

| Original input | Observed MI at lag8 | Original source-shuffle z, upper-tail | Observed MI at lag32 | Source-shuffle z, upper-tail |
| --- | ---: | --- | ---: | --- |
| **All nine chapters** | **0.013171** | ≈ **+0.8**, p ≈ **0.20** | **0.014882** | ≈ **+1.2**, p ≈ **0.12** |
| **p40–53, 669 words** | **0.060213** | ≈ **+1.0**, p ≈ **0.17** | **0.063416** | ≈ **+1.0**, p ≈ **0.14** |

All four scores remain ordinary under the same-source-length permutations; none supplies a restored word-order effect. The exact source-independent *positive* uses the first 2,896 GP-normalized original prose words after the chapter heading “The Coming of the Ship” in the repo-pinned Gibran reference, partitioned into the **same nine original word-count chapters**, then truly interleaved into 8 or 32 contiguous lanes per chapter. Full-book lag8 and lag32 MI return **0.052555** and **0.050918** nats with original-chapter-shuffle z ≈ **+19** and **+17**. The p40-sized native controls return MI ≈ **0.104**, z ≈ **+6**. Ordinary lag-one MI of the intentionally interleaved native controls is near its shuffle mean, reproducing the original kind of grammar loss.

**Decision:** The actual original ciphertext provides **no evidence for simple whole-word round-robin 8- or 32-lane interleaving of consecutive ordinary GP prose**, including any secret fixed permutation of those lanes per visual chapter. The grid's dimensions alone do not choose this encoding. Column-major word transpositions, variable lanes, changing within-row order, word-boundary-changing encodings, languages with atypical length dependencies, and subsequent cipher stages remain open. Do not optimize lane orders to rescue this failed invariant without a new authorial cue. [Source-exact standalone CJS SFT](../sims/lp2_wordlength_gridlane_allsecret_sft.cjs).

## Exact source-prose crib search through preserved word lengths

The preserved printed delimiters provide a direct plaintext-recovery opportunity independent of the rune cipher: if the unsolved text quotes a known original passage without changing the source word order or the GP rune length of each word, its **contiguous word-length string** survives even an arbitrary secret, position-dependent, length-preserving rune substitution. Agent15 tested this condition on the entire original 2,896-word LP2 stream, preserving all 32 source words continued across physical page breaks, against five independent, previously pinned literary corpora. English text is converted using the same native GP digraph/ING/IO encoder as the source controls above; the corrected Old English and native Latin sources retain their fixed word-level GP length inventories.

| Intact-GP source text | Source words | Exact nine-word matches | Exact ten-word matches |
| --- | ---: | ---: | ---: |
| Shakespeare | 55,407 | **4** | **0** |
| Gibran, *The Prophet* | 15,733 | **3** | **0** |
| Emerson | 77,932 | **1** | **0** |
| Latin Vulgate | 39,835 | **1** | **0** |
| Corrected Old English *Beowulf* | 10,885 | **0** | **0** |

All nine observed nine-word matches are isolated, generic length-profile coincidences. None provides authenticated rune plaintext. The exact ten-word absence also gives a useful bounded exclusion of lightly edited quotations: any **20 consecutive aligned words with at most one changed word length**, or **30 with at most two**, must contain a ten-word intact run, so neither can appear in these five sources under that precise alignment model. Insertion/deletion of words, permutation, changed segmentation, an untested source, or a different original orthography are outside the test.

A source-matched baseline prevents overinterpretation. In **600 seeded shuffles** of the original word lengths *within the nine unchanged visual chapters*, preserving every chapter's word-length inventory, the five-source combined number of nine-word hits averaged **18.8367**, with **15/600** shuffles having at most the original nine; exact ten-word hits averaged **2.9417**, with **48/600** shuffles also having zero. These are exploratory finite-source counts, not a discovery-corrected significance test. The scant matched source phrases agree with the independent missing-word-length-grammar result above, so the test **does not establish that the intended plaintext is absent** from any of these books; a transport that changes word order or delimiters would conceal quotations.

The original full-length exact parser, native-text coding, all five source alignments, 600 within-chapter controls and a planted ten-word genuine Gibran phrase are checked by the [independent CommonJS SFT](../sims/lp2_wordlength_source_crib_sft.cjs). [Windows Node22 run 43579738262](https://github.com/FlareZ123/liber-primus/actions/runs/43579738262) passes the original and 600-shuffle checks, as does the later [combined original-source run 43580390413](https://github.com/FlareZ123/liber-primus/actions/runs/43580390413). This remains a **conditional source-crib route**, useful to rerun on a new historically indicated text, rather than a decryption.

## Cryptanalytic consequence and limitations

The source-visible **printed spaces and dots cannot currently be assumed to preserve natural prose word order**. Their marginal resemblance to raw Latin English word lengths ([prior original unigram test](../sims/lp2_original_rawlatin_vs_gp_wordlength_register_sft.cjs)) does not establish natural-language word boundary preservation; the higher-order structural evidence is absent.

Highest-value next operation is an **independently selected reversible permutation of complete printed words** beyond the source-grid 8/32 fixed-lane family tested above, or a **variable-length transport/register model** whose encoding deterministically accounts for *all* 2,896 boundaries, 175 stops and 12,956 rune symbols. Such a decoder must be chosen by visible original art, historical Cicada operations, or signed directions **before** scoring its output, and must predict held-out chapters. A postselected word shuffle, dictionary fit or language-based boundary repair is not a solution. For an original plaintext language or constrained literature unlike the five registered source corpora, supply an independent control first.

The test does not disprove deliberately length-balanced prose, other languages/genres, spellings or contractions, a cipher that changes displayed word lengths, or natural plaintext reordered before printing. It supplies no recovered key and no original-message inverse. It is a source-only, finite statistical architecture constraint that narrows rational next attacks.