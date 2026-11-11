# Authenticated 2013 BASE29 and LP2 word-to-address grammar

**Decision, Agent 23, 11 November 2026:** the historical command authenticates a base-29 *numeral conversion*, while LP2's printed word delimiters do not come with an authenticated instruction to treat each word as a separate integer or map address. A complete original-word positional conversion is reproducible, but **it does not select a reversible LP2 operation, plaintext, key, or destination**. Retire the per-word BASE29→p32 map-address interpretation unless an independent manuscript/historical instruction supplies the missing coordinate grammar.

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

**Decision:** The arithmetic points to a unique *candidate* p15 cell but no original clue selects the complete operation. In the original physical p32 scan (archive `49.jpg`), GP **F O TH** is an ordinary, black three-rune word at **page-local rune offsets 30–32** (zero-based), on the second printed text line. It is the **sixth complete word beginning on p32**; the one-rune black fragment at local offset 0 is the end of a word begun on p31 and cannot be counted as a fresh word. The word is followed by the **first of exactly two** printed full stops on p32. Neither its glyphs nor its period has a special ink color, marginal sign, numbered marker or separate printed instruction. The page's red 10-dot stencil appears after the final word at local offsets 117–120, not at F O TH. These counts were read from `resources/lp2-transcription.txt` and checked against the original p32 JPEG, respecting printed line wraps. In particular, “first word before a period” is a possible **retrospective** selection rule, but the original has two periods and no instruction to privilege the first.

The sole source-natural arithmetic chain is fully explicit: the three GP digits `F,O,TH = 0,3,2` give `0·29²+3·29+2 = 89`; the p15 clockwise red-3299-start spiral's **eleventh distinct Fibonacci input** is `89`; `prime(89+1)=prime(90)=463`; hence `|3301−463| = 2838`, the original p15 grid cell **row 2, column 4** (one-based). This reproduces a genuine printed number. It does **not** recover another plaintext rune, ciphertext key, or instruction at that cell; the p15 numerical construction was already independently known. The third-rune word `F O TH` is noncanonical as an integer numeral because leading digit F=0 adds no value: canonical positional representation for 89 is two digits `O TH`, which is itself an original word on p1.

The source-first selection gate fails at three distinct places. (1) The 2013 signed `BASE29` challenge operates on a supplied decimal integer and never calls for decoding each GP word as a base29 number or keeping redundant zero digits. (2) The 2016 signed phrase about words/maps/numbers does not specify “sixth word”, “first full stop”, “use adjacent prime-image dimensions' gap six”, or any other unique source-selected address grammar. The authenticated 2016 image's 563/569 prime dimensions and their difference 6 have been investigated as a p32 tree clue, but treating that **difference** as a word index is an additional unselected operation. (3) The p15 image selects the red 3299 *start and outward spiral*; it does not instruct applying a p32 word value as the sequence index or prescribe a cipher operation on the selected cell 2838.

**Next decision:** Retire `p32 F-O-TH → 89 → p15 position11/value2838` as an unselected cross-page coincidence, while preserving the exact source arithmetic and the original first-full-stop observation. A fresh historical/manuscript instruction that fixes **word selector + leading-zero rule + cross-page target and operation** would justify reopening. There is no basis for scanning other words, Fibonacci positions, numeric offsets or additive keys.

## Why the direct address proposal cannot continue as a cipher

Only **148/2,896** original words fall in the zero-based 121-cell address space, with **127** if leading-zero numerals are disallowed. The other words require additional operations (modulus/remainder, quotient, digit slicing, reduction, map traversal, arbitrary precision interpretation or another target), none selected by the 2013 signed command or 2016 source. Even the unique p32 value 89 is ambiguous between zero- and one-based cell indexing and between row/column scanning conventions. The initial p32 page-local **L** is the last rune of a word begun on p31: treating it as a new numeral would violate the verified [p32 source-boundary correction](p32-m7-2016-word-fragment-alignment.md).

An invented modulus 121 maps every integer onto a grid cell, but would be fitted to the desired target instead of derived from an instruction. An actual puzzle mechanism must specify **which source words**, the **numeral mapping**, **indexing origin**, **destination text/cells**, and **what to do with retrieved symbols** before a plaintext result is assessed. No such joint specification survives in the audited sources.

**Director decision:** close the BASE29 word-address task as *unsupported by an independent coordinate grammar*. Retain the exact original-word number conversion as a reusable diagnostic. Reopen only upon a newly authenticated address convention or manuscript instruction that fixes the source, index/radix direction, map, and stopping rule. A derived p32/Fibonacci-89 coincidence by itself does not warrant a lookup-variant search.

**Reproducer:** `node sims/lp2_base29_word_address_gate.cjs` from repository root. It reads canonical resources, performs no writes and requires only Node built-ins.
