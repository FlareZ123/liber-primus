# Authenticated 2013 BASE29 and LP2 word-to-address grammar

**Decision, Agent 23, 11 November 2026:** the historical command authenticates a base-29 *numeral conversion*, while LP2's printed word delimiters do not come with an authenticated instruction to treat each word as a separate integer or map address. A complete original-word positional conversion is reproducible, but **it does not select a reversible LP2 operation, plaintext, key, or destination**. Retire the per-word BASE29→p32 map-address interpretation unless an independent manuscript/historical instruction supplies the missing coordinate grammar. The later #3054 all-shared-alphabet result below also rejects ordinary fixed dictionary indices, even granting arbitrary leading-zero padding.

## Source-selected premise and its missing step

The separately recovered [2013 TCP-server signed challenge](../resources/external/2013-tcp-server-signed-source.md) verifies under the stored Cicada OpenPGP key and demonstrates `BASE29 3301 → 3QO`. A contemporary [participant log](../resources/external/2013-tcp-live-test-vectors.json) reports `BASE29 1033 → 16I`. Both agree with canonical ASCII base29 digits `0123456789ABCDEFGHIJKLMNOPQRS` (zero through twenty-eight). These are conversions of **supplied decimal integers**. No authenticated command supplies LP2 word separators, a Gematria Primus digit mapping, a positional word-number readout, or an address rule.

The [signed 2016 instruction](../resources/cicada2016-4gq25.md) says, “Liber Primus is the way. Its words are the map. Their meaning is the road, and their numbers are the direction.” This motivates investigating words and numbers, but supplies no mathematical map between the two, no indexing origin, and no rule for handling arbitrary large integers. LP2's physical p32 has 121 runes and an original tree image. Its eleven-by-eleven reshape is **a derived candidate** rather than a printed coordinate grid. Requiring a selected address convention is especially important because the original printed words cross lines and physical pages.

## One fully specified numerical interpretation

As a deliberately narrow *candidate* extension, assign each of the 29 GP rune types its standard zero-based index `F=0, U=1, TH=2, …, EA=28`. Preserve the complete printed original word boundaries with the repository [canonical word parser](../sims/lp2_word_pages.cjs). Interpret an n-rune word with indices `d[0],…,d[n−1]` as

`N = d[0]·29^(n−1) + … + d[n−1]`.

Use arbitrary-precision integers so no long word is rounded. Retain the original n-digit string to distinguish a leading-zero word from the same numerical value with a shorter spelling. That GP-to-digit assignment is natural, but **is not stipulated by the signed BASE29 command**.

The [runnable exact original-input test](../sims/lp2_base29_word_address_gate.cjs) reassembles the original 55 rune-bearing unsolved pages from all parsed words, asserts exact equality with every original ciphertext index, checks the 2013's two known base29 response examples, and reports:

| Source-corpus fact under the frozen interpretation | Exact count |
| --- | ---: |
| Unsolved original GP29 runes | **12,956** |
| Canonical complete printed words | **2,896** |
| Words joining two physical pages | **32** |
| Distinct arbitrary-precision numeric values | **2,699** |
| Words beginning with zero-valued GP **F** | **117** |
| Whole-book words directly indexing **0..120**, with no operation applied | **148** |
| Such words that have a canonical nonzero first digit | **127** |
| Complete whole words beginning on physical p32 | **21** |
| p32 words directly indexing **0..120** | **1** |

The singular p32 direct candidate is its **sixth complete word**, `ᚠᚩᚦ` (GP **F O TH**). Its digit string is `032` and its positional value is `0·841+3·29+2 = 89`. The minimal 2013-style base29 numeral for decimal 89 would instead be **32**. The leading F therefore makes the actual printed word a **noncanonical positional numeral** unless the creator authorized redundant zero digits. The identical numerical value occurs elsewhere in the ciphertext as the different word `ᚩᚦ` (GP **O TH**) on p1.

The source-authentic [p15 Fibonacci/prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md) also uses Fibonacci input 89, but the overlap is noticed *after* seeing the p32 word values. Of 2,896 words, 31 have a positional value equal to one of the sixteen pre-existing p15 Fibonacci inputs; p32 contains one such word. The original p15 and p32 pages do not instruct readers to apply BASE29 to p32 words, to choose the Fibonacci-89 term, or to read p32 cell 89. This is a possible mnemonic coincidence, **not an independently selected decoding step**.

