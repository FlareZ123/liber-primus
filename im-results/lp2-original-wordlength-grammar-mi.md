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

## Doubled-plaintext-rune escape: original word-order gate (14 November 2026)

An exact historical 22 May 2016 chat message proposed that the eight-rune original p54 red heading after its initial A might read **BEGINNING**. The source-calibrated LP1/LP2 orthography represents **BEGINNING** with seven GP runes (`B E G I N N ING`), but it contains one **N N** doublet. This suggests a bounded *variable-length* explanation, distinct from fixed-width substitution: insert **one additional ciphertext rune** for each immediately doubled GP plaintext symbol, independently inside each printed word. Under this explicit rule the heading's seven plaintext runes generate eight ciphertext positions without changing word order. The rule fixes every word's output length in advance of an unknown key or choice of escape rune.

The resulting **length sequence** is testable without guessing any glyph values. We compared the entire original 2,896-word sequence and 12,956 original GP symbols (the same nine source chapters as above) with five independently contiguous, 2,896-word windows each of three pinned English corpora. Each control is encoded using the solved-LP1-confirmed `ING` and `IO` single-rune spelling; add exactly one new length position at each doubled GP symbol *within* its word. The 10×10 adjacent-word-length MI is calculated within original chapter boundaries, capping lengths at 9, and calibrated against **160 deterministic within-chapter marginal-preserving shuffles per source window**. No source words, cipher keys, gaps, or insertion rules were tuned after inspecting the original data.

| Input | Word-length MI with insertion | Within-chapter permutation z |
| --- | ---: | ---: |
| **Original unsolved LP2**, source words unchanged | **0.01215610** | **+0.52** (360-shuffle null, p=0.3130) |
| Gibran, 5 original-prose windows | 0.04679–0.05498 | **+17.91 to +20.16** |
| Shakespeare, 5 original-prose windows | 0.02297–0.02773 | **+5.35 to +9.27** |
| Emerson, 5 original-prose windows | 0.03399–0.04919 | **+11.16 to +18.58** |

The insertion rule affects **215–284 printed words per 2,896** in these source windows (216–287 additional runes, depending on source/window); it leaves substantial natural word-order dependence intact. All **15/15** independent original-prose windows retain strong within-chapter grammatical length dependence despite the proposed extra-symbol mechanism. The original ciphertext remains indistinguishable from the frozen shuffle null under this statistic. The result falsifies **doubled-plaintext-rune insertion as the sole explanation** for the missing ordinary-English ordered-word-length grammar; the rule cannot independently transform conventional sequential English into the printed original word-length sequence.

