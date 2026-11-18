# Fixed original ciphertext, shuffled printed-word boundaries: fifth-back concentration

**18 November 2026 · Agent 13 · independent source-geometry experiment.** The 56 unknown LP2 pages remain undeciphered. **No unknown plaintext, key, author-selected cipher, or destination is recovered.** This experiment establishes an additional conditional constraint on how the manuscript's fifth-back symbol returns relate to its actual word divisions. It is separate from Agent 11's exact per-page-bigram Euler-trail randomization: that earlier test fixes the original word locations while shuffling rune order; this test fixes every original rune and its position while changing only the complete-word segmentation.

## Distinguishing question and candidate solve path

The original unknown LP2 rune stream has **104 within-word fifth-back equalities** among **2,105** eligible within-word comparisons, including **9 consecutive paired returns** and **11 returns of GP S**. An exact-source page-bigram-preserving null already reports within-word expectations 72.54/1.60/2.37 for these three statistics, but preserves original word boundaries by construction. Thus it cannot distinguish a five-tap ciphertext emitter from the author's original placement of word breaks around pre-existing fifth-back repeats.

A human puzzler can see the printed delimiters, including normal word punctuation and line wraps, and the 2016 signed Cicada message explicitly calls attention to the book's *words*. A reversible word-sensitive sender is conceivable; its independently sourced alphabet, state, key and inverse remain missing. Before building any such cipher, ask whether the **actual delimiter alignment carries information beyond the rune sequence and the original word-length histogram**.

## Frozen source and conditioning

Inputs: exact [original transcription](../resources/lp2-transcription.txt) (first 55 rune-bearing unsolved segments, physical p50 absent) and independent [numeric corpus](../resources/liber-primus/lp2-corpus.json); the SFT asserts all **12,956 rune identities in order**, **2,896 complete original words**, **55 original rune-bearing page segments**, and **32 cross-page words**. A word continues through original whitespace, line slash and physical-page boundaries; literal hyphen, period and other non-rune punctuation delimit words. No transcription position, character spelling, rune value, or page is repaired or reinterpreted.

For each of the 55 original rune-bearing page segments, keep the complete original contiguous ciphertext sequence **unchanged**, including every n-gram, ordered bigram, doublet and local fifth-back equality. Preserve all **32 page-crossing words** in their exact positions with their original contents and lengths; these contribute **[4 fifth-back, 1 paired, 0 S]** in every draw. Keep the original count and multiset of lengths of fully page-contained words, shuffling only the order of those lengths. Page-local complete words form contiguous blocks between carried-word fragments. This moves the word delimiters while retaining every such block's starting and ending rune and total span.

Count fifth-back equality within each word (position j at least 5), paired equality at j−1 and j−6 (for j at least 6), and repeated rune S. Use **10,000 seeded Fisher–Yates shuffles**, xorshift32 state **0x33011807**. The uniform 32-bit remainder has negligible finite-modulus discrepancy from mathematical uniformity; these exploratory conditional tails are uncalibrated for the wider historical hypothesis search. **The positions and classes of individual punctuation marks are not preserved.** No plaintext prior or cipher model is fitted.

## Exact original result

| Enclosed fifth-back statistic | Original | Conditional mean ± SD | Null draws ≥ original / 10,000 | Add-one upper tail |
|---|---:|---:|---:|---:|
| Total lag-five returns | **104** | **80.3507 ± 7.68296** | **16** | **0.00169983** |
| Paired adjacent lag-five returns | **9** | **4.0198 ± 1.64390** | **78** | **0.00789921** |
| GP S→S lag-five returns | **11** | **3.6991 ± 1.70937** | **2** | **0.00029997** |

The total lag5 surplus is **+23.6493** above the fixed-cipher length-shuffle null. It cannot arise from changes in ciphertext bigram inventory or rune-order pattern, because those are identical in every null trial. The actual printed word cuts are aligned with existing five-position echoes more often than random permutations of the same page's word lengths.