## Original-image p32 → p15 Fibonacci-89 pointer decision (Issue #289)

**Decision:** The arithmetic points to a unique *candidate* p15 cell but no original clue selects the complete operation. In the original physical p32 scan (archive `49.jpg`), GP **F O TH** is an ordinary, black three-rune word at **page-local rune offsets 30–32** (zero-based), on the second printed text line. It is the **sixth complete word beginning on p32**; the one-rune black fragment at local offset 0 is the end of a word begun on p31 and cannot be counted as a fresh word. The word is followed by the **first of exactly two** printed full stops on p32. Neither its glyphs nor its period has a special ink color, marginal sign, numbered marker or separate printed instruction. The original red **13-dot mark** is at rune boundary **121**, after the final word (local rune offsets 117–120), not at F O TH. These counts were read from `resources/lp2-transcription.txt` and checked against the original p32 JPEG, respecting printed line wraps. In particular, “first word before a period” is a possible **retrospective** selection rule, but the original has two periods and no instruction to privilege the first.

The sole source-natural arithmetic chain is fully explicit: the three GP digits `F,O,TH = 0,3,2` give `0·29²+3·29+2 = 89`; the p15 clockwise red-3299-start spiral's **eleventh distinct Fibonacci input** is `89`; `prime(89+1)=prime(90)=463`; hence `|3301−463| = 2838`, the original p15 grid cell **row 2, column 4** (one-based). This reproduces a genuine printed number. It does **not** recover another plaintext rune, ciphertext key, or instruction at that cell; the p15 numerical construction was already independently known. The third-rune word `F O TH` is noncanonical as an integer numeral because leading digit F=0 adds no value: canonical positional representation for 89 is two digits `O TH`, which is itself an original word on p1.

The source-first selection gate fails at three distinct places. (1) The 2013 signed `BASE29` challenge operates on a supplied decimal integer and never calls for decoding each GP word as a base29 number or keeping redundant zero digits. (2) The 2016 signed phrase about words/maps/numbers does not specify “sixth word”, “first full stop”, “use adjacent prime-image dimensions' gap six”, or any other unique source-selected address grammar. The authenticated 2016 image's 563/569 prime dimensions and their difference 6 have been investigated as a p32 tree clue, but treating that **difference** as a word index is an additional unselected operation. (3) The p15 image selects the red 3299 *start and outward spiral*; it does not instruct applying a p32 word value as the sequence index or prescribe a cipher operation on the selected cell 2838.

**Next decision:** Retire `p32 F-O-TH → 89 → p15 position11/value2838` as an unselected cross-page coincidence, while preserving the exact source arithmetic and the original first-full-stop observation. A fresh historical/manuscript instruction that fixes **word selector + leading-zero rule + cross-page target and operation** would justify reopening. There is no basis for scanning other words, Fibonacci positions, numeric offsets or additive keys.

## Why the direct address proposal cannot continue as a cipher

Only **148/2,896** original words fall in the zero-based 121-cell address space, with **127** if leading-zero numerals are disallowed. The other words require additional operations (modulus/remainder, quotient, digit slicing, reduction, map traversal, arbitrary precision interpretation or another target), none selected by the 2013 signed command or 2016 source. Even the unique p32 value 89 is ambiguous between zero- and one-based cell indexing and between row/column scanning conventions. The initial p32 page-local **L** is the last rune of a word begun on p31: treating it as a new numeral would violate the verified [p32 source-boundary correction](p32-m7-2016-word-fragment-alignment.md).

An invented modulus 121 maps every integer onto a grid cell, but would be fitted to the desired target instead of derived from an instruction. An actual puzzle mechanism must specify **which source words**, the **numeral mapping**, **indexing origin**, **destination text/cells**, and **what to do with retrieved symbols** before a plaintext result is assessed. No such joint specification survives in the audited sources.

**Director decision:** close the BASE29 word-address task as *unsupported by an independent coordinate grammar*. Retain the exact original-word number conversion as a reusable diagnostic. Reopen only upon a newly authenticated address convention or manuscript instruction that fixes the source, index/radix direction, map, and stopping rule. A derived p32/Fibonacci-89 coincidence by itself does not warrant a lookup-variant search.