This is **not** a mathematical prohibition on escape insertion as a subordinate layer. A source-selected word reordering, boundary rewriting, or non-English/plaintext register could break the invariant, and the speculative 2016 heading is not independently authenticated. Do not spend a new key search on this escape solely because it repairs the p54 word length. The [source-exact CommonJS SFT](../sims/lp2_doubled_plaintext_escape_wordgrammar_sft.cjs) reads the original runes, words and punctuation, asserts the p54 opening, implements the length rule directly, and produces all 15 source controls; the unmodified original and tests passed in [manual GitHub Actions run 43603328333](https://github.com/FlareZ123/liber-primus/actions/runs/43603328333). This is a constrained failure of one *length transport*, with **no recovered plaintext or authentic key**.

### Distinct histogram-fitted 42.5% mid-word null model (16 November 2026)

The previously examined doubled-plaintext-rune escape affects approximately 8% of words. The independently published **42.5% insertion mixture**, reconstructed in [the dedicated original-input analysis](lp2-midword-null-original-length-grammar-gate.md), is a **different** and much denser length transport. It fits LP2's *marginal* length histogram (G=16.5409, versus unpadded GP English G=242.3826), but says nothing about which words and interior sites bear the inserted runes. It supplies no lossless inverse, null-value rule, original key, or authentic unknown plaintext. A letter-by-letter English spelling has an independently improved histogram (G=60.4323), so length alone does not authenticate nulls.

To test whether this dense model actually destroys the **original's missing word-length adjacency**, we froze the source-fitted r=0.425, put one additional rune-length slot into each multi-rune GP-native control word independently at that probability, and tested 15 disjoint original-prose source windows against 160 within-chapter word-length shuffles each. The controls retained adjacency z **+3.422 to +21.702**, all upper-tail p at most **0.012422**; original LP2's z is **+0.436**, p **0.3241** under 360 same-inventory chapter shuffles. The alternative midword placement within a flagged word cannot change this length-only result. Thus **random 42.5%-per-word padding alone does not plausibly erase ordinary prose's length grammar** in these controls. Key-dependent placement or insertion flags, reordered words, changed plaintext register or segmentation remain outside the finite gate. [Exact CommonJS SFT](../sims/lp2_midword_null_length_grammar_sft.cjs) and [full scoped decision](lp2-midword-null-original-length-grammar-gate.md).

## Original-source whole-word lane interleaving: 8/32 and the complete width1–128 family

**Decision, 14 November 2026:** The printed 32×8 number grid supplies a possible clue for contiguous prose interleaved across eight or 32 lanes, with a fixed lane order per source-visible chapter. The original unknown printed word order lacks the lag-w grammar signature of such an interleave at either grid width. A separately calibrated scan of **all 128 integer widths** also finds no familywise signal, despite one postselected width70 individual p-value below 0.01. Thus no further search over fixed chapterwise lane widths is currently justified without an independent source instruction; this is a word-order necessary condition, **not a proof against all transpositions**, and recovers no unknown-page plaintext.

**Observable invariant:** If conventional GP-native prose is divided into w contiguous source-text lanes and displayed in row-wise round-robin order, then printed word indices i and i+w correspond to adjacent source words in the same lane. A **secret fixed permutation of the w lane labels inside each chapter does not change that property**. Their *rune lengths* retain natural-language dependence even after an arbitrary per-symbol cipher, provided original word boundaries and one-to-one rune word lengths survive. Changing the lane order on different rows, splitting words, transporting page boundaries or switching to a different plaintext register can break this invariant. The test uses exactly the 2,896 whole printed words and nine original visual chapter sizes [158,255,383,437,224,326,378,669,66], preserving all 32 cross-page word continuations. Clip each word length to the nine classes 1–8 and 9+, calculate within-chapter lag-w word-length mutual information (MI, nats), and compare with chapterwise word-length shuffles.

**Grid-selected earlier results:** A separate 700-shuffle study found source lag8 MI **0.013171**, z≈+0.8, p≈0.20 and lag32 MI **0.014882**, z≈+1.2, p≈0.12. Restricting to p40–53's 669 printed words also supplied no 8/32 evidence. A genuine Gibran GP prose plant interleaved in eight and 32 lanes produced lag-MI **0.052555** (z≈+19) and **0.050918** (z≈+17), respectively, proving that source prose lane syntax would have been detectable under that source model.

**Familywide new decision:** To avoid replacing the failed 8/32 widths with numerically attractive unhinted alternatives, evaluate **each width 1, 2, …, 128** on the unchanged original source. One fixed seed, 0x33110055, generates **400** independent Fisher–Yates length shuffles *within each source chapter*; each shuffle supplies a complete 128-lag vector. Standardize every width against its own null mean and standard deviation, then record the *maximum z over all 128* for every null to correct the entire search. No original word, chapter, rune, printed dot or source spelling is changed.

| Original candidate width | Lag-MI (nats) | Null z | Uncorrected plus-one p |
| --- | ---: | ---: | ---: |
| **8** (source grid columns) | **0.01317093** | **+0.8002** | **0.21696** |
| **32** (source grid rows) | **0.01488203** | **+1.0009** | **0.17456** |
| **70** (postselected maximum) | **0.02255433** | **+3.1940** | **0.00748** |
| 37 (second-largest z) | 0.01837119 | +2.5797 | 0.00499 |

**The corrected familywise p is 115/401 = 0.28678**: 114 of the 400 full-width null scans attained a maximum standardized MI at least as large as the original width70 winner. The isolated p=0.00748 at width70 therefore provides **no justified 70-lane key**, nor does the differently ranked width37. The previously grid-selected width8/32 absence is strengthened by this fully search-corrected comparison.

**Independent native-GP positive:** Take 2,896 sequential valid words from the source-frozen Gibran text with historical GP contractions ING→NG, IO→IA and standard GP digraph conventions. Partition by those exact nine original chapter word counts and genuinely interleave each source chapter across **70 contiguous English prose lanes**. Its lag70 MI is **0.05569337**, versus its own 400 within-chapter shuffled controls mean **0.01505297**, z **+16.02**, and 0/400 controls as large. This is a strong, independent positive precisely at the original's apparently favorable but unhinted width.

**Scope and next decision:** Retire fixed-width contiguous-lane round-robin complete-word reordering for source-native sequential GP prose under widths 1–128, including any unknown fixed column order per source chapter. Neither the printed table nor the original punctuation selects a different width after this familywide gate. Column-major block arrangements, time-changing within-row order, cross-chapter reads, changing plaintext word boundaries and non-native/plain-language registers remain open. The original manuscript supplies no authentic recovered key, rune plaintext, or continuation from these length statistics.

[Standalone source-exact Node 22 CommonJS test](../sims/lp2_wordlength_allstride_128_sft.cjs), with source assertions, 400 jointly calibrated 128-lag shuffles and a 70-lane native positive.


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

### Orthogonal 181-stride inverse of the complete 16×181 word rectangle

**Agent 4, 14 November 2026.** The independent p15 square selects a plausible *dimension* of 16, and the complete manuscript has exactly 2,896 = **16×181** printed words. The newly tested 4/16-lane gate above addresses the ordinary rowwise 16-lane interleave. A second, distinct reading of this fixed rectangle is to fill **sixteen 181-word rows** with source prose and print it column by column. Under that serialization, source-adjacent word lengths occur at printed lag **181**, invariant even if the sixteen row labels are secretly permuted in one fixed order. That inverse had not been covered by the earlier lag4/8/16/32 gates. The original manuscript does not direct that rectangle layout, so it remains a bounded exploratory source geometry.

The exactly reconstructed original 2,896-word stream, including all 32 page-carried words, has full-book **lag181 length mutual information 0.008595**, compared with **0.011910** under 1,200 same-inventory deterministic length shuffles (**z = −1.558**, upper-tail **0.9467**). The literal inverse permutation gives **0.008365** MI at restored lag-one, versus independently planted, perfectly reversed GP-normalized Gibran text **0.053124**. The source-native plant has printed lag181 **0.054303**, source-shuffle **z = +19.51**, and reproduces all 2,896 original plaintext word lengths exactly. Its one-sided 1,200-shuffle positive p is **0.000833**.

As a secondary geometry control, physical pages **p23–26** independently delimit **224 = 16×14** whole words; they belong to the later chapter, not the p15 square's own p15–22 chapter. Two complete 14×16 word transpositions have original *three-bin* lag14/lag16 MI **0.017363 / 0.005074**, with original z **+1.133 / −0.668**, upper tails **0.1224 / 0.7102**. Both planted inverses recover native prose and give z **+14.94 / +16.03**. This count by itself lacks a direct historical handoff.

**Decision:** the fixed transposed 181-stride full-book inverse and either exact 14×16 later-chapter permutation fail to restore ordinary native-word-order structure. This excludes these source-shaped complete-word serializations within the tested prose register; it neither selects an alternative clock nor yields unknown plaintext. A variable lane order, changed word boundaries or nonstandard plaintext register could behave differently. Do not fit extra matrix widths after the fact.

[Full original 181/14/16 inverse, exact round-trip and source-positive SFT](../sims/lp2_wordlength_16x181_original_inverse_sft.cjs). The overlapping full-book lag16 measurement in that SFT independently agrees with the new 4/16-lane subsection above: observed **0.008824**, source-null mean **0.011345**, native plant **0.053199**.

## One checksum-bearing extra rune per printed word: exact all-position obstruction (Agent14, 14 November 2026)

The 2016 signed wording about word numbers, the established GP29 index/prime tables, and the externally proposed **extra ciphertext rune in roughly 42% of multi-rune words** offer a concrete, falsifiable architecture: a displayed rune might redundantly encode the modular sum of the other runes in its printed word. This could make one rune removable and expose a shorter encrypted text without knowing a secret key. This is an *investigator-proposed* check-symbol rule; none of the sources states that a checksum is inserted.

Unlike a fitted last-rune screen, the exact test allows the check symbol to occupy **any rune position** in the word. For the ordinary GP index checksum `r_k = sum_{j≠k} r_j mod29`, a candidate word necessarily satisfies `2r_k = sum_j r_j mod29`. For the equally source-natural GP-prime checksum, apply the same equation to the **GP prime weights** of each rune. These tests are independent of the check rune's original location, other words, and the choice of a secret cipher key; they are necessary arithmetic conditions on the printed source.

| Original source, unchanged | GP index sum checkpoint | GP prime-weight sum checkpoint |
| --- | ---: | ---: |
| Printed multi-rune words in physical LP2 pp0–55 | **2,813** | **2,813** |
| Words admitting at least one possible same-word checksum rune | **382** | **382** |
| Maximum possible fraction of words that can contain this type of exact check symbol | **13.58%** | **13.58%** |
| Words **incapable** of containing such a symbol, regardless of placement | **2,431** | **2,431** |

Counting all 83 single-rune words gives 383/2,896 (index) and 386/2,896 (prime). Thus a literal, unaltered **42%** same-word checksum-insertion model is *mathematically impossible* for both source-defined checksum values: about 1,181 multi-rune words would need the property, but the unmodified ciphertext supports at most **382**. The code also plants the exact index check in the final position of the first **1,181** source-length-matched multi-rune words and verifies that the identical all-position detector recognizes at least that many. This is a functional positive, without any fitted ciphertext model, English lexicon or null hypothesis.

[Self-contained Node.js 22 source-original reproducer](../sims/lp2_wordlocal_single_checksum_capacity_sft.cjs) asserts the 2,896/12,956 source transcription against all 56 original physical page tapes and exhaustively tests every potential checksum location. **Decision:** exclude the precise *single visible word-local sum checksum* as the explanation for the hypothesized one-rune word-length excess. A check symbol calculated before an additional encryption, a nonadditive keyed checksum, altered plaintext boundaries, or cross-word checksum channel remains outside this exact exclusion. This result supplies no plaintext/key and does not authenticate the extra-rune premise itself.

## Cryptanalytic consequence and limitations

The new exact word-checksum capacity limit excludes a direct word-local GP29 index or GP-prime check rune in approximately 42% of words, without restricting other hidden insertion mechanisms. The source-visible **printed spaces and dots cannot currently be assumed to preserve natural prose word order**. Their marginal resemblance to raw Latin English word lengths ([prior original unigram test](../sims/lp2_original_rawlatin_vs_gp_wordlength_register_sft.cjs)) does not establish natural-language word boundary preservation; the higher-order structural evidence is absent.

Highest-value next operation is an **independently selected reversible permutation of complete printed words** beyond the source-grid 8/32 fixed-lane family tested above, or a **variable-length transport/register model** whose encoding deterministically accounts for *all* 2,896 boundaries, 175 stops and 12,956 rune symbols. Such a decoder must be chosen by visible original art, historical Cicada operations, or signed directions **before** scoring its output, and must predict held-out chapters. A postselected word shuffle, dictionary fit or language-based boundary repair is not a solution. For an original plaintext language or constrained literature unlike the five registered source corpora, supply an independent control first.

The test does not disprove deliberately length-balanced prose, other languages/genres, spellings or contractions, a cipher that changes displayed word lengths, or natural plaintext reordered before printing. It supplies no recovered key and no original-message inverse. It is a source-only, finite statistical architecture constraint that narrows rational next attacks.