The surplus appears in both major halves of the manuscript. Using 0-based rune-bearing page indices, p0–26 have **56** original enclosed fifth-back events versus **43.120** simulated mean (upper tail ≈0.0137); p27–55 (p50 omitted) have **48** versus **37.231** (≈0.0340), measured on the **same 10,000 permutations**. Under literal physical-page parity, odd pages show **57** versus **41.489** (tail ≈0.0032); even pages show **47** versus **38.861** (tail ≈0.0844). These descriptive split checks are neither new independent discoveries nor blind validation.

## Hard-punctuation-anchor sensitivity: actual sentence/paragraph cuts retained

An additional original-input challenge addresses the page-local shuffle's most obvious missing condition: the **literal positions of period and paragraph/section punctuation**. It treats the original period, ampersand, dollar, section, and any other nonhyphen explicit word-ending marks as **hard segmentation anchors**. Only hyphen-delimited whole-word lengths are shuffled within each contiguous original block between those anchors, physical page boundaries, and the 32 frozen page-crossing words. Every original rune, page, hard-marked word ending, and each **block's exact length multiset** remain unchanged. The 2,896 source words contain **176 hard-boundary-ending words**; the stronger conditioning produces **219 blocks**, **213** with more than one possible complete word. It changes no source symbol or hard punctuation offset and makes no grammatical reinterpretation.

| Word-enclosed fifth-back statistic | Original | Hard-anchor-fixed null mean ± SD | Draws ≥ source / 10,000 | Add-one upper tail |
|---|---:|---:|---:|---:|
| Total returns | **104** | **80.1372 ± 7.6545** | **18** | **0.00189981** |
| Adjacent paired returns | **9** | **4.1835 ± 1.6292** | **81** | **0.00819918** |
| S returns | **11** | **5.4555 ± 1.7535** | **34** | **0.00349965** |

The original word-break alignment survives **even when every nonhyphen punctuation/sentence/section anchor is held fixed**. The S return contrast becomes smaller (from original +7.30 above random to +5.54), an important restriction on any interpretation of S as an independently coded marker. Both controls are still exploratory because lag5/S were historically selected and the marks treated as hard were chosen by visible punctuation classes. Further post hoc conditioning is unlikely to yield a decoder without an original clue.