**Reproducer:** `node sims/lp2_base29_word_address_gate.cjs` from repository root. It reads canonical resources, performs no writes and requires only Node built-ins.

## Original 32 cross-page words and 32×8 numeric table: exact source-word window gate (12 November 2026)

Original physical LP2 pp0–55 contain **32 complete words that span a physical page break**, exactly matching the **32 printed rows** of the original pp49–51 grid. This is an attractive shape analogy, especially alongside the 2016 signed “words are the map, … numbers are the direction” clue, but a row-to-word rule is absent. The original corpus parser already joins words across page and line boundaries; physical p50 is a number-only table with no rune sequence and supplies no carry.

A single source-chronological row allocation gives the **complete original cross-page word lengths** in order:

\`[6,5,5,3,7,3,6,11,4,6,3,10,7,10,6,5,7,4,3,5,5,6,11,4,5,9,11,8,9,4,10,11]\`.

The exact histogram is 3:4, 4:4, 5:6, 6:5, 7:3, 8:1, 9:2, 10:3, 11:4. **22 of 32 words have fewer than eight original rune glyphs**; the shortest has three. Thus 22 table rows cannot be filled by an actual eight-rune window of their individually paired word. The complete words around p49→p51 do not span the runeless p50 table, and the final carry is p54→p55. A synthetic padded eight-rune word for each row passes the length constraint, confirming the test detects precisely the missing original source, but the original does not. Inventing wrap, padding, neighbor borrowing, word-index expansion or column permutations would add a source-unspecified selector.

**Decision:** retire the equal 32↔32 count as a structural coincidence without a 32×8 source-attested key or ciphertext inverse. The narrow literal eight-rune-per-carried-word mechanism is impossible on the original 22 short words. A separately authenticated operation transforming arbitrary 3–11-rune words into eight digits might reopen a different bounded hypothesis; a raw count match cannot justify the rescue. No original LP2 plaintext/key recovered. [Source-only SFT](../sims/lp2_crosspage_32row_eightrune_source_gate.cjs); [Director #629](https://github.com/FlareZ123/liber-primus/issues/629).

**Scope update (20 November 2026):** a separate conditional cicada-article route now maps the 221-year value to p50 table cells 221–223 (52/51/151), converts them through the signed 2013 BASE29 command (1N/1M/56), and uses the numeric digits as positions in the signed 2016 word register. This is not the rejected p32/Fibonacci-89 word-to-grid address proposal or the rejected 32-cross-page-word→eight-rune row transport. It may favor zero-based table addressing, but the 2016-message-word receiver remains unsupported in light of closed #304, which finds no authenticated grammar for using the signed message's own words as the map and notes that “Its words” refers to Liber Primus. The article→table address is also inferred. See [the cicada row27 word-map report](lp2-cicada-article-p50-row27-word-map.md); do not reopen the retired p32/32-word branches or start a broad address scan.

## Exact static finite-dictionary address obstruction (#3054, 26 November 2026)

**Decision:** a complete printed group cannot consistently be the ordinary positional BASE29 index into a source-sized fixed dictionary, even if the GP29 digit alphabet is an arbitrary unknown shared bijection. This is a different representation from the earlier fixed GP0 p32 address, #2583's growing pointer-plus-literal grammar, #2629's prime-product values and #2935's unrestricted word-codebook multiplicities. No plaintext or key recovered. There is no authenticated dictionary ordering or index-prefix syntax in the audited Cicada material; the magnitude result is independent of ordering.

### Canonical representation and padding

The signed 2013 challenge's example is 3301 → 3QO. The January participant witness 30 → 11, together with its returned CODE handler, selects minimal positive numerals in that implementation (not 011); the March witness 1033 → 16I agrees. That participant handler returns 0 for zero. These participant implementation details are not an additional signed organizer rule. See [historical source](../resources/external/2013-tcp-server-signed-source.md).

The image-corrected source parser reproduces all 12,956 original unknown runes in 2,896 complete groups, joining line/page carries and checking the full tape against the canonical physical-page arrays. Every one of the 29 glyphs starts a multi-rune group, with counts 78–116. Whichever glyph is zero, at least 78 complete groups are noncanonical. Removing both opening red heading groups leaves the same lower bound. Thus minimal integer notation is impossible for any shared bijection, regardless of dictionary size. A single fixed numeral width also cannot reproduce the variable original lengths. To grant the model its strongest chance, allow arbitrary leading-zero padding per record in the following test.

### Exact shared-alphabet minimax (all 29! mappings)

Write V_d(w) for the ordinary most-significant-first integer in radix 29 under shared digit bijection d. Exactly three groups have the maximum length 14; their zero-based complete-group indices are 754, 1353 and 2341, with distinct leading GP indices 17, 28 and 16.

Let B=29^13. Every shorter group is strictly below B. At least one of the three longest first digits is at least 2, so max_w V_d(w) ≥ 2B. Any assignment giving the three distinct leading glyphs digits {0,1,2} has max_w V_d(w)<3B, hence any global optimum must assign precisely these three digits to those glyphs. For each of the six possible assignments, the unique longest word starting with digit 2 is the maximum; its remaining free digits are minimized greedily by assigning the least unused digit at each first occurrence of a new glyph (fixed-length radix order is lexicographic). Other mappings cannot improve that maximum. Complete the unused alphabet arbitrarily and evaluate the entire tape.

The exact minimum over all shared bijections of the maximum index is **21,633,695,484,715,464,044**. An explicit attaining bijection and all six conditional optima are in the raw output. Therefore a zero-based ordinary contiguous dictionary requires at least **21,633,695,484,715,464,045 entries**; one-based indexing still requires at least 21,633,695,484,715,464,044. This bound even permits leading zeros and duplicate numerical aliases. It remains unchanged when the two opening heading groups are excluded, because all three maximizing-length witnesses lie outside them.

Even independently optimizing a separate digit bijection for every word gives a maximum lower bound of 379,538,560,875,585,181 (group 1353). This relaxation assigns 0,1,... in order of first distinct glyph appearance; it cannot be beaten by a shared mapping.

### Source-sized tests and controls

The three independently pinned historical carrier witnesses are the existing 2013 Liber AL chapter texts, 2012 Blake Marriage text witness and 2014 Self-Reliance witness. No organizer-selected dictionary sorting is asserted. Since every ordering of a finite list has the same index range, no ordering search is needed. Distinct case-folded ASCII word forms (apostrophes retained) are diagnostic dictionary sizes; UTF-8 byte lengths are generous upper bounds on any ordinary list of distinct nonempty word occurrences from the actual files.

| Carrier witness | Distinct word forms | UTF-8 bytes | Groups impossible even at byte-count capacity (zero or one based) |
|---|---:|---:|---:|
| Liber AL I–III | 1,310 | 31,061 | 812 |
| Blake | 1,913 | 46,722 | 812 |
| Self-Reliance | 2,529 | 55,562 | 812 |

All three distinct-word capacities reject 1,131 of 2,896 groups under the per-record independent-digit relaxation alone. Controls encode every distinct source form by its first-occurrence dictionary ordinal using the attaining mixed digit alphabet, recovering 1,310 + 1,913 + 2,529 = 5,752 distinct indices exactly, with canonical zero/leading-digit handling. These are constructive representation controls; they do not authenticate the word dictionary as a historical sender. The original gate requires no language model and no dictionary contents after the magnitude obstruction.

[Reproducer](../sims/lp2_fixed_dictionary_base29_minimax_sft.cjs) · [raw results and source blob pins](lp2-fixed-dictionary-base29-minimax-output.json) · [Director #3054](https://github.com/FlareZ123/liber-primus/issues/3054). The checked-in analysis function ran on the exact repository inputs in connected V8 with minimal assertion and UTF-8 byte-count shims; the standalone Node file-read wrapper was not separately executed.

**Fork:** retire this ordinary fixed contiguous dictionary-index framing, including arbitrary mixed alphabet, redundant leading zeros and either conventional index origin. A sparse index space with an independently defined compressing map, an explicit source-selected prefix grammar, or a separate cryptographic layer would be different mechanisms; none follows from these results or the prior authentic absolute-coordinate book codes. Do not fit a modulo, offset or additional index alphabet to bypass the obstruction.