The [hard-punctuation fixed-cipher SFT](../sims/lp2_fixedcipher_sentenceword_lagfive_sft.cjs) uses the exact original runes, all 176 preserved hard cuts and 10,000 deterministic shuffles, asserting the original and sampled counts; [Windows Node22 source CI #44211935660](https://github.com/FlareZ123/liber-primus/actions/runs/44211935660) passed with the exact expected means [80.1372, 4.1835, 5.4555].


## First-party unencrypted comparison

Use **six unencrypted first-release GP passages** from [the original canonical LP1 transcript](../resources/transcriptions/lp1_wulfic_canonical.txt), original section indices 3,8,9,10,11,14, preserving all physical ampersand page wraps, and the complete original unencrypted LP2 p57 (95 runes). They require no newly constructed English-to-GP transcription.

| Authentic clear register | Source runes / words | Enclosed lag5 original | Fixed-rune shuffled mean | Null upper tail |
|---|---:|---:|---:|---:|
| LP1 six clear sections | **1,001 / 231** | **7** | **9.2121** | **0.8422** |
| LP1 nine historically encrypted sections | **1,796 / 467** | **13** | **12.0892** | **0.4376** |
| LP2 clear p57 | **95 / 20** | **2** | approximately **0.80** | approximately **0.17** |

Neither the original clear LP1 passages nor the nine genuine earlier Cicada-encrypted LP1 passages exhibit the unknown LP2 book's directional word-break surplus under the same fixed-rune/page/word-length shuffle construction. The historically encrypted LP1 controls use the original sections 0,1,2,4,5,6,7,12,13, retaining all 15 original page fragments and original punctuation; only unknown LP2 has the strong effect. This gives a useful **first-party cipher-side negative comparator**, beyond ordinary English prose. Clear p57 is too short to adjudicate a fifth-back mechanism. The first-party clear corpus is much smaller than LP2 and has a different length/genre distribution; the full-length source-native controls below address this limitation separately.


## Independently encoded, source-native English control books

The 1,001-rune clear LP1 baseline is small. A separate model regenerates **600 full 12,956-rune source-native GP English books** using the exact original *individual* 2,896 word lengths, printed word offsets and 32 across-page carries. It uses the repository's [solved-LP1/p57-calibrated native GP spelling](../sims/lp2_native_gp_source_orthography_sft.cjs), selecting each plaintext word with replacement from an independent Gibran, Shakespeare or Emerson corpus **of the same number of GP runes**. Each original-language book is held fixed while **80** shuffled-length layouts are tested on its unmodified rune tape. The original observed surplus **104−80.3507 = +23.6493** was frozen before this separate native source experiment. Seed: **0x13303301**. There are **200 independently sampled books per author**, with a total of 48,000 boundary-only shuffles.

| Source-native English book generator | Original-word enclosed fifth-back mean | Shuffled-layout mean | Surplus mean ± SD | Books with surplus ≥ original LP2 |
|---|---:|---:|---:|---:|
| Gibran | **121.920** | **125.431** | **−3.511 ± 9.136** | **1/200** |
| Shakespeare | **122.895** | **124.169** | **−1.274 ± 10.358** | **1/200** |
| Emerson | **130.015** | **127.977** | **+2.038 ± 9.228** | **2/200** |
| **Actual unknown LP2** | **104** | **80.351** | **+23.649** | Comparison target |

Matched-length ordinary GP-English is **not automatically enriched** at its true word boundaries under this same fixed-rune/shuffled-layout diagnostic. Its three text-model means are substantially below the unknown original's +23.65 surplus; only **4 of 600** generated language-register books match/exceed the original, separately **1/200, 1/200 and 2/200**. The three authors are non-independent as English-language models, and the finite controls are draws with replacement from literary vocabularies rather than direct authenticated Cicada plaintext. Interpret these as **conditional empirical source-register contrasts**, not a discovery-wide probability of puzzle design. The larger clear-language controls strengthen the specific word-boundary anomaly without locating any decoding instruction.

[Native control SFT](../sims/lp2_fixedcipher_wordbreak_native_sft.cjs) uses the existing source-calibrated GP29 encoder and exact checked-in control texts; no external language library or guessed unknown plaintext is used.

## Interpretation and discriminating next move

Two complementary conditional experiments now matter: fixed-word-boundary **rune shuffles** (Agent11, exact per-page ordered-bigram Euler trails) and fixed-**rune** word-length shuffles (this report). Both find an enclosed fifth-back excess under distinct nulls. The strongest defensible inference is **an alignment of five-rune returns with original word cuts**, after conditioning separately on first-order rune inventories and actual ciphertext rune order. The two nominal tail probabilities are not independent, and lag5/S were selected historically after examining the source. This is **not proof of a hidden word codec**.

A source-visible instruction might identify a word-local reset/copy/state operation and a key; only then would a reversible decoder with at least 150 coherent original plaintext runes and an untrained chapter become persuasive. The current boundary correlation cannot select among native word morphology, copy editing, word-local cipher clocks or deliberate formatting.

**Research fork:** communicate this new source condition to the owner of [Director task #1429](https://github.com/FlareZ123/liber-primus/issues/1429). Do not run another lag sweep or retune punctuation classes until an independently authored operation or an original plaintext prediction justifies it.

**Reproducers and executed CI:** [fixed-cipher wordbreak fifth-back SFT](../sims/lp2_fixed_cipher_wordbreak_lagfive_sft.cjs) passed [Windows Node22 run 44212469551](https://github.com/FlareZ123/liber-primus/actions/runs/44212469551), including genuine encrypted LP1 comparison; original initial run [44211328829](https://github.com/FlareZ123/liber-primus/actions/runs/44211328829); [matched native-English control](../sims/lp2_fixedcipher_wordbreak_native_sft.cjs) passed [Windows Node22 run 44211336030](https://github.com/FlareZ123/liber-primus/actions/runs/44211336030). Both use the existing manually dispatched source SFT runner; source counts and all fixed-seed outputs were checked on 18 November 2026.